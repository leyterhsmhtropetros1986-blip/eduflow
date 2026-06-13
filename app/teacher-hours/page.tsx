"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Timer, Printer, Users, CalendarDays } from "lucide-react";

const WEEKS_PER_MONTH = 4.33;
const dur = (time: string) => { const [a, b] = String(time).split("-"); const s = parseInt(a); const e = b ? parseInt(b) : s + 1; return isNaN(s) || isNaN(e) ? 1 : Math.max(0, e - s); };
const round1 = (n: number) => Math.round(n * 10) / 10;

export default function TeacherHoursPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selected, setSelected] = useState("all");

  useEffect(() => {
    setIsMounted(true);
    setSchedule(JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"));
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
  }, []);

  const teacherNames = useMemo(() => teachers.map((t: any) => `${t.lastName || ""} ${t.firstName || ""}`.trim()).filter(Boolean).sort((a, b) => a.localeCompare(b, "el")), [teachers]);

  // Στατιστικά ανά καθηγητή
  const stats = useMemo(() => {
    const make = (name: string) => {
      const items = schedule.filter((it: any) => it.teacher === name);
      const weekly = items.reduce((acc: number, it: any) => acc + dur(it.time), 0);
      const byClass: Record<string, { grade: string; hours: number }> = {};
      const byGrade: Record<string, number> = {};
      items.forEach((it: any) => {
        const cls = it.groupName || "—";
        byClass[cls] = byClass[cls] || { grade: it.grade || "", hours: 0 };
        byClass[cls].hours += dur(it.time);
        const g = it.grade || "Χωρίς τάξη";
        byGrade[g] = (byGrade[g] || 0) + dur(it.time);
      });
      return { name, weekly, monthly: round1(weekly * WEEKS_PER_MONTH), byClass, byGrade };
    };
    return teacherNames.map(make);
  }, [schedule, teacherNames]);

  const sel = stats.find((s) => s.name === selected);
  const totalWeekly = stats.reduce((a, s) => a + s.weekly, 0);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Ώρες Καθηγητών" description="Υπολογισμός ωρών ανά εβδομάδα/μήνα, ανά τάξη και τμήμα. Εκτύπωση/PDF.">

      <style>{`@media print { @page { margin: 1.2cm; } .print-hide { display:none !important; } body { background:#fff; } table { border-collapse:collapse; width:100%; } td,th { border:1px solid #000 !important; padding:6px 10px; color:#000 !important; } .print-title { display:block !important; } }`}</style>

      {/* Controls */}
      <div className="print-hide flex flex-col sm:flex-row gap-3 mb-6">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="flex-1 bg-[#1e2330] border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 cursor-pointer">
          <option value="all">📊 Όλοι οι Καθηγητές (σύνοψη)</option>
          {teacherNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <button onClick={() => window.print()} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold"><Printer size={16} /> Εξαγωγή PDF</button>
      </div>

      <div className="print-title hidden mb-4">
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#000" }}>Ώρες Καθηγητών {sel ? `— ${sel.name}` : "(Σύνοψη)"}</h1>
        <p style={{ fontSize: 12, color: "#000" }}>{new Date().toLocaleDateString("el-GR")}</p>
      </div>

      {schedule.length === 0 ? (
        <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">Δεν υπάρχει πρόγραμμα. Τρέξε πρώτα «Αυτόματη Δημιουργία» στον Scheduler.</div>
      ) : selected === "all" ? (
        /* ΣΥΝΟΨΗ ΟΛΩΝ */
        <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 print:bg-white print:border-0">
          <div className="flex items-center gap-2 mb-4 text-slate-300 text-sm font-bold print:text-black"><Users size={16} className="text-indigo-400" /> Σύνοψη ({stats.length} καθηγητές · {totalWeekly} ώρες/εβδ. σύνολο)</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-[11px] uppercase">
                <th className="text-left py-2">Καθηγητής</th>
                <th className="text-right py-2">Ώρες/εβδομάδα</th>
                <th className="text-right py-2">Ώρες/μήνα</th>
              </tr>
            </thead>
            <tbody>
              {stats.sort((a, b) => b.weekly - a.weekly).map((s) => (
                <tr key={s.name} className="border-t border-slate-800 print:text-black">
                  <td className="py-2.5 text-white print:text-black">{s.name}</td>
                  <td className="py-2.5 text-right font-bold text-indigo-400 print:text-black">{s.weekly}</td>
                  <td className="py-2.5 text-right text-slate-300 print:text-black">{s.monthly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : sel ? (
        /* ΑΝΑΛΥΤΙΚΑ ΕΝΟΣ ΚΑΘΗΓΗΤΗ */
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 print-hide">
            <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ώρες / Εβδομάδα</p>
              <p className="text-4xl font-black text-indigo-400 mt-1">{sel.weekly}</p>
            </div>
            <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ώρες / Μήνα <span className="normal-case">(×{WEEKS_PER_MONTH})</span></p>
              <p className="text-4xl font-black text-emerald-400 mt-1">{sel.monthly}</p>
            </div>
          </div>

          {/* Ανά τμήμα */}
          <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 print:bg-white print:border-0">
            <div className="flex items-center gap-2 mb-4 text-slate-300 text-sm font-bold print:text-black"><CalendarDays size={16} className="text-indigo-400" /> Ανάλυση ανά Τμήμα</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-[11px] uppercase">
                  <th className="text-left py-2">Τμήμα</th>
                  <th className="text-left py-2">Τάξη</th>
                  <th className="text-right py-2">Ώρες/εβδ.</th>
                  <th className="text-right py-2">Ώρες/μήνα</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(sel.byClass).sort((a, b) => b[1].hours - a[1].hours).map(([cls, info]) => (
                  <tr key={cls} className="border-t border-slate-800">
                    <td className="py-2.5 text-white print:text-black font-bold">{cls}</td>
                    <td className="py-2.5 text-slate-400 print:text-black">{info.grade || "—"}</td>
                    <td className="py-2.5 text-right font-bold text-indigo-400 print:text-black">{info.hours}</td>
                    <td className="py-2.5 text-right text-slate-300 print:text-black">{round1(info.hours * WEEKS_PER_MONTH)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-700">
                  <td className="py-2.5 text-white print:text-black font-black" colSpan={2}>ΣΥΝΟΛΟ</td>
                  <td className="py-2.5 text-right font-black text-white print:text-black">{sel.weekly}</td>
                  <td className="py-2.5 text-right font-black text-white print:text-black">{sel.monthly}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Ανά τάξη */}
          <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 print:bg-white print:border-0">
            <div className="text-slate-300 text-sm font-bold mb-4 print:text-black">Ανάλυση ανά Τάξη</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(sel.byGrade).sort((a, b) => b[1] - a[1]).map(([g, h]) => (
                <span key={g} className="text-xs bg-[#0b0e14] border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 print:text-black print:border-black">{g}: <span className="font-bold text-indigo-400 print:text-black">{h}ω/εβδ</span></span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </WorkspaceShell>
  );
}
