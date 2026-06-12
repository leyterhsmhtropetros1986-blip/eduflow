"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Printer, School, Briefcase } from "lucide-react";

const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

export default function TimetablePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [mode, setMode] = useState<"class" | "teacher">("class");
  const [selected, setSelected] = useState("");

  useEffect(() => {
    setIsMounted(true);
    setSchedule(JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"));
    setClasses(JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]"));
    setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
  }, []);

  const classNames = useMemo(() => classes.map((c: any) => c.name || c.className).filter(Boolean), [classes]);
  const teacherNames = useMemo(() => teachers.map((t: any) => `${t.lastName || ""} ${t.firstName || ""}`.trim()).filter(Boolean), [teachers]);
  const options = mode === "class" ? classNames : teacherNames;

  // Αυτόματη επιλογή πρώτης τιμής όταν αλλάζει mode
  useEffect(() => {
    if (options.length && !options.includes(selected)) setSelected(options[0]);
    if (!options.length) setSelected("");
  }, [mode, options]); // eslint-disable-line

  // Φιλτράρισμα + χτίσιμο πίνακα
  const { dayMap, hours, hasSaturday, items } = useMemo(() => {
    const items = schedule.filter((it: any) =>
      mode === "class" ? it.groupName === selected : it.teacher === selected
    );
    const dayMap: Record<string, Record<number, any>> = {};
    DAYS.forEach((d) => (dayMap[d] = {}));
    let minH = 24, maxH = 0;
    items.forEach((it: any) => {
      const parts = String(it.time).split("-");
      const start = parseInt(parts[0]);
      const end = parts[1] ? parseInt(parts[1]) : start + 1;
      if (isNaN(start)) return;
      minH = Math.min(minH, start);
      maxH = Math.max(maxH, end);
      if (dayMap[it.day]) {
        dayMap[it.day][start] = { item: it, span: Math.max(1, end - start) };
        for (let h = start + 1; h < end; h++) dayMap[it.day][h] = "covered";
      }
    });
    if (items.length === 0) { minH = 14; maxH = 21; }
    const hours: number[] = [];
    for (let h = minH; h < maxH; h++) hours.push(h);
    const hasSaturday = items.some((it: any) => it.day === "Σάββατο");
    return { dayMap, hours, hasSaturday, items };
  }, [schedule, mode, selected]);

  const visibleDays = hasSaturday ? DAYS : DAYS.slice(0, 5);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Εκτυπώσιμο Πρόγραμμα" description="Εβδομαδιαίο ωρολόγιο ανά τμήμα ή καθηγητή, έτοιμο για εκτύπωση.">

      {/* ΕΛΕΓΧΟΙ (δεν εκτυπώνονται) */}
      <style>{`
        @media print {
          @page { margin: 1.2cm; }
          table { page-break-inside: auto; border-collapse: collapse !important; width: 100% !important; }
          tr { page-break-inside: avoid !important; break-inside: avoid !important; }
          thead { display: table-header-group; }
          td, th { border: 1px solid #000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      <div className="print:hidden flex flex-col sm:flex-row gap-3 mb-6 bg-[#1e2330] p-4 rounded-2xl border border-slate-800">
        <div className="flex gap-2">
          <button onClick={() => setMode("class")} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${mode === "class" ? "bg-indigo-600 text-white" : "bg-[#0b0e14] text-slate-400 border border-slate-800"}`}>
            <School size={14} /> Ανά Τμήμα
          </button>
          <button onClick={() => setMode("teacher")} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${mode === "teacher" ? "bg-indigo-600 text-white" : "bg-[#0b0e14] text-slate-400 border border-slate-800"}`}>
            <Briefcase size={14} /> Ανά Καθηγητή
          </button>
        </div>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="flex-1 bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer">
          {options.length === 0 ? <option value="">— Δεν υπάρχουν δεδομένα —</option> : options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <button onClick={() => window.print()} disabled={!selected} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-xs font-bold">
          <Printer size={14} /> Εκτύπωση
        </button>
      </div>

      {/* ΕΠΙΚΕΦΑΛΙΔΑ ΕΚΤΥΠΩΣΗΣ */}
      <div className="hidden print:flex justify-between items-center border-b-2 border-black pb-3 mb-4">
        <h1 className="text-xl font-bold text-black">Εβδομαδιαίο Πρόγραμμα — {selected}</h1>
        <p className="text-sm text-black">{new Date().toLocaleDateString("el-GR")}</p>
      </div>

      <h2 className="text-sm font-black uppercase tracking-wider mb-4 text-white print:text-black print:hidden">
        {mode === "class" ? "Τμήμα" : "Καθηγητής"}: <span className="text-indigo-400">{selected || "—"}</span>
      </h2>

      {/* ΠΙΝΑΚΑΣ */}
      {!selected || items.length === 0 ? (
        <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-sm print:bg-white print:text-black">
          Δεν υπάρχει πρόγραμμα για αυτή την επιλογή. Τρέξε πρώτα «Αυτόματη Δημιουργία» στον Scheduler.
        </div>
      ) : (
        <div className="bg-[#1e2330] border border-slate-800 rounded-2xl overflow-hidden print:bg-white print:border-0 print:rounded-none print:overflow-visible">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0b0e14] print:bg-slate-100">
                <th className="border border-slate-800 p-2 text-[11px] font-bold text-slate-400 print:border-black print:text-black w-20">Ώρα</th>
                {visibleDays.map((d) => (
                  <th key={d} className="border border-slate-800 p-2 text-[11px] font-bold uppercase text-slate-300 print:border-black print:text-black">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((hour) => (
                <tr key={hour}>
                  <td className="border border-slate-800 p-2 text-[11px] font-mono text-slate-400 print:border-black print:text-black text-center bg-[#0b0e14] print:bg-slate-50">{pad(hour)}</td>
                  {visibleDays.map((day) => {
                    const cell = dayMap[day][hour];
                    if (cell === "covered") return null;
                    if (cell && cell.item) {
                      const it = cell.item;
                      return (
                        <td key={day} rowSpan={cell.span} className="border border-slate-800 p-2 align-top print:border-black bg-indigo-950/30 print:bg-indigo-50">
                          <div className="text-[11px] font-bold text-white print:text-black">{it.subject}</div>
                          <div className="text-[10px] text-indigo-300 print:text-indigo-700">
                            {mode === "class" ? it.teacher : it.groupName}
                          </div>
                          {it.room && <div className="text-[9px] text-slate-400 print:text-slate-600">🚪 {it.room}</div>}
                          <div className="text-[9px] text-slate-500 print:text-slate-500">{it.time}</div>
                        </td>
                      );
                    }
                    return <td key={day} className="border border-slate-800 p-2 print:border-black"></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </WorkspaceShell>
  );
}
