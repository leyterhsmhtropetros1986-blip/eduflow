"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Calendar, RefreshCw, AlertCircle } from "lucide-react";

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

    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const storedRooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");

    if (students.length === 0 || teachers.length === 0 || storedRooms.length === 0) {
      alert("⚠️ Βεβαιωθείτε ότι υπάρχουν Μαθητές, Καθηγητές ΚΑΙ Αίθουσες!");
      setLoading(false);
      return;
    }

    const generatedEntries: ScheduleEntry[] = [];
    const occupiedTeachers = new Set<string>();
    const occupiedRooms = new Set<string>();
    const occupiedStudents = new Set<string>();

    students.forEach((student: any) => {
      const studentCourses = student.courses || [];
      const studentAvailability = student.availability || {};
      const groupSize = student.groupSize || 1; // Αν δεν υπάρχει, υποθέτουμε 1

      studentCourses.forEach((courseTitle: string) => {
        const assignedTeacher = teachers.find((t: any) => t.specialty === courseTitle);
        if (!assignedTeacher) return;

        const teacherAvailability = assignedTeacher.availability || {};
        let slotFound = false;

        for (const [day, slots] of Object.entries(studentAvailability)) {
          const typedSlots = slots as string[];
          
          for (const slot of typedSlots) {
            const isTeacherAvailable = teacherAvailability[day]?.includes(slot);
            if (!isTeacherAvailable) continue;

            // Έλεγχος σε όλες τις αίθουσες
            for (const roomData of storedRooms) {
              // ΕΛΕΓΧΟΣ ΧΩΡΗΤΙΚΟΤΗΤΑΣ
              if (roomData.capacity < groupSize) continue; 

              const roomName = roomData.name;
              const teacherKey = `${day}-${slot}-${assignedTeacher.name}`;
              const roomKey = `${day}-${slot}-${roomName}`;
              const studentKey = `${day}-${slot}-${student.name}`;

              if (!occupiedTeachers.has(teacherKey) && !occupiedRooms.has(roomKey) && !occupiedStudents.has(studentKey)) {
                occupiedTeachers.add(teacherKey);
                occupiedRooms.add(roomKey);
                occupiedStudents.add(studentKey);

                generatedEntries.push({
                  id: `slot-${Date.now()}-${Math.random()}`,
                  day,
                  timeSlot: slot,
                  studentName: student.name,
                  course: courseTitle,
                  teacher: assignedTeacher.name,
                  room: roomName
                });
                slotFound = true;
                break;
              }
            }
            if (slotFound) break;
          }
          if (slotFound) break;
        }
      });
    });

    const dayOrder = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
    generatedEntries.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) || a.timeSlot.localeCompare(b.timeSlot));

    setSchedule(generatedEntries);
    localStorage.setItem("eduflow_generated_schedule", JSON.stringify(generatedEntries));
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <WorkspaceShell title="Έξυπνη Δημιουργία Προγράμματος" description="Αυτόματη γεννήτρια με έλεγχο χωρητικότητας.">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 pb-20">
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <button onClick={generateSmartSchedule} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl transition flex items-center justify-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Ανάλυση..." : "Υπολογισμός"}
          </button>
        </div>
        <div className="lg:col-span-3 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Εβδομαδιαίο Πλάνο
          </h3>
          {schedule.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-[#0b0e14]/50">
              <p className="text-xs text-slate-400">Πατήστε "Υπολογισμός" για δημιουργία.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold text-[10px] uppercase">
                    <th className="pb-3">Ημέρα</th> <th className="pb-3">Ώρα</th> <th className="pb-3">Μαθητής</th> <th className="pb-3">Μάθημα</th> <th className="pb-3">Καθηγητής</th> <th className="pb-3">Αίθουσα</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {schedule.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/10 transition">
                      <td className="py-3 font-bold text-white">{s.day}</td>
                      <td className="py-3 font-mono text-emerald-400 font-semibold">{s.timeSlot}</td>
                      <td className="py-3 text-amber-400 font-bold">{s.studentName}</td>
                      <td className="py-3 text-slate-200 font-medium">{s.course}</td>
                      <td className="py-3 text-purple-300">{s.teacher}</td>
                      <td className="py-3"><span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded font-semibold">{s.room}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}