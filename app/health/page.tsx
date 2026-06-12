"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Activity, ShieldCheck } from "lucide-react";

export default function HealthCheckPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<any>({ students: [], teachers: [], classes: [], lessons: [] });

  const load = () => {
    setData({
      students: JSON.parse(localStorage.getItem("eduflow_students") || "[]"),
      teachers: JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"),
      classes: JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]"),
      lessons: JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]"),
    });
  };

  useEffect(() => { setIsMounted(true); load(); }, []);

  const { errors, warnings } = useMemo(() => {
    const errors: { title: string; items: string[] }[] = [];
    const warnings: { title: string; items: string[] }[] = [];

    const students: any[] = data.students || [];
    const teachers: any[] = data.teachers || [];
    const classes: any[] = data.classes || [];
    const lessons: any[] = data.lessons || [];

    const lessonNames = lessons.map((l: any) => (typeof l === "string" ? l : l?.name)).filter(Boolean);
    const classNames = classes.map((c: any) => c.name || c.className).filter(Boolean);
    const classByName: Record<string, any> = {};
    classes.forEach((c: any) => { const nm = c.name || c.className; if (nm) classByName[nm] = c; });

    // Πλήθος εγγραφών ανά μάθημα + διακριτοί μαθητές ανά τμήμα
    const enrollByLesson: Record<string, number> = {};
    const studentsPerClass: Record<string, Set<string>> = {};
    students.forEach((s: any) => {
      (s.enrollments || []).forEach((e: any) => {
        if (e.lessonName) enrollByLesson[e.lessonName] = (enrollByLesson[e.lessonName] || 0) + 1;
        if (e.className) {
          if (!studentsPerClass[e.className]) studentsPerClass[e.className] = new Set();
          studentsPerClass[e.className].add(s.id || `${s.firstName}${s.lastName}`);
        }
      });
    });

    // ── ERRORS ──
    // 1) Μαθήματα χωρίς ώρες
    const noHours = lessons.filter((l: any) => typeof l === "object" && (!l.weeklyHours || !(l.distribution?.length))).map((l: any) => l.name);
    if (noHours.length) errors.push({ title: "Μαθήματα χωρίς δηλωμένες ώρες", items: noHours });

    // 2) Μαθήματα με εγγραφές αλλά χωρίς καθηγητή
    const noTeacher = lessonNames.filter((nm: string) => (enrollByLesson[nm] || 0) > 0 && !teachers.some((t: any) => t.subject === nm));
    if (noTeacher.length) errors.push({ title: "Μαθήματα με εγγραφές αλλά ΧΩΡΙΣ καθηγητή", items: noTeacher });

    // 3) Εγγραφές σε τμήμα που δεν υπάρχει
    const orphanClass: string[] = [];
    students.forEach((s: any) => (s.enrollments || []).forEach((e: any) => {
      if (e.className && !classNames.includes(e.className)) orphanClass.push(`${s.lastName} ${s.firstName}: τμήμα "${e.className}"`);
    }));
    if (orphanClass.length) errors.push({ title: "Εγγραφές σε τμήμα που δεν υπάρχει", items: orphanClass });

    // 4) Τμήματα πάνω από χωρητικότητα
    const overCap: string[] = [];
    Object.keys(studentsPerClass).forEach((cn) => {
      const max = Number(classByName[cn]?.maxStudents) || Number(classByName[cn]?.capacity) || 0;
      const count = studentsPerClass[cn].size;
      if (max > 0 && count > max) overCap.push(`${cn}: ${count}/${max} μαθητές`);
    });
    if (overCap.length) errors.push({ title: "Τμήματα πάνω από τη χωρητικότητα", items: overCap });

    // ── WARNINGS ──
    // 5) Μαθητές χωρίς εγγραφές
    const noEnroll = students.filter((s: any) => !(s.enrollments?.length)).map((s: any) => `${s.lastName} ${s.firstName}`);
    if (noEnroll.length) warnings.push({ title: "Μαθητές χωρίς καμία εγγραφή", items: noEnroll });

    // 6) Μαθητές χωρίς δηλωμένη διαθεσιμότητα
    const stuNoAvail = students.filter((s: any) => !(s.availability?.length)).map((s: any) => `${s.lastName} ${s.firstName}`);
    if (stuNoAvail.length) warnings.push({ title: "Μαθητές χωρίς δηλωμένη διαθεσιμότητα", items: stuNoAvail });

    // 7) Καθηγητές χωρίς διαθεσιμότητα
    const teaNoAvail = teachers.filter((t: any) => !(t.availability?.length)).map((t: any) => `${t.lastName} ${t.firstName}`);
    if (teaNoAvail.length) warnings.push({ title: "Καθηγητές χωρίς δηλωμένη διαθεσιμότητα", items: teaNoAvail });

    // 8) Καθηγητές χωρίς μάθημα
    const teaNoSubject = teachers.filter((t: any) => !t.subject).map((t: any) => `${t.lastName} ${t.firstName}`);
    if (teaNoSubject.length) warnings.push({ title: "Καθηγητές χωρίς ορισμένο μάθημα", items: teaNoSubject });

    // 9) Μαθήματα χωρίς καμία εγγραφή (αχρησιμοποίητα)
    const unused = lessonNames.filter((nm: string) => !(enrollByLesson[nm] || 0));
    if (unused.length) warnings.push({ title: "Μαθήματα χωρίς καμία εγγραφή", items: unused });

    return { errors, warnings };
  }, [data]);

  if (!isMounted) return null;

  const errorCount = errors.reduce((a, g) => a + g.items.length, 0);
  const warnCount = warnings.reduce((a, g) => a + g.items.length, 0);
  const ready = errorCount === 0;

  return (
    <WorkspaceShell title="Έλεγχος Δεδομένων" description="Εντοπίζει προβλήματα πριν δημιουργήσεις πρόγραμμα.">

      {/* STATUS BANNER */}
      <div className={`rounded-3xl border p-6 mb-6 flex items-center justify-between gap-4 ${ready ? "bg-emerald-950/20 border-emerald-900/50" : "bg-rose-950/20 border-rose-900/50"}`}>
        <div className="flex items-center gap-4">
          {ready ? <ShieldCheck size={32} className="text-emerald-400" /> : <XCircle size={32} className="text-rose-400" />}
          <div>
            <h2 className={`font-black text-lg ${ready ? "text-emerald-400" : "text-rose-400"}`}>
              {ready ? "Έτοιμο για δημιουργία προγράμματος" : "Υπάρχουν θέματα που μπλοκάρουν το πρόγραμμα"}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {errorCount} σφάλματα · {warnCount} προειδοποιήσεις
            </p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold">
          <RefreshCw size={14} /> Έλεγχος ξανά
        </button>
      </div>

      {/* ERRORS */}
      <Section
        icon={<XCircle size={16} className="text-rose-400" />}
        title={`Σφάλματα (${errorCount})`}
        groups={errors}
        color="rose"
        emptyText="Κανένα σφάλμα — όλα καλά! 🎉"
      />

      {/* WARNINGS */}
      <Section
        icon={<AlertTriangle size={16} className="text-amber-400" />}
        title={`Προειδοποιήσεις (${warnCount})`}
        groups={warnings}
        color="amber"
        emptyText="Καμία προειδοποίηση."
      />

    </WorkspaceShell>
  );
}

function Section({ icon, title, groups, color, emptyText }: any) {
  const ring = color === "rose" ? "border-rose-900/40" : "border-amber-900/40";
  const dot = color === "rose" ? "bg-rose-500" : "bg-amber-500";
  return (
    <div className="mb-6">
      <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">{icon} {title}</h3>
      {groups.length === 0 ? (
        <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={14} /> {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {groups.map((g: any, i: number) => (
            <div key={i} className={`bg-[#1e2330] border ${ring} rounded-2xl p-4`}>
              <p className="text-white text-xs font-bold mb-2 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span> {g.title}
                <span className="ml-auto text-slate-500 font-mono">{g.items.length}</span>
              </p>
              <ul className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {g.items.map((it: string, j: number) => (
                  <li key={j} className="text-[11px] text-slate-300 bg-[#0b0e14] rounded-lg px-2.5 py-1.5 border border-slate-800/60">{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
