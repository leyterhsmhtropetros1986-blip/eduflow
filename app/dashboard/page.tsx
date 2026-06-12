"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, GraduationCap, School, BookOpen, BarChart3, Target, TrendingUp } from "lucide-react";

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

  const classCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s: any) => { if (s.className) counts[s.className] = (counts[s.className] || 0) + 1; });
    return counts;
  }, [students]);

  const sortedSchedule = useMemo(() => {
    const dayOrder: Record<string, number> = { "Δευτέρα": 1, "Τρίτη": 2, "Τετάρτη": 3, "Πέμπτη": 4, "Παρασκευή": 5, "Σάββατο": 6, "Κυριακή": 7 };
    const parseTime = (t: string = "") => { const [h = "0", m = "0"] = t.split(":"); return Number(h) * 60 + Number(m); };
    
    return [...schedule].sort((a: any, b: any) => {
      const orderA = dayOrder[a.day] || 99;
      const orderB = dayOrder[b.day] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return parseTime(a.time) - parseTime(b.time);
    });
  }, [schedule]);

  const stats = useMemo(() => {
    const totalCapacity = classes.reduce((sum: number, c: any) => sum + (c.maxStudents || 20), 0);
    return {
      avgS: classes.length > 0 ? (students.length / classes.length).toFixed(1) : 0,
      ratio: teachers.length > 0 ? (students.length / teachers.length).toFixed(1) : 0,
      occupancy: totalCapacity > 0 ? Math.round((students.length / totalCapacity) * 100) : 0
    };
  }, [students, teachers, classes]);

  return (
    <div className="relative min-h-screen bg-white text-black p-8 max-w-5xl mx-auto font-sans print:p-0 overflow-hidden">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0, opacity: 0.04 }}>
        <span className="text-[140px] font-black text-gray-800 rotate-[-30deg]">EDUFLOW</span>
      </div>

      <div className="relative z-10">
        <style jsx global>{`
          table { page-break-inside: auto; border-collapse: collapse; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          h2 { page-break-after: avoid; }
        `}</style>

        {/* Header */}
        <div className="flex justify-between items-center border-b-4 border-indigo-600 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-lg">EF</div>
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
        <h2 className="text-lg font-bold mb-4">1. Executive Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-10">
          {[
            { l: "Μαθητές", v: students.length, i: <Users size={18} className="text-blue-600" /> },
            { l: "Καθηγητές", v: teachers.length, i: <GraduationCap size={18} className="text-purple-600" /> },
            { l: "Τμήματα", v: classes.length, i: <School size={18} className="text-emerald-600" /> },
            { l: "Μαθήματα", v: schedule.length, i: <BookOpen size={18} className="text-amber-600" /> },
            { l: "Μ.Ο. Μαθ/Τμήμα", v: stats.avgS, i: <BarChart3 size={18} className="text-indigo-600" /> },
            { l: "Αναλογία Μ/Κ", v: stats.ratio, i: <Target size={18} className="text-rose-600" /> },
            { l: "Πληρότητα", v: `${stats.occupancy}%`, i: <TrendingUp size={18} className="text-teal-600" /> }
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-50 p-3 rounded-xl border hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              {item.i}
              <p className="text-[8px] text-gray-500 uppercase font-bold mt-1">{item.l}</p>
              <p className="text-md font-black">{item.v}</p>
            </div>
          ))}
        </div>

        {/* Tables */}
        <h2 className="text-lg font-bold mb-3 border-l-4 border-indigo-600 pl-2">2. Αναλυτική Αναφορά Μαθητών</h2>
        <table className="w-full text-xs mb-10">
          <thead><tr className="bg-gray-100 border-b text-left"><th className="p-2">Ονοματεπώνυμο</th><th className="p-2">Τάξη</th><th className="p-2">Email</th></tr></thead>
          <tbody>{students.map((s: any, i: number) => <tr key={i} className="border-b"><td className="p-2">{s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "-"}</td><td className="p-2">{s.grade || "-"}</td><td className="p-2">{s.email || "-"}</td></tr>)}</tbody>
        </table>

        <h2 className="text-lg font-bold mb-3 border-l-4 border-indigo-600 pl-2">3. Αναφορά Καθηγητών</h2>
        <table className="w-full text-xs mb-10">
          <thead><tr className="bg-gray-100 border-b text-left"><th className="p-2">Όνομα</th><th className="p-2">Email</th></tr></thead>
          <tbody>{teachers.map((t: any, i: number) => <tr key={i} className="border-b"><td className="p-2">{t.name || "-"}</td><td className="p-2">{t.email || "-"}</td></tr>)}</tbody>
        </table>

        <h2 className="text-lg font-bold mb-3 border-l-4 border-indigo-600 pl-2">4. Αναφορά Τμημάτων</h2>
        <table className="w-full text-xs mb-10">
          <thead><tr className="bg-gray-100 border-b text-left"><th className="p-2">Τμήμα</th><th className="p-2">Μαθητές</th></tr></thead>
          <tbody>{classes.map((c: any, i: number) => <tr key={i} className="border-b"><td className="p-2">{c.name || c.className || "-"}</td><td className="p-2">{classCounts[c.name || c.className] || 0}</td></tr>)}</tbody>
        </table>

        {/* Schedule */}
        <h2 className="text-lg font-bold mb-3 border-l-4 border-indigo-600 pl-2">5. Πρόγραμμα</h2>
        <table className="w-full text-xs mb-10">
          <thead>
            <tr className="bg-gray-100 border-b text-left">
              <th className="p-2">Ώρα</th><th className="p-2">Ημέρα</th>
              <th className="p-2">Μάθημα</th><th className="p-2">Καθηγητής</th>
              <th className="p-2">Τμήμα</th><th className="p-2">Αίθουσα</th>
            </tr>
          </thead>
          <tbody>
            {sortedSchedule.map((s: any, i: number) => (
              <tr key={i} className="border-b">
                <td className="p-2 font-mono font-bold">{s.time}</td>
                <td className="p-2">{s.day}</td>
                <td className="p-2 text-indigo-700 font-bold">{s.subject}</td>
                <td className="p-2">{s.teacher}</td>
                <td className="p-2">{s.groupName || "-"}</td>
                <td className="p-2">{s.room || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-20 flex justify-between items-end border-t pt-4">
          <div>
            <p className="font-bold text-sm">EduFlow ERP - Version 2.1</p>
            <p className="text-xs text-gray-500">https://eduflow.gr | © 2026 EduFlow</p>
          </div>
          <div className="text-right">
            <div className="border-t w-48 border-black mb-2"></div>
            <p className="text-xs">Administrator Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}