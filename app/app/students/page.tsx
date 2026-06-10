"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { UserPlus, Trash2, Users, BookOpen } from "lucide-react";

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  
  // Φόρμα State
  const [name, setName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  // 1. Φόρτωση από localStorage
  useEffect(() => {
    const stored = localStorage.getItem("eduflow_students");
    if (stored) {
      setStudents(JSON.parse(stored));
    }
  }, []);

  // 2. Συνάρτηση Αποθήκευσης (ΕΝΗΜΕΡΩΝΕΙ ΚΑΙ ΤΟ UI ΚΑΙ ΤΗ ΒΑΣΗ)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || courses.length === 0) {
      alert("⚠️ Συμπλήρωσε όνομα και επίλεξε τουλάχιστον ένα μάθημα!");
      return;
    }

    const newStudent = {
      id: `student-${Date.now()}`,
      name,
      studentPhone,
      parentName,
      parentPhone,
      parentEmail,
      courses,
      availability
    };

    const updatedList = [...students, newStudent];
    
    // ΑΠΑΡΑΙΤΗΤΟ: Ενημερώνουμε το state για να εμφανιστεί αμέσως στη λίστα
    setStudents(updatedList);
    // ΑΠΑΡΑΙΤΗΤΟ: Αποθηκεύουμε για τον Scheduler
    localStorage.setItem("eduflow_students", JSON.stringify(updatedList));

    alert("✅ Ο μαθητής προστέθηκε και είναι έτοιμος για τον Scheduler!");
    
    // Καθαρισμός
    setName(""); setCourses([]); setAvailability({});
  };

  const handleDelete = (id: string) => {
    const updatedList = students.filter(s => s.id !== id);
    setStudents(updatedList);
    localStorage.setItem("eduflow_students", JSON.stringify(updatedList));
  };

  return (
    <WorkspaceShell title="Διαχείριση & Λίστα Μαθητών" description="Εγγραφές μαθητών που συγχρονίζονται απευθείας με τον Scheduler.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 pb-20">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2"><UserPlus className="w-4 h-4 text-blue-400" /> Νέα Εγγραφή</h3>
          <form onSubmit={handleRegister} className="space-y-3">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο Μαθητή *" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Ονοματεπώνυμο Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            
            <div className="grid grid-cols-2 gap-2">
                <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="Email *" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
                <input type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="Τηλ. Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition">Αποθήκευση & Σύνδεση με Scheduler</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ ΠΟΥ ΔΕΝ ΕΜΦΑΝΙΖΟΤΑΝ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> Κατάλογος ({students.length} μαθητές)</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {students.length === 0 ? <p className="text-slate-500 text-xs italic">Δεν υπάρχουν μαθητές στη λίστα.</p> : 
            students.map(s => (
              <div key={s.id} className="bg-[#0b0e14] border border-slate-800 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-white font-bold text-xs">{s.name}</p>
                  <p className="text-slate-500 text-[9px]">{s.parentEmail}</p>
                </div>
                <button onClick={() => handleDelete(s.id)} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}