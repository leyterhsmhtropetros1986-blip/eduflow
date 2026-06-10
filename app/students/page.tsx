"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  grade: string;
  course: string;
  groupSize: number;
  studentPhone: string;
  parentPhone: string;
  parentEmail: string;
  availability: Record<string, string[]>;
}

// Κρατάμε μόνο τις σταθερές που δεν αλλάζουν (Μέρες, Ώρες, Τάξεις)
const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];
const GRADES = ["Α' Γυμνασίου", "Β' Γυμνασίου", "Γ' Γυμνασίου", "Α' Λυκείου", "Β' Λυκείου", "Γ' Λυκείου"];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classesList, setClassesList] = useState<{name: string}[]>([]); // ΝΕΟ: Λίστα Τμημάτων
  
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [course, setCourse] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Φόρτωση Μαθητών
    const storedStudents = localStorage.getItem("eduflow_students");
    if (storedStudents) setStudents(JSON.parse(storedStudents));
    
    // Φόρτωση Τμημάτων από το localStorage
    const storedClasses = localStorage.getItem("eduflow_classes");
    if (storedClasses) setClassesList(JSON.parse(storedClasses));
  }, []);

  const toggleSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(slot) ? daySlots.filter(s => s !== slot) : [...daySlots, slot];
      return { ...prev, [day]: updated };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newStudent: Student = {
      id: `s-${Date.now()}`,
      name,
      grade,
      course,
      groupSize: parseInt(groupSize),
      studentPhone,
      parentPhone,
      parentEmail,
      availability
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem("eduflow_students", JSON.stringify(updated));

    setName(""); setGrade(""); setCourse(""); setGroupSize(""); 
    setStudentPhone(""); setParentPhone(""); setParentEmail(""); setAvailability({});
  };

  const handleDelete = (id: string) => {
    const filtered = students.filter(s => s.id !== id);
    setStudents(filtered);
    localStorage.setItem("eduflow_students", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών" description="Καταχώρηση μαθητών και διαθεσιμότητας.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-4">
            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο Μαθητή" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            
            <div className="grid grid-cols-2 gap-2">
              <select required value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
                <option value="">Τάξη</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>

              {/* ΔΥΝΑΜΙΚΗ ΛΙΣΤΑ ΤΜΗΜΑΤΩΝ */}
              <select required value={course} onChange={e => setCourse(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
                <option value="">Επίλεξε Τμήμα</option>
                {classesList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <select required value={groupSize} onChange={e => setGroupSize(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
              <option value="">Άτομα στο τμήμα</option>
              {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} άτομα</option>)}
            </select>

            {/* Επικοινωνία */}
            <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-800">
              <input required type="tel" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} placeholder="Τηλέφωνο Μαθητή" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
              <input required type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="Τηλέφωνο Γονέα" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
              <input required type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="Email Γονέα" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            </div>
            
            {/* Διαθεσιμότητα */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Διαθεσιμότητα</p>
              {AVAILABLE_DAYS.map(day => (
                <div key={day} className="flex gap-2 items-center">
                  <span className="w-16 text-[9px] text-slate-500 font-bold">{day}</span>
                  <div className="grid grid-cols-5 gap-1 flex-1">
                    {TIME_SLOTS.map(slot => (
                      <button type="button" key={slot} onClick={() => toggleSlot(day, slot)} className={`p-1 rounded text-[8px] ${availability[day]?.includes(slot) ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500"}`}>{slot.split('-')[0]}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl text-white font-bold text-xs mt-4">Αποθήκευση Μαθητή</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Μαθητές ({students.length})</h3>
          <div className="space-y-2">
            {students.map(s => (
              <div key={s.id} className="bg-[#0b0e14] p-3 rounded border border-slate-800 flex justify-between items-start">
                <div className="text-xs">
                  <p className="text-white font-bold">{s.name}</p>
                  <p className="text-slate-400 text-[10px]">{s.grade} • {s.course} • {s.groupSize} άτομα</p>
                  <p className="text-indigo-400 text-[10px] mt-1 italic">Τηλ: {s.studentPhone} | Γονέας: {s.parentPhone} | {s.parentEmail}</p>
                </div>
                <button onClick={() => handleDelete(s.id)} className="text-rose-500 hover:bg-rose-950 p-1 rounded transition"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}