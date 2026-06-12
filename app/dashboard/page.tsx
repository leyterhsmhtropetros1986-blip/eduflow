"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import {
  Users, GraduationCap, BookOpen, Calendar, Clock,
  Search, Layers, BarChart3, Lock, Brain,
  AlertTriangle, CheckCircle2, UserPlus,
} from "lucide-react";

// --- CONFIG & UTILS ---
const SCHOOL_CONFIG = { city: "Χαλκίδα", subtitle: "Κεντρικά Εκπαιδευτήρια", lat: 38.4633, lon: 23.5983 };

const DAYS = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];

const SUBJECT_COLORS = [
  { dot: "bg-emerald-400", text: "text-emerald-300", bg: "bg-emerald-950", border: "border-emerald-900/40" },
  { dot: "bg-sky-400", text: "text-sky-300", bg: "bg-sky-950", border: "border-sky-900/40" },
  { dot: "bg-purple-400", text: "text-purple-300", bg: "bg-purple-950", border: "border-purple-900/40" },
  { dot: "bg-amber-400", text: "text-amber-300", bg: "bg-amber-950", border: "border-amber-900/40" },
  { dot: "bg-rose-400", text: "text-rose-300", bg: "bg-rose-950", border: "border-rose-900/40" },
];
function getSubjectColor(subject: string) {
  let hash = 0;
  const s = subject || "";
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

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

const QUICK_ACTIONS = [
  { label: "Μαθητές", href: "/students" },
  { label: "Καθηγητές", href: "/teachers" },
  { label: "Τμήματα", href: "/classes" },
  { label: "Scheduler", href: "/schedule" },
  { label: "Αναφορές", href: "/reports" },
  { label: "CRM", href: "/crm" },
];

export default function DashboardPage() {
  const router = useRouter();

  // ✅ Διόρθωση 8: loading state
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ students: [], teachers: [], classes: [], schedule: [], rooms: [], courses: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentGreekDay, setCurrentGreekDay] = useState("");
  const [weather, setWeather] = useState<{ temp: number | null; desc: string; loading: boolean }>({
    temp: null, desc: "Φόρτωση...", loading: true,
  });

  // Φόρτωση δεδομένων
  useEffect(() => {
    setData({
      students: JSON.parse(localStorage.getItem("eduflow_students") || "[]"),
      teachers: JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"),
      classes: JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]"),
      schedule: JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"),
      rooms: JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"),
      courses: JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]"),
    });
    setCurrentGreekDay(DAYS[new Date().getDay()]);
    setLoading(false);
  }, []);

  // ✅ Διόρθωση 1: πραγματικό fetch καιρού (open-meteo, χωρίς API key)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${SCHOOL_CONFIG.lat}&longitude=${SCHOOL_CONFIG.lon}&current_weather=true`
        );
        const json = await res.json();
        if (active && json?.current_weather) {
          setWeather({ temp: Math.round(json.current_weather.temperature), desc: weatherCodeToText(json.current_weather.weathercode), loading: false });
        } else if (active) {
          setWeather({ temp: null, desc: "Μη διαθέσιμο", loading: false });
        }
      } catch {
        if (active) setWeather({ temp: null, desc: "Μη διαθέσιμο", loading: false });
      }
    })();
    return () => { active = false; };
  }, []);

  // ✅ Διόρθωση 7: useMemo σε χρήση — Σημερινό πρόγραμμα
  const todaysLessons = useMemo(() => {
    return (data.schedule as any[])
      .filter((s) => s.day?.toLowerCase() === currentGreekDay.toLowerCase())
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [data.schedule, currentGreekDay]);

  // Capacity — η τρέχουσα πληρότητα υπολογίζεται από τις εγγραφές μαθητών
  const capacity = useMemo(() => {
    return (data.classes as any[]).slice(0, 6).map((c) => {
      const name = c.name || c.className || "—";
      const current = (data.students as any[]).filter((s: any) =>
        (s.enrollments || []).some((e: any) => e.className === name)
      ).length;
      const max = c.maxStudents || c.maxCapacity || c.capacity || 20;
      const perc = max > 0 ? Math.min(Math.round((current / max) * 100), 100) : 0;
      return { name, current, max, perc };
    });
  }, [data.classes, data.students]);

  // AI Insights (τοπικός υπολογισμός)
  const aiInsights = useMemo(() => {
    const list: { level: "warn" | "ok"; text: string }[] = [];
    const schedule = data.schedule as any[];

    // Συγκρούσεις καθηγητή (ίδιος καθηγητής, ίδια μέρα/ώρα)
    const tMap: Record<string, number> = {};
    schedule.forEach((s) => { if (s.teacher && s.day && s.time) tMap[`${s.teacher}|${s.day}|${s.time}`] = (tMap[`${s.teacher}|${s.day}|${s.time}`] || 0) + 1; });
    const conflicts = Object.values(tMap).filter((n) => n > 1).length;
    if (conflicts > 0) list.push({ level: "warn", text: `Βρέθηκαν ${conflicts} συγκρούσεις στο πρόγραμμα.` });

    // Ώρες ανά καθηγητή
    const hours: Record<string, number> = {};
    schedule.forEach((s) => { if (s.teacher) hours[s.teacher] = (hours[s.teacher] || 0) + 1; });
    const top = Object.entries(hours).sort((a, b) => b[1] - a[1])[0];
    if (top) list.push({ level: top[1] >= 20 ? "warn" : "ok", text: `${top[0]}: ${top[1]} ώρες/εβδομάδα${top[1] >= 20 ? " (υπερφόρτωση)" : ""}.` });

    // Τμήματα σχεδόν πλήρη
    const nearFull = capacity.filter((c) => c.perc >= 90);
    if (nearFull.length > 0) list.push({ level: "warn", text: `${nearFull.length} τμήματα κοντά στο 100% πληρότητας.` });

    // Ελεύθερες αίθουσες σήμερα
    const usedRooms = new Set(todaysLessons.map((l: any) => l.room).filter(Boolean));
    const freeRooms = (data.rooms as any[]).filter((r) => r.name && !usedRooms.has(r.name));
    if (freeRooms.length > 0) list.push({ level: "ok", text: `${freeRooms.length} αίθουσες ελεύθερες σήμερα.` });

    if (conflicts === 0) list.unshift({ level: "ok", text: "Καμία σύγκρουση στο τρέχον πρόγραμμα." });
    return list.slice(0, 4);
  }, [data.schedule, data.rooms, capacity, todaysLessons]);

  // Πρόσφατες εγγραφές (τελευταίοι μαθητές)
  const recentStudents = useMemo(() => {
    return [...(data.students as any[])].slice(-5).reverse();
  }, [data.students]);

  // ✅ Διόρθωση 4: το search χρησιμοποιείται πραγματικά
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return {
      students: (data.students as any[]).filter((s) => `${s.lastName || ""} ${s.firstName || ""}`.toLowerCase().includes(q) || (s.parentName || "").toLowerCase().includes(q)).slice(0, 3),
      teachers: (data.teachers as any[]).filter((t) => (t.name || "").toLowerCase().includes(q)).slice(0, 3),
      classes: (data.classes as any[]).filter((c) => (c.name || c.className || "").toLowerCase().includes(q)).slice(0, 3),
    };
  }, [searchQuery, data.students, data.teachers, data.classes]);

  const hasResults = !!searchResults && (searchResults.students.length || searchResults.teachers.length || searchResults.classes.length);

  // ✅ Διόρθωση 8: Loading screen
  if (loading) {
    return (
      <WorkspaceShell title="EduFlow Operations" description="Κεντρικός έλεγχος εκπαιδευτηρίου">
        <div className="p-10 text-slate-400 text-sm flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Φόρτωση δεδομένων...
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="EduFlow Operations" description="Κεντρικός έλεγχος εκπαιδευτηρίου">

      <div className="px-6 space-y-6">

        {/* HERO & WEATHER */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 bg-gradient-to-r from-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/20">
            <h2 className="text-white text-xl font-black">Καλώς ήρθες, Διαχειριστή! 👋</h2>
            <p className="text-slate-400 text-xs mt-1">Σήμερα ({currentGreekDay}): <span className="text-emerald-400 font-bold">{todaysLessons.length} μαθήματα</span>.</p>
          </div>

          <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800">
            <p className="text-slate-400 text-xs font-bold">{SCHOOL_CONFIG.city}</p>
            <p className="text-slate-500 text-[9px] uppercase tracking-wider">{SCHOOL_CONFIG.subtitle}</p>
            <h3 className="text-white text-3xl font-black mt-2">{weather.loading ? "…" : weather.temp != null ? `${weather.temp}°C` : "—"}</h3>
            <p className="text-emerald-400 text-[10px]">{weather.desc}</p>
          </div>
        </div>

        {/* ✅ Διόρθωση 4: SEARCH (λειτουργικό) */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Αναζήτηση σε μαθητές, καθηγητές, τμήματα..."
            className="w-full bg-[#1e2330] border border-slate-800 focus:border-indigo-500 pl-11 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-500 outline-none"
          />
          {searchResults && (
            <div className="absolute left-0 right-0 mt-2 bg-[#161a24] border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 space-y-3 max-h-80 overflow-y-auto">
              {!hasResults && <p className="text-xs text-slate-500 text-center py-2">Δεν βρέθηκε κανένα στοιχείο.</p>}
              {searchResults.students.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Μαθητές</p>
                  {searchResults.students.map((s, i) => <div key={i} className="text-xs text-slate-200 py-1 px-2 hover:bg-[#1e2330] rounded-lg">{s.lastName} {s.firstName} <span className="text-slate-500">({s.grade})</span></div>)}
                </div>
              )}
              {searchResults.teachers.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Καθηγητές</p>
                  {searchResults.teachers.map((t, i) => <div key={i} className="text-xs text-slate-200 py-1 px-2 hover:bg-[#1e2330] rounded-lg">{t.name}</div>)}
                </div>
              )}
              {searchResults.classes.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Τμήματα</p>
                  {searchResults.classes.map((c, i) => <div key={i} className="text-xs text-slate-200 py-1 px-2 hover:bg-[#1e2330] rounded-lg">{c.name || c.className}</div>)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard title="Μαθητές" value={data.students.length} icon={<Users size={16} />} color="from-indigo-500/10" />
          <StatCard title="Τμήματα" value={data.classes.length} icon={<Layers size={16} />} color="from-emerald-500/10" />
          <StatCard title="Καθηγητές" value={data.teachers.length} icon={<GraduationCap size={16} />} color="from-amber-500/10" />
          <StatCard title="Μαθήματα Σήμερα" value={todaysLessons.length} icon={<Calendar size={16} />} color="from-rose-500/10" />
          <StatCard title="Σύνολο Μαθημάτων" value={data.courses.length} icon={<BookOpen size={16} />} color="from-cyan-500/10" />
          {/* ✅ Διόρθωση 3: κλειδωμένα από καθηγητές */}
          <StatCard title="Κλειδωμένα" value={data.teachers.filter((t: any) => t.isLockedHours).length} icon={<Lock size={16} />} color="from-purple-500/10" />
        </div>

        {/* ✅ Διόρθωση 2: QUICK ACTIONS με σωστά routes */}
        <div className="bg-[#1e2330] p-4 rounded-3xl border border-slate-800 grid grid-cols-2 lg:grid-cols-6 gap-2">
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="bg-[#0b0e14] text-slate-300 text-[10px] font-bold py-3 px-2 rounded-xl border border-slate-800 hover:border-indigo-500 transition"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ✅ Διόρθωση 6: ΠΕΡΙΕΧΟΜΕΝΟ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Σημερινό πρόγραμμα */}
          <div className="xl:col-span-2 bg-[#1e2330] p-6 rounded-3xl border border-slate-800">
            <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
              <Clock size={16} className="text-rose-400" /> Σημερινό Πρόγραμμα ({currentGreekDay})
            </h3>
            {todaysLessons.length > 0 ? (
              <div className="space-y-2">
                {todaysLessons.map((l: any, i: number) => {
                  const c = getSubjectColor(l.subject);
                  return (
                    <div key={i} className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-rose-400 font-mono font-bold text-xs">{l.time}</span>
                        <div>
                          <span className={`text-[9px] ${c.bg} ${c.text} font-bold px-1.5 py-0.5 rounded border ${c.border} uppercase`}>{l.subject}</span>
                          <p className="text-white text-xs font-bold mt-0.5">Τμήμα {l.groupName} <span className="text-slate-500 font-normal">• {l.teacher}</span></p>
                        </div>
                      </div>
                      {l.room && <span className="text-slate-500 text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Αίθ. {l.room}</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                Δεν υπάρχουν μαθήματα για σήμερα.
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-500/30">
            <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
              <Brain size={16} className="text-indigo-400" /> AI Insights
            </h3>
            <div className="space-y-2">
              {aiInsights.length === 0 ? (
                <p className="text-[11px] text-slate-400">Δεν υπάρχουν αρκετά δεδομένα.</p>
              ) : (
                aiInsights.map((ins, i) => (
                  <div key={i} className="bg-[#0b0e14]/60 p-2.5 rounded-xl border border-indigo-500/10 text-[11px] text-slate-300 flex items-start gap-2">
                    {ins.level === "warn"
                      ? <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                      : <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />}
                    <span>{ins.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Capacity */}
          <div className="xl:col-span-2 bg-[#1e2330] p-6 rounded-3xl border border-slate-800">
            <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-emerald-400" /> Πληρότητα Τμημάτων
            </h3>
            {capacity.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Δεν υπάρχουν τμήματα.</p>
            ) : (
              <div className="space-y-3">
                {capacity.map((c, i) => {
                  const barColor = c.perc >= 100 ? "bg-rose-500" : c.perc >= 80 ? "bg-amber-500" : "bg-emerald-500";
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-300">{c.name}</span>
                        <span className="text-slate-500 font-mono">{c.current}/{c.max} • {c.perc}%{c.perc >= 100 ? " 🔴" : ""}</span>
                      </div>
                      <div className="w-full h-2 bg-[#0b0e14] rounded-full overflow-hidden border border-slate-800">
                        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${c.perc}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Πρόσφατες εγγραφές */}
          <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800">
            <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
              <UserPlus size={16} className="text-cyan-400" /> Πρόσφατες Εγγραφές
            </h3>
            {recentStudents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Καμία εγγραφή ακόμα.</p>
            ) : (
              <div className="space-y-2">
                {recentStudents.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-[#0b0e14] p-2.5 rounded-xl border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      {(s.firstName?.[0] || s.lastName?.[0] || "?").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-bold truncate">{s.lastName} {s.firstName}</p>
                      <p className="text-slate-500 text-[10px] truncate">{s.grade || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className={`bg-gradient-to-br ${color} to-transparent p-4 rounded-3xl border border-slate-800`}>
      <div className="text-indigo-400 mb-2">{icon}</div>
      <p className="text-[9px] text-slate-500 uppercase font-black">{title}</p>
      <h3 className="text-white text-xl font-black">{value}</h3>
    </div>
  );
}
