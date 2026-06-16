"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Printer, GraduationCap } from "lucide-react";

const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const GRADE_ORDER = ["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"];

// Παλέτα χρωμάτων ανά μάθημα
const PALETTE = [
  { bg: "#4f46e5", border: "#6366f1" },  // indigo
  { bg: "#059669", border: "#10b981" },  // emerald
  { bg: "#d97706", border: "#f59e0b" },  // amber
  { bg: "#0284c7", border: "#0ea5e9" },  // sky
  { bg: "#e11d48", border: "#f43f5e" },  // rose
  { bg: "#7c3aed", border: "#8b5cf6" },  // purple
  { bg: "#0891b2", border: "#06b6d4" },  // cyan
  { bg: "#c2410c", border: "#ea580c" },  // orange
];
const colorFor = (subject: string) => {
  let sum = 0;
  for (const ch of String(subject || "")) sum += ch.charCodeAt(0);
  return PALETTE[sum % PALETTE.length];
};

const parseTime = (t: string) => {
  const [a, b] = String(t || "").split("-");
  const sh = parseInt(a);
  const eh = b ? parseInt(b) : (isNaN(sh) ? sh : sh + 1);
  return { sh, eh: isNaN(eh) ? sh + 1 : eh };
};

export default function TimetableByGradePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [activeGrade, setActiveGrade] = useState<string>("");
  const [printMode, setPrintMode] = useState<"current" | "all">("current");

  useEffect(() => {
    setIsMounted(true);
    setSchedule(JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"));
    const c = JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]");
    const normalized = c.map((x: any) => ({
      ...x,
      grade: x.grade || x.category || "",
    }));
    setClasses(normalized);
  }, []);

  // Πιθανές τάξεις (μόνο όσες υπάρχουν στα classes)
  const availableGrades = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => { if (c.grade) set.add(c.grade); });
    return GRADE_ORDER.filter((g) => set.has(g));
  }, [classes]);

  // Set default active grade
  useEffect(() => {
    if (availableGrades.length > 0 && !activeGrade) {
      setActiveGrade(availableGrades[0]);
    }
  }, [availableGrades, activeGrade]);

  // Τμήματα για επιλεγμένη τάξη
  const sectionsForGrade = (grade: string) => {
    return classes
      .filter((c) => c.grade === grade)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  };

  // Ώρες range
  const hoursRange = useMemo(() => {
    if (schedule.length === 0) return { min: 14, max: 22 };
    let min = 23, max = 8;
    schedule.forEach((s) => {
      const { sh, eh } = parseTime(s.time);
      if (sh < min) min = sh;
      if (eh > max) max = eh;
    });
    return { min: Math.max(8, min), max: Math.min(23, max) };
  }, [schedule]);

  const hours = Array.from({ length: hoursRange.max - hoursRange.min }, (_, i) => i + hoursRange.min);

  // Βρες slot για συγκεκριμένο τμήμα, μέρα, ώρα
  const getSlot = (sectionName: string, day: string, hour: number) => {
    return schedule.find((s) => {
      if (s.groupName !== sectionName || s.day !== day) return false;
      const { sh, eh } = parseTime(s.time);
      return hour >= sh && hour < eh;
    });
  };

  // Είναι το πρώτο cell του block (για rowspan)
  const isBlockStart = (slot: any, hour: number) => {
    if (!slot) return false;
    const { sh } = parseTime(slot.time);
    return sh === hour;
  };

  const handlePrint = (mode: "current" | "all") => {
    setPrintMode(mode);
    setTimeout(() => window.print(), 100);
  };

  if (!isMounted) return null;

  // Render ενός grid για μία τάξη
  const renderGradeGrid = (grade: string) => {
    const sections = sectionsForGrade(grade);
    const totalSlots = sections.reduce(
      (sum, sec) => sum + schedule.filter((s) => s.groupName === sec.name).length,
      0
    );

    if (sections.length === 0) {
      return (
        <div className="bg-[#1e2330] border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500">
          Δεν υπάρχουν τμήματα για {grade}.
        </div>
      );
    }

    return (
      <div className="bg-[#1e2330] print:bg-white border border-slate-800 print:border-slate-300 rounded-2xl print:rounded-none p-5 print:p-4 print:break-after-page">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 print:border-slate-300">
          <div className="flex items-center gap-3">
            <GraduationCap size={28} className="text-indigo-400 print:text-indigo-700" style={{ color: "var(--brand-primary)" }} />
            <div>
              <h2 className="text-2xl print:text-xl font-black text-white print:text-black">{grade}</h2>
              <p className="text-xs text-slate-500 print:text-slate-600 mt-0.5">
                {sections.length} τμήματα · {totalSlots} σλοτ
              </p>
            </div>
          </div>
        </div>

        {/* Grid: Ώρα × Τμήμα × Μέρα */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs print:text-[9px] border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-800 print:border-slate-300 p-1.5 bg-[#0b0e14] print:bg-slate-100 text-slate-500 print:text-slate-700 font-bold uppercase text-[10px] w-12 sticky left-0 z-10">Ώρα</th>
                {sections.map((sec) => (
                  <th key={sec.id} colSpan={DAYS.length} className="border border-slate-800 print:border-slate-300 p-1.5 bg-indigo-950/30 print:bg-indigo-50 text-white print:text-black font-bold text-sm print:text-xs">
                    {sec.name}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="border border-slate-800 print:border-slate-300 p-1 bg-[#0b0e14] print:bg-slate-100 sticky left-0 z-10"></th>
                {sections.flatMap((sec) =>
                  DAYS.map((d) => (
                    <th key={`${sec.id}-${d}`} className="border border-slate-800 print:border-slate-300 p-1 bg-[#0b0e14] print:bg-slate-100 text-slate-500 print:text-slate-700 font-semibold uppercase text-[9px] min-w-[60px]">
                      {d.slice(0, 3)}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {hours.map((h) => (
                <tr key={h}>
                  <td className="border border-slate-800 print:border-slate-300 p-1 bg-[#0b0e14] print:bg-slate-50 text-slate-400 print:text-slate-700 font-mono text-[10px] font-bold sticky left-0">
                    {String(h).padStart(2, "0")}:00
                  </td>
                  {sections.flatMap((sec) =>
                    DAYS.map((d) => {
                      const slot = getSlot(sec.name, d, h);
                      if (!slot) {
                        return <td key={`${sec.id}-${d}-${h}`} className="border border-slate-800 print:border-slate-300 p-1 text-slate-700 print:text-slate-300 text-center">—</td>;
                      }
                      if (!isBlockStart(slot, h)) {
                        // Already rendered with rowspan
                        return null;
                      }
                      const { sh, eh } = parseTime(slot.time);
                      const span = Math.max(1, eh - sh);
                      const color = colorFor(slot.subject);
                      return (
                        <td key={`${sec.id}-${d}-${h}`} rowSpan={span}
                          className="border-2 border-slate-700 print:border-slate-400 p-1.5 text-white print:text-black align-top"
                          style={{
                            backgroundColor: color.bg,
                            borderLeftColor: color.border,
                            borderLeftWidth: "3px",
                          }}>
                          <div className="font-bold text-[11px] print:text-[9px] leading-tight">{slot.subject}</div>
                          <div className="text-[9px] print:text-[8px] opacity-90 mt-0.5">{slot.teacher}</div>
                          {slot.room && (
                            <div className="text-[8px] print:text-[7px] opacity-75 mt-0.5">🚪 {slot.room}</div>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <WorkspaceShell title="📋 Πρόγραμμα ανά Τάξη" description="Ξεχωριστή προβολή για κάθε τάξη — χωρίς να μπερδεύονται τα τμήματα.">
      {schedule.length === 0 ? (
        <div className="bg-[#1e2330] border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <p className="text-sm mb-2">Δεν υπάρχει πρόγραμμα ακόμα.</p>
          <p className="text-xs">
            Πήγαινε στο <a href="/schedule" className="text-indigo-400 hover:underline">AI Scheduler</a> και πάτα «Αυτόματη Δημιουργία».
          </p>
        </div>
      ) : (
        <>
          {/* Print mode controls */}
          <div className="flex gap-2 mb-6 print:hidden">
            <button onClick={() => handlePrint("current")} className="text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
              style={{ backgroundColor: "var(--brand-primary)" }}>
              <Printer size={16} /> Εκτύπωση Τάξης
            </button>
            <button onClick={() => handlePrint("all")} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-slate-700">
              <Printer size={16} /> Εκτύπωση Όλων
            </button>
          </div>

          {/* Tabs (hidden in print) */}
          <div className="flex gap-2 mb-6 overflow-x-auto print:hidden">
            {availableGrades.map((g) => (
              <button key={g} onClick={() => setActiveGrade(g)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeGrade === g ? "text-white" : "bg-[#1e2330] text-slate-400 border border-slate-800 hover:text-white"}`}
                style={activeGrade === g ? { backgroundColor: "var(--brand-primary)" } : {}}>
                {g}
              </button>
            ))}
          </div>

          {/* Render current grade (or all in print mode) */}
          <div>
            {printMode === "all" ? (
              availableGrades.map((g) => <div key={g} className="mb-6">{renderGradeGrid(g)}</div>)
            ) : (
              activeGrade && renderGradeGrid(activeGrade)
            )}
          </div>
        </>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page { margin: 1cm; size: A4 landscape; }
          body { background: white !important; color: black !important; }
          aside, header { display: none !important; }
          .print\\:hidden { display: none !important; }
          main { overflow: visible !important; }
          .print\\:break-after-page { break-after: page; }
          .print\\:break-inside-avoid { break-inside: avoid; }
          .print\\:bg-white { background: white !important; }
          .print\\:bg-slate-50 { background: #f8fafc !important; }
          .print\\:bg-slate-100 { background: #f1f5f9 !important; }
          .print\\:bg-indigo-50 { background: #eef2ff !important; }
          .print\\:text-black { color: black !important; }
          .print\\:text-slate-300 { color: #cbd5e1 !important; }
          .print\\:text-slate-600 { color: #475569 !important; }
          .print\\:text-slate-700 { color: #334155 !important; }
          .print\\:text-indigo-700 { color: #4338ca !important; }
          .print\\:border-slate-300 { border-color: #cbd5e1 !important; }
          .print\\:border-slate-400 { border-color: #94a3b8 !important; }
          table { font-size: 9px !important; }
        }
      `}</style>
    </WorkspaceShell>
  );
}
