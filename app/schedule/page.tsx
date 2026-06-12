"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { ClassesView } from "./ClassesView";
import { GridView } from "./GridView";
import { TeachersView } from "./TeachersView";
import { RoomsView } from "./RoomsView";

import {
  Users,
  BookOpen,
  UserCheck,
  Building2,
  CalendarDays,
} from "lucide-react";

// 1️⃣ Σωστό type αντί για `as any`
type TabType = "classes" | "grid" | "teachers" | "rooms" | "students";

const tabs: { id: TabType; label: string }[] = [
  { id: "classes", label: "🏫 Ανά Τάξη" },
  { id: "grid", label: "📅 Grid" },
  { id: "teachers", label: "👨‍🏫 Καθηγητές" },
  { id: "rooms", label: "🚪 Αίθουσες" },
  { id: "students", label: "👨‍🎓 Μαθητές" },
];

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<TabType>("classes");
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    schedule: [],
    classes: [],
    students: [],
    teachers: [],
    rooms: [],
  });

  const [search, setSearch] = useState("");

  // 4️⃣ Κεντρική συνάρτηση φόρτωσης (για να την ξανακαλούμε στο refresh)
  const loadData = () => {
    try {
      setData({
        schedule: JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"),
        classes: JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]"),
        students: JSON.parse(localStorage.getItem("eduflow_students") || "[]"),
        teachers: JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"),
        rooms: JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 4️⃣ Auto refresh:
  // - "storage"  -> αλλαγές από ΑΛΛΗ καρτέλα/παράθυρο
  // - "focus"    -> αλλαγές στην ΙΔΙΑ καρτέλα (όταν γυρνάς πίσω στη σελίδα)
  useEffect(() => {
    loadData();
    setLoading(false);

    window.addEventListener("storage", loadData);
    window.addEventListener("focus", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("focus", loadData);
    };
  }, []);

  // 3️⃣ Search και σε grade / course / subject
  const filteredClasses = useMemo(() => {
    if (!search.trim()) return data.classes;
    const q = search.toLowerCase();
    return data.classes.filter((cls: any) =>
      cls.name?.toLowerCase().includes(q) ||
      cls.grade?.toLowerCase().includes(q) ||
      cls.course?.toLowerCase().includes(q) ||
      cls.subject?.toLowerCase().includes(q)
    );
  }, [search, data.classes]);

  // Φιλτράρισμα μαθητών για το νέο tab
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return data.students;
    const q = search.toLowerCase();
    return data.students.filter((s: any) =>
      s.name?.toLowerCase().includes(q) ||
      s.lastName?.toLowerCase().includes(q) ||
      s.grade?.toLowerCase().includes(q)
    );
  }, [search, data.students]);

  return (
    <WorkspaceShell
      title="Master Scheduler"
      description="Πλήρης διαχείριση προγράμματος φροντιστηρίου"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={<BookOpen size={22} />} title="Τμήματα" value={data.classes.length} color="text-indigo-400" />
        <StatCard icon={<Users size={22} />} title="Μαθητές" value={data.students.length} color="text-emerald-400" />
        <StatCard icon={<UserCheck size={22} />} title="Καθηγητές" value={data.teachers.length} color="text-sky-400" />
        <StatCard icon={<Building2 size={22} />} title="Αίθουσες" value={data.rooms.length} color="text-amber-400" />
        <StatCard icon={<CalendarDays size={22} />} title="Μαθήματα" value={data.schedule.length} color="text-purple-400" />
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          placeholder="Αναζήτηση τμήματος / μαθητή..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-96 bg-[#1e2330] border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm"
        />
      </div>

      {/* 1️⃣ Tabs μέσω map (χωρίς `as any`) */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white"
                : "bg-[#1e2330] text-slate-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-slate-500 text-sm py-10 text-center">
          Φόρτωση δεδομένων...
        </div>
      ) : (
        <>
          {activeTab === "classes" && (
            <ClassesView schedule={data.schedule} classes={filteredClasses} students={data.students} />
          )}
          {activeTab === "grid" && (
            <GridView schedule={data.schedule} />
          )}
          {activeTab === "teachers" && (
            <TeachersView schedule={data.schedule} teachers={data.teachers} />
          )}
          {activeTab === "rooms" && (
            <RoomsView schedule={data.schedule} rooms={data.rooms} />
          )}
          {activeTab === "students" && (
            <StudentsView students={filteredStudents} />
          )}
        </>
      )}
    </WorkspaceShell>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: number; color: string; }) {
  return (
    <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-5 flex items-center justify-between">
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-500">{title}</p>
        <h3 className={`text-3xl font-black ${color}`}>{value}</h3>
      </div>
      <div className="text-slate-700">{icon}</div>
    </div>
  );
}

// Inline προβολή Μαθητών (αντικατέστησέ την με ξεχωριστό <StudentsView /> αν φτιάξεις)
function StudentsView({ students }: { students: any[] }) {
  if (!students || students.length === 0) {
    return (
      <div className="text-slate-500 text-sm py-10 text-center">
        Δεν βρέθηκαν μαθητές.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map((s: any, i: number) => (
        <div
          key={s.id ?? i}
          className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
            {(s.name?.[0] || "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold truncate">
              {[s.name, s.lastName].filter(Boolean).join(" ") || "Άγνωστος"}
            </p>
            <p className="text-slate-500 text-xs truncate">
              {s.grade || s.class || "—"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
