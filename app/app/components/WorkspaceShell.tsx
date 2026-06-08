"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/students", label: "Students", icon: "👨‍🎓" },
  { href: "/teachers", label: "Teachers", icon: "👩‍🏫" },
  { href: "/courses", label: "Courses", icon: "📚" },
  { href: "/attendance", label: "Attendance", icon: "✅" },
  { href: "/payments", label: "Payments", icon: "💳" },
  { href: "/parents", label: "Parent Portal", icon: "👪" },
  { href: "/schedule", label: "Schedule", icon: "🗓️" },
];

export function WorkspaceShell({
  children,
  title,
  description,
}: Readonly<{
  children: React.ReactNode;
  title: string;
  description: string;
}>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <aside className="hidden md:flex md:w-72 xl:w-80 flex-col bg-slate-950 text-slate-100 p-6">
        <div className="mb-10">
          <div className="text-3xl font-bold tracking-tight">EduFlow</div>
          <p className="mt-2 text-sm text-slate-400">Tutoring management SaaS</p>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          <div className="font-semibold text-slate-100">Smart scheduler</div>
          Automate lesson planning, teacher assignments, and room capacity in one place.
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/students"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Add student
            </Link>
            <Link
              href="/schedule"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
            >
              Generate schedule
            </Link>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
