"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Edit2, UserPlus, Users } from "lucide-react";

interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  studentName: string; // Το όνομα του μαθητή που αντιστοιχεί στον γονέα
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", studentName: ""
  });

  // Φόρτωση δεδομένων γονέων
  useEffect(() => {
    const saved = localStorage.getItem("eduflow_parents");
    if (saved) setParents(JSON.parse(saved));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parentData: Parent = {
      id: editingId || `p-${Date.now()}`,
      ...formData
    };
    
    const updated = editingId 
      ? parents.map(p => p.id === editingId ? parentData : p) 
      : [...parents, parentData];
      
    setParents(updated);
    localStorage.setItem("eduflow_parents", JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "", studentName: "" });
  };

  return (
    <WorkspaceShell title="Διαχείριση Γονέων" description="Στοιχεία επικοινωνίας γονέων και αντιστοίχιση με μαθητές.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-4">
        
        {/* ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ ΓΟΝΕΑ */}
        <div className="xl:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-emerald-400 font-bold text-xs flex items-center gap-2 border-b border-slate-700 pb-2">
              <Users size={14} /> {editingId ? "ΕΠΕΞΕΡΓΑΣΙΑ ΓΟΝΕΑ" : "ΠΡΟΣΘΗΚΗ ΝΕΟΥ ΓΟΝΕΑ"}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Ονοματεπώνυμο Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="tel" placeholder="Τηλέφωνο Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required type="email" placeholder="Email Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input required placeholder="Όνομα Μαθητή *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} />
            </div>

            <button type="submit" className="w-full p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-colors">
              {editingId ? "ΕΝΗΜΕΡΩΣΗ ΓΟΝΕΑ" : "ΑΠΟΘΗΚΕΥΣΗ ΓΟΝΕΑ"}
            </button>
          </form>
        </div>

        {/* ΛΙΣΤΑ ΓΟΝΕΩΝ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Εγγεγραμμένοι ({parents.length})</h3>
          <div className="space-y-3">
            {parents.map(p => (
              <div key={p.id} className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 border-l-4 border-l-emerald-500 space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-white text-sm font-bold">{p.name}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">Μαθητής: {p.studentName}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { 
                          setFormData({ name: p.name, phone: p.phone, email: p.email, studentName: p.studentName }); 
                          setEditingId(p.id); 
                        }} className="text-slate-500 hover:text-white"><Edit2 size={12}/></button>
                      <button onClick={() => {
                          const updated = parents.filter(pt => pt.id !== p.id);
                          setParents(updated);
                          localStorage.setItem("eduflow_parents", JSON.stringify(updated));
                      }} className="text-slate-600 hover:text-rose-500"><Trash2 size={12}/></button>
                   </div>
                </div>
                
                <div className="pt-2 border-t border-slate-800 space-y-1">
                    <p className="text-[10px] text-slate-400">📞 <span className="text-white">{p.phone}</span></p>
                    <p className="text-[10px] text-slate-400">📧 <span className="text-white">{p.email}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}