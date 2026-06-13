"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { ClipboardList, Plus, Trash2, AlertTriangle, CalendarDays, UserCheck, Printer, Mail } from "lucide-react";

interface Exam {
  id: string;
  subject: string;
  grade: string;      // Τάξη (αντί για τμήμα)
  date: string;       // yyyy-mm-dd
  start: string;      // "10:00"
  duration: number;   // ώρες
  room: string;
  invigilator: string;
}

const GRADES = ["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"];
const hhToNum = (t: string) => { const [h, m] = String(t || "0").split(":").map(Number); return (h || 0) + (m || 0) / 60; };
const overlap = (s1: number, e1: number, s2: number, e2: number) => s1 < e2 && s2 < e1;
const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dateLabel = (iso: string) => iso ? new Date(iso + "T00:00:00").toLocaleDateString("el-GR", { weekday: "long", day: "2-digit", month: "2-digit" }) : "";

export default function ExamsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [lessons, setLessons] = useState<string[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Χρονική περίοδος
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const [form, setForm] = useState<Exam>({ id: "", subject: "", grade: "", date: "", start: "10:00", duration: 2, room: "", invigilator: "" });

  useEffect(() => {
    setIsMounted(true);
    setExams(JSON.parse(localStorage.getItem("eduflow_exams") || "[]"));
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
    setRooms(JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"));
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
    const rawLessons = JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]");
    setLessons((rawLessons as any[]).map((l) => (typeof l === "string" ? l : l?.name)).filter(Boolean));
    const today = new Date();
    const end = new Date(); end.setDate(end.getDate() + 60);
    setRangeStart(toISO(today)); setRangeEnd(toISO(end));
  }, []);

  const persist = (next: Exam[]) => { setExams(next); localStorage.setItem("eduflow_exams", JSON.stringify(next)); };
  const teacherName = (t: any) => `${t.lastName || ""} ${t.firstName || ""}`.trim();

  // Διαθέσιμα Σάββατα & Κυριακές στην περίοδο
  const weekendDates = useMemo(() => {
    const out: string[] = [];
    if (!rangeStart || !rangeEnd) return out;
    const d = new Date(rangeStart + "T00:00:00"); const end = new Date(rangeEnd + "T00:00:00");
    let guard = 0;
    while (d <= end && guard++ < 400) {
      const dow = d.getDay();
      if (dow === 0 || dow === 6) out.push(toISO(d));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }, [rangeStart, rangeEnd]);

  // Auto-επιλογή πρώτου διαθέσιμου weekend
  useEffect(() => { if (weekendDates.length && !weekendDates.includes(form.date)) setForm((f) => ({ ...f, date: weekendDates[0] })); }, [weekendDates]); // eslint-disable-line

  // Score επιτηρητών: πόσες επιτηρήσεις έχει ο καθένας
  const invigCount = useMemo(() => {
    const m: Record<string, number> = {};
    exams.forEach((e) => { if (e.invigilator) m[e.invigilator] = (m[e.invigilator] || 0) + 1; });
    return m;
  }, [exams]);
  const invigOptions = useMemo(() => teachers.map((t) => ({ name: teacherName(t), count: invigCount[teacherName(t)] || 0 }))
    .filter((o) => o.name).sort((a, b) => a.count - b.count), [teachers, invigCount]);

  const conflictsOf = (e: Exam, list: Exam[]) => {
    const s1 = hhToNum(e.start), e1 = s1 + (Number(e.duration) || 1);
    return list.filter((o) => o.id !== e.id && o.date === e.date && overlap(s1, e1, hhToNum(o.start), hhToNum(o.start) + (Number(o.duration) || 1))
      && (o.grade === e.grade || (e.room && o.room === e.room) || (e.invigilator && o.invigilator === e.invigilator)));
  };

  const addExam = () => {
    if (!form.subject || !form.grade || !form.date) { alert("Συμπλήρωσε Μάθημα, Τάξη και Ημερομηνία."); return; }
    const candidate: Exam = { ...form, id: `e-${Date.now()}` };
    const cf = conflictsOf(candidate, exams);
    if (cf.length > 0) {
      const reasons = cf.map((c) => `${c.subject} (${c.grade})`).join(", ");
      if (!confirm(`⚠ Σύγκρουση με: ${reasons}. Ίδια ώρα + (τάξη/αίθουσα/επιτηρητής). Προσθήκη ούτως ή άλλως;`)) return;
    }
    persist([...exams, candidate]);
    setForm({ ...form, subject: "", start: "10:00", duration: 2, room: "", invigilator: "" });
  };
  const removeExam = (id: string) => { if (confirm("Διαγραφή διαγωνίσματος;")) persist(exams.filter((e) => e.id !== id)); };

  const sorted = useMemo(() => [...exams].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)), [exams]);

  const invigilatorPlan = useMemo(() => {
    const map: Record<string, Exam[]> = {};
    exams.forEach((e) => { if (e.invigilator) (map[e.invigilator] = map[e.invigilator] || []).push(e); });
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)));
    return map;
  }, [exams]);

  // Email προγράμματος στους γονείς (BCC, προσυμπληρωμένο)
  const parentEmails = useMemo(() => [...new Set(students.map((s) => s.parentEmail).filter(Boolean))], [students]);
  const examMailto = useMemo(() => {
    const lines = sorted.map((e) => {
      const end = `${String(Math.floor(hhToNum(e.start) + e.duration)).padStart(2, "0")}:00`;
      return `• ${dateLabel(e.date)} ${e.start}-${end} — ${e.subject} (${e.grade})${e.room ? `, αίθ. ${e.room}` : ""}`;
    }).join("\n");
    const body = `Αγαπητοί γονείς,\n\nΣας ενημερώνουμε για το πρόγραμμα διαγωνισμάτων:\n\n${lines}\n\nΜε εκτίμηση,\nΤη Γραμματεία`;
    return `mailto:?bcc=${encodeURIComponent(parentEmails.join(","))}&subject=${encodeURIComponent("Πρόγραμμα Διαγωνισμάτων")}&body=${encodeURIComponent(body)}`;
  }, [sorted, parentEmails]);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Προγραμματισμός Διαγωνισμάτων" description="Όρισε περίοδο → διαθέσιμα Σαββατοκύριακα, επιτηρητές με score, αποστολή στους γονείς.">

      <style>{`@media print { @page { margin: 1.2cm; } .print-hide { display:none !important; } table { border-collapse: collapse; } td, th { border:1px solid #000 !important; } }`}</style>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ΦΟΡΜΑ */}
        <div className="print-hide bg-[#1e2330] border border-slate-800 p-5 rounded-3xl h-fit shadow-xl space-y-3 lg:sticky lg:top-28">
          <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-800 pb-3 tracking-wider"><Plus size={14} /> Νέο Διαγώνισμα</h3>

          {/* Χρονική περίοδος */}
          <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3 space-y-2">
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Χρονική Περίοδος</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="bg-[#1e2330] border border-slate-800 p-2 rounded-lg text-[11px] text-white outline-none focus:border-indigo-500" />
              <input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="bg-[#1e2330] border border-slate-800 p-2 rounded-lg text-[11px] text-white outline-none focus:border-indigo-500" />
            </div>
            <p className="text-[10px] text-slate-500">{weekendDates.length} διαθέσιμα Σαββατοκύριακα</p>
          </div>

          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            <option value="">Μάθημα *</option>{lessons.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            <option value="">Τάξη *</option>{GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Ημερομηνία (Σάββατο/Κυριακή)</label>
            <select value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              {weekendDates.length === 0 ? <option value="">— Όρισε περίοδο —</option> : weekendDates.map((d) => <option key={d} value={d}>{dateLabel(d)}</option>)}
            </select>
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
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Επιτηρητής (λιγότερες επιτηρήσεις πρώτα)</label>
            <select value={form.invigilator} onChange={(e) => setForm({ ...form, invigilator: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">— Επιτηρητής —</option>
              {invigOptions.map((o) => <option key={o.name} value={o.name}>{o.name} — επιτηρήσεις: {o.count}</option>)}
            </select>
          </div>

          <button onClick={addExam} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-lg">Προσθήκη Διαγωνίσματος</button>
        </div>

        {/* ΛΙΣΤΑ + ΕΠΙΤΗΡΗΤΕΣ */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-2 print-hide">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2"><CalendarDays size={14} /> Προγραμματισμένα ({exams.length})</h3>
            <div className="flex gap-2">
              <a href={parentEmails.length && exams.length ? examMailto : undefined} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${parentEmails.length && exams.length ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-900 text-slate-600 pointer-events-none"}`}><Mail size={14} /> Email στους γονείς ({parentEmails.length})</a>
              <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold"><Printer size={14} /> Εκτύπωση</button>
            </div>
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
                        <span className="text-[10px] font-bold bg-indigo-950/50 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/30">{e.grade}</span>
                        {cf.length > 0 && <span className="text-[10px] font-bold bg-rose-950/40 text-rose-400 px-2 py-0.5 rounded border border-rose-900/40 flex items-center gap-1"><AlertTriangle size={10} /> Σύγκρουση</span>}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">📅 {dateLabel(e.date)} · {e.start}-{end}{e.room ? ` · 🚪 ${e.room}` : ""}{e.invigilator ? ` · 👁 ${e.invigilator}` : ""}</p>
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
              <p className="text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl text-center py-6">Δεν έχουν οριστεί επιτηρητές.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(invigilatorPlan).map(([name, list]) => (
                  <div key={name} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4">
                    <p className="text-white font-bold text-xs mb-2 flex items-center gap-1.5"><UserCheck size={12} className="text-emerald-400" /> {name} <span className="text-slate-500 font-normal">· {list.length} επιτηρήσεις</span></p>
                    <div className="space-y-1">
                      {list.map((e) => (
                        <div key={e.id} className="text-[11px] text-slate-300 bg-[#0b0e14] rounded-lg px-2.5 py-1.5 border border-slate-800/60">
                          {dateLabel(e.date)} {e.start} · {e.subject} ({e.grade})
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
