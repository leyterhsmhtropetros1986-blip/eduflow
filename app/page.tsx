import { Users, GraduationCap, Building, CalendarDays, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-400">Καλώς ήρθατε στο EduFlow - Smart Tutoring ERP</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Μαθητές" value="245" icon={<Users className="w-6 h-6 text-blue-400" />} />
        <StatCard title="Καθηγητές" value="18" icon={<GraduationCap className="w-6 h-6 text-green-400" />} />
        <StatCard title="Έσοδα Μήνα" value="€12.450" icon={<TrendingUp className="w-6 h-6 text-yellow-400" />} />
        <StatCard title="Τμήματα" value="12" icon={<Building className="w-6 h-6 text-purple-400" />} />
      </div>

      {/* Main Content Area (Placeholder for Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Συγκριτικό Εσόδων 2026</h2>
          <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl text-slate-500">
            [Εδώ θα μπει το γράφημα / chart]
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
           <h2 className="text-lg font-semibold mb-4">Εκκρεμότητες</h2>
           <div className="space-y-4">
             <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-sm">3 Νέες εγγραφές</div>
             <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-sm">2 Εκκρεμείς οφειλές</div>
           </div>
        </div>
      </div>
    </main>
  );
}

// Helper Component για τις κάρτες
function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className="p-3 bg-slate-800 rounded-xl">{icon}</div>
    </div>
  );
}