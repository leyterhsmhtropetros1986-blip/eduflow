"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Users, GraduationCap, School, BookOpen, BarChart3, Target, TrendingUp, 
  Download, Printer, FileText, Mail, Table as TableIcon 
} from "lucide-react";

export default function ReportsPDFPage() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schedule, setSchedule] = useState([]);

  const reportDate = useMemo(() => new Date(), []);

  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
    setClasses(JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]"));
    setSchedule(JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"));
  }, []);

  // --- Logic Helpers ---
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s: any) => { if (s.className) counts[s.className] = (counts[s.className] || 0) + 1; });
    return counts;
  }, [students]);

  const stats = useMemo(() => {
    const totalCapacity = classes.reduce((sum: number, c: any) => sum + (c.maxStudents || 20), 0);
    return {
      avgS: classes.length > 0 ? (students.length / classes.length).toFixed(1) : 0,
      ratio: teachers.length > 0 ? (students.length / teachers.length).toFixed(1) : 0,
      occupancy: totalCapacity > 0 ? Math.round((students.length / totalCapacity) * 100) : 0
    };
  }, [students, teachers, classes]);

  const insights = useMemo(() => {
    // Top Subject
    const subCount: Record<string, number> = {};
    schedule.forEach((s: any) => subCount[s.subject] = (subCount[s.subject] || 0) + 1);
    const topSub = Object.entries(subCount).sort((a,b) => b[1] - a[1])[0] || ["-", 0];

    // Busiest Teacher
    const tCount: Record<string, number> = {};
    schedule.forEach((s: any) => tCount[s.teacher] = (tCount[s.teacher] || 0) + 1);
    const topTeacher = Object.entries(tCount).sort((a,b) => b[1] - a[1])[0] || ["-", 0];

    return { topSub, topTeacher };
  }, [schedule]);

  const sortedSchedule = useMemo(() => {
    const dayOrder: Record<string, number> = { "Δευτέρα": 1, "Τρίτη": 2, "Τετάρτη": 3, "Πέμπτη": 4, "Παρασκευή": 5, "Σάββατο": 6, "Κυριακή": 7 };
    return [...schedule].sort((a: any, b: any) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99));
  }, [schedule]);

  // Heatmap Data
  const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
  const hours = ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

  // Export functions
  const handlePrint = () => window.print();
  
  return (
    <div className="relative min-h-screen bg-white text-black p-8 max-w-5xl mx-auto font-sans print:p-0">
      
      {/* Export Controls (Hide on Print) */}
      <div className="flex gap-2 mb-6 print:hidden justify-center bg-gray-100 p-3 rounded-lg">
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"><Printer size={16}/> Εκτύπωση</button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border hover:bg-gray-50 transition-colors"><FileText size={16}/> PDF</button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border hover:bg-gray-50 transition-colors"><TableIcon size={16}/> Excel</button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border hover:bg-gray-50 transition-colors"><Mail size={16}/> Email</button>
      </div>

      <div className="relative z-10">
        <style jsx global>{`
          table { page-break-inside: auto; border-collapse: collapse; }
          tr { page-break-inside: avoid; }
          .heatmap-cell { transition: background-color 0.3s; }
        `}</style>

        {/* Header */}
        <div className="flex justify-between items-center border-b-4 border-indigo-600 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">EF</div>
            <div>
              <h1 className="text-3xl font-black text-indigo-700">EduFlow</h1>
              <p className="text-gray-500 font-bold uppercase text-xs">Smart Tutoring ERP</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">REPORT</h2>
            <p className="text-sm font-mono">{reportDate.toLocaleString("el-GR")}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-4 xl:grid-cols-7 gap-3 mb-10">
           {[
              { l: "Μαθητές", v: students.length, i: <Users size={18} className="text-blue-600" /> },
              { l: "Καθηγητές", v: teachers.length, i: <GraduationCap size={18} className="text-purple-600" /> },
              { l: "Τμήματα", v: classes.length, i: <School size={18} className="text-emerald-600" /> },
              { l: "Μαθήματα", v: schedule.length, i: <BookOpen size={18} className="text-amber-600" /> },
              { l: "Μ.Ο. Μ/Τ", v: stats.avgS, i: <BarChart3 size={18} className="text-indigo-600" /> },
              { l: "Αν. Μ/Κ", v: stats.ratio, i: <Target size={18} className="text-rose-600" /> },
              { l: "Πληρότητα", v: `${stats.occupancy}%`, i: <TrendingUp size={18} className="text-teal-600" /> }
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-xl border">
                {item.i}
                <p className="text-[8px] text-gray-500 uppercase font-bold mt-1">{item.l}</p>
                <p className="text-md font-black">{item.v}</p>
              </div>
            ))}
        </div>

        {/* Heatmap Section */}
        <h2 className="text-lg font-bold mb-4 border-l-4 border-indigo-600 pl-2">Heatmap Ωρών Αιχμής</h2>
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-xs text-center border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Ώρα</th>
                {days.map(d => <th key={d} className="p-2">{d.slice(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {hours.map(h => (
                <tr key={h} className="border-b">
                  <td className="font-bold p-2 bg-gray-50">{h}</td>
                  {days.map(d => {
                    const count = schedule.filter((s:any) => s.day === d && s.time?.startsWith(h.split(':')[0])).length;
                    const opacity = count === 0 ? "bg-white" : count < 2 ? "bg-indigo-100" : count < 4 ? "bg-indigo-300" : "bg-indigo-600 text-white";
                    return <td key={d} className={`p-2 ${opacity} heatmap-cell font-bold`}>{count || "-"}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Insights Grid */}
        <h2 className="text-lg font-bold mb-4 border-l-4 border-indigo-600 pl-2">Top Insights</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-xs">
          <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
            <p className="font-bold text-gray-600">Πιο δημοφιλές μάθημα</p>
            <p className="text-xl font-black text-indigo-700">{insights.topSub[0]}</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
            <p className="font-bold text-gray-600">Πληρότητα</p>
            <p className="text-xl font-black text-emerald-700">{stats.occupancy}%</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
            <p className="font-bold text-gray-600">Απασχολημένος Καθηγητής</p>
            <p className="text-xl font-black text-amber-700">{insights.topTeacher[0]}</p>
          </div>
          <div className="p-4 bg-rose-50 rounded-lg border-l-4 border-rose-500">
            <p className="font-bold text-gray-600">Συνολικές Ώρες/Εβδ</p>
            <p className="text-xl font-black text-rose-700">{schedule.length}</p>
          </div>
        </div>

        {/* Schedule Table */}
        <h2 className="text-lg font-bold mb-3 border-l-4 border-indigo-600 pl-2">5. Αναλυτικό Πρόγραμμα</h2>
        <table className="w-full text-xs mb-10 border">
          <thead className="bg-gray-100"><tr className="text-left"><th className="p-2">Ώρα</th><th className="p-2">Ημέρα</th><th className="p-2">Μάθημα</th><th className="p-2">Καθηγητής</th><th className="p-2">Αίθουσα</th></tr></thead>
          <tbody>
            {sortedSchedule.map((s: any, i: number) => (
              <tr key={i} className="border-b"><td className="p-2 font-mono">{s.time}</td><td className="p-2">{s.day}</td><td className="p-2 font-bold text-indigo-700">{s.subject}</td><td className="p-2">{s.teacher}</td><td className="p-2">{s.room || "-"}</td></tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-20 border-t pt-6 text-center">
           <div className="flex justify-between items-center text-gray-400 text-[10px] uppercase tracking-widest font-bold">
              <p>Confidential Document</p>
              <p>EduFlow ERP | Generated Automatically</p>
              <p>Version 3.0</p>
           </div>
           <div className="absolute bottom-4 left-0 right-0 opacity-10 pointer-events-none select-none text-center">
              <span className="text-[100px] font-black text-gray-800">EDUFLOW</span>
           </div>
        </div>
      </div>
    </div>
  );
}