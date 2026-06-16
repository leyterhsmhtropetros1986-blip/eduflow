"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  Building, Library, Calendar, CheckCircle2, Briefcase,
  UserCircle, FileText, School, Bell, Search, Bot, Database, Activity, Printer, Send, Clock, RefreshCw, TrendingUp, ClipboardList, Timer, Library as LibraryIcon, FileBarChart, Cloud, ChevronDown, ChevronRight, Palette, Target, Move, Upload
} from "lucide-react";

// Helper: hex → rgba με alpha
const hexToRgba = (hex: string, alpha: number = 1): string => {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const navGroups = [
  {
    id: "main",
    label: "Αρχική",
    items: [
      { href: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
      { href: "/workflow", label: "🗺 Workflow", icon: <ClipboardList size={18} /> },
    ],
  },
  {
    id: "data",
    label: "Δεδομένα",
    icon: <Database size={14} />,
    items: [
      { href: "/students", label: "Μαθητές", icon: <GraduationCap size={18} /> },
      { href: "/teachers", label: "Καθηγητές", icon: <Users size={18} /> },
      { href: "/classes", label: "Τάξεις", icon: <BookOpen size={18} /> },
      { href: "/placement", label: "Τοποθέτηση σε Τμήματα", icon: <Move size={18} /> },
      { href: "/courses", label: "Μαθήματα", icon: <Library size={18} /> },
      { href: "/rooms", label: "Αίθουσες", icon: <Building size={18} /> },
      { href: "/parents", label: "Γονείς", icon: <UserCircle size={18} /> },
    ],
  },
  {
    id: "schedule",
    label: "Πρόγραμμα",
    icon: <Calendar size={14} />,
    items: [
      { href: "/schedule", label: "AI Scheduler", icon: <Bot size={18} /> },
      { href: "/timetable", label: "Εκτυπώσιμο", icon: <Printer size={18} /> },
      { href: "/timetable-by-grade", label: "📋 Ανά Τάξη", icon: <School size={18} /> },
      { href: "/calendar", label: "Ημερολόγιο & Αλλαγές", icon: <Calendar size={18} /> },
      { href: "/availability", label: "Διαθεσιμότητα", icon: <Clock size={18} /> },
      { href: "/teacher-hours", label: "Ώρες Καθηγητών", icon: <Timer size={18} /> },
    ],
  },
  {
    id: "operations",
    label: "Λειτουργία",
    icon: <CheckCircle2 size={14} />,
    items: [
      { href: "/attendance", label: "Παρουσίες", icon: <CheckCircle2 size={18} /> },
      { href: "/progress", label: "Πρόοδος", icon: <TrendingUp size={18} /> },
      { href: "/goals", label: "Στόχοι Μαθητών", icon: <Target size={18} /> },
      { href: "/exams", label: "Διαγωνίσματα", icon: <ClipboardList size={18} /> },
      { href: "/library", label: "Βιβλιοθήκη Υλικού", icon: <LibraryIcon size={18} /> },
    ],
  },
  {
    id: "communication",
    label: "Επικοινωνία",
    icon: <Send size={14} />,
    items: [
      { href: "/messages", label: "Επικοινωνία", icon: <Send size={18} /> },
      { href: "/notifications", label: "Ειδοποιήσεις", icon: <Bell size={18} /> },
      { href: "/crm", label: "CRM", icon: <Briefcase size={18} /> },
    ],
  },
  {
    id: "system",
    label: "Σύστημα",
    icon: <Activity size={14} />,
    items: [
      { href: "/health", label: "Έλεγχος", icon: <Activity size={18} /> },
      { href: "/reports", label: "Αναφορές", icon: <FileText size={18} /> },
      { href: "/student-report", label: "Αναφορά Μαθητή PDF", icon: <FileBarChart size={18} /> },
      { href: "/backup", label: "Backup", icon: <Database size={18} /> },
      { href: "/settings", label: "Branding & Ρυθμίσεις", icon: <Palette size={18} /> },
      { href: "/cloud-demo", label: "🌥 Cloud Demo", icon: <Cloud size={18} /> },
    ],
  },
];

const parse = (k: string) => { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch { return []; } };

export function WorkspaceShell({ title, description, children }: { title: string; description: string; children: React.ReactNode; }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [healthCount, setHealthCount] = useState(0);
  const [crmCount, setCrmCount] = useState(0);
  const [backupDays, setBackupDays] = useState<number | null>(null);
  const [data, setData] = useState<{ students: any[]; teachers: any[]; parents: string[]; classes: any[]; lessons: string[] }>({ students: [], teachers: [], parents: [], classes: [], lessons: [] });
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return { main: true };
    try {
      const saved = JSON.parse(localStorage.getItem("eduflow_nav_groups") || "null");
      if (saved) return saved;
    } catch {}
    return { main: true, data: true, schedule: true, operations: true, communication: true, system: false };
  });

  // ===== BRANDING =====
  const [brand, setBrand] = useState<{ name: string; tagline: string; logo: string; primaryColor: string }>({
    name: "EduFlow", tagline: "Smart Tutoring ERP", logo: "", primaryColor: "#4f46e5",
  });

  useEffect(() => {
    const load = () => {
      try {
        const b = JSON.parse(localStorage.getItem("eduflow_branding") || "{}");
        setBrand({
          name: b.name || "EduFlow",
          tagline: b.tagline || "Smart Tutoring ERP",
          logo: b.logo || "",
          primaryColor: b.primaryColor || "#4f46e5",
        });
      } catch {}
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  // CSS variables για ΟΛΟ το app (κάθε σελίδα μπορεί να χρησιμοποιεί var(--brand-primary))
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", brand.primaryColor);
    root.style.setProperty("--brand-primary-hover", hexToRgba(brand.primaryColor, 0.85));
    root.style.setProperty("--brand-primary-bg", hexToRgba(brand.primaryColor, 0.1));
    root.style.setProperty("--brand-primary-border", hexToRgba(brand.primaryColor, 0.4));
    root.style.setProperty("--brand-primary-shadow", hexToRgba(brand.primaryColor, 0.2));
  }, [brand.primaryColor]);

  useEffect(() => {
    const group = navGroups.find((g) => g.items.some((it) => it.href === pathname));
    if (group && !openGroups[group.id]) {
      setOpenGroups((s) => ({ ...s, [group.id]: true }));
    }
  }, [pathname]); // eslint-disable-line

  const toggleGroup = (id: string) => {
    setOpenGroups((s) => {
      const next = { ...s, [id]: !s[id] };
      localStorage.setItem("eduflow_nav_groups", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const calc = () => {
      try { setUnread(parse("eduflow_notifications").filter((n: any) => !n.read).length); } catch { setUnread(0); }

      const students = parse("eduflow_students");
      const teachers = parse("eduflow_teachers");
      const classes = parse("eduflow_classes").length ? parse("eduflow_classes") : parse("eduflow_classes_data");
      const lessonsRaw = parse("eduflow_lessons");
      const leads = parse("eduflow_crm_leads");
      const lessonNames: string[] = lessonsRaw.map((l: any) => (typeof l === "string" ? l : l?.name)).filter(Boolean);

      const enrollByLesson: Record<string, number> = {};
      students.forEach((s: any) => (s.enrollments || []).forEach((e: any) => { if (e.lessonName) enrollByLesson[e.lessonName] = (enrollByLesson[e.lessonName] || 0) + 1; }));
      const noHours = lessonsRaw.filter((l: any) => typeof l === "object" && (!l.weeklyHours || !(l.distribution?.length))).length;
      const noTeacher = lessonNames.filter((nm) => (enrollByLesson[nm] || 0) > 0 && !teachers.some((t: any) => (t.subjects && t.subjects.includes(nm)) || t.subject === nm)).length;
      setHealthCount(noHours + noTeacher);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      setCrmCount(leads.filter((l: any) => {
        if (!l.followUpDate || l.status === "Εγγραφή" || l.status === "Χάθηκε") return false;
        const d = new Date(l.followUpDate); d.setHours(0, 0, 0, 0);
        return !isNaN(d.getTime()) && d <= today;
      }).length);

      const lastBackup = localStorage.getItem("eduflow_last_backup");
      if (!lastBackup) setBackupDays(999);
      else setBackupDays(Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000));

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

  const groupBadge = (gid: string) => {
    const g = navGroups.find((x) => x.id === gid); if (!g) return 0;
    return g.items.reduce((acc, it) => acc + badgeFor(it.href), 0);
  };

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

  // Computed brand styles
  const brandPrimary = brand.primaryColor;
  const brandHover = hexToRgba(brandPrimary, 0.85);
  const brandBg = hexToRgba(brandPrimary, 0.1);
  const brandBorder = hexToRgba(brandPrimary, 0.4);
  const brandShadow = hexToRgba(brandPrimary, 0.2);

  return (
    <div className="min-h-screen bg-[#0b0e14] flex text-slate-200">
      <aside className="w-64 bg-[#1e2330] flex flex-col border-r border-slate-800 print:hidden">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            {brand.logo && <img src={brand.logo} alt="logo" className="w-8 h-8 rounded object-contain" />}
            <div>
              <div className="text-2xl font-black" style={{ color: brandPrimary }}>{brand.name}</div>
              <div className="text-slate-500 mt-0.5 text-[10px] font-semibold tracking-wider uppercase">{brand.tagline}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {navGroups.map((group) => {
            const isOpen = openGroups[group.id];
            const badge = groupBadge(group.id);
            const isMain = group.id === "main";
            return (
              <div key={group.id} className="mb-1">
                {!isMain && (
                  <button onClick={() => toggleGroup(group.id)} className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition">
                    <span className="flex items-center gap-2">
                      {group.icon}
                      {group.label}
                      {badge > 0 && <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 rounded-full">{badge}</span>}
                    </span>
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                )}
                {(isMain || isOpen) && (
                  <div className="space-y-0.5 mt-0.5">
                    {group.items.map((item) => {
                      const active = pathname === item.href;
                      const b = badgeFor(item.href);
                      return (
                        <Link key={item.href} href={item.href}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all text-[13px] ${active ? "text-white font-medium" : "text-slate-400 hover:bg-[#0b0e14] hover:text-white"}`}
                          style={active ? {
                            backgroundColor: brandPrimary,
                            boxShadow: `0 4px 12px ${brandShadow}`,
                          } : {}}>
                          {item.icon}
                          <span className="flex-1">{item.label}</span>
                          {b > 0 && <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">{b}</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="rounded-xl p-3 border" style={{ backgroundColor: brandBg, borderColor: brandBorder }}>
            <div className="flex items-center gap-2 font-bold mb-1 text-xs" style={{ color: brandPrimary }}><Bot size={14} /> AI Scheduler</div>
            <Link href="/schedule" className="block w-full text-center text-white py-1.5 rounded-lg font-semibold text-[11px] transition-colors"
              style={{ backgroundColor: brandPrimary }}>
              Άνοιγμα
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 bg-[#1e2330]/80 backdrop-blur-md border-b border-slate-800 px-10 py-6 flex items-center justify-between z-20 print:hidden">
          <div>
            <h1 className="text-3xl font-black text-white">{title}</h1>
            <p className="text-slate-400 mt-1 text-sm">{description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={(e) => { setFocused(true); e.currentTarget.style.borderColor = brandPrimary; }}
                onBlur={(e) => { setTimeout(() => setFocused(false), 150); e.currentTarget.style.borderColor = ""; }}
                placeholder="Αναζήτηση παντού..."
                className="bg-[#0b0e14] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 w-64 text-sm focus:outline-none transition-colors"
              />
              {focused && query.trim().length >= 2 && (
                <div className="absolute top-full mt-2 w-80 right-0 bg-[#1e2330] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-30 max-h-96 overflow-y-auto">
                  {results.length === 0 ? (
                    <div className="p-4 text-xs text-slate-500 text-center">Κανένα αποτέλεσμα.</div>
                  ) : results.map((r, i) => (
                    <button key={i} onMouseDown={() => go(r.href)} className="w-full text-left px-4 py-2.5 hover:bg-[#0b0e14] flex items-center justify-between gap-3 transition-colors">
                      <span className="text-sm text-white truncate">{r.label}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0"
                        style={{ color: brandPrimary, backgroundColor: brandBg }}>{r.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/notifications" className="relative bg-[#1e2330] border border-slate-700 rounded-xl p-3 text-slate-300 hover:text-white transition-colors">
              <Bell size={18} />
              {unread > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{unread > 99 ? "99+" : unread}</span>}
            </Link>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-colors"
                style={{ backgroundColor: brandPrimary }}>
                {brand.name[0]?.toUpperCase() || "Λ"}
              </button>
              {menuOpen && (
                <div className="absolute top-full mt-2 right-0 w-52 bg-[#1e2330] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-30">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">{brand.name}</p>
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

        <div className="p-10 print:p-0">
          {backupDays !== null && backupDays >= 7 && pathname !== "/backup" && (
            <Link href="/backup" className="block mb-6 p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 hover:bg-amber-950/50 transition print:hidden">
              <p className="text-xs text-amber-300 font-bold flex items-center gap-2">
                ⚠ {backupDays >= 999 ? "Δεν έχεις κάνει ποτέ backup!" : `Πέρασαν ${backupDays} μέρες από το τελευταίο backup.`} <span className="text-amber-400 underline">Πήγαινε στο Backup →</span>
              </p>
            </Link>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
