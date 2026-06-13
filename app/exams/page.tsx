"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { ClipboardList, Plus, Trash2, AlertTriangle, CalendarDays, UserCheck, Printer } from "lucide-react";

interface Exam {
  id: string;
  subject: string;
  className: string;
  date: string;     // yyyy-mm-dd
  start: string;    // "10:00"
  duration: number; // ώρες
  room: string;
  invigilator: string; // "Επώνυμο Όνομα"
}

const hhToNum = (t: string) => { const [h, m] = String(t || "0").split(":").map(Number); return (h || 0) + (m || 0) / 60; };
const overlap = (s1: number, e1: number, s2: number, e2: number) => s1 < e2 && s2 < e1;
// Προτεινόμενη επόμενη Κυριακή
const nextSunday = () => { const d = new Date(); d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7)); return d.toISOString().slice(0, 10); };

export default function ExamsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<string[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const [form, setForm] = useState<Exam>({ id: "", subject: "", className: "", date: "", start: "10:00", duration: 2, room: "", invigilator: "" });

  useEffect(() => {
    setIsMounted(true);
    setExams(JSON.parse(localStorage.getItem("eduflow_exams") || "[]"));
    setClasses(JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]"));
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
    setRooms(JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"));
    const rawLessons = JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]");
    setLessons((rawLessons as any[]).map((l) => (typeof l === "string" ? l : l?.name)).filter(Boolean));
    setForm((f) => ({ ...f, date: nextSunday() }));
  }, []);

  const persist = (next: Exam[]) => { setExams(next); localStorage.setItem("eduflow_exams", JSON.stringify(next)); };
  const teacherName = (t: any) => `${t.lastName || ""} ${t.firstName || ""}`.trim();

  // Σύγκρουση ενός διαγωνίσματος με τα υπόλοιπα
  const conflictsOf = (e: Exam, list: Exam[]) => {
    const s1 = hhToNum(e.start), e1 = s1 + (Number(e.duration) || 1);
    return list.filter((o) => o.id !== e.id && o.date === e.date && overlap(s1, e1, hhToNum(o.start), hhToNum(o.start) + (Number(o.duration) || 1))
      && (o.className === e.className || (e.room && o.room === e.room) || (e.invigilator && o.invigilator === e.invigilator)));
  };

  const addExam = () => {
    if (!form.subject || !form.className || !form.date) { alert("Συμπλήρωσε Μάθημα, Τμήμα και Ημερομηνία."); return; }
    const candidate: Exam = { ...form, id: `e-${Date.now()}` };
    const cf = conflictsOf(candidate, exams);
    if (cf.length > 0) {
      const reasons = cf.map((c) => `${c.subject} (${c.className})`).join(", ");
      if (!confirm(`⚠ Σύγκρουση με: ${reasons}. Ίδια ώρα + (τμήμα/αίθουσα/επιτηρητής). Προσθήκη ούτως ή άλλως;`)) return;
    }
    persist([...exams, candidate]);
    setForm({ ...form, subject: "", className: "", start: "10:00", duration: 2, room: "", invigilator: "" });
  };
  const removeExam = (id: string) => { if (confirm("Διαγραφή διαγωνίσματος;")) persist(exams.filter((e) => e.id !== id)); };

  // Ταξινόμηση & ομαδοποίηση ανά ημερομηνία
  const sorted = useMemo(() => [...exams].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)), [exams]);

  // Πρόγραμμα επιτηρητών (από το πεδίο καθηγητών)
  const invigilatorPlan = useMemo(() => {
    const map: Record<string, Exam[]> = {};
    exams.forEach((e) => { if (e.invigilator) (map[e.invigilator] = map[e.invigilator] || []).push(e); });
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)));
    return map;
  }, [exams]);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Προγραμματισμός Διαγωνισμάτων" description="Προγραμμάτισε διαγωνίσματα (συνήθως Κυριακές) χωρίς συγκρούσεις, με επιτηρητές από τους καθηγητές.">

      <style>{`@media print { @page { margin: 1.2cm; } .print-hide { display:none !important; } table { border-collapse: collapse; } td, th { border:1px solid #000 !important; } }`}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ΦΟΡΜΑ */}
        <div className="print-hide bg-[#1e2330] border border-slate-800 p-5 rounded-3xl h-fit shadow-xl space-y-3 lg:sticky lg:top-28">
          <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-800 pb-3 tracking-wider"><Plus size={14} /> Νέο Διαγώνισμα</h3>

          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            <option value="">Μάθημα *</option>{lessons.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            <option value="">Τμήμα *</option>{classes.map((c, i) => <option key={i} value={c.name || c.className}>{c.name || c.className}</option>)}
          </select>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Ημερομηνία * (προτείνεται Κυριακή)</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Ώρα</label>
              <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Διάρκεια (ώρες)</label>
              <input type="number" min={1} max={6} value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
            </div>
          </div>
          <select value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            <option value="">Αίθουσα (προαιρ.)</option>{rooms.map((r, i) => <option key={i} value={r.name || r.title}>{r.name || r.title}</option>)}
          </select>
          <select value={form.invigilator} onChange={(e) => setForm({ ...form, invigilator: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            <option value="">Επιτηρητής (από Καθηγητές)</option>{teachers.map((t, i) => <option key={i} value={teacherName(t)}>{teacherName(t)}</option>)}
          </select>

          <button onClick={addExam} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-lg">Προσθήκη Διαγωνίσματος</button>
        </div>

        {/* ΛΙΣΤΑ + ΕΠΙΤΗΡΗΤΕΣ */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center print-hide">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2"><CalendarDays size={14} /> Προγραμματισμένα ({exams.length})</h3>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold"><Printer size={14} /> Εκτύπωση</button>
          </div>

          {sorted.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">Δεν υπάρχουν προγραμματισμένα διαγωνίσματα.</div>
          ) : (
            <div className="space-y-2">
              {sorted.map((e) => {
                const cf = conflictsOf(e, exams);
                const end = `${String(Math.floor(hhToNum(e.start) + e.duration)).padStart(2, "0")}:00`;
                return (
                  <div key={e.id} className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${cf.length ? "bg-rose-950/20 border-rose-900/50" : "bg-[#1e2330] border-slate-800"}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold text-sm">{e.subject}</span>
                        <span className="text-[10px] font-bold bg-indigo-950/50 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/30">{e.className}</span>
                        {cf.length > 0 && <span className="text-[10px] font-bold bg-rose-950/40 text-rose-400 px-2 py-0.5 rounded border border-rose-900/40 flex items-center gap-1"><AlertTriangle size={10} /> Σύγκρουση</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        📅 {new Date(e.date).toLocaleDateString("el-GR", { weekday: "long", day: "2-digit", month: "2-digit" })} · {e.start}-{end}
                        {e.room ? ` · 🚪 ${e.room}` : ""}{e.invigilator ? ` · 👁 ${e.invigilator}` : ""}
                      </p>
                    </div>
                    <button onClick={() => removeExam(e.id)} className="print-hide text-slate-600 hover:text-rose-500 shrink-0"><Trash2 size={14} /></button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ΠΡΟΓΡΑΜΜΑ ΕΠΙΤΗΡΗΤΩΝ */}
          <div>
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 mb-3"><UserCheck size={14} /> Πρόγραμμα Επιτηρητών</h3>
            {Object.keys(invigilatorPlan).length === 0 ? (
              <p className="text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl text-center py-6">Δεν έχουν οριστεί επιτηρητές. Πρόσθεσε επιτηρητή σε κάθε διαγώνισμα.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(invigilatorPlan).map(([name, list]) => (
                  <div key={name} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4">
                    <p className="text-white font-bold text-xs mb-2 flex items-center gap-1.5"><UserCheck size={12} className="text-emerald-400" /> {name} <span className="text-slate-500 font-normal">· {list.length} επιτηρήσεις</span></p>
                    <div className="space-y-1">
                      {list.map((e) => (
                        <div key={e.id} className="text-[11px] text-slate-300 bg-[#0b0e14] rounded-lg px-2.5 py-1.5 border border-slate-800/60">
                          {new Date(e.date).toLocaleDateString("el-GR", { day: "2-digit", month: "2-digit" })} {e.start} · {e.subject} ({e.className})
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
