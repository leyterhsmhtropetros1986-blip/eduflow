"use client";

import { Fragment, useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

interface GridViewProps {
  schedule: any[];
  onUpdate?: () => void; // καλείται μετά από προσθήκη/διαγραφή ώστε να ανανεωθεί το parent
}

const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];

export function GridView({ schedule, onUpdate }: GridViewProps) {
  const days = DAYS;
  const hours = Array.from({ length: 13 }, (_, i) => `${String(i + 9).padStart(2, "0")}:00`);

  // Δεδομένα για τα dropdown
  const [refData, setRefData] = useState<{ classes: any[]; teachers: any[]; rooms: any[]; lessons: string[] }>({
    classes: [], teachers: [], rooms: [], lessons: [],
  });

  const [modal, setModal] = useState<{ day: string; time: string } | null>(null);
  const [form, setForm] = useState({ className: "", subject: "", teacher: "", room: "" });

  // Φόρτωση δεδομένων αναφοράς (όταν ανοίγει το modal — φθηνό & πάντα φρέσκο)
  useEffect(() => {
    try {
      setRefData({
        classes: JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]"),
        teachers: JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"),
        rooms: JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"),
        lessons: JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]"),
      });
    } catch { /* noop */ }
  }, [modal]);

  const teacherName = (t: any) => t.name || `${t.lastName || ""} ${t.firstName || ""}`.trim();

  const persistSchedule = (next: any[]) => {
    localStorage.setItem("eduflow_schedule", JSON.stringify(next));
    if (onUpdate) onUpdate();
    else window.dispatchEvent(new Event("focus"));
  };

  const openAdd = (day: string, time: string) => {
    setForm({ className: "", subject: "", teacher: "", room: "" });
    setModal({ day, time });
  };

  const addSession = () => {
    if (!modal) return;
    if (!form.className || !form.subject || !form.teacher) {
      alert("Συμπλήρωσε Τμήμα, Μάθημα και Καθηγητή.");
      return;
    }
    const current = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");

    // Έλεγχος σύγκρουσης (ίδια μέρα/ώρα)
    const clash = current.find((s: any) =>
      s.day === modal.day && s.time === modal.time &&
      (s.teacher === form.teacher || s.groupName === form.className || (form.room && s.room === form.room))
    );
    if (clash && !confirm("⚠ Υπάρχει σύγκρουση (καθηγητής / τμήμα / αίθουσα) σε αυτή την ώρα. Προσθήκη ούτως ή άλλως;")) return;

    const item = {
      id: `${form.className}-${form.subject}-${modal.day}-${modal.time}-${Date.now()}`,
      groupName: form.className,
      subject: form.subject,
      teacher: form.teacher,
      room: form.room || undefined,
      day: modal.day,
      time: modal.time,
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

  // Καθηγητές φιλτραρισμένοι κατά μάθημα (αν επιλεγεί), αλλιώς όλοι
  const teacherOptions = form.subject ? refData.teachers.filter((t) => t.subject === form.subject) : refData.teachers;

  return (
    <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 overflow-x-auto">
      <div className="grid gap-px" style={{ gridTemplateColumns: "80px repeat(6, minmax(140px,1fr))" }}>
        {/* Header */}
        <div></div>
        {days.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-slate-400 py-3 bg-[#0b0e14]">
            {day}
          </div>
        ))}

        {/* Body */}
        {hours.map((hour) => (
          <Fragment key={hour}>
            <div className="flex items-start justify-center text-xs text-slate-500 pt-3 bg-[#0b0e14]">{hour}</div>

            {days.map((day) => {
              const sessions = schedule.filter(
                (s) => s.day === day && s.time?.substring(0, 2) === hour.substring(0, 2)
              );

              return (
                <div
                  key={`${day}-${hour}`}
                  onClick={() => openAdd(day, hour)}
                  title="Κλικ για προσθήκη μαθήματος"
                  className="min-h-[70px] border border-slate-800 bg-[#0b0e14] p-1 group cursor-pointer hover:bg-[#11151f] transition"
                >
                  {sessions.map((session: any, idx: number) => (
                    <div
                      key={session.id ?? idx}
                      onClick={(e) => e.stopPropagation()}
                      className="relative mb-1 rounded-lg bg-indigo-600/20 border-l-4 border-indigo-500 p-2"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSession(session); }}
                        className="absolute top-1 right-1 text-slate-400 hover:text-rose-400"
                        title="Διαγραφή"
                      >
                        <X size={11} />
                      </button>
                      <p className="text-[11px] font-bold text-white truncate pr-4">{session.groupName}</p>
                      <p className="text-[10px] text-indigo-300 truncate">👨‍🏫 {session.teacher}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        📘 {session.subject}{session.room ? ` • 🏫 ${session.room}` : ""}
                      </p>
                    </div>
                  ))}

                  {sessions.length === 0 && (
                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Plus size={14} className="text-slate-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      {/* MODAL ΠΡΟΣΘΗΚΗΣ */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-bold text-sm">Νέο Μάθημα — {modal.day} {modal.time}</h3>

            <select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">Τμήμα *</option>
              {refData.classes.map((c: any, i: number) => (
                <option key={i} value={c.name || c.className}>{c.name || c.className}</option>
              ))}
            </select>

            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, teacher: "" })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">Μάθημα *</option>
              {refData.lessons.map((l: string, i: number) => (
                <option key={i} value={l}>{l}</option>
              ))}
            </select>

            <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">Καθηγητής *</option>
              {teacherOptions.map((t: any, i: number) => {
                const n = teacherName(t);
                return <option key={i} value={n}>{n}{t.subject ? ` (${t.subject})` : ""}</option>;
              })}
            </select>

            <select value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">Αίθουσα (προαιρετικό)</option>
              {refData.rooms.map((r: any, i: number) => (
                <option key={i} value={r.name || r.title}>{r.name || r.title}</option>
              ))}
            </select>

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
