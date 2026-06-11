// components/Sidebar.tsx
export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen p-6">
      <h1 className="text-xl font-bold mb-8">EduFlow</h1>
      <nav className="space-y-4">
        <a href="/" className="block p-2 hover:bg-slate-800 rounded transition">Dashboard</a>
        <a href="/students" className="block p-2 hover:bg-slate-800 rounded transition">Μαθητές</a>
        <a href="/teachers" className="block p-2 hover:bg-slate-800 rounded transition">Καθηγητές</a>
      </nav>
    </aside>
  );
}