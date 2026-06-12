"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Plus, Trash2, BookOpen, AlertTriangle, UserCheck, Users } from "lucide-react";

export default function LessonsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [lessons, setLessons] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setIsMounted(true);

    // Πηγή αλήθειας: eduflow_lessons (με fallback/migration από eduflow_courses)
    const raw = JSON.parse(
      localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]"
    );

    // Κανονικοποίηση σε string[] (αν ήταν objects) + αφαίρεση διπλών/κενών
    const normalized: string[] = Array.from(
      new Set(
        (raw as any[])
          .map((l) => (typeof l === "string" ? l : (l?.name || l?.title || l?.subject || "")))
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );

    setLessons(normalized);
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));

    // Αν έγινε migration/κανονικοποίηση, ξαναγράψε καθαρά στο σωστό key
    localStorage.setItem("eduflow_lessons", JSON.stringify(normalized));
  }, []);

  const persist = (next: string[]) => {
    setLessons(next);
    localStorage.setItem("eduflow_lessons", JSON.stringify(next));
  };

  const addLesson = () => {
    const value = name.trim();
    if (!value) {
      alert("Παρακαλώ συμπλήρωσε το όνομα του μαθήματος.");
      return;
    }
    if (lessons.some((l) => l.toLowerCase() === value.toLowerCase())) {
      alert(`Το μάθημα "${value}" υπάρχει ήδη.`);
      return;
    }
    persist([...lessons, value].sort((a, b) => a.localeCompare(b, "el")));
    setName("");
  };

  // Χρήση κάθε μαθήματος (για να ξέρεις πριν διαγράψεις)
  const usage = useMemo(() => {
    const map: Record<string, { teachers: number; enrollments: number }> = {};
    lessons.forEach((l) => {
      const t = teachers.filter((x: any) => x.subject === l).length;
      const e = students.reduce(
        (acc: number, s: any) => acc + (s.enrollments || []).filter((en: any) => en.lessonName === l).length,
        0
      );
      map[l] = { teachers: t, enrollments: e };
    });
    return map;
  }, [lessons, teachers, students]);

  const removeLesson = (lesson: string) => {
    const u = usage[lesson];
    const inUse = u && (u.teachers > 0 || u.enrollments > 0);
    const msg = inUse
      ? `⚠️ Το μάθημα "${lesson}" χρησιμοποιείται από ${u.teachers} καθηγητές και ${u.enrollments} εγγραφές. Η διαγραφή ΔΕΝ τα αφαιρεί αυτόματα — θα μείνουν ορφανές αναφορές. Σίγουρα διαγραφή;`
      : `Διαγραφή του μαθήματος "${lesson}";`;
    if (!confirm(msg)) return;
    persist(lessons.filter((l) => l !== lesson));
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <div className="text-slate-500 text-xs font-mono animate-pulse">Φόρτωση Μαθημάτων...</div>
      </div>
    );
  }

  return (
    <WorkspaceShell title="Διαχείριση Μαθημάτων" description="Ορίστε τα διαθέσιμα μαθήματα του φροντιστηρίου. Τροφοδοτούν τις σελίδες Καθηγητών & Μαθητών.">

      {/* Φόρμα */}
      <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 mb-8 max-w-2xl mx-auto shadow-xl">
        <h2 className="text-white font-bold mb-5 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-800 pb-3">
          <Plus size={16} className="text-indigo-400" /> Νέο Μάθημα
        </h2>

        <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5 pl-1">Όνομα Μαθήματος *</label>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
            placeholder="π.χ. Μαθηματικά, Φυσική, Έκθεση"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addLesson(); }}
          />
          <button
            onClick={addLesson}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 rounded-xl text-xs font-bold transition-all shadow-lg whitespace-nowrap"
          >
            Προσθήκη
          </button>
        </div>
      </div>

      {/* Λίστα */}
      <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4 border-b border-slate-800 pb-2">
        Διαθέσιμα Μαθήματα ({lessons.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-2">
            <AlertTriangle size={22} className="text-slate-700" />
            <span>Δεν υπάρχουν μαθήματα. Πρόσθεσε το πρώτο παραπάνω.</span>
          </div>
        ) : (
          lessons.map((lesson) => {
            const u = usage[lesson] || { teachers: 0, enrollments: 0 };
            return (
              <div key={lesson} className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl flex justify-between items-start hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
                    <BookOpen size={14} className="text-indigo-400" /> {lesson}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-sky-400 text-[10px] font-bold bg-sky-950/40 px-2 py-0.5 rounded border border-sky-900/30 flex items-center gap-1">
                      <UserCheck size={10} /> {u.teachers} καθηγητές
                    </span>
                    <span className="text-emerald-400 text-[10px] font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30 flex items-center gap-1">
                      <Users size={10} /> {u.enrollments} εγγραφές
                    </span>
                  </div>
                </div>
                <button onClick={() => removeLesson(lesson)} className="text-slate-600 hover:text-rose-500 p-1 hover:bg-[#0b0e14] rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </WorkspaceShell>
  );
}
