"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { BookOpen, Plus, Trash2, Edit3, X, AlertTriangle, Wand2, Search } from "lucide-react";

interface ClassItem { id: string; name: string; grade: string; maxStudents?: number; }

const GRADES = ["Α Γυμνασίου","Β Γυμνασίου","Γ Γυμνασίου","Α Λυκείου","Β Λυκείου","Γ Λυκείου"];

// Σύντομη ετικέτα τάξης (για auto-suggest ονόματος)
const SHORT: Record<string, string> = {
  "Α Γυμνασίου": "Α",
  "Β Γυμνασίου": "Β",
  "Γ Γυμνασίου": "Γ",
  "Α Λυκείου": "Α",
  "Β Λυκείου": "Β",
  "Γ Λυκείου": "Γ",
};

export default function ClassesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [form, setForm] = useState<ClassItem>({ id: "", name: "", grade: "", maxStudents: undefined });

  useEffect(() => {
    setIsMounted(true);
    const stored = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    // Παλιά τμήματα μπορεί να είναι strings (π.χ. ["Α1", "Β2"]) — τα μετατρέπουμε
    const normalized: ClassItem[] = stored.map((c: any) => {
      if (typeof c === "string") return { id: "id-" + c + "-" + Math.random(), name: c, grade: "" };
      return { id: c.id || ("id-" + Date.now() + Math.random()), name: c.name || "", grade: c.grade || "", maxStudents: c.maxStudents };
    });
    setClasses(normalized);
  }, []);

  const save = (next: ClassItem[]) => { setClasses(next); localStorage.setItem("eduflow_classes", JSON.stringify(next)); };
  const reset = () => { setForm({ id: "", name: "", grade: "", maxStudents: undefined }); setEditing(null); };

  // Auto-suggest επόμενο όνομα τμήματος (π.χ. αν έχεις Α1, Α2 → πρότεινε Α3)
  const nextNameFor = (grade: string): string => {
    if (!grade) return "";
    const short = SHORT[grade] || "X";
    const sameGrade = classes.filter((c) => c.grade === grade);
    const used = sameGrade.map((c) => c.name).filter((n) => n.startsWith(short));
    let i = 1;
    while (used.includes(`${short}${i}`)) i++;
    return `${short}${i}`;
  };

  const handleGradeChange = (grade: string) => {
    // Όταν αλλάζει τάξη, αυτόματα προτείνει νέο όνομα (αν είναι κενό ή ίδιο με προηγούμενο suggestion)
    const suggested = nextNameFor(grade);
    setForm((f) => ({
      ...f,
      grade,
      name: (!f.name || /^[ΑΒΓ]\d+$/.test(f.name)) ? suggested : f.name,
    }));
  };

  const submit = () => {
    if (!form.name.trim()) { alert("Συμπλήρωσε όνομα τμήματος."); return; }
    if (!form.grade) { alert("Επίλεξε τάξη (υποχρεωτικό)."); return; }
    // Duplicate guard
    const dup = classes.find((c) => c.id !== editing?.id && c.grade === form.grade && c.name.toLowerCase() === form.name.toLowerCase().trim());
    if (dup) { alert(`Υπάρχει ήδη τμήμα «${form.name}» στην τάξη ${form.grade}.`); return; }
    const cleanName = form.name.trim();
    if (editing) save(classes.map((c) => c.id === editing.id ? { ...form, id: editing.id, name: cleanName } : c));
    else save([...classes, { ...form, id: "cls-" + Date.now(), name: cleanName }]);
    reset();
  };

  const remove = (id: string) => { if (confirm("Διαγραφή τμήματος;")) save(classes.filter((c) => c.id !== id)); };
  const startEdit = (c: ClassItem) => { setEditing(c); setForm(c); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // QUICK ADD: Δημιουργία πολλαπλών τμημάτων μαζί (π.χ. Α1-Α6 σε Α Γυμνασίου με ένα κλικ)
  const [bulkGrade, setBulkGrade] = useState("");
  const [bulkCount, setBulkCount] = useState(3);
  const bulkAdd = () => {
    if (!bulkGrade) { alert("Επίλεξε τάξη."); return; }
    const short = SHORT[bulkGrade];
    const existing = new Set(classes.filter((c) => c.grade === bulkGrade).map((c) => c.name));
    const newOnes: ClassItem[] = [];
    let i = 1, added = 0;
    while (added < bulkCount && i < 100) {
      const name = `${short}${i}`;
      if (!existing.has(name)) { newOnes.push({ id: "cls-" + Date.now() + i, name, grade: bulkGrade }); added++; }
      i++;
    }
    if (newOnes.length === 0) { alert("Δεν υπάρχουν διαθέσιμα ονόματα."); return; }
    save([...classes, ...newOnes]);
    alert(`Δημιουργήθηκαν: ${newOnes.map((n) => n.name).join(", ")} στην ${bulkGrade}`);
  };

  // Παλιά τμήματα χωρίς τάξη (warning)
  const orphans = useMemo(() => classes.filter((c) => !c.grade), [classes]);

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return classes.filter((c) => {
      if (filterGrade && c.grade !== filterGrade) return false;
      if (!q) return true;
      return (c.name + " " + c.grade).toLowerCase().includes(q);
    }).sort((a, b) => (a.grade || "ω").localeCompare(b.grade || "ω", "el") || a.name.localeCompare(b.name, "el"));
  }, [classes, search, filterGrade]);

  // Group by grade για εμφάνιση
  const byGrade = useMemo(() => {
    const groups: Record<string, ClassItem[]> = {};
    visible.forEach((c) => { const g = c.grade || "— Χωρίς τάξη —"; if (!groups[g]) groups[g] = []; groups[g].push(c); });
    return groups;
  }, [visible]);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Τμήματα" description="Όρισε μία φορά τα τμήματά σου εδώ. Παντού αλλού θα επιλέγονται από dropdown — όχι πια typos.">

      {/* WARNING για παλιά τμήματα */}
      {orphans.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-900/50 flex items-start gap-3">
          <AlertTriangle size={24} className="text-amber-400 shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-amber-300 font-bold text-sm">⚠ {orphans.length} τμήμα{orphans.length > 1 ? "τα" : ""} χωρίς τάξη</h3>
            <p className="text-xs text-amber-400/80 mt-1">Για να δουλέψουν σωστά με μαθητές/καθηγητές, πάτα ✏️ και όρισε τάξη: <span className="font-bold">{orphans.map((o) => o.name).join(", ")}</span></p>
          </div>
        </div>
      )}

      {/* QUICK BULK ADD */}
      <div className="mb-6 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl p-4">
        <h3 className="text-indigo-300 font-bold text-xs uppercase mb-3 flex items-center gap-2 tracking-wider"><Wand2 size={14} /> Γρήγορη δημιουργία</h3>
        <div className="flex gap-2 items-end flex-wrap">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Τάξη</label>
            <select value={bulkGrade} onChange={(e) => setBulkGrade(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded-lg text-xs text-white outline-none">
              <option value="">—</option>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Αριθμός τμημάτων</label>
            <input type="number" min={1} max={20} value={bulkCount} onChange={(e) => setBulkCount(+e.target.value || 1)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded-lg text-xs text-white outline-none w-24" />
          </div>
          <button onClick={bulkAdd} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold">+ Δημιουργία ({bulkGrade && `${SHORT[bulkGrade]}1...${SHORT[bulkGrade]}${bulkCount}`})</button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2">π.χ. «Α Γυμνασίου» + 6 → δημιουργεί Α1, Α2, Α3, Α4, Α5, Α6</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-5 rounded-3xl h-fit lg:sticky lg:top-28 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 tracking-wider"><Plus size={14} /> {editing ? "Επεξεργασία" : "Νέο Τμήμα"}</h3>
            {editing && <button onClick={reset} className="text-slate-500 hover:text-rose-400"><X size={14} /></button>}
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Τάξη * (υποχρεωτικό)</label>
            <select value={form.grade} onChange={(e) => handleGradeChange(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="">— Επίλεξε —</option>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Όνομα Τμήματος *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={form.grade ? `π.χ. ${SHORT[form.grade]}1` : "Πρώτα επίλεξε τάξη"} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
            {form.grade && <p className="text-[10px] text-slate-500 mt-1">💡 Προτεινόμενο: {nextNameFor(form.grade)}</p>}
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Μέγιστος αριθμός μαθητών (προαιρ.)</label>
            <input type="number" min={1} max={50} value={form.maxStudents ?? ""} onChange={(e) => setForm({ ...form, maxStudents: e.target.value ? +e.target.value : undefined })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
          </div>

          <button onClick={submit} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold">{editing ? "Αποθήκευση" : "+ Προσθήκη"}</button>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-3 flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Αναζήτηση..." className="w-full bg-[#0b0e14] border border-slate-800 p-2 pl-9 rounded-lg text-xs text-white outline-none focus:border-indigo-500" />
            </div>
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded-lg text-xs text-white outline-none">
              <option value="">Όλες οι τάξεις</option>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">{classes.length === 0 ? "Δεν υπάρχουν τμήματα. Δοκίμασε τη Γρήγορη Δημιουργία πάνω." : "Καμία αντιστοιχία."}</div>
          ) : (
            Object.entries(byGrade).map(([grade, list]) => (
              <div key={grade} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4">
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-slate-800 ${grade.includes("Χωρίς") ? "text-amber-400" : "text-indigo-400"}`}>{grade} <span className="text-slate-500 text-[10px] font-normal">· {list.length} τμή{list.length > 1 ? "ματα" : "μα"}</span></h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {list.map((c) => (
                    <div key={c.id} className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3 flex items-center gap-2">
                      <BookOpen size={14} className="text-indigo-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{c.name}</p>
                        {c.maxStudents && <p className="text-[10px] text-slate-500">max {c.maxStudents}</p>}
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        <button onClick={() => startEdit(c)} className="text-slate-500 hover:text-indigo-400 p-1"><Edit3 size={12} /></button>
                        <button onClick={() => remove(c.id)} className="text-slate-500 hover:text-rose-400 p-1"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
