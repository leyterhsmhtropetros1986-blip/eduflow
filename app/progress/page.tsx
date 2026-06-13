"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { CheckCircle2, BookOpen, FileText, MessageSquare, TrendingUp, GraduationCap, Plus, Trash2 } from "lucide-react";

const tone = (v: number) => v >= 85 ? { bar: "bg-emerald-500", text: "text-emerald-400" } : v >= 70 ? { bar: "bg-amber-500", text: "text-amber-400" } : { bar: "bg-rose-500", text: "text-rose-400" };

interface TestEntry { id: string; subject: string; date: string; score: number; max: number; }
interface Progress { homework: number; participation: number; notes?: string; testEntries?: TestEntry[]; }

export default function ProgressPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [lessons, setLessons] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [selected, setSelected] = useState("");

  // Φόρμα νέου βαθμού
  const [tSubject, setTSubject] = useState("");
  const [tDate, setTDate] = useState("");
  const [tScore, setTScore] = useState("");
  const [tMax, setTMax] = useState("100");

  useEffect(() => {
    setIsMounted(true);
    const s = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    setStudents(s);
    setAttendance(JSON.parse(localStorage.getItem("eduflow_attendance") || "[]"));
    const rawLessons = JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]");
    setLessons((rawLessons as any[]).map((l) => (typeof l === "string" ? l : l?.name)).filter(Boolean));
    setProgress(JSON.parse(localStorage.getItem("eduflow_progress") || "{}"));
    if (s.length) setSelected(s[0].id);
  }, []);

  const studentOptions = useMemo(() => [...students]
    .sort((a, b) => (a.lastName || "").localeCompare(b.lastName || "", "el"))
    .map((s) => ({ id: s.id, label: `${s.lastName || ""} ${s.firstName || ""}`.trim() || "—" })), [students]);

  const student = students.find((s) => s.id === selected);
  const p: Progress = progress[selected] || { homework: 0, participation: 0, notes: "", testEntries: [] };
  const testEntries = p.testEntries || [];

  const attendancePct = useMemo(() => {
    if (!student) return 0;
    const full = `${student.firstName || ""} ${student.lastName || ""}`.trim();
    const recs = attendance.filter((r: any) => r.studentId === student.id || r.studentName === full || r.studentName === `${student.lastName} ${student.firstName}`.trim());
    if (recs.length === 0) return 0;
    const present = recs.filter((r: any) => (r.status || (r.present ? "present" : "absent")) === "present").length;
    return Math.round((present / recs.length) * 100);
  }, [student, attendance]);

  const testsPct = useMemo(() => {
    if (testEntries.length === 0) return 0;
    const sum = testEntries.reduce((acc, t) => acc + (t.max > 0 ? (t.score / t.max) * 100 : 0), 0);
    return Math.round(sum / testEntries.length);
  }, [testEntries]);

  const save = (next: Record<string, Progress>) => { setProgress(next); localStorage.setItem("eduflow_progress", JSON.stringify(next)); };
  const update = (field: "homework" | "participation", value: number) => {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    save({ ...progress, [selected]: { ...p, [field]: v } });
  };
  const updateNotes = (notes: string) => save({ ...progress, [selected]: { ...p, notes } });

  const addTest = () => {
    if (!tSubject) { alert("Επίλεξε μάθημα."); return; }
    const score = Number(tScore); const max = Number(tMax);
    if (isNaN(score) || isNaN(max) || max <= 0) { alert("Συμπλήρωσε έγκυρο βαθμό (π.χ. 95) και άριστα (π.χ. 100)."); return; }
    const entry: TestEntry = { id: `t-${Date.now()}`, subject: tSubject, date: tDate || new Date().toISOString().slice(0, 10), score, max };
    save({ ...progress, [selected]: { ...p, testEntries: [entry, ...testEntries] } });
    setTScore(""); setTMax("100"); setTDate("");
  };
  const removeTest = (id: string) => save({ ...progress, [selected]: { ...p, testEntries: testEntries.filter((t) => t.id !== id) } });

  const overall = Math.round((attendancePct + p.homework + testsPct + p.participation) / 4);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Πρόοδος Μαθητή" description="Παρουσίες (αυτόματα), εργασίες, διαγωνίσματα ανά μάθημα, συμμετοχή.">

      <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><GraduationCap size={14} /> Μαθητής:</label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="flex-1 bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 cursor-pointer">
          {studentOptions.length === 0 ? <option value="">— Δεν υπάρχουν μαθητές —</option> : studentOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>

      {!student ? (
        <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">Επίλεξε μαθητή.</div>
      ) : (
        <>
          <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 mb-6 flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0b0e14" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className={tone(overall).text} strokeWidth="3.5" strokeDasharray={`${overall} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl font-black text-white">{overall}%</span></div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Συνολική Πρόοδος</p>
              <h2 className="text-xl font-black text-white">{student.lastName} {student.firstName}</h2>
              <p className="text-xs text-slate-400 mt-1">{student.grade}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <MetricCard icon={<CheckCircle2 size={18} />} label="Παρουσίες" value={attendancePct} readOnly hint="Αυτόματα από τις παρουσίες." />
            <MetricCard icon={<BookOpen size={18} />} label="Εργασίες" value={p.homework} onChange={(v) => update("homework", v)} />
            <MetricCard icon={<MessageSquare size={18} />} label="Συμμετοχή" value={p.participation} onChange={(v) => update("participation", v)} />
          </div>

          {/* ΔΙΑΓΩΝΙΣΜΑΤΑ ΑΝΑ ΜΑΘΗΜΑ */}
          <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-sm flex items-center gap-2"><FileText size={16} className="text-indigo-400" /> Διαγωνίσματα / Τεστ</h3>
              <span className={`text-lg font-black ${tone(testsPct).text}`}>Μ.Ο. {testsPct}%</span>
            </div>

            {/* Φόρμα νέου βαθμού */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
              <select value={tSubject} onChange={(e) => setTSubject(e.target.value)} className="col-span-2 bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer">
                <option value="">Μάθημα...</option>
                {lessons.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <input type="date" value={tDate} onChange={(e) => setTDate(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
              <div className="flex items-center gap-1">
                <input type="number" value={tScore} onChange={(e) => setTScore(e.target.value)} placeholder="Βαθμός" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500" />
                <span className="text-slate-500 text-xs">/</span>
                <input type="number" value={tMax} onChange={(e) => setTMax(e.target.value)} placeholder="100" className="w-14 bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500" />
              </div>
              <button onClick={addTest} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"><Plus size={14} /> Προσθήκη</button>
            </div>

            {/* Λίστα βαθμών */}
            {testEntries.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">Δεν έχουν καταχωρηθεί βαθμοί.</p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {testEntries.map((t) => {
                  const pct = t.max > 0 ? Math.round((t.score / t.max) * 100) : 0;
                  return (
                    <div key={t.id} className="flex items-center justify-between bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-white w-28 truncate">{t.subject}</span>
                        <span className="text-slate-500 font-mono">{t.date ? new Date(t.date).toLocaleDateString("el-GR") : "—"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-xs ${tone(pct).text}`}>{t.score}/{t.max} ({pct}%)</span>
                        <button onClick={() => removeTest(t.id)} className="text-slate-600 hover:text-rose-500"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-2 mb-2"><TrendingUp size={14} /> Σχόλια Προόδου</label>
            <textarea value={p.notes || ""} onChange={(e) => updateNotes(e.target.value)} rows={3} placeholder="π.χ. Βελτίωση στα Μαθηματικά..." className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none" />
          </div>
        </>
      )}
    </WorkspaceShell>
  );
}

function MetricCard({ icon, label, value, onChange, readOnly, hint }: { icon: any; label: string; value: number; onChange?: (v: number) => void; readOnly?: boolean; hint?: string }) {
  const t = tone(value);
  return (
    <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-300 text-xs font-bold"><span className={t.text}>{icon}</span> {label}</div>
        <span className={`text-2xl font-black ${t.text}`}>{value}%</span>
      </div>
      <div className="h-2.5 w-full bg-[#0b0e14] rounded-full overflow-hidden mb-3"><div className={`h-full ${t.bar} transition-all duration-500`} style={{ width: `${value}%` }}></div></div>
      {readOnly ? <p className="text-[10px] text-slate-500">{hint}</p> : <input type="range" min={0} max={100} value={value} onChange={(e) => onChange?.(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer" />}
    </div>
  );
}
