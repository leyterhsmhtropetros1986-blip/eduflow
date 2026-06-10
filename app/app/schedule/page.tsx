  "use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Calendar, RefreshCw, Printer, Download } from "lucide-react";

interface ScheduleEntry {
  id: string;
  day: string;
  timeSlot: string;
  studentName: string;
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
    // ... [Διατηρείς το logic σου εδώ, είναι σωστό] ...
    // (Συνέχεια του δικού σου κώδικα για το generate...)
    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const storedRooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");

    const generatedEntries: ScheduleEntry[] = [];
    const occupiedTeachers = new Set<string>();
    const occupiedRooms = new Set<string>();
    const occupiedStudents = new Set<string>();

    students.forEach((student: any) => {
      const studentCourses = student.courses || [];
      const studentAvailability = student.availability || {};
      const groupSize = student.groupSize || 1;

      studentCourses.forEach((courseTitle: string) => {
        const assignedTeacher = teachers.find((t: any) => t.subject === courseTitle); // Προσοχή: specialty ή subject ανάλογα τι αποθηκεύεις
        if (!assignedTeacher) return;

        const teacherAvailability = assignedTeacher.availability || {};
        let slotFound = false;

        for (const [day, slots] of Object.entries(studentAvailability)) {
          const typedSlots = slots as string[];
          for (const slot of typedSlots) {
            if (!teacherAvailability[day]?.includes(slot)) continue;

            for (const roomData of storedRooms) {
              if (roomData.capacity < groupSize) continue;
              const roomName = roomData.name;
              const tKey = `${day}-${slot}-${assignedTeacher.name}`;
              const rKey = `${day}-${slot}-${roomName}`;
              const sKey = `${day}-${slot}-${student.name}`;

              if (!occupiedTeachers.has(tKey) && !occupiedRooms.has(rKey) && !occupiedStudents.has(sKey)) {
                occupiedTeachers.add(tKey); occupiedRooms.add(rKey); occupiedStudents.add(sKey);
                generatedEntries.push({ id: `s-${Date.now()}`, day, timeSlot: slot, studentName: student.name, course: courseTitle, teacher: assignedTeacher.name, room: roomName });
                slotFound = true; break;
              }
            }
            if (slotFound) break;
          }
          if (slotFound) break;
        }
      });
    });
    setSchedule(generatedEntries);
    localStorage.setItem("eduflow_generated_schedule", JSON.stringify(generatedEntries));
    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = ["Ημέρα", "Ώρα", "Μαθητής", "Μάθημα", "Καθηγητής", "Αίθουσα"];
    const csvContent = [headers.join(","), ...schedule.map(s => [s.day, s.timeSlot, s.studentName, s.course, s.teacher, s.room].join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "programma_didaskalias.csv";
    link.click();
  };

  return (
    <WorkspaceShell title="Πρόγραμμα & Αναφορές" description="Διαχείριση και εξαγωγή προγράμματος.">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 pb-20">
        
        {/* SIDEBAR ΕΝΕΡΓΕΙΩΝ */}
        <div className="space-y-4">
          <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
            <button onClick={generateSmartSchedule} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl mb-4 flex items-center justify-center gap-2">
              <RefreshCw className={loading ? "animate-spin" : ""} /> {loading ? "Υπολογισμός..." : "Δημιουργία Προγράμματος"}
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
                  <th className="pb-3">Ημέρα</th> <th className="pb-3">Ώρα</th> <th className="pb-3">Μαθητής</th> <th className="pb-3">Μάθημα</th> <th className="pb-3">Καθηγητής</th> <th className="pb-3">Αίθουσα</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schedule.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="py-4 font-bold text-gray-800">{s.day}</td>
                    <td className="py-4 text-emerald-600 font-mono">{s.timeSlot}</td>
                    <td className="py-4 font-semibold">{s.studentName}</td>
                    <td className="py-4">{s.course}</td>
                    <td className="py-4">{s.teacher}</td>
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