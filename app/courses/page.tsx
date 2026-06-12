"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Plus, Trash2, Edit2, BookOpen, AlertTriangle, UserCheck, Users, Clock, CalendarDays, GitBranch, X, CheckCircle2, LayoutList } from "lucide-react";

interface Lesson {
  id: string;
  name: string;
  weeklyHours: number;
  distribution: number[];
  maxHoursPerDay: number;
  minGapDays: number;
}

export default function LessonsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [weeklyHours, setWeeklyHours] = useState<number>(0);
  const [distribution, setDistribution] = useState<number[]>([]);
  const [minGap, setMinGap] = useState<number>(1);

  const currentSum = distribution.reduce((a, b) => a + b, 0);
  const isCompleted = weeklyHours > 0 && currentSum === weeklyHours && distribution.length > 0;

  useEffect(() => {
    setIsMounted(true);
    const raw = localStorage.getItem("eduflow_lessons");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const migrated: Lesson[] = parsed.map((l: any) => ({
            id: (typeof l === "object" && l.id) ? l.id : crypto.randomUUID(),
            name: (typeof l === "object" && l.name) ? l.name : (typeof l === "string" ? l : "Άτιτλο"),
            weeklyHours: (typeof l === "object" && l.weeklyHours !== undefined) ? l.weeklyHours : 0,
            distribution: (typeof l === "object" && Array.isArray(l.distribution)) ? l.distribution : [],
            maxHoursPerDay: 2,
            minGapDays: (typeof l === "object" && l.minGapDays !== undefined) ? l.minGapDays : 1,
          }));
          setLessons(migrated);
          localStorage.setItem("eduflow_lessons", JSON.stringify(migrated));
        }
      } catch { setLessons([]); }
    }
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
  }, []);

  const persist = (next: Lesson[]) => {
    setLessons(next);
    localStorage.setItem("eduflow_lessons", JSON.stringify(next));
  };

  const addBlock = (hours: number) => {
    if (currentSum + hours > weeklyHours) {
      alert(`Η προσθήκη αυτού του ${hours}ώρου υπερβαίνει τις συνολικές ώρες (${weeklyHours}).`);
      return;
    }
    setDistribution([...distribution, hours]);
  };

  const resetForm = () => {
    setEditingId(null); setName(""); setWeeklyHours(0); setDistribution([]); setMinGap(1);
  };

  const startEdit = (l: Lesson) => {
    setEditingId(l.id);
    setName(l.name);
    setWeeklyHours(l.weeklyHours || 0);
    setDistribution(l.distribution || []);
    setMinGap(l.minGapDays || 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveLesson = () => {
    if (!name.trim()) { alert("Παρακαλώ συμπλήρωσε το όνομα."); return; }
    if (weeklyHours < 1 || weeklyHours > 12) { alert("Οι εβδομαδιαίες ώρες πρέπει να είναι από 1 έως 12."); return; }
    if (!isCompleted) { alert("Η κατανομή δεν είναι σωστή (πρέπει να ισούται με τις συνολικές ώρες)."); return; }
    if (distribution.length > 6) { alert("Η κατανομή απαιτεί περισσότερες από 6 ημέρες διδασκαλίας."); return; }
    if (minGap < 1) { alert("Το ελάχιστο κενό πρέπει να είναι τουλάχιστον 1 ημέρα."); return; }
    if (lessons.some((l) => l.id !== editingId && l.name.toLowerCase() === name.trim().toLowerCase())) { alert("Το μάθημα υπάρχει ήδη."); return; }

    const lessonData: Lesson = {
      id: editingId || crypto.randomUUID(),
      name: name.trim(),
      weeklyHours,
      distribution,
      maxHoursPerDay: 2,
      minGapDays: minGap,
    };

    const next = editingId
      ? lessons.map((l) => (l.id === editingId ? lessonData : l))
      : [...lessons, lessonData];
    persist(next.sort((a, b) => a.name.localeCompare(b.name, "el")));
    resetForm();
  };

  const usage = useMemo(() => {
    const map: Record<string, { teachers: number; enrollments: number }> = {};
    lessons.forEach((l) => {
      const t = teachers.filter((x: any) => x.subject === l.name).length;
      const e = students.reduce((acc: number, s: any) => acc + (s.enrollments || []).filter((en: any) => en.lessonName === l.name).length, 0);
      map[l.id] = { teachers: t, enrollments: e };
    });
    return map;
  }, [lessons, teachers, students]);

  const removeLesson = (id: string, nm: string) => {
    if (!confirm(`Διαγραφή του μαθήματος "${nm}";`)) return;
    persist(lessons.filter((l) => l.id !== id));
    if (editingId === id) resetForm();
  };

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Διαχείριση Μαθημάτων" description="Ορίστε τα μαθήματα, τις ώρες/εβδομάδα και την κατανομή τους — αυτές τροφοδοτούν τον Scheduler.">

      <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 mb-8 max-w-4xl mx-auto shadow-xl">
        <h2 className="text-white font-bold mb-5 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-800 pb-3">
          <Plus size={16} className="text-indigo-400" /> {editingId ? "Επεξεργασία Μαθήματος" : "Νέο Μάθημα & Περιορισμοί"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-full">
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5 pl-1">Όνομα Μαθήματος *</label>
            <input className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none" placeholder="π.χ. Χημεία Γ Λυκείου" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5 pl-1">Συνολικές ώρες / εβδομάδα</label>
            <input type="number" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 outline-none" value={weeklyHours}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (distribution.length > 0) {
                  if (confirm("Η αλλαγή των συνολικών ωρών θα διαγράψει την τρέχουσα κατανομή. Συνέχεια;")) { setDistribution([]); setWeeklyHours(val); }
                } else { setWeeklyHours(val); }
              }} />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5 pl-1">Min Gap (Μέρες)</label>
            <input type="number" min={1} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white" value={minGap} onChange={(e) => setMinGap(Math.max(1, Number(e.target.value)))} />
          </div>

          <div className="col-span-full">
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 pl-1">Κατανομή (μπλοκ έως 2 ώρες)</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => addBlock(2)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs font-bold transition">+ Προσθήκη 2ώρου</button>
              <button type="button" onClick={() => addBlock(1)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs font-bold transition">+ Προσθήκη 1ώρου</button>
            </div>

            <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 min-h-[50px] flex flex-wrap items-center gap-2">
              {distribution.length === 0 && <span className="text-slate-600 text-xs italic">Δεν υπάρχουν block ωρών...</span>}
              {distribution.map((d, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-indigo-900/50 border border-indigo-500/50 text-indigo-200 px-3 py-1 rounded-lg text-xs font-bold">
                  {d}h
                  <button onClick={() => setDistribution(distribution.filter((_, i) => i !== idx))} className="ml-1 hover:text-white"><X size={12} /></button>
                </div>
              ))}
            </div>

            <div className={`mt-3 p-3 rounded-xl border text-xs font-bold flex flex-col gap-2 ${isCompleted ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isCompleted ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                  Κατανομή: {distribution.length > 0 ? distribution.join("h + ") + "h" : "0h"}
                  <span className="opacity-70 ml-1">= {currentSum}/{weeklyHours} ώρες</span>
                </div>
                <div>{isCompleted ? "✅ Ολοκληρώθηκε" : currentSum < weeklyHours ? `Υπολείπεται ${weeklyHours - currentSum}h` : `Υπέρβαση ${currentSum - weeklyHours}h ❌`}</div>
              </div>
              {distribution.length > 0 && <div className="border-t border-slate-700/50 pt-2 opacity-80">➡ {distribution.length} συναντήσεις / εβδομάδα</div>}
            </div>
          </div>

          <div className="md:col-span-2 flex gap-2 mt-2">
            {editingId && <button onClick={resetForm} className="px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 p-3 rounded-xl text-xs font-bold flex items-center gap-1"><X size={14}/> Άκυρο</button>}
            <button onClick={saveLesson} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold transition-all shadow-lg">
              {editingId ? "Ενημέρωση Μαθήματος" : "Προσθήκη Μαθήματος"}
            </button>
          </div>
        </div>
      </div>

      <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4 border-b border-slate-800 pb-2">
        Διαθέσιμα Μαθήματα ({lessons.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lessons.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-2">
            <AlertTriangle size={22} className="text-slate-700" /><span>Δεν υπάρχουν μαθήματα.</span>
          </div>
        ) : (
          lessons.map((lesson) => {
            const u = usage[lesson.id] || { teachers: 0, enrollments: 0 };
            const needsHours = !lesson.weeklyHours || lesson.distribution.length === 0;
            return (
              <div key={lesson.id} className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-4 hover:border-slate-700 transition-all">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-2"><BookOpen size={14} className="text-indigo-400" /> {lesson.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(lesson)} className="text-slate-600 hover:text-indigo-400 p-1 hover:bg-[#0b0e14] rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => removeLesson(lesson.id, lesson.name)} className="text-slate-600 hover:text-rose-500 p-1 hover:bg-[#0b0e14] rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {needsHours ? (
                    <div className="mt-3 text-[10px] text-amber-400 bg-amber-950/20 border border-amber-900/40 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                      <AlertTriangle size={11} /> Δεν έχουν οριστεί ώρες — πάτησε επεξεργασία.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5"><Clock size={12} /> {lesson.weeklyHours} ώρες</div>
                      <div className="flex items-center gap-1.5"><CalendarDays size={12} /> {lesson.distribution.join("-")}</div>
                      <div className="flex items-center gap-1.5"><LayoutList size={12} /> {lesson.distribution.length} συναντήσεις</div>
                      <div className="flex items-center gap-1.5"><GitBranch size={12} /> Min Gap: {lesson.minGapDays}</div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-700/50">
                  <span className="text-sky-400 text-[10px] font-bold bg-sky-950/40 px-2 py-0.5 rounded border border-sky-900/30 flex items-center gap-1"><UserCheck size={10} /> {u.teachers} καθηγητές</span>
                  <span className="text-emerald-400 text-[10px] font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30 flex items-center gap-1"><Users size={10} /> {u.enrollments} εγγραφές</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </WorkspaceShell>
  );
}
