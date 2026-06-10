export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-700">
          <p className="text-slate-400">Μαθητές</p>
          <p className="text-2xl font-bold">245</p>
        </div>
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-700">
          <p className="text-slate-400">Καθηγητές</p>
          <p className="text-2xl font-bold">18</p>
        </div>
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-700">
          <p className="text-slate-400">Έσοδα Μήνα</p>
          <p className="text-2xl font-bold">€12.450</p>
        </div>
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-700">
          <p className="text-slate-400">Τμήματα</p>
          <p className="text-2xl font-bold">12</p>
        </div>
      </div>
    </main>
  );
}