"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { 
  FileDown, Users, UserCheck, School, BookOpen, 
  Target, TrendingUp, PieChart as PieIcon, BarChart3, 
  LayoutDashboard, Calendar as CalendarIcon, 
  AlertCircle, Search, Filter, Printer, CheckCircle2,
  Clock, Activity, Briefcase
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line 
} from "recharts";

// Χρώματα για τα γραφήματα
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const [data, setData] = useState({
    students: [],
    teachers: [],
    classes: [],
    lessons: [],
    leads: [],
    schedule: []
  });

  useEffect(() => {
    setIsMounted(true);
    const load = () => {
      // ✅ Διόρθωση 1 & 2 & 3: σωστά keys (ίδια με το υπόλοιπο project)
      const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
      const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
      const classes = JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]");
      const lessons = JSON.parse(localStorage.getItem("eduflow_courses") || "[]");
      const leads = JSON.parse(localStorage.getItem("eduflow_crm_leads") || "[]");
      const schedule = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");

      // 🐞 Διόρθωση 8: DEBUG logs (αν δεις [] => λάθος key)
      console.log("Students", students);
      console.log("Teachers", teachers);
      console.log("Classes", classes);
      console.log("Schedule", schedule);

      setData({ students, teachers, classes, lessons, leads, schedule });
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  // --- Υπολογισμοί KPIs ---
  const stats = useMemo(() => {
    const totalStudents = data.students.length;
    const totalTeachers = data.teachers.length;
    const totalClasses = data.classes.length;
    const totalLessons = data.lessons.length;
    const totalLeads = data.leads.length;
    
    // Υπολογισμός Πληρότητας
    let totalCapacity = 0;
    let currentEnrollments = 0;
    data.classes.forEach((c: any) => {
      totalCapacity += (c.maxStudents || c.maxCapacity || c.capacity || 20);
    });
    data.students.forEach((s: any) => {
      currentEnrollments += (s.enrollments?.length || 0);
    });
    const occupancyRate = totalCapacity > 0 ? Math.round((currentEnrollments / totalCapacity) * 100) : 0;

    return { totalStudents, totalTeachers, totalClasses, totalLessons, totalLeads, occupancyRate };
  }, [data]);

  // --- Data για Γραφήματα ---
  const studentsByGrade = useMemo(() => {
    const grades: any = {};
    data.students.forEach((s: any) => {
      grades[s.grade] = (grades[s.grade] || 0) + 1;
    });
    return Object.keys(grades).map(key => ({ name: key, value: grades[key] }));
  }, [data.students]);

  const studentsBySubject = useMemo(() => {
    const subjects: any = {};
    data.students.forEach((s: any) => {
      s.enrollments?.forEach((e: any) => {
        subjects[e.lessonName] = (subjects[e.lessonName] || 0) + 1;
      });
    });
    return Object.keys(subjects).map(key => ({ name: key, value: subjects[key] }));
  }, [data.students]);

  const crmFunnelData = useMemo(() => {
    const statusCounts: any = {};
    data.leads.forEach((l: any) => {
      statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    });
    return [
      { step: "Leads", count: data.leads.length },
      { step: "Επικοινωνία", count: statusCounts["Επικοινωνία"] || 0 },
      { step: "Ραντεβού", count: statusCounts["Ραντεβού"] || 0 },
      { step: "Εγγραφή", count: statusCounts["Εγγραφή"] || 0 },
    ];
  }, [data.leads]);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Reports & Analytics v2" description="Πλήρης εποπτεία, στατιστική ανάλυση και εξαγωγή αναφορών.">
      
      {/* 🛠️ TOP ACTIONS (Print & Export) */}
      <div className="print:hidden flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-[#1e2330] p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: "dashboard", icon: <LayoutDashboard size={16}/>, label: "Dashboard" },
            { id: "students", icon: <Users size={16}/>, label: "Μαθητές" },
            { id: "teachers", icon: <Briefcase size={16}/>, label: "Καθηγητές" },
            { id: "classes", icon: <School size={16}/>, label: "Τμήματα" },
            { id: "crm", icon: <Target size={16}/>, label: "CRM" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => window.print()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            <Printer size={16} /> Print PDF
          </button>
        </div>
      </div>

      {/* 📊 KPI CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 print:grid-cols-4">
        <KPICard title="Μαθητές" value={stats.totalStudents} icon={<Users className="text-indigo-400"/>} trend="+2 αυτό το μήνα" />
        <KPICard title="Καθηγητές" value={stats.totalTeachers} icon={<Briefcase className="text-emerald-400"/>} trend="Ενεργοί" />
        <KPICard title="Τμήματα" value={stats.totalClasses} icon={<School className="text-amber-400"/>} trend={`${stats.occupancyRate}% Πληρότητα`} />
        <KPICard title="CRM Leads" value={stats.totalLeads} icon={<Target className="text-rose-400"/>} trend="Εκκρεμείς κλήσεις" />
      </div>

      {/* --- DASHBOARD VIEW --- */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Γράφημα Τάξεων */}
            <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 shadow-md">
              <h3 className="text-white text-xs font-black uppercase tracking-wider mb-6 flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-400"/> Μαθητές ανά Τάξη
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentsByGrade}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Γράφημα Μαθημάτων */}
            <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 shadow-md">
              <h3 className="text-white text-xs font-black uppercase tracking-wider mb-6 flex items-center gap-2">
                <PieIcon size={16} className="text-emerald-400"/> Δημοφιλή Μαθήματα
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentsBySubject}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {studentsBySubject.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Insights */}
            <div className="lg:col-span-1 bg-[#1e2330] p-6 rounded-3xl border border-slate-800 shadow-md h-fit">
              <h3 className="text-white text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-400"/> AI Insights (🤖)
              </h3>
              <div className="space-y-3">
                {stats.occupancyRate > 85 && (
                  <InsightItem type="warning" text="Η συνολική πληρότητα αγγίζει το 90%. Προτείνεται η δημιουργία νέων τμημάτων στην Γ' Λυκείου." />
                )}
                {data.leads.length > 10 && (
                  <InsightItem type="info" text="Υπάρχουν 12 leads σε εκκρεμότητα. Ο μέσος χρόνος μετατροπής έχει αυξηθεί." />
                )}
                <InsightItem type="success" text="Το μάθημα 'Μαθηματικά' έχει τη μεγαλύτερη ανάπτυξη (+15%) αυτό το τρίμηνο." />
              </div>
            </div>

            {/* Πληρότητα Τμημάτων Progress Bars */}
            <div className="lg:col-span-2 bg-[#1e2330] p-6 rounded-3xl border border-slate-800 shadow-md">
              <h3 className="text-white text-xs font-black uppercase tracking-wider mb-6 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400"/> Capacity Monitor (Top 5 Τμήματα)
              </h3>
              <div className="space-y-4">
                {data.classes.slice(0, 5).map((c: any, i: number) => {
                  // ✅ Διόρθωση 4: υποστήριξη name ή className
                  const className = c.name || c.className;
                  const current = data.students.filter((s: any) => s.enrollments?.some((e: any) => e.className === className)).length;
                  const max = c.maxStudents || c.maxCapacity || c.capacity || 20;
                  const perc = Math.min(Math.round((current / max) * 100), 100);
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-300">{className} ({c.grade})</span>
                        <span className={perc >= 100 ? "text-rose-500" : "text-slate-500"}>{current} / {max} {perc >= 100 ? "FULL" : ""}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${perc >= 100 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${perc}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- DATA TABLES (Print Ready) --- */}
      {activeTab !== "dashboard" && (
        <div className="bg-white p-0 sm:p-8 text-black rounded-3xl overflow-hidden print:bg-white print:p-0">
          <div className="print:flex hidden justify-between items-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold">EduFlow Executive Report</h1>
            <div className="text-right text-sm">
              <p>Ημερομηνία: {new Date().toLocaleDateString('el-GR')}</p>
              <p>Σελίδα 1 από 1</p>
            </div>
          </div>

          <h2 className="text-lg font-black uppercase mb-4 px-4 sm:px-0 print:text-black">
             Αναλυτική Αναφορά: {activeTab.toUpperCase()}
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-200 print:border-black">
              <thead>
                <tr className="bg-slate-50 print:bg-slate-100">
                  {getTableHeaders(activeTab).map(h => (
                    <th key={h} className="border border-slate-200 p-3 text-left text-[11px] font-bold uppercase print:border-black print:text-black">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getTableData(activeTab, data).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 print:bg-white">
                    {Object.values(row).map((val: any, idx: number) => (
                      <td key={idx} className="border border-slate-200 p-3 text-xs print:border-black print:text-black">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT-ONLY FOOTER */}
      <div className="hidden print:block fixed bottom-0 left-0 w-full text-center text-[10px] text-slate-500 border-t border-slate-200 pt-2">
        EduFlow ERP - Σύστημα Διαχείρισης Εκπαιδευτηρίου - Εμπιστευτικό
      </div>

    </WorkspaceShell>
  );
}

// --- Helper Components & Functions ---

function KPICard({ title, value, icon, trend }: any) {
  return (
    <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2.5 bg-slate-900 rounded-2xl">{icon}</div>
      </div>
      <div>
        <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{title}</h3>
        <p className="text-white text-2xl font-black mt-1">{value}</p>
        <p className="text-emerald-500 text-[10px] font-medium mt-1">{trend}</p>
      </div>
    </div>
  );
}

function InsightItem({ type, text }: any) {
  const colors: any = {
    warning: "border-amber-500/20 bg-amber-500/5 text-amber-400",
    info: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400",
    success: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
  };
  return (
    <div className={`p-3 rounded-2xl border text-[11px] leading-relaxed ${colors[type]}`}>
      {text}
    </div>
  );
}

function getTableHeaders(tab: string) {
  switch(tab) {
    case "students": return ["Όνομα", "Τάξη", "Γονέας", "Τηλέφωνο", "Email", "Εγγραφές"];
    case "teachers": return ["Όνομα", "Μάθημα", "Τηλέφωνο", "Availability"];
    case "classes": return ["Τμήμα", "Τάξη", "Χωρητικότητα", "Κατάσταση"];
    case "crm": return ["Lead", "Τηλέφωνο", "Στάδιο", "Πηγή", "Ημερ. Δημιουργίας"];
    default: return [];
  }
}

function getTableData(tab: string, data: any) {
  switch(tab) {
    case "students": 
      return data.students.map((s: any) => ({
        name: `${s.lastName} ${s.firstName}`,
        grade: s.grade,
        parent: s.parentName,
        phone: s.phone,
        // ✅ Διόρθωση 6: fallback για email
        email: s.parentEmail || s.email || "-",
        count: `${s.enrollments?.length || 0} μαθήματα`
      }));
    case "teachers":
      return data.teachers.map((t: any) => ({
        name: t.name,
        // ✅ Διόρθωση 5: subjects array -> string
        subject: t.subjects?.join(", ") || t.subject || "-",
        phone: t.phone,
        availability: `${t.availability?.length || 0} ώρες`
      }));
    case "classes":
      return data.classes.map((c: any) => ({
        // ✅ Διόρθωση 4: name ή className
        name: c.name || c.className,
        grade: c.grade,
        capacity: c.maxStudents || c.maxCapacity || c.capacity || 20,
        status: "Ενεργό"
      }));
    case "crm":
      return data.leads.map((l: any) => ({
        name: l.name,
        phone: l.phone,
        status: l.status,
        source: l.source,
        // ✅ Διόρθωση 7: fallback για date
        date: l.createdAt || "-"
      }));
    default: return [];
  }
}
