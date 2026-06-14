"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Target, Plus, Trash2, Edit3, X, Check, Calendar, TrendingUp, Award, AlertTriangle } from "lucide-react";

interface Goal { id: string; studentId: string; title: string; subject?: string; targetScore?: number; deadline?: string; status: "active"|"achieved"|"missed"; notes?: string; createdAt: string; }

export default function GoalsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [lessons, setLessons] = useState<string[]>([]);
  const [filterStudent, setFilterStudent] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState<Goal>({ id: "", studentId: "", title: "", subject: "", targetScore: undefined, deadline: "", status: "active", notes: "", createdAt: "" });

  useEffect(() => {
    setIsMounted(true);
    setGoals(JSON.parse(localStorage.getItem("eduflow_goals") || "[]"));
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
    setProgress(JSON.parse(localStorage.getItem("eduflow_progress") || "{}"));
    const lRaw = JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]");
    setLessons(lRaw.map((l: any) => typeof l === "string" ? l : l?.name).filter(Boolean));
  }, []);

  const save = (next: Goal[]) => { setGoals(next); localStorage.setItem("eduflow_goals", JSON.stringify(next)); };
  const reset = () => { setForm({ id: "", studentId: "", title: "", subject: "", targetScore: undefined, deadline: "", status: "active", notes: "", createdAt: "" }); setEditing(null); };

  const submit = () => {
    if (!form.studentId || !form.title) { alert("Συμπλήρωσε Μαθητή και Στόχο."); return; }
    if (editing) save(goals.map((g) => g.id === editing.id ? { ...form, id: editing.id, createdAt: editing.createdAt } : g));
    else save([{ ...form, id: "g-" + Date.now(), createdAt: new Date().toISOString() }, ...goals]);
    reset();
  };
  const remove = (id: string) => { if (confirm("Διαγραφή στόχου;")) save(goals.filter((g) => g.id !== id)); };
  const startEdit = (g: Goal) => { setEditing(g); setForm(g); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const setStatus = (id: string, status: "active"|"achieved"|"missed") => save(goals.map((g) => g.id === id ? { ...g, status } : g));

  // Αυτόματος υπολογισμός: επιτεύχθηκε ο στόχος βάσει τρέχοντος Μ.Ο.;
  const computeProgress = (g: Goal) => {
    if (!g.targetScore || !g.subject) return null;
    const p = progress[g.studentId]; if (!p?.testEntries) return null;
    const subjEntries = p.testEntries.filter((t: any) => t.subject === g.subject);
    if (subjEntries.length === 0) return null;
    const avg = Math.round(subjEntries.reduce((a: number, t: any) => a + (t.max > 0 ? (t.score / t.max) * 100 : 0), 0) / subjEntries.length);
    return { avg, met: avg >= g.targetScore };
  };

  const studentOptions = useMemo(() => [...students].sort((a, b) => (a.lastName || "").localeCompare(b.lastName || "", "el")), [students]);
  const nameOf = (id: string) => { const s = students.find((x) => x.id === id); return s ? `${s.lastName} ${s.firstName}` : "—"; };

  const visible = useMemo(() => goals.filter((g) => {
    if (filterStudent && g.studentId !== filterStudent) return false;
    if (filterStatus && g.status !== filterStatus) return false;
    return true;
  }), [goals, filterStudent, filterStatus]);

  // Auto-detect overdue (deadline passed + active)
  const today = new Date().toISOString().slice(0, 10);

  const counts = useMemo(() => ({
    total: goals.length,
    active: goals.filter((g) => g.status === "active").length,
    achieved: goals.filter((g) => g.status === "achieved").length,
    overdue: goals.filter((g) => g.status === "active" && g.deadline && g.deadline < today).length,
  }), [goals, today]);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Στόχοι Προόδου" description="Όρισε στόχους ανά μαθητή και παρακολούθησε αυτόματα την επίτευξη.">

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Stat label="Σύνολο" value={counts.total} icon={<Target size={16} />} color="slate" />
        <Stat label="Ενεργοί" value={counts.active} icon={<TrendingUp size={16} />} color="indigo" />
        <Stat label="Επιτεύχθηκαν" value={counts.achieved} icon={<Award size={16} />} color="emerald" />
        <Stat label="Έληξαν" value={counts.overdue} icon={<AlertTriangle size={16} />} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-5 rounded-3xl h-fit lg:sticky lg:top-28 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 tracking-wider"><Plus size={14} /> {editing ? "Επεξεργασία" : "Νέος Στόχος"}</h3>
            {editing && <button onClick={reset} className="text-slate-500 hover:text-rose-400"><X size={14} /></button>}
          </div>

          <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            <option value="">Μαθητής *</option>
            {studentOptions.map((s) => <option key={s.id} value={s.id}>{s.lastName} {s.firstName}</option>)}
          </select>

          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder='Στόχος * (π.χ. "Πάνω από 80 στα μαθηματικά")' className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />

          <select value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            <option value="">Μάθημα (προαιρ. - για auto-tracking)</option>
            {lessons.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input type="number" min={0} max={100} value={form.targetScore ?? ""} onChange={(e) => setForm({ ...form, targetScore: e.target.value ? +e.target.value : undefined })} placeholder="Στόχος βαθμού %" className="bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
            <input type="date" value={form.deadline || ""} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
          </div>

          <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Σημειώσεις (προαιρ.)" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none" />

          <button onClick={submit} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold">{editing ? "Αποθήκευση" : "+ Προσθήκη"}</button>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-3 grid grid-cols-2 gap-2">
            <select value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded-lg text-xs text-white outline-none">
              <option value="">Όλοι οι μαθητές</option>
              {studentOptions.map((s) => <option key={s.id} value={s.id}>{s.lastName} {s.firstName}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded-lg text-xs text-white outline-none">
              <option value="">Όλες οι καταστάσεις</option>
              <option value="active">Ενεργοί</option>
              <option value="achieved">Επιτεύχθηκαν</option>
              <option value="missed">Δεν επιτεύχθηκαν</option>
            </select>
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">{goals.length === 0 ? "Δεν υπάρχουν στόχοι. Πρόσθεσε τον πρώτο." : "Καμία αντιστοιχία."}</div>
          ) : visible.map((g) => {
            const auto = computeProgress(g);
            const overdue = g.status === "active" && g.deadline && g.deadline < today;
            return (
              <div key={g.id} className={`bg-[#1e2330] border rounded-2xl p-4 ${g.status === "achieved" ? "border-emerald-900/50" : g.status === "missed" ? "border-rose-900/50" : overdue ? "border-amber-900/50" : "border-slate-800"}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${g.status === "achieved" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" : g.status === "missed" ? "bg-rose-950/40 text-rose-400 border border-rose-900/40" : "bg-indigo-950/40 text-indigo-400 border border-indigo-900/40"}`}>
                    <Target size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold text-sm">{g.title}</p>
                      {g.status === "achieved" && <span className="text-[10px] bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded">✓ ΕΠΙΤΕΥΧΘΗ</span>}
                      {g.status === "missed" && <span className="text-[10px] bg-rose-950/50 text-rose-400 px-2 py-0.5 rounded">✕ ΑΠΕΤΥΧΕ</span>}
                      {overdue && <span className="text-[10px] bg-amber-950/50 text-amber-400 px-2 py-0.5 rounded">⏰ ΕΛΗΞΕ</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">👤 {nameOf(g.studentId)}{g.subject && ` · 📚 ${g.subject}`}{g.deadline && ` · 📅 ${new Date(g.deadline).toLocaleDateString("el-GR")}`}{g.targetScore && ` · 🎯 ${g.targetScore}%`}</p>

                    {/* AUTO PROGRESS BAR */}
                    {auto && (
                      <div className="mt-2 bg-[#0b0e14] rounded-lg p-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>Τρέχων Μ.Ο. στο {g.subject}</span>
                          <span className={auto.met ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{auto.avg}% / {g.targetScore}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full transition-all ${auto.met ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Math.min(100, (auto.avg / g.targetScore!) * 100)}%` }} />
                        </div>
                      </div>
                    )}

                    {g.notes && <p className="text-[11px] text-slate-500 mt-2 italic">«{g.notes}»</p>}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {g.status === "active" && (
                      <>
                        <button onClick={() => setStatus(g.id, "achieved")} title="Επιτεύχθηκε" className="bg-emerald-950/40 hover:bg-emerald-950/60 text-emerald-400 p-1.5 rounded"><Check size={12} /></button>
                        <button onClick={() => setStatus(g.id, "missed")} title="Δεν επιτεύχθηκε" className="bg-rose-950/40 hover:bg-rose-950/60 text-rose-400 p-1.5 rounded"><X size={12} /></button>
                      </>
                    )}
                    {g.status !== "active" && <button onClick={() => setStatus(g.id, "active")} title="Επανενεργοποίηση" className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded text-[10px]">↻</button>}
                    <button onClick={() => startEdit(g)} className="text-slate-500 hover:text-indigo-400 p-1.5"><Edit3 size={12} /></button>
                    <button onClick={() => remove(g.id)} className="text-slate-500 hover:text-rose-400 p-1.5"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WorkspaceShell>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: number; icon: any; color: string }) {
  const c: Record<string,string> = { slate: "text-slate-300", indigo: "text-indigo-400", emerald: "text-emerald-400", rose: "text-rose-400", amber: "text-amber-400" };
  return (
    <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-3">
      <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold tracking-wider">{icon} {label}</div>
      <p className={`text-2xl font-black mt-1 ${c[color]}`}>{value}</p>
    </div>
  );
}
