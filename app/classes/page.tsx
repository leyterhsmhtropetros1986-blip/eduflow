"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, BookOpen, AlertCircle } from "lucide-react";

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [teacherId, setTeacherId] = useState("");

  useEffect(() => {
    // Φόρτωση δεδομένων κατά το mount
    const storedClasses = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    const storedTeachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    
    setClasses(storedClasses);
    setTeachers(storedTeachers);
  }, []);

  const addClass = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !teacherId) {
      alert("Παρακαλώ συμπληρώστε το όνομα τμήματος και επιλέξτε καθηγητή.");
      return;
    }

    const newClass: ClassInfo = { 
      id: Date.now().toString(), 
      name, 
      subject,
      teacherId
    };
    
    const updated = [...classes, newClass];
    setClasses(updated);
    localStorage.setItem("eduflow_classes", JSON.stringify(updated));
    
    // Reset φόρμας
    setName("");
    setSubject("");
    setTeacherId("");
  };

  const deleteClass = (id: string) => {
    const filtered = classes.filter(c => c.id !== id);
    setClasses(filtered);
    localStorage.setItem("eduflow_classes", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Τμημάτων" description="Ορίστε τα τμήματα και αναθέστε καθηγητή για το πρόγραμμα.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ ΕΙΣΑΓΩΓΗΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={addClass} className="space-y-4">
            <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider">Νέο Τμήμα</h4>
            
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Όνομα Τμήματος (π.χ. Γ3)" 
              className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white" 
            />
            
            <input 
              type="text" 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              placeholder="Μάθημα (π.χ. Μαθηματικά)" 
              className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white" 
            />
            
            {/* Επιλογή Καθηγητή */}
            {teachers.length > 0 ? (
              <select 
                value={teacherId} 
                onChange={e => setTeacherId(e.target.value)} 
                className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-slate-300"
              >
                <option value="">Επιλέξτε Καθηγητή...</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 text-rose-400 text-[10px] p-2 bg-rose-950/20 rounded">
                <AlertCircle size={14} /> Δεν βρέθηκαν καθηγητές. Προσθέστε πρώτα έναν καθηγητή.
              </div>
            )}

            <button 
              type="submit" 
              disabled={teachers.length === 0}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 p-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Δημιουργία Τμήματος
            </button>
          </form>
        </div>

        {/* ΛΙΣΤΑ ΤΜΗΜΑΤΩΝ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Ενεργά Τμήματα ({classes.length})</h3>
          <div className="space-y-3">
            {classes.length === 0 ? (
              <p className="text-slate-500 text-xs italic">Δεν έχουν οριστεί τμήματα ακόμα.</p>
            ) : (
              classes.map(c => {
                const teacher = teachers.find(t => t.id === c.teacherId);
                return (
                  <div key={c.id} className="flex justify-between items-center bg-[#0b0e14] p-4 rounded-xl border border-slate-800 hover:border-violet-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <BookOpen className="text-violet-500 w-5 h-5" />
                      <div>
                        <p className="text-white text-xs font-bold">{c.name}</p>
                        <p className="text-slate-500 text-[10px]">
                          {c.subject} • Καθ. {teacher ? teacher.name : <span className="text-rose-500">Διαγράφηκε</span>}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteClass(c.id)} 
                      className="text-slate-600 hover:text-rose-500 transition-colors"
                      title="Διαγραφή"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}