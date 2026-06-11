"use client";
import { useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { RefreshCw } from "lucide-react";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSmartSchedule = () => {
    setLoading(true);
    
    // 1. Ανάκτηση δεδομένων από το localStorage
    const classes = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const rooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");

    // Διαθέσιμα slots (π.χ. 5 μέρες x 5 ώρες)
    const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή"];
    const hours = ["14:00", "15:00", "16:00", "17:00", "18:00"];

    const newSchedule: any[] = [];
    let slotIndex = 0;

    // 2. Logic: Μοίρασμα μαθημάτων χωρίς συγκρούσεις
    classes.forEach((cls: any) => {
      const teacher = teachers.find((t: any) => t.subject === cls.subject) || { name: "Αναζήτηση..." };
      const room = rooms[0] || { name: "Αίθουσα 1" };

      // Υπολογισμός ημέρας και ώρας βάσει του slotIndex
      const dayIndex = Math.floor(slotIndex / hours.length) % days.length;
      const hourIndex = slotIndex % hours.length;

      newSchedule.push({
        id: Math.random(),
        day: days[dayIndex],
        time: hours[hourIndex],
        className: cls.name,
        subject: cls.subject,
        teacher: teacher.name,
        room: room.name
      });

      slotIndex++; // Προχώρα στο επόμενο διαθέσιμο slot
    });

    setSchedule(newSchedule);
    setLoading(false);
  };

  return (
    <WorkspaceShell title="Auto Scheduler" description="Διαχείριση και δημιουργία προγράμματος.">
      <div className="p-4">
        <button 
          onClick={generateSmartSchedule} 
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mb-8 shadow-lg transition-all"
        >
          <RefreshCw size={18} /> {loading ? "Υπολογισμός..." : "Δημιουργία Προγράμματος"}
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4">Ημέρα</th>
                <th className="p-4">Ώρα</th>
                <th className="p-4">Τάξη</th>
                <th className="p-4">Μάθημα</th>
                <th className="p-4">Καθηγητής</th>
              </tr>
            </thead>
            <tbody>
              {schedule.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    Πατήστε το κουμπί "Δημιουργία Προγράμματος" για να ξεκινήσετε.
                  </td>
                </tr>
              ) : (
                schedule.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium">{s.day}</td>
                    <td className="p-4 text-cyan-600 font-bold">{s.time}</td>
                    <td className="p-4">{s.className}</td>
                    <td className="p-4 text-slate-700">{s.subject}</td>
                    <td className="p-4">{s.teacher}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </WorkspaceShell>
  );
}