"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Users, Plus, Trash2, Edit3, X, Search, Check, Lock } from "lucide-react";
import { AvailabilityMatrix } from "../../components/AvailabilityMatrix";

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  subject: string;
  assignedClasses: string[];      // ΝΕΟ: array από class IDs
  isLockedClass?: boolean;        // Αν True, ο scheduler δένει στα συγκεκριμένα τμήματα
  isLockedHours?: boolean;
  lockedSlots?: any[];
  availability?: any[];
}

interface ClassItem { id: string; name: string; grade: string; maxStudents?: number; }

const EMPTY: Teacher = { id: "", firstName: "", lastName: "", phone: "", email: "", subject: "", assignedClasses: [], isLockedClass: false, isLockedHours: false, lockedSlots: [], availability: [] };

export default function TeachersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [lessons, setLessons] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState<Teacher>(EMPTY);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    // Migration: παλιά teachers με assignedClassId → assignedClasses []
    const migrated: Teacher[] = stored.map((t: any) => ({
      ...EMPTY,
      ...t,
      assignedClasses: t.assignedClasses ? t.assignedClasses : (t.assignedClassId ? [t.assignedClassId] : []),
    }));
    setTeachers(migrated);

    // Φόρτωσε τμήματα (νέα δομή με grade)
    const rawClasses = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    const normalized: ClassItem[] = rawClasses.map((c: any) => typeof c === "string" ? { id: "id-" + c, name: c, grade: "" } : { id: c.id || "id-" + c.name, name: c.name || "", grade: c.grade || "" });
    setClasses(normalized);

    const lRaw = JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]");
    setLessons(lRaw.map((l: any) => typeof l === "string" ? l : l?.name).filter(Boolean));
  }, []);

  const save = (next: Teacher[]) => { setTeachers(next); localStorage.setItem("eduflow_teachers", JSON.stringify(next)); };
  const reset = () => { setForm(EMPTY); setEditing(null); setClassDropdownOpen(false); };

  const submit = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) { alert("Όνομα και Επώνυμο υποχρεωτικά."); return; }
    if (editing) save(teachers.map((t) => t.id === editing.id ? { ...form, id: editing.id } : t));
    else save([...teachers, { ...form, id: "t-" + Date.now() }]);
    reset();
  };

  const remove = (id: string) => { if (confirm("Διαγραφή καθηγητή;")) save(teachers.filter((t) => t.id !== id)); };
  const startEdit = (t: Teacher) => { setEditing(t); setForm({ ...EMPTY, ...t }); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Toggle επιλογής τμήματος
  const toggleClass = (cid: string) => {
    setForm((f) => ({
      ...f,
      assignedClasses: f.assignedClasses.includes(cid) ? f.assignedClasses.filter((x) => x !== cid) : [...f.assignedClasses, cid],
    }));
  };

  // Ομαδοποίηση τμημάτων ανά τάξη για το dropdown
  const classesByGrade = useMemo(() => {
    const groups: Record<string, ClassItem[]> = {};
    classes.forEach((c) => { const g = c.grade || "— Χωρίς τάξη —"; if (!groups[g]) groups[g] = []; groups[g].push(c); });
    return groups;
  }, [classes]);

  const labelOf = (cid: string) => { const c = classes.find((x) => x.id === cid); return c ? `${c.name}${c.grade ? " — " + c.grade : ""}` : "?"; };

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return teachers.filter((t) => !q || `${t.firstName} ${t.lastName} ${t.subject} ${t.email}`.toLowerCase().includes(q))
      .sort((a, b) => (a.lastName || "").localeCompare(b.lastName || "", "el"));
  }, [teachers, search]);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Καθηγητές" description="Στοιχεία, μάθημα διδασκαλίας, και τμήματα προτίμησης (πολλαπλή επιλογή).">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-5 rounded-3xl h-fit lg:sticky lg:top-28 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 tracking-wider"><Plus size={14} /> {editing ? "Επεξεργασία" : "Νέος Καθηγητής"}</h3>
            {editing && <button onClick={reset} className="text-slate-500 hover:text-rose-400"><X size={14} /></button>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Επώνυμο *" className="bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Όνομα *" className="bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
          </div>

          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Τηλέφωνο" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />

          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            <option value="">Μάθημα διδασκαλίας</option>
            {lessons.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>

          {/* MULTI-SELECT ΤΜΗΜΑΤΩΝ */}
          <div className="relative">
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Τμήματα προτίμησης (πολλαπλή επιλογή, προαιρ.)</label>
            <button type="button" onClick={() => setClassDropdownOpen((v) => !v)} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 text-left flex items-center justify-between">
              <span className={form.assignedClasses.length === 0 ? "text-slate-500" : ""}>
                {form.assignedClasses.length === 0 ? "— Κανένα (όλα τα τμήματα διαθέσιμα) —" : `${form.assignedClasses.length} τμή${form.assignedClasses.length > 1 ? "ματα" : "μα"}`}
              </span>
              <span className="text-slate-500">{classDropdownOpen ? "▴" : "▾"}</span>
            </button>

            {classDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0b0e14] border border-slate-700 rounded-xl shadow-2xl max-h-72 overflow-y-auto z-30">
                {Object.keys(classesByGrade).length === 0 ? (
                  <p className="p-4 text-xs text-slate-500 text-center">Δεν υπάρχουν τμήματα. Φτιάξε στη σελίδα Τμήματα.</p>
                ) : (
                  Object.entries(classesByGrade).map(([grade, list]) => (
                    <div key={grade} className="border-b border-slate-800 last:border-0">
                      <p className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 ${grade.includes("Χωρίς") ? "text-amber-400" : "text-indigo-400"} bg-[#1a1f2c]`}>{grade}</p>
                      {list.map((c) => (
                        <button key={c.id} type="button" onClick={() => toggleClass(c.id)} className="w-full text-left px-3 py-2 hover:bg-[#1e2330] flex items-center gap-2 transition">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${form.assignedClasses.includes(c.id) ? "bg-indigo-600 border-indigo-500" : "border-slate-600"}`}>
                            {form.assignedClasses.includes(c.id) && <Check size={11} className="text-white" />}
                          </div>
                          <span className="text-xs text-white">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  ))
                )}
                {form.assignedClasses.length > 0 && (
                  <div className="border-t border-slate-800 p-2 bg-[#1a1f2c]">
                    <button type="button" onClick={() => setForm({ ...form, assignedClasses: [] })} className="text-[10px] text-rose-400 hover:text-rose-300">✕ Καθαρισμός επιλογών</button>
                  </div>
                )}
              </div>
            )}

            {/* Tag chips για επιλεγμένα */}
            {form.assignedClasses.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.assignedClasses.map((cid) => (
                  <span key={cid} className="bg-indigo-950/40 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-900/40 flex items-center gap-1">
                    {labelOf(cid)}
                    <button type="button" onClick={() => toggleClass(cid)} className="hover:text-rose-400">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input type="checkbox" checked={!!form.isLockedClass} onChange={(e) => setForm({ ...form, isLockedClass: e.target.checked })} disabled={form.assignedClasses.length === 0} className="accent-indigo-500" />
            <Lock size={12} /> Δένω σε αυτά τα τμήματα (ο scheduler δεν θα τον βάζει σε άλλα)
          </label>

          {/* AVAILABILITY MATRIX */}
          <div className="border-t border-slate-800 pt-3">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer mb-2">
              <input type="checkbox" checked={!!form.isLockedHours} onChange={(e) => setForm({ ...form, isLockedHours: e.target.checked })} className="accent-indigo-500" />
              <Lock size={12} /> Έχει σταθερές ώρες διαθεσιμότητας
            </label>
            {form.isLockedHours && (
              <AvailabilityMatrix value={form.availability || []} onChange={(av: any) => setForm({ ...form, availability: av })} />
            )}
          </div>

          <button onClick={submit} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold">{editing ? "Αποθήκευση" : "+ Προσθήκη"}</button>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-3 flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Αναζήτηση καθηγητή..." className="w-full bg-[#0b0e14] border border-slate-800 p-2 pl-9 rounded-lg text-xs text-white outline-none focus:border-indigo-500" />
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">{teachers.length === 0 ? "Δεν υπάρχουν καθηγητές. Πρόσθεσε τον πρώτο." : "Καμία αντιστοιχία."}</div>
          ) : visible.map((t) => (
            <div key={t.id} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-950/50 border border-indigo-900/40 rounded-xl flex items-center justify-center shrink-0">
                <Users size={16} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-bold text-sm">{t.lastName} {t.firstName}</p>
                  {t.subject && <span className="text-[10px] bg-indigo-950/50 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/30">{t.subject}</span>}
                  {t.isLockedClass && <span className="text-[10px] bg-amber-950/40 text-amber-400 px-2 py-0.5 rounded">🔒 δεμένος</span>}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">📞 {t.phone || "—"} {t.email && `· ✉ ${t.email}`}</p>
                {t.assignedClasses && t.assignedClasses.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.assignedClasses.map((cid) => (
                      <span key={cid} className="bg-[#0b0e14] text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">{labelOf(cid)}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(t)} className="text-slate-500 hover:text-indigo-400 p-2"><Edit3 size={14} /></button>
                <button onClick={() => remove(t.id)} className="text-slate-500 hover:text-rose-400 p-2"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}
