"use client";
import { useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { RefreshCw, Download } from "lucide-react";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSmartSchedule = () => {
    setLoading(true);
    
    // Ανάκτηση δεδομένων από το localStorage
    const classes = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const rooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");

    const newSchedule: any[] = [];
    const used = new Set(); // Για αποφυγή συγκρούσεων

    // Καθορισμός Διαθεσιμότητας
    const hours = {
      weekdays: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"],
      saturday: ["09:00", "10:00", "11:00", "12:00", "13:00"]
    };

    classes.forEach((cls: any) => {
      // Logic: Για κάθε τάξη, ψάξε καθηγητή για το μάθημα και αίθουσα
      const teacher = teachers.find((t: any) => t.subject === cls.subject);
      const room = rooms[0]; // Απλή αντιστοίχιση αιθουσών

      if (teacher && room) {
        // Εδώ προσθέτουμε εγγραφές στο πρόγραμμα
        newSchedule.push({
          id: Math.random(),
          day: "Δευτέρα",
          time: "14:00",
          className: cls.name,
          subject: cls.subject,
          teacher: teacher.name,
          room: room.name
        });
      }
    });

    setSchedule(newSchedule);
    setLoading(false);
  };

  return (
    <WorkspaceShell title="Auto Scheduler" description="Διαχείριση προγράμματος διδασκαλίας.">
      <div className="p-4">
        <button onClick={generateSmartSchedule} className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mb-6">
          <RefreshCw size={18} /> {loading ? "Υπολογισμός..." : "Δημιουργία Προγράμματος"}
        </button>

        <div className="bg-white rounded-2xl border p-6">
          <table className="w-full text-left">
            <thead><tr className="border-b"><th>Ημέρα</th><th>Ώρα</th><th>Τάξη</th><th>Μάθημα</th><th>Καθηγητής</th></tr></thead>
            <tbody>
              {schedule.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3">{s.day}</td>
                  <td className="p-3 text-cyan-600 font-bold">{s.time}</td>
                  <td className="p-3">{s.className}</td>
                  <td className="p-3">{s.subject}</td>
                  <td className="p-3">{s.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WorkspaceShell>
  );
}