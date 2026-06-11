"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Edit2, CheckCircle2, UserPlus, Info } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  isClassEnabled: boolean;
  assignedClassId: string | null;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [isClassEnabled, setIsClassEnabled] = useState(false);
  const [assignedClassId, setAssignedClassId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
    setClassesList(JSON.parse(localStorage.getItem("eduflow_classes") || "[]"));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ασφάλεια: Αν δεν είναι enabled, το assignedClassId γίνεται null
    const finalClassId = isClassEnabled ? assignedClassId : null;

    const teacherData: Teacher = {
      id: editingId || `t-${Date.now()}`,
      name, 
      subject,
      isClassEnabled,
      assignedClassId: finalClassId
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
    setIsClassEnabled(false); 
    setAssignedClassId("");
  };

  const startEdit = (t: Teacher) => {
    setEditingId(t.id);
    setName(t.name); 
    setSubject(t.subject);
    setIsClassEnabled(t.isClassEnabled || false);
    setAssignedClassId(t.assignedClassId || "");
  };

  const handleDelete = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Ορισμός καθηγητών και ανάθεση τμημάτων.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-indigo-400 font-bold text-xs flex items-center gap-2">
              <UserPlus size={14} /> {editingId ? "ΕΠΕΞΕΡΓΑΣΙΑ ΚΑΘΗΓΗΤΗ" : "ΝΕΟΣ ΚΑΘΗΓΗΤΗΣ"}
            </h4>
            
            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white" />
            <input required type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Μάθημα" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white" />

            {/* CLASS LOCKING */}
            <div className="bg-[#0b0e14] p-4 rounded-xl border border-indigo-500/20 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-indigo-300 cursor-pointer">
                <input type="checkbox" checked={isClassEnabled} onChange={(e) => setIsClassEnabled(e.target.checked)} className="rounded border-slate-700 bg-slate-800" />
                Κλείδωμα σε συγκεκριμένο Τμήμα
              </label>
              
              {isClassEnabled && (
                classesList.length > 0 ? (
                  <select required value={assignedClassId} onChange={e => setAssignedClassId(e.target.value)} className="w-full bg-[#1e2330] border border-slate-800 p-2 rounded text-xs text-white">
                    <option value="">Επιλέξτε Τμήμα...</option>
                    {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                ) : (
                  <p className="text-[10px] text-rose-400 flex items-center gap-1"><Info size={12}/> Δεν υπάρχουν διαθέσιμα τμήματα.</p>
                )
              )}
            </div>

            <button type="submit" className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-all">
              {editingId ? "Αποθήκευση Αλλαγών" : "Προσθήκη Καθηγητή"}
            </button>
            {editingId && <button type="button" onClick={resetForm} className="w-full p-2 text-slate-500 text-[10px] hover:text-white">Ακύρωση</button>}
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Καθηγητές ({teachers.length})</h3>
          <div className="space-y-2">
            {teachers.map(t => (
              <div key={t.id} className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-all">
                <div>
                  <p className="text-white text-xs font-bold">{t.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-slate-400 text-[10px]">{t.subject}</p>
                    {t.isClassEnabled && (
                      <span className="bg-indigo-900/50 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded border border-indigo-800 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Κλειδωμένος
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => startEdit(t)} className="text-slate-500 hover:text-white p-2 transition-colors"><Edit2 className="w-3 h-3"/></button>
                    <button onClick={() => handleDelete(t.id)} className="text-slate-600 hover:text-rose-500 p-2 transition-colors"><Trash2 className="w-3 h-3"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}