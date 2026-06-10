"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { UserPlus, Trash2, Users, GraduationCap } from "lucide-react";

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  
  // States Φόρμας
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState(""); // Η Τάξη/Τμήμα
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    setTeachers(stored);
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
    if (!name || !subject || !grade) {
      alert("⚠️ Πρέπει να συμπληρώσεις Ονοματεπώνυμο, Μάθημα και Τάξη!");
      return;
    }

    const newTeacher = { 
        id: `t-${Date.now()}`, 
        name, 
        subject, 
        grade, // Αποθήκευση τάξης
        availability 
    };
    
    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
    
    alert("✅ Ο καθηγητής καταχωρήθηκε επιτυχώς!");
    setName(""); setSubject(""); setGrade(""); setAvailability({});
  };

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Καταχώρηση καθηγητών με μαθήματα, τάξεις και διαθεσιμότητα.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 pb-20">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4 text-blue-400" /> Νέος Καθηγητής</h3>
          <form onSubmit={handleSave} className="space-y-3">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο *" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <div className="grid grid-cols-2 gap-2">
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Μάθημα (π.χ. Φυσική) *" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
                <input type="text" value={grade} onChange={e => setGrade(e.target.value)} placeholder="Τάξη (π.χ. Β' Λυκείου) *" className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            </div>
            
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Διαθεσιμότητα (Ωράριο 13:00-23:00)</p>
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
            <button className="w-full bg-indigo-600 p-3 rounded-xl text-white font-bold text-xs">Αποθήκευση Καθηγητή</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> Καταχωρημένοι ({teachers.length})</h3>
          <div className="space-y-2">
            {teachers.map(t => (
              <div key={t.id} className="bg-[#0b0e14] p-3 rounded border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-white font-bold text-xs">{t.name}</p>
                  <p className="text-indigo-400 font-bold text-[9px]">{t.subject} • {t.grade}</p>
                </div>
                <button onClick={() => {
                    const filtered = teachers.filter(x => x.id !== t.id);
                    setTeachers(filtered);
                    localStorage.setItem("eduflow_teachers", JSON.stringify(filtered));
                }} className="text-rose-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}