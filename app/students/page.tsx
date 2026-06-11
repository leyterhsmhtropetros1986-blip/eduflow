"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Edit2, UserPlus, Plus, X, Clock } from "lucide-react";

interface AvailabilitySlot { day: string; start: string; end: string; }

interface Student {
  id: string; 
  name: string; 
  grade: string; 
  studentPhone: string;
  parentName: string; 
  parentPhone: string; 
  parentEmail: string;
  isLockedHours: boolean; 
  lockedSlots: AvailabilitySlot[];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", grade: "", studentPhone: "", parentName: "", parentPhone: "", parentEmail: ""
  });
  
  const [isLockedHours, setIsLockedHours] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<AvailabilitySlot[]>([]);
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({ day: "Δευτέρα", start: "14:00", end: "15:00" });

  const getAvailableTimes = (day: string) => {
    if (day === "Σάββατο") return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
    return ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  };

  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
  }, []);

  const addSlot = () => {
    setLockedSlots([...lockedSlots, newSlot]);
    setNewSlot({ day: newSlot.day, start: getAvailableTimes(newSlot.day)[0], end: getAvailableTimes(newSlot.day)[1] || "15:00" });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const studentData: Student = {
      id: editingId || `s-${Date.now()}`,
      ...formData,
      isLockedHours, 
      lockedSlots: isLockedHours ? lockedSlots : []
    };
    
    const updated = editingId 
      ? students.map(s => s.id === editingId ? studentData : s) 
      : [...students, studentData];
      
    setStudents(updated);
    localStorage.setItem("eduflow_students", JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null); 
    setFormData({ name: "", grade: "", studentPhone: "", parentName: "", parentPhone: "", parentEmail: "" });
    setIsLockedHours(false); 
    setLockedSlots([]);
  };

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών" description="Εγγραφή μαθητών και στοιχεία επικοινωνίας.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-4">
        
        {/* ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ */}
        <div className="xl:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-indigo-400 font-bold text-xs flex items-center gap-2 border-b border-slate-700 pb-2">
              <UserPlus size={14} /> {editingId ? "ΕΠΕΞΕΡΓΑΣΙΑ ΜΑΘΗΤΗ" : "ΕΓΓΡΑΦΗ ΝΕΟΥ ΜΑΘΗΤΗ"}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Ονοματεπώνυμο Μαθητή *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <select required className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                <option value="">Επιλογή Τάξης *</option>
                {['Α ΓΥΜΝΑΣΙΟΥ', 'Β ΓΥΜΝΑΣΙΟΥ', 'Γ ΓΥΜΝΑΣΙΟΥ', 'Α ΛΥΚΕΙΟΥ', 'Β ΛΥΚΕΙΟΥ', 'Γ ΛΥΚΕΙΟΥ', 'ΜΕΤΑΛΥΚΕΙΑΚΟΙ'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <input required type="tel" placeholder="Τηλέφωνο Μαθητή *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.studentPhone} onChange={e => setFormData({...formData, studentPhone: e.target.value})} />
              <input required placeholder="Ονοματεπώνυμο Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
              <input required type="tel" placeholder="Τηλέφωνο Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} />
              <input required type="email" placeholder="Email Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.parentEmail} onChange={e => setFormData({...formData, parentEmail: e.target.value})} />
            </div>

            {/* ΔΙΑΘΕΣΙΜΟΤΗΤΑ */}
            <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="flex items-center gap-2 text-xs text-rose-300 cursor-pointer">
                <input type="checkbox" checked={isLockedHours} onChange={e => setIsLockedHours(e.target.checked)} />
                Ορισμός Διαθεσιμότητας
              </label>
              {isLockedHours && (
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-1">
                    <select className="bg-[#1e2330] p-1 text-[10px] text-white rounded col-span-2" value={newSlot.day} onChange={e => {const d = e.target.value; setNewSlot({day: d, start: getAvailableTimes(d)[0], end: getAvailableTimes(d)[1] || "15:00"});}}>
                      {["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].map(d => <option key={d}>{d}</option>)}
                    </select>
                    <select className="bg-[#1e2330] p-1 text-[10px] text-white rounded" value={newSlot.start} onChange={e => setNewSlot({...newSlot, start: e.target.value})}>{getAvailableTimes(newSlot.day).map(t => <option key={t}>{t}</option>)}</select>
                    <select className="bg-[#1e2330] p-1 text-[10px] text-white rounded" value={newSlot.end} onChange={e => setNewSlot({...newSlot, end: e.target.value})}>{getAvailableTimes(newSlot.day).map(t => <option key={t}>{t}</option>)}</select>
                  </div>
                  <button type="button" onClick={addSlot} className="w-full bg-rose-600 py-1 rounded text-white text-xs flex justify-center items-center gap-1"><Plus size={14}/> Προσθήκη</button>
                  <div className="space-y-1">
                    {lockedSlots.map((s, i) => (
                      <div key={i} className="text-[10px] text-slate-300 bg-[#1e2330] p-2 rounded flex justify-between items-center border border-slate-800">
                        <span>{s.day.substring(0,3)}: {s.start}-{s.end}</span>
                        <X size={12} className="cursor-pointer text-rose-500" onClick={() => setLockedSlots(lockedSlots.filter((_,idx) => idx !== i))}/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors">
              {editingId ? "ΕΝΗΜΕΡΩΣΗ ΜΑΘΗΤΗ" : "ΑΠΟΘΗΚΕΥΣΗ ΜΑΘΗΤΗ"}
            </button>
          </form>
        </div>

        {/* ΛΙΣΤΑ ΜΑΘΗΤΩΝ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Εγγεγραμμένοι ({students.length})</h3>
          <div className="space-y-3">
            {students.map(s => (
              <div key={s.id} className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 border-l-4 border-l-indigo-500 space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-white text-sm font-bold">{s.name}</p>
                        <p className="text-[10px] text-indigo-400 font-medium">{s.grade}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { 
                          setFormData({ name: s.name, grade: s.grade, studentPhone: s.studentPhone, parentName: s.parentName, parentPhone: s.parentPhone, parentEmail: s.parentEmail }); 
                          setIsLockedHours(s.isLockedHours); setLockedSlots(s.lockedSlots); setEditingId(s.id); 
                        }} className="text-slate-500 hover:text-white"><Edit2 size={12}/></button>
                      <button onClick={() => {
                          const updated = students.filter(st => st.id !== s.id);
                          setStudents(updated);
                          localStorage.setItem("eduflow_students", JSON.stringify(updated));
                      }} className="text-slate-600 hover:text-rose-500"><Trash2 size={12}/></button>
                   </div>
                </div>
                
                <div className="pt-2 border-t border-slate-800 space-y-1">
                    <p className="text-[10px] text-slate-400">📞 <span className="text-white">{s.studentPhone}</span></p>
                    <p className="text-[10px] text-slate-400">👨‍👩‍👧 <span className="text-white">{s.parentName} ({s.parentPhone})</span></p>
                    <p className="text-[10px] text-slate-400">📧 <span className="text-white">{s.parentEmail}</span></p>
                    {s.isLockedHours && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {s.lockedSlots.map((slot, idx) => (
                                <span key={idx} className="bg-rose-900 text-rose-200 text-[9px] px-2 py-0.5 rounded flex items-center gap-1">
                                    <Clock size={8}/> {slot.day.substring(0,3)} {slot.start}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}