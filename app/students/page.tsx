"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  grade: string;
  subject: string;
  course: string;
  groupSize: number;
  studentPhone: string;
  parentPhone: string;
  parentEmail: string;
  availability: Record<string, string[]>;
}

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const GRADES = ["Α' Γυμνασίου", "Β' Γυμνασίου", "Γ' Γυμνασίου", "Α' Λυκείου", "Β' Λυκείου", "Γ' Λυκείου"];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classesList, setClassesList] = useState<{name: string}[]>([]);
  const [coursesList, setCoursesList] = useState<string[]>([]);
  
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  useEffect(() => {
    // Φόρτωση δεδομένων από το localStorage
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
    setClassesList(JSON.parse(localStorage.getItem("eduflow_classes") || "[]"));
    setCoursesList(JSON.parse(localStorage.getItem("eduflow_courses") || "[]"));
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
      name, grade, subject, course,
      groupSize: parseInt(groupSize) || 1,
      studentPhone, parentPhone, parentEmail, availability
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem("eduflow_students", JSON.stringify(updated));
    
    // Reset φόρμας
    setName(""); setGrade(""); setSubject(""); setCourse(""); setGroupSize("");
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
            
            <div className="grid grid-cols-3 gap-2">
              <select required value={grade} onChange={e => setGrade(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
                <option value="">Τάξη</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>

              <select required value={subject} onChange={e => setSubject(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
                <option value="">Μάθημα</option>
                {coursesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select required value={course} onChange={e => setCourse(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
                <option value="">Τμήμα</option>
                {classesList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <input required type="text" value={groupSize} onChange={e => setGroupSize(e.target.value)} placeholder="Αριθμός ατόμων (π.χ. 1)" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <input type="tel" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} placeholder="Τηλ. Μαθητή" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
              <input type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="Τηλ. Γονέα" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
              <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="Email Γονέα" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            </div>
            
            {/* Διαθεσιμότητα */}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 mb-2">ΔΙΑΘΕΣΙΜΟΤΗΤΑ</p>
              {AVAILABLE_DAYS.map(day => (
                <div key={day} className="flex gap-2 items-center mb-1">
                  <span className="w-16 text-[9px] text-slate-500 font-bold">{day}</span>
                  <div className="grid grid-cols-4 gap-1 flex-1">
                    {TIME_SLOTS.map(slot => (
                      <button type="button" key={slot} onClick={() => toggleSlot(day, slot)} className={`p-1 rounded text-[8px] ${availability[day]?.includes(slot) ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>{slot}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl text-white font-bold text-xs mt-2">Αποθήκευση Μαθητή</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Μαθητές ({students.length})</h3>
          <div className="space-y-2">
            {students.map(s => (
              <div key={s.id} className="bg-[#0b0e14] p-3 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-white text-xs font-bold">{s.name}</p>
                  <p className="text-slate-400 text-[10px]">{s.grade} • {s.subject} • {s.course}</p>
                </div>
                <button onClick={() => handleDelete(s.id)} className="text-rose-500 hover:text-rose-400 p-2"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}