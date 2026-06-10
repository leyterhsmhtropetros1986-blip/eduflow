"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { 
  Users, 
  GraduationCap, 
  Euro, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Bell, 
  Sparkles, 
  Plus, 
  Layers, 
  ChevronRight, 
  ArrowUpRight,
  BrainCircuit
} from "lucide-react";

export default function EnterpriseDashboard() {
  const [mounted, setMounted] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  // Trigger animations on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setIsAiThinking(true);
    setTimeout(() => {
      setIsAiThinking(false);
      setAiQuery("");
      alert("Το EduFlow AI επεξεργάζεται το αίτημά σας για βελτιστοποίηση των τμημάτων!");
    }, 1500);
  };

  return (
    <WorkspaceShell
      title="Enterprise Analytics Executive Dashboard"
      description="Κεντρικός έλεγχος, AI βελτιστοποίηση και οικονομική εποπτεία του εκπαιδευτικού οργανισμού σε πραγματικό χρόνο."
    >
      <div className="relative min-h-screen pb-24 text-slate-100 selection:bg-indigo-500 selection:text-white">
        
        {/* --- 2. KPI ROW WITH ANIMATIONS --- */}
        <div className={`grid gap-4 grid-cols-2 lg:grid-cols-5 transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          
          {/* Μαθητές */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 hover:border-indigo-500/30 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mαθητές</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform"><GraduationCap className="w-4 h-4" /></div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight animate-pulse">245</h3>
              <span className="text-xs font-medium text-emerald-400 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-md"><ArrowUpRight className="w-3 h-3" /> +12%</span>
            </div>
          </div>

          {/* Καθηγητές */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 hover:border-purple-500/30 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kαθηγητές</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform"><Users className="w-4 h-4" /></div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">18</h3>
              <span className="text-xs text-slate-500">Ενεργοί</span>
            </div>
          </div>

          {/* Έσοδα (Gradient Card) */}
          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-900 hover:border-indigo-500/50 transition-all duration-300 group shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Έσοδα Μήνα</span>
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 group-hover:rotate-12 transition-transform"><Euro className="w-4 h-4" /></div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">€12.450</h3>
              <span className="text-xs font-medium text-emerald-400 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-md"><TrendingUp className="w-3 h-3" /> +18%</span>
            </div>
          </div>

          {/* Ώρες Διδασκαλίας */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-fuchsia-950/40 hover:border-fuchsia-500/30 transition-all duration-300 group shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ώρες / Μήνα</span>
              <div className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 group-hover:scale-110 transition-transform"><CalendarIcon className="w-4 h-4" /></div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">128</h3>
              <span className="text-xs text-fuchsia-400 font-medium">Προγραμματισμένες</span>
            </div>
          </div>

          {/* AI Smart Scheduler Score */}
          <div className="p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 hover:border-emerald-500/40 transition-all duration-300 group shadow-lg col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Optimization
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold">Score</div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">96%</h3>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000 w-[96%]" />
              </div>
            </div>
          </div>

        </div>

        {/* MAIN BODY GRID */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          
          {/* LEFT & CENTER COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* REVENUE GRAPH */}
              <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-bold text-slate-200 tracking-wide uppercase">Συγκριτικό Έσοδων 2026</h4>
                  <span className="text-xs text-slate-500">Ανά τρίμηνο</span>
                </div>
                
                <div className="space-y-4">
                  {[
                    { month: "Ιανουάριος", value: 35, display: "€4.200" },
                    { month: "Φεβρουάριος", value: 55, display: "€6.800" },
                    { month: "Μάρτιος", value: 78, display: "€9.400" },
                    { month: "Απρίλιος", value: 95, display: "€12.450" }
                  ].map((bar, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{bar.month}</span>
                        <span className="font-semibold text-slate-200">{bar.display}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded-lg overflow-hidden border border-slate-900">
                        <div 
                          style={{ width: mounted ? `${bar.value}%` : '0%' }}
                          className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-lg transition-all duration-1000 ease-out"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PROGRESS CARDS */}
              <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-sm space-y-5">
                <h4 className="text-sm font-bold text-slate-200 tracking-wide uppercase">KPIs Λειτουργίας</h4>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Πληρότητα Αιθουσών</span>
                    <span className="text-indigo-400 font-bold">87%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full w-[87%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Πληρωμές Διδάκτρων</span>
                    <span className="text-purple-400 font-bold">71%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full w-[71%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Attendance (Παρουσίες)</span>
                    <span className="text-emerald-400 font-bold">96%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[96%]" />
                  </div>
                </div>
              </div>

            </div>

            {/* AI WIDGET */}
            <div className="p-6 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    EduFlow AI Assistant <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-md uppercase tracking-wider font-extrabold">Online</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Ρωτήστε με για ανακατανομή αιθουσών, στατιστικά εσόδων ή αυτόματο έλεγχο προγράμματος.</p>
                </div>
              </div>

              <form onSubmit={handleAiSubmit} className="mt-4 flex gap-2">
                <input 
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ρώτησε κάτι... π.χ. 'Βρες ποιοι καθηγητές έχουν conflict την Τετάρτη'"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={isAiThinking}
                  className="bg-indigo-600 hover:bg-indigo-500 transition text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center shadow-md shadow-indigo-600/10"
                >
                  {isAiThinking ? "..." : <ChevronRight className="w-4 h-4" />}
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* NOTIFICATIONS CONTAINER */}
            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-3 mb-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-slate-400 animate-bounce" /> Ειδοποιήσεις Συστήματος
                </h4>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40 flex items-center justify-between hover:bg-slate-950 transition">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">🔔 3</span>
                    <span>Νέες εγγραφές μαθητών</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40 flex items-center justify-between hover:bg-slate-950 transition">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">💰 2</span>
                    <span>Εκκρεμείς οικονομικές οφειλές</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40 flex items-center justify-between hover:bg-slate-950 transition">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">📅 1</span>
                    <span>Ανιχνεύτηκε σύγκρουση (Conflict)</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                </div>

                <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-900/30 flex items-center justify-between hover:bg-indigo-950/40 transition">
                  <div className="flex items-center gap-2.5 text-xs text-indigo-300">
                    <span className="text-indigo-400 font-bold bg-indigo-500/20 px-1.5 py-0.5 rounded">🤖 AI</span>
                    <span className="font-medium">Διαθέσιμη πρόταση βελτιστοποίησης</span>
                  </div>
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                </div>
              </div>
            </div>

            {/* CALENDAR PREVIEW */}
            <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Εβδομαδιαία Σύνοψη</h4>
                <span className="text-[11px] text-indigo-400 font-medium cursor-pointer hover:underline">Πλήρης Προβολή</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-center mb-2">
                {["Δ", "Τ", "Τ", "Π", "Π"].map((d, idx) => (
                  <div key={idx} className={`p-1.5 rounded-lg text-xs font-bold ${idx === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'}`}>
                    {d}
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 mt-3 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-900 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">16:00 - Μαθηματικά Γ3</span>
                  <span className="text-slate-600">Αίθουσα Α</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-900 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">17:00 - Φυσική Β2</span>
                  <span className="text-slate-600">Αίθουσα Β</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-900 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">18:00 - Πληροφορική</span>
                  <span className="text-slate-600">Αίθουσα Α</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* FLOATING ACTION BUTTON */}
        <div className="fixed bottom-6 right-6 z-50">
          {showFloatingMenu && (
            <div className="absolute bottom-16 right-0 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-2xl min-w-[160px] space-y-1 text-xs">
              <button onClick={() => { alert("Προσθήκη Μαθητή"); setShowFloatingMenu(false); }} className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition text-slate-300 flex items-center gap-2">
                👨‍🎓 Νέος Μαθητής
              </button>
              <button onClick={() => { alert("Προσθήκη Καθηγητή"); setShowFloatingMenu(false); }} className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition text-slate-300 flex items-center gap-2">
                👨&zwj;🏫 Νέος Καθηγητής
              </button>
              <button onClick={() => { alert("Προσθήκη Μαθήματος"); setShowFloatingMenu(false); }} className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition text-slate-300 flex items-center gap-2">
                📅 Νέο Μάθημα
              </button>
            </div>
          )}
          <button 
            onClick={() => setShowFloatingMenu(!showFloatingMenu)}
            className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-600/30 transition-transform duration-300 active:scale-95 z-50 group"
          >
            <Plus className={`w-5 h-5 transition-transform duration-300 ${showFloatingMenu ? 'rotate-45' : 'group-hover:rotate-90'}`} />
          </button>
        </div>

      </div>
    </WorkspaceShell>
  );
}