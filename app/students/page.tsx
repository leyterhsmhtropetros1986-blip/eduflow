"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Edit2, UserPlus, Plus, X, Clock } from "lucide-react";

// Ορίζουμε τη δομή για το κάθε slot διαθεσιμότητας
interface AvailabilitySlot { day: string; start: string; end: string; }

interface Student {
  id: string; name: string; grade: string; studentPhone: string;
  parentName: string; parentPhone: string; parentEmail: string;
  isLockedClass: boolean; assignedClass: string | null;
  isLockedHours: boolean; lockedSlots: AvailabilitySlot[];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  
  // States φόρμας
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", grade: "", studentPhone: "", parentName: "", parentPhone: "", parentEmail: ""
  });
  
  const [isLockedClass, setIsLockedClass] = useState(false);
  const [assignedClass, setAssignedClass] = useState("");
  
  const [isLockedHours, setIsLockedHours] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<AvailabilitySlot[]>([]);
  // State για το νέο slot διαθεσιμότητας
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({ day: "Δευτέρα", start: "14:00", end: "15:00" });

  // Γεννήτρια ωρών (09:00 - 23:00)
  const timeOptions = Array.from({length: 15}, (_, i) => `${i + 9 < 10 ? '0' : ''}${i + 9}:00`);

  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
    setClassesList(JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]"));
  }, []);

  const addSlot = () => {
    // Έλεγχος λογικής (το end πρέπει να είναι μετά το start)
    if (parseInt(newSlot.start) >= parseInt(newSlot.end)) {
        alert("Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης.");
        return;
    }
    setLockedSlots([...lockedSlots, newSlot]);
    setNewSlot({ day: "Δευτέρα", start: "14:00", end: "15:00" });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const studentData: Student = {
      id: editingId || `s-${Date.now()}`,
      ...formData,
      isLockedClass, assignedClass: isLockedClass ? assignedClass : null,
      isLockedHours, lockedSlots: isLockedHours ? lockedSlots : []
    };

    const updated = editingId ? students.map(s => s.id === editingId ? studentData : s) : [...students, studentData];
    setStudents(updated);
    localStorage.setItem("eduflow_students", JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null); 
    setFormData({ name: "", grade: "", studentPhone: "", parentName: "", parentPhone: "", parentEmail: "" });
    setIsLockedClass(false); setAssignedClass(""); 
    setIsLockedHours(false); setLockedSlots([]);
  };

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών" description="Πλήρης εγγραφή με ακριβή ορισμό διαθεσιμότητας.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-4">
        
        {/* ΦΟΡΜΑ */}
        <div className="xl:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-indigo-400 font-bold text-xs flex items-center gap-2 border-b border-slate-700 pb-2">
              <UserPlus size={14} /> {editingId ? "ΕΠΕΞΕΡΓΑΣΙΑ ΜΑΘΗΤΗ" : "ΕΓΓΡΑΦΗ ΝΕΟΥ ΜΑΘΗΤΗ"}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Ονοματεπώνυμο Μαθητή *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <select required className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                <option value="">Επιλογή Τάξης *</option>
                {['Α Δημοτικού', 'Α Γυμνασίου', 'Α Λυκείου', 'Β Λυκείου', 'Γ Λυκείου'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <input required placeholder="Ονοματεπώνυμο Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
              <input required type="tel" placeholder="Τηλέφωνο Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} />
              <input required type="email" placeholder="Email Γονέα *" className="col-span-2 bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.parentEmail} onChange={e => setFormData({...formData, parentEmail: e.target.value})} />
            </div>

            {/* CHECKBOXES & LOGIC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="flex items-center gap-2 text-xs text-indigo-300 cursor-pointer">
                  <input type="checkbox" checked={isLockedClass} onChange={e => setIsLockedClass(e.target.checked)} />
                  Κλείδωμα σε Τμήμα
                </label>
                {isLockedClass && (
                  <select required value={assignedClass} onChange={e => setAssignedClass(e.target.value)} className="w-full bg-[#1e2330] border border-slate-800 p-2 rounded text-xs text-white">
                    <option value="">Επιλέξτε Τμήμα...</option>
                    {classesList.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                  </select>
                )}
              </div>

              <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 space-y-3">
                <label className="flex items-center gap-2 text-xs text-rose-300 cursor-pointer">
                  <input type="checkbox" checked={isLockedHours} onChange={e => setIsLockedHours(e.target.checked)} />
                  Διαθεσιμότητα (Ώρες)
                </label>
                {isLockedHours && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-1">
                      <select className="bg-[#1e2330] p-1 text-[10px] text-white rounded col-span-2" value={newSlot.day} onChange={e => setNewSlot({...newSlot, day: e.target.value})}>
                        {["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].map(d => <option key={d}>{d}</option>)}
                      </select>
                      <select className="bg-[#1e2330] p-1 text-[10px] text-white rounded" value={newSlot.start} onChange={e => setNewSlot({...newSlot, start: e.target.value})}>{timeOptions.map(t => <option key={t}>{t}</option>)}</select>
                      <select className="bg-[#1e2330] p-1 text-[10px] text-white rounded" value={newSlot.end} onChange={e => setNewSlot({...newSlot, end: e.target.value})}>{timeOptions.map(t => <option key={t}>{t}</option>)}</select>
                    </div>
                    <button type="button" onClick={addSlot} className="w-full bg-rose-600 py-1 rounded text-white text-xs flex justify-center items-center gap-1"><Plus size={14}/> Προσθήκη</button>
                    
                    <div className="space-y-1 mt-2">
                      {lockedSlots.map((s, i) => (
                        <div key={i} className="text-[10px] text-slate-300 bg-[#1e2330] p-2 rounded flex justify-between items-center border border-slate-800">
                          <span>{s.day}: {s.start}-{s.end}</span>
                          <X size={12} className="cursor-pointer text-rose-500" onClick={() => setLockedSlots(lockedSlots.filter((_,idx) => idx !== i))}/>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500">
              Αποθήκευση Μαθητή
            </button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Εγγεγραμμένοι ({students.length})</h3>
          <div className="space-y-3">
            {students.map(s => (
              <div key={s.id} className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800 border-l-4 border-l-indigo-500">
                <p className="text-white text-xs font-bold">{s.name}</p>
                <div className="flex gap-2 mt-1">
                    <p className="text-[10px] text-slate-500">{s.grade}</p>
                    {s.isLockedClass && <span className="text-[10px] bg-indigo-900/50 text-indigo-300 px-1 rounded">{s.assignedClass}</span>}
                </div>
                <div className="flex justify-between items-center mt-2">
                   <div className="flex gap-1 flex-wrap">
                      {s.lockedSlots.map((sl, i) => <span key={i} className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">{sl.day.slice(0,3)} {sl.start}</span>)}
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => { 
                          setFormData({ name: s.name, grade: s.grade, studentPhone: s.studentPhone, parentName: s.parentName, parentPhone: s.parentPhone, parentEmail: s.parentEmail }); 
                          setIsLockedClass(s.isLockedClass); setAssignedClass(s.assignedClass || ""); 
                          setIsLockedHours(s.isLockedHours); setLockedSlots(s.lockedSlots); setEditingId(s.id); 
                        }} className="text-slate-500 hover:text-white"><Edit2 size={12}/></button>
                      <button onClick={() => setStudents(students.filter(st => st.id !== s.id))} className="text-slate-600 hover:text-rose-500"><Trash2 size={12}/></button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}