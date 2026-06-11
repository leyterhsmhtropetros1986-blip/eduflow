"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, GraduationCap, Users } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  grade: string;
  maxStudents: number; // Ο υποχρεωτικός αριθμός ατόμων
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);

  // Form states
  const [className, setClassName] = useState("");
  const [grade, setGrade] = useState("");
  const [maxStudents, setMaxStudents] = useState<string>(""); // State για τον αριθμό ατόμων

  useEffect(() => {
    const rawClasses = JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]");
    
    // Normalize δεδομένων για να κρατήσουμε μόνο τα απαραίτητα πεδία
    const normalized = rawClasses.map((c: any) => ({
      id: c.id || `class-${Date.now()}-${Math.random()}`,
      name: c.name || c.className || "",
      grade: c.grade || "",
      maxStudents: Number(c.maxStudents) || Number(c.capacity) || 20 // Fallback τιμή αν προϋπήρχαν τμήματα
    }));

    setClasses(normalized);
  }, []);

  const addClass = () => {
    if (!className.trim()) {
      alert("Παρακαλώ συμπλήρωσε το όνομα του τμήματος.");
      return;
    }
    if (!grade) {
      alert("Παρακαλώ επιλέξτε την Τάξη στην οποία ανήκει το τμήμα.");
      return;
    }
    
    const parsedMax = parseInt(maxStudents);
    if (!maxStudents || isNaN(parsedMax) || parsedMax <= 0) {
      alert("Παρακαλώ όρισε έναν έγκυρο, υποχρεωτικό μέγιστο αριθμό ατόμων για το τμήμα (π.χ. 15).");
      return;
    }

    const newClass: ClassItem = {
      id: `class-${Date.now()}`,
      name: className.trim(),
      grade: grade,
      maxStudents: parsedMax
    };

    const updated = [...classes, newClass];
    setClasses(updated);
    localStorage.setItem("eduflow_classes", JSON.stringify(updated));
    
    // Reset φόρμας
    setClassName("");
    setGrade("");
    setMaxStudents("");
  };

  const removeClass = (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    setClasses(updated);
    localStorage.setItem("eduflow_classes", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell title="Διαχείριση Τμημάτων" description="Ορίστε τα τμήματα ανά τάξη και καθορίστε τον μέγιστο αριθμό μαθητών.">
      
      {/* Φόρμα Δημιουργίας */}
      <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 mb-8 max-w-2xl mx-auto shadow-xl">
        <h2 className="text-white font-bold mb-5 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-800 pb-3">
          <Plus size={16} className="text-indigo-400" /> Νέο Τμήμα
        </h2>
        
        <div className="space-y-4">
          {/* Πρώτη Σειρά: Όνομα & Τάξη */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5 pl-1">Όνομα Τμήματος *</label>
              <input 
                className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
                placeholder="π.χ. Α1, Β_Θετικών"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5 pl-1">Ανήκει στην Τάξη *</label>
              <select 
                value={grade} 
                onChange={e => setGrade(e.target.value)} 
                className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="">Επιλέξτε Τάξη...</option>
                {["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"].map((g, i) => (
                  <option key={i} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Δεύτερη Σειρά: Αριθμός Ατόμων */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5 pl-1">Μέγιστος Αριθμός Ατόμων *</label>
            <input 
              type="number"
              min="1"
              className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
              placeholder="π.χ. 12"
              value={maxStudents}
              onChange={(e) => setMaxStudents(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={addClass}
          className="w-full mt-5 bg-indigo-600 text-white p-3 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg"
        >
          Δημιουργία Τμήματος
        </button>
      </div>

      {/* Λίστα Τμημάτων */}
      <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4 border-b border-slate-800 pb-2">
        Ενεργά Τμήματα ({classes.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">
            Δεν υπάρχουν καταχωρημένα τμήματα. Δημιουργήστε το πρώτο σας παραπάνω.
          </div>
        ) : (
          classes.map((c) => (
            <div key={c.id} className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl flex justify-between items-start hover:border-slate-700 transition-all">
              <div className="space-y-2">
                <h3 className="text-white font-bold text-sm tracking-wide">{c.name}</h3>
                
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-indigo-400 text-[10px] font-bold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30 flex items-center gap-1">
                    <GraduationCap size={10}/> {c.grade || "Χωρίς Τάξη"}
                  </span>
                  
                  <span className="text-emerald-400 text-[10px] font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30 flex items-center gap-1">
                    <Users size={10}/> έως {c.maxStudents} άτομα
                  </span>
                </div>
              </div>
              <button onClick={() => removeClass(c.id)} className="text-slate-600 hover:text-rose-500 p-1 hover:bg-[#0b0e14] rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </WorkspaceShell>
  );
}