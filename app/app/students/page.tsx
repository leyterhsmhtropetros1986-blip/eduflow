"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { UserPlus, Bell, Clock, Trash2, Users } from "lucide-react";

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]); // ΕΔΩ ΑΠΟΘΗΚΕΥΟΝΤΑΙ ΟΙ ΜΑΘΗΤΕΣ ΓΙΑ ΤΗ ΛΙΣΤΑ
  
  // States Φόρμας
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  // Φόρτωση λίστας κατά το άνοιγμα
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    setStudents(stored);
  }, []);

  const toggleCourse = (course: string) => {
    setSelectedCourses(prev => prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]);
  };

  const toggleTimeSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const updatedSlots = daySlots.includes(slot) ? daySlots.filter(s => s !== slot) : [...daySlots, slot];
      return { ...prev, [day]: updatedSlots };
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return alert("Συμπληρώστε όνομα μαθητή!");

    const newStudent = { id: `student-${Date.now()}`, name: studentName, studentPhone, parentName, parentPhone, parentEmail, courses: selectedCourses, availability };
    
    // Ανανέωση Λίστας
    const updatedList = [...students, newStudent];
    setStudents(updatedList);
    localStorage.setItem("eduflow_students", JSON.stringify(updatedList));

    // Reset φόρμας
    setStudentName(""); setSelectedCourses([]); setAvailability({});
  };

  const handleDelete = (id: string) => {
    const filtered = students.filter(s => s.id !== id);
    setStudents(filtered);
    localStorage.setItem("eduflow_students", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών" description="Εγγραφή νέων μαθητών και προβολή λίστας.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4 text-blue-400" /> Νέα Εγγραφή</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Ονοματεπώνυμο Μαθητή *" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <input type="tel" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} placeholder="Κινητό Μαθητή" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl">Αποθήκευση & Προσθήκη στη Λίστα</button>
          </form>
        </div>

        {/* ΔΕΞΙΑ: ΛΙΣΤΑ ΜΑΘΗΤΩΝ (ΕΔΩ ΕΙΝΑΙ ΤΟ ΖΗΤΟΥΜΕΝΟ) */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> Κατάλογος Μαθητών ({students.length})</h3>
          <div className="space-y-3">
            {students.map(s => (
              <div key={s.id} className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-white font-bold text-xs">{s.name}</p>
                  <p className="text-[10px] text-slate-500">{s.studentPhone}</p>
                </div>
                <button onClick={() => handleDelete(s.id)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}