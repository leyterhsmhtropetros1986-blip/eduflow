"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import {
  Users, GraduationCap, BookOpen, Calendar, Clock,
  Search, Plus, Bell, ShieldCheck, Activity, CloudSun,
  Layers, BarChart3, CheckCircle2, AlertTriangle, Lock, HardDrive, Brain,
  Zap, DoorOpen,
} from "lucide-react";

// --- CONFIG (configurable αντί για hardcoded) ---
const SCHOOL_CONFIG = {
  city: "Χαλκίδα",
  subtitle: "Κεντρικά Εκπαιδευτήρια",
  lat: 38.4633,
  lon: 23.5983,
};

// --- INTERFACES ---
interface Student { id: string; firstName: string; lastName: string; grade: string; section: string; parentName: string; isLockedHours: boolean; phone?: string; email?: string; parentPhone?: string; }
interface Teacher { id: string; name: string; subjects: string[]; phone?: string; email?: string; }
interface ClassData { id: string; className: string; grade: string; currentCapacity: number; maxCapacity: number; }
interface ScheduleItem { groupName: string; teacher: string; day: string; time: string; subject: string; room?: string; }
interface Room { id?: string; name?: string; capacity?: number; }
interface Course { id?: string; name?: string; title?: string; subject?: string; }

interface WeatherState { temp: number | null; desc: string; loading: boolean; }

// --- COLOR PALETTE ΓΙΑ SUBJECTS (στατικά Tailwind classes) ---
const SUBJECT_COLORS = [
  { dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-950", border: "border-emerald-900/40" },
  { dot: "bg-sky-400", text: "text-sky-300", bg: "bg-sky-950", border: "border-sky-900/40" },
  { dot: "bg-purple-400", text: "text-purple-300", bg: "bg-purple-950", border: "border-purple-900/40" },
  { dot: "bg-amber-400", text: "text-amber-300", bg: "bg-amber-950", border: "border-amber-900/40" },
  { dot: "bg-rose-400", text: "text-rose-300", bg: "bg-rose-950", border: "border-rose-900/40" },
  { dot: "bg-cyan-400", text: "text-cyan-300", bg: "bg-cyan-950", border: "border-cyan-900/40" },
];
function getSubjectColor(subject: string) {
  let hash = 0;
  const s = subject || "";
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

// --- WMO weather code -> ελληνική περιγραφή ---
function weatherCodeToText(code: number): string {
  if (code === 0) return "Αίθριος";
  if ([1, 2, 3].includes(code)) return "Λίγα σύννεφα";
  if ([45, 48].includes(code)) return "Ομίχλη";
  if ([51, 53, 55, 56, 57].includes(code)) return "Ψιχάλα";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Βροχή";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Χιόνι";
  if ([95, 96, 99].includes(code)) return "Καταιγίδα";
  return "—";
}

// --- PURE CONFLICT / EMPTY DETECTORS ---
function detectTeacherConflicts(schedule: ScheduleItem[]): string[] {
  const map: Record<string, number> = {};
  const out: string[] = [];
  schedule.forEach((s) => {
    if (!s.teacher || !s.day || !s.time) return;
    const key = `${s.teacher}|${s.day}|${s.time}`;
    map[key] = (map[key] || 0) + 1;
  });
  Object.entries(map).forEach(([key, count]) => {
    if (count > 1) {
      const [teacher, day, time] = key.split("|");
      out.push(`⚠ Σύγκρουση καθηγητή: ${teacher} (${day} ${time}).`);
    }
  });
  return out;
}
function detectRoomConflicts(schedule: ScheduleItem[]): string[] {
  const map: Record<string, number> = {};
  const out: string[] = [];
  schedule.forEach((s) => {
    if (!s.room || !s.day || !s.time) return;
    const key = `${s.room}|${s.day}|${s.time}`;
    map[key] = (map[key] || 0) + 1;
  });
  Object.entries(map).forEach(([key, count]) => {
    if (count > 1) {
      const [room, day, time] = key.split("|");
      out.push(`⚠ Σύγκρουση αίθουσας: ${room} (${day} ${time}).`);
    }
  });
  return out;
}
function detectEmptyClasses(classes: ClassData[]): string[] {
  return classes
    .filter((c) => (c.currentCapacity || 0) === 0)
    .map((c) => `🪑 Τμήμα ${c.className}: κανένας μαθητής.`);
}

export default function DashboardPage() {
  const router = useRouter();

  // Ασφάλεια για Next.js SSR / Hydration
  const [isMounted, setIsMounted] = useState(false);

  // --- STATES ---
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCoursesCount, setTotalCoursesCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFabOpen, setIsFabOpen] = useState(false);

  // Client-side Time States
  const [currentGreeting, setCurrentGreeting] = useState("Καλημέρα");
  const [currentDateString, setCurrentDateString] = useState("");
  const [currentGreekDay, setCurrentGreekDay] = useState("");

  // Animated Counters
  const [animatedTotalStudents, setAnimatedTotalStudents] = useState(0);
  const [animatedTotalTeachers, setAnimatedTotalTeachers] = useState(0);
  const [animatedTotalClasses, setAnimatedTotalClasses] = useState(0);

  // Weather (live)
  const [weather, setWeather] = useState<WeatherState>({ temp: null, desc: "Φόρτωση...", loading: true });

  // --- DATA HYDRATION (BROWSER ONLY) ---
  useEffect(() => {
    setIsMounted(true);

    const rawStudents = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const rawTeachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const rawClasses = JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]");
    const rawSchedule = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");
    const rawRooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");
    const rawCourses = JSON.parse(localStorage.getItem("eduflow_courses") || "[]");

    setStudents(rawStudents);
    setTeachers(rawTeachers);
    setClasses(rawClasses);
    setSchedule(rawSchedule);
    setRooms(rawRooms);
    setCourses(rawCourses);
    setTotalCoursesCount(rawCourses.length || 0);

    const now = new Date();
    const hour = now.getHours();
    setCurrentGreeting(hour < 14 ? "Καλημέρα" : "Καλησπέρα");
    setCurrentDateString(now.toLocaleDateString("el-GR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    const days = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
    setCurrentGreekDay(days[now.getDay()]);

    setTimeout(() => setAnimatedTotalStudents(rawStudents.length), 100);
    setTimeout(() => setAnimatedTotalTeachers(rawTeachers.length), 200);
    setTimeout(() => setAnimatedTotalClasses(rawClasses.length), 300);
  }, []);

  // --- LIVE WEATHER (open-meteo, χωρίς API key) ---
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${SCHOOL_CONFIG.lat}&longitude=${SCHOOL_CONFIG.lon}&current_weather=true`
        );
        const json = await res.json();
        if (active && json?.current_weather) {
          setWeather({
            temp: Math.round(json.current_weather.temperature),
            desc: weatherCodeToText(json.current_weather.weathercode),
            loading: false,
          });
        } else if (active) {
          setWeather({ temp: null, desc: "Μη διαθέσιμο", loading: false });
        }
      } catch {
        if (active) setWeather({ temp: null, desc: "Μη διαθέσιμο", loading: false });
      }
    })();
    return () => { active = false; };
  }, []);

  // --- DERIVED METRICS ---
  const todaysLessons = useMemo(
    () => schedule.filter((item) => item.day?.toLowerCase() === currentGreekDay.toLowerCase()),
    [schedule, currentGreekDay]
  );

  const totalLockedHoursCount = useMemo(
    () => students.filter((s) => s.isLockedHours).length,
    [students]
  );

  const gradeStats = useMemo(() => {
    const counts = { aGym: 0, bGym: 0, cGym: 0, gymTotal: 0, lykTotal: 0 };
    students.forEach((s) => {
      const g = (s.grade || "").toUpperCase();
      if (g.includes("Α ΓΥΜΝΑΣΙΟΥ")) counts.aGym++;
      if (g.includes("Β ΓΥΜΝΑΣΙΟΥ")) counts.bGym++;
      if (g.includes("Γ ΓΥΜΝΑΣΙΟΥ")) counts.cGym++;
      if (g.includes("ΓΥΜΝΑΣΙΟΥ")) counts.gymTotal++;
      if (g.includes("ΛΥΚΕΙΟΥ") || g.includes("ΜΕΤΑΛΥΚΕΙΑΚΟΙ")) counts.lykTotal++;
    });
    return counts;
  }, [students]);

  // Δεδομένα για τα πραγματικά charts
  const gradeChartData = useMemo(
    () => [
      { name: "Α Γυμν.", value: gradeStats.aGym },
      { name: "Β Γυμν.", value: gradeStats.bGym },
      { name: "Γ Γυμν.", value: gradeStats.cGym },
    ],
    [gradeStats]
  );
  const levelChartData = useMemo(
    () => [
      { name: "Γυμνάσιο", value: gradeStats.gymTotal },
      { name: "Λύκειο", value: gradeStats.lykTotal },
    ],
    [gradeStats]
  );

  // --- CONFLICTS (δυναμικά) ---
  const teacherConflicts = useMemo(() => detectTeacherConflicts(schedule), [schedule]);
  const roomConflicts = useMemo(() => detectRoomConflicts(schedule), [schedule]);
  const totalConflicts = teacherConflicts.length + roomConflicts.length;

  // --- NOTIFICATIONS (από πραγματικούς ελέγχους) ---
  const notifications = useMemo(() => {
    const alerts: string[] = [];
    const noSection = students.filter((s) => !s.section);
    if (noSection.length > 0) alerts.push(`🔴 ${noSection.length} μαθητές χωρίς τμήμα.`);

    const locked = students.filter((s) => s.isLockedHours).length;
    if (locked > 0) alerts.push(`🟡 ${locked} κλειδωμένα ωράρια προς έλεγχο.`);

    alerts.push(...teacherConflicts, ...roomConflicts, ...detectEmptyClasses(classes));

    if (schedule.length === 0) {
      alerts.push("❌ Ο Scheduler είναι άδειος για αυτή την εβδομάδα.");
    } else if (teacherConflicts.length === 0 && roomConflicts.length === 0) {
      alerts.push("🟢 Ο Scheduler είναι συγχρονισμένος και χωρίς συγκρούσεις.");
    }
    return alerts;
  }, [students, classes, schedule, teacherConflicts, roomConflicts]);

  // --- AI INSIGHTS (υπολογίζονται τοπικά) ---
  const aiInsights = useMemo(() => {
    const list: string[] = [];

    const usedRoomsToday = new Set(todaysLessons.map((l) => l.room).filter(Boolean));
    const freeRoomsToday = rooms.filter((r) => r.name && !usedRoomsToday.has(r.name));
    if (freeRoomsToday.length > 0) {
      const sample = freeRoomsToday.slice(0, 2).map((r) => r.name).join(", ");
      list.push(`🚪 ${freeRoomsToday.length} αίθουσες ελεύθερες σήμερα (${sample}${freeRoomsToday.length > 2 ? "…" : ""}).`);
    }

    const hours: Record<string, number> = {};
    schedule.forEach((s) => { if (s.teacher) hours[s.teacher] = (hours[s.teacher] || 0) + 1; });
    const sorted = Object.entries(hours).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const [name, count] = sorted[0];
      list.push(`👨‍🏫 ${name}: ${count} ώρες/εβδ.${count >= 20 ? " ⚠ υπερφόρτωση" : ""}`);
    }

    if (totalConflicts > 0) list.push(`⚠ Βρέθηκαν ${totalConflicts} συγκρούσεις στο πρόγραμμα.`);
    else list.push("✅ Καμία σύγκρουση στο τρέχον πρόγραμμα.");

    const nearFull = classes.filter((c) => c.maxCapacity > 0 && c.currentCapacity / c.maxCapacity >= 0.9);
    if (nearFull.length > 0) list.push(`📦 ${nearFull.length} τμήματα κοντά στο 100% πληρότητας.`);

    return list.slice(0, 4);
  }, [schedule, rooms, classes, todaysLessons, totalConflicts]);

  // --- GLOBAL SEARCH (μαθητές, καθηγητές, τμήματα, αίθουσες, μαθήματα, γονείς, τηλ/email) ---
  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return {
      students: students.filter((s) =>
        `${s.lastName} ${s.firstName}`.toLowerCase().includes(q) ||
        (s.parentName || "").toLowerCase().includes(q) ||
        (s.phone || "").toLowerCase().includes(q) ||
        (s.parentPhone || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q)
      ).slice(0, 3),
      teachers: teachers.filter((t) =>
        (t.name || "").toLowerCase().includes(q) ||
        (t.phone || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q) ||
        (t.subjects || []).some((sub) => sub.toLowerCase().includes(q))
      ).slice(0, 3),
      classes: classes.filter((c) => (c.className || "").toLowerCase().includes(q)).slice(0, 3),
      rooms: rooms.filter((r) => (r.name || "").toLowerCase().includes(q)).slice(0, 3),
      courses: courses.filter((c) =>
        (c.name || c.title || "").toLowerCase().includes(q) ||
        (c.subject || "").toLowerCase().includes(q)
      ).slice(0, 3),
    };
  }, [searchQuery, students, teachers, classes, rooms, courses]);

  const hasAnyResult =
    !!globalSearchResults &&
    (globalSearchResults.students.length > 0 ||
      globalSearchResults.teachers.length > 0 ||
      globalSearchResults.classes.length > 0 ||
      globalSearchResults.rooms.length > 0 ||
      globalSearchResults.courses.length > 0);

  // SSR skeleton
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <div className="text-slate-400 text-xs font-mono animate-pulse flex items-center gap-2">
          <HardDrive size={14} className="animate-spin text-indigo-500" />
          <span>Αρχικοποίηση EduFlow Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceShell title="EduFlow Operations" description="Κεντρικός έλεγχος, AI insights και διαχείριση πόρων εκπαιδευτηρίου σε πραγματικό χρόνο.">

      {/* GLOBAL SEARCH */}
      <div className="px-6 mb-4 relative z-40">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-4 text-slate-400" />
          <input
            type="text"
            placeholder="Καθολική αναζήτηση: μαθητές, καθηγητές, τμήματα, αίθουσες, μαθήματα, γονείς, τηλ/email..."
            className="w-full bg-[#1e2330] border border-slate-800 focus:border-indigo-500 pl-11 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-500 outline-none transition-all shadow-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 text-xs text-slate-500 hover:text-white">Καθαρισμός</button>
          )}
        </div>

        {globalSearchResults && (
          <div className="absolute left-6 right-6 mt-2 bg-[#161a24] border border-slate-800 rounded-2xl p-4 shadow-2xl max-h-96 overflow-y-auto space-y-3 z-50">
            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1">Αποτελέσματα</h5>

            {!hasAnyResult && (
              <p className="text-xs text-slate-500 py-2 text-center">Δεν βρέθηκε κανένα στοιχείο.</p>
            )}

            {globalSearchResults.students.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Μαθητές & Γονείς</p>
                {globalSearchResults.students.map((s) => (
                  <div key={s.id} className="text-xs text-slate-200 py-1.5 px-2 hover:bg-[#1e2330] rounded-lg cursor-pointer flex justify-between gap-2">
                    <span>{s.lastName} {s.firstName} ({s.grade})</span>
                    <span className="text-slate-500 text-[10px] truncate">Γονέας: {s.parentName}</span>
                  </div>
                ))}
              </div>
            )}

            {globalSearchResults.teachers.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Καθηγητές</p>
                {globalSearchResults.teachers.map((t) => (
                  <div key={t.id} className="text-xs text-slate-200 py-1.5 px-2 hover:bg-[#1e2330] rounded-lg cursor-pointer flex justify-between gap-2">
                    <span>{t.name}</span>
                    <span className="text-slate-500 text-[10px] truncate">{(t.subjects || []).join(", ")}</span>
                  </div>
                ))}
              </div>
            )}

            {globalSearchResults.classes.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Τμήματα</p>
                {globalSearchResults.classes.map((c) => (
                  <div key={c.id} className="text-xs text-slate-200 py-1.5 px-2 hover:bg-[#1e2330] rounded-lg cursor-pointer flex justify-between gap-2">
                    <span>Τμήμα {c.className} ({c.grade})</span>
                    <span className="text-slate-500 text-[10px]">{c.currentCapacity}/{c.maxCapacity}</span>
                  </div>
                ))}
              </div>
            )}

            {globalSearchResults.rooms.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Αίθουσες</p>
                {globalSearchResults.rooms.map((r, i) => (
                  <div key={r.id ?? i} className="text-xs text-slate-200 py-1.5 px-2 hover:bg-[#1e2330] rounded-lg cursor-pointer flex justify-between gap-2">
                    <span>{r.name}</span>
                    {r.capacity != null && <span className="text-slate-500 text-[10px]">χωρ. {r.capacity}</span>}
                  </div>
                ))}
              </div>
            )}

            {globalSearchResults.courses.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Μαθήματα</p>
                {globalSearchResults.courses.map((c, i) => (
                  <div key={c.id ?? i} className="text-xs text-slate-200 py-1.5 px-2 hover:bg-[#1e2330] rounded-lg cursor-pointer">
                    {c.name || c.title || c.subject}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 space-y-6">

        {/* HERO ZONE */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Brain size={120} className="text-indigo-400 animate-pulse" />
            </div>
            <div>
              <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">OPERATIONS OVERVIEW</span>
              <h2 className="text-white text-xl font-black mt-2">{currentGreeting}, Διαχειριστή! 👋</h2>
              <p className="text-slate-400 text-xs mt-1 font-medium">{currentDateString}</p>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <p className="text-slate-300 text-xs flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-400" />
                Σήμερα: <span className="text-emerald-400 font-bold">{todaysLessons.length} μαθήματα</span>.
              </p>
              <p className="text-indigo-300 text-[11px] italic font-medium">💡 "Η σωστή οργάνωση είναι το θεμέλιο της γνώσης."</p>
            </div>
          </div>

          {/* WEATHER (live) */}
          <div className="bg-[#1e2330] border border-slate-800 p-5 rounded-3xl shadow-lg flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-bold">{SCHOOL_CONFIG.city}</p>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider mt-0.5">{SCHOOL_CONFIG.subtitle}</p>
              </div>
              <CloudSun size={24} className="text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <h3 className="text-white text-3xl font-black tracking-tighter">
                {weather.loading ? "…" : weather.temp != null ? `${weather.temp}°C` : "—"}
              </h3>
              <p className="text-emerald-400 text-[10px] font-semibold mt-0.5">{weather.desc}</p>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Συνολικοί Μαθητές" value={animatedTotalStudents} icon={<Users size={16} />} color="from-indigo-500/10 to-indigo-600/5" iconColor="text-indigo-400" border="border-indigo-500/10" />
          <StatCard title="Ενεργά Τμήματα" value={animatedTotalClasses} icon={<Layers size={16} />} color="from-emerald-500/10 to-emerald-600/5" iconColor="text-emerald-400" border="border-emerald-500/10" />
          <StatCard title="Καθηγητές" value={animatedTotalTeachers} icon={<GraduationCap size={16} />} color="from-amber-500/10 to-amber-600/5" iconColor="text-amber-400" border="border-amber-500/10" />
          <StatCard title="Μαθήματα Σήμερα" value={todaysLessons.length} icon={<Calendar size={16} />} color="from-rose-500/10 to-rose-600/5" iconColor="text-rose-400" border="border-rose-500/10" />
          <StatCard title="Συνολικά Μαθήματα" value={totalCoursesCount} icon={<BookOpen size={16} />} color="from-cyan-500/10 to-cyan-600/5" iconColor="text-cyan-400" border="border-cyan-500/10" />
          <StatCard title="Κλειδωμένες Ώρες" value={totalLockedHoursCount} icon={<Lock size={16} />} color="from-purple-500/10 to-purple-600/5" iconColor="text-purple-400" border="border-purple-500/10" />
        </div>

        {/* QUICK ACTIONS (router.push αντί για alert) */}
        <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-3xl shadow-md">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Γρήγορες Ενέργειες Διαχείρισης</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <QuickActionButton label="➕ Νέος Μαθητής" onClick={() => router.push("/students")} color="hover:border-indigo-500/40 hover:bg-indigo-950/20" />
            <QuickActionButton label="➕ Νέος Καθηγητής" onClick={() => router.push("/teachers")} color="hover:border-amber-500/40 hover:bg-amber-950/20" />
            <QuickActionButton label="➕ Νέο Τμήμα" onClick={() => router.push("/classes")} color="hover:border-emerald-500/40 hover:bg-emerald-950/20" />
            <QuickActionButton label="📅 Scheduler" onClick={() => router.push("/schedule")} color="hover:border-rose-500/40 hover:bg-rose-950/20" />
            <QuickActionButton label="📊 Αναφορές" onClick={() => router.push("/reports")} color="hover:border-cyan-500/40 hover:bg-cyan-950/20" />
            <QuickActionButton label="⚙️ Ρυθμίσεις" onClick={() => router.push("/settings")} color="hover:border-slate-500/40 hover:bg-slate-800/40" />
          </div>
        </div>

        {/* MAIN SPLIT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 space-y-6">

            {/* TIMELINE με χρωματιστά subject badges */}
            <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-white font-bold text-sm flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <span className="flex items-center gap-2"><Clock className="text-rose-400" size={16} /> Χρονολόγιο Σημερινών Μαθημάτων ({currentGreekDay})</span>
                <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-md">LIVE MONITOR</span>
              </h3>
              {todaysLessons.length > 0 ? (
                <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-5 my-2">
                  {[...todaysLessons].sort((a, b) => a.time.localeCompare(b.time)).map((lesson, i) => {
                    const c = getSubjectColor(lesson.subject);
                    return (
                      <div key={i} className="relative group">
                        <span className={`absolute -left-[31px] top-1 ${c.dot} w-2.5 h-2.5 rounded-full ring-4 ring-[#1e2330]`}></span>
                        <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <span className={`text-[9px] ${c.bg} ${c.text} font-bold px-1.5 py-0.5 rounded border ${c.border} uppercase inline-flex items-center gap-1`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>{lesson.subject}
                            </span>
                            <h4 className="text-white text-xs font-bold mt-1">Τμήμα {lesson.groupName}</h4>
                            <p className="text-slate-500 text-[10px] mt-0.5">👨‍🏫 Διδάσκων: <span className="text-slate-300">{lesson.teacher}</span></p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-rose-400 text-xs font-mono font-bold flex items-center gap-1"><Clock size={12} />{lesson.time}</p>
                            {lesson.room && <p className="text-slate-500 text-[9px] mt-0.5 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Αίθουσα {lesson.room}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  Δεν υπάρχουν μαθήματα προγραμματισμένα για σήμερα ({currentGreekDay}).
                </div>
              )}
            </div>

            {/* CHARTS (πραγματικά Recharts) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-lg">
                <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-4 uppercase tracking-wide">
                  <BarChart3 size={14} className="text-indigo-400" /> Μαθητές ανά Τάξη Γυμνασίου
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "#334155" }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: "rgba(99,102,241,0.08)" }} contentStyle={{ background: "#0b0e14", border: "1px solid #334155", borderRadius: 12, fontSize: 11, color: "#e2e8f0" }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {gradeChartData.map((_, idx) => (
                          <Cell key={idx} fill="#6366f1" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-lg">
                <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-2 uppercase tracking-wide">
                  <Layers size={14} className="text-emerald-400" /> Κατανομή Βαθμίδων
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={levelChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} stroke="none">
                        <Cell fill="#10b981" />
                        <Cell fill="#6366f1" />
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0b0e14", border: "1px solid #334155", borderRadius: 12, fontSize: 11, color: "#e2e8f0" }} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* CAPACITY MONITOR με % + status */}
            <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
                <Layers className="text-emerald-400" size={16} /> Χωρητικότητα & Πληρότητα Τμημάτων
              </h3>
              {classes.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Δεν υπάρχουν καταχωρημένα τμήματα.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {classes.map((c) => {
                    const ratio = c.maxCapacity > 0 ? (c.currentCapacity / c.maxCapacity) * 100 : 0;
                    const pct = Math.round(ratio);
                    const barColor = ratio >= 100 ? "bg-rose-500" : ratio >= 80 ? "bg-amber-500" : "bg-emerald-500";
                    const statusLabel = ratio >= 100 ? "🔴 FULL" : ratio >= 80 ? "⚠ Σχεδόν πλήρες" : "🟢 Διαθέσιμο";
                    const statusColor = ratio >= 100 ? "text-rose-400" : ratio >= 80 ? "text-amber-400" : "text-emerald-400";
                    return (
                      <div key={c.id} className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800/80 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-bold uppercase">Τμήμα {c.className}</span>
                          <span className="text-slate-400 font-mono font-bold">{c.currentCapacity}/{c.maxCapacity}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(ratio, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold ${statusColor}`}>{statusLabel}</span>
                          <span className="text-[10px] font-mono text-slate-500">{pct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* SIDEBAR PANEL */}
          <div className="xl:col-span-1 space-y-6">

            {/* AI INSIGHTS CARD (top-right) */}
            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-5 rounded-3xl border border-indigo-500/30 shadow-xl">
              <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-3 tracking-wide uppercase">
                <Brain size={14} className="text-indigo-400" /> AI Assistant
              </h4>
              <div className="space-y-2">
                {aiInsights.length === 0 ? (
                  <p className="text-[11px] text-slate-400">Δεν υπάρχουν αρκετά δεδομένα για insights.</p>
                ) : (
                  aiInsights.map((ins, idx) => (
                    <div key={idx} className="bg-[#0b0e14]/60 p-2.5 rounded-xl border border-indigo-500/10 text-[11px] text-slate-300 leading-relaxed">
                      {ins}
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => router.push("/schedule")}
                className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap size={13} /> Βελτιστοποίηση Προγράμματος
              </button>
            </div>

            {/* NOTIFICATIONS */}
            <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-xl">
              <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-3 tracking-wide uppercase">
                <Bell size={14} className="text-amber-400" /> Κέντρο Ειδοποιήσεων
              </h4>
              <div className="space-y-2">
                {notifications.map((note, idx) => (
                  <div key={idx} className="bg-[#0b0e14] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-medium">
                    {note}
                  </div>
                ))}
              </div>
            </div>

            {/* SCHEDULER STATUS (δυναμικό) */}
            <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-xl">
              <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-3 tracking-wide uppercase">
                <ShieldCheck size={14} className="text-emerald-400" /> Κατάσταση Scheduler
              </h4>
              <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 text-center space-y-3">
                {totalConflicts === 0 ? (
                  <div className="flex justify-center items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={16} />
                    <span>Δεν υπάρχουν συγκρούσεις</span>
                  </div>
                ) : (
                  <div className="flex justify-center items-center gap-2 text-rose-400 text-xs font-bold">
                    <AlertTriangle size={16} />
                    <span>{totalConflicts} συγκρούσεις</span>
                  </div>
                )}
                <button onClick={() => router.push("/schedule")} className="w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[10px] font-bold py-1.5 rounded-lg border border-indigo-500/20 transition-all">
                  Έλεγχος Πίνακα Ωρολογίου
                </button>
              </div>
            </div>

            {/* ACTIVITY LOG */}
            <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-xl">
              <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-3 tracking-wide uppercase">
                <Activity size={14} className="text-indigo-400" /> Log Ενεργειών
              </h4>
              <div className="space-y-2 text-[10px] font-medium text-slate-400">
                <div className="border-l-2 border-indigo-500 pl-2 py-0.5">
                  <p className="text-slate-300 font-bold">LocalStorage Sync</p>
                  <p className="text-slate-500 font-mono text-[9px]">Ενεργό • Client Mounted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FAB CONTAINER (πλήρες menu) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-full flex justify-center items-center text-white shadow-2xl transition-all transform hover:scale-105"
        >
          <Plus size={22} className={`transition-transform duration-300 ${isFabOpen ? "rotate-45" : ""}`} />
        </button>
        {isFabOpen && (
          <div className="absolute bottom-14 right-0 bg-[#161a24] border border-slate-800 p-2 rounded-2xl shadow-2xl w-52 space-y-1">
            <FabItem label="👨‍🎓 Νέος Μαθητής" onClick={() => { router.push("/students"); setIsFabOpen(false); }} />
            <FabItem label="👨‍🏫 Νέος Καθηγητής" onClick={() => { router.push("/teachers"); setIsFabOpen(false); }} />
            <FabItem label="🏫 Νέο Τμήμα" onClick={() => { router.push("/classes"); setIsFabOpen(false); }} />
            <FabItem label="📚 Νέο Μάθημα" onClick={() => { router.push("/courses"); setIsFabOpen(false); }} />
            <FabItem label="🚪 Νέα Αίθουσα" onClick={() => { router.push("/rooms"); setIsFabOpen(false); }} />
            <FabItem label="👨‍👩‍👧 Νέος Γονέας" onClick={() => { router.push("/parents"); setIsFabOpen(false); }} />
          </div>
        )}
      </div>

    </WorkspaceShell>
  );
}

// --- SUB-COMPONENTS ---
interface StatCardProps { title: string; value: number; icon: React.ReactNode; color: string; iconColor: string; border: string; }
function StatCard({ title, value, icon, color, iconColor, border }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${color} ${border} border p-5 rounded-3xl flex flex-col gap-2 shadow-md transition-all duration-300`}>
      <div className={`w-8 h-8 rounded-xl bg-[#0b0e14]/50 flex justify-center items-center ${iconColor}`}>
        {icon}
      </div>
      <div className="mt-1">
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider leading-none">{title}</p>
        <p className="text-2xl font-black text-white mt-1.5 tracking-tight font-mono">{value}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ label, onClick, color }: { label: string; onClick: () => void; color: string; }) {
  return (
    <button onClick={onClick} className={`bg-[#0b0e14] border border-slate-800 text-slate-200 font-semibold text-xs py-2.5 px-3 rounded-xl transition-all ${color}`}>
      {label}
    </button>
  );
}

function FabItem({ label, onClick }: { label: string; onClick: () => void; }) {
  return (
    <button onClick={onClick} className="w-full text-left p-2 hover:bg-[#1e2330] rounded-xl text-slate-200 text-xs flex items-center gap-2">
      {label}
    </button>
  );
}
