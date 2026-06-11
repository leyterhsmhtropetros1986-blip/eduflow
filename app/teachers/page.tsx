"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, UserPlus } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  subject: string;
  classGroup: string;
  phone: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [classes, setClasses] = useState<any[]>([]); // Άλλαξε σε any[] για να δέχεται objects
  
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    // Φόρτωση δεδομένων
    const savedTeachers = localStorage.getItem("eduflow_teachers");
    const savedCourses = localStorage.getItem("eduflow_courses");
    const savedClasses = localStorage.getItem("eduflow_classes");

    if (savedTeachers) setTeachers(JSON.parse(savedTeachers));
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    // Εδώ διορθώσαμε τη φόρτωση για να διαβάζει τα objects
    if (savedClasses) setClasses(JSON.parse(savedClasses));
  }, []);

  const addTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject || !classGroup) {
      alert("Παρακαλώ συμπληρώστε όλα τα πεδία (Όνομα, Μάθημα, Τάξη)");
      return;
    }

    const newTeacher: Teacher = { 
      id: Date.now().toString(), 
      name, 
      subject, 
      classGroup,
      phone 
    };
    
    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
    
    setName("");
    setSubject("");
    setClassGroup("");
    setPhone("");
  };

  const deleteTeacher = (id: string) => {
    const filtered = teachers.filter(t => t.id !== id);
    setTeachers(filtered);
    localStorage.setItem("eduflow_teachers", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Ορίστε το προσωπικό και τις αναθέσεις τους.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={addTeacher} className="space-y-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            
            {/* Dropdown Μαθήματος */}
            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
              <option value="">Επίλεξε Μάθημα...</option>
              {courses.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>

            {/* Dropdown Τάξης - Διορθωμένο για να διαβάζει .name */}
            <select value={classGroup} onChange={e => setClassGroup(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
              <option value="">Επίλεξε Τάξη...</option>
              {classes.map((c, i) => (
                <option key={i} value={c.name || c}>{c.name || c}</option>
              ))}
            </select>

            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Τηλέφωνο" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 p-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2">
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
                    <p className="text-slate-500 text-[10px]">{t.subject} • {t.classGroup}</p>
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