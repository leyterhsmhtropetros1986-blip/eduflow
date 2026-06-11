"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, Users, BookOpen, User } from "lucide-react";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  // Form states
  const [className, setClassName] = useState("");
  
  // States για τα Checkboxes
  const [isCourseEnabled, setIsCourseEnabled] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  
  const [isTeacherEnabled, setIsTeacherEnabled] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  useEffect(() => {
    setClasses(JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]"));
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
    setCourses(JSON.parse(localStorage.getItem("eduflow_courses") || "[]"));
  }, []);

  const addClass = () => {
    if (!className) {
      alert("Παρακαλώ συμπλήρωσε το όνομα του τμήματος.");
      return;
    }

    const newClass = {
      id: `class-${Date.now()}`,
      name: className,
      // Αποθηκεύουμε null αν δεν είναι επιλεγμένο
      course: isCourseEnabled ? selectedCourse : null,
      teacher: isTeacherEnabled ? selectedTeacher : null
    };

    const updated = [...classes, newClass];
    setClasses(updated);
    localStorage.setItem("eduflow_classes_data", JSON.stringify(updated));
    
    // Reset form
    setClassName("");
    setIsCourseEnabled(false);
    setSelectedCourse("");
    setIsTeacherEnabled(false);
    setSelectedTeacher("");
  };

  const removeClass = (index: number) => {
    const updated = classes.filter((_, i) => i !== index);
    setClasses(updated);
    localStorage.setItem("eduflow_classes_data", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell title="Διαχείριση Τμημάτων" description="Ορίστε τα τμήματα και αναθέστε προαιρετικά καθηγητή και μάθημα.">
      
      {/* Φόρμα Δημιουργίας */}
      <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 mb-8 max-w-2xl mx-auto">
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Plus size={18} className="text-indigo-400" /> Νέο Τμήμα
        </h2>
        
        <div className="space-y-4">
          <input 
            className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white"
            placeholder="Όνομα τμήματος (π.χ. Γ3)"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Μάθημα */}
            <div className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800">
              <label className="flex items-center gap-2 text-[10px] text-slate-400 mb-2 cursor-pointer">
                <input type="checkbox" checked={isCourseEnabled} onChange={e => setIsCourseEnabled(e.target.checked)} />
                Ανάθεση Μαθήματος
              </label>
              {isCourseEnabled && (
                <select 
                  className="w-full bg-[#1e2330] border border-slate-800 p-2 rounded-lg text-xs text-white"
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
              <label className="flex items-center gap-2 text-[10px] text-slate-400 mb-2 cursor-pointer">
                <input type="checkbox" checked={isTeacherEnabled} onChange={e => setIsTeacherEnabled(e.target.checked)} />
                Ανάθεση Καθηγητή
              </label>
              {isTeacherEnabled && (
                <select 
                  className="w-full bg-[#1e2330] border border-slate-800 p-2 rounded-lg text-xs text-white"
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
          className="w-full mt-4 bg-indigo-600 text-white p-3 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all"
        >
          Δημιουργία Τμήματος
        </button>
      </div>

      {/* Λίστα Τμημάτων */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c, i) => (
          <div key={c.id} className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl flex justify-between items-start">
            <div>
              <h3 className="text-white font-bold text-sm">{c.name}</h3>
              {c.course && (
                <p className="text-indigo-400 text-[10px] mt-1 flex items-center gap-1"><BookOpen size={10}/> {c.course}</p>
              )}
              {c.teacher && (
                <p className="text-slate-400 text-[10px] mt-1 flex items-center gap-1"><User size={10}/> {c.teacher}</p>
              )}
            </div>
            <button onClick={() => removeClass(i)} className="text-slate-600 hover:text-rose-500">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}