"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  Building, Library, Calendar, CheckCircle2, Briefcase,
  UserCircle, FileText, Bell, Search, Bot, Database, Activity, Printer, Send, Clock, RefreshCw, TrendingUp, ClipboardList, Timer
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { href: "/students", label: "Μαθητές", icon: <GraduationCap size={20} /> },
  { href: "/progress", label: "Πρόοδος", icon: <TrendingUp size={20} /> },
  { href: "/teachers", label: "Καθηγητές", icon: <Users size={20} /> },
  { href: "/teacher-hours", label: "Ώρες Καθηγητών", icon: <Timer size={20} /> },
  { href: "/classes", label: "Τάξεις", icon: <BookOpen size={20} /> },
  { href: "/availability", label: "Διαθεσιμότητα", icon: <Clock size={20} /> },
  { href: "/rooms", label: "Αίθουσες", icon: <Building size={20} /> },
  { href: "/courses", label: "Μαθήματα", icon: <Library size={20} /> },
  { href: "/health", label: "Έλεγχος", icon: <Activity size={20} /> },
  { href: "/schedule", label: "Scheduler", icon: <Calendar size={20} /> },
  { href: "/timetable", label: "Πρόγραμμα", icon: <Printer size={20} /> },
  { href: "/exams", label: "Διαγωνίσματα", icon: <ClipboardList size={20} /> },
  { href: "/attendance", label: "Παρουσίες", icon: <CheckCircle2 size={20} /> },
  { href: "/notifications", label: "Ειδοποιήσεις", icon: <Bell size={20} /> },
  { href: "/messages", label: "Επικοινωνία", icon: <Send size={20} /> },
  { href: "/crm", label: "CRM", icon: <Briefcase size={20} /> },
  { href: "/parents", label: "Γονείς", icon: <UserCircle size={20} /> },
  { href: "/reports", label: "Αναφορές", icon: <FileText size={20} /> },
  { href: "/backup", label: "Backup", icon: <Database size={20} /> },
];

const parse = (k: string) => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } };

export function WorkspaceShell({ title, description, children }: { title: string; description: string; children: React.ReactNode; }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [healthCount, setHealthCount] = useState(0);
  const [crmCount, setCrmCount] = useState(0);

  // Δεδομένα για global search
  const [data, setData] = useState<{ students: any[]; teachers: any[]; parents: string[]; classes: any[]; lessons: string[] }>({
    students: [], teachers: [], parents: [], classes: [], lessons: [],
  });

  // Global search UI
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const calc = () => {
      // Αδιάβαστες ειδοποιήσεις
      try { setUnread(parse("eduflow_notifications").filter((n: any) => !n.read).length); } catch { setUnread(0); }

      const students = parse("eduflow_students");
      const teachers = parse("eduflow_teachers");
      const classes = parse("eduflow_classes").length ? parse("eduflow_classes") : parse("eduflow_classes_data");
      const lessonsRaw = parse("eduflow_lessons");
      const leads = parse("eduflow_crm_leads");

      const lessonNames: string[] = lessonsRaw.map((l: any) => (typeof l === "string" ? l : l?.name)).filter(Boolean);

      // Health: μαθήματα χωρίς ώρες + μαθήματα με εγγραφές χωρίς καθηγητή
      const enrollByLesson: Record<string, number> = {};
      students.forEach((s: any) => (s.enrollments || []).forEach((e: any) => { if (e.lessonName) enrollByLesson[e.lessonName] = (enrollByLesson[e.lessonName] || 0) + 1; }));
      const noHours = lessonsRaw.filter((l: any) => typeof l === "object" && (!l.weeklyHours || !(l.distribution?.length))).length;
      const noTeacher = lessonNames.filter((nm) => (enrollByLesson[nm] || 0) > 0 && !teachers.some((t: any) => t.subject === nm)).length;
      setHealthCount(noHours + noTeacher);

      // CRM: εκπρόθεσμα/σημερινά follow-ups (ενεργά leads)
      const today = new Date(); today.setHours(0, 0, 0, 0);
      setCrmCount(leads.filter((l: any) => {
        if (!l.followUpDate || l.status === "Εγγραφή" || l.status === "Χάθηκε") return false;
        const d = new Date(l.followUpDate); d.setHours(0, 0, 0, 0);
        return !isNaN(d.getTime()) && d <= today;
      }).length);

      // Δεδομένα αναζήτησης
      const parentSet = new Set<string>();
      students.forEach((s: any) => { if (s.parentName) parentSet.add(s.parentName); });
      parse("eduflow_parents").forEach((p: any) => { const n = `${p.lastName || ""} ${p.firstName || ""}`.trim() || p.name; if (n) parentSet.add(n); });
      setData({ students, teachers, parents: [...parentSet], classes, lessons: lessonNames });
    };
    calc();
    window.addEventListener("focus", calc);
    window.addEventListener("storage", calc);
    return () => { window.removeEventListener("focus", calc); window.removeEventListener("storage", calc); };
  }, [pathname]);

  const badgeFor = (href: string) => href === "/notifications" ? unread : href === "/health" ? healthCount : href === "/crm" ? crmCount : 0;

  // Αποτελέσματα αναζήτησης
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];
    const out: { type: string; label: string; href: string }[] = [];
    data.students.forEach((s) => { const n = `${s.lastName || ""} ${s.firstName || ""}`.trim(); if (n.toLowerCase().includes(q)) out.push({ type: "Μαθητής", label: n, href: "/students" }); });
    data.teachers.forEach((t) => { const n = `${t.lastName || ""} ${t.firstName || ""}`.trim(); if (n.toLowerCase().includes(q)) out.push({ type: "Καθηγητής", label: n, href: "/teachers" }); });
    data.parents.forEach((p) => { if (p.toLowerCase().includes(q)) out.push({ type: "Γονέας", label: p, href: "/parents" }); });
    data.classes.forEach((c) => { const n = c.name || c.className; if (n && n.toLowerCase().includes(q)) out.push({ type: "Τμήμα", label: n, href: "/classes" }); });
    data.lessons.forEach((l) => { if (l.toLowerCase().includes(q)) out.push({ type: "Μάθημα", label: l, href: "/courses" }); });
    return out.slice(0, 10);
  }, [query, data]);

  const go = (href: string) => { setQuery(""); setFocused(false); router.push(href); };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex text-slate-200">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#1e2330] flex flex-col border-r border-slate-800 print:hidden">
        <div className="p-8 border-b border-slate-800/50">
          <div className="text-3xl font-black text-indigo-400">EduFlow</div>
          <div className="text-slate-500 mt-1 text-xs font-semibold tracking-wider uppercase">Smart Tutoring ERP</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const badge = badgeFor(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all text-sm font-medium ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-[#0b0e14] hover:text-white"}`}>
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {badge > 0 && <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-slate-800">
          <div className="rounded-2xl bg-indigo-900/20 border border-indigo-500/10 p-5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2"><Bot size={18} /> AI Scheduler</div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Δημιουργία προγράμματος χωρίς συγκρούσεις.</p>
            <Link href="/schedule" className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl font-semibold text-xs transition-colors">Άνοιγμα</Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 bg-[#1e2330]/80 backdrop-blur-md border-b border-slate-800 px-10 py-6 flex items-center justify-between z-20 print:hidden">
          <div>
            <h1 className="text-3xl font-black text-white">{title}</h1>
            <p className="text-slate-400 mt-1 text-sm">{description}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* 🔍 GLOBAL SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder="Αναζήτηση παντού..."
                className="bg-[#0b0e14] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 w-64 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {focused && query.trim().length >= 2 && (
                <div className="absolute top-full mt-2 w-80 right-0 bg-[#1e2330] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-30 max-h-96 overflow-y-auto">
                  {results.length === 0 ? (
                    <div className="p-4 text-xs text-slate-500 text-center">Κανένα αποτέλεσμα.</div>
                  ) : (
                    results.map((r, i) => (
                      <button key={i} onMouseDown={() => go(r.href)} className="w-full text-left px-4 py-2.5 hover:bg-[#0b0e14] flex items-center justify-between gap-3 transition-colors">
                        <span className="text-sm text-white truncate">{r.label}</span>
                        <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded shrink-0">{r.type}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 🔔 Ειδοποιήσεις */}
            <Link href="/notifications" className="relative bg-[#1e2330] border border-slate-700 rounded-xl p-3 text-slate-300 hover:text-white transition-colors">
              <Bell size={18} />
              {unread > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{unread > 99 ? "99+" : unread}</span>}
            </Link>

            <div className="relative">
              <button onClick={() => setMenuOpen((v) => !v)} onBlur={() => setTimeout(() => setMenuOpen(false), 150)} className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white font-bold text-sm transition-colors">
                Λ
              </button>
              {menuOpen && (
                <div className="absolute top-full mt-2 right-0 w-52 bg-[#1e2330] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-30">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">EduFlow</p>
                    <p className="text-[10px] text-slate-500">Διαχειριστής</p>
                  </div>
                  <button onMouseDown={() => go("/health")} className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-[#0b0e14] flex items-center gap-2"><Activity size={14} /> Έλεγχος Δεδομένων</button>
                  <button onMouseDown={() => go("/backup")} className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-[#0b0e14] flex items-center gap-2"><Database size={14} /> Backup / Εξαγωγή</button>
                  <button onMouseDown={() => go("/reports")} className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-[#0b0e14] flex items-center gap-2"><FileText size={14} /> Αναφορές</button>
                  <button onMouseDown={() => window.location.reload()} className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-[#0b0e14] flex items-center gap-2 border-t border-slate-800"><RefreshCw size={14} /> Ανανέωση δεδομένων</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-10 print:p-0">{children}</div>
      </main>
    </div>
  );
}
