"use client";

import { useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { RefreshCw, Layers, Users, MapPin, CheckCircle2, AlertCircle, Lock } from "lucide-react";

interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  groupName: string;
  teacher: string;
  room: string;
  type: "Locked" | "Auto" | "TeacherBusy";
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSmartSchedule = () => {
    setLoading(true);

    // 1. Λήψη δεδομένων
    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const rooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");
    const classes = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");

    const newSchedule: ScheduleItem[] = [];
    const occupiedSlots: Record<string, boolean> = {}; // key: "day-time-teacherId" ή "day-time-roomId"

    // 2. ΠΡΟΕΠΕΞΕΡΓΑΣΙΑ: Κλείδωμα ωρών καθηγητών (Hard Constraints)
    teachers.forEach((t: any) => {
      if (t.isLockedHours && t.lockedSlots) {
        t.lockedSlots.forEach((slot: any) => {
          occupiedSlots[`${slot.day}-${slot.time}-teacher-${t.id}`] = true;
          
          newSchedule.push({
            id: Math.random(),
            day: slot.day,
            time: slot.time,
            groupName: "Μη Διαθέσιμος",
            teacher: t.name,
            room: "-",
            type: "TeacherBusy"
          });
        });
      }
    });

    // 3. Scheduling logic (απλοποιημένη προσέγγιση για 1 slot ανά τμήμα)
    const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή"];
    const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

    classes.forEach((c: any) => {
      const teacher = teachers.find((t: any) => t.subject === c.subject); // ή κατάλληλο matching
      if (!teacher) return;

      // Προσπάθεια εύρεσης ελεύθερης ώρας
      for (const day of days) {
        for (const time of times) {
          const teacherKey = `${day}-${time}-teacher-${teacher.id}`;
          
          // Έλεγχος αν ο καθηγητής είναι απασχολημένος
          if (occupiedSlots[teacherKey]) continue;

          // Έλεγχος αν ο καθηγητής έχει LockedClass και δεν είναι αυτό το τμήμα
          if (teacher.isLockedClass && teacher.assignedClassId !== c.name) continue;

          // Έλεγχος για διαθέσιμη αίθουσα
          const room = rooms.find((r: any) => !occupiedSlots[`${day}-${time}-room-${r.id}`]);

          if (room) {
            newSchedule.push({
              id: Math.random(),
              day,
              time,
              groupName: c.name,
              teacher: teacher.name,
              room: room.name,
              type: "Auto"
            });

            occupiedSlots[teacherKey] = true;
            occupiedSlots[`${day}-${time}-room-${room.id}`] = true;
            return; // Βρήκαμε ώρα για αυτό το τμήμα, πάμε στο επόμενο
          }
        }
      }
    });

    setSchedule(newSchedule);
    setLoading(false);
  };

  return (
    <WorkspaceShell title="Scheduler" description="Αυτόματη δημιουργία προγράμματος με βάση τις δεσμεύσεις.">
      <div className="px-4">
        <button 
          onClick={generateSmartSchedule} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mb-6 shadow-lg transition-all"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> 
          {loading ? "Επεξεργασία..." : "Δημιουργία Προγράμματος"}
        </button>

        <div className="grid grid-cols-1 gap-3">
          {schedule.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl">
              <AlertCircle className="mx-auto text-slate-600 mb-2" />
              <p className="text-slate-500 text-sm">Πατήστε το κουμπί για να ξεκινήσει η δημιουργία.</p>
            </div>
          ) : (
            schedule.map((s) => (
              <div key={s.id} className={`p-4 rounded-xl border flex items-center justify-between 
                ${s.type === 'Locked' ? 'bg-indigo-900/10 border-indigo-500/30' : 
                  s.type === 'TeacherBusy' ? 'bg-rose-900/10 border-rose-500/30' : 'bg-[#1e2330] border-slate-800'}`}>
                
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    s.type === 'Locked' ? 'bg-indigo-600 text-white' : 
                    s.type === 'TeacherBusy' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-indigo-400'
                  }`}>
                    {s.type === 'Locked' ? <CheckCircle2 size={20} /> : 
                     s.type === 'TeacherBusy' ? <Lock size={20} /> : <Layers size={20} />}
                  </div>
                  <div>
                    <p className={`font-bold ${s.type === 'TeacherBusy' ? 'text-rose-200' : 'text-white'}`}>{s.groupName}</p>
                    <p className="text-xs text-slate-400">{s.day}, {s.time}</p>
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-300"><Users size={16} /> {s.teacher}</div>
                  {s.room !== "-" && (
                    <div className="flex items-center gap-2 text-indigo-400 font-bold bg-indigo-950/30 px-2 py-1 rounded">
                      <MapPin size={16} /> {s.room}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}