"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface GridViewProps {
  schedule: any[];
  onUpdate?: () => void;
}

const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const BASE_HOUR = 9;
const HOURS = Array.from({ length: 14 }, (_, i) => i + BASE_HOUR); // 9..22
const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

const parseTime = (t: string) => {
  const [a, b] = String(t || "").split("-");
  const sh = parseInt(a);
  const eh = b ? parseInt(b) : (isNaN(sh) ? sh : sh + 1);
  return { sh, eh: isNaN(eh) ? sh + 1 : eh };
};
const overlap = (s1: number, e1: number, s2: number, e2: number) => s1 < e2 && s2 < e1;

// Σταθερό χρώμα ανά μάθημα (deterministic hash)
const SUBJECT_COLORS = [
  "border-indigo-500 bg-indigo-600/25 text-indigo-200",
  "border-emerald-500 bg-emerald-600/25 text-emerald-200",
  "border-amber-500 bg-amber-600/25 text-amber-200",
  "border-rose-500 bg-rose-600/25 text-rose-200",
  "border-cyan-500 bg-cyan-600/25 text-cyan-200",
  "border-violet-500 bg-violet-600/25 text-violet-200",
  "border-lime-500 bg-lime-600/25 text-lime-200",
  "border-fuchsia-500 bg-fuchsia-600/25 text-fuchsia-200",
];
function subjectColor(subject: string): string {
  let hash = 0;
  for (let i = 0; i < (subject || "").length; i++) hash = (hash * 31 + subject.charCodeAt(i)) % 997;
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length];
}

export function GridView({ schedule, onUpdate }: GridViewProps) {
  const [refData, setRefData] = useState<{ classes: any[]; teachers: any[]; rooms: any[]; lessons: string[] }>({
    classes: [], teachers: [], rooms: [], lessons: [],
  });
  const [modal, setModal] = useState<{ day: string; time: string } | null>(null);
  const [form, setForm] = useState({ className: "", subject: "", teacher: "", room: "", duration: 1 });

  useEffect(() => {
    try {
      const rawLessons = JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]");
      setRefData({
        classes: JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]"),
        teachers: JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"),
        rooms: JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"),
        lessons: (rawLessons as any[]).map((l) => (typeof l === "string" ? l : (l?.name || ""))).filter(Boolean),
      });
    } catch { /* noop */ }
  }, [modal]);

  const teacherName = (t: any) => t.name || `${t.lastName || ""} ${t.firstName || ""}`.trim();

  const persistSchedule = (next: any[]) => {
    localStorage.setItem("eduflow_schedule", JSON.stringify(next));
    if (onUpdate) onUpdate(); else window.dispatchEvent(new Event("focus"));
  };

  const openAdd = (day: string, time: string) => {
    setForm({ className: "", subject: "", teacher: "", room: "", duration: 1 });
    setModal({ day, time });
  };

  const addSession = () => {
    if (!modal) return;
    if (!form.className || !form.subject || !form.teacher) { alert("Συμπλήρωσε Τμήμα, Μάθημα και Καθηγητή."); return; }
    const startH = parseInt(modal.time);
    const dur = Number(form.duration) || 1;
    const endH = Math.min(startH + dur, BASE_HOUR + HOURS.length);
    const time = `${pad(startH)}-${pad(endH)}`;

    const current = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");
    const clash = current.find((s: any) => {
      if (s.day !== modal.day) return false;
      const { sh, eh } = parseTime(s.time);
      return overlap(startH, endH, sh, eh) && (s.teacher === form.teacher || s.groupName === form.className || (form.room && s.room === form.room));
    });
    if (clash && !confirm("⚠ Υπάρχει σύγκρουση (καθηγητής / τμήμα / αίθουσα) σε αυτό το διάστημα. Προσθήκη ούτως ή άλλως;")) return;

    const item = {
      id: `${form.className}-${form.subject}-${modal.day}-${time}-${Date.now()}`,
      groupName: form.className, subject: form.subject, teacher: form.teacher,
      room: form.room || undefined, day: modal.day, time,
    };
    persistSchedule([...current, item]);
    setModal(null);
  };

  const removeSession = (session: any) => {
    const current = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");
    const next = session.id != null
      ? current.filter((s: any) => s.id !== session.id)
      : current.filter((s: any) => !(s.groupName === session.groupName && s.day === session.day && s.time === session.time && s.subject === session.subject));
    persistSchedule(next);
  };

  // teacher filter: subjects[] (νέο) Ή subject (legacy)
  const teacherOptions = form.subject
    ? refData.teachers.filter((t) => (t.subjects && t.subjects.includes(form.subject)) || t.subject === form.subject)
    : refData.teachers;

  // ⭐ Ομαδοποίηση ΑΝΑ (day, startHour) — όχι spanning, καθαρή στοίβαξη
  const cellMap: Record<string, any[]> = {};
  schedule.forEach((s) => {
    const di = DAYS.indexOf(s.day);
    const { sh } = parseTime(s.time);
    if (di < 0 || isNaN(sh) || sh < BASE_HOUR || sh >= BASE_HOUR + HOURS.length) return;
    const key = `${s.day}|${sh}`;
    (cellMap[key] = cellMap[key] || []).push(s);
  });

  return (
    <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 overflow-x-auto">
      <div style={{ minWidth: 980 }}>
        {/* Header row */}
        <div className="grid gap-px bg-slate-800 mb-px" style={{ gridTemplateColumns: "70px repeat(6, minmax(150px,1fr))" }}>
          <div className="bg-[#0b0e14] py-3"></div>
          {DAYS.map((day) => (
            <div key={day} className="text-center text-xs font-bold text-slate-400 py-3 bg-[#0b0e14]">{day}</div>
          ))}
        </div>

        {/* Hour rows — FIXED HEIGHT, no spanning, vertical stacking */}
        {HOURS.map((h) => (
          <div key={h} className="grid gap-px bg-slate-800 mb-px" style={{ gridTemplateColumns: "70px repeat(6, minmax(150px,1fr))" }}>
            {/* Hour label */}
            <div className="flex items-start justify-center text-xs text-slate-500 pt-2 bg-[#0b0e14]" style={{ minHeight: 90 }}>
              {pad(h)}
            </div>

            {/* Day cells */}
            {DAYS.map((day) => {
              const key = `${day}|${h}`;
              const sessions = cellMap[key] || [];
              return (
                <div
                  key={key}
                  className="bg-[#0b0e14] p-1 group relative"
                  style={{ minHeight: 90, maxHeight: 90, overflowY: "auto" }}
                >
                  {sessions.length === 0 ? (
                    <button
                      onClick={() => openAdd(day, pad(h))}
                      title="Προσθήκη μαθήματος"
                      className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-[#11151f] transition rounded"
                    >
                      <Plus size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition" />
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {sessions.map((session: any, idx: number) => {
                        const color = subjectColor(session.subject || "");
                        return (
                          <div
                            key={session.id ?? idx}
                            className={`relative rounded-lg border-l-4 p-1.5 ${color}`}
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); removeSession(session); }}
                              className="absolute top-0.5 right-0.5 text-slate-400 hover:text-rose-400"
                              title="Διαγραφή"
                            >
                              <X size={10} />
                            </button>
                            <p className="text-[11px] font-bold text-white truncate pr-4">{session.groupName}</p>
                            <p className="text-[10px] truncate">📘 {session.subject}</p>
                            <p className="text-[10px] text-slate-300 truncate">👨‍🏫 {session.teacher}</p>
                            <p className="text-[9px] text-slate-500 truncate">
                              {session.time}{session.room ? ` • 🚪 ${session.room}` : ""}
                            </p>
                          </div>
                        );
                      })}
                      {/* Κουμπί + για επιπλέον μάθημα στο ίδιο slot */}
                      <button
                        onClick={() => openAdd(day, pad(h))}
                        className="text-slate-600 hover:text-indigo-400 text-[10px] py-0.5 flex items-center justify-center gap-1"
                        title="Προσθήκη ακόμα ενός"
                      >
                        <Plus size={10} /> προσθήκη
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold text-sm">Νέο Μάθημα — {modal.day} {modal.time}</h3>

            <select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">Τμήμα *</option>
              {refData.classes.map((c: any, i: number) => (
                <option key={i} value={c.name || c.className}>
                  {c.subject ? `${c.name || c.className} - ${c.subject}` : `${c.name || c.className} (Γενικό)`}
                </option>
              ))}
            </select>

            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, teacher: "" })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">Μάθημα *</option>
              {refData.lessons.map((l: string, i: number) => <option key={i} value={l}>{l}</option>)}
            </select>

            <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">Καθηγητής *</option>
              {teacherOptions.map((t: any, i: number) => {
                const n = teacherName(t);
                const subj = (t.subjects && t.subjects.join(", ")) || t.subject || "";
                return <option key={i} value={n}>{n}{subj ? ` (${subj})` : ""}</option>;
              })}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <select value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
                <option value="">Αίθουσα (προαιρ.)</option>
                {refData.rooms.map((r: any, i: number) => <option key={i} value={r.name || r.title}>{r.name || r.title}</option>)}
              </select>
              <select value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
                <option value={1}>Διάρκεια: 1 ώρα</option>
                <option value={2}>Διάρκεια: 2 ώρες</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setModal(null)} className="w-1/3 p-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700">Ακύρωση</button>
              <button onClick={addSession} className="w-2/3 p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">Προσθήκη</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
