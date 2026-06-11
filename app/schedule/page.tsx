"use client";

import { useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { RefreshCw, Users, MapPin, Lock, Calendar, CheckCircle2, Clock } from "lucide-react";

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

    // 2. Scheduling logic
    const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
    const hours = Array.from({length: 15}, (_, i) => `${i + 9 < 10 ? '0' : ''}${i + 9}:00`);

    classes.forEach((c: any) => {
      let teacher = teachers.find((t: any) => t.subject === c.course) || teachers[0];
      if (!teacher) return;
      if (teacher.isLockedClass && teacher.assignedClassId !== c.id) return;

      let scheduled = false;
      for (const day of days) {
        if (scheduled) break;
        for (const time of hours) {
          const isAvailable = teacher.availability?.some((slot: any) => 
            slot.day === day && time >= slot.start && time < slot.end
          );
          if (!isAvailable) continue;

          const teacherKey = `${day}-${time}-teacher-${teacher.id}`;
          if (occupiedSlots[teacherKey]) continue;

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

  // Ομαδοποίηση για το UI
  const groupedSchedule = daysOrder.reduce((acc, day) => {
    acc[day] = schedule.filter(s => s.day === day);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  return (
    <WorkspaceShell title="Scheduler" description="Αυτόματη δημιουργία προγράμματος βάσει διαθεσιμότητας.">
      <div className="px-4 max-w-6xl mx-auto">
        <button 
          onClick={generateSmartSchedule} 
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 mb-8 shadow-lg transition-all font-bold text-sm"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> 
          {loading ? "Επεξεργασία..." : "Δημιουργία Προγράμματος"}
        </button>

        {schedule.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-[#1e2330]/30">
            <Calendar className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 text-sm">Δεν έχει δημιουργηθεί πρόγραμμα ακόμα.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {daysOrder.map(day => groupedSchedule[day].length > 0 && (
              <div key={day} className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800">
                <h3 className="text-indigo-400 font-bold text-xs uppercase mb-4 tracking-wider">{day}</h3>
                <div className="space-y-3">
                  {groupedSchedule[day].sort((a, b) => a.time.localeCompare(b.time)).map(s => (
                    <div key={s.id} className={`p-3 rounded-2xl border ${s.type === 'TeacherBusy' ? 'bg-rose-950/20 border-rose-900/50' : 'bg-[#0b0e14] border-slate-800'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold ${s.type === 'TeacherBusy' ? 'text-rose-300' : 'text-white'}`}>{s.groupName}</span>
                        <div className="flex items-center text-slate-500 gap-1 text-[10px]">
                           <Clock size={10} /> {s.time}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <Users size={12} /> {s.teacher}
                        </div>
                        {s.room !== "-" && (
                          <div className="text-[10px] bg-indigo-600/10 text-indigo-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <MapPin size={10} /> {s.room}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}

const daysOrder = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];