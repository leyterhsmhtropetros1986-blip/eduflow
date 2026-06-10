"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { BookOpen, PlusCircle, Trash2 } from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Μαθηματικά");
  const [duration, setDuration] = useState("12 εβδομάδες");
  const [capacity, setCapacity] = useState(12);

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_courses");
    if (stored) {
      setCourses(JSON.parse(stored));
    } else {
      const defaultCourses = [
        { id: "c1", title: "Εφαρμοσμένα Μαθηματικά", subject: "Μαθηματικά", duration: "12 εβδομάδες", capacity: 10 },
        { id: "c2", title: "Προχωρημένη Φυσική", subject: "Φυσική", duration: "10 εβδομάδες", capacity: 8 },
        { id: "c3", title: "Νεοελληνική Γλώσσα", subject: "Έκθεση", duration: "12 εβδομάδες", capacity: 15 }
      ];
      localStorage.setItem("eduflow_courses", JSON.stringify(defaultCourses));
      setCourses(defaultCourses);
    }
  }, []);

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("⚠️ Δώστε έναν τίτλο για το μάθημα!");
      return;
    }

    const newCourse = {
      id: `course-${Date.now()}`,
      title,
      subject,
      duration,
      capacity: Number(capacity) || 10
    };

    const updated = [...courses, newCourse];
    setCourses(updated);
    localStorage.setItem("eduflow_courses", JSON.stringify(updated));

    setTitle("");
    alert("🎉 Το μάθημα προστέθηκε στον κατάλογο!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Θέλετε να διαγράψετε αυτό το μάθημα;")) {
      const updated = courses.filter(c => c.id !== id);
      setCourses(updated);
      localStorage.setItem("eduflow_courses", JSON.stringify(updated));
    }
  };

  return (
    <WorkspaceShell 
      title="Μαθήματα & Ύλη" 
      description="Οργάνωση μαθημάτων φροντιστηρίου, διαχείριση θέσεων ανά τμήμα και ρύθμιση της διάρκειας των κύκλων σπουδών."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΠΙΝΑΚΑΣ ΜΑΘΗΜΑΤΩΝ */}
        <div className="lg:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" /> Διαθέσιμα Προγράμματα Σπουδών
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-[10px] uppercase">
                  <th className="pb-3">Τίτλος</th>
                  <th className="pb-3">Θεματική</th>
                  <th className="pb-3">Διάρκεια</th>
                  <th className="pb-3">Θέσεις</th>
                  <th className="pb-3 text-right">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {courses.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/10 transition">
                    <td className="py-3.5 font-semibold text-white">{c.title}</td>
                    <td className="py-3.5 text-slate-400">{c.subject}</td>
                    <td className="py-3.5 text-amber-400 font-medium">{c.duration}</td>
                    <td className="py-3.5 font-mono text-blue-400">{c.capacity} σπουδαστές</td>
                    <td className="py-3.5 text-right">
                      <button onClick={() => handleDelete(c.id)} className="text-rose-500 hover:text-rose-400 p-1 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ΔΗΜΙΟΥΡΓΙΑ ΜΑΘΗΜΑΤΟΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-emerald-400" /> Δημιουργία Νέου Μαθήματος
          </h3>
          <form onSubmit={handleAddCourse} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Τίτλος Μαθήματος *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="π.χ. Προχωρημένη Άλγεβρα" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Κατηγορία/Θέμα</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none">
                {["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Ιστορία", "Έκθεση"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Διάρκεια Κύκλου</label>
              <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="π.χ. 12 εβδομάδες" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Μέγιστες Θέσεις Τμήματος</label>
              <input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md">
              Αποθήκευση Μαθήματος
            </button>
          </form>
        </div>

      </div>
    </WorkspaceShell>
  );
}