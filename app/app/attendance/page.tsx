"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_attendance");
    if (stored) {
      setAttendance(JSON.parse(stored));
    } else {
      const defaultRecords = [
        { id: "r1", student: "Γιάννης Παπαδόπουλος", course: "Μαθηματικά", date: "2026-06-06", status: "Παρών" },
        { id: "r2", student: "Μαρία Κωνσταντίνου", course: "Φυσική", date: "2026-06-06", status: "Απών" },
        { id: "r3", student: "Νίκος Γεωργίου", course: "Έκθεση", date: "2026-06-06", status: "Αργοπορημένος" }
      ];
      localStorage.setItem("eduflow_attendance", JSON.stringify(defaultRecords));
      setAttendance(defaultRecords);
    }
  }, []);

  const changeStatus = (id: string, newStatus: string) => {
    const updated = attendance.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setAttendance(updated);
    localStorage.setItem("eduflow_attendance", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell 
      title="Ημερήσιο Απουσιολόγιο & Παρουσίες" 
      description="Άμεση καταγραφή της κατάστασης προσέλευσης των μαθητών ανά διδακτική ώρα και ενημέρωση των γονέων."
    >
      <div className="px-4 pb-20">
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Λίστα Παρακολούθησης Σημερινών Τμημάτων
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-mono">
              Συγχρονίστηκε: Μόλις τώρα
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-[10px] uppercase">
                  <th className="pb-3">Μαθητής</th>
                  <th className="pb-3">Μάθημα</th>
                  <th className="pb-3">Ημερομηνία</th>
                  <th className="pb-3">Κατάσταση</th>
                  <th className="pb-3 text-right">Ενέργειες Αλλαγής</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {attendance.map(row => (
                  <tr key={row.id} className="hover:bg-slate-800/10 transition">
                    <td className="py-4 font-bold text-white">{row.student}</td>
                    <td className="py-4 text-slate-300 font-medium">{row.course}</td>
                    <td className="py-4 text-slate-500 font-mono">{row.date}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status === "Παρών" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        row.status === "Απών" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => changeStatus(row.id, "Παρών")} className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2 py-1 text-[10px] font-semibold rounded transition">Παρών</button>
                        <button onClick={() => changeStatus(row.id, "Απών")} className="bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white px-2 py-1 text-[10px] font-semibold rounded transition">Απών</button>
                        <button onClick={() => changeStatus(row.id, "Αργοπορημένος")} className="bg-amber-600/10 hover:bg-amber-600 text-amber-400 hover:text-white px-2 py-1 text-[10px] font-semibold rounded transition">Καθυστέρηση</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}