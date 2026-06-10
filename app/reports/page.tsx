"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { Eye, EyeOff, BarChart3, Users, BookOpen, Building, GraduationCap } from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState({ teachers: [], rooms: [], classes: [], students: [] });
  const [showFinancials, setShowFinancials] = useState(false);

  useEffect(() => {
    // Φόρτωση δεδομένων από το LocalStorage
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const rooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");
    const classes = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]"); // Αν έχεις αποθηκεύσει μαθητές
    setData({ teachers, rooms, classes, students });
  }, []);

  return (
    <WorkspaceShell title="Αναφορές & Analytics" description="Συγκεντρωτική εικόνα του φροντιστηρίου.">
      <div className="p-6 space-y-6">
        
        {/* Row 1: Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Μαθητές" value={data.students.length} icon={<GraduationCap className="text-cyan-400"/>} />
          <StatCard title="Καθηγητές" value={data.teachers.length} icon={<Users className="text-cyan-400"/>} />
          <StatCard title="Αίθουσες" value={data.rooms.length} icon={<Building className="text-cyan-400"/>} />
          <StatCard title="Τμήματα" value={data.classes.length} icon={<BookOpen className="text-cyan-400"/>} />
        </div>

        {/* Row 2: Financial Toggle & Data */}
        <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-white font-bold text-lg">Οικονομική Διαχείριση</h3>
              <p className="text-slate-400 text-sm">Έλεγχος πρόσβασης σε ευαίσθητα δεδομένα.</p>
            </div>
            <button 
              onClick={() => setShowFinancials(!showFinancials)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${showFinancials ? 'bg-rose-600' : 'bg-emerald-600'} text-white`}
            >
              {showFinancials ? <EyeOff size={16}/> : <Eye size={16}/>}
              {showFinancials ? "Απόκρυψη" : "Ενεργοποίηση"}
            </button>
          </div>

          {showFinancials && (
            <div className="bg-[#0b0e14] border border-emerald-900/50 p-6 rounded-2xl animate-in fade-in duration-500">
              <p className="text-emerald-400 font-bold mb-2">Σύνολο Εσόδων: 12.450€</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[70%]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Simple Analytics Visualization */}
        <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800">
          <h3 className="text-white font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="text-cyan-400" /> Κατανομή Μαθητών ανά Τμήμα
          </h3>
          <div className="flex items-end gap-4 h-40">
            {data.classes.map((c: any, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className="w-full bg-cyan-600 rounded-t-lg transition-all hover:bg-cyan-500" 
                  style={{ height: `${Math.max(20, Math.random() * 100)}%` }} 
                />
                <span className="text-xs text-slate-400 truncate w-full text-center">{c.name || "Τμήμα"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-xs uppercase font-bold">{title}</p>
        <h2 className="text-white text-3xl font-bold mt-1">{value}</h2>
      </div>
      <div className="bg-[#0b0e14] p-3 rounded-2xl">{icon}</div>
    </div>
  );
}