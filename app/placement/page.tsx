"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Users, GraduationCap, Search, Filter, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Student { id: string; firstName: string; lastName: string; grade: string; enrollments?: { lessonName: string; className: string }[]; }
interface ClassItem { id: string; name: string; grade: string; maxStudents?: number; }

export default function PlacementPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [lessons, setLessons] = useState<string[]>([]);
  const [selectedLesson, setSelectedLesson] = useState("");
  const [search, setSearch] = useState("");
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
    setClasses(JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]"));
    const lessonsRaw = JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]");
    setLessons(lessonsRaw.map((l: any) => typeof l === "string" ? l : l?.name).filter(Boolean));
  }, []);

  // Auto-select πρώτο μάθημα
  useEffect(() => { if (lessons.length && !selectedLesson) setSelectedLesson(lessons[0]); }, [lessons, selectedLesson]);

  const saveStudents = (next: Student[]) => { setStudents(next); localStorage.setItem("eduflow_students", JSON.stringify(next)); };

  // ΜΑΘΗΤΕΣ που έχουν εγγραφή στο τρέχον μάθημα
  const eligibleStudents = useMemo(() => {
    if (!selectedLesson) return [];
    const q = search.toLowerCase().trim();
    return students.filter((s) =>
      (s.enrollments || []).some((e) => e.lessonName === selectedLesson) &&
      (!q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q))
    );
  }, [students, selectedLesson, search]);

  // Σε ποιο τμήμα είναι κάθε μαθητής για αυτό το μάθημα
  const classOf = (s: Student): string => {
    const enr = (s.enrollments || []).find((e) => e.lessonName === selectedLesson);
    return enr?.className || "";
  };

  // Μη τοποθετημένοι (έχουν εγγραφή στο μάθημα, αλλά className άδειο)
  const unplaced = useMemo(() => eligibleStudents.filter((s) => !classOf(s)), [eligibleStudents, selectedLesson]);
  const placed = (clsName: string) => eligibleStudents.filter((s) => classOf(s) === clsName);

  // Τμήματα της τρέχουσας τάξης που έχει το επιλεγμένο μάθημα
  const relevantClasses = useMemo(() => {
    if (!selectedLesson) return [];
    // Όλες οι τάξεις (grades) που έχουν μαθητές με αυτό το μάθημα
    const grades = new Set<string>();
    eligibleStudents.forEach((s) => grades.add(s.grade));
    
    const filtered = classes.filter((c) => grades.has(c.grade));
    
    // TEMPORARY FIX: Deduplicate by name to prevent showing multiple Γ1, Γ2, Γ3
    // TODO: Proper fix requires adding subject field to class data model
    const seen = new Set<string>();
    const deduped = filtered.filter((c) => {
      const key = `${c.grade}-${c.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    return deduped;
  }, [classes, selectedLesson, eligibleStudents]);

  // Drag & Drop handlers
  const onDragStart = (id: string) => setDraggedStudentId(id);
  const onDragEnd = () => { setDraggedStudentId(null); setDropTarget(null); };
  const onDragOver = (e: React.DragEvent, target: string) => { e.preventDefault(); setDropTarget(target); };
  const onDragLeave = () => setDropTarget(null);

  const placeStudent = (studentId: string, className: string) => {
    const next = students.map((s) => {
      if (s.id !== studentId) return s;
      const enr = [...(s.enrollments || [])];
      const i = enr.findIndex((e) => e.lessonName === selectedLesson);
      if (i >= 0) enr[i] = { ...enr[i], className };
      else enr.push({ lessonName: selectedLesson, className });
      return { ...s, enrollments: enr };
    });
    saveStudents(next);
  };

  const onDrop = (e: React.DragEvent, className: string) => {
    e.preventDefault();
    if (draggedStudentId) placeStudent(draggedStudentId, className);
    setDraggedStudentId(null); setDropTarget(null);
  };

  // Quick assign — κουμπί αντί για drag
  const quickAssign = (sid: string, cls: string) => placeStudent(sid, cls);
  const removePlacement = (sid: string) => placeStudent(sid, "");

  // KPIs
  const totalElig = eligibleStudents.length;
  const totalPlaced = eligibleStudents.filter((s) => classOf(s)).length;

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Τοποθέτηση Μαθητών σε Τμήματα" description="Σύρε μαθητές στο τμήμα τους — ή πάτα Quick Assign για γρήγορη ανάθεση.">

      {/* CONTROLS */}
      <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Μάθημα</label>
          <select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
            {lessons.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Αναζήτηση Μαθητή</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Όνομα ή επώνυμο..." className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
        </div>
        <div className="bg-[#0b0e14] rounded-xl p-2.5 flex items-center justify-around">
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-400">{totalPlaced}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold">τοποθετημένοι</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-amber-400">{totalElig - totalPlaced}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold">εκκρεμούν</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-white">{totalElig}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold">σύνολο</p>
          </div>
        </div>
      </div>

      {!selectedLesson ? <div className="text-center py-16 text-slate-500 text-sm">Δεν υπάρχουν μαθήματα.</div> : eligibleStudents.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">Δεν υπάρχουν μαθητές εγγεγραμμένοι στο «{selectedLesson}». Πρώτα κάνε εγγραφή στη σελίδα Μαθητές.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* UNPLACED COLUMN */}
          <div onDragOver={(e) => onDragOver(e, "__unplaced")} onDragLeave={onDragLeave} onDrop={(e) => onDrop(e, "")}
            className={`bg-[#1e2330] border-2 rounded-2xl p-4 ${dropTarget === "__unplaced" ? "border-amber-500" : "border-dashed border-amber-900/50"} min-h-[400px]`}>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h3 className="text-amber-400 font-bold text-xs uppercase flex items-center gap-1.5"><AlertTriangle size={12} /> Χωρίς Τμήμα</h3>
              <span className="bg-amber-950/40 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{unplaced.length}</span>
            </div>
            {unplaced.length === 0 ? <p className="text-emerald-400 text-xs text-center py-8 flex flex-col items-center gap-2"><CheckCircle2 size={28} /> Όλοι έχουν τμήμα!</p> :
              <div className="space-y-1.5">
                {unplaced.map((s) => (
                  <div key={s.id} draggable onDragStart={() => onDragStart(s.id)} onDragEnd={onDragEnd}
                    className={`bg-[#0b0e14] border border-slate-800 rounded-lg p-2.5 cursor-grab active:cursor-grabbing ${draggedStudentId === s.id ? "opacity-40" : ""}`}>
                    <p className="text-white font-bold text-xs">{s.lastName} {s.firstName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.grade}</p>
                    {/* Quick assign dropdown */}
                    <select onChange={(e) => { if (e.target.value) quickAssign(s.id, e.target.value); }} value="" className="w-full mt-1.5 bg-[#1e2330] border border-slate-700 rounded text-[10px] text-indigo-400 py-1 px-1 outline-none">
                      <option value="">→ Σε τμήμα...</option>
                      {relevantClasses.filter((c) => c.grade === s.grade).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            }
          </div>

          {/* CLASSES COLUMNS */}
          {relevantClasses.length === 0 ? (
            <div className="lg:col-span-3 bg-[#1e2330] border border-dashed border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-sm">
              Δεν υπάρχουν τμήματα για τις τάξεις των μαθητών αυτού του μαθήματος. Πρώτα δημιούργησε τμήματα.
            </div>
          ) : (
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relevantClasses.map((cls) => {
                const inClass = placed(cls.name);
                const overCap = cls.maxStudents && inClass.length > cls.maxStudents;
                return (
                  <div key={cls.id} onDragOver={(e) => onDragOver(e, cls.name)} onDragLeave={onDragLeave} onDrop={(e) => onDrop(e, cls.name)}
                    className={`bg-[#1e2330] border-2 rounded-2xl p-4 transition ${dropTarget === cls.name ? "border-indigo-500 bg-indigo-950/20" : "border-slate-800"} min-h-[200px]`}>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                      <div>
                        <p className="text-[9px] text-indigo-400 uppercase font-bold tracking-wider">{selectedLesson}</p>
                        <h3 className="text-white font-bold text-sm">{cls.name}</h3>
                        <p className="text-[10px] text-slate-500">{cls.grade}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${overCap ? "bg-rose-950/40 text-rose-400" : "bg-indigo-950/40 text-indigo-400"}`}>
                        {inClass.length}{cls.maxStudents ? `/${cls.maxStudents}` : ""}
                      </span>
                    </div>

                    {overCap && <div className="bg-rose-950/30 border border-rose-900/40 rounded-lg p-2 mb-2 text-[10px] text-rose-400 font-bold flex items-center gap-1.5"><AlertTriangle size={11} /> Υπέρβαση χωρητικότητας</div>}

                    {inClass.length === 0 ? <p className="text-slate-600 text-xs text-center py-6 italic">Σύρε μαθητές εδώ...</p> :
                      <div className="space-y-1.5">
                        {inClass.map((s) => (
                          <div key={s.id} draggable onDragStart={() => onDragStart(s.id)} onDragEnd={onDragEnd}
                            className={`bg-[#0b0e14] border border-slate-800 rounded-lg p-2 cursor-grab active:cursor-grabbing flex items-center gap-2 ${draggedStudentId === s.id ? "opacity-40" : ""}`}>
                            <GraduationCap size={12} className="text-indigo-400 shrink-0" />
                            <p className="text-white text-xs flex-1 truncate">{s.lastName} {s.firstName}</p>
                            <button onClick={() => removePlacement(s.id)} className="text-slate-600 hover:text-rose-400 text-[10px]">✕</button>
                          </div>
                        ))}
                      </div>
                    }
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl p-4 text-xs text-slate-300">
        💡 <b className="text-indigo-300">Tip:</b> Σύρε μαθητές μεταξύ στηλών για ν' αλλάξεις τμήμα. Στους «Χωρίς Τμήμα» έχεις και dropdown για γρήγορη ανάθεση. Το ❌ τους βγάζει πάλι σε εκκρεμή.
      </div>
    </WorkspaceShell>
  );
}
