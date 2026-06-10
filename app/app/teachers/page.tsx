"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { Users, UserPlus, Trash2, Clock } from "lucide-react";

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("Μαθηματικά");
  const [email, setEmail] = useState("");
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_teachers");
    if (stored) setTeachers(JSON.parse(stored));
  }, []);

  const toggleSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(slot) 
        ? daySlots.filter(s => s !== slot) 
        : [...daySlots, slot];
      return { ...prev, [day]: updated };
    });
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || Object.keys(availability).length === 0) {
      alert("⚠️ Συμπληρώστε όνομα και επιλέξτε τουλάχιστον μία ώρα διαθεσιμότητας!");
      return;
    }

    const newTeacher = { 
      id: `teacher-${Date.now()}`, 
      name, 
      specialty, 
      email, 
      availability // Αυτό το πεδίο διαβάζει ο Auto Scheduler
    };

    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
    setName(""); setAvailability({});
  };

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Ορισμός στοιχείων και ωραρίου διαθεσιμότητας (13:00-23:00).">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΛΙΣΤΑ */}
        <div className="lg:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-purple-400" /> Κατάλογος Καθηγητών</h3>
          <div className="space-y-3">
            {teachers.map(t => (
              <div key={t.id} className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-white font-bold text-xs">{t.name}</p>
                  <p className="text-[10px] text-purple-400">{t.specialty}</p>
                </div>
                <button onClick={() => {
                  const updated = teachers.filter(x => x.id !== t.id);
                  setTeachers(updated);
                  localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
                }} className="text-rose-500 hover:text-rose-400"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </div>

        {/* ΦΟΡΜΑ ΜΕ ΩΡΑΡΙΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4 text-indigo-400" /> Νέος Καθηγητής</h3>
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
              {["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Ιστορία", "Έκθεση"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> Επιλογή Ωραρίου (13:00 - 23:00)</label>
              <div className="h-64 overflow-y-auto pr-2 space-y-2">
                {AVAILABLE_DAYS.map(day => (
                  <div key={day} className="bg-[#0b0e14] p-2 rounded border border-slate-800">
                    <p className="text-[9px] font-bold text-blue-400 mb-1 uppercase">{day}</p>
                    <div className="grid grid-cols-5 gap-1">
                      {TIME_SLOTS.map(slot => (
                        <button key={slot} type="button" onClick={() => toggleSlot(day, slot)} className={`p-1 rounded text-[8px] font-mono transition ${availability[day]?.includes(slot) ? "bg-emerald-600 text-white font-bold" : "bg-slate-700 text-slate-400"}`}>
                          {slot.split(':')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl">Αποθήκευση στο Scheduler</button>
          </form>
        </div>
      </div>
    </WorkspaceShell>
  );
}