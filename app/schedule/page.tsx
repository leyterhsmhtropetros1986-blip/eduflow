"use client";

import { useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { RefreshCw, Layers, Users, MapPin, CheckCircle2, AlertCircle } from "lucide-react";

interface ScheduleItem {
  id: number;
  day: string;
  time: string;
  groupName: string;
  teacher: string;
  room: string;
  count: number;
  type: "Locked" | "Auto";
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
    const occupiedTeachers: Record<string, boolean> = {}; 
    const occupiedRooms: Record<string, boolean> = {}; 

    // 2. Διαχωρισμός (Locked vs Auto)
    const lockedStudents = students.filter((s: any) => s.isClassEnabled && s.assignedClassId);
    const autoStudents = students.filter((s: any) => !s.isClassEnabled || !s.assignedClassId);

    // 3. Ομαδοποίηση
    const lockedGroups: Record<string, any[]> = {};
    lockedStudents.forEach((s: any) => {
      if (!lockedGroups[s.assignedClassId]) lockedGroups[s.assignedClassId] = [];
      lockedGroups[s.assignedClassId].push(s);
    });

    const autoGroups: Record<string, any[]> = {};
    autoStudents.forEach((s: any) => {
      const key = `${s.school}-${s.grade}-${s.subject}`;
      if (!autoGroups[key]) autoGroups[key] = [];
      autoGroups[key].push(s);
    });

    // 4. Επεξεργασία Locked (Προτεραιότητα)
    Object.entries(lockedGroups).forEach(([classId, groupStudents]: any) => {
      const targetClass = classes.find((c: any) => c.id === classId);
      if (!targetClass) return;

      const teacher = teachers.find((t: any) => t.id === targetClass.teacherId);
      if (!teacher) return;

      scheduleGroup(groupStudents, teacher, targetClass.name, rooms, newSchedule, occupiedTeachers, occupiedRooms, "Locked");
    });

    // 5. Επεξεργασία Auto
    const availableTeachers = teachers.filter((t: any) => !t.isClassEnabled);

    Object.entries(autoGroups).forEach(([key, groupStudents]: any) => {
      const [school, grade, subject] = key.split('-');
      const teacher = availableTeachers.find((t: any) => t.subject === subject);
      if (!teacher) return;

      scheduleGroup(groupStudents, teacher, `${grade} - ${subject}`, rooms, newSchedule, occupiedTeachers, occupiedRooms, "Auto");
    });

    setSchedule(newSchedule);
    setLoading(false);
  };

  const scheduleGroup = (
    students: any[], 
    teacher: any, 
    groupName: string, 
    rooms: any[], 
    newSchedule: ScheduleItem[], 
    occupiedTeachers: Record<string, boolean>, 
    occupiedRooms: Record<string, boolean>, 
    type: "Locked" | "Auto"
  ) => {
    if (!students || students.length === 0) return;
    const firstStudent = students[0];
    if (!firstStudent.availability) return;

    for (const [day, slots] of Object.entries(firstStudent.availability)) {
      const timeSlots = slots as string[];
      for (const time of timeSlots) {
        const teacherKey = `${day}-${time}-${teacher.id}`;
        if (occupiedTeachers[teacherKey]) continue;

        const room = rooms.find((r: any) => 
          r.capacity >= students.length && 
          !occupiedRooms[`${day}-${time}-${r.id}`]
        );

        if (room) {
          newSchedule.push({
            id: Math.random(),
            day,
            time,
            groupName,
            teacher: teacher.name,
            room: room.name,
            count: students.length,
            type
          });
          occupiedTeachers[teacherKey] = true;
          occupiedRooms[`${day}-${time}-${room.id}`] = true;
          return; // Σταματάμε μετά την επιτυχημένη ανάθεση για αυτή την ομάδα
        }
      }
    }
  };

  return (
    <WorkspaceShell title="Scheduler" description="Αυτόματη ανάθεση τμημάτων βάσει διαθεσιμότητας.">
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
              <div key={s.id} className={`p-4 rounded-xl border flex items-center justify-between ${s.type === 'Locked' ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-[#1e2330] border-slate-800'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${s.type === 'Locked' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400'}`}>
                    {s.type === 'Locked' ? <CheckCircle2 size={20} /> : <Layers size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-white">{s.groupName}</p>
                    <p className="text-xs text-slate-400">{s.day}, {s.time}</p>
                  </div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2 text-slate-300"><Users size={16} /> {s.teacher}</div>
                  <div className="flex items-center gap-2 text-indigo-400 font-bold bg-indigo-950/30 px-2 py-1 rounded">
                    <MapPin size={16} /> {s.room} ({s.count} μαθητές)
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}