"use client";

import { useEffect, useState } from "react";

export default function ReportsPDFPage() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
    setClasses(JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]"));
    setSchedule(JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"));
  }, []);

  return (
    <div className="bg-white min-h-screen text-black p-8 max-w-5xl mx-auto font-sans print:p-0">
      
      {/* 5. Header με χρώμα */}
      <div className="border-b-4 border-indigo-600 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-indigo-700 uppercase">EduFlow</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Smart Tutoring ERP</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold">REPORT</h2>
          <p className="text-sm font-mono">{new Date().toLocaleDateString("el-GR")} {new Date().toLocaleTimeString("el-GR", {hour: '2-digit', minute: '2-digit'})}</p>
        </div>
      </div>

      {/* 2. Executive Summary */}
      <div className="bg-gray-50 p-4 border rounded-lg mb-8">
        <h3 className="font-bold text-sm mb-2 uppercase border-b pb-1">Σύνοψη (Executive Summary)</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <p>• Σύνολο μαθητών: <strong>{students.length}</strong></p>
          <p>• Σύνολο καθηγητών: <strong>{teachers.length}</strong></p>
          <p>• Σύνολο τμημάτων: <strong>{classes.length}</strong></p>
          <p>• Σύνολο μαθημάτων: <strong>{schedule.length}</strong></p>
        </div>
      </div>

      {/* 1 & 6. Compact KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <Stat title="Μαθητές" value={students.length} />
        <Stat title="Καθηγητές" value={teachers.length} />
        <Stat title="Τμήματα" value={classes.length} />
        <Stat title="Μαθήματα" value={schedule.length} />
      </div>

      {/* 3. Αναλυτική Αναφορά Μαθητών */}
      <h2 className="text-lg font-bold mb-3 border-l-4 border-indigo-600 pl-2">ΑΝΑΛΥΤΙΚΗ ΑΝΑΦΟΡΑ ΜΑΘΗΤΩΝ</h2>
      <table className="w-full border-collapse text-xs mb-10">
        <thead>
          <tr className="bg-gray-100 border-b">
            {["Ονοματεπώνυμο", "Τάξη", "Γονέας", "Κινητό", "Email", "Μαθήματα"].map(h => <th key={h} className="p-2 text-left border">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {students.map((s: any, i: number) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="p-2 border">{s.name || `${s.firstName} ${s.lastName}`}</td>
              <td className="p-2 border">{s.grade || "-"}</td>
              <td className="p-2 border">{s.parentName || "-"}</td>
              <td className="p-2 border">{s.phone || "-"}</td>
              <td className="p-2 border">{s.email || "-"}</td>
              <td className="p-2 border">{s.subjects || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 7. Αναφορά Καθηγητών */}
      <h2 className="text-lg font-bold mb-3 border-l-4 border-indigo-600 pl-2">ΑΝΑΛΥΤΙΚΗ ΑΝΑΦΟΡΑ ΚΑΘΗΓΗΤΩΝ</h2>
      <table className="w-full border-collapse text-xs mb-10">
        <tr className="bg-gray-100 border-b">
          <th className="p-2 border text-left">Όνομα</th>
          <th className="p-2 border text-left">Ειδικότητα</th>
          <th className="p-2 border text-left">Email</th>
        </tr>
        {teachers.map((t: any, i: number) => (
          <tr key={i} className="border-b">
            <td className="p-2 border">{t.name}</td>
            <td className="p-2 border">{t.specialty || "-"}</td>
            <td className="p-2 border">{t.email}</td>
          </tr>
        ))}
      </table>

      {/* 8. Αναφορά Τμημάτων */}
      <h2 className="text-lg font-bold mb-3 border-l-4 border-indigo-600 pl-2">ΤΜΗΜΑΤΑ</h2>
      <table className="w-full border-collapse text-xs mb-10">
        <tr className="bg-gray-100 border-b">
          <th className="p-2 border text-left">Τμήμα</th>
          <th className="p-2 border text-left">Μαθητές</th>
          <th className="p-2 border text-left">Καθηγητής</th>
          <th className="p-2 border text-left">Αίθουσα</th>
        </tr>
        {classes.map((c: any, i: number) => (
          <tr key={i} className="border-b">
            <td className="p-2 border">{c.name}</td>
            <td className="p-2 border">{c.studentCount || 0}</td>
            <td className="p-2 border">{c.teacherName || "-"}</td>
            <td className="p-2 border">{c.room || "-"}</td>
          </tr>
        ))}
      </table>

      {/* 4. Footer */}
      <div className="mt-16 border-t pt-4 text-center text-[10px] text-gray-400">
        <p className="font-bold text-gray-600">EduFlow ERP</p>
        <p>Generated: {new Date().toLocaleString("el-GR")}</p>
        <p className="uppercase italic mt-1">Confidential Report - Page 1</p>
      </div>

      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 shadow-sm hover:border-indigo-300">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{title}</p>
      <h3 className="text-xl font-black">{value}</h3>
    </div>
  );
}