"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { Users, Trash2 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  groupSize: number;
  courses: string[];
  availability: Record<string, string[]>;
}

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [coursesInput, setCoursesInput] = useState(""); // π.χ. "Μαθηματικά, Φυσική"
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_students");
    if (stored) setStudents(JSON.parse(stored));
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
    if (!name || !groupSize || !coursesInput) return alert("⚠️ Συμπλήρωσε όλα τα πεδία!");

    const newStudent: Student = {
      id: `s-${Date.now()}`,
      name,
      groupSize: parseInt(groupSize),
      courses: coursesInput.split(',').map(c => c.trim()),
      availability
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem("eduflow_students", JSON.stringify(updated));

    // Reset Form
    setName(""); setGroupSize(""); setCoursesInput(""); setAvailability({});
  };

  const handleDelete = (id: string) => {
    const filtered = students.filter(s => s.id !== id);
    setStudents(filtered);
    localStorage.setItem("eduflow_students", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών" description="Όρισε τα μαθήματα και τη διαθεσιμότητα των μαθητών.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο Μαθητή" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <input type="number" value={groupSize} onChange={e => setGroupSize(e.target.value)} placeholder="Άτομα στην ομάδα (π.χ. 5)" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <input type="text" value={coursesInput} onChange={e => setCoursesInput(e.target.value)} placeholder="Μαθήματα (με κόμμα, π.χ. Μαθηματικά, Φυσική)" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-400">Διαθεσιμότητα Μαθητή</p>
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
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl text-white font-bold text-xs">Αποθήκευση Μαθητή</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Μαθητές ({students.length})</h3>
          <div className="space-y-2">
            {students.map(s => (
              <div key={s.id} className="bg-[#0b0e14] p-3 rounded border border-slate-800 flex justify-between items-center">
                <div className="text-xs">
                  <p className="text-white font-bold">{s.name}</p>
                  <p className="text-indigo-400 text-[10px]">Ομάδα: {s.groupSize} άτομα | Μαθήματα: {s.courses.join(", ")}</p>
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