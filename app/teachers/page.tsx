"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, UserPlus } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  specialization: string;
  phone: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_teachers");
    if (stored) setTeachers(JSON.parse(stored));
  }, []);

  const addTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newTeacher: Teacher = { 
      id: Date.now().toString(), 
      name, 
      specialization, 
      phone 
    };
    
    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
    
    setName("");
    setSpecialization("");
    setPhone("");
  };

  const deleteTeacher = (id: string) => {
    const filtered = teachers.filter(t => t.id !== id);
    setTeachers(filtered);
    localStorage.setItem("eduflow_teachers", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Προσθέστε το εκπαιδευτικό προσωπικό.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={addTeacher} className="space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <input type="text" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="Ειδικότητα (π.χ. Μαθηματικός)" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Τηλέφωνο" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <button className="w-full bg-cyan-600 hover:bg-cyan-500 p-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Προσθήκη Καθηγητή
            </button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Καθηγητές ({teachers.length})</h3>
          <div className="space-y-3">
            {teachers.map(t => (
              <div key={t.id} className="flex justify-between items-center bg-[#0b0e14] p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <UserPlus className="text-cyan-500 w-5 h-5" />
                  <div>
                    <p className="text-white text-xs font-bold">{t.name}</p>
                    <p className="text-slate-500 text-[10px]">{t.specialization} • {t.phone}</p>
                  </div>
                </div>
                <button onClick={() => deleteTeacher(t.id)} className="text-rose-500 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}