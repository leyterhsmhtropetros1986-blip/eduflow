"use client";

import { useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { RefreshCw, Layers, Users, MapPin, Lock, Calendar, CheckCircle2 } from "lucide-react";

interface ScheduleItem {
  id: string; day: string; time: string; groupName: string; teacher: string; room: string; type: "Auto" | "TeacherBusy";
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSmartSchedule = () => {
    setLoading(true);

    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const rooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");
    const classes = JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]");

    const newSchedule: ScheduleItem[] = [];
    const occupiedSlots: Record<string, boolean> = {}; 

    // 1. Προετοιμασία: Κλείδωμα Busy Ωρών Καθηγητών
    teachers.forEach((t: any) => {
      if (t.isLockedHours && t.lockedSlots) {
        t.lockedSlots.forEach((slot: any) => {
          occupiedSlots[`${slot.day}-${slot.time}-teacher-${t.id}`] = true;
          newSchedule.push({
            id: `busy-${t.id}-${slot.day}-${slot.time}`,
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

    // 2. Scheduling logic με έλεγχο διαθεσιμότητας
    const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
    const hours = Array.from({length: 15}, (_, i) => `${i + 9 < 10 ? '0' : ''}${i + 9}:00`);

    classes.forEach((c: any) => {
      let teacher = teachers.find((t: any) => t.subject === c.course) || teachers[0];
      if (!teacher) return;

      // Έλεγχος αν ο καθηγητής έχει κλειδωμένο τμήμα (αν ναι, έλεγχος ID)
      if (teacher.isLockedClass && teacher.assignedClassId !== c.id) return;

      let scheduled = false;
      
      for (const day of days) {
        if (scheduled) break;
        for (const time of hours) {
          
          // --- ΕΛΕΓΧΟΣ ΔΙΑΘΕΣΙΜΟΤΗΤΑΣ ---
          // 1. Είναι μέσα στα slots διαθεσιμότητας του καθηγητή;
          const isAvailable = teacher.availability?.some((slot: any) => 
            slot.day === day && time >= slot.start && time < slot.end
          );
          if (!isAvailable) continue;

          // 2. Είναι ήδη απασχολημένος;
          const teacherKey = `${day}-${time}-teacher-${teacher.id}`;
          if (occupiedSlots[teacherKey]) continue;

          // 3. Είναι διαθέσιμη η αίθουσα;
          const room = rooms.find((r: any) => !occupiedSlots[`${day}-${time}-room-${r.id}`]);
          
          if (room) {
            newSchedule.push({
              id: `sched-${c.id}-${day}-${time}`,
              day, time,
              groupName: c.name,
              teacher: teacher.name,
              room: room.name,
              type: "Auto"
            });

            occupiedSlots[teacherKey] = true;
            occupiedSlots[`${day}-${time}-room-${room.id}`] = true;
            scheduled = true;
            break; 
          }
        }
      }
    });

    setSchedule(newSchedule);
    setLoading(false);
  };

  return (
    <WorkspaceShell title="Scheduler" description="Αυτόματη δημιουργία προγράμματος βάσει διαθεσιμότητας.">
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
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-2xl bg-[#1e2330]/50">
              <Calendar className="mx-auto text-slate-600 mb-2" size={32} />
              <p className="text-slate-500 text-sm">Πατήστε για αυτόματη δημιουργία προγράμματος.</p>
            </div>
          ) : (
            schedule.map((s) => (
              <div key={s.id} className={`p-4 rounded-xl border flex items-center justify-between 
                ${s.type === 'TeacherBusy' ? 'bg-rose-900/10 border-rose-500/30' : 'bg-[#1e2330] border-slate-800'}`}>
                
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${s.type === 'TeacherBusy' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-indigo-400'}`}>
                    {s.type === 'TeacherBusy' ? <Lock size={20} /> : <CheckCircle2 size={20} />}
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