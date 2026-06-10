"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Ενημερωμένα navItems με την προσθήκη Τάξεων και Αιθουσών
const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/students", label: "Μαθητές", icon: "👨‍🎓" },
  { href: "/teachers", label: "Καθηγητές", icon: "👨‍🏫" },
  { href: "/classes", label: "Τάξεις", icon: "🎓" }, // Προστέθηκε
  { href: "/rooms", label: "Αίθουσες", icon: "🚪" },   // Προστέθηκε
  { href: "/courses", label: "Μαθήματα", icon: "📚" },
  { href: "/schedule-board", label: "Πίνακας", icon: "🗓️" },
  { href: "/schedule", label: "Scheduler", icon: "🤖" },
  { href: "/attendance", label: "Παρουσίες", icon: "✅" },
  { href: "/payments", label: "Πληρωμές", icon: "💳" },
  { href: "/crm", label: "CRM", icon: "🏢" },
  { href: "/parents", label: "Γονείς", icon: "👪" },
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
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-72 bg-slate-950 text-white flex flex-col shadow-xl">
        <div className="p-8 border-b border-slate-800">
          <div className="text-3xl font-black tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            EduFlow
          </div>
          <div className="text-slate-400 mt-2 text-sm">
            Smart Tutoring ERP
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all text-sm
                ${
                  active
                    ? "bg-cyan-500 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-slate-800">
          <div className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 p-5">
            <div className="font-bold text-lg">🤖 AI Scheduler</div>
            <div className="text-sm opacity-90 mt-2">
              Δημιουργία προγράμματος χωρίς συγκρούσεις.
            </div>
            <Link
              href="/schedule"
              className="inline-block mt-4 bg-white text-slate-900 px-4 py-2 rounded-xl font-semibold text-sm"
            >
              Άνοιγμα
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm px-10 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900">
              {title}
            </h1>
            <p className="text-slate-500 mt-2">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <input
              placeholder="🔍 Αναζήτηση..."
              className="rounded-xl border px-5 py-3 w-72"
            />
            <button className="bg-white rounded-xl border px-4 py-3">
              🔔
            </button>
            <div className="rounded-full w-12 h-12 bg-cyan-500 flex items-center justify-center text-white font-bold">
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