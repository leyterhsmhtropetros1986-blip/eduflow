"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, BookOpen, Search } from "lucide-react";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<string[]>([]);
  const [newLesson, setNewLesson] = useState("");

  // Φόρτωση από το localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("eduflow_lessons") || '["Μαθηματικά", "Φυσική", "Χημεία"]');
    setLessons(saved);
  }, []);

  const addLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLesson.trim()) return;
    const updated = [...lessons, newLesson.trim()];
    setLessons(updated);
    localStorage.setItem("eduflow_lessons", JSON.stringify(updated));
    setNewLesson("");
  };

  const removeLesson = (index: number) => {
    const updated = lessons.filter((_, i) => i !== index);
    setLessons(updated);
    localStorage.setItem("eduflow_lessons", JSON.stringify(updated));
  };

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
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              Προσθήκη
            </button>
          </form>
        </div>

        {/* ΛΙΣΤΑ ΜΑΘΗΜΑΤΩΝ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lessons.map((lesson, index) => (
            <div 
              key={index}
              className="group bg-[#1e2330] border border-slate-800 p-5 rounded-2xl flex justify-between items-center hover:border-indigo-500/50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400">
                  <BookOpen size={20} />
                </div>
                <span className="text-white font-medium">{lesson}</span>
              </div>
              
              <button 
                onClick={() => removeLesson(index)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {lessons.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500 text-sm">Δεν υπάρχουν καταχωρημένα μαθήματα.</p>
            </div>
          )}
        </div>

      </div>
    </WorkspaceShell>
  );
}