"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { UserPlus, Clock, Trash2, Users } from "lucide-react";

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  
  // States Φόρμας
  const [name, setName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    setStudents(stored);
  }, []);

  const toggleCourse = (c: string) => setCourses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const toggleSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(slot) ? daySlots.filter(s => s !== slot) : [...daySlots, slot];
      return { ...prev, [day]: updated };
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name || !studentPhone || !parentName || !parentPhone || !parentEmail || courses.length === 0) {
      alert("⚠️ ΠΡΟΣΟΧΗ: Συμπλήρωσε όλα τα πεδία και επίλεξε τουλάχιστον ένα μάθημα!");
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
      availability // ΑΥΤΟ ΕΙΝΑΙ ΤΟ ΚΛΕΙΔΙ ΓΙΑ ΤΟΝ SCHEDULER
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem("eduflow_students", JSON.stringify(updated));
    
    // Reset
    setName(""); setStudentPhone(""); setParentName(""); setParentPhone(""); setParentEmail(""); setCourses([]); setAvailability({});
    alert("✅ Ο μαθητής αποθηκεύτηκε και συνδέθηκε στον Scheduler!");
  };

  const handleDelete = (id: string) => {
    const filtered = students.filter(s => s.id !== id);
    setStudents(filtered);
    localStorage.setItem("eduflow_students", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Εγγραφή & Λίστα Μαθητών" description="Καταγραφή μαθητή με πλήρη στοιχεία γονέα και διαθεσιμότητα 13:00-23:00.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 pb-20">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Όνομα Μαθητή *" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
              <input type="tel" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} placeholder="Κινητό Μαθητή *" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            </div>
            <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Όνομα Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <div className="grid grid-cols-2 gap-2">
              <input type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="Κινητό Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
              <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="Email Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            </div>

            {/* Διαθεσιμότητα */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400">Διαθεσιμότητα (13:00-23:00)</p>
              {AVAILABLE_DAYS.map(day => (
                <div key={day} className="flex gap-2 items-center">
                  <span className="w-16 text-[9px] font-bold text-slate-500">{day}</span>
                  <div className="grid grid-cols-5 gap-1">
                    {TIME_SLOTS.map(slot => (
                      <button type="button" key={slot} onClick={() => toggleSlot(day, slot)} className={`p-1 rounded text-[8px] ${availability[day]?.includes(slot) ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-500"}`}>{slot.split(':')[0]}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="w-full bg-indigo-600 p-3 rounded-xl text-white font-bold text-xs">Αποθήκευση Μαθητή</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4">Εγγεγραμμένοι Μαθητές ({students.length})</h3>
          <div className="space-y-2">
            {students.map(s => (
              <div key={s.id} className="bg-[#0b0e14] p-3 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">{s.name}</p>
                  <p className="text-[9px] text-slate-400">Γονέας: {s.parentName} | Email: {s.parentEmail}</p>
                </div>
                <button onClick={() => handleDelete(s.id)} className="text-rose-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}