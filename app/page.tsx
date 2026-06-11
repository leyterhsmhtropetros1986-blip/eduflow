import { Users, BookOpen, Euro, GraduationCap } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: "ΜΑΘΗΤΕΣ", value: "1,245", icon: Users, color: "text-blue-500", trend: "+12%" },
    { title: "ΤΜΗΜΑΤΑ", value: "42", icon: BookOpen, color: "text-indigo-500", trend: "+5%" },
    { title: "ΕΣΟΔΑ ΜΗΝΑ", value: "€8,450", icon: Euro, color: "text-emerald-500", trend: "+18%" },
    { title: "ΚΑΘΗΓΗΤΕΣ", value: "28", icon: GraduationCap, color: "text-purple-500", trend: "0%" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Enterprise Analytics Dashboard</h1>
        <p className="text-slate-500">Κεντρικός έλεγχος και οικονομική εποπτεία οργανισμού.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className={`p-3 rounded-2xl bg-slate-100 ${stat.color}`}>
                <stat.icon size={24} />
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.trend}</span>
            </div>
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.title}</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}