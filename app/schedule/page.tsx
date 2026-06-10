"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Calendar, RefreshCw, Printer, Download } from "lucide-react";

// Ορισμός τύπου δεδομένων για το πρόγραμμα
interface ScheduleEntry {
  id: string;
  day: string;
  timeSlot: string;
  studentName: string; // Εδώ θα μπαίνει το όνομα της Τάξης
  course: string;
  teacher: string;
  room: string;
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_generated_schedule");
    if (stored) setSchedule(JSON.parse(stored));
  }, []);

  const generateSmartSchedule = () => {
    setLoading(true);

    // Φόρτωση δεδομένων από το localStorage
    const classes = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const storedRooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");

    if (classes.length === 0 || teachers.length === 0 || storedRooms.length === 0) {
      alert("⚠️ Βεβαιωθείτε ότι υπάρχουν Τάξεις, Καθηγητές ΚΑΙ Αίθουσες στο σύστημα!");
      setLoading(false);
      return;
    }

    const generatedEntries: ScheduleEntry[] = [];
    const occupiedTeachers = new Set<string>(); // Key: day-time-teacherName
    const occupiedRooms = new Set<string>();    // Key: day-time-roomName

    // --- ΛΟΓΙΚΗ CLASS-CENTRIC ---
    classes.forEach((cls: any) => {
      const classSchedule = cls.schedule || []; // Προϋποθέτει ότι η τάξη έχει ένα array 'schedule'

      classSchedule.forEach((slot: any) => {
        const { day, time, subject } = slot;

        // 1. Βρες καθηγητή για το μάθημα & έλεγχος διαθεσιμότητας
        const teacher = teachers.find((t: any) => 
          t.subject === subject && 
          t.availability[day]?.includes(time) &&
          !occupiedTeachers.has(`${day}-${time}-${t.name}`)
        );

        // 2. Βρες ελεύθερη αίθουσα
        const room = storedRooms.find((r: any) => 
          !occupiedRooms.has(`${day}-${time}-${r.name}`)
        );

        // 3. Αν βρεθούν, κλείδωσέ τα και πρόσθεσε στο πρόγραμμα
        if (teacher && room) {
          occupiedTeachers.add(`${day}-${time}-${teacher.name}`);
          occupiedRooms.add(`${day}-${time}-${room.name}`);

          generatedEntries.push({
            id: `slot-${Date.now()}-${Math.random()}`,
            day,
            timeSlot: time,
            studentName: cls.name, // Εδώ εμφανίζουμε το όνομα της Τάξης
            course: subject,
            teacher: teacher.name,
            room: room.name
          });
        }
      });
    });

    setSchedule(generatedEntries);
    localStorage.setItem("eduflow_generated_schedule", JSON.stringify(generatedEntries));
    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ["Ημέρα", "Ώρα", "Τάξη", "Μάθημα", "Καθηγητής", "Αίθουσα"];
    const csvContent = [headers.join(","), ...schedule.map(s => [s.day, s.timeSlot, s.studentName, s.course, s.teacher, s.room].join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "programma_didaskalias.csv";
    link.click();
  };

  return (
    <WorkspaceShell title="Πρόγραμμα & Αναφορές" description="Αυτόματη δημιουργία προγράμματος ανά τάξη.">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 pb-20">
        
        {/* SIDEBAR ΕΝΕΡΓΕΙΩΝ */}
        <div className="space-y-4">
          <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
            <button onClick={generateSmartSchedule} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl mb-4 flex items-center justify-center gap-2">
              <RefreshCw className={loading ? "animate-spin" : ""} /> {loading ? "Ανάλυση..." : "Υπολογισμός"}
            </button>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg flex justify-center"><Printer className="w-4 h-4"/></button>
              <button onClick={exportToCSV} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg flex justify-center"><Download className="w-4 h-4"/></button>
            </div>
          </div>
        </div>

        {/* ΠΙΝΑΚΑΣ ΑΝΑΦΟΡΑΣ */}
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-2xl print:shadow-none print:p-0">
          <h3 className="text-xl font-bold text-gray-800 mb-6 print:block hidden">Επίσημο Πρόγραμμα Διδασκαλίας</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-600">
              <thead className="text-gray-900 border-b border-gray-200">
                <tr>
                  <th className="pb-3">Ημέρα</th> <th className="pb-3">Ώρα</th> <th className="pb-3">Τάξη</th> <th className="pb-3">Μάθημα</th> <th className="pb-3">Καθηγητής</th> <th className="pb-3">Αίθουσα</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schedule.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-4 font-bold text-gray-800">{s.day}</td>
                    <td className="py-4 text-emerald-600 font-mono">{s.timeSlot}</td>
                    <td className="py-4 font-semibold text-indigo-600">{s.studentName}</td>
                    <td className="py-4 text-gray-700">{s.course}</td>
                    <td className="py-4 text-gray-600">{s.teacher}</td>
                    <td className="py-4"><span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">{s.room}</span></td>
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