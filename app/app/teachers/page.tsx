"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2 } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  classes: string[];
  availability: Record<string, string[]>;
}

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];
const ALL_CLASSES = ["Α' Γυμνασίου", "Β' Γυμνασίου", "Γ' Γυμνασίου", "Α' Λυκείου", "Β' Λυκείου", "Γ' Λυκείου"];
const SUBJECTS = ["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Πληροφορική", "Αγγλικά"];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_teachers");
    if (stored) setTeachers(JSON.parse(stored));
  }, []);

  const toggleClass = (className: string) => {
    setSelectedClasses(prev => 
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const toggleSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(slot) ? daySlots.filter(s => s !== slot) : [...daySlots, slot];
      return { ...prev, [day]: updated };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject || selectedClasses.length === 0) return alert("⚠️ Συμπλήρωσε Όνομα, Μάθημα και τουλάχιστον μία τάξη!");

    const newTeacher: Teacher = {
      id: `t-${Date.now()}`,
      name,
      subject,
      classes: selectedClasses,
      availability
    };

    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));

    // Reset Form
    setName(""); setSubject(""); setSelectedClasses([]); setAvailability({});
  };

  const handleDelete = (id: string) => {
    const filtered = teachers.filter(t => t.id !== id);
    setTeachers(filtered);
    localStorage.setItem("eduflow_teachers", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Όρισε καθηγητές, τάξεις και διαθεσιμότητα.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-4">
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο Καθηγητή" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            
            {/* Dropdown Μαθήματος */}
            <select required value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
              <option value="">Επιλέξτε Μάθημα</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Multiselect Τάξεων */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400">Επιλογή Τάξεων (Multiselect)</p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_CLASSES.map(cls => (
                  <button 
                    type="button" 
                    key={cls} 
                    onClick={() => toggleClass(cls)}
                    className={`p-2 rounded text-[10px] border ${selectedClasses.includes(cls) ? "bg-purple-600 border-purple-500 text-white" : "bg-[#0b0e14] border-slate-800 text-slate-500"}`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Διαθεσιμότητα */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-400">Διαθεσιμότητα</p>
              {AVAILABLE_DAYS.map(day => (
                <div key={day} className="flex gap-2 items-center">
                  <span className="w-16 text-[9px] text-slate-500 font-bold">{day}</span>
                  <div className="grid grid-cols-5 gap-1 flex-1">
                    {TIME_SLOTS.map(slot => (
                      <button type="button" key={slot} onClick={() => toggleSlot(day, slot)} className={`p-1 rounded text-[8px] ${availability[day]?.includes(slot) ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-500"}`}>{slot.split('-')[0]}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-500 p-3 rounded-xl text-white font-bold text-xs">Αποθήκευση Καθηγητή</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Καθηγητές ({teachers.length})</h3>
          <div className="space-y-2">
            {teachers.map(t => (
              <div key={t.id} className="bg-[#0b0e14] p-3 rounded border border-slate-800 flex justify-between items-center">
                <div className="text-xs">
                  <p className="text-white font-bold">{t.name}</p>
                  <p className="text-purple-400 text-[10px]">Μάθημα: {t.subject} | Τάξεις: {t.classes.join(", ")}</p>
                </div>
                <button onClick={() => handleDelete(t.id)} className="text-rose-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}