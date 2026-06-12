"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, 
  Building, Library, Calendar, CheckCircle2, Briefcase, 
  UserCircle, FileText, Bell, Search, Bot, Database
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { href: "/students", label: "Μαθητές", icon: <GraduationCap size={20} /> },
  { href: "/teachers", label: "Καθηγητές", icon: <Users size={20} /> },
  { href: "/classes", label: "Τάξεις", icon: <BookOpen size={20} /> },
  { href: "/rooms", label: "Αίθουσες", icon: <Building size={20} /> },
  { href: "/courses", label: "Μαθήματα", icon: <Library size={20} /> },
  { href: "/schedule", label: "Scheduler", icon: <Calendar size={20} /> },
  { href: "/attendance", label: "Παρουσίες", icon: <CheckCircle2 size={20} /> },
  { href: "/crm", label: "CRM", icon: <Briefcase size={20} /> },
  { href: "/parents", label: "Γονείς", icon: <UserCircle size={20} /> },
  { href: "/reports", label: "Αναφορές", icon: <FileText size={20} /> },
  { href: "/backup", label: "Backup", icon: <Database size={20} /> },
];

export function WorkspaceShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0b0e14] flex text-slate-200">
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#1e2330] flex flex-col border-r border-slate-800">
        <div className="p-8 border-b border-slate-800/50">
          <div className="text-3xl font-black text-indigo-400">EduFlow</div>
          <div className="text-slate-500 mt-1 text-xs font-semibold tracking-wider uppercase">Smart Tutoring ERP</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all text-sm font-medium
                ${active 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-400 hover:bg-[#0b0e14] hover:text-white"}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* AI WIDGET */}
        <div className="p-5 border-t border-slate-800">
          <div className="rounded-2xl bg-indigo-900/20 border border-indigo-500/10 p-5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2">
              <Bot size={18} /> AI Scheduler
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Δημιουργία προγράμματος χωρίς συγκρούσεις.
            </p>
            <Link
              href="/schedule"
              className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl font-semibold text-xs transition-colors"
            >
              Άνοιγμα
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 bg-[#1e2330]/80 backdrop-blur-md border-b border-slate-800 px-10 py-6 flex items-center justify-between z-10">
          <div>
            <h1 className="text-3xl font-black text-white">{title}</h1>
            <p className="text-slate-400 mt-1 text-sm">{description}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={18} />
              <input
                placeholder="Αναζήτηση..."
                className="bg-[#0b0e14] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 w-64 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button className="bg-[#1e2330] border border-slate-700 rounded-xl p-3 text-slate-300 hover:text-white transition-colors">
              <Bell size={18} />
            </button>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              Λ
            </div>
          </div>
        </header>

        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
