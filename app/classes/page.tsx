"use client";

import { useEffect, useState } from "react";

type ClassUnit = {
  id: string;
  grade: string;       // ⚠️ field "grade", όχι "category" (συμβατό με placement & scheduler)
  name: string;        // π.χ. "Α1"
  maxStudents?: number; // χωρητικότητα
};

const GRADES = [
  "Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου",
  "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου",
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassUnit[]>([]);
  const [bulkGrade, setBulkGrade] = useState<string>("");
  const [bulkCount, setBulkCount] = useState<number>(3);
  const [bulkCapacity, setBulkCapacity] = useState<number>(8);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_classes");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Auto-migration: από παλιό schema με category → grade
        const migrated = parsed.map((c: any) => ({
          ...c,
          grade: c.grade || c.category || "Α Γυμνασίου",
          maxStudents: c.maxStudents || c.capacity || undefined,
        }));
        setClasses(migrated);
        // Αν έγινε migration, ξανα-αποθηκεύω για να φτιαχτεί
        if (parsed.some((c: any) => !c.grade && c.category)) {
          localStorage.setItem("eduflow_classes", JSON.stringify(migrated));
        }
      } catch {}
    }
  }, []);

  const persist = (list: ClassUnit[]) => {
    setClasses(list);
    localStorage.setItem("eduflow_classes", JSON.stringify(list));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const handleBulkSave = () => {
    const e: { [k: string]: string } = {};
    if (!bulkGrade) e.bulkGrade = "Επίλεξε τάξη";
    if (!bulkCount || bulkCount < 1) e.bulkCount = "Μη έγκυρος αριθμός";
    if (bulkCount > 20) e.bulkCount = "Πολύ μεγάλος αριθμός (max 20)";
    if (bulkCapacity < 1) e.bulkCapacity = "Μη έγκυρη χωρητικότητα";

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});

    const prefix = bulkGrade.split(" ")[0].charAt(0); // π.χ. "Γ"
    const newOnes: ClassUnit[] = [];
    for (let i = 1; i <= bulkCount; i++) {
      newOnes.push({
        id: `${bulkGrade}-${prefix}${i}-${Date.now()}-${i}`,
        grade: bulkGrade,
        name: `${prefix}${i}`,
        maxStudents: bulkCapacity,
      });
    }

    const filtered = classes.filter((c) => c.grade !== bulkGrade);
    const updated = [...filtered, ...newOnes];
    persist(updated);
    showToast(`✓ Αποθηκεύτηκαν ${newOnes.length} τμήματα για ${bulkGrade}`);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Διαγραφή τμήματος;")) return;
    persist(classes.filter((c) => c.id !== id));
    showToast("🗑 Διαγράφηκε");
  };

  const updateCapacity = (id: string, capacity: number) => {
    persist(classes.map((c) => (c.id === id ? { ...c, maxStudents: capacity } : c)));
  };

  const grouped = classes.reduce<{ [k: string]: ClassUnit[] }>((acc, c) => {
    if (!acc[c.grade]) acc[c.grade] = [];
    acc[c.grade].push(c);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Τμήματα</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Όρισε τα τμήματά σου εδώ. Κάθε τμήμα ανήκει σε μία τάξη (π.χ. «Γ2» = Γ Λυκείου).
        </p>
      </div>

      {/* Bulk Save */}
      <div className="bg-indigo-500/5 border border-indigo-500/30 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-indigo-400 mb-3 uppercase tracking-wide">
          🚀 Γρήγορη Δημιουργία
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Τάξη *</label>
            <select value={bulkGrade}
              onChange={(e) => setBulkGrade(e.target.value)}
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.bulkGrade ? "border-rose-500" : "border-zinc-700"}`}>
              <option value="">— Επίλεξε τάξη —</option>
              {GRADES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.bulkGrade && <p className="text-xs text-rose-400 mt-1">{errors.bulkGrade}</p>}
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Αριθμός τμημάτων *</label>
            <input type="number" min={1} max={20} value={bulkCount}
              onChange={(e) => setBulkCount(parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.bulkCount ? "border-rose-500" : "border-zinc-700"}`} />
            {errors.bulkCount && <p className="text-xs text-rose-400 mt-1">{errors.bulkCount}</p>}
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Χωρητικότητα (μαθητές)</label>
            <input type="number" min={1} max={50} value={bulkCapacity}
              onChange={(e) => setBulkCapacity(parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.bulkCapacity ? "border-rose-500" : "border-zinc-700"}`} />
            {errors.bulkCapacity && <p className="text-xs text-rose-400 mt-1">{errors.bulkCapacity}</p>}
          </div>
          <button onClick={handleBulkSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-emerald-500/20">
            💾 Αποθήκευση
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          💡 π.χ. «Γ Λυκείου» + «4» + «8» → δημιουργεί <b>Γ1, Γ2, Γ3, Γ4</b> με χωρητικότητα 8 μαθητές το καθένα.
          Αν υπάρχουν ήδη τμήματα στην ίδια τάξη → αντικαθίστανται.
        </p>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-8 text-center text-zinc-500">
            Δεν υπάρχουν τμήματα. Χρησιμοποίησε τη «Γρήγορη Δημιουργία» πάνω.
          </div>
        ) : (
          GRADES.filter((g) => grouped[g]).map((grade) => (
            <div key={grade} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">
                  {grade} <span className="text-zinc-500">({grouped[grade].length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {grouped[grade].map((c) => (
                  <div key={c.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{c.name}</span>
                      <button onClick={() => handleDelete(c.id)}
                        className="text-rose-400 hover:text-rose-300 text-xs">🗑</button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <span>👥</span>
                      <input type="number" min={1} max={50}
                        value={c.maxStudents || 8}
                        onChange={(e) => updateCapacity(c.id, parseInt(e.target.value) || 0)}
                        className="w-12 bg-zinc-900 border border-zinc-700 rounded px-1 text-white text-xs" />
                      <span>max</span>
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
