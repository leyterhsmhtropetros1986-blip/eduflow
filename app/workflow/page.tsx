"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, AlertCircle, ArrowRight } from "lucide-react";

type StepStatus = "done" | "pending" | "warning";

type Step = {
  id: string;
  title: string;
  description: string;
  href: string;
  checkFn: () => { status: StepStatus; detail: string };
};

export default function WorkflowPage() {
  const [steps, setSteps] = useState<{ step: Step; status: StepStatus; detail: string }[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const stepDefs: Step[] = [
    {
      id: "1",
      title: "1. Δημιουργία Μαθημάτων",
      description: "Όρισε τα μαθήματα ανά τάξη (π.χ. «Μαθηματικά Α Λυκείου»), ώρες/εβδομάδα και κατανομή.",
      href: "/courses",
      checkFn: () => {
        const courses = JSON.parse(localStorage.getItem("eduflow_courses") || localStorage.getItem("eduflow_lessons") || "[]");
        return courses.length === 0
          ? { status: "pending", detail: "Δεν υπάρχουν μαθήματα ακόμα." }
          : { status: "done", detail: `${courses.length} μαθήματα δημιουργήθηκαν.` };
      },
    },
    {
      id: "2",
      title: "2. Δημιουργία Τμημάτων",
      description: "Όρισε τα τμήματα ανά τάξη (π.χ. Α1, Α2 για Α Λυκείου) με χωρητικότητα.",
      href: "/classes",
      checkFn: () => {
        const classes = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
        const valid = classes.filter((c: any) => c.grade || c.category);
        return valid.length === 0
          ? { status: "pending", detail: "Δεν υπάρχουν τμήματα." }
          : { status: "done", detail: `${valid.length} τμήματα.` };
      },
    },
    {
      id: "3",
      title: "3. Καθηγητές",
      description: "Πρόσθεσε καθηγητές με τα μαθήματα που διδάσκουν και τη διαθεσιμότητά τους.",
      href: "/teachers",
      checkFn: () => {
        const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
        const valid = teachers.filter((t: any) => (t.subjects?.length > 0 || t.subject) && t.availability?.length > 0);
        if (teachers.length === 0) return { status: "pending", detail: "Δεν υπάρχουν καθηγητές." };
        if (valid.length < teachers.length) return { status: "warning", detail: `${valid.length}/${teachers.length} καθηγητές έτοιμοι (κάποιοι χωρίς μάθημα ή διαθεσιμότητα).` };
        return { status: "done", detail: `${teachers.length} καθηγητές, όλοι έτοιμοι.` };
      },
    },
    {
      id: "4",
      title: "4. Μαθητές",
      description: "Πρόσθεσε μαθητές με μαθήματα. Σε κάθε μάθημα διάλεξε τμήμα ή «τυχαία κατανομή».",
      href: "/students",
      checkFn: () => {
        const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
        const withEnrollments = students.filter((s: any) => s.enrollments?.length > 0);
        if (students.length === 0) return { status: "pending", detail: "Δεν υπάρχουν μαθητές." };
        if (withEnrollments.length < students.length) return { status: "warning", detail: `${withEnrollments.length}/${students.length} μαθητές με μαθήματα.` };
        return { status: "done", detail: `${students.length} μαθητές, όλοι με μαθήματα.` };
      },
    },
    {
      id: "5",
      title: "5. Τοποθέτηση (αν επέλεξες «τυχαία»)",
      description: "Μαθητές με «τυχαία κατανομή» τοποθετούνται εδώ σε συγκεκριμένο τμήμα.",
      href: "/placement",
      checkFn: () => {
        const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
        const unplaced = students.flatMap((s: any) =>
          (s.enrollments || []).filter((e: any) => !e.className).map((e: any) => ({ s, e }))
        );
        if (unplaced.length === 0) return { status: "done", detail: "Όλοι οι μαθητές τοποθετήθηκαν." };
        return { status: "warning", detail: `${unplaced.length} τοποθετήσεις σε εκκρεμότητα.` };
      },
    },
    {
      id: "6",
      title: "6. Αίθουσες (προαιρετικό)",
      description: "Δημιούργησε αίθουσες αν θες οι μαθητές να τις βλέπουν στο πρόγραμμα.",
      href: "/rooms",
      checkFn: () => {
        const rooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");
        return rooms.length === 0
          ? { status: "warning", detail: "Καμία αίθουσα — προαιρετικό." }
          : { status: "done", detail: `${rooms.length} αίθουσες.` };
      },
    },
    {
      id: "7",
      title: "7. Αυτόματη Δημιουργία Προγράμματος",
      description: "Πάτα «Αυτόματη Δημιουργία» στη σελίδα Πρόγραμμα. Ο scheduler θα συνδυάσει όλα τα δεδομένα.",
      href: "/schedule",
      checkFn: () => {
        const schedule = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");
        return schedule.length === 0
          ? { status: "pending", detail: "Δεν έχει δημιουργηθεί πρόγραμμα ακόμα." }
          : { status: "done", detail: `${schedule.length} σλοτ προγραμματισμένα.` };
      },
    },
    {
      id: "8",
      title: "8. Προβολή Προγράμματος",
      description: "Δες το πρόγραμμα σε grid ή ανά τμήμα/καθηγητή/αίθουσα. Εκτύπωση, PDF, share.",
      href: "/timetable",
      checkFn: () => {
        const schedule = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");
        return schedule.length === 0
          ? { status: "pending", detail: "—" }
          : { status: "done", detail: "Το πρόγραμμα είναι έτοιμο για προβολή." };
      },
    },
  ];

  useEffect(() => {
    const checked = stepDefs.map((step) => ({ step, ...step.checkFn() }));
    setSteps(checked);
  }, [refreshKey]);

  const doneCount = steps.filter((s) => s.status === "done").length;
  const totalCount = steps.length;
  const percent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🗺 Workflow Δημιουργίας Προγράμματος</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Η σωστή σειρά για να βγει το πρόγραμμα του φροντιστηρίου από το μηδέν.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-white">Πρόοδος: {doneCount}/{totalCount} ολοκληρωμένα</span>
          <button onClick={() => setRefreshKey(refreshKey + 1)}
            className="text-xs text-indigo-400 hover:text-indigo-300">🔄 Επανέλεγχος</button>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-xs text-zinc-400 mt-2">{percent}%</p>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map(({ step, status, detail }, idx) => (
          <div key={step.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex items-start gap-4">
            {status === "done" ? (
              <CheckCircle2 className="text-emerald-400 shrink-0 mt-1" size={22} />
            ) : status === "warning" ? (
              <AlertCircle className="text-amber-400 shrink-0 mt-1" size={22} />
            ) : (
              <Circle className="text-zinc-600 shrink-0 mt-1" size={22} />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="text-white font-bold">{step.title}</h3>
                <a href={step.href}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0">
                  Άνοιγμα <ArrowRight size={12} />
                </a>
              </div>
              <p className="text-xs text-zinc-400 mb-2">{step.description}</p>
              <p className={`text-xs font-semibold ${
                status === "done" ? "text-emerald-400" :
                status === "warning" ? "text-amber-400" : "text-zinc-500"
              }`}>
                {status === "done" ? "✓ " : status === "warning" ? "⚠ " : "○ "}{detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-6 bg-indigo-500/5 border border-indigo-500/30 rounded-xl p-4">
        <h3 className="text-sm font-bold text-indigo-400 mb-2">💡 Tips</h3>
        <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5">
          <li>Αν αλλάξεις κάτι (π.χ. προσθέσεις μαθητή), τρέξε ξανά «Αυτόματη Δημιουργία».</li>
          <li>Τα ονόματα μαθημάτων πρέπει να ταιριάζουν <b>ακριβώς</b> μεταξύ <i>Μαθημάτων</i> και <i>Καθηγητών</i>.</li>
          <li>Ένας μαθητής μπορεί να ανήκει σε διαφορετικά τμήματα ανά μάθημα (π.χ. Μαθηματικά Γ1, Φυσική Γ2).</li>
          <li>Το <b>καλοκαιρινό πρόγραμμα</b> ισχύει μόνο για Γ Λυκείου, Δευ-Παρ 09:00-17:00.</li>
        </ul>
      </div>
    </div>
  );
}
    