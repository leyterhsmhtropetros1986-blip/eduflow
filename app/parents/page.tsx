"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";

export default function ParentsPage() {
  const [groupedParents, setGroupedParents] = useState<any>({});

  useEffect(() => {
    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");

    // Ομαδοποίηση ανά Τάξη
    const groups = students.reduce((acc: any, student: any) => {
      const className = student.className || "Χωρίς Τάξη";
      if (!acc[className]) acc[className] = [];
      
      // Αποθήκευση στοιχείων γονέα
      acc[className].push({
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail
      });
      return acc;
    }, {});

    setGroupedParents(groups);
  }, []);

  return (
    <WorkspaceShell title="Γονείς" description="Στοιχεία επικοινωνίας γονέων ανά τάξη.">
      <div className="p-6 space-y-8">
        {Object.keys(groupedParents).length === 0 && <p className="text-slate-500">Δεν βρέθηκαν εγγεγραμμένοι γονείς.</p>}
        
        {Object.entries(groupedParents).map(([className, parents]: any) => (
          <div key={className} className="bg-[#1e2330] p-6 rounded-2xl border border-slate-800">
            <h2 className="text-indigo-400 font-bold mb-4 border-b border-slate-700 pb-2">{className}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parents.map((p: any, i: number) => (
                <div key={i} className="bg-[#0b0e14] p-4 rounded-xl border border-slate-700 text-sm">
                  <p className="text-white font-bold">{p.parentName}</p>
                  <p className="text-slate-400 text-xs mt-1">Τηλ: {p.parentPhone}</p>
                  <p className="text-slate-400 text-xs">Email: {p.parentEmail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}