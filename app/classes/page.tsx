"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, BookOpen } from "lucide-react";

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_classes");
    if (stored) setClasses(JSON.parse(stored));
  }, []);

  const addClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newClass: ClassInfo = { 
      id: Date.now().toString(), 
      name, 
      subject 
    };
    
    const updated = [...classes, newClass];
    setClasses(updated);
    localStorage.setItem("eduflow_classes", JSON.stringify(updated));
    
    setName("");
    setSubject("");
  };

  const deleteClass = (id: string) => {
    const filtered = classes.filter(c => c.id !== id);
    setClasses(filtered);
    localStorage.setItem("eduflow_classes", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Τμημάτων" description="Ορίστε τα τμήματα και τα αντίστοιχα μαθήματα.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={addClass} className="space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Όνομα Τμήματος (π.χ. Γ3)" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Μάθημα (π.χ. Μαθηματικά)" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <button className="w-full bg-violet-600 hover:bg-violet-500 p-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Προσθήκη Τμήματος
            </button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Τμήματα ({classes.length})</h3>
          <div className="space-y-3">
            {classes.map(c => (
              <div key={c.id} className="flex justify-between items-center bg-[#0b0e14] p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-violet-500 w-5 h-5" />
                  <div>
                    <p className="text-white text-xs font-bold">{c.name}</p>
                    <p className="text-slate-500 text-[10px]">{c.subject}</p>
                  </div>
                </div>
                <button onClick={() => deleteClass(c.id)} className="text-rose-500 hover:text-rose-400">
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