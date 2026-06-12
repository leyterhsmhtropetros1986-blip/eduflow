"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import {
  Users, UserCheck, BookOpen, CalendarDays, CheckCircle2, TrendingUp,
  Euro, AlertCircle, Percent, GraduationCap,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#38bdf8", "#ec4899"];
const GR_DAYS = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];

const read = (k: string, fb = "[]") => {
  try { return JSON.parse(localStorage.getItem(k) || fb); } catch { return JSON.parse(fb); }
};
const teacherName = (t: any) => t.name || `${t.lastName || ""} ${t.firstName || ""}`.trim();
const parseDate = (v: any) => { const d = new Date(v); return isNaN(d.getTime()) ? null : d; };

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [d, setD] = useState<any>({ students: [], teachers: [], classes: [], schedule: [], attendance: [], payments: [], lessons: [] });

  useEffect(() => {
    setMounted(true);
    const load = () => setD({
      students: read("eduflow_students"),
      teachers: read("eduflow_teachers"),
      classes: read("eduflow_classes", localStorage.getItem("eduflow_classes_data") || "[]"),
      schedule: read("eduflow_schedule"),
      attendance: read("eduflow_attendance"),
      payments: read("eduflow_payments"),
      lessons: read("eduflow_lessons", localStorage.getItem("eduflow_courses") || "[]"),
    });
    load();
    window.addEventListener("focus", load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener("focus", load); window.removeEventListener("storage", load); };
  }, []);

  // ---- KPIs ----
  const kpis = useMemo(() => {
    const now = new Date();
    const thisMonth = (dt: Date | null) => dt && dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();

    const newStudents = d.students.filter((s: any) => thisMonth(parseDate(s.createdAt || s.registrationDate || s.date))).length;

    const activeTeachers = d.teachers.length;

    // Πληρότητα: θέσεις γεμάτες / συνολική χωρητικότητα
    const seats = d.students.reduce((a: number, s: any) => a + (s.enrollments?.length || 0), 0);
    const capacity = d.classes.reduce((a: number, c: any) => a + (Number(c.maxStudents) || Number(c.capacity) || 0), 0);
    const occupancy = capacity > 0 ? Math.round((seats / capacity) * 100) : 0;

    // Attendance %
    let pres = 0, tot = 0;
    d.attendance.forEach((r: any) => { const st = r.status || (r.present ? "present" : "absent"); tot++; if (st === "present") pres++; });
    const attRate = tot > 0 ? Math.round((pres / tot) * 100) : 0;

    // Σημερινά μαθήματα
    const today = GR_DAYS[now.getDay()];
    const todayLessons = d.schedule.filter((s: any) => s.day === today).length;

    // Οικονομικά (από eduflow_payments — 0 μέχρι να φτιαχτεί το Finance)
    const monthRevenue = d.payments.filter((p: any) => p.status === "paid" && thisMonth(parseDate(p.date))).reduce((a: number, p: any) => a + (Number(p.amount) || 0), 0);
    const pendingPay = d.payments.filter((p: any) => p.status === "pending").reduce((a: number, p: any) => a + (Number(p.amount) || 0), 0);

    return { total: d.students.length, newStudents, activeTeachers, occupancy, attRate, todayLessons, monthRevenue, pendingPay };
  }, [d]);

  // ---- Πληρότητα ανά τμήμα ----
  const occByClass = useMemo(() =>
    d.classes.map((c: any) => {
      const name = c.name || c.className || "—";
      const cur = d.students.filter((s: any) => (s.enrollments || []).some((e: any) => e.className === name)).length;
      const max = Number(c.maxStudents) || Number(c.capacity) || 0;
      return { name, "Εγγεγραμμένοι": cur, "Χωρητικότητα": max };
    }).slice(0, 12)
  , [d]);

  // ---- Φόρτος καθηγητών (μαθήματα/εβδομάδα) ----
  const teacherLoad = useMemo(() => {
    const map: any = {};
    d.teachers.forEach((t: any) => { map[teacherName(t)] = 0; });
    d.schedule.forEach((s: any) => { if (s.teacher) map[s.teacher] = (map[s.teacher] || 0) + 1; });
    return Object.keys(map).map((k) => ({ name: k, "Μαθήματα": map[k] })).sort((a, b) => b["Μαθήματα"] - a["Μαθήματα"]).slice(0, 12);
  }, [d]);

  // ---- Μαθητές ανά τάξη ----
  const byGrade = useMemo(() => {
    const map: any = {};
    d.students.forEach((s: any) => { const g = s.grade || "Άλλο"; map[g] = (map[g] || 0) + 1; });
    return Object.keys(map).map((k) => ({ name: k, value: map[k] }));
  }, [d]);

  // ---- Παρουσίες ανά ημερομηνία (line) ----
  const attOverTime = useMemo(() => {
    const map: any = {};
    d.attendance.forEach((r: any) => {
      const dt = parseDate(r.date);
      const key = dt ? dt.toLocaleDateString("el-GR") : null;
      if (!key) return;
      if (!map[key]) map[key] = { date: key, "Παρών": 0, "Απών": 0, _t: dt!.getTime() };
      const st = r.status || (r.present ? "present" : "absent");
      if (st === "present") map[key]["Παρών"]++; else if (st === "absent") map[key]["Απών"]++;
    });
    return Object.values(map).sort((a: any, b: any) => a._t - b._t).slice(-14);
  }, [d]);

  // ---- Σημερινό πρόγραμμα ----
  const todaySchedule = useMemo(() => {
    const today = GR_DAYS[new Date().getDay()];
    return d.schedule.filter((s: any) => s.day === today).sort((a: any, b: any) => (a.time || "").localeCompare(b.time || ""));
  }, [d]);

  if (!mounted) {
    return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center"><div className="text-slate-500 text-xs font-mono animate-pulse">Φόρτωση...</div></div>;
  }

  return (
    <WorkspaceShell title="Dashboard" description="Πραγματική εικόνα του φροντιστηρίου σε πραγματικό χρόνο.">

      {/* KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi icon={<Users size={20} />} label="Σύνολο Μαθητών" value={kpis.total} color="text-indigo-400" />
        <Kpi icon={<TrendingUp size={20} />} label="Νέοι Μαθητές (μήνα)" value={kpis.newStudents} color="text-emerald-400" />
        <Kpi icon={<UserCheck size={20} />} label="Ενεργοί Καθηγητές" value={kpis.activeTeachers} color="text-sky-400" />
        <Kpi icon={<CalendarDays size={20} />} label="Σημερινά Μαθήματα" value={kpis.todayLessons} color="text-purple-400" />
        <Kpi icon={<Percent size={20} />} label="Πληρότητα" value={`${kpis.occupancy}%`} color="text-amber-400" />
        <Kpi icon={<CheckCircle2 size={20} />} label="Παρουσία" value={`${kpis.attRate}%`} color="text-emerald-400" />
        <Kpi icon={<Euro size={20} />} label="Έσοδα Μήνα" value={`${kpis.monthRevenue}€`} color="text-indigo-400" note={d.payments.length === 0 ? "Finance module" : undefined} />
        <Kpi icon={<AlertCircle size={20} />} label="Εκκρεμείς Πληρωμές" value={`${kpis.pendingPay}€`} color="text-rose-400" note={d.payments.length === 0 ? "Finance module" : undefined} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard title="Πληρότητα ανά Τμήμα" empty={occByClass.length === 0}>
          <BarChart data={occByClass}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
            <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Χωρητικότητα" fill="#334155" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Εγγεγραμμένοι" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Φόρτος Καθηγητών (μαθήματα/εβδ.)" empty={teacherLoad.length === 0}>
          <BarChart data={teacherLoad} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={110} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="Μαθήματα" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Μαθητές ανά Τάξη" empty={byGrade.length === 0}>
          <PieChart>
            <Pie data={byGrade} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(e: any) => `${e.name}: ${e.value}`} labelLine={false} fontSize={10}>
              {byGrade.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ChartCard>

        <ChartCard title="Παρουσίες ανά Ημέρα (τελευταίες 14)" empty={attOverTime.length === 0}>
          <LineChart data={attOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
            <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Παρών" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Απών" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartCard>
      </div>

      {/* TODAY SCHEDULE */}
      <div className="mt-6 bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
        <h3 className="text-white text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
          <CalendarDays size={16} className="text-purple-400" /> Σημερινό Πρόγραμμα ({GR_DAYS[new Date().getDay()]})
        </h3>
        {todaySchedule.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-6">Δεν υπάρχουν μαθήματα σήμερα.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todaySchedule.map((s: any, i: number) => (
              <div key={s.id ?? i} className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3 flex items-center gap-3">
                <div className="text-indigo-400 font-black text-sm w-14">{s.time}</div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-bold truncate">{s.groupName} — {s.subject}</p>
                  <p className="text-slate-500 text-[10px] truncate">👨‍🏫 {s.teacher}{s.room ? ` • 🚪 ${s.room}` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}

const tooltipStyle = { backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px", color: "#fff" };

function Kpi({ icon, label, value, color, note }: any) {
  return (
    <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase font-bold text-slate-500">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <div className={`text-3xl font-black ${color}`}>{value}</div>
      {note && <div className="text-[9px] text-slate-600 mt-1">απαιτεί: {note}</div>}
    </div>
  );
}

function ChartCard({ title, children, empty }: any) {
  return (
    <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
      <h3 className="text-white text-xs font-black uppercase tracking-wider mb-6">{title}</h3>
      {empty ? (
        <p className="text-slate-500 text-xs text-center py-16">Δεν υπάρχουν αρκετά δεδομένα ακόμα.</p>
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
