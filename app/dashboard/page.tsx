"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Calendar, CheckCircle2, ClipboardList, Briefcase, AlertTriangle, GraduationCap, Users, BookOpen, TrendingUp, CalendarOff, Plus, ChevronRight, Activity } from "lucide-react";

const DAY_NAMES = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];

const parse = (k: string, fb: any = []) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fb)); } catch { return fb; } };

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState({ students: [] as any[], teachers: [] as any[], classes: [] as any[], schedule: [] as any[], attendance: [] as any[], exams: [] as any[], holidays: [] as any[], changes: [] as any[], leads: [] as any[] });

  const todayISO = new Date().toISOString().slice(0, 10);
  const todayName = DAY_NAMES[new Date().getDay()];

  useEffect(() => {
    setIsMounted(true);
    setData({
      students: parse("eduflow_students"),
      teachers: parse("eduflow_teachers"),
      classes: parse("eduflow_classes").length ? parse("eduflow_classes") : parse("eduflow_classes_data"),
      schedule: parse("eduflow_schedule"),
      attendance: parse("eduflow_attendance"),
      exams: parse("eduflow_exams"),
      holidays: parse("eduflow_holidays"),
      changes: parse("eduflow_changes"),
      leads: parse("eduflow_crm_leads"),
    });
  }, []);

  // Είναι σήμερα αργία;
  const todayHoliday = useMemo(() => data.holidays.find((h: any) => h.date === todayISO), [data.holidays, todayISO]);

  // Σημερινά μαθήματα (με αλλαγές)
  const todayLessons = useMemo(() => {
    const cancelledIds = new Set(data.changes.filter((c: any) => c.type === "cancel" && c.date === todayISO).map((c: any) => c.scheduleId));
    const makeups = data.changes.filter((c: any) => (c.type === "makeup" || c.type === "swap") && c.newDate === todayISO);
    const regular = data.schedule.filter((s: any) => s.day === todayName && !cancelledIds.has(s.id));
    // Προσθέτω και τις αναπληρώσεις/μεταθέσεις που πέφτουν σήμερα
    const extras = makeups.map((c: any) => {
      const orig = data.schedule.find((s: any) => s.id === c.scheduleId);
      if (!orig) return null;
      return { ...orig, time: c.newStart ? `${c.newStart}-${c.newStart}` : orig.time, _makeup: true };
    }).filter(Boolean);
    return [...regular, ...extras].sort((a: any, b: any) => String(a.time).localeCompare(String(b.time)));
  }, [data, todayName, todayISO]);

  // Παρουσίες σήμερα — ποιοι έχουν περαστεί
  const attendanceDone = useMemo(() => {
    const recs = data.attendance.filter((a: any) => a.date === todayISO);
    return new Set(recs.map((a: any) => `${a.studentId || a.studentName}-${a.lessonName || a.subject}`));
  }, [data.attendance, todayISO]);

  // Επερχόμενα διαγωνίσματα (επόμενες 7 μέρες)
  const upcomingExams = useMemo(() => {
    const today = new Date(todayISO); const limit = new Date(today); limit.setDate(today.getDate() + 7);
    return data.exams
      .filter((e: any) => { const d = new Date(e.date); return d >= today && d <= limit; })
      .sort((a: any, b: any) => (a.date + a.start).localeCompare(b.date + b.start));
  }, [data.exams, todayISO]);

  // Επερχόμενες αργίες (επόμενες 30 μέρες)
  const upcomingHolidays = useMemo(() => {
    const today = new Date(todayISO); const limit = new Date(today); limit.setDate(today.getDate() + 30);
    return data.holidays.filter((h: any) => { const d = new Date(h.date); return d >= today && d <= limit; }).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [data.holidays, todayISO]);

  // Εκκρεμή CRM follow-ups
  const overdueFollowUps = useMemo(() => {
    return data.leads.filter((l: any) => {
      if (!l.followUpDate || l.status === "Εγγραφή" || l.status === "Χάθηκε") return false;
      return l.followUpDate <= todayISO;
    });
  }, [data.leads, todayISO]);

  // Health alerts
  const healthAlerts = useMemo(() => {
    const lessonsRaw = parse("eduflow_lessons");
    const enrollByLesson: Record<string, number> = {};
    data.students.forEach((s: any) => (s.enrollments || []).forEach((e: any) => { if (e.lessonName) enrollByLesson[e.lessonName] = (enrollByLesson[e.lessonName] || 0) + 1; }));
    const noHours = lessonsRaw.filter((l: any) => typeof l === "object" && (!l.weeklyHours || !(l.distribution?.length))).length;
    const lessonNames = lessonsRaw.map((l: any) => typeof l === "string" ? l : l?.name).filter(Boolean);
    const noTeacher = lessonNames.filter((nm: string) => (enrollByLesson[nm] || 0) > 0 && !data.teachers.some((t: any) => t.subject === nm)).length;
    return noHours + noTeacher;
  }, [data]);

  const pendingAttendance = useMemo(() => {
    let pending = 0;
    todayLessons.forEach((l: any) => {
      // Πόσοι μαθητές αυτού του τμήματος δεν έχουν περαστεί
      const studentsInClass = data.students.filter((s: any) => (s.enrollments || []).some((e: any) => e.className === l.groupName && e.lessonName === l.subject));
      studentsInClass.forEach((s: any) => {
        const key = `${s.id}-${l.subject}`;
        const altKey = `${`${s.firstName} ${s.lastName}`.trim()}-${l.subject}`;
        if (!attendanceDone.has(key) && !attendanceDone.has(altKey)) pending++;
      });
    });
    return pending;
  }, [todayLessons, data.students, attendanceDone]);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Dashboard" description={`Σήμερα: ${new Date().toLocaleDateString("el-GR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}`}>

      {/* HOLIDAY BANNER */}
      {todayHoliday && (
        <div className="mb-6 p-5 rounded-2xl bg-rose-950/30 border border-rose-900/50 flex items-center gap-4">
          <CalendarOff size={28} className="text-rose-400 shrink-0" />
          <div>
            <h2 className="text-rose-300 font-black text-lg">⚠ {todayHoliday.label}</h2>
            <p className="text-xs text-rose-400/80">Σήμερα είναι {todayHoliday.type === "holiday" ? "αργία" : todayHoliday.type === "closure" ? "κλειστά" : "ειδική ημέρα"}.</p>
          </div>
        </div>
      )}

      {/* KPIs ΣΥΝΟΛΑ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Μαθητές" value={data.students.length} icon={<GraduationCap size={16} />} href="/students" />
        <Stat label="Καθηγητές" value={data.teachers.length} icon={<Users size={16} />} href="/teachers" />
        <Stat label="Τμήματα" value={data.classes.length} icon={<BookOpen size={16} />} href="/classes" />
        <Stat label="Ώρες/εβδ." value={data.schedule.reduce((acc: number, s: any) => { const [a,b] = String(s.time).split("-"); return acc + (parseInt(b)-parseInt(a) || 0); }, 0)} icon={<TrendingUp size={16} />} href="/schedule" />
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <QuickAction href="/students" icon={<Plus size={14} />} label="Νέος μαθητής" color="indigo" />
        <QuickAction href="/attendance" icon={<CheckCircle2 size={14} />} label="Παρουσίες σήμερα" color="emerald" />
        <QuickAction href="/calendar" icon={<CalendarOff size={14} />} label="Νέα αλλαγή" color="amber" />
        <QuickAction href="/schedule" icon={<Activity size={14} />} label="Δημιουργία προγρ." color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ΣΗΜΕΡΑ — μαθήματα + παρουσίες */}
        <div className="lg:col-span-2 bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2"><Calendar size={16} className="text-indigo-400" /> Σήμερα — {todayName}</h3>
            <div className="flex items-center gap-2 text-[11px]">
              {pendingAttendance > 0 ? <span className="bg-amber-950/40 text-amber-400 px-2 py-1 rounded font-bold">⏳ {pendingAttendance} εκκρεμείς παρουσίες</span> : todayLessons.length > 0 ? <span className="bg-emerald-950/40 text-emerald-400 px-2 py-1 rounded font-bold">✓ Όλες ΟΚ</span> : null}
            </div>
          </div>

          {todayHoliday ? (
            <p className="text-slate-500 text-sm text-center py-8">🏖 Σήμερα δεν υπάρχουν μαθήματα — {todayHoliday.label}.</p>
          ) : todayLessons.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Δεν υπάρχουν προγραμματισμένα μαθήματα σήμερα.</p>
          ) : (
            <div className="space-y-2">
              {todayLessons.map((l: any) => (
                <div key={l.id} className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="font-mono text-xs text-indigo-400 font-bold w-24">{l.time}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm flex items-center gap-2">
                      {l.subject}
                      {l._makeup && <span className="text-[9px] bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded">ΑΝΑΠΛΗΡΩΣΗ</span>}
                    </p>
                    <p className="text-[11px] text-slate-400">{l.groupName} · {l.teacher}{l.room ? ` · 🚪 ${l.room}` : ""}</p>
                  </div>
                  <Link href="/attendance" className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold">Παρουσίες</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-4">
          {/* ALERTS */}
          {(healthAlerts > 0 || overdueFollowUps.length > 0) && (
            <div className="bg-amber-950/20 border border-amber-900/40 rounded-3xl p-5">
              <h3 className="text-amber-300 font-bold text-sm mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Προσοχή</h3>
              <div className="space-y-2">
                {healthAlerts > 0 && <Link href="/health" className="block bg-[#0b0e14] border border-amber-900/30 rounded-lg p-2.5 text-xs hover:bg-amber-950/30 transition">⚠ <span className="text-white font-bold">{healthAlerts}</span> <span className="text-slate-400">θέματα στα δεδομένα</span></Link>}
                {overdueFollowUps.length > 0 && <Link href="/crm" className="block bg-[#0b0e14] border border-amber-900/30 rounded-lg p-2.5 text-xs hover:bg-amber-950/30 transition">📞 <span className="text-white font-bold">{overdueFollowUps.length}</span> <span className="text-slate-400">εκκρεμή follow-ups</span></Link>}
              </div>
            </div>
          )}

          {/* ΕΠΕΡΧΟΜΕΝΑ ΔΙΑΓΩΝΙΣΜΑΤΑ */}
          <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-5">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><ClipboardList size={14} className="text-indigo-400" /> Διαγωνίσματα 7 ημερών</h3>
            {upcomingExams.length === 0 ? <p className="text-slate-500 text-xs">Κανένα.</p> :
              <div className="space-y-1.5">
                {upcomingExams.slice(0, 5).map((e: any) => (
                  <Link key={e.id} href="/exams" className="block bg-[#0b0e14] rounded-lg p-2 text-[11px] hover:bg-slate-800/40">
                    <p className="text-white font-bold">{e.subject} <span className="text-slate-400 font-normal">· {e.grade}</span></p>
                    <p className="text-slate-400">{new Date(e.date).toLocaleDateString("el-GR", { weekday: "short", day: "2-digit", month: "2-digit" })} · {e.start}</p>
                  </Link>
                ))}
              </div>
            }
          </div>

          {/* ΕΠΕΡΧΟΜΕΝΕΣ ΑΡΓΙΕΣ */}
          <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-5">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><CalendarOff size={14} className="text-rose-400" /> Επερχόμενες αργίες</h3>
            {upcomingHolidays.length === 0 ? <p className="text-slate-500 text-xs">Καμία τις επόμενες 30 μέρες.</p> :
              <div className="space-y-1.5">
                {upcomingHolidays.slice(0, 5).map((h: any) => (
                  <div key={h.id} className="bg-[#0b0e14] rounded-lg p-2 text-[11px]">
                    <p className="text-white font-bold">{h.label}</p>
                    <p className="text-slate-400">{new Date(h.date).toLocaleDateString("el-GR", { weekday: "short", day: "2-digit", month: "2-digit" })}</p>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function Stat({ label, value, icon, href }: { label: string; value: number; icon: any; href: string }) {
  return (
    <Link href={href} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 hover:border-indigo-500/40 transition group">
      <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider">{icon} {label}</div>
      <p className="text-2xl font-black text-white mt-1 group-hover:text-indigo-400 transition">{value}</p>
    </Link>
  );
}
function QuickAction({ href, icon, label, color }: { href: string; icon: any; label: string; color: string }) {
  const c: Record<string,string> = { indigo: "bg-indigo-950/40 hover:bg-indigo-950/60 text-indigo-400 border-indigo-900/40", emerald: "bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-400 border-emerald-900/40", amber: "bg-amber-950/40 hover:bg-amber-950/60 text-amber-400 border-amber-900/40", purple: "bg-purple-950/40 hover:bg-purple-950/60 text-purple-400 border-purple-900/40" };
  return (
    <Link href={href} className={`${c[color]} border rounded-xl p-3 text-xs font-bold flex items-center justify-between gap-2 transition`}>
      <span className="flex items-center gap-2">{icon} {label}</span>
      <ChevronRight size={12} />
    </Link>
  );
}
