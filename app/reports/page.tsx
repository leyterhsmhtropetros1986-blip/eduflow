"use client";

import { WorkspaceShell } from "../../components/WorkspaceShell";
import { FileDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [data, setData] = useState<any>({ students: [], teachers: [], parents: [] });

  useEffect(() => {
    setData({
      students: JSON.parse(localStorage.getItem("eduflow_students") || "[]"),
      teachers: JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"),
      parents: JSON.parse(localStorage.getItem("eduflow_parents") || "[]"),
    });
  }, []);

  return (
    <WorkspaceShell title="Αναφορές" description="Συγκεντρωτικά στοιχεία.">
      
      {/* 1. Αυτό το Box κρύβεται ΤΕΛΕΙΩΣ στην εκτύπωση με το print:hidden */}
      <div className="print:hidden bg-[#1e2330] p-8 rounded-3xl border border-slate-800 flex justify-between items-center mb-8">
        <div>
          <h2 className="text-white text-xl font-bold">Εξαγωγή Αναφορών</h2>
          <p className="text-slate-400 text-sm">Πάτα το κουμπί για αποθήκευση σε PDF.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all cursor-pointer"
        >
          <FileDown size={18} /> Εκτύπωση σε PDF
        </button>
      </div>

      {/* 2. Περιοχή Αναφοράς: Στην οθόνη είναι λευκό Box, στο PDF απλώνεται σε όλο το χαρτί */}
      <div className="bg-white p-8 text-black rounded-3xl print:absolute print:top-0 print:left-0 print:w-full print:p-0 print:bg-white print:text-black">
        <h1 className="text-2xl font-bold mb-6 print:text-black">
          Αναφορά EduFlow - {new Date().toLocaleDateString()}
        </h1>
        
        {/* Πίνακας Μαθητών */}
        <h2 className="text-xl font-semibold mb-2 mt-4 print:text-black">Μαθητές</h2>
        <table className="w-full mb-6 border-collapse border border-slate-300 print:border-black">
          <thead>
            <tr className="bg-slate-100 print:bg-slate-200">
              <th className="border p-2 border-slate-300 print:border-black print:text-black text-left">Όνομα</th>
              <th className="border p-2 border-slate-300 print:border-black print:text-black text-left">Τάξη</th>
            </tr>
          </thead>
          <tbody>
            {data.students.length > 0 ? (
              data.students.map((s: any, i: number) => (
                <tr key={i} className="print:bg-white">
                  <td className="border p-2 border-slate-300 print:border-black print:text-black">{s.name}</td>
                  <td className="border p-2 border-slate-300 print:border-black print:text-black">{s.grade}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="border p-2 text-center text-slate-500 print:text-black">
                  Δεν υπάρχουν καταχωρημένοι μαθητές.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Πίνακας Καθηγητών */}
        <h2 className="text-xl font-semibold mb-2 mt-4 print:text-black">Καθηγητές</h2>
        <table className="w-full mb-6 border-collapse border border-slate-300 print:border-black">
          <thead>
            <tr className="bg-slate-100 print:bg-slate-200">
              <th className="border p-2 border-slate-300 print:border-black print:text-black text-left">Όνομα</th>
              <th className="border p-2 border-slate-300 print:border-black print:text-black text-left">Μάθημα</th>
            </tr>
          </thead>
          <tbody>
            {data.teachers.length > 0 ? (
              data.teachers.map((t: any, i: number) => (
                <tr key={i} className="print:bg-white">
                  <td className="border p-2 border-slate-300 print:border-black print:text-black">{t.name}</td>
                  <td className="border p-2 border-slate-300 print:border-black print:text-black">{t.subject}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="border p-2 text-center text-slate-500 print:text-black">
                  Δεν υπάρχουν καταχωρημένοι καθηγητές.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </WorkspaceShell>
  );
}