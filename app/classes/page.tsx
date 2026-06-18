"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ClassUnit,
  Student,
  loadStudents,
  loadCourses,
  getSectionLoad,
  generateId,
  sectionLabel,
} from "../../lib/schema";

const GRADES = [
  "Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου",
  "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου",
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassUnit[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [coursesAll, setCoursesAll] = useState<any[]>([]);

  // Bulk form
  const [bulkGrade, setBulkGrade] = useState<string>("");
  const [bulkSubject, setBulkSubject] = useState<string>("");
  const [bulkCount, setBulkCount] = useState<number>(3);
  const [bulkCapacity, setBulkCapacity] = useState<number>(8);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [toastMsg, setToastMsg] = useState("");

  // Filter
  const [filterGrade, setFilterGrade] = useState<string>("");
  const [filterSubject, setFilterSubject] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_classes");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const migrated = parsed.map((c: any) => ({
          ...c,
          id: c.id || generateId("sec"),
          grade: c.grade || c.category || "Α Γυμνασίου",
          subject: c.subject || "",
          maxStudents: c.maxStudents || c.capacity || 8,
        }));
        setClasses(migrated);
        if (parsed.some((c: any) => !c.subject)) {
          localStorage.setItem("eduflow_classes", JSON.stringify(migrated));
        }
      } catch {}
    }

    setStudents(loadStudents());
    setCoursesAll(loadCourses());
  }, []);

  const persist = (list: ClassUnit[]) => {
    setClasses(list);
    localStorage.setItem("eduflow_classes", JSON.stringify(list));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const subjectsForBulkGrade = useMemo(() => {
    if (!bulkGrade) return [];
    const matching = coursesAll.filter((c: any) => {
      const grade = typeof c === "object" ? c.grade : "";
      return !grade || grade === bulkGrade;
    });
    const names = matching.map((c: any) => typeof c === "string" ? c : c.name).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [bulkGrade, coursesAll]);

  const allSubjects = useMemo(() => {
    return Array.from(new Set(classes.map((c) => c.subject).filter(Boolean))).sort();
  }, [classes]);

  const handleBulkSave = () => {
    const e: { [k: string]: string } = {};
    if (!bulkGrade) e.bulkGrade = "Επίλεξε τάξη";
    if (!bulkSubject) e.bulkSubject = "Επίλεξε μάθημα";
    if (!bulkCount || bulkCount < 1) e.bulkCount = "Μη έγκυρος αριθμός";
    if (bulkCount > 20) e.bulkCount = "Πολύ μεγάλος (max 20)";
    if (bulkCapacity < 1) e.bulkCapacity = "Μη έγκυρη χωρητικότητα";

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});

    const prefix = bulkGrade.split(" ")[0].charAt(0);
    const newOnes: ClassUnit[] = [];
    for (let i = 1; i <= bulkCount; i++) {
      newOnes.push({
        id: generateId("sec"),
        grade: bulkGrade,
        name: `${prefix}${i}`,
        subject: bulkSubject,
        maxStudents: bulkCapacity,
      });
    }

    // Αντικαθιστώ ΜΟΝΟ τα τμήματα της ίδιας τάξης+μαθήματος
    const filtered = classes.filter((c) => !(c.grade === bulkGrade && c.subject === bulkSubject));
    const updated = [...filtered, ...newOnes];
    persist(updated);
    showToast(`✓ Δημιουργήθηκαν ${newOnes.length} τμήματα: ${bulkSubject} (${bulkGrade})`);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Διαγραφή τμήματος;")) return;
    persist(classes.filter((c) => c.id !== id));
    showToast("🗑 Διαγράφηκε");
  };

  const updateCapacity = (id: string, capacity: number) => {
    persist(classes.map((c) => (c.id === id ? { ...c, maxStudents: capacity } : c)));
  };

  const updateSubject = (id: string, subject: string) => {
    persist(classes.map((c) => (c.id === id ? { ...c, subject } : c)));
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (filterGrade && c.grade !== filterGrade) return false;
      if (filterSubject && c.subject !== filterSubject) return false;
      return true;
    });
  }, [classes, filterGrade, filterSubject]);

  const grouped = useMemo(() => {
    const g: Record<string, Record<string, ClassUnit[]>> = {};
    filteredClasses.forEach((c) => {
      if (!g[c.grade]) g[c.grade] = {};
      const subj = c.subject || "(Χωρίς μάθημα)";
      if (!g[c.grade][subj]) g[c.grade][subj] = [];
      g[c.grade][subj].push(c);
    });
    return g;
  }, [filteredClasses]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Τμήματα</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Κάθε τμήμα ανήκει σε <b>τάξη + μάθημα</b>. Π.χ. «Γα1 - Φυσική» είναι διαφορετικό από «Γα1 - Χημεία».
        </p>
      </div>

      {/* Bulk Save */}
      <div className="bg-indigo-500/5 border border-indigo-500/30 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-indigo-400 mb-3 uppercase tracking-wide">
          🚀 Γρήγορη Δημιουργία
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Τάξη *</label>
            <select value={bulkGrade}
              onChange={(e) => { setBulkGrade(e.target.value); setBulkSubject(""); }}
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.bulkGrade ? "border-rose-500" : "border-zinc-700"}`}>
              <option value="">— Επίλεξε —</option>
              {GRADES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.bulkGrade && <p className="text-xs text-rose-400 mt-1">{errors.bulkGrade}</p>}
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Μάθημα *</label>
            <select value={bulkSubject}
              onChange={(e) => setBulkSubject(e.target.value)}
              disabled={!bulkGrade}
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white disabled:opacity-50 ${errors.bulkSubject ? "border-rose-500" : "border-zinc-700"}`}>
              <option value="">— Επίλεξε —</option>
              {subjectsForBulkGrade.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.bulkSubject && <p className="text-xs text-rose-400 mt-1">{errors.bulkSubject}</p>}
            {bulkGrade && subjectsForBulkGrade.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">Πρόσθεσε πρώτα μαθήματα.</p>
            )}
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Αριθμός *</label>
            <input type="number" min={1} max={20} value={bulkCount}
              onChange={(e) => setBulkCount(parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.bulkCount ? "border-rose-500" : "border-zinc-700"}`} />
            {errors.bulkCount && <p className="text-xs text-rose-400 mt-1">{errors.bulkCount}</p>}
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Χωρητικότητα</label>
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
        <p className="text-xs text-zinc-500 mt-3">
          💡 «Γ Λυκείου» + «Φυσική» + «3» + «6» → δημιουργεί <b>Γα1, Γα2, Γα3</b> για Φυσική με max 6.
          Αντικαθίστανται ΜΟΝΟ τα τμήματα ίδιας τάξης+μαθήματος.
        </p>
      </div>

      {/* Filter */}
      {classes.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-400 font-semibold uppercase mb-1 block">Φίλτρο: Τάξη</label>
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm">
              <option value="">Όλες οι τάξεις</option>
              {GRADES.filter((g) => classes.some((c) => c.grade === g)).map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-400 font-semibold uppercase mb-1 block">Φίλτρο: Μάθημα</label>
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm">
              <option value="">Όλα τα μαθήματα</option>
              {allSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {(filterGrade || filterSubject) && (
            <button onClick={() => { setFilterGrade(""); setFilterSubject(""); }}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              ✕ Καθαρισμός
            </button>
          )}
        </div>
      )}

      {/* List */}
      <div className="grid gap-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-8 text-center text-zinc-500">
            {classes.length === 0
              ? "Δεν υπάρχουν τμήματα. Χρησιμοποίησε τη Γρήγορη Δημιουργία."
              : "Δεν υπάρχουν τμήματα με αυτά τα φίλτρα."}
          </div>
        ) : (
          GRADES.filter((g) => grouped[g]).map((grade) => (
            <div key={grade} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide mb-3">
                {grade} <span className="text-zinc-500 text-xs">({Object.values(grouped[grade]).flat().length} τμήματα)</span>
              </h3>

              {Object.keys(grouped[grade]).sort().map((subject) => (
                <div key={subject} className="mb-4 last:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`px-2 py-1 rounded text-xs font-bold ${subject === "(Χωρίς μάθημα)" ? "bg-amber-500/20 text-amber-400" : "bg-violet-500/20 text-violet-300"}`}>
                      📚 {subject}
                    </div>
                    <span className="text-xs text-zinc-500">({grouped[grade][subject].length} τμήματα)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {grouped[grade][subject].map((c) => {
                      const load = getSectionLoad(c.name, c.subject, students, c.maxStudents);
                      const barColor = load.isOverloaded ? "bg-rose-500" : load.isFull ? "bg-amber-500" : load.percent > 75 ? "bg-amber-400" : "bg-emerald-500";
                      const textColor = load.isOverloaded ? "text-rose-400" : load.isFull ? "text-amber-400" : "text-emerald-400";

                      return (
                        <div key={c.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-bold text-white text-base">{c.name}</span>
                              {c.subject && <span className="text-xs text-zinc-500 ml-2">- {c.subject}</span>}
                            </div>
                            <button onClick={() => handleDelete(c.id)}
                              className="text-rose-400 hover:text-rose-300 text-xs">🗑</button>
                          </div>

                          {!c.subject && (
                            <div className="mb-2">
                              <select value={c.subject || ""} onChange={(e) => updateSubject(c.id, e.target.value)}
                                className="w-full bg-zinc-900 border border-amber-500/50 rounded px-2 py-1 text-white text-xs">
                                <option value="">⚠ Όρισε μάθημα...</option>
                                {coursesAll.map((co: any) => {
                                  const name = typeof co === "string" ? co : co.name;
                                  return <option key={name} value={name}>{name}</option>;
                                })}
                              </select>
                            </div>
                          )}

                          <div className="mb-1.5">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className={`font-bold ${textColor}`}>
                                {load.current}/{c.maxStudents || 0} μαθητές
                                {load.isFull && !load.isOverloaded && " ⚠ ΓΕΜΑΤΟ"}
                                {load.isOverloaded && " ❌ ΥΠΕΡΒΑΣΗ"}
                              </span>
                              <span className="text-zinc-500">{load.percent}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full ${barColor} transition-all`} style={{ width: `${Math.min(100, load.percent)}%` }} />
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-zinc-400 mt-2">
                            <span>👥 Max:</span>
                            <input type="number" min={1} max={50}
                              value={c.maxStudents || 8}
                              onChange={(e) => updateCapacity(c.id, parseInt(e.target.value) || 0)}
                              className="w-14 bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-white text-xs" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
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
