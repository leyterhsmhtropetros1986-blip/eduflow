"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { AvailabilityMatrix } from "../../components/AvailabilityMatrix";
import { Trash2, Edit2, UserPlus, Plus, X, GraduationCap, AlertTriangle, BookOpen, Layers, Search, Download, Upload, FileSpreadsheet, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

interface AvailabilitySlot { day: string; start: string; end: string; }
interface StudentEnrollment { lessonName: string; className: string; }

interface Student {
  id: string;
  createdAt?: string;
  firstName: string;
  lastName: string;
  grade: string;
  phone: string;
  parentFirstName: string;
  parentLastName: string;
  parentName: string;            // computed: parentFirstName + " " + parentLastName (backward compat)
  parentPhone: string;
  parentEmail: string;
  enrollments: StudentEnrollment[];
  isLockedHours: boolean;
  lockedSlots: AvailabilitySlot[];
  availability: AvailabilitySlot[];
}

interface ClassItem { id?: string; name: string; maxStudents: number; grade: string; }

const GRADES = ["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"];

declare global { interface Window { XLSX: any; } }

export default function StudentsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [lessonsList, setLessonsList] = useState<string[]>([]);
  const [toast, setToast] = useState<string>("");

  // States Φόρμας
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [grade, setGrade] = useState("");
  const [phone, setPhone] = useState("");
  const [parentFirstName, setParentFirstName] = useState("");
  const [parentLastName, setParentLastName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [formEnrollments, setFormEnrollments] = useState<StudentEnrollment[]>([]);
  const [isLockedHours, setIsLockedHours] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<AvailabilitySlot[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  // States Λίστας
  const [listSearch, setListSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");

  // States Import/Export
  const [importOpen, setImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [xlsxReady, setXlsxReady] = useState(false);

  const flashToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const getAvailableTimes = (day: string) => {
    if (day === "Σάββατο") return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    return ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  };

  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({ day: "Δευτέρα", start: "14:00", end: "15:00" });

  useEffect(() => {
    setIsMounted(true); loadData();
    // Load SheetJS
    if (!(window as any).XLSX) {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      s.onload = () => setXlsxReady(true);
      document.head.appendChild(s);
    } else setXlsxReady(true);
  }, []);

  const loadData = () => {
    if (typeof window === "undefined") return;
    const rawStudents = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const rawClasses = JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]");
    const rawLessonsData = JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]");

    const rawLessons: string[] = (rawLessonsData as any[])
      .map((l) => (typeof l === "string" ? l : (l?.name || l?.title || l?.subject || "")))
      .filter(Boolean);

    const normalizedClasses = rawClasses.map((c: any) => ({
      id: c.id || `class-${Date.now()}-${Math.random()}`,
      name: c.name || c.className || "",
      grade: c.grade || "",
      maxStudents: Number(c.maxStudents) || Number(c.maxCapacity) || Number(c.capacity) || 20
    })).filter((c: ClassItem) => c.name !== "");

    // Migration: split parentName -> parentFirstName + parentLastName
    const migratedStudents = rawStudents.map((s: any) => {
      const pfn = s.parentFirstName ?? "";
      const pln = s.parentLastName ?? "";
      // αν δεν υπάρχουν τα νέα πεδία αλλά υπάρχει το παλιό parentName, βάλε όλο στο parentLastName
      const computed = (!pfn && !pln && s.parentName) ? { pfn: "", pln: s.parentName } : { pfn, pln };
      return {
        ...s,
        parentFirstName: computed.pfn,
        parentLastName: computed.pln,
        parentName: `${computed.pfn} ${computed.pln}`.trim() || s.parentName || "",
        enrollments: s.enrollments || []
      };
    });

    setStudents(migratedStudents);
    setClassesList(normalizedClasses);
    setLessonsList(rawLessons);
  };

  const filteredSections = useMemo(() => {
    if (!grade) return [];
    return classesList.filter(sec => sec.grade === grade);
  }, [classesList, grade]);

  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach(s => {
      if (s.id === editingId) return;
      s.enrollments?.forEach(e => {
        const key = `${e.lessonName}_${e.className}`;
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return counts;
  }, [students, editingId]);

  const addSlot = () => {
    if (parseInt(newSlot.end) <= parseInt(newSlot.start)) { alert("Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης."); return; }
    setLockedSlots([...lockedSlots, newSlot]);
    setNewSlot({ day: newSlot.day, start: getAvailableTimes(newSlot.day)[0], end: getAvailableTimes(newSlot.day)[1] || "15:00" });
  };

  const handleFormEnrollmentChange = (lessonName: string, className: string) => {
    const filtered = formEnrollments.filter(e => e.lessonName !== lessonName);
    if (className === "") setFormEnrollments(filtered);
    else { setFormEnrollments([...filtered, { lessonName, className }]); flashToast(`✓ Καταχωρήθηκε: ${lessonName} → ${className}`); }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && students.some(s =>
      s.firstName.trim().toLowerCase() === firstName.trim().toLowerCase() &&
      s.lastName.trim().toLowerCase() === lastName.trim().toLowerCase())) {
      if (!confirm("Υπάρχει ήδη μαθητής με το ίδιο ονοματεπώνυμο. Συνέχεια;")) return;
    }
    if (formEnrollments.length === 0 && !confirm("Ο μαθητής δεν έχει καμία εγγραφή σε μάθημα. Αποθήκευση;")) return;

    const existing = editingId ? students.find(s => s.id === editingId) : null;
    const pfn = parentFirstName.trim();
    const pln = parentLastName.trim();
    const studentData: Student = {
      id: editingId || `s-${Date.now()}`,
      createdAt: existing?.createdAt || new Date().toISOString(),
      firstName: firstName.trim(), lastName: lastName.trim(), grade,
      phone: phone.trim(),
      parentFirstName: pfn, parentLastName: pln,
      parentName: `${pfn} ${pln}`.trim(),
      parentPhone: parentPhone.trim(), parentEmail: parentEmail.trim(),
      enrollments: formEnrollments, isLockedHours,
      lockedSlots: isLockedHours ? lockedSlots : [], availability
    };

    const updated = editingId ? students.map(s => s.id === editingId ? studentData : s) : [...students, studentData];
    setStudents(updated);
    localStorage.setItem("eduflow_students", JSON.stringify(updated));
    flashToast(editingId ? "✓ Ενημερώθηκε" : "✓ Καταχωρήθηκε");
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null); setFirstName(""); setLastName(""); setGrade(""); setPhone("");
    setParentFirstName(""); setParentLastName(""); setParentPhone(""); setParentEmail("");
    setFormEnrollments([]); setIsLockedHours(false); setLockedSlots([]); setAvailability([]);
  };

  const startEdit = (s: Student) => {
    setEditingId(s.id);
    setFirstName(s.firstName || ""); setLastName(s.lastName || ""); setGrade(s.grade || "");
    setPhone(s.phone || "");
    setParentFirstName(s.parentFirstName || ""); setParentLastName(s.parentLastName || (s.parentName || ""));
    setParentPhone(s.parentPhone || ""); setParentEmail(s.parentEmail || "");
    setFormEnrollments(s.enrollments || []);
    setIsLockedHours(s.isLockedHours || false); setLockedSlots(s.lockedSlots || []); setAvailability(s.availability || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteStudent = (s: Student) => {
    if (!confirm(`Οριστική διαγραφή του μαθητή ${s.lastName} ${s.firstName};`)) return;
    const updated = students.filter(x => x.id !== s.id);
    setStudents(updated);
    localStorage.setItem("eduflow_students", JSON.stringify(updated));
    if (editingId === s.id) resetForm();
    flashToast("✓ Διαγράφηκε");
  };

  // ========= IMPORT EXCEL =========
  const downloadTemplate = () => {
    if (!window.XLSX) return;
    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();
    const headers = ["Επώνυμο Μαθητή*", "Όνομα Μαθητή*", "Τάξη*", "Τηλέφωνο Μαθητή", "Όνομα Γονέα", "Επώνυμο Γονέα", "Τηλέφωνο Γονέα", "Email Γονέα", "Μαθήματα", "Τμήματα"];
    const examples = [
      ["Παπαδόπουλος", "Γιάννης", "Α Γυμνασίου", "", "Νίκος", "Παπαδόπουλος", "6900000001", "nikos@example.com", "Μαθηματικά, Φυσική", "Α1, Α1"],
      ["Δημητρίου", "Μαρία", "Β Λυκείου", "6940000002", "Ελένη", "Δημητρίου", "6900000002", "eleni@example.com", "Μαθηματικά", "Β2"],
      ["Γεωργίου", "Πέτρος", "Γ Λυκείου", "", "", "", "", "", "", ""],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...examples]);
    ws["!cols"] = [{ wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 24 }, { wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, "Μαθητές");

    const instr = [
      ["EduFlow — Πρότυπο εισαγωγής μαθητών"], [""],
      ["ΟΔΗΓΙΕΣ:"],
      ["1. ΥΠΟΧΡΕΩΤΙΚΑ: Επώνυμο Μαθητή, Όνομα Μαθητή, Τάξη."],
      ["2. ΑΠΟΔΕΚΤΕΣ ΤΑΞΕΙΣ (ακριβώς όπως φαίνεται):"],
      ["   - Α Γυμνασίου / Β Γυμνασίου / Γ Γυμνασίου"],
      ["   - Α Λυκείου / Β Λυκείου / Γ Λυκείου"],
      ["3. Όνομα Γονέα & Επώνυμο Γονέα: χωριστά πεδία."],
      ["4. Μαθήματα & Τμήματα: χωρίστε με κόμμα και με την ίδια σειρά."],
      ["   π.χ. «Μαθηματικά, Φυσική» / «Α1, Α2» = Μαθηματικά→Α1, Φυσική→Α2"],
      ["5. Σβήστε τις 3 παραδείγματος γραμμές πριν το ανέβασμα!"],
      ["6. Διπλοεγγραφές (ίδιο όνομα+επώνυμο+τάξη) θα παραλειφθούν."],
    ];
    const wsI = XLSX.utils.aoa_to_sheet(instr);
    wsI["!cols"] = [{ wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsI, "Οδηγίες");

    XLSX.writeFile(wb, "EduFlow_Template_Μαθητές.xlsx");
    flashToast("✓ Template κατέβηκε");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !window.XLSX) return;
    setImportFileName(file.name);
    const r = new FileReader();
    r.onload = (ev) => {
      const data = new Uint8Array(ev.target!.result as ArrayBuffer);
      const wb = window.XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];
      if (raw.length < 2) { alert("Κενό αρχείο."); return; }

      const parsed: any[] = [];
      for (let i = 1; i < raw.length; i++) {
        const r = raw[i]; if (!r || r.every((c) => !c)) continue;
        const [lastName, firstName, grade, phone, parentFirstName, parentLastName, parentPhone, parentEmail, lessons, sections] = r.map((x) => String(x || "").trim());
        const errors: string[] = [];
        if (!lastName) errors.push("Λείπει Επώνυμο Μαθητή");
        if (!firstName) errors.push("Λείπει Όνομα Μαθητή");
        if (!grade) errors.push("Λείπει Τάξη");
        else if (!GRADES.includes(grade)) errors.push(`Άκυρη τάξη «${grade}»`);
        const dup = students.find((s) => s.lastName === lastName && s.firstName === firstName && s.grade === grade);
        if (dup) errors.push("Διπλοεγγραφή");
        const lessonList = lessons ? lessons.split(",").map((x) => x.trim()).filter(Boolean) : [];
        const sectionList = sections ? sections.split(",").map((x) => x.trim()).filter(Boolean) : [];
        if (lessonList.length !== sectionList.length && (lessonList.length > 0 || sectionList.length > 0)) errors.push(`Μαθήματα/Τμήματα δεν συμφωνούν`);
        const enrollments = lessonList.map((ln, idx) => ({ lessonName: ln, className: sectionList[idx] || "" }));
        parsed.push({ rowNum: i + 1, lastName, firstName, grade, phone, parentFirstName, parentLastName, parentPhone, parentEmail, enrollments, errors });
      }
      setImportPreview(parsed);
    };
    r.readAsArrayBuffer(file);
  };

  const importValid = () => {
    const valid = importPreview.filter((r) => r.errors.length === 0);
    if (valid.length === 0) { alert("Δεν υπάρχουν έγκυροι."); return; }
    if (!confirm(`Εισαγωγή ${valid.length} μαθητών;`)) return;
    const newOnes: Student[] = valid.map((r) => ({
      id: "s-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
      lastName: r.lastName, firstName: r.firstName, grade: r.grade,
      phone: r.phone || "",
      parentFirstName: r.parentFirstName || "", parentLastName: r.parentLastName || "",
      parentName: `${r.parentFirstName || ""} ${r.parentLastName || ""}`.trim(),
      parentPhone: r.parentPhone || "", parentEmail: r.parentEmail || "",
      enrollments: r.enrollments || [],
      isLockedHours: false, lockedSlots: [], availability: [],
    }));
    const merged = [...students, ...newOnes];
    setStudents(merged);
    localStorage.setItem("eduflow_students", JSON.stringify(merged));
    setImportPreview([]); setImportFileName("");
    flashToast(`✓ Προστέθηκαν ${newOnes.length} μαθητές`);
  };

  // ========= EXPORT EXCEL =========
  const exportExcel = () => {
    if (!window.XLSX) { alert("Περίμενε φόρτωση..."); return; }
    if (students.length === 0) { alert("Δεν υπάρχουν μαθητές."); return; }
    const XLSX = window.XLSX;
    const headers = ["Επώνυμο", "Όνομα", "Τάξη", "Τηλέφωνο", "Όνομα Γονέα", "Επώνυμο Γονέα", "Τηλέφωνο Γονέα", "Email Γονέα", "Μαθήματα", "Τμήματα", "Ημ/νία Εγγραφής"];
    const rows = students.map((s) => [
      s.lastName, s.firstName, s.grade, s.phone || "",
      s.parentFirstName || "", s.parentLastName || "",
      s.parentPhone || "", s.parentEmail || "",
      (s.enrollments || []).map((e) => e.lessonName).join(", "),
      (s.enrollments || []).map((e) => e.className).join(", "),
      s.createdAt ? new Date(s.createdAt).toLocaleDateString("el-GR") : "",
    ]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = headers.map((_, i) => ({ wch: i === 7 ? 26 : i === 8 ? 28 : 16 }));
    XLSX.utils.book_append_sheet(wb, ws, "Μαθητές");
    XLSX.writeFile(wb, `EduFlow_Μαθητές_${new Date().toISOString().slice(0, 10)}.xlsx`);
    flashToast("✓ Excel κατέβηκε");
  };

  const gradeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    students.forEach(s => { m[s.grade] = (m[s.grade] || 0) + 1; });
    return m;
  }, [students]);

  const visibleStudents = useMemo(() => {
    const q = listSearch.toLowerCase().trim();
    return [...students]
      .sort((a, b) => (a.lastName || "").localeCompare(b.lastName || "", "el"))
      .filter(s => {
        if (gradeFilter && s.grade !== gradeFilter) return false;
        if (!q) return true;
        return `${s.lastName} ${s.firstName}`.toLowerCase().includes(q) ||
          (s.parentName || "").toLowerCase().includes(q) ||
          (s.phone || "").includes(q) ||
          (s.parentPhone || "").includes(q);
      });
  }, [students, listSearch, gradeFilter]);

  if (!isMounted) return null;

  const validImport = importPreview.filter((r) => r.errors.length === 0).length;
  const errImport = importPreview.filter((r) => r.errors.length > 0).length;

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών" description="Εγγραφές ανά μάθημα, εισαγωγή από Excel, εξαγωγή.">

      {/* IMPORT/EXPORT BAR */}
      <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-3 mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setImportOpen(v => !v)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
          <FileSpreadsheet size={14} /> Εισαγωγή από Excel {importOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        <button onClick={exportExcel} disabled={!xlsxReady || students.length === 0} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
          <Download size={14} /> Εξαγωγή σε Excel ({students.length})
        </button>
      </div>

      {/* COLLAPSIBLE IMPORT */}
      {importOpen && (
        <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <button onClick={downloadTemplate} disabled={!xlsxReady} className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
              <Download size={14} /> 1️⃣ Κατέβασμα Template (.xlsx)
            </button>
            <label className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer">
              <Upload size={14} /> 2️⃣ Ανέβασμα γεμάτου Excel
              <input type="file" accept=".xlsx,.xls" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
          {importFileName && <p className="text-[11px] text-slate-400 mb-3">📂 {importFileName}</p>}

          {importPreview.length > 0 && (
            <>
              <div className="flex gap-2 mb-3 flex-wrap">
                <div className="bg-emerald-950/40 border border-emerald-900/40 rounded-lg px-3 py-1.5"><span className="text-emerald-400 font-black text-base">{validImport}</span> <span className="text-[10px] text-slate-400 uppercase">έγκυροι</span></div>
                <div className="bg-rose-950/40 border border-rose-900/40 rounded-lg px-3 py-1.5"><span className="text-rose-400 font-black text-base">{errImport}</span> <span className="text-[10px] text-slate-400 uppercase">με σφάλματα</span></div>
                <button onClick={importValid} disabled={validImport === 0} className="ml-auto bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold">→ Εισαγωγή {validImport} έγκυρων</button>
              </div>

              {errImport > 0 && (
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-3 mb-3 max-h-48 overflow-y-auto">
                  <p className="text-rose-300 font-bold text-xs mb-2">⚠ Σφάλματα:</p>
                  {importPreview.filter(r => r.errors.length > 0).map((r) => (
                    <div key={r.rowNum} className="text-[11px] text-slate-300 mb-1">
                      <span className="text-white font-bold">Γρ. {r.rowNum}:</span> {r.lastName} {r.firstName} — <span className="text-rose-400">{r.errors.join(", ")}</span>
                    </div>
                  ))}
                </div>
              )}

              {validImport > 0 && (
                <div className="max-h-60 overflow-y-auto bg-[#0b0e14] rounded-lg border border-slate-800 p-2">
                  <p className="text-emerald-300 text-xs font-bold mb-2">✓ Έγκυροι ({validImport}):</p>
                  {importPreview.filter(r => r.errors.length === 0).map((r) => (
                    <div key={r.rowNum} className="text-[11px] text-slate-300 mb-1">
                      <span className="text-white font-bold">{r.lastName} {r.firstName}</span> · {r.grade} · {r.parentLastName} {r.parentFirstName}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 📝 ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit shadow-xl lg:sticky lg:top-28">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-800 pb-3 tracking-wider">
              <UserPlus size={14} /> {editingId ? "Επεξεργασία Μαθητή" : "Νέα Εγγραφή"}
            </h4>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Επώνυμο Μαθητή *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
                <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Όνομα Μαθητή *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
              </div>

              <select required value={grade} onChange={e => { setGrade(e.target.value); setFormEnrollments([]); if (e.target.value) flashToast(`✓ Επιλέχθηκε: ${e.target.value}`); }} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 outline-none transition-all cursor-pointer">
                <option value="">Επιλέξτε Τάξη *</option>
                {GRADES.map((g, i) => <option key={i} value={g}>{g}</option>)}
              </select>

              <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Τηλέφωνο Μαθητή *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />

              <div className="border-t border-slate-800/60 pt-2 space-y-2">
                <p className="text-[10px] uppercase text-indigo-400 font-bold tracking-wider">Στοιχεία Γονέα</p>
                <div className="grid grid-cols-2 gap-2">
                  <input required type="text" value={parentLastName} onChange={e => setParentLastName(e.target.value)} placeholder="Επώνυμο Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
                  <input required type="text" value={parentFirstName} onChange={e => setParentFirstName(e.target.value)} placeholder="Όνομα Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input required type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="Τηλ. Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
                  <input required type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="Email Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold border-b border-slate-900 pb-1 flex items-center gap-1">
                <Layers size={12} /> Εγγραφές σε Τμήματα ({grade || "επίλεξε τάξη"})
              </p>

              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {!grade ? (
                  <p className="text-slate-500 text-[11px] italic text-center py-4">Επιλέξτε πρώτα Τάξη.</p>
                ) : lessonsList.length === 0 ? (
                  <p className="text-amber-500/80 text-[11px] text-center py-4 flex items-center justify-center gap-1"><AlertTriangle size={12} /> Δεν υπάρχουν μαθήματα.</p>
                ) : (
                  lessonsList.map((lesson, idx) => {
                    const currentSelection = formEnrollments.find(e => e.lessonName === lesson)?.className || "";
                    return (
                      <div key={idx} className="p-2.5 bg-[#1e2330]/40 border border-slate-800/70 rounded-xl space-y-1.5">
                        <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"><BookOpen size={12} className="text-indigo-500" /> {lesson}</span>
                        <select value={currentSelection} onChange={e => handleFormEnrollmentChange(lesson, e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded-lg text-xs text-white outline-none focus:border-indigo-500 cursor-pointer">
                          <option value="">-- Χωρίς εγγραφή --</option>
                          {filteredSections.length === 0 ? (
                            <option value="" disabled>⚠️ Κανένα τμήμα στην {grade}</option>
                          ) : filteredSections.map((sec, sIdx) => {
                            const maxCap = sec.maxStudents || 20;
                            const currentStudents = sectionCounts[`${lesson}_${sec.name}`] || 0;
                            const isFull = currentStudents >= maxCap && currentSelection !== sec.name;
                            return <option key={sIdx} value={sec.name} disabled={isFull}>{sec.name} — ({currentStudents}/{maxCap}) {isFull ? "🔒" : ""}</option>;
                          })}
                        </select>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <AvailabilityMatrix availability={availability} onChange={setAvailability} />

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input type="checkbox" checked={isLockedHours} onChange={e => setIsLockedHours(e.target.checked)} className="accent-rose-500" /> Κλείδωμα ωρών διαθεσιμότητας
              </label>
            </div>

            {isLockedHours && (
              <div className="bg-[#0b0e14] p-4 rounded-xl border border-rose-500/20 space-y-3">
                <div className="grid grid-cols-4 gap-1">
                  <select className="bg-[#1e2330] p-1.5 text-[10px] text-white rounded col-span-2 border border-slate-800" value={newSlot.day} onChange={e => { const d = e.target.value; setNewSlot({ day: d, start: getAvailableTimes(d)[0], end: getAvailableTimes(d)[1] || "15:00" }); }}>
                    {["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].map(d => <option key={d}>{d}</option>)}
                  </select>
                  <select className="bg-[#1e2330] p-1.5 text-[10px] text-white rounded border border-slate-800" value={newSlot.start} onChange={e => setNewSlot({ ...newSlot, start: e.target.value })}>{getAvailableTimes(newSlot.day).map(t => <option key={t}>{t}</option>)}</select>
                  <select className="bg-[#1e2330] p-1.5 text-[10px] text-white rounded border border-slate-800" value={newSlot.end} onChange={e => setNewSlot({ ...newSlot, end: e.target.value })}>{getAvailableTimes(newSlot.day).map(t => <option key={t}>{t}</option>)}</select>
                </div>
                <button type="button" onClick={addSlot} className="w-full bg-rose-600/90 hover:bg-rose-600 py-1.5 rounded text-white text-[11px] font-semibold flex justify-center items-center gap-1"><Plus size={12} /> Προσθήκη</button>
                <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                  {lockedSlots.map((s, i) => (
                    <div key={i} className="text-[10px] text-slate-300 bg-[#1e2330] p-2 rounded flex justify-between items-center border border-slate-800">
                      <span>{s.day.substring(0, 3)}: {s.start} έως {s.end}</span>
                      <X size={12} className="cursor-pointer text-rose-500 hover:text-rose-400" onClick={() => setLockedSlots(lockedSlots.filter((_, idx) => idx !== i))} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {editingId && <button type="button" onClick={resetForm} className="w-1/3 p-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700">Ακύρωση</button>}
              <button type="submit" className={`p-3 rounded-xl text-white font-bold text-xs transition-colors shadow-lg ${editingId ? 'w-2/3 bg-emerald-600 hover:bg-emerald-500' : 'w-full bg-indigo-600 hover:bg-indigo-500'}`}>
                {editingId ? "Ενημέρωση" : "Αποθήκευση Μαθητή"}
              </button>
            </div>
          </form>
        </div>

        {/* 🔍 ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-xl h-fit">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-800 pb-2 flex justify-between items-center">
            <span>Μαθητολόγιο</span>
            <span className="bg-[#0b0e14] px-2 py-0.5 rounded-full text-indigo-400 font-extrabold">{students.length}</span>
          </h3>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Αναζήτηση..." className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 pl-9 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none" />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <button onClick={() => setGradeFilter("")} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${gradeFilter === "" ? "bg-indigo-600 text-white border-indigo-500" : "bg-[#0b0e14] text-slate-400 border-slate-800 hover:text-white"}`}>Όλες ({students.length})</button>
            {GRADES.filter(g => gradeCounts[g]).map(g => (
              <button key={g} onClick={() => setGradeFilter(g)} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${gradeFilter === g ? "bg-indigo-600 text-white border-indigo-500" : "bg-[#0b0e14] text-slate-400 border-slate-800 hover:text-white"}`}>{g} ({gradeCounts[g]})</button>
            ))}
          </div>

          {visibleStudents.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2">
              <AlertTriangle size={22} className="text-slate-700" />
              <span>{students.length === 0 ? "Δεν υπάρχουν μαθητές." : "Κανένα αποτέλεσμα."}</span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
              {visibleStudents.map(s => (
                <div key={s.id} className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800/80 border-l-4 border-l-indigo-500 flex flex-col gap-2 hover:border-slate-700 transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-white text-xs font-bold uppercase tracking-wide">{s.lastName} {s.firstName}</p>
                      <div className="flex flex-wrap gap-2 text-[10px] mt-1.5 items-center">
                        <span className="text-indigo-400 font-bold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30 flex items-center gap-1"><GraduationCap size={10} /> {s.grade}</span>
                        <span className="text-sky-400 font-medium bg-sky-950/30 px-1.5 py-0.5 rounded border border-sky-500/10">📚 {s.enrollments?.length || 0} εγγραφές</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startEdit(s)} className="text-slate-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-900"><Edit2 size={12} /></button>
                      <button onClick={() => deleteStudent(s)} className="text-slate-600 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-900"><Trash2 size={12} /></button>
                    </div>
                  </div>

                  {s.enrollments && s.enrollments.length > 0 && (
                    <div className="py-2 px-3 bg-[#1e2330]/50 border border-slate-800/60 rounded-xl space-y-1 mt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {s.enrollments.map((enroll, eIdx) => (
                          <div key={eIdx} className="text-[11px] text-slate-300 flex items-center gap-1 bg-[#0b0e14]/60 p-1.5 rounded border border-slate-800/40">
                            <span className="text-slate-400 font-medium truncate">{enroll.lessonName}</span>
                            <span className="text-indigo-400 font-bold">→</span>
                            <span className="text-indigo-400 font-extrabold bg-indigo-950/50 px-1.5 rounded">{enroll.className}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-900/60 text-slate-400 text-[10px] space-y-0.5">
                    <p>📞 {s.phone || "-"}</p>
                    <p>👨‍👩‍👦 {s.parentLastName || ""} {s.parentFirstName || ""} <span className="font-mono">({s.parentPhone || "-"})</span></p>
                    <p className="truncate">📧 {s.parentEmail || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 z-50">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </WorkspaceShell>
  );
}
