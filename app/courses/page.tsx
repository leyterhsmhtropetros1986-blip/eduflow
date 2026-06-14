"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { BookOpen, Plus, Trash2, Edit3, X, AlertTriangle, Check, Clock } from "lucide-react";

interface Lesson {
  id: string;
  name: string;
  weeklyHours: number;            // ώρες/εβδομάδα
  distribution: number[];          // π.χ. [2,1] = 2ωρο + μονόωρο
  minGapDays?: number;             // ελάχιστο διάστημα μεταξύ ωρών
  maxHoursPerDay?: number;
  classesByGrade: Record<string, string[]>;  // ΝΕΟ: { "Α Γυμνασίου": ["clsId1","clsId2"], "Γ Λυκείου": [...] }
}
interface ClassItem { id: string; name: string; grade: string; }

const GRADES = ["Α Γυμνασίου","Β Γυμνασίου","Γ Γυμνασίου","Α Λυκείου","Β Λυκείου","Γ Λυκείου"];
const EMPTY: Lesson = { id: "", name: "", weeklyHours: 2, distribution: [2], minGapDays: 1, maxHoursPerDay: 2, classesByGrade: {} };

export default function CoursesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [form, setForm] = useState<Lesson>(EMPTY);

  useEffect(() => {
    setIsMounted(true);
    const stored = JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]");
    // Migration: παλιά μαθήματα ως strings ή χωρίς classesByGrade
    const migrated: Lesson[] = stored.map((l: any) => {
      if (typeof l === "string") return { ...EMPTY, id: "l-" + l, name: l };
      return { ...EMPTY, ...l, classesByGrade: l.classesByGrade || {} };
    });
    setLessons(migrated);

    const rawClasses = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    setClasses(rawClasses.map((c: any) => typeof c === "string" ? { id: "id-" + c, name: c, grade: "" } : { id: c.id, name: c.name || "", grade: c.grade || "" }));
  }, []);

  const save = (next: Lesson[]) => { setLessons(next); localStorage.setItem("eduflow_lessons", JSON.stringify(next)); };
  const reset = () => { setForm(EMPTY); setEditing(null); };

  const submit = () => {
    if (!form.name.trim()) { alert("Συμπλήρωσε όνομα μαθήματος."); return; }
    const total = Object.values(form.classesByGrade).reduce((acc, arr) => acc + arr.length, 0);
    if (total === 0) { alert("Επίλεξε τουλάχιστον ένα τμήμα από οποιαδήποτε τάξη (υποχρεωτικό)."); return; }
    if (form.weeklyHours <= 0) { alert("Οι ώρες/εβδομάδα πρέπει να είναι >0."); return; }
    if (!form.distribution.length || form.distribution.reduce((a, b) => a + b, 0) !== form.weeklyHours) {
      alert(`Η διανομή πρέπει να αθροίζει στις ${form.weeklyHours} ώρες.`); return;
    }
    if (editing) save(lessons.map((l) => l.id === editing.id ? { ...form, id: editing.id } : l));
    else save([...lessons, { ...form, id: "l-" + Date.now() }]);
    reset();
  };

  const remove = (id: string) => { if (confirm("Διαγραφή μαθήματος;")) save(lessons.filter((l) => l.id !== id)); };
  const startEdit = (l: Lesson) => { setEditing(l); setForm({ ...EMPTY, ...l, classesByGrade: l.classesByGrade || {} }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Toggle επιλογής τμήματος
  const toggleClass = (grade: string, cid: string) => {
    setForm((f) => {
      const cur = f.classesByGrade[grade] || [];
      const next = cur.includes(cid) ? cur.filter((x) => x !== cid) : [...cur, cid];
      const updated = { ...f.classesByGrade };
      if (next.length === 0) delete updated[grade];
      else updated[grade] = next;
      return { ...f, classesByGrade: updated };
    });
  };

  // "Επιλογή όλων" σε μια τάξη
  const selectAllInGrade = (grade: string) => {
    const all = classes.filter((c) => c.grade === grade).map((c) => c.id);
    setForm((f) => ({ ...f, classesByGrade: { ...f.classesByGrade, [grade]: all } }));
  };
  const clearGrade = (grade: string) => {
    setForm((f) => { const upd = { ...f.classesByGrade }; delete upd[grade]; return { ...f, classesByGrade: upd }; });
  };

  // Διανομή ωρών — γρήγορες επιλογές
  const setDistribution = (parts: number[]) => setForm({ ...form, distribution: parts, weeklyHours: parts.reduce((a, b) => a + b, 0) });
  const distributionPresets = [
    { label: "1ω/εβδ", parts: [1] },
    { label: "2ω/εβδ (μαζί)", parts: [2] },
    { label: "2ω (1+1)", parts: [1, 1] },
    { label: "3ω (2+1)", parts: [2, 1] },
    { label: "3ω (1+1+1)", parts: [1, 1, 1] },
    { label: "4ω (2+2)", parts: [2, 2] },
  ];

  const classesByGradeMap = useMemo(() => {
    const g: Record<string, ClassItem[]> = {};
    GRADES.forEach((grade) => { g[grade] = classes.filter((c) => c.grade === grade); });
    return g;
  }, [classes]);

  const labelOf = (cid: string) => { const c = classes.find((x) => x.id === cid); return c ? c.name : "?"; };

  const orphan = classes.filter((c) => !c.grade);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Μαθήματα" description="Όρισε ώρες, διανομή, και τα τμήματα όπου διδάσκεται κάθε μάθημα.">

      {orphan.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 text-xs text-amber-300">
          ⚠ {orphan.length} τμήμα{orphan.length > 1 ? "τα" : ""} χωρίς τάξη: <b>{orphan.map((c) => c.name).join(", ")}</b>. Πρώτα διόρθωσέ τα στη σελίδα <a href="/classes" className="underline">Τμήματα</a> για να μπουν στις σωστές κατηγορίες εδώ.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ΦΟΡΜΑ */}
        <div className="lg:col-span-3 bg-[#1e2330] border border-slate-800 p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 tracking-wider"><Plus size={14} /> {editing ? "Επεξεργασία" : "Νέο Μάθημα"}</h3>
            {editing && <button onClick={reset} className="text-slate-500 hover:text-rose-400"><X size={14} /></button>}
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Όνομα Μαθήματος *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="π.χ. Μαθηματικά" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
          </div>

          {/* ΩΡΕΣ + ΔΙΑΝΟΜΗ */}
          <div className="bg-[#0b0e14] rounded-xl p-3 border border-slate-800">
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1"><Clock size={11} /> Ώρες & Διανομή *</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {distributionPresets.map((p) => {
                const active = JSON.stringify(form.distribution) === JSON.stringify(p.parts);
                return <button key={p.label} type="button" onClick={() => setDistribution(p.parts)} className={`text-[10px] py-1.5 px-2 rounded-lg font-bold ${active ? "bg-indigo-600 text-white" : "bg-[#1e2330] text-slate-400 hover:bg-slate-800"}`}>{p.label}</button>;
              })}
            </div>
            <p className="text-[10px] text-slate-500">Τρέχουσα: <span className="text-white font-bold">{form.weeklyHours} ώρες/εβδομάδα</span> ({form.distribution.join("+")})</p>
          </div>

          {/* ΤΜΗΜΑΤΑ ΑΝΑ ΤΑΞΗ */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Σε ποια τμήματα διδάσκεται; * (διάλεξε από κάθε τάξη)</label>
            <div className="space-y-2">
              {GRADES.map((grade) => {
                const list = classesByGradeMap[grade];
                const selected = form.classesByGrade[grade] || [];
                if (list.length === 0) return null;
                const allSelected = list.length > 0 && selected.length === list.length;
                return (
                  <div key={grade} className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-indigo-400">{grade}</p>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => allSelected ? clearGrade(grade) : selectAllInGrade(grade)} className="text-[9px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/40">
                          {allSelected ? "Καθαρισμός" : "Όλα"}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {list.map((c) => {
                        const on = selected.includes(c.id);
                        return (
                          <button key={c.id} type="button" onClick={() => toggleClass(grade, c.id)}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold border transition ${on ? "bg-indigo-600 text-white border-indigo-500" : "bg-[#1e2330] text-slate-300 border-slate-700 hover:border-slate-500"}`}>
                            <div className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 ${on ? "bg-white border-white" : "border-slate-500"}`}>
                              {on && <Check size={9} className="text-indigo-600" />}
                            </div>
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {GRADES.every((g) => classesByGradeMap[g].length === 0) && (
                <p className="text-xs text-slate-500 text-center py-6">Δεν υπάρχουν τμήματα σε καμία τάξη. Πήγαινε στη σελίδα <a href="/classes" className="text-indigo-400 underline">Τμήματα</a> για να δημιουργήσεις.</p>
              )}
            </div>
          </div>

          <button onClick={submit} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold">{editing ? "Αποθήκευση" : "+ Προσθήκη"}</button>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Μαθήματα ({lessons.length})</h3>
          {lessons.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">Δεν υπάρχουν μαθήματα.</div>
          ) : lessons.map((l) => {
            const total = Object.values(l.classesByGrade || {}).reduce((acc, arr) => acc + arr.length, 0);
            return (
              <div key={l.id} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-indigo-950/50 border border-indigo-900/40 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen size={14} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{l.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">⏰ {l.weeklyHours}ω/εβδ ({l.distribution.join("+")}) · {total} τμή{total > 1 ? "ματα" : "μα"}</p>
                    {l.classesByGrade && Object.keys(l.classesByGrade).length > 0 && (
                      <div className="mt-2 space-y-1">
                        {Object.entries(l.classesByGrade).map(([grade, ids]) => (
                          <div key={grade} className="text-[10px]">
                            <span className="text-indigo-400 font-bold">{grade}:</span>{" "}
                            <span className="text-slate-300">{ids.map(labelOf).join(", ")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {total === 0 && <p className="text-[10px] text-amber-400 mt-1">⚠ Χωρίς τμήματα</p>}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => startEdit(l)} className="text-slate-500 hover:text-indigo-400 p-1"><Edit3 size={12} /></button>
                    <button onClick={() => remove(l.id)} className="text-slate-500 hover:text-rose-400 p-1"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </WorkspaceShell>
  );
}
