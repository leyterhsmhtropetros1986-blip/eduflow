"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { RefreshCw, Calendar, Users, BookOpen, MapPin, School, GraduationCap, AlertCircle, Layers } from "lucide-react";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const report = students.reduce((acc: any, s: any) => {
      const schoolName = s.school || "Χωρίς Σχολείο";
      const gradeName = s.grade || "Χωρίς Τάξη";
      if (!acc[schoolName]) acc[schoolName] = { total: 0, grades: {} };
      acc[schoolName].total += 1;
      acc[schoolName].grades[gradeName] = (acc[schoolName].grades[gradeName] || 0) + 1;
      return acc;
    }, {});
    setStats(report);
  };

  const generateSmartSchedule = () => {
    setLoading(true);

    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const rooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");

    // 1. ΟΜΑΔΟΠΟΙΗΣΗ ΣΕ ΤΜΗΜΑΤΑ (Grouping)
    // Ομαδοποιούμε μαθητές με ίδιο Σχολείο, Τάξη, Μάθημα
    const groups: Record<string, any[]> = {};
    students.forEach((s: any) => {
      const key = `${s.school}-${s.grade}-${s.subject}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    const newSchedule: any[] = [];
    const occupiedTeachers: Record<string, boolean> = {}; // key: "day-time-teacherName"
    const occupiedRooms: Record<string, boolean> = {};    // key: "day-time-roomId"

    // 2. ΠΡΟΓΡΑΜΜΑΤΙΣΜΟΣ ΤΜΗΜΑΤΩΝ
    Object.entries(groups).forEach(([key, groupStudents]: any) => {
      const [school, grade, subject] = key.split('-');
      const teacher = teachers.find((t: any) => t.subject === subject);
      if (!teacher) return;

      // Βρες μια ώρα που είναι διαθέσιμοι οι περισσότεροι (για απλούστευση, παίρνουμε την 1η κοινή ώρα)
      // Σημείωση: Σε ένα real-world σύστημα, εδώ θα έτρεχες αλγόριθμο εύρεσης κοινής διαθεσιμότητας
      const firstStudent = groupStudents[0];
      let assigned = false;

      for (const [day, slots] of Object.entries(firstStudent.availability)) {
        const timeSlots = slots as string[];
        
        for (const time of timeSlots) {
          const teacherKey = `${day}-${time}-${teacher.name}`;
          if (occupiedTeachers[teacherKey]) continue; // Καθηγητής απασχολημένος

          const room = rooms.find((r: any) => 
            r.capacity >= groupStudents.length && 
            !occupiedRooms[`${day}-${time}-${r.id}`]
          );

          if (room) {
            newSchedule.push({
              id: Math.random(),
              day,
              time,
              groupName: `${grade} - ${subject}`, // Εμφάνιση τμήματος
              school,
              subject,
              teacher: teacher.name,
              room: room.name,
              count: groupStudents.length
            });
            
            occupiedTeachers[teacherKey] = true;
            occupiedRooms[`${day}-${time}-${room.id}`] = true;
            assigned = true;
            break;
          }
        }
        if (assigned) break;
      }
    });

    setSchedule(newSchedule);
    setLoading(false);
  };

  return (
    <WorkspaceShell title="Scheduler & Τμήματα" description="Αυτόματη ομαδοποίηση και ανάθεση.">
      {/* ... [Το κομμάτι των Stats παραμένει ίδιο] ... */}

      <div className="px-4">
        <button 
          onClick={generateSmartSchedule} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mb-6 shadow-lg transition-all"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> 
          {loading ? "Δημιουργία..." : "Δημιουργία Προγράμματος Τμημάτων"}
        </button>

        <div className="grid grid-cols-1 gap-3">
          {schedule.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg text-indigo-700"><Layers size={20} /></div>
                <div>
                  <p className="font-bold text-slate-800">{s.groupName}</p>
                  <p className="text-xs text-slate-500">{s.school} • {s.day}, {s.time}</p>
                </div>
              </div>

              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><Users size={16} /> {s.teacher}</div>
                <div className="flex items-center gap-2 text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded">
                  <MapPin size={16} /> {s.room} ({s.count} μαθητές)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}