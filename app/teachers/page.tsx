"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Edit2, UserPlus, Plus, X, Lock, Clock } from "lucide-react";

interface LockedSlot { day: string; time: string; }
interface AvailabilitySlot { day: string; start: string; end: string; }

interface Teacher {
  id: string;
  name: string;
  subject: string;
  isLockedClass: boolean;
  assignedClassId: string | null;
  isLockedHours: boolean;
  lockedSlots: LockedSlot[];
  availability: AvailabilitySlot[]; // Νέο πεδίο
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<string[]>([]);
  
  // States για το Form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  
  const [isLockedClass, setIsLockedClass] = useState(false);
  const [assignedClassId, setAssignedClassId] = useState("");
  
  const [isLockedHours, setIsLockedHours] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<LockedSlot[]>([]);
  const [newSlot, setNewSlot] = useState<LockedSlot>({ day: "Δευτέρα", time: "" });

  // States για Διαθεσιμότητα
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [newAvail, setNewAvail] = useState<AvailabilitySlot>({ day: "Δευτέρα", start: "14:00", end: "15:00" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
    setClassesList(JSON.parse(localStorage.getItem("eduflow_classes") || "[]"));
    setLessonsList(JSON.parse(localStorage.getItem("eduflow_lessons") || "[]"));
  };

  const addSlot = () => {
    if (!newSlot.time) return;
    setLockedSlots([...lockedSlots, newSlot]);
    setNewSlot({ day: "Δευτέρα", time: "" });
  };

  const addAvailability = () => {
    // Validation: 14:00-23:00 Καθημερινές, 09:00-23:00 Σάββατο
    const startHour = parseInt(newAvail.start);
    const endHour = parseInt(newAvail.end);
    
    if (newAvail.day !== "Σάββατο" && startHour < 14) return alert("Τις καθημερινές το ωράριο ξεκινά από 14:00");
    if (newAvail.day === "Σάββατο" && startHour < 9) return alert("Το Σάββατο το ωράριο ξεκινά από 09:00");
    if (endHour > 23) return alert("Το ωράριο τελειώνει στις 23:00");

    setAvailability([...availability, newAvail]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const teacherData: Teacher = {
      id: editingId || `t-${Date.now()}`,
      name, subject, isLockedClass,
      assignedClassId: isLockedClass ? assignedClassId : null,
      isLockedHours,
      lockedSlots: isLockedHours ? lockedSlots : [],
      availability
    };

    const updated = editingId ? teachers.map(t => t.id === editingId ? teacherData : t) : [...teachers, teacherData];
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null); setName(""); setSubject(""); setIsLockedClass(false);
    setAssignedClassId(""); setIsLockedHours(false); setLockedSlots([]); setAvailability([]);
  };

  const startEdit = (t: Teacher) => {
    setEditingId(t.id); setName(t.name); setSubject(t.subject); setIsLockedClass(t.isLockedClass);
    setAssignedClassId(t.assignedClassId || ""); setIsLockedHours(t.isLockedHours);
    setLockedSlots(t.lockedSlots || []); setAvailability(t.availability || []);
  };

  // Helper για ώρες
  const timeOptions = Array.from({length: 15}, (_, i) => `${i + 9 < 10 ? '0' : ''}${i + 9}:00`);

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Ορισμός διαθεσιμότητας και δεσμεύσεις.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-700 pb-2">
              <UserPlus size={14} /> {editingId ? "Επεξεργασία Καθηγητή" : "Νέος Καθηγητής"}
            </h4>
            
            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white" />
            <select required value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white">
              <option value="">Επιλέξτε Μάθημα...</option>
              {lessonsList.map((l, i) => <option key={i} value={l}>{l}</option>)}
            </select>

            {/* ΔΙΑΘΕΣΙΜΟΤΗΤΑ (ΝΕΟ) */}
            <div className="bg-[#0b0e14] p-4 rounded-xl border border-indigo-500/20 space-y-2">
              <label className="text-xs font-bold text-indigo-400 flex items-center gap-2"><Clock size={12}/> Διαθεσιμότητα Ωρών</label>
              <div className="grid grid-cols-4 gap-2">
                <select className="bg-[#1e2330] text-xs p-2 rounded text-white" value={newAvail.day} onChange={e => setNewAvail({...newAvail, day: e.target.value})}>
                  {["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].map(d => <option key={d}>{d}</option>)}
                </select>
                <select className="bg-[#1e2330] text-xs p-2 rounded text-white" value={newAvail.start} onChange={e => setNewAvail({...newAvail, start: e.target.value})}>{timeOptions.map(t => <option key={t}>{t}</option>)}</select>
                <select className="bg-[#1e2330] text-xs p-2 rounded text-white" value={newAvail.end} onChange={e => setNewAvail({...newAvail, end: e.target.value})}>{timeOptions.map(t => <option key={t}>{t}</option>)}</select>
                <button type="button" onClick={addAvailability} className="bg-indigo-600 rounded text-white text-xs"><Plus size={16} className="mx-auto"/></button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {availability.map((a, i) => (
                  <span key={i} className="text-[10px] bg-[#1e2330] text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">
                    {a.day} {a.start}-{a.end} <button type="button" onClick={() => setAvailability(availability.filter((_,idx) => idx !== i))}><X size={10} className="inline ml-1"/></button>
                  </span>
                ))}
              </div>
            </div>

            {/* CHECKBOXES & LOCKED SLOTS (Υπάρχοντα) */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={isLockedClass} onChange={e => setIsLockedClass(e.target.checked)} className="accent-indigo-500" /> Κλείδωμα Τμήματος
                 </label>
                 {isLockedClass && (
                    <select value={assignedClassId} onChange={e => setAssignedClassId(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded-xl text-xs text-white">
                      <option value="">Επιλογή...</option>
                      {classesList.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                    </select>
                 )}
               </div>

               <div className="space-y-2">
                 <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={isLockedHours} onChange={e => setIsLockedHours(e.target.checked)} className="accent-rose-500" /> Κλείδωμα Ωρών (Busy)
                 </label>
               </div>
            </div>

            {isLockedHours && (
              <div className="bg-[#0b0e14] p-4 rounded-xl border border-rose-500/20 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <select className="bg-[#1e2330] text-xs p-2 rounded text-white" value={newSlot.day} onChange={e => setNewSlot({...newSlot, day: e.target.value})}>
                    {["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].map(d => <option key={d}>{d}</option>)}
                  </select>
                  <input className="bg-[#1e2330] text-xs p-2 rounded text-white" placeholder="Ώρα" value={newSlot.time} onChange={e => setNewSlot({...newSlot, time: e.target.value})} />
                  <button type="button" onClick={addSlot} className="bg-rose-600 rounded text-white text-xs"><Plus size={16} className="mx-auto"/></button>
                </div>
              </div>
            )}

            <button type="submit" className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500">
              {editingId ? "Αποθήκευση" : "Προσθήκη Καθηγητή"}
            </button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Καθηγητές ({teachers.length})</h3>
          <div className="space-y-2">
            {teachers.map(t => (
              <div key={t.id} className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800">
                <p className="text-white text-xs font-bold">{t.name}</p>
                <div className="flex gap-2 text-[10px] text-slate-500">
                   <span>{t.subject}</span>
                   {t.isLockedClass && <span className="bg-indigo-900/50 text-indigo-300 px-1 rounded">{t.assignedClassId}</span>}
                   <span>{t.availability.length} slots διαθεσιμότητας</span>
                </div>
                <div className="flex justify-end gap-1">
                  <button onClick={() => startEdit(t)} className="text-slate-500 hover:text-white p-2"><Edit2 size={12}/></button>
                  <button onClick={() => setTeachers(teachers.filter(x => x.id !== t.id))} className="text-slate-600 hover:text-rose-500 p-2"><Trash2 size={12}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}