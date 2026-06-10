"use client";

import { useEffect, useState } from "react";
import { Users, GraduationCap, Building, BookOpen } from "lucide-react";

export default function Dashboard() {
  const [counts, setCounts] = useState({
    students: 0,
    teachers: 0,
    rooms: 0,
    classes: 0,
  });

  useEffect(() => {
    // Διαβάζουμε τα δεδομένα από το localStorage για να μετρήσουμε το πλήθος
    const getCount = (key: string) => {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data).length : 0;
    };

    setCounts({
      students: getCount("eduflow_students"),
      teachers: getCount("eduflow_teachers"),
      rooms: getCount("eduflow_rooms"),
      classes: getCount("eduflow_classes"),
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Καλώς ήρθες, EduFlow Manager</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Μαθητές" count={counts.students} icon={<GraduationCap className="text-blue-400" />} />
        <DashboardCard title="Καθηγητές" count={counts.teachers} icon={<Users className="text-cyan-400" />} />
        <DashboardCard title="Αίθουσες" count={counts.rooms} icon={<Building className="text-indigo-400" />} />
        <DashboardCard title="Τμήματα" count={counts.classes} icon={<BookOpen className="text-violet-400" />} />
      </div>

      <div className="mt-12 bg-[#1e2330] p-8 rounded-3xl border border-slate-800">
        <h2 className="text-white font-bold mb-4">Πρόσφατη Δραστηριότητα</h2>
        <p className="text-slate-400 text-sm">Όλα τα συστήματα είναι λειτουργικά. Τα δεδομένα συγχρονίζονται τοπικά στον browser σου.</p>
      </div>
    </div>
  );
}

function DashboardCard({ title, count, icon }: { title: string, count: number, icon: React.ReactNode }) {
  return (
    <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-xs uppercase font-bold">{title}</p>
        <h2 className="text-white text-3xl font-bold mt-1">{count}</h2>
      </div>
      <div className="bg-[#0b0e14] p-3 rounded-2xl">{icon}</div>
    </div>
  );
}