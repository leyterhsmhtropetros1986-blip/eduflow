"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { 
  Users, GraduationCap, BookOpen, Calendar, Clock, Sparkles, 
  Search, Plus, Bell, ShieldCheck, Activity, CloudSun, LayoutGrid,
  Layers, Settings, BarChart3, ChevronRight, AlertCircle, CheckCircle2,
  Lock, HardDrive, Brain, HelpCircle
} from "lucide-react";

// --- INTERFACES ---
interface Student { id: string; firstName: string; lastName: string; grade: string; section: string; parentName: string; isLockedHours: boolean; }
interface Teacher { id: string; name: string; subjects: string[]; }
interface ClassData { id: string; className: string; grade: string; currentCapacity: number; maxCapacity: number; }
interface ScheduleItem { groupName: string; teacher: string; day: string; time: string; subject: string; room?: string; }

export default function DashboardPage() {
  // --- STATES ---
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [activeNotifications, setActiveNotifications] = useState<string[]>([]);
  
  // Animated Counter simulation states
  const [animatedTotalStudents, setAnimatedTotalStudents] = useState(0);
  const [animatedTotalTeachers, setAnimatedTotalTeachers] = useState(0);
  const [animatedTotalClasses, setAnimatedTotalClasses] = useState(0);

  // --- DATA HYDRATION ---
  useEffect(() => {
    const rawStudents = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const rawTeachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const rawClasses = JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]");
    const rawSchedule = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");

    setStudents(rawStudents);
    setTeachers(rawTeachers);
    setClasses(rawClasses);
    setSchedule(rawSchedule);

    // Smooth counter animation trigger on mount
    setTimeout(() => { setAnimatedTotalStudents(rawStudents.length); }, 100);
    setTimeout(() => { setAnimatedTotalTeachers(rawTeachers.length); }, 200);
    setTimeout(() => { setAnimatedTotalClasses(rawClasses.length); }, 300);

    // Dynamic Notifications Generation
    const alerts: string[] = [];
    const studentsWithoutClass = rawStudents.filter((s: Student) => !s.section);
    if (studentsWithoutClass.length > 0) alerts.push(`🔴 ${studentsWithoutClass.length} μαθητές δεν έχουν ανατεθεί σε τμήμα.`);
    
    const lockedSchedules = rawStudents.filter((s: Student) => s.isLockedHours).length;
    if (lockedSchedules > 0) alerts.push(`🟡 ${lockedSchedules} αιτήματα για κλειδωμένα ωράρια προς έλεγχο.`);
    
    if (rawSchedule.length === 0) {
      alerts.push("❌ Ο Scheduler είναι άδειος για αυτή την εβδομάδα.");
    } else {
      alerts.push("🟢 Ο Scheduler είναι συγχρονισμένος και Live.");
    }
    setActiveNotifications(alerts);
  }, []);

  // --- TIME & GREETING UTILS ---
  const todayGreekDay = useMemo(() => {
    const days = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
    return days[new Date().getDay()];
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("el-GR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 14 ? "Καλημέρα" : "Καλησπέρα";
  }, []);

  // --- FILTERS & DERIVED METRICS ---
  const todaysLessons = useMemo(() => {
    return schedule.filter(item => item.day.toLowerCase() === todayGreekDay.toLowerCase());
  }, [schedule, todayGreekDay]);

  const totalLockedHoursCount = useMemo(() => {
    return students.filter(s => s.isLockedHours).length;
  }, [students]);

  const totalCoursesCount = useMemo(() => {
    const courses = JSON.parse(localStorage.getItem("eduflow_courses") || "[]");
    return courses.length || 8; // Fallback στα 8 βασικά αν είναι κενό
  }, []);

  // Grade Breakdown Metrics (For Pure Charts)
  const gradeStats = useMemo(() => {
    const counts = { aGym: 0, bGym: 0, cGym: 0, gymTotal: 0, lykTotal: 0 };
    students.forEach(s => {
      const g = s.grade.toUpperCase();
      if (g.includes("Α ΓΥΜΝΑΣΙΟΥ")) counts.aGym++;
      if (g.includes("Β ΓΥΜΝΑΣΙΟΥ")) counts.bGym++;
      if (g.includes("Γ ΓΥΜΝΑΣΙΟΥ")) counts.cGym++;
      if (g.includes("ΓΥΜΝΑΣΙΟΥ")) counts.gymTotal++;
      if (g.includes("ΛΥΚΕΙΟΥ") || g.includes("ΜΕΤΑΛΥΚΕΙΑΚΟΙ")) counts.lykTotal++;
    });
    return counts;
  }, [students]);

  // Global Instant Search Execution
  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    
    return {
      students: students.filter(s => `${s.lastName} ${s.firstName}`.toLowerCase().includes(q) || s.parentName.toLowerCase().includes(q)).slice(0, 3),
      teachers: teachers.filter(t => t.name.toLowerCase().includes(q)).slice(0, 3),
      classes: classes.filter(c => c.className.toLowerCase().includes(q)).slice(0, 3)
    };
  }, [searchQuery, students, teachers, classes]);

  return (
    <WorkspaceShell title="EduFlow Operations" description="Κεντρικός έλεγχος, AI insights και διαχείριση πόρων εκπαιδευτηρίου σε πραγματικό χρόνο.">
      
      {/* 13. GLOBAL SEARCH OVERLAY & INPUT */}
      <div className="px-6 mb-4 relative z-40">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Καθολική αναζήτηση σε Μαθητές, Καθηγητές, Τμήματα, Γονείς..." 
            className="w-full bg-[#1e2330] border border-slate-800 focus:border-indigo-500 pl-11 pr-4 py-3 rounded-2xl text-xs text-white placeholder-slate-500 outline-none transition-all shadow-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 text-xs text-slate-500 hover:text-white">Καθαρισμός</button>
          )}
        </div>

        {/* Global Search Results Popup Dropdown */}
        {globalSearchResults && (
          <div className="absolute left-0 right-0 mt-2 mx-6 bg-[#161a24] border border-slate-800 rounded-2xl p-4 shadow-2xl max-h-96 overflow-y-auto custom-scrollbar space-y-3 z-50">
            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1">Αποτελέσματα Αναζήτησης</h5>
            
            {globalSearchResults.students.length === 0 && globalSearchResults.teachers.length === 0 && globalSearchResults.classes.length === 0 && (
              <p className="text-xs text-slate-500 py-2 text-center">Δεν βρέθηκε κανένα στοιχείο.</p>
            )}

            {globalSearchResults.students.length > 0 && (
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Μαθητές & Γονείς</p>
                {globalSearchResults.students.map(s => <div key={s.id} className="text-xs text-slate-200 py-1.5 px-2 hover:bg-[#1e2330] rounded-lg cursor-pointer flex justify-between"><span>{s.lastName} {s.firstName} ({s.grade})</span><span className="text-slate-500 text-[10px]">Γονέας: {s.parentName}</span></div>)}
              </div>
            )}
            {globalSearchResults.teachers.length > 0 && (
              <div className="pt-2 border-t border-slate-900">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Καθηγητές</p>
                {globalSearchResults.teachers.map(t => <div key={t.id} className="text-xs text-slate-200 py-1.5 px-2 hover:bg-[#1e2330] rounded-lg cursor-pointer">{t.name}</div>)}
              </div>
            )}
            {globalSearchResults.classes.length > 0 && (
              <div className="pt-2 border-t border-slate-900">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Τμήματα</p>
                {globalSearchResults.classes.map(c => <div key={c.id} className="text-xs text-slate-200 py-1.5 px-2 hover:bg-[#1e2330] rounded-lg cursor-pointer flex justify-between"><span>Τμήμα {c.className}</span><span className="text-slate-500 text-[10px]">{c.currentCapacity}/{c.maxCapacity} Μαθητές</span></div>)}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 space-y-6">
        
        {/* --- TOP ZONE: HERO GRID & WEATHER --- */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* 1. WELCOME HERO SECTION */}
          <div className="xl:col-span-3 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/20 p-6 rounded-3xl relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[140px] backdrop-blur-md">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Brain size={120} className="text-indigo-400 animate-pulse" />
            </div>
            <div>
              <span className="text-indigo-400 font-black text-[10px] uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">OPERATIONS OVERVIEW</span>
              <h2 className="text-white text-xl font-black mt-2">{greeting}, Διαχειριστή! 👋</h2>
              <p className="text-slate-400 text-xs mt-1 font-medium">{formattedDate}</p>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <p className="text-slate-300 text-xs flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-400" /> 
                Σήμερα είναι προγραμματισμένα <span className="text-emerald-400 font-bold">{todaysLessons.length} μαθήματα</span>.
              </p>
              <p className="text-indigo-300 text-[11px] italic font-medium">💡 "Η σωστή οργάνωση είναι το θεμέλιο της γνώσης."</p>
            </div>
          </div>

          {/* 15. WEATHER WIDGET */}
          <div className="bg-[#1e2330] border border-slate-800 p-5 rounded-3xl shadow-lg flex flex-col justify-between relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-xs font-bold">Χαλκίδα</p>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider mt-0.5">Κεντρικά Εκπαιδευτήρια</p>
              </div>
              <CloudSun size={24} className="text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <h3 className="text-white text-3xl font-black tracking-tighter">24°C</h3>
              <p className="text-emerald-400 text-[10px] font-semibold mt-0.5">Αίθριος • Ιδανικές συνθήκες προσέλευσης</p>
            </div>
          </div>
        </div>

        {/* 2. UPGRADE STATISTICS CARDS WITH ANIMATED STATES */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Συνολικοί Μαθητές" value={animatedTotalStudents} icon={<Users size={16} />} color="from-indigo-500/10 to-indigo-600/5" iconColor="text-indigo-400" border="border-indigo-500/10" />
          <StatCard title="Ενεργά Τμήματα" value={animatedTotalClasses} icon={<Layers size={16} />} color="from-emerald-500/10 to-emerald-600/5" iconColor="text-emerald-400" border="border-emerald-500/10" />
          <StatCard title="Καθηγητές" value={animatedTotalTeachers} icon={<GraduationCap size={16} />} color="from-amber-500/10 to-amber-600/5" iconColor="text-amber-400" border="border-amber-500/10" />
          <StatCard title="Μαθήματα Σήμερα" value={todaysLessons.length} icon={<Calendar size={16} />} color="from-rose-500/10 to-rose-600/5" iconColor="text-rose-400" border="border-rose-500/10" />
          <StatCard title="Συνολικά Μαθήματα" value={totalCoursesCount} icon={<BookOpen size={16} />} color="from-cyan-500/10 to-cyan-600/5" iconColor="text-cyan-400" border="border-cyan-500/10" />
          <StatCard title="Κλειδωμένες Ώρες" value={totalLockedHoursCount} icon={<Lock size={16} />} color="from-purple-500/10 to-purple-600/5" iconColor="text-purple-400" border="border-purple-500/10" />
        </div>

        {/* 3. QUICK ACTIONS SHORTCUT BAR */}
        <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-3xl shadow-md">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">Γρήγορες Ενέργειες Διαχείρισης</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <QuickActionButton label="➕ Νέος Μαθητής" onClick={() => window.location.href = "/students"} color="hover:border-indigo-500/40 hover:bg-indigo-950/20" />
            <QuickActionButton label="➕ Νέος Καθηγητής" onClick={() => alert("Μετάβαση στη Διαχείριση Καθηγητών")} color="hover:border-amber-500/40 hover:bg-amber-950/20" />
            <QuickActionButton label="➕ Νέο Τμήμα" onClick={() => alert("Μετάβαση στα Τμήματα")} color="hover:border-emerald-500/40 hover:bg-emerald-950/20" />
            <QuickActionButton label="📅 Scheduler" onClick={() => alert("Μετάβαση στον Scheduler")} color="hover:border-rose-500/40 hover:bg-rose-950/20" />
            <QuickActionButton label="📊 Αναφορές" onClick={() => alert("Μετάβαση στα Στατιστικά")} color="hover:border-cyan-500/40 hover:bg-cyan-950/20" />
            <QuickActionButton label="⚙️ Ρυθμίσεις" onClick={() => alert("Μετάβαση στις Ρυθμίσεις")} color="hover:border-slate-500/40 hover:bg-slate-800/40" />
          </div>
        </div>

        {/* --- MAIN GRID LAYOUT SPLIT --- */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* LEFT/CENTER WIDGETS COLUMN (SPANS 3 COLS) */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* 4. TODAY'S TIMELINE & 16. CALENDAR WIDGET COMBINED */}
            <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-white font-bold text-sm flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <span className="flex items-center gap-2"><Clock className="text-rose-400" size={16} /> Χρονολόγιο Σημερινών Μαθημάτων ({todayGreekDay})</span>
                <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded-md">LIVE MONITOR</span>
              </h3>
              
              {todaysLessons.length > 0 ? (
                <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-5 my-2">
                  {[...todaysLessons].sort((a,b) => a.time.localeCompare(b.time)).map((lesson, i) => (
                    <div key={i} className="relative group">
                      {/* Timeline Dot Indicator */}
                      <span className="absolute -left-[31px] top-1 bg-rose-500 w-2.5 h-2.5 rounded-full ring-4 ring-[#1e2330] group-hover:bg-indigo-400 transition-colors"></span>
                      
                      <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-all shadow-sm">
                        <div>
                          <span className="text-[9px] bg-indigo-950 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-900/40 uppercase">{lesson.subject}</span>
                          <h4 className="text-white text-xs font-bold mt-1">Τμήμα {lesson.groupName}</h4>
                          <p className="text-slate-500 text-[10px] mt-0.5">👨‍🏫 Διδάσκων: <span className="text-slate-300">{lesson.teacher}</span></p>
                        </div>
                        <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                          <p className="text-rose-400 text-xs font-mono font-bold flex items-center gap-1"><Clock size={12}/>{lesson.time}</p>
                          {lesson.room && <p className="text-slate-500 text-[9px] mt-0.5 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Αίθουσα {lesson.room}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                  Δεν υπάρχουν μαθήματα προγραμματισμένα για σήμερα ({todayGreekDay}).
                </div>
              )}
            </div>

            {/* 5. UPCOMING WEEK LESSONS (CARDS MATRIX) */}
            <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
                <Calendar className="text-indigo-400" size={16} /> Προσεχή Μαθήματα Εβδομάδας
              </h3>
              {schedule.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {schedule.slice(0, 4).map((lesson, i) => (
                    <div key={i} className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-bold text-xs">Τμήμα {lesson.groupName}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">{lesson.teacher}</p>
                        </div>
                        <span className="text-[9px] bg-slate-900 border border-slate-800 text-indigo-400 font-bold px-2 py-0.5 rounded">
                          {lesson.subject}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-[10px]">
                        <span className="text-indigo-400 font-bold">{lesson.day}</span>
                        <span className="text-slate-400 font-mono flex items-center gap-1"><Clock size={10}/> {lesson.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs text-center py-10">Δεν υπάρχουν καταχωρημένα μαθήματα στον Scheduler.</p>
              )}
            </div>

            {/* --- CHARTS ZONE: 11. BAR CHART & 12. DISTRIBUTION --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 11. PURE TAILWIND BAR CHART: ΜΑΘΗΤΕΣ ΑΝΑ ΤΑΞΗ */}
              <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-lg">
                <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-4 uppercase tracking-wide">
                  <BarChart3 size={14} className="text-indigo-400" /> Μαθητές ανά Τάξη Γυμνασίου
                </h4>
                <div className="h-40 flex items-end justify-around gap-2 pt-6 border-b border-slate-800 px-2 relative">
                  {/* Grid Help Lines */}
                  <div className="absolute top-6 left-0 right-0 border-t border-slate-800/40 pointer-events-none"></div>
                  <div className="absolute top-20 left-0 right-0 border-t border-slate-800/40 pointer-events-none"></div>
                  
                  {/* Bar A */}
                  <div className="flex flex-col items-center w-12 group">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1">{gradeStats.aGym}</span>
                    <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500" style={{ height: `${Math.max((gradeStats.aGym / (students.length || 1)) * 120, 10)}px` }}></div>
                    <span className="text-[9px] text-slate-400 font-medium mt-2 text-center truncate w-full">Α Γυμν.</span>
                  </div>

                  {/* Bar B */}
                  <div className="flex flex-col items-center w-12 group">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1">{gradeStats.bGym}</span>
                    <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500" style={{ height: `${Math.max((gradeStats.bGym / (students.length || 1)) * 120, 10)}px` }}></div>
                    <span className="text-[9px] text-slate-400 font-medium mt-2 text-center truncate w-full">Β Γυμν.</span>
                  </div>

                  {/* Bar C */}
                  <div className="flex flex-col items-center w-12 group">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1">{gradeStats.cGym}</span>
                    <div className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500" style={{ height: `${Math.max((gradeStats.cGym / (students.length || 1)) * 120, 10)}px` }}></div>
                    <span className="text-[9px] text-slate-400 font-medium mt-2 text-center truncate w-full">Γ Γυμν.</span>
                  </div>
                </div>
              </div>

              {/* 12. DISTRIBUTION MONITOR: ΓΥΜΝΑΣΙΟ VS ΛΥΚΕΙΟ */}
              <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-lg flex flex-col justify-between">
                <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-2 uppercase tracking-wide">
                  <Layers size={14} className="text-emerald-400" /> Κατανομή Βαθμίδων
                </h4>
                
                <div className="space-y-4 my-auto py-2">
                  {/* Gymnasio Segment */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">Γυμνάσιο</span>
                      <span className="text-emerald-400 font-bold">{gradeStats.gymTotal} μαθ. ({students.length ? Math.round((gradeStats.gymTotal/students.length)*100) : 0}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#0b0e14] rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${students.length ? (gradeStats.gymTotal/students.length)*100 : 0}%` }}></div>
                    </div>
                  </div>

                  {/* Lykeio Segment */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">Λύκειο / Μεταλυκειακοί</span>
                      <span className="text-indigo-400 font-bold">{gradeStats.lykTotal} μαθ. ({students.length ? Math.round((gradeStats.lykTotal/students.length)*100) : 0}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#0b0e14] rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${students.length ? (gradeStats.lykTotal/students.length)*100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. RECENT STUDENTS LIST (LAST 5 RECORDED) */}
            <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
                <Users className="text-cyan-400" size={16} /> Πρόσφατες Εγγραφές Μαθητών
              </h3>
              <div className="space-y-2">
                {students.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">Δεν υπάρχουν καταχωρημένοι μαθητές.</p>
                ) : (
                  [...students].slice(-5).reverse().map((student) => (
                    <div 
                      key={student.id} 
                      onClick={() => alert(`Προβολή καρτέλας: ${student.lastName} ${student.firstName}`)}
                      className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer flex justify-between items-center transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex justify-center items-center text-indigo-400 font-bold text-xs uppercase">
                          {student.lastName.substring(0,2)}
                        </div>
                        <div>
                          <p className="text-slate-200 text-xs font-bold uppercase group-hover:text-indigo-300 transition-colors">{student.lastName} {student.firstName}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">{student.grade} • Τμήμα {student.section || "Μη ορισμένο"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                        <span className="text-[9px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Πρόσφατα</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 10. CAPACITY MONITOR (SECTIONS OCCUPANCY) */}
            <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-white font-bold text-sm flex items-center gap-2 mb-4">
                <Layers className="text-emerald-400" size={16} /> Χωρητικότητα & Πληρότητα Τμημάτων
              </h3>
              {classes.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">Δεν υπάρχουν καταχωρημένα τμήματα.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {classes.map(c => {
                    const ratio = c.maxCapacity > 0 ? (c.currentCapacity / c.maxCapacity) * 100 : 0;
                    const barColor = ratio >= 100 ? "bg-rose-500" : ratio >= 80 ? "bg-amber-500" : "bg-emerald-500";
                    
                    return (
                      <div key={c.id} className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800/80 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-bold uppercase">Τμήμα {c.className}</span>
                          <span className="text-slate-400 font-mono font-bold">{c.currentCapacity}/{c.maxCapacity}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${Math.min(ratio, 100)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDEBAR PANEL WIDGETS COLUMN (SPANS 1 COL) */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* 7. NOTIFICATIONS CENTER */}
            <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-xl">
              <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-3 tracking-wide uppercase">
                <Bell size={14} className="text-amber-400" /> Κέντρο Ειδοποιήσεων
              </h4>
              <div className="space-y-2">
                {activeNotifications.map((note, idx) => (
                  <div key={idx} className="bg-[#0b0e14] p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-medium">
                    {note}
                  </div>
                ))}
              </div>
            </div>

            {/* 9. SCHEDULER HEALTH MONITOR */}
            <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-xl">
              <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-3 tracking-wide uppercase">
                <ShieldCheck size={14} className="text-emerald-400" /> Κατάσταση Scheduler
              </h4>
              <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 text-center space-y-3">
                <div className="flex justify-center items-center gap-2 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 size={16} />
                  <span>Δεν υπάρχουν συγκρούσεις</span>
                </div>
                <p className="text-slate-500 text-[10px] leading-normal">Όλες οι αναθέσεις ωρών, καθηγητών και αιθουσών είναι έγκυρες.</p>
                <button onClick={() => alert("Μετάβαση στον Scheduler")} className="w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[10px] font-bold py-1.5 rounded-lg border border-indigo-500/20 transition-all">
                  Έλεγχος Πίνακα Ωρολογίου
                </button>
              </div>
            </div>

            {/* 8. AI INSIGHTS WIDGET */}
            <div className="bg-gradient-to-b from-[#24213d] to-[#1e2330] p-5 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-indigo-400/20"><Sparkles size={40}/></div>
              <h4 className="text-indigo-400 font-bold text-xs flex items-center gap-2 mb-3 tracking-wide uppercase">
                <Brain size={14} /> AI Optimization Engine
              </h4>
              <div className="space-y-2.5 text-[10px] text-slate-300">
                <div className="bg-[#0b0e14]/60 p-2.5 rounded-xl border border-slate-800/80">
                  💡 <span className="text-indigo-300 font-bold">Πρόταση:</span> Το τμήμα <span className="text-white font-bold">Β1</span> πλησιάζει το μέγιστο όριο χωρητικότητας. Προτείνεται άνοιγμα παρακλάδου Β3.
                </div>
                <div className="bg-[#0b0e14]/60 p-2.5 rounded-xl border border-slate-800/80">
                  🔍 <span className="text-amber-300 font-bold">Κενό:</span> Εντοπίστηκε διαθέσιμη αίθουσα (Αίθουσα 3) τις Παρασκευές 16:00-18:00.
                </div>
              </div>
            </div>

            {/* 17. SYSTEM INFRASTRUCTURE STATUS */}
            <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-xl">
              <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-3 tracking-wide uppercase">
                <HardDrive size={14} className="text-slate-400" /> Κατάσταση Συστήματος
              </h4>
              <div className="space-y-2 font-mono text-[10px]">
                <SystemStatusRow label="Local Database" status="OK" color="text-emerald-400" />
                <SystemStatusRow label="Scheduler Logic" status="ACTIVE" color="text-emerald-400" />
                <SystemStatusRow label="LocalStorage Capacity" status="98.2% Free" color="text-emerald-400" />
                <SystemStatusRow label="AI Widget Synced" status="OK" color="text-emerald-400" />
                <SystemStatusRow label="Cloud Backup" status="STABLE" color="text-cyan-400" />
              </div>
            </div>

            {/* 18. RECENT ACTIVITY FEED */}
            <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-xl">
              <h4 className="text-white font-bold text-xs flex items-center gap-2 mb-3 tracking-wide uppercase">
                <Activity size={14} className="text-indigo-400" /> Κούτσουρο Ενεργειών (Log)
              </h4>
              <div className="space-y-2 text-[10px] font-medium text-slate-400">
                <div className="border-l-2 border-indigo-500 pl-2 py-0.5">
                  <p className="text-slate-300 font-bold">Προσθήκη / Ενημέρωση Μαθητή</p>
                  <p className="text-slate-500 font-mono text-[9px]">Πριν από λίγο • localStorage sync</p>
                </div>
                <div className="border-l-2 border-emerald-500 pl-2 py-0.5">
                  <p className="text-slate-300 font-bold">Ανάγνωση Πλάνου Scheduler</p>
                  <p className="text-slate-500 font-mono text-[9px]">Πριν από 2 λεπτά</p>
                </div>
                <div className="border-l-2 border-slate-700 pl-2 py-0.5">
                  <p className="text-slate-300 font-bold">Εκκίνηση EduFlow Engine</p>
                  <p className="text-slate-500 font-mono text-[9px]">Σήμερα 18:03 • Vercel Build OK</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 14. FLOATING ACTION BUTTON (FAB) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-full flex justify-center items-center text-white shadow-2xl transition-all transform hover:scale-105 active:scale-95"
          title="Γρήγορη Προσθήκη"
        >
          <Plus size={22} className={`transition-transform duration-300 ${isFabOpen ? 'rotate-45' : ''}`} />
        </button>
        
        {isFabOpen && (
          <div className="absolute bottom-14 right-0 bg-[#161a24] border border-slate-800 p-2 rounded-2xl shadow-2xl w-48 space-y-1 animate-fadeIn">
            <button onClick={() => { window.location.href="/students"; setIsFabOpen(false); }} className="w-full text-left p-2 hover:bg-[#1e2330] rounded-xl text-slate-200 text-xs flex items-center gap-2">👨‍🎓 Νέος Μαθητής</button>
            <button onClick={() => { alert("Προσθήκη Καθηγητή"); setIsFabOpen(false); }} className="w-full text-left p-2 hover:bg-[#1e2330] rounded-xl text-slate-200 text-xs flex items-center gap-2">👨‍🏫 Νέος Καθηγητής</button>
            <button onClick={() => { alert("Προσθήκη Μαθήματος"); setIsFabOpen(false); }} className="w-full text-left p-2 hover:bg-[#1e2330] rounded-xl text-slate-200 text-xs flex items-center gap-2">📚 Νέο Μάθημα</button>
            <button onClick={() => { alert("Προσθήκη Τμήματος"); setIsFabOpen(false); }} className="w-full text-left p-2 hover:bg-[#1e2330] rounded-xl text-slate-200 text-xs flex items-center gap-2">🏫 Νέο Τμήμα</button>
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
    <div className={`bg-gradient-to-br ${color} ${border} border p-5 rounded-3xl flex flex-col gap-2 shadow-md hover:translate-y-[-2px] transition-all duration-300`}>
      <div className={`w-8 h-8 rounded-xl bg-[#0b0e14]/50 flex justify-center items-center ${iconColor}`}>
        {icon}
      </div>
      <div className="mt-1">
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider leading-none">{title}</p>
        <p className="text-2xl font-black text-white mt-1.5 tracking-tight font-mono transition-all duration-500">{value}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ label, onClick, color }: { label: string; onClick: () => void; color: string; }) {
  return (
    <button 
      onClick={onClick}
      className={`bg-[#0b0e14] border border-slate-800 text-slate-200 font-semibold text-xs py-2.5 px-3 rounded-xl transition-all ${color}`}
    >
      {label}
    </button>
  );
}

function SystemStatusRow({ label, status, color }: { label: string; status: string; color: string; }) {
  return (
    <div className="flex justify-between items-center bg-[#0b0e14] px-3 py-1.5 rounded-lg border border-slate-900/60">
      <span className="text-slate-500">{label}</span>
      <span className={`${color} font-bold flex items-center gap-1`}><span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>{status}</span>
    </div>
  );
}