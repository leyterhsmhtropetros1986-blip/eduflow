"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Printer, Download, School, GraduationCap } from "lucide-react";

const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const GRADE_ORDER = ["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"];

// Σταθερό χρώμα ανά μάθημα
const PALETTE = [
  "bg-indigo-600/30 print:bg-indigo-100 border-indigo-500",
  "bg-emerald-600/30 print:bg-emerald-100 border-emerald-500",
  "bg-amber-600/30 print:bg-amber-100 border-amber-500",
  "bg-sky-600/30 print:bg-sky-100 border-sky-500",
  "bg-rose-600/30 print:bg-rose-100 border-rose-500",
  "bg-purple-600/30 print:bg-purple-100 border-purple-500",
  "bg-teal-600/30 print:bg-teal-100 border-teal-500",
  "bg-pink-600/30 print:bg-pink-100 border-pink-500",
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

  useEffect(() => {
    setIsMounted(true);
    setSchedule(JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"));
    const c = JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]");
    // Auto-migration: αν έχει category αλλά όχι grade
    const normalized = c.map((x: any) => ({
      ...x,
      grade: x.grade || x.category || "",
    }));
    setClasses(normalized);
  }, []);

  // Group classes by grade
  const classesByGrade = useMemo(() => {
    const out: { [grade: string]: any[] } = {};
    classes.forEach((c) => {
      const g = c.grade || "Άλλο";
      if (!out[g]) out[g] = [];
      out[g].push(c);
    });
    // Sort each group by name
    Object.values(out).forEach((arr) => arr.sort((a, b) => (a.name || "").localeCompare(b.name || "")));
    return out;
  }, [classes]);

  // Get schedule items for a specific class
  const getClassSchedule = (className: string) => {
    return schedule.filter((s) => s.groupName === className);
  };

  // Hours range (find min/max across schedule)
  const hoursRange = useMemo(() => {
    if (schedule.length === 0) return { min: 14, max: 22 };
    let min = 23, max = 8;
    schedule.forEach((s) => {
      const { sh, eh } = parseTime(s.time);
      if (sh < min) min = sh;
      if (eh > max) max = eh;
    });
    return { min: Math.max(8, min - 1), max: Math.min(23, max + 1) };
  }, [schedule]);

  const hours = Array.from({ length: hoursRange.max - hoursRange.min }, (_, i) => i + hoursRange.min);

  if (!isMounted) return null;

  const handlePrint = () => window.print();

  // Mini Grid για ένα τμήμα
  const ClassMiniGrid = ({ className, grade }: { className: string; grade: string }) => {
    const items = getClassSchedule(className);

    return (
      <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 print:border print:border-slate-300 print:bg-white print:break-inside-avoid mb-6">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 print:border-slate-300">
          <div>
            <h3 className="font-black text-white text-lg print:text-black">{className}</h3>
            <p className="text-xs text-indigo-400 print:text-indigo-700 mt-0.5">{grade}</p>
          </div>
          <span className="text-xs text-slate-500 print:text-slate-600 font-mono">
            {items.length} σλοτ
          </span>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-slate-500 print:text-slate-400 italic py-4 text-center">
            Κανένα μάθημα προγραμματισμένο
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs print:text-[10px]">
              <thead>
                <tr>
                  <th className="text-left p-1.5 text-slate-500 print:text-slate-600 font-semibold uppercase tracking-wide text-[10px] w-12">Ώρα</th>
                  {DAYS.map((d) => (
                    <th key={d} className="text-center p-1.5 text-slate-500 print:text-slate-600 font-semibold uppercase tracking-wide text-[10px]">
                      {d.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((h) => (
                  <tr key={h} className="border-t border-slate-800/50 print:border-slate-200">
                    <td className="p-1 text-slate-400 print:text-slate-500 font-mono text-[10px]">
                      {String(h).padStart(2, "0")}:00
                    </td>
                    {DAYS.map((d) => {
                      const slot = items.find((it) => {
                        if (it.day !== d) return false;
                        const { sh } = parseTime(it.time);
                        return sh === h;
                      });
                      if (!slot) {
                        // Έλεγχος αν είναι μέσα σε 2ωρο block
                        const inside = items.find((it) => {
                          if (it.day !== d) return false;
                          const { sh, eh } = parseTime(it.time);
                          return h > sh && h < eh;
                        });
                        return <td key={d} className={`p-0.5 ${inside ? "" : ""}`}>—</td>;
                      }
                      const { sh, eh } = parseTime(slot.time);
                      const span = Math.max(1, eh - sh);
                      return (
                        <td key={d} rowSpan={span} className={`p-1 ${colorFor(slot.subject)} border rounded`}>
                          <div className="font-bold text-white print:text-black text-[10px] leading-tight">
                            {slot.subject}
                          </div>
                          <div className="text-[9px] text-slate-300 print:text-slate-700 mt-0.5">
                            {slot.teacher}
                          </div>
                          {slot.room && (
                            <div className="text-[8px] text-slate-400 print:text-slate-600">
                              🚪 {slot.room}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <WorkspaceShell title="📋 Πρόγραμμα ανά Τάξη" description="Προβολή και εκτύπωση οργανωμένη ανά τάξη και τμήμα.">
      {/* Controls */}
      <div className="flex gap-2 mb-6 print:hidden">
        <button onClick={handlePrint} className="text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
          style={{ backgroundColor: "var(--brand-primary)" }}>
          <Printer size={16} /> Εκτύπωση
        </button>
      </div>

      {schedule.length === 0 ? (
        <div className="bg-[#1e2330] border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          <p className="text-sm mb-2">Δεν υπάρχει πρόγραμμα ακόμα.</p>
          <p className="text-xs">Πήγαινε στο <a href="/schedule" className="text-indigo-400 hover:underline">AI Scheduler</a> και πάτα «Αυτόματη Δημιουργία».</p>
        </div>
      ) : (
        <div className="space-y-8 print:space-y-4">
          {GRADE_ORDER.filter((g) => classesByGrade[g]?.length).map((grade) => {
            const classesInGrade = classesByGrade[grade];
            // Πόσα μαθήματα έχει συνολικά αυτή η τάξη
            const totalSlots = classesInGrade.reduce(
              (sum, cls) => sum + getClassSchedule(cls.name).length, 0
            );

            return (
              <div key={grade} className="print:break-after-page">
                {/* Grade Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 print:bg-slate-100 rounded-2xl p-5 mb-4 print:mb-3 flex items-center justify-between print:border print:border-slate-300"
                  style={{ background: "linear-gradient(to right, var(--brand-primary), var(--brand-primary-hover, var(--brand-primary)))" }}>
                  <div className="flex items-center gap-3">
                    <GraduationCap size={28} className="text-white print:text-indigo-700" />
                    <div>
                      <h2 className="text-2xl font-black text-white print:text-black">{grade}</h2>
                      <p className="text-xs text-indigo-100 print:text-slate-600 mt-0.5">
                        {classesInGrade.length} τμήματα · {totalSlots} συνολικά σλοτ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-1 gap-4">
                  {classesInGrade.map((cls) => (
                    <ClassMiniGrid key={cls.id} className={cls.name} grade={cls.grade} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page { margin: 1cm; size: A4; }
          body { background: white !important; color: black !important; }
          aside, header, .print\\:hidden { display: none !important; }
          main { overflow: visible !important; }
          .print\\:break-after-page { break-after: page; }
          .print\\:break-inside-avoid { break-inside: avoid; }
        }
      `}</style>
    </WorkspaceShell>
  );
}
