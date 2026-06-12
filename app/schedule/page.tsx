"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { ClassesView } from "./ClassesView";
import { GridView } from "./GridView";
import { TeachersView } from "./TeachersView";
import { RoomsView } from "./RoomsView";
import { generateSchedule, GenResult } from "../../lib/autoSchedule";

import {
  Users,
  BookOpen,
  UserCheck,
  Building2,
  CalendarDays,
  Zap,
  AlertTriangle,
} from "lucide-react";

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
  const [genResult, setGenResult] = useState<GenResult | null>(null);

  const [data, setData] = useState({
    schedule: [],
    classes: [],
    students: [],
    teachers: [],
    rooms: [],
  });

  const [search, setSearch] = useState("");

  const loadData = () => {
    try {
      setData({
        schedule: JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"),
        // ✅ κανονικό key τμημάτων (με fallback)
        classes: JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]"),
        students: JSON.parse(localStorage.getItem("eduflow_students") || "[]"),
        teachers: JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"),
        rooms: JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"),
      });
    } catch (err) {
      console.error(err);
    }
  };

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

  // ⚡ ΑΥΤΟΜΑΤΗ ΔΗΜΙΟΥΡΓΙΑ ΠΡΟΓΡΑΜΜΑΤΟΣ
  const handleAutoGenerate = () => {
    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const classes = JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]");
    const rooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");
    const existing = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");

    if (existing.length > 0 && !confirm("Υπάρχει ήδη πρόγραμμα. Να αντικατασταθεί με νέο αυτόματο;")) return;

    const result = generateSchedule({ students, teachers, classes, rooms });
    localStorage.setItem("eduflow_schedule", JSON.stringify(result.schedule));
    loadData();
    setGenResult(result);
    setActiveTab("grid");
  };

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

      {/* Search + Auto Generate */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          placeholder="Αναζήτηση τμήματος / μαθητή..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:w-96 bg-[#1e2330] border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm"
        />
        <button
          onClick={handleAutoGenerate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition whitespace-nowrap"
        >
          <Zap size={16} /> Αυτόματη Δημιουργία Προγράμματος
        </button>
      </div>

      {/* Αποτέλεσμα αυτόματης δημιουργίας */}
      {genResult && (
        <div className="mb-6 bg-[#1e2330] border border-slate-800 rounded-2xl p-4 space-y-2">
          <p className="text-emerald-400 font-bold text-sm flex items-center gap-2">
            <Zap size={16} /> Τοποθετήθηκαν {genResult.placed} μαθήματα στο πρόγραμμα.
          </p>
          {genResult.unplaced.length > 0 && (
            <div className="space-y-1">
              <p className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle size={13} /> {genResult.unplaced.length} δεν τοποθετήθηκαν:
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {genResult.unplaced.map((u, i) => (
                  <div key={i} className="text-[11px] text-slate-400 bg-[#0b0e14] border border-slate-800 rounded-lg px-2.5 py-1.5">
                    <span className="text-slate-200 font-medium">{u.lessonName} → {u.className}</span>
                    <span className="text-slate-500"> ({u.students} μαθ.) — {u.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
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
            {(s.firstName?.[0] || s.lastName?.[0] || s.name?.[0] || "?").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-bold truncate">
              {[s.lastName, s.firstName].filter(Boolean).join(" ") || s.name || "Άγνωστος"}
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
