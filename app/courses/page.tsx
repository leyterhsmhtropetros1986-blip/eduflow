"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, BookOpen, Search } from "lucide-react";

type Lesson = {
  id: string;
  name: string;
  duration: number;
  color: string;
  description?: string;
  teacherId?: string;
  classCount: number;
};

const COLORS = [
  "bg-blue-500/10 text-blue-400",
  "bg-green-500/10 text-green-400",
  "bg-purple-500/10 text-purple-400",
  "bg-orange-500/10 text-orange-400",
  "bg-pink-500/10 text-pink-400",
  "bg-cyan-500/10 text-cyan-400",
];

const DEFAULT_LESSONS: Lesson[] = [
  { id: crypto.randomUUID(), name: "Μαθηματικά", duration: 60, color: COLORS[0], classCount: 0 },
  { id: crypto.randomUUID(), name: "Φυσική", duration: 60, color: COLORS[1], classCount: 0 },
];

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newLesson, setNewLesson] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("eduflow_lessons");

    if (!saved) {
      setLessons(DEFAULT_LESSONS);
      localStorage.setItem("eduflow_lessons", JSON.stringify(DEFAULT_LESSONS));
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      // 1. Migration για παλιά string[]
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
        const migrated: Lesson[] = parsed.map((name: string, index: number) => ({
          id: crypto.randomUUID(),
          name,
          duration: 60,
          color: COLORS[index % COLORS.length],
          description: "",
          teacherId: "",
          classCount: 0,
        }));
        setLessons(migrated);
        localStorage.setItem("eduflow_lessons", JSON.stringify(migrated));
        return;
      }

      // 2. Normalization για objects (διασφάλιση fields)
      const normalized: Lesson[] = parsed.map((l: any, index: number) => ({
        id: l.id ?? crypto.randomUUID(),
        name: l.name,
        duration: l.duration ?? 60,
        color: l.color ?? COLORS[index % COLORS.length],
        description: l.description ?? "",
        teacherId: l.teacherId ?? "",
        classCount: l.classCount ?? 0,
      }));

      setLessons(normalized);
      localStorage.setItem("eduflow_lessons", JSON.stringify(normalized));

    } catch {
      // 3. Fallback αν το JSON είναι corrupt
      setLessons(DEFAULT_LESSONS);
      localStorage.setItem("eduflow_lessons", JSON.stringify(DEFAULT_LESSONS));
    }
  }, []);

  const saveLessons = (updatedLessons: Lesson[]) => {
    setLessons(updatedLessons);
    localStorage.setItem("eduflow_lessons", JSON.stringify(updatedLessons));
  };

  const addLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newLesson.trim();
    
    if (!trimmedName) return;

    if (lessons.some((l) => l.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert("Το μάθημα υπάρχει ήδη στη λίστα.");
      return;
    }

    const newLessonObj: Lesson = {
      id: crypto.randomUUID(),
      name: trimmedName,
      duration: 60,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      classCount: 0,
    };

    const updated = [...lessons, newLessonObj].sort((a, b) => 
      a.name.localeCompare(b.name, "el")
    );
    
    saveLessons(updated);
    setNewLesson("");
  };

  const removeLesson = (id: string) => {
    if (!confirm("Να διαγραφεί το μάθημα;")) return;
    const updated = lessons.filter((l) => l.id !== id);
    saveLessons(updated);
  };

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) =>
      lesson.name.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [lessons, search]);

  return (
    <WorkspaceShell title="Μαθήματα" description="Διαχείριση προσφερόμενων μαθημάτων και ύλης.">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* ΚΑΡΤΑ ΠΡΟΣΘΗΚΗΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl mb-8 shadow-xl">
          <form onSubmit={addLesson} className="flex gap-3">
            <div className="relative flex-grow">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                value={newLesson}
                onChange={(e) => setNewLesson(e.target.value)}
                placeholder="Όνομα μαθήματος (π.χ. Αρχαία Ελληνικά)" 
                className="w-full bg-[#0b0e14] border border-slate-700 text-white text-sm p-4 pl-12 rounded-2xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
            <button 
              type="submit"
              disabled={!newLesson.trim()}
              className={`px-8 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                newLesson.trim() 
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Plus size={18} />
              Προσθήκη
            </button>
          </form>
        </div>

        <div className="flex justify-between items-end mb-6">
          <p className="text-slate-400 text-sm">Σύνολο μαθημάτων: {lessons.length}</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Αναζήτηση μαθήματος..."
            className="w-full bg-[#1e2330] border border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-white focus:border-indigo-500 outline-none"
          />
        </div>

        {/* ΛΙΣΤΑ ΜΑΘΗΜΑΤΩΝ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((lesson) => (
            <div 
              key={lesson.id}
              className="group bg-[#1e2330] border border-slate-800 p-5 rounded-2xl flex justify-between items-center hover:border-indigo-500/50 transition-all shadow-sm hover:scale-[1.02] hover:shadow-xl duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lesson.color}`}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <span className="text-white font-medium">{lesson.name}</span>
                  <div className="flex gap-3 text-xs text-slate-500 mt-1">
                     <span>⏱ {lesson.duration} λεπτά</span>
                     <span>👥 {lesson.classCount} τμήματα</span>
                  </div>
                  {lesson.description && (
                    <p className="text-xs text-slate-400 mt-1">{lesson.description}</p>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => removeLesson(lesson.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {filteredLessons.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
              <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-500">
                {search 
                  ? "Δεν βρέθηκαν αποτελέσματα για την αναζήτησή σου." 
                  : "Δεν υπάρχουν καταχωρημένα μαθήματα."}
              </p>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}