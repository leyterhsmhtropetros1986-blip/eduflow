"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { RefreshCw, Calendar, Users, BookOpen, MapPin, School, GraduationCap } from "lucide-react";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({}); // Για την αναφορά
  const [loading, setLoading] = useState(false);

  // Φόρτωση των στατιστικών μόλις ανοίξει η σελίδα
  useEffect(() => {
    calculateStats();
  }, []);

  const calculateStats = () => {
    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    
    // Ομαδοποίηση: { "Σχολείο": { "Τάξη": count } }
    const report = students.reduce((acc: any, s: any) => {
      const schoolName = s.school || "Χωρίς Σχολείο";
      if (!acc[schoolName]) acc[schoolName] = { total: 0, grades: {} };
      
      acc[schoolName].total += 1;
      acc[schoolName].grades[s.grade] = (acc[schoolName].grades[s.grade] || 0) + 1;
      return acc;
    }, {});
    
    setStats(report);
  };

  const generateSmartSchedule = () => {
    setLoading(true);

    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const rooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");

    const newSchedule: any[] = [];
    const occupiedSlots: Record<string, boolean> = {}; 

    students.forEach((student: any) => {
      const teacher = teachers.find((t: any) => t.subject === student.subject);
      const room = rooms[0]?.name || "Αίθουσα 1";

      if (!teacher) return; 

      for (const [day, slots] of Object.entries(student.availability)) {
        const timeSlots = slots as string[];
        let assigned = false;

        for (const time of timeSlots) {
          const key = `${day}-${time}-${teacher.name}`;
          if (!occupiedSlots[key]) {
            newSchedule.push({
              id: Math.random(),
              day,
              time,
              studentName: student.name,
              school: student.school, // Προσθήκη σχολείου
              grade: student.grade,
              subject: student.subject,
              teacher: teacher.name,
              room: room
            });
            occupiedSlots[key] = true;
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
    <WorkspaceShell title="Scheduler & Αναφορές" description="Στατιστικά ανά σχολείο και αυτόματο πρόγραμμα.">
      
      {/* 1. ΑΝΑΦΟΡΑ ΑΝΑ ΣΧΟΛΕΙΟ */}
      <div className="px-4 mb-8">
        <h3 className="text-white font-bold text-sm mb-4">Αναφορά ανά Σχολείο</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats).map(([school, data]: any) => (
            <div key={school} className="bg-[#1e2330] p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex items-center gap-2 text-indigo-400 mb-3">
                <School size={18} />
                <span className="font-bold text-sm">{school}</span>
              </div>
              <div className="space-y-1">
                {Object.entries(data.grades).map(([grade, count]: any) => (
                  <div key={grade} className="flex justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1"><GraduationCap size={12} /> {grade}</span>
                    <span className="font-bold text-white">{count} μαθητές</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SCHEDULER SECTION */}
      <div className="p-4">
        <button 
          onClick={generateSmartSchedule} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 mb-8 shadow-lg transition-all"
        >
          <RefreshCw size={18} /> {loading ? "Αντιστοίχιση..." : "Εκτέλεση Scheduler"}
        </button>

        <div className="grid grid-cols-1 gap-4">
          {schedule.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg text-indigo-700"><Calendar size={20} /></div>
                <div>
                  <p className="font-bold text-slate-800">{s.studentName}</p>
                  <p className="text-xs text-slate-500">{s.day}, {s.time} • <span className="font-semibold text-indigo-600">{s.school}</span></p>
                </div>
              </div>

              <div className="flex gap-8 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><BookOpen size={16} /> {s.subject}</div>
                <div className="flex items-center gap-2 text-slate-600"><Users size={16} /> {s.teacher}</div>
                <div className="flex items-center gap-2 text-slate-600"><MapPin size={16} /> {s.room}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}