"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { UserPlus, Trash2, Users, Clock } from "lucide-react";

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];
const COURSE_LIST = ["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Ιστορία", "Έκθεση"];

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  
  // States Φόρμας
  const [name, setName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    setStudents(stored);
  }, []);

  const toggleCourse = (c: string) => setSelectedCourses(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  
  const toggleSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(slot) ? daySlots.filter(s => s !== slot) : [...daySlots, slot];
      return { ...prev, [day]: updated };
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !parentEmail || selectedCourses.length === 0) {
      alert("⚠️ Συμπλήρωσε όλα τα υποχρεωτικά πεδία και διάλεξε μαθήματα!");
      return;
    }

    const newStudent = { id: `s-${Date.now()}`, name, studentPhone, parentName, parentPhone, parentEmail, courses: selectedCourses, availability };
    const updated = [...students, newStudent];
    
    setStudents(updated);
    localStorage.setItem("eduflow_students", JSON.stringify(updated));
    alert("✅ Μαθητής αποθηκεύτηκε!");
    // Reset φόρμας
    setName(""); setStudentPhone(""); setParentName(""); setParentPhone(""); setParentEmail(""); setSelectedCourses([]); setAvailability({});
  };

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών" description="Πλήρης εγγραφή και λίστα για τον Scheduler.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 pb-20">
        
        {/* ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Όνομα Μαθητή *" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
              <input type="tel" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} placeholder="Κινητό Μαθητή" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            </div>
            <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Όνομα Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <div className="grid grid-cols-2 gap-2">
              <input type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="Κινητό Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
              <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="Email Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            </div>

            {/* Μαθήματα */}
            <div className="flex flex-wrap gap-2">
              {COURSE_LIST.map(c => (
                <button type="button" key={c} onClick={() => toggleCourse(c)} className={`px-2 py-1 text-[9px] rounded ${selectedCourses.includes(c) ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"}`}>{c}</button>
              ))}
            </div>

            {/* Διαθεσιμότητα */}
            <div className="max-h-60 overflow-y-auto space-y-2 border-t border-slate-800 pt-2">
              {AVAILABLE_DAYS.map(day => (
                <div key={day} className="flex gap-2 items-center">
                  <span className="w-16 text-[9px] text-slate-500 font-bold">{day}</span>
                  <div className="grid grid-cols-5 gap-1 flex-1">
                    {TIME_SLOTS.map(slot => (
                      <button type="button" key={slot} onClick={() => toggleSlot(day, slot)} className={`p-1 rounded text-[8px] ${availability[day]?.includes(slot) ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-500"}`}>{slot.split('-')[0]}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 p-3 rounded-xl text-white font-bold text-xs">Αποθήκευση</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Εγγεγραμμένοι Μαθητές</h3>
          <div className="space-y-2">
            {students.map(s => (
              <div key={s.id} className="bg-[#0b0e14] p-3 rounded border border-slate-800 flex justify-between items-center">
                <div className="text-xs">
                  <p className="text-white font-bold">{s.name}</p>
                  <p className="text-slate-400 text-[9px]">{s.courses?.join(', ')}</p>
                </div>
                <button onClick={() => {
                  const filtered = students.filter(x => x.id !== s.id);
                  setStudents(filtered);
                  localStorage.setItem("eduflow_students", JSON.stringify(filtered));
                }} className="text-rose-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}