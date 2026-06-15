"use client";

import { useEffect, useState } from "react";

type Course = {
  id: string;
  name: string;
  grade: string;          // π.χ. "Γ Λυκείου" — ΟΧΙ category, χρησιμοποιείται από scheduler & placement
  weeklyHours: number;    // συνολικές ώρες/εβδομάδα
  distribution: number[]; // π.χ. [2,1] = 2ωρο + 1ωρο
  minGapDays: number;     // ελάχιστο gap σε ημέρες μεταξύ μαθημάτων
  isSummerCourse?: boolean;
};

const GRADES = [
  "Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου",
  "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου",
];

const DISTRIBUTION_PRESETS: { label: string; value: number[] }[] = [
  { label: "1 ώρα", value: [1] },
  { label: "2 ώρες (1 σλοτ)", value: [2] },
  { label: "2 ώρες (1+1)", value: [1, 1] },
  { label: "3 ώρες (2+1)", value: [2, 1] },
  { label: "3 ώρες (1+1+1)", value: [1, 1, 1] },
  { label: "4 ώρες (2+2)", value: [2, 2] },
  { label: "4 ώρες (2+1+1)", value: [2, 1, 1] },
  { label: "4 ώρες (1+1+1+1)", value: [1, 1, 1, 1] },
  { label: "5 ώρες (2+2+1)", value: [2, 2, 1] },
  { label: "5 ώρες (2+1+1+1)", value: [2, 1, 1, 1] },
  { label: "5 ώρες (1+1+1+1+1)", value: [1, 1, 1, 1, 1] },
  { label: "6 ώρες (2+2+2)", value: [2, 2, 2] },
  { label: "6 ώρες (2+2+1+1)", value: [2, 2, 1, 1] },
  { label: "6 ώρες (2+1+1+1+1)", value: [2, 1, 1, 1, 1] },
  { label: "7 ώρες (2+2+2+1)", value: [2, 2, 2, 1] },
];

const MIN_GAP_OPTIONS = [
  { label: "Καμία απαίτηση", value: 0 },
  { label: "1 ημέρα", value: 1 },
  { label: "2 ημέρες", value: 2 },
  { label: "3 ημέρες", value: 3 },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Course>>({
    name: "",
    grade: "Α Γυμνασίου",
    distribution: [1],
    minGapDays: 1,
    isSummerCourse: false,
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_courses") || localStorage.getItem("eduflow_lessons");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migration: αν παλιά εγγραφή έχει "category" αντί για "grade"
        const migrated = parsed.map((c: any) => ({
          ...c,
          grade: c.grade || c.category || "Α Γυμνασίου",
          weeklyHours: c.weeklyHours || c.hoursPerWeek || (Array.isArray(c.distribution) ? c.distribution.reduce((a: number, b: number) => a + b, 0) : 0),
        }));
        setCourses(migrated);
      } catch {}
    }
  }, []);

  const persist = (list: Course[]) => {
    setCourses(list);
    const json = JSON.stringify(list);
    // Αποθήκευση σε ΚΑΙ ΤΑ ΔΥΟ keys (placement & scheduler διαβάζουν διαφορετικά)
    localStorage.setItem("eduflow_courses", json);
    localStorage.setItem("eduflow_lessons", json);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const resetForm = () => {
    setForm({
      name: "",
      grade: "Α Γυμνασίου",
      distribution: [1],
      minGapDays: 1,
      isSummerCourse: false,
    });
    setErrors({});
    setEditingId(null);
  };

  const validate = (): boolean => {
    const e: { [k: string]: string } = {};
    if (!form.name?.trim()) e.name = "Υποχρεωτικό όνομα";
    if (!form.grade) e.grade = "Υποχρεωτική τάξη";
    if (!form.distribution || form.distribution.length === 0) e.distribution = "Υποχρεωτική κατανομή";
    if (form.minGapDays === undefined || form.minGapDays === null) e.minGapDays = "Επίλεξε min gap";
    if (form.isSummerCourse && form.grade !== "Γ Λυκείου") {
      e.isSummerCourse = "Καλοκαιρινό μάθημα μόνο για Γ Λυκείου";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const weeklyHours = (form.distribution || []).reduce((s, x) => s + x, 0);
    const course: Course = {
      id: editingId || Date.now().toString(),
      name: form.name!,
      grade: form.grade!,
      weeklyHours,
      distribution: form.distribution!,
      minGapDays: form.minGapDays!,
      isSummerCourse: form.isSummerCourse || false,
    };
    const updated = editingId
      ? courses.map((c) => (c.id === editingId ? course : c))
      : [...courses, course];
    persist(updated);
    showToast(editingId ? "✓ Ενημερώθηκε" : "✓ Καταχωρήθηκε");
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (c: Course) => {
    setForm(c);
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Διαγραφή μαθήματος;")) return;
    persist(courses.filter((c) => c.id !== id));
    showToast("🗑 Διαγράφηκε");
  };

  const grouped = courses.reduce<{ [k: string]: Course[] }>((acc, c) => {
    if (!acc[c.grade]) acc[c.grade] = [];
    acc[c.grade].push(c);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Μαθήματα</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Ορισμός μαθημάτων ανά τάξη, κατανομή ωρών και ελάχιστο κενό μεταξύ συναντήσεων.
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold">
            + Νέο Μάθημα
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-indigo-400">
              {editingId ? "✏️ Επεξεργασία" : "+ Νέο Μάθημα"}
            </h2>
            <button onClick={() => { resetForm(); setShowForm(false); }} className="text-zinc-400 hover:text-white text-sm">✕ Κλείσιμο</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Όνομα μαθήματος *</label>
              <input type="text" placeholder="π.χ. Μαθηματικά Γ Λυκ., Φυσική..." value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.name ? "border-rose-500" : "border-zinc-700"}`} />
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Τάξη *</label>
              <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.grade ? "border-rose-500" : "border-zinc-700"}`}>
                {GRADES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Κατανομή ωρών/εβδομάδα *</label>
              <select value={JSON.stringify(form.distribution)}
                onChange={(e) => setForm({ ...form, distribution: JSON.parse(e.target.value) })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.distribution ? "border-rose-500" : "border-zinc-700"}`}>
                {DISTRIBUTION_PRESETS.map((p) => (
                  <option key={p.label} value={JSON.stringify(p.value)}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Ελάχιστο κενό μεταξύ συναντήσεων *</label>
              <select value={form.minGapDays}
                onChange={(e) => setForm({ ...form, minGapDays: parseInt(e.target.value) })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.minGapDays ? "border-rose-500" : "border-zinc-700"}`}>
                {MIN_GAP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <p className="text-xs text-zinc-500 mt-1">
                💡 «2 ημέρες» = δεν τοποθετεί 2 συναντήσεις σε διπλανές μέρες (π.χ. Τρίτη + Τετάρτη).
              </p>
            </div>

            {form.grade === "Γ Λυκείου" && (
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-amber-500/10 border border-amber-500/40 rounded-lg">
                  <input type="checkbox" checked={form.isSummerCourse || false}
                    onChange={(e) => setForm({ ...form, isSummerCourse: e.target.checked })}
                    className="accent-amber-500 w-4 h-4" />
                  <span className="text-sm font-bold text-amber-400">☀️ Καλοκαιρινό μάθημα</span>
                  <span className="text-xs text-zinc-400">(Ιούν-Ιουλ-Αυγ, Δευ-Παρ 09:00-14:00)</span>
                </label>
                {errors.isSummerCourse && <p className="text-xs text-rose-400 mt-1">{errors.isSummerCourse}</p>}
              </div>
            )}
          </div>

          <div className="mt-5 pt-5 border-t border-zinc-700 flex items-center justify-end gap-2">
            <button type="button" onClick={() => { resetForm(); setShowForm(false); }}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm">Άκυρο</button>
            <button type="button" onClick={handleSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-emerald-500/20">
              💾 {editingId ? "Ενημέρωση" : "Αποθήκευση"}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-8 text-center text-zinc-500">
            Δεν υπάρχουν μαθήματα ακόμα.
          </div>
        ) : (
          GRADES.filter((g) => grouped[g]).map((grade) => (
            <div key={grade}>
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide mb-2">
                {grade} <span className="text-zinc-500">({grouped[grade].length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped[grade].map((c) => (
                  <div key={c.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-bold text-white text-sm">{c.name}</div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(c)} className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs">✏️</button>
                        <button onClick={() => handleDelete(c.id)} className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded text-xs">🗑</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">⏱ {c.weeklyHours} ώρες/εβδ.</span>
                      <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">{c.distribution.join("+")}</span>
                      {c.minGapDays > 0 ? (
                        <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">🔄 gap {c.minGapDays}d</span>
                      ) : (
                        <span className="bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">no gap</span>
                      )}
                      {c.isSummerCourse && <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">☀️</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
