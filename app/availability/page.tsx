"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Users, GraduationCap, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 9..21
const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

// Διαθεσιμότητα μαθητή σε (μέρα, ώρα) — ίδια λογική με τον scheduler
const isAvail = (s: any, day: string, h: number) => {
  const locked = (s.lockedSlots || []).some((sl: any) => sl.day === day && parseInt(sl.start) <= h && h < parseInt(sl.end));
  if (locked) return false;
  const av = s.availability || [];
  if (av.length === 0) return true; // χωρίς δήλωση = διαθέσιμος παντού
  return av.some((sl: any) => sl.day === day && parseInt(sl.start) <= h && h < parseInt(sl.end));
};

export default function AvailabilityPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
    const c = JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]");
    setClasses(c);
    if (c.length) setSelected(c[0].name || c[0].className);
  }, []);

  // Πληρότητα ανά τμήμα
  const classInfo = useMemo(() => classes.map((c: any) => {
    const name = c.name || c.className;
    const members = students.filter((s: any) => (s.enrollments || []).some((e: any) => e.className === name));
    const cap = Number(c.maxStudents) || Number(c.capacity) || 0;
    return { name, grade: c.grade || "", members, count: members.length, cap, spots: cap ? cap - members.length : null };
  }), [classes, students]);

  const selectedInfo = classInfo.find((c) => c.name === selected);
  const members = selectedInfo?.members || [];

  // Heatmap διαθεσιμότητας: για κάθε (μέρα, ώρα) πόσοι από τους μαθητές του τμήματος είναι διαθέσιμοι
  const heat = useMemo(() => {
    const map: Record<string, number> = {};
    DAYS.forEach((d) => HOURS.forEach((h) => {
      map[`${d}|${h}`] = members.filter((s: any) => isAvail(s, d, h)).length;
    }));
    return map;
  }, [members]);

  const totalSpotsClasses = classInfo.filter((c) => c.spots !== null && c.spots > 0).length;

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Διαθεσιμότητα & Θέσεις Τμημάτων" description="Πληρότητα θέσεων και κοινές διαθέσιμες ώρες των μαθητών κάθε τμήματος.">

      {/* ΣΥΝΟΨΗ ΘΕΣΕΩΝ */}
      <div className="mb-6 bg-[#1e2330] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <div className="p-2 bg-emerald-950/60 text-emerald-400 rounded-xl"><Users size={18} /></div>
        <p className="text-sm text-slate-300"><span className="font-black text-white">{totalSpotsClasses}</span> τμήματα έχουν διαθέσιμες θέσεις.</p>
      </div>

      {/* ΚΑΡΤΕΣ ΤΜΗΜΑΤΩΝ ΜΕ ΠΛΗΡΟΤΗΤΑ X/Y */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {classInfo.length === 0 ? (
          <p className="col-span-full text-slate-600 text-xs text-center py-8 border border-dashed border-slate-800 rounded-2xl">Δεν υπάρχουν τμήματα.</p>
        ) : classInfo.map((c) => {
          const full = c.spots !== null && c.spots <= 0;
          const sel = c.name === selected;
          return (
            <button key={c.name} onClick={() => setSelected(c.name)} className={`text-left p-4 rounded-2xl border transition-all ${sel ? "border-indigo-500 bg-indigo-950/30" : "border-slate-800 bg-[#1e2330] hover:border-slate-700"}`}>
              <div className="flex justify-between items-start">
                <span className="text-white font-bold text-sm">{c.name}</span>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${full ? "bg-rose-950/40 text-rose-400 border-rose-900/40" : "bg-emerald-950/40 text-emerald-400 border-emerald-900/40"}`}>
                  {c.count}/{c.cap || "—"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400"><GraduationCap size={11} /> {c.grade || "Χωρίς τάξη"}</div>
              <div className={`mt-2 text-[10px] font-bold flex items-center gap-1 ${full ? "text-rose-400" : "text-emerald-400"}`}>
                {full ? <><AlertTriangle size={11} /> Πλήρες</> : <><CheckCircle2 size={11} /> {c.spots} διαθέσιμες θέσεις</>}
              </div>
            </button>
          );
        })}
      </div>

      {/* HEATMAP ΔΙΑΘΕΣΙΜΟΤΗΤΑΣ */}
      {selectedInfo && (
        <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-white font-bold text-sm flex items-center gap-2"><Clock size={16} className="text-indigo-400" /> Κοινή Διαθεσιμότητα — {selectedInfo.name} <span className="text-slate-500 font-normal">({members.length} μαθητές)</span></h3>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500"></span> Όλοι διαθέσιμοι</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/60"></span> Μερικοί</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#0b0e14] border border-slate-800"></span> Κανείς</span>
            </div>
          </div>

          {members.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-8">Δεν υπάρχουν μαθητές εγγεγραμμένοι σε αυτό το τμήμα.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-1.5 text-[10px] text-slate-500 w-16">Ώρα</th>
                    {DAYS.map((d) => <th key={d} className="p-1.5 text-[10px] font-bold text-slate-400 uppercase">{d.slice(0, 3)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((h) => (
                    <tr key={h}>
                      <td className="p-1.5 text-[10px] font-mono text-slate-500 text-center">{pad(h)}</td>
                      {DAYS.map((d) => {
                        const n = heat[`${d}|${h}`] || 0;
                        const total = members.length;
                        const ratio = total ? n / total : 0;
                        const cls = ratio === 1 ? "bg-emerald-600/70 text-white" : ratio >= 0.5 ? "bg-amber-500/40 text-amber-100" : ratio > 0 ? "bg-slate-700/40 text-slate-300" : "bg-[#0b0e14] text-slate-600";
                        return (
                          <td key={d} className="p-0.5">
                            <div className={`rounded text-center text-[10px] font-bold py-1.5 ${cls}`} title={`${n}/${total} διαθέσιμοι`}>{n}/{total}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Λίστα μαθητών τμήματος */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Μαθητές τμήματος</p>
                <div className="flex flex-wrap gap-1.5">
                  {members.map((s: any) => (
                    <span key={s.id} className="text-[11px] bg-[#0b0e14] border border-slate-800 px-2 py-1 rounded-lg text-slate-300">
                      {s.lastName} {s.firstName} <span className="text-slate-600">· {(s.availability?.length || 0)}ω</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </WorkspaceShell>
  );
}
