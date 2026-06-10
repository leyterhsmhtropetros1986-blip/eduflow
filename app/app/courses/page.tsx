"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { BookOpen, Plus, Trash2, Save } from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");
  const [duration, setDuration] = useState("12 εβδομάδες");
  const [seats, setSeats] = useState(10);

  // Φόρτωση από το localStorage κατά το άνοιγμα της σελίδας
  useEffect(() => {
    const stored = localStorage.getItem("eduflow_courses");
    if (stored) {
      setCourses(JSON.parse(stored));
    } else {
      // Αρχικά δεδομένα αν είναι άδεια η βάση
      const defaults = [
        { id: "1", title: "Εφαρμοσμένα Μαθηματικά", subject: "Μαθηματικά", teacher: "Ελένη Παπαδοπούλου", duration: "12 εβδομάδες", seats: 10 },
        { id: "2", title: "Προχωρημένη Φυσική", subject: "Φυσική", teacher: "Κωνσταντίνος Βασιλείου", duration: "10 εβδομάδες", seats: 8 }
      ];
      setCourses(defaults);
      localStorage.setItem("eduflow_courses", JSON.stringify(defaults));
    }
  }, []);

  // Προσθήκη Νέου Μαθήματος
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject) return;

    const newCourse = {
      id: Date.now().toString(),
      title,
      subject,
      teacher: teacher || "Μη ορισμένος καθηγητής",
      duration,
      seats: Number(seats)
    };

    const updated = [...courses, newCourse];
    setCourses(updated);
    localStorage.setItem("eduflow_courses", JSON.stringify(updated));

    // Καθαρισμός Φόρμας
    setTitle("");
    setSubject("");
    setTeacher("");
  };

  // Διαγραφή Μαθήματος
  const handleDelete = (id: string) => {
    const updated = courses.filter(c => c.id !== id);
    setCourses(updated);
    localStorage.setItem("eduflow_courses", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell title="Μαθήματα" description="Οργάνωση μαθημάτων φροντιστηρίου, διαχείριση θέσεων και ανάθεση σε καθηγητές.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΠΙΝΑΚΑΣ ΜΑΘΗΜΑΤΩΝ */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" /> Διαθέσιμα Μαθήματα
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Τίτλος</th>
                  <th className="pb-3">Θέμα</th>
                  <th className="pb-3">Καθηγητής</th>
                  <th className="pb-3">Διάρκεια</th>
                  <th className="pb-3">Θέσεις</th>
                  <th className="pb-3 text-right">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-800/20">
                    <td className="py-3 font-semibold text-white">{course.title}</td>
                    <td className="py-3 text-indigo-400 font-medium">{course.subject}</td>
                    <td className="py-3 text-slate-400">{course.teacher}</td>
                    <td className="py-3">{course.duration}</td>
                    <td className="py-3 font-mono font-bold text-amber-400">{course.seats}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDelete(course.id)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ΦΟΡΜΑ ΠΡΟΣΘΗΚΗΣ */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-400" /> Δημιουργία Μαθήματος
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Τίτλος Μαθήματος *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="π.χ. Προχωρημένη Άλγεβρα" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Θέμα (Κατηγορία) *</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="π.χ. Μαθηματικά" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Ονοματεπώνυμο Καθηγητή</label>
              <input type="text" value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="π.χ. Ελένη Παπαδοπούλου" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Διάρκεια</label>
                <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Μέγιστες Θέσεις</label>
                <input type="number" value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5">
              <Save className="w-4 h-4" /> Αποθήκευση μαθήματος
            </button>
          </form>
        </div>

      </div>
    </WorkspaceShell>
  );
}