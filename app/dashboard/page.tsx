"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Users, GraduationCap, BookOpen, Calendar, Clock } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    classes: 0,
    teachers: 0,
    upcomingLessons: [] as any[]
  });

  useEffect(() => {
    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const classes = JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const schedule = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");

    setStats({
      students: students.length,
      classes: classes.length,
      teachers: teachers.length,
      upcomingLessons: schedule.slice(0, 5)
    });
  }, []);

  return (
    <WorkspaceShell title="EduFlow Operations" description="Κεντρικός έλεγχος λειτουργίας εκπαιδευτηρίου.">
      <div className="px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Εγγεγραμμένοι Μαθητές" value={stats.students} icon={<Users size={20} />} color="text-indigo-400" />
          <StatCard title="Ενεργά Τμήματα" value={stats.classes} icon={<BookOpen size={20} />} color="text-emerald-400" />
          <StatCard title="Καθηγητές" value={stats.teachers} icon={<GraduationCap size={20} />} color="text-amber-400" />
        </div>

        <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800">
          <h3 className="text-white font-bold flex items-center gap-2 mb-6">
            <Calendar className="text-indigo-400" size={18} /> Επόμενα Μαθήματα
          </h3>
          {stats.upcomingLessons.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingLessons.map((lesson: any, i: number) => (
                <div key={i} className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-white font-bold text-sm">{lesson.groupName}</p>
                    <p className="text-slate-500 text-[10px]">{lesson.teacher}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-400 text-xs font-bold">{lesson.day}</p>
                    <p className="text-slate-400 text-[10px]">{lesson.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-10">Δεν υπάρχουν μαθήματα.</p>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 flex flex-col gap-2">
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}