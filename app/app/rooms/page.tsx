"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, BookOpen } from "lucide-react";

interface ScheduleSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
}

interface SchoolClass {
  id: string;
  name: string;
  schedule: ScheduleSlot[];
}

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];

export default function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [className, setClassName] = useState("");
  
  // States για το προσωρινό μάθημα που προσθέτουμε στην τάξη
  const [currentSchedule, setCurrentSchedule] = useState<ScheduleSlot[]>([]);
  const [newDay, setNewDay] = useState(AVAILABLE_DAYS[0]);
  const [newTime, setNewTime] = useState(TIME_SLOTS[0]);
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_classes");
    if (stored) setClasses(JSON.parse(stored));
  }, []);

  const addSlot = () => {
    if (!newSubject) return alert("Γράψε το όνομα του μαθήματος!");
    const newEntry: ScheduleSlot = { id: Date.now().toString(), day: newDay, time: newTime, subject: newSubject };
    setCurrentSchedule([...currentSchedule, newEntry]);
    setNewSubject("");
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || currentSchedule.length === 0) return alert("Δώσε όνομα τάξης και πρόσθεσε τουλάχιστον ένα μάθημα!");

    const newClass: SchoolClass = { id: `c-${Date.now()}`, name: className, schedule: currentSchedule };
    const updated = [...classes, newClass];
    setClasses(updated);
    localStorage.setItem("eduflow_classes", JSON.stringify(updated));
    
    // Reset
    setClassName(""); setCurrentSchedule([]);
  };

  const handleDelete = (id: string) => {
    const filtered = classes.filter(c => c.id !== id);
    setClasses(filtered);
    localStorage.setItem("eduflow_classes", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Τάξεων" description="Οργάνωσε τάξεις και το πρόγραμμα μαθημάτων τους.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ ΔΗΜΙΟΥΡΓΙΑΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSaveClass} className="space-y-4">
            <input type="text" value={className} onChange={e => setClassName(e.target.value)} placeholder="π.χ. Α' Γυμνασίου" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            
            {/* Προσθήκη Μαθήματος */}
            <div className="p-3 bg-[#0b0e14] rounded-xl border border-slate-800 space-y-2">
              <p className="text-[10px] font-bold text-slate-400">Προσθήκη Μαθήματος στο Πρόγραμμα</p>
              <div className="grid grid-cols-1 gap-2">
                <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Όνομα Μαθήματος (π.χ. Φυσική)" className="w-full bg-[#1e2330] border border-slate-800 p-2 rounded text-xs text-white" />
                <div className="flex gap-2">
                  <select value={newDay} onChange={e => setNewDay(e.target.value)} className="w-full bg-[#1e2330] border border-slate-800 p-2 rounded text-xs text-white">{AVAILABLE_DAYS.map(d => <option key={d}>{d}</option>)}</select>
                  <select value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full bg-[#1e2330] border border-slate-800 p-2 rounded text-xs text-white">{TIME_SLOTS.map(t => <option key={t}>{t}</option>)}</select>
                  <button type="button" onClick={addSlot} className="bg-emerald-600 p-2 rounded text-white"><Plus className="w-4 h-4"/></button>
                </div>
              </div>
            </div>

            {/* Λίστα προσωρινών μαθημάτων */}
            <div className="space-y-1">
              {currentSchedule.map(s => (
                <div key={s.id} className="text-[10px] text-emerald-400 flex justify-between">
                  <span>{s.day} {s.time} - {s.subject}</span>
                </div>
              ))}
            </div>

            <button className="w-full bg-emerald-600 hover:bg-emerald-500 p-3 rounded-xl text-white font-bold text-xs">Αποθήκευση Τάξης</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ ΤΑΞΕΩΝ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Τάξεις ({classes.length})</h3>
          {classes.map(c => (
            <div key={c.id} className="bg-[#0b0e14] mb-3 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-emerald-400 font-bold text-sm">{c.name}</h4>
                <button onClick={() => handleDelete(c.id)} className="text-rose-500"><Trash2 className="w-4 h-4"/></button>
              </div>
              <div className="space-y-1">
                {c.schedule.map(s => (
                  <div key={s.id} className="flex items-center gap-2 text-[10px] text-slate-300 bg-[#1e2330] p-1 rounded">
                    <BookOpen className="w-3 h-3 text-emerald-600"/>
                    <span>{s.day} | {s.time} | <strong>{s.subject}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}