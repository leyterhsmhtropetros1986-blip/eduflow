"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { CheckCircle2, BookOpen, FileText, MessageSquare, TrendingUp, GraduationCap } from "lucide-react";

// Χρώμα ανάλογα με την επίδοση
const tone = (v: number) => v >= 85 ? { bar: "bg-emerald-500", text: "text-emerald-400" } : v >= 70 ? { bar: "bg-amber-500", text: "text-amber-400" } : { bar: "bg-rose-500", text: "text-rose-400" };

export default function ProgressPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, { homework: number; tests: number; participation: number; notes?: string }>>({});
  const [selected, setSelected] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const s = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    setStudents(s);
    setAttendance(JSON.parse(localStorage.getItem("eduflow_attendance") || "[]"));
    setProgress(JSON.parse(localStorage.getItem("eduflow_progress") || "{}"));
    if (s.length) setSelected(s[0].id);
  }, []);

  const studentOptions = useMemo(() => [...students]
    .sort((a, b) => (a.lastName || "").localeCompare(b.lastName || "", "el"))
    .map((s) => ({ id: s.id, label: `${s.lastName || ""} ${s.firstName || ""}`.trim() || "—", s })), [students]);

  const student = students.find((s) => s.id === selected);

  // Attendance (πραγματικό από τις παρουσίες)
  const attendancePct = useMemo(() => {
    if (!student) return 0;
    const full = `${student.firstName || ""} ${student.lastName || ""}`.trim();
    const recs = attendance.filter((r: any) => r.studentId === student.id || r.studentName === full || r.studentName === `${student.lastName} ${student.firstName}`.trim());
    if (recs.length === 0) return 0;
    const present = recs.filter((r: any) => (r.status || (r.present ? "present" : "absent")) === "present").length;
    return Math.round((present / recs.length) * 100);
  }, [student, attendance]);

  const p = progress[selected] || { homework: 0, tests: 0, participation: 0, notes: "" };

  const update = (field: "homework" | "tests" | "participation", value: number) => {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    const next = { ...progress, [selected]: { ...p, [field]: v } };
    setProgress(next);
    localStorage.setItem("eduflow_progress", JSON.stringify(next));
  };
  const updateNotes = (notes: string) => {
    const next = { ...progress, [selected]: { ...p, notes } };
    setProgress(next);
    localStorage.setItem("eduflow_progress", JSON.stringify(next));
  };

  const overall = Math.round((attendancePct + p.homework + p.tests + p.participation) / 4);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Πρόοδος Μαθητή" description="Παρακολούθηση επίδοσης: παρουσίες (αυτόματα), εργασίες, διαγωνίσματα, συμμετοχή.">

      {/* Επιλογή μαθητή */}
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
          {/* Συνολικός μέσος όρος */}
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

          {/* 4 Δείκτες */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <MetricCard icon={<CheckCircle2 size={18} />} label="Παρουσίες (Attendance)" value={attendancePct} readOnly hint="Υπολογίζεται αυτόματα από τις καταχωρημένες παρουσίες." />
            <MetricCard icon={<BookOpen size={18} />} label="Εργασίες (Homework)" value={p.homework} onChange={(v) => update("homework", v)} />
            <MetricCard icon={<FileText size={18} />} label="Διαγωνίσματα (Tests)" value={p.tests} onChange={(v) => update("tests", v)} />
            <MetricCard icon={<MessageSquare size={18} />} label="Συμμετοχή (Participation)" value={p.participation} onChange={(v) => update("participation", v)} />
          </div>

          {/* Σημειώσεις */}
          <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-2 mb-2"><TrendingUp size={14} /> Σχόλια Προόδου</label>
            <textarea value={p.notes || ""} onChange={(e) => updateNotes(e.target.value)} rows={3} placeholder="π.χ. Βελτίωση στα Μαθηματικά, χρειάζεται προσοχή στην Έκθεση..." className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 resize-none" />
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
      <div className="h-2.5 w-full bg-[#0b0e14] rounded-full overflow-hidden mb-3">
        <div className={`h-full ${t.bar} transition-all duration-500`} style={{ width: `${value}%` }}></div>
      </div>
      {readOnly ? (
        <p className="text-[10px] text-slate-500">{hint}</p>
      ) : (
        <input type="range" min={0} max={100} value={value} onChange={(e) => onChange?.(Number(e.target.value))} className="w-full accent-indigo-500 cursor-pointer" />
      )}
    </div>
  );
}
