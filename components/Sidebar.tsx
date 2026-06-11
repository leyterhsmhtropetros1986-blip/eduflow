export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", href: "/" },
    { name: "Μαθητές", href: "/students" },
    { name: "Καθηγητές", href: "/teachers" },
    { name: "Τάξεις", href: "/classes" },
    { name: "Αίθουσες", href: "/rooms" },
    { name: "Μαθήματα", href: "/subjects" },
    { name: "Scheduler", href: "/schedule" },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen p-4">
      <h1 className="text-xl font-bold mb-8">EduFlow</h1>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <a 
            key={item.name} 
            href={item.href} 
            className="block p-3 rounded-lg hover:bg-slate-800 transition"
          >
            {item.name}
          </a>
        ))}
      </nav>
    </aside>
  );
}