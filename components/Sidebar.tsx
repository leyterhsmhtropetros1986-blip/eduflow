import { LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, CheckSquare, DollarSign, Building, HeartHandshake } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Μαθητές", icon: Users, path: "/students" },
    { name: "Καθηγητές", icon: GraduationCap, path: "/teachers" },
  ];

  return (
    <aside className="w-64 bg-[#0b0e14] text-slate-300 min-h-screen p-6 border-r border-slate-800">
      <div className="mb-10">
        <h1 className="text-xl font-bold text-white">EduFlow</h1>
        <p className="text-xs text-slate-500">Smart Tutoring ERP</p>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <a key={item.name} href={item.path} className="flex items-center gap-3 p-3 hover:bg-cyan-900/20 hover:text-cyan-400 rounded-xl transition">
            <item.icon size={20} />
            <span className="font-medium text-sm">{item.name}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}