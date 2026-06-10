import { Users, BookOpen, Euro, GraduationCap } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { title: "Σύνολο Μαθητών", value: "1,245", icon: Users, color: "text-blue-600" },
    { title: "Ενεργά Τμήματα", value: "42", icon: BookOpen, color: "text-indigo-600" },
    { title: "Έσοδα Μήνα", value: "€8,450", icon: Euro, color: "text-emerald-600" },
    { title: "Καθηγητές", value: "28", icon: GraduationCap, color: "text-purple-600" },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">EduFlow Dashboard</h1>
        <p className="text-slate-500">Καλώς ήρθες, διαχειριστή!</p>
      </header>

      {/* Grid για τα στατιστικά */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className={`p-3 rounded-xl bg-slate-100 ${stat.color}`}>
                <stat.icon size={24} />
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Παράδειγμα πίνακα */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold mb-4">Πρόσφατες Εγγραφές</h2>
        <div className="text-slate-400 py-10 text-center border-2 border-dashed rounded-xl">
          Εδώ θα εμφανίζονται τα δεδομένα από τη βάση σου...
        </div>
      </div>
    </div>
  );
}