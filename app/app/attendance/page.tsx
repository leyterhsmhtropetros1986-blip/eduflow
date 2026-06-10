"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { CheckCircle, Bell, BellOff } from "lucide-react";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  // State για να ελέγχουμε αν το Push είναι ενεργό για κάθε μαθητή
  const [pushEnabled, setPushEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_attendance");
    if (stored) setAttendance(JSON.parse(stored));
  }, []);

  const changeStatus = (id: string, newStatus: string) => {
    const updated = attendance.map(item => item.id === id ? { ...item, status: newStatus } : item);
    setAttendance(updated);
    localStorage.setItem("eduflow_attendance", JSON.stringify(updated));

    // Logic αποστολής Push αν είναι Απών και το switch είναι ON
    if (newStatus === "Απών" && pushEnabled[id]) {
      alert(`🔔 Push Notification στάλθηκε στον γονέα του μαθητή: "Ο μαθητής είναι απών!"`);
      // Εδώ θα μπορούσε να μπει η κλήση του API σας
    }
  };

  const togglePush = (id: string) => {
    setPushEnabled(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <WorkspaceShell 
      title="Ημερήσιο Απουσιολόγιο" 
      description="Καταγραφή παρουσιών με αυτόματη ειδοποίηση γονέων μέσω Push."
    >
      <div className="px-4 pb-20">
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="pb-3">Μαθητής</th>
                  <th className="pb-3">Κατάσταση</th>
                  <th className="pb-3 text-center">Push Ειδοποίηση</th>
                  <th className="pb-3 text-right">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {attendance.map(row => (
                  <tr key={row.id}>
                    <td className="py-4 font-bold text-white">{row.student}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        row.status === "Παρών" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        row.status === "Απών" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>{row.status}</span>
                    </td>
                    
                    {/* ΤΟ ΝΕΟ TOGGLE SWITCH */}
                    <td className="py-4 text-center">
                      <button onClick={() => togglePush(row.id)} className="transition-all">
                        {pushEnabled[row.id] ? 
                          <Bell className="w-5 h-5 text-indigo-400" /> : 
                          <BellOff className="w-5 h-5 text-slate-600" />
                        }
                      </button>
                    </td>

                    <td className="py-4 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => changeStatus(row.id, "Παρών")} className="bg-emerald-600/10 text-emerald-400 px-2 py-1 rounded">Παρών</button>
                        <button onClick={() => changeStatus(row.id, "Απών")} className="bg-rose-600/10 text-rose-400 px-2 py-1 rounded">Απών</button>
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