"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, BookOpen, User, GraduationCap } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
  grade: string; // Η απαραίτητη προσθήκη ERP
  course: string | null;
  teacher: string | null;
  capacity?: number;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  // Form states
  const [className, setClassName] = useState("");
  const [grade, setGrade] = useState(""); // State για την Τάξη
  
  // States για τα Checkboxes
  const [isCourseEnabled, setIsCourseEnabled] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  
  const [isTeacherEnabled, setIsTeacherEnabled] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  useEffect(() => {
    // Ενοποίηση του LocalStorage Key με τη σελίδα των μαθητών
    const rawClasses = JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]");
    
    // Normalize παλιών δεδομένων αν υπάρχουν
    const normalized = rawClasses.map((c: any) => ({
      id: c.id || `class-${Date.now()}-${Math.random()}`,
      name: c.name || c.className || "",
      grade: c.grade || "",
      course: c.course || null,
      teacher: c.teacher || null
    }));

    setClasses(normalized);
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
    setCourses(JSON.parse(localStorage.getItem("eduflow_courses") || "[]"));
  }, []);

  const addClass = () => {
    if (!className) {
      alert("Παρακαλώ συμπλήρωσε το όνομα του τμήματος.");
      return;
    }
    if (!grade) {
      alert("Παρακαλώ επιλέξτε την Τάξη στην οποία ανήκει το τμήμα.");
      return;
    }

    const newClass: ClassItem = {
      id: `class-${Date.now()}`,
      name: className,
      grade: grade, // Αποθήκευση της τάξης
      course: isCourseEnabled ? selectedCourse : null,
      teacher: isTeacherEnabled ? selectedTeacher : null,
      capacity: 20
    };

    const updated = [...classes, newClass];
    setClasses(updated);
    localStorage.setItem("eduflow_classes", JSON.stringify(updated));
    
    // Reset form
    setClassName("");
    setGrade("");
    setIsCourseEnabled(false);
    setSelectedCourse("");
    setIsTeacherEnabled(false);
    setSelectedTeacher("");
  };

  const removeClass = (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    setClasses(updated);
    localStorage.setItem("eduflow_classes", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell title="Διαχείριση Τμημάτων" description="Ορίστε τα τμήματα ανά τάξη και αναθέστε προαιρετικά καθηγητή και μάθημα.">
      
      {/* Φόρμα Δημιουργίας */}
      <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 mb-8 max-w-2xl mx-auto shadow-xl">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-800 pb-3">
          <Plus size={16} className="text-indigo-400" /> Νέο Τμήμα & Σύνδεση με Τάξη
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Όνομα Τμήματος */}
            <input 
              className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
              placeholder="Όνομα τμήματος (π.χ. Α1, Β_Ανθρωπιστικών)"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />

            {/* Επιλογή Τάξης (ERP Σύνδεση) */}
            <select 
              required 
              value={grade} 
              onChange={e => setGrade(e.target.value)} 
              className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="">Ανήκει στην Τάξη *</option>
              {["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"].map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Μάθημα */}
            <div className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800">
              <label className="flex items-center gap-2 text-[10px] text-slate-400 mb-2 cursor-pointer select-none">
                <input type="checkbox" checked={isCourseEnabled} onChange={e => setIsCourseEnabled(e.target.checked)} className="accent-indigo-500" />
                Ανάθεση Μαθήματος
              </label>
              {isCourseEnabled && (
                <select 
                  className="w-full bg-[#1e2330] border border-slate-800 p-2 rounded-lg text-xs text-white cursor-pointer"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Επιλέξτε Μάθημα...</option>
                  {courses.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              )}
            </div>

            {/* Καθηγητής */}
            <div className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800">
              <label className="flex items-center gap-2 text-[10px] text-slate-400 mb-2 cursor-pointer select-none">
                <input type="checkbox" checked={isTeacherEnabled} onChange={e => setIsTeacherEnabled(e.target.checked)} className="accent-indigo-500" />
                Anάθεση Καθηγητή
              </label>
              {isTeacherEnabled && (
                <select 
                  className="w-full bg-[#1e2330] border border-slate-800 p-2 rounded-lg text-xs text-white cursor-pointer"
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                >
                  <option value="">Επιλέξτε Καθηγητή...</option>
                  {teachers.map((t, i) => <option key={i} value={t}>{t}</option>)}
                </select>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={addClass}
          className="w-full mt-4 bg-indigo-600 text-white p-3 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg"
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
              <div className="space-y-1">
                <h3 className="text-white font-bold text-sm tracking-wide">{c.name}</h3>
                
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-indigo-400 text-[10px] font-bold bg-indigo-950/40 px-2 py-0.5 rounded w-fit border border-indigo-900/30 flex items-center gap-1">
                    <GraduationCap size={10}/> {c.grade || "Χωρίς Τάξη"}
                  </span>
                  
                  {c.course && (
                    <p className="text-slate-300 text-[11px] flex items-center gap-1.5"><BookOpen size={11} className="text-slate-500"/> {c.course}</p>
                  )}
                  {c.teacher && (
                    <p className="text-slate-400 text-[11px] flex items-center gap-1.5"><User size={11} className="text-slate-500"/> {c.teacher}</p>
                  )}
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