"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface GridViewProps {
  schedule: any[];
  onUpdate?: () => void;
}

const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const BASE_HOUR = 9;
const HOURS = Array.from({ length: 13 }, (_, i) => i + BASE_HOUR); // 9..21
const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

const parseTime = (t: string) => {
  const [a, b] = String(t || "").split("-");
  const sh = parseInt(a);
  const eh = b ? parseInt(b) : (isNaN(sh) ? sh : sh + 1);
  return { sh, eh: isNaN(eh) ? sh + 1 : eh };
};
const overlap = (s1: number, e1: number, s2: number, e2: number) => s1 < e2 && s2 < e1;

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

  const teacherOptions = form.subject ? refData.teachers.filter((t) => t.subject === form.subject) : refData.teachers;

  // Ομαδοποίηση μαθημάτων ανά κελί έναρξης (για σωστό spanning + στοίβαξη πολλαπλών)
  const startMap: Record<string, any[]> = {};
  schedule.forEach((s) => {
    const di = DAYS.indexOf(s.day);
    const { sh } = parseTime(s.time);
    if (di < 0 || isNaN(sh) || sh < BASE_HOUR || sh >= BASE_HOUR + HOURS.length) return;
    const key = `${s.day}|${sh}`;
    (startMap[key] = startMap[key] || []).push(s);
  });

  return (
    <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 overflow-x-auto">
      <div
        className="grid gap-px bg-slate-800"
        style={{ gridTemplateColumns: "80px repeat(6, minmax(140px,1fr))", gridTemplateRows: `auto repeat(${HOURS.length}, minmax(70px,1fr))` }}
      >
        {/* Header */}
        <div className="bg-[#0b0e14]" style={{ gridColumn: 1, gridRow: 1 }}></div>
        {DAYS.map((day, di) => (
          <div key={day} style={{ gridColumn: di + 2, gridRow: 1 }} className="text-center text-xs font-bold text-slate-400 py-3 bg-[#0b0e14]">{day}</div>
        ))}

        {/* Hour labels */}
        {HOURS.map((h, hi) => (
          <div key={h} style={{ gridColumn: 1, gridRow: hi + 2 }} className="flex items-start justify-center text-xs text-slate-500 pt-3 bg-[#0b0e14]">{pad(h)}</div>
        ))}

        {/* Empty clickable cells */}
        {HOURS.map((h, hi) => DAYS.map((day, di) => (
          <div
            key={`${day}-${h}`}
            style={{ gridColumn: di + 2, gridRow: hi + 2 }}
            onClick={() => openAdd(day, pad(h))}
            title="Κλικ για προσθήκη μαθήματος"
            className="bg-[#0b0e14] p-1 group cursor-pointer hover:bg-[#11151f] transition flex items-center justify-center"
          >
            <Plus size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition" />
          </div>
        )))}

        {/* Session blocks (με spanning) */}
        {Object.entries(startMap).map(([key, sessions]) => {
          const [day, shStr] = key.split("|");
          const di = DAYS.indexOf(day);
          const sh = parseInt(shStr);
          const maxSpan = Math.max(...sessions.map((s) => { const { sh: a, eh } = parseTime(s.time); return Math.max(1, Math.min(eh, BASE_HOUR + HOURS.length) - a); }));
          return (
            <div
              key={key}
              style={{ gridColumn: di + 2, gridRow: `${sh - BASE_HOUR + 2} / span ${maxSpan}`, zIndex: 10 }}
              className="p-1 flex flex-col gap-1 pointer-events-none"
            >
              {sessions.map((session: any, idx: number) => {
                const { sh: a, eh } = parseTime(session.time);
                const span = Math.max(1, eh - a);
                return (
                  <div
                    key={session.id ?? idx}
                    onClick={(e) => e.stopPropagation()}
                    style={{ flex: span }}
                    className="relative rounded-lg bg-indigo-600/25 border-l-4 border-indigo-500 p-2 pointer-events-auto overflow-hidden"
                  >
                    <button onClick={(e) => { e.stopPropagation(); removeSession(session); }} className="absolute top-1 right-1 text-slate-400 hover:text-rose-400" title="Διαγραφή"><X size={11} /></button>
                    <p className="text-[11px] font-bold text-white truncate pr-4">{session.groupName}</p>
                    <p className="text-[10px] text-indigo-300 truncate">👨‍🏫 {session.teacher}</p>
                    <p className="text-[10px] text-slate-400 truncate">📘 {session.subject}{session.room ? ` • 🚪 ${session.room}` : ""}</p>
                    <p className="text-[9px] text-slate-500">{session.time}</p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold text-sm">Νέο Μάθημα — {modal.day} {modal.time}</h3>

            <select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">Τμήμα *</option>
              {refData.classes.map((c: any, i: number) => <option key={i} value={c.name || c.className}>{c.name || c.className}</option>)}
            </select>

            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, teacher: "" })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">Μάθημα *</option>
              {refData.lessons.map((l: string, i: number) => <option key={i} value={l}>{l}</option>)}
            </select>

            <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">Καθηγητής *</option>
              {teacherOptions.map((t: any, i: number) => { const n = teacherName(t); return <option key={i} value={n}>{n}{t.subject ? ` (${t.subject})` : ""}</option>; })}
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

