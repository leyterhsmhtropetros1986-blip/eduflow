import Link from 'next/link';
import { LayoutDashboard, Users, GraduationCap, FileText, Settings } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Μαθητές', icon: Users, path: '/students' },
    { name: 'Τμήματα', icon: GraduationCap, path: '/rooms' },
    { name: 'Αναφορές', icon: FileText, path: '/reports' },
    { name: 'Ρυθμίσεις', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen p-6 flex flex-col">
      <h1 className="text-2xl font-bold mb-10 text-blue-400">EduFlow</h1>
      <nav className="space-y-4">
        {menuItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.path}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}