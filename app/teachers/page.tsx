"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Edit2, UserPlus, Plus, X, Lock } from "lucide-react";

interface LockedSlot {
  day: string;
  time: string;
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
  isLockedClass: boolean;
  assignedClassId: string | null;
  isLockedHours: boolean;
  lockedSlots: LockedSlot[];
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

  const removeSlot = (index: number) => {
    setLockedSlots(lockedSlots.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const teacherData: Teacher = {
      id: editingId || `t-${Date.now()}`,
      name,
      subject,
      isLockedClass,
      assignedClassId: isLockedClass ? assignedClassId : null,
      isLockedHours,
      lockedSlots: isLockedHours ? lockedSlots : []
    };

    const updated = editingId 
      ? teachers.map(t => t.id === editingId ? teacherData : t)
      : [...teachers, teacherData];

    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSubject("");
    setIsLockedClass(false);
    setAssignedClassId("");
    setIsLockedHours(false);
    setLockedSlots([]);
  };

  const startEdit = (t: Teacher) => {
    setEditingId(t.id);
    setName(t.name);
    setSubject(t.subject);
    setIsLockedClass(t.isLockedClass);
    setAssignedClassId(t.assignedClassId || "");
    setIsLockedHours(t.isLockedHours);
    setLockedSlots(t.lockedSlots || []);
  };

  const handleDelete = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Ορισμός καθηγητών και προαιρετικές δεσμεύσεις.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-indigo-400 font-bold text-xs flex items-center gap-2">
              <UserPlus size={14} /> {editingId ? "ΕΠΕΞΕΡΓΑΣΙΑ" : "ΝΕΟΣ ΚΑΘΗΓΗΤΗΣ"}
            </h4>
            
            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white" />
            
            <select required value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white">
              <option value="">Επιλέξτε Μάθημα...</option>
              {lessonsList.map((l, i) => <option key={i} value={l}>{l}</option>)}
            </select>

            {/* CHECKBOXES */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={isLockedClass} onChange={e => setIsLockedClass(e.target.checked)} className="accent-indigo-500" />
                    Κλείδωμα Τμήματος
                 </label>
                 {isLockedClass && (
                   <select required={isLockedClass} value={assignedClassId} onChange={e => setAssignedClassId(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded-xl text-xs text-white">
                     <option value="">Επιλογή Τμήματος...</option>
                     {classesList.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                   </select>
                 )}
               </div>

               <div className="space-y-2">
                 <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={isLockedHours} onChange={e => setIsLockedHours(e.target.checked)} className="accent-rose-500" />
                    Κλείδωμα Ωρών
                 </label>
               </div>
            </div>

            {/* ΔΕΣΜΕΥΣΗ ΩΡΩΝ */}
            {isLockedHours && (
              <div className="bg-[#0b0e14] p-4 rounded-xl border border-rose-500/20 space-y-3">
                <label className="text-xs font-bold text-rose-400 flex items-center gap-2"><Lock size={12}/> Δεσμευμένες Ώρες</label>
                
                <div className="grid grid-cols-3 gap-2">
                  <select className="bg-[#1e2330] text-xs p-2 rounded text-white" value={newSlot.day} onChange={e => setNewSlot({...newSlot, day: e.target.value})}>
                    {["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].map(d => <option key={d}>{d}</option>)}
                  </select>
                  <input className="bg-[#1e2330] text-xs p-2 rounded text-white" placeholder="Ώρα (π.χ. 19-21)" value={newSlot.time} onChange={e => setNewSlot({...newSlot, time: e.target.value})} />
                  <button type="button" onClick={addSlot} className="bg-rose-600 rounded text-white text-xs"><Plus size={16} className="mx-auto"/></button>
                </div>

                <div className="space-y-2 mt-2">
                  {lockedSlots.map((s, i) => (
                    <div key={i} className="flex justify-between bg-[#1e2330] p-2 rounded text-[10px] text-slate-300">
                      <span>{s.day} • {s.time}</span>
                      <button type="button" onClick={() => removeSlot(i)}><X size={12} className="text-rose-500"/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500">
              {editingId ? "Αποθήκευση Αλλαγών" : "Προσθήκη Καθηγητή"}
            </button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Καθηγητές ({teachers.length})</h3>
          <div className="space-y-2">
            {teachers.map(t => (
              <div key={t.id} className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-white text-xs font-bold">{t.name}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] text-slate-500">{t.subject}</span>
                    {t.isLockedClass && <span className="text-[10px] bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded">{t.assignedClassId}</span>}
                    {t.isLockedHours && <span className="text-[10px] bg-rose-900/50 text-rose-300 px-2 py-0.5 rounded">{t.lockedSlots.length} ώρες</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(t)} className="text-slate-500 hover:text-white p-2"><Edit2 className="w-3 h-3"/></button>
                  <button onClick={() => handleDelete(t.id)} className="text-slate-600 hover:text-rose-500 p-2"><Trash2 className="w-3 h-3"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}