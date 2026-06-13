"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Printer, GraduationCap, CheckCircle2, FileText, MessageSquare, BookOpen, Calendar } from "lucide-react";

const DAYS = ["Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"];

export default function StudentReportPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [exams, setExams] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    setIsMounted(true);
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
    setSchedule(JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"));
    setAttendance(JSON.parse(localStorage.getItem("eduflow_attendance") || "[]"));
    setProgress(JSON.parse(localStorage.getItem("eduflow_progress") || "{}"));
    setExams(JSON.parse(localStorage.getItem("eduflow_exams") || "[]"));
    // Default περίοδος = τρέχων μήνας
    const today = new Date();
    setFromDate(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10));
    setToDate(today.toISOString().slice(0, 10));
  }, []);

  const studentOptions = useMemo(() => [...students].sort((a, b) => (a.lastName || "").localeCompare(b.lastName || "", "el")), [students]);
  const student = students.find((s) => s.id === selectedId);

  useEffect(() => { if (studentOptions.length && !selectedId) setSelectedId(studentOptions[0].id); }, [studentOptions, selectedId]);

  // Πρόγραμμα μαθητή
  const kidSchedule = useMemo(() => {
    if (!student) return [];
    return schedule.filter((it) => (student.enrollments || []).some((e: any) => e.className === it.groupName && e.lessonName === it.subject));
  }, [schedule, student]);

  // Παρουσίες στην επιλεγμένη περίοδο
  const periodAttendance = useMemo(() => {
    if (!student) return { present: 0, absent: 0, total: 0, byDate: [] as any[] };
    const full = `${student.firstName || ""} ${student.lastName || ""}`.trim();
    const all = attendance.filter((r: any) => r.studentId === student.id || r.studentName === full || r.studentName === `${student.lastName} ${student.firstName}`.trim());
    const inPeriod = all.filter((r: any) => {
      if (!r.date) return true;
      return (!fromDate || r.date >= fromDate) && (!toDate || r.date <= toDate);
    });
    const present = inPeriod.filter((r: any) => (r.status || (r.present ? "present" : "absent")) === "present").length;
    return { present, absent: inPeriod.length - present, total: inPeriod.length, byDate: inPeriod };
  }, [attendance, student, fromDate, toDate]);

  const kidProgress = student ? progress[student.id] : null;
  const testEntries = (kidProgress?.testEntries || []).filter((t: any) => (!fromDate || !t.date || t.date >= fromDate) && (!toDate || !t.date || t.date <= toDate));
  const testsAvg = testEntries.length ? Math.round(testEntries.reduce((a: number, t: any) => a + (t.max > 0 ? (t.score / t.max) * 100 : 0), 0) / testEntries.length) : 0;
  const attPct = periodAttendance.total ? Math.round(periodAttendance.present * 100 / periodAttendance.total) : 0;

  // Διαγωνίσματα στην περίοδο για την τάξη του
  const periodExams = useMemo(() => {
    if (!student) return [];
    return exams.filter((e: any) => e.grade === student.grade && (!fromDate || e.date >= fromDate) && (!toDate || e.date <= toDate));
  }, [exams, student, fromDate, toDate]);

  // Σύνολο ωρών εβδομάδας
  const weeklyHours = useMemo(() => {
    const dur = (t: string) => { const [a, b] = String(t).split("-"); const s = parseInt(a); const e = b ? parseInt(b) : s + 1; return isNaN(s) ? 0 : Math.max(0, e - s); };
    return kidSchedule.reduce((acc, it) => acc + dur(it.time), 0);
  }, [kidSchedule]);

  const fmtDate = (iso: string) => iso ? new Date(iso + "T00:00:00").toLocaleDateString("el-GR") : "";
  const fmtPeriod = `${fmtDate(fromDate)} – ${fmtDate(toDate)}`;

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Αναφορά Μαθητή — PDF" description="Πλήρες πακέτο επίδοσης μαθητή για μια χρονική περίοδο. Έτοιμο για εκτύπωση/PDF.">

      <style>{`
        @media print {
          @page { margin: 1.2cm; size: A4; }
          body { background: #fff !important; }
          .print-hide { display: none !important; }
          .print-page { background: #fff !important; color: #000 !important; padding: 0 !important; }
          .print-page * { color: #000 !important; border-color: #000 !important; background: transparent !important; }
          .print-page .keep-bg { background: #f1f5f9 !important; }
          .print-page table { border-collapse: collapse; width: 100%; }
          .print-page td, .print-page th { border: 1px solid #000; padding: 6px 10px; }
          .pgbreak { page-break-before: always; }
        }
      `}</style>

      {/* CONTROLS */}
      <div className="print-hide bg-[#1e2330] border border-slate-800 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Μαθητής</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white mt-1 outline-none focus:border-indigo-500">
            {studentOptions.map((s) => <option key={s.id} value={s.id}>{s.lastName} {s.firstName} — {s.grade}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Από</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white mt-1" />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Έως</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white mt-1" />
        </div>
        <button onClick={() => window.print()} className="sm:col-span-4 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Printer size={16} /> Εξαγωγή PDF / Εκτύπωση</button>
      </div>

      {!student ? <div className="text-slate-500 text-center py-16">Επίλεξε μαθητή.</div> : (
        <div className="print-page bg-[#1e2330] border border-slate-800 rounded-3xl p-8 space-y-8">

          {/* ΕΠΙΚΕΦΑΛΙΔΑ */}
          <div className="text-center border-b-2 border-slate-700 pb-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">ΑΝΑΦΟΡΑ ΕΠΙΔΟΣΗΣ</p>
            <h1 className="text-3xl font-black text-white mt-1">{student.lastName} {student.firstName}</h1>
            <p className="text-sm text-slate-400 mt-1">{student.grade} · Περίοδος: {fmtPeriod}</p>
          </div>

          {/* 4 KPIs */}
          <div className="grid grid-cols-4 gap-3">
            <BigStat label="Παρουσίες" value={`${attPct}%`} sub={`${periodAttendance.present}/${periodAttendance.total}`} icon={<CheckCircle2 size={18} />} />
            <BigStat label="Διαγωνίσματα" value={`${testsAvg}%`} sub={`${testEntries.length} βαθμοί`} icon={<FileText size={18} />} />
            <BigStat label="Εργασίες" value={`${kidProgress?.homework || 0}%`} sub="τρέχουσα" icon={<BookOpen size={18} />} />
            <BigStat label="Συμμετοχή" value={`${kidProgress?.participation || 0}%`} sub="τρέχουσα" icon={<MessageSquare size={18} />} />
          </div>

          {/* ΠΡΟΓΡΑΜΜΑ */}
          <Section title="Εβδομαδιαίο Πρόγραμμα" icon={<Calendar size={14} />} sub={`${weeklyHours} ώρες/εβδομάδα · ${kidSchedule.length} μαθήματα`}>
            {kidSchedule.length === 0 ? <p className="text-slate-500 text-xs">Δεν υπάρχει πρόγραμμα.</p> :
              <table className="w-full text-xs">
                <thead><tr className="text-slate-400 text-[10px] uppercase">
                  <th className="text-left py-2">Μέρα</th><th className="text-left py-2">Ώρα</th><th className="text-left py-2">Μάθημα</th><th className="text-left py-2">Καθηγητής</th><th className="text-left py-2">Τμήμα</th>
                </tr></thead>
                <tbody>
                  {DAYS.filter((d) => kidSchedule.some((it: any) => it.day === d)).flatMap((d) =>
                    kidSchedule.filter((it: any) => it.day === d).sort((a: any, b: any) => a.time.localeCompare(b.time)).map((it: any) => (
                      <tr key={it.id} className="border-t border-slate-800">
                        <td className="py-2 text-slate-300">{d}</td>
                        <td className="py-2 text-slate-300 font-mono">{it.time}</td>
                        <td className="py-2 text-white font-bold">{it.subject}</td>
                        <td className="py-2 text-slate-300">{it.teacher}</td>
                        <td className="py-2 text-slate-300">{it.groupName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            }
          </Section>

          {/* ΒΑΘΜΟΙ */}
          <Section title="Βαθμολογίες (περιόδου)" icon={<FileText size={14} />} sub={`Μέσος όρος: ${testsAvg}%`}>
            {testEntries.length === 0 ? <p className="text-slate-500 text-xs">Δεν υπάρχουν βαθμοί στην περίοδο.</p> :
              <table className="w-full text-xs">
                <thead><tr className="text-slate-400 text-[10px] uppercase">
                  <th className="text-left py-2">Μάθημα</th><th className="text-left py-2">Ημερομηνία</th><th className="text-right py-2">Βαθμός</th><th className="text-right py-2">%</th>
                </tr></thead>
                <tbody>
                  {testEntries.map((t: any) => {
                    const pct = t.max > 0 ? Math.round((t.score / t.max) * 100) : 0;
                    return (
                      <tr key={t.id} className="border-t border-slate-800">
                        <td className="py-2 text-white font-bold">{t.subject}</td>
                        <td className="py-2 text-slate-300">{t.date ? fmtDate(t.date) : "—"}</td>
                        <td className="py-2 text-right text-white">{t.score}/{t.max}</td>
                        <td className="py-2 text-right font-bold text-indigo-400">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            }
          </Section>

          {/* ΕΠΕΡΧΟΜΕΝΑ ΔΙΑΓΩΝΙΣΜΑΤΑ */}
          {periodExams.length > 0 && (
            <Section title="Επερχόμενα Διαγωνίσματα" icon={<FileText size={14} />} sub={`${periodExams.length} προγραμματισμένα`}>
              <table className="w-full text-xs">
                <thead><tr className="text-slate-400 text-[10px] uppercase">
                  <th className="text-left py-2">Ημερομηνία</th><th className="text-left py-2">Μάθημα</th><th className="text-left py-2">Ώρα</th><th className="text-left py-2">Αίθουσα</th>
                </tr></thead>
                <tbody>
                  {periodExams.map((e: any) => (
                    <tr key={e.id} className="border-t border-slate-800">
                      <td className="py-2 text-white">{fmtDate(e.date)}</td>
                      <td className="py-2 text-white font-bold">{e.subject}</td>
                      <td className="py-2 text-slate-300">{e.start} · {e.duration}ω</td>
                      <td className="py-2 text-slate-300">{e.room || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* ΣΧΟΛΙΑ */}
          {kidProgress?.notes && (
            <Section title="Σχόλια Καθηγητή" icon={<MessageSquare size={14} />}>
              <p className="text-sm text-slate-300 leading-relaxed bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4 keep-bg">{kidProgress.notes}</p>
            </Section>
          )}

          {/* ΥΠΟΓΡΑΦΗ */}
          <div className="border-t-2 border-slate-700 pt-6 mt-8 grid grid-cols-2 gap-12 text-xs text-slate-400">
            <div><p className="border-b border-slate-600 pb-1 mb-1">Ημερομηνία: {new Date().toLocaleDateString("el-GR")}</p><p className="text-[10px]">Ο/Η υπεύθυνος/η εκπαίδευσης</p></div>
            <div><p className="border-b border-slate-600 pb-1 mb-1">&nbsp;</p><p className="text-[10px]">Υπογραφή γονέα</p></div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

function BigStat({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: any }) {
  return (
    <div className="bg-[#0b0e14] border border-slate-800 rounded-2xl p-4 keep-bg">
      <div className="flex items-center gap-2 text-indigo-400 mb-1">{icon}<p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p></div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}
function Section({ title, icon, sub, children }: { title: string; icon: any; sub?: string; children: any }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
        <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">{icon}{title}</h2>
        {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
      </div>
      {children}
    </div>
  );
}
