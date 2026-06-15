"use client";

import { useEffect, useState } from "react";
import { AvailabilityMatrix } from "../../components/AvailabilityMatrix";
import * as XLSX from "xlsx";

type Slot = { day: string; start: string; end: string };
type Enrollment = { lessonName: string; className: string };

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  parentFirstName: string;
  parentLastName: string;
  parentName?: string;
  parentPhone: string;
  parentEmail?: string;
  studentPhone?: string;
  grade: string;
  enrollments?: Enrollment[];
  notes?: string;
  attendsSummer?: boolean;
  availability: Slot[];
};

type Course = { name: string; grade: string };
type ClassUnit = { id: string; name: string; grade: string };

// Parent entity (αυτόνομη βάση γονέων)
type Parent = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  studentIds: string[]; // πολλά παιδιά μπορούν να συνδέονται με έναν γονέα
};

const GRADES = [
  "Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου",
  "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου",
];

const RANDOM_CLASS = "__RANDOM__"; // ειδικός τίτλος για «τυχαία κατανομή»

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassUnit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const [form, setForm] = useState<Partial<Student>>({
    firstName: "", lastName: "",
    parentFirstName: "", parentLastName: "",
    parentPhone: "", parentEmail: "", studentPhone: "",
    grade: "Α Γυμνασίου",
    enrollments: [],
    notes: "",
    attendsSummer: false,
    availability: [],
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    // Students
    const storedS = localStorage.getItem("eduflow_students");
    if (storedS) {
      try {
        const parsed = JSON.parse(storedS);
        const migrated = parsed.map((s: any) => ({
          ...s,
          grade: s.grade || s.category || "Α Γυμνασίου",
          parentLastName: s.parentLastName || (s.parentName ? s.parentName.split(/\s+/)[0] : ""),
          parentFirstName: s.parentFirstName || (s.parentName ? s.parentName.split(/\s+/).slice(1).join(" ") : ""),
        }));
        setStudents(migrated);
      } catch {}
    }

    // Courses
    const storedC = localStorage.getItem("eduflow_courses") || localStorage.getItem("eduflow_lessons");
    if (storedC) {
      try {
        const parsed = JSON.parse(storedC);
        const normalized = parsed.map((c: any) => {
          if (typeof c === "string") return { name: c, grade: "" };
          return { name: c.name || "", grade: c.grade || c.category || "" };
        }).filter((c: Course) => c.name);
        setCourses(normalized);
      } catch {}
    }

    // Classes
    const storedCls = localStorage.getItem("eduflow_classes");
    if (storedCls) {
      try {
        const parsed = JSON.parse(storedCls);
        const normalized = parsed.map((c: any) => ({
          id: c.id, name: c.name, grade: c.grade || c.category || "",
        }));
        setClasses(normalized);
      } catch {}
    }
  }, []);

  // === Sync με βάση γονέων ===
  const syncParentsDB = (savedStudent: Student) => {
    const parentsRaw = localStorage.getItem("eduflow_parents");
    let parents: Parent[] = [];
    try { parents = parentsRaw ? JSON.parse(parentsRaw) : []; } catch {}

    // Ψάχνω αν υπάρχει ήδη γονέας με ίδιο τηλέφωνο
    let parent = parents.find((p) => p.phone === savedStudent.parentPhone && p.phone);
    if (parent) {
      // Update γονέα και προσθήκη μαθητή
      parent.firstName = savedStudent.parentFirstName || parent.firstName;
      parent.lastName = savedStudent.parentLastName || parent.lastName;
      parent.email = savedStudent.parentEmail || parent.email;
      if (!parent.studentIds.includes(savedStudent.id)) {
        parent.studentIds = [...parent.studentIds, savedStudent.id];
      }
    } else {
      // Νέος γονέας
      parent = {
        id: `parent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        firstName: savedStudent.parentFirstName,
        lastName: savedStudent.parentLastName,
        phone: savedStudent.parentPhone,
        email: savedStudent.parentEmail,
        studentIds: [savedStudent.id],
      };
      parents.push(parent);
    }
    localStorage.setItem("eduflow_parents", JSON.stringify(parents));
  };

  const persist = (list: Student[]) => {
    const withParentName = list.map((s) => ({
      ...s,
      parentName: [s.parentLastName, s.parentFirstName].filter(Boolean).join(" "),
    }));
    setStudents(withParentName);
    localStorage.setItem("eduflow_students", JSON.stringify(withParentName));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const resetForm = () => {
    setForm({
      firstName: "", lastName: "",
      parentFirstName: "", parentLastName: "",
      parentPhone: "", parentEmail: "", studentPhone: "",
      grade: "Α Γυμνασίου",
      enrollments: [], notes: "",
      attendsSummer: false,
      availability: [],
    });
    setErrors({});
    setEditingId(null);
  };

  // === Validation πιο αυστηρό ===
  const validate = (): boolean => {
    const e: { [k: string]: string } = {};
    if (!form.firstName?.trim()) e.firstName = "Υποχρεωτικό";
    if (!form.lastName?.trim()) e.lastName = "Υποχρεωτικό";
    if (!form.grade) e.grade = "Υποχρεωτική τάξη";

    // ⭐ ΝΕΟ: στοιχεία γονέα ΥΠΟΧΡΕΩΤΙΚΑ
    if (!form.parentLastName?.trim()) e.parentLastName = "Υποχρεωτικό";
    if (!form.parentFirstName?.trim()) e.parentFirstName = "Υποχρεωτικό";
    if (!form.parentPhone?.trim()) e.parentPhone = "Υποχρεωτικό τηλέφωνο γονέα";
    else if (!/^[0-9+\s-]{8,}$/.test(form.parentPhone.trim())) e.parentPhone = "Μη έγκυρο τηλέφωνο";

    // ⭐ ΝΕΟ: τμήμα ΥΠΟΧΡΕΩΤΙΚΟ ανά μάθημα (ή «τυχαία κατανομή»)
    const missingClass = (form.enrollments || []).find((en) => !en.className);
    if (missingClass) {
      e.enrollments = `Επίλεξε τμήμα για «${missingClass.lessonName}» (ή «Τυχαία κατανομή»)`;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Όταν className == RANDOM_CLASS → κρατάμε σαν "" για να το βρει το placement
    const cleanEnrollments = (form.enrollments || []).map((en) =>
      en.className === RANDOM_CLASS ? { ...en, className: "" } : en
    );

    const student: Student = {
      id: editingId || Date.now().toString(),
      firstName: form.firstName!.trim(),
      lastName: form.lastName!.trim(),
      parentFirstName: form.parentFirstName!.trim(),
      parentLastName: form.parentLastName!.trim(),
      parentPhone: form.parentPhone!.trim(),
      parentEmail: form.parentEmail?.trim(),
      studentPhone: form.studentPhone?.trim(),
      grade: form.grade!,
      enrollments: cleanEnrollments,
      notes: form.notes || "",
      attendsSummer: form.attendsSummer || false,
      availability: form.availability || [],
    };

    const updated = editingId
      ? students.map((s) => (s.id === editingId ? student : s))
      : [...students, student];
    persist(updated);

    // ⭐ ΝΕΟ: Sync με βάση γονέων
    syncParentsDB(student);

    showToast(editingId ? "✓ Ενημερώθηκε + βάση γονέων" : "✓ Καταχωρήθηκε + βάση γονέων");
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (s: Student) => {
    setForm({
      ...s,
      availability: s.availability || [],
      enrollments: s.enrollments || [],
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Διαγραφή μαθητή;")) return;
    persist(students.filter((s) => s.id !== id));
    showToast("🗑 Διαγράφηκε");
  };

  const toggleEnrollment = (lessonName: string) => {
    const current = form.enrollments || [];
    const existing = current.find((e) => e.lessonName === lessonName);
    if (existing) {
      setForm({ ...form, enrollments: current.filter((e) => e.lessonName !== lessonName) });
    } else {
      setForm({ ...form, enrollments: [...current, { lessonName, className: "" }] });
    }
  };

  const setClassForLesson = (lessonName: string, className: string) => {
    const current = form.enrollments || [];
    setForm({
      ...form,
      enrollments: current.map((e) =>
        e.lessonName === lessonName ? { ...e, className } : e
      ),
    });
  };

  const availableSubjects = courses.filter((c) => c.grade === form.grade);
  const availableClasses = classes.filter((c) => c.grade === form.grade);

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      (s.parentName || "").toLowerCase().includes(q) ||
      (s.grade || "").toLowerCase().includes(q) ||
      (s.studentPhone || "").includes(q) ||
      (s.parentPhone || "").includes(q)
    );
  });

  // === Excel template & import (ΔΙΟΡΘΩΜΕΝΗ ΣΕΙΡΑ: Όνομα ΠΡΩΤΟ, Επώνυμο μετά) ===
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Όνομα *", "Επώνυμο *", "Τάξη *", "Όνομα Γονέα *", "Επώνυμο Γονέα *", "Τηλ. Γονέα *", "Email Γονέα", "Τηλ. Μαθητή", "Καλοκαιρινό (Y/N)", "Μαθήματα (κόμμα)", "Σημειώσεις"],
      ["Γιώργος", "Παπαδόπουλος", "Γ Λυκείου", "Νίκος", "Παπαδόπουλος", "6970000000", "nick@example.com", "6980000000", "Y", "Μαθηματικά,Φυσική", "Καλό παιδί"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Μαθητές");
    XLSX.writeFile(wb, "eduflow_students_template.xlsx");
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      const dataRows = rows.slice(1).filter((r: any) => r[0] && r[1]);
      const errs: string[] = [];
      // ⭐ ΣΩΣΤΗ ΣΕΙΡΑ: 0=Όνομα, 1=Επώνυμο, 2=Τάξη, 3=Όν.Γονέα, 4=Επ.Γονέα, 5=Τηλ.Γονέα ...
      const preview = dataRows.map((row: any, idx: number) => {
        const firstName = String(row[0] || "").trim();
        const lastName = String(row[1] || "").trim();
        const grade = String(row[2] || "").trim();
        const parentFirstName = String(row[3] || "").trim();
        const parentLastName = String(row[4] || "").trim();
        const parentPhone = String(row[5] || "").trim();
        if (!GRADES.includes(grade)) errs.push(`Γραμμή ${idx + 2}: άγνωστη τάξη "${grade}"`);
        if (!parentLastName || !parentFirstName) errs.push(`Γραμμή ${idx + 2}: λείπουν στοιχεία γονέα`);
        if (!parentPhone) errs.push(`Γραμμή ${idx + 2}: λείπει τηλέφωνο γονέα`);
        return {
          firstName, lastName, grade,
          parentFirstName, parentLastName, parentPhone,
          parentEmail: String(row[6] || "").trim(),
          studentPhone: String(row[7] || "").trim(),
          attendsSummer: String(row[8] || "").toUpperCase().startsWith("Y"),
          subjects: String(row[9] || "").split(",").map((x) => x.trim()).filter(Boolean),
          notes: String(row[10] || "").trim(),
        };
      });
      setImportPreview(preview);
      setImportErrors(errs);
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmImport = () => {
    const newStudents: Student[] = importPreview.map((r, i) => ({
      id: Date.now().toString() + i,
      firstName: r.firstName,
      lastName: r.lastName,
      grade: r.grade,
      parentFirstName: r.parentFirstName,
      parentLastName: r.parentLastName,
      parentPhone: r.parentPhone,
      parentEmail: r.parentEmail,
      studentPhone: r.studentPhone,
      attendsSummer: r.attendsSummer,
      enrollments: r.subjects.map((s: string) => ({ lessonName: s, className: "" })),
      notes: r.notes,
      availability: [],
    }));
    persist([...students, ...newStudents]);
    newStudents.forEach((s) => syncParentsDB(s)); // sync όλους τους γονείς
    showToast(`✓ Εισήχθησαν ${newStudents.length} μαθητές + βάση γονέων`);
    setImportPreview([]);
    setImportErrors([]);
    setShowImport(false);
  };

  const exportExcel = () => {
    const rows = students.map((s) => ({
      "Όνομα": s.firstName,
      "Επώνυμο": s.lastName,
      "Τάξη": s.grade,
      "Όνομα Γονέα": s.parentFirstName || "",
      "Επώνυμο Γονέα": s.parentLastName || "",
      "Τηλ. Γονέα": s.parentPhone || "",
      "Email Γονέα": s.parentEmail || "",
      "Τηλ. Μαθητή": s.studentPhone || "",
      "Καλοκαιρινό": s.attendsSummer ? "Y" : "N",
      "Μαθήματα": (s.enrollments || []).map((e) => `${e.lessonName}${e.className ? `(${e.className})` : "(τυχαία)"}`).join(", "),
      "Σημειώσεις": s.notes || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Μαθητές");
    XLSX.writeFile(wb, `eduflow_students_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast("📥 Εξήχθη Excel");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Μαθητές</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Στοιχεία μαθητή & <b className="text-amber-400">γονέα (υποχρεωτικά)</b>, μαθήματα και τμήμα.
          </p>
        </div>
        <div className="flex gap-2">
          {!showForm && (
            <>
              <button onClick={() => setShowImport(!showImport)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm">📥 Excel Import</button>
              <button onClick={exportExcel} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm">📤 Excel Export</button>
              <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold">+ Νέος Μαθητής</button>
            </>
          )}
        </div>
      </div>

      {showImport && !showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-indigo-400">📥 Εισαγωγή από Excel</h3>
            <button onClick={() => { setShowImport(false); setImportPreview([]); setImportErrors([]); }} className="text-zinc-400 hover:text-white text-sm">✕</button>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-3 mb-3 text-xs text-amber-300">
            📌 Σειρά στηλών: <b>Όνομα → Επώνυμο → Τάξη → Όνομα Γονέα → Επώνυμο Γονέα → Τηλ.Γονέα → Email → Τηλ.Μαθητή → Καλοκαιρινό → Μαθήματα → Σημειώσεις</b>
          </div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <button onClick={downloadTemplate} className="bg-emerald-600/20 border border-emerald-600/40 text-emerald-400 px-3 py-1.5 rounded-lg text-sm">⬇️ Λήψη Template</button>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files && handleImportFile(e.target.files[0])} className="text-sm text-zinc-400" />
          </div>
          {importPreview.length > 0 && (
            <div className="mt-3">
              <div className="text-sm text-zinc-400 mb-2">
                Προεπισκόπηση: <b className="text-white">{importPreview.length}</b> εγγραφές
                {importErrors.length > 0 && <span className="text-rose-400 ml-2">⚠ {importErrors.length} σφάλματα</span>}
              </div>
              {importErrors.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/40 rounded-lg p-3 mb-3 text-xs text-rose-300">
                  {importErrors.slice(0, 5).map((e, i) => <div key={i}>{e}</div>)}
                  {importErrors.length > 5 && <div>+ {importErrors.length - 5} περισσότερα</div>}
                </div>
              )}
              <button onClick={confirmImport} disabled={importErrors.length > 0}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                ✓ Επιβεβαίωση
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-indigo-400">
              {editingId ? "✏️ Επεξεργασία" : "+ Νέος Μαθητής"}
            </h2>
            <button onClick={() => { resetForm(); setShowForm(false); }} className="text-zinc-400 hover:text-white text-sm">✕ Κλείσιμο</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* ΟΝΟΜΑ πρώτο, μετά ΕΠΩΝΥΜΟ */}
            <div>
              <input type="text" placeholder="Όνομα *" value={form.firstName || ""}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.firstName ? "border-rose-500" : "border-zinc-700"}`} />
              {errors.firstName && <p className="text-xs text-rose-400 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <input type="text" placeholder="Επώνυμο *" value={form.lastName || ""}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.lastName ? "border-rose-500" : "border-zinc-700"}`} />
              {errors.lastName && <p className="text-xs text-rose-400 mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Τάξη *</label>
              <select value={form.grade}
                onChange={(e) => setForm({
                  ...form,
                  grade: e.target.value,
                  attendsSummer: e.target.value === "Γ Λυκείου" ? form.attendsSummer : false,
                  enrollments: [],
                })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white">
                {GRADES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input type="tel" placeholder="Τηλ. Μαθητή (προαιρ.)" value={form.studentPhone || ""}
              onChange={(e) => setForm({ ...form, studentPhone: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />

            <div className="md:col-span-2 mt-2 pt-3 border-t border-zinc-700">
              <h4 className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-2">
                👨‍👩 Στοιχεία Γονέα (υποχρεωτικά)
              </h4>
            </div>
            <div>
              <input type="text" placeholder="Όνομα Γονέα *" value={form.parentFirstName || ""}
                onChange={(e) => setForm({ ...form, parentFirstName: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.parentFirstName ? "border-rose-500" : "border-zinc-700"}`} />
              {errors.parentFirstName && <p className="text-xs text-rose-400 mt-1">{errors.parentFirstName}</p>}
            </div>
            <div>
              <input type="text" placeholder="Επώνυμο Γονέα *" value={form.parentLastName || ""}
                onChange={(e) => setForm({ ...form, parentLastName: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.parentLastName ? "border-rose-500" : "border-zinc-700"}`} />
              {errors.parentLastName && <p className="text-xs text-rose-400 mt-1">{errors.parentLastName}</p>}
            </div>
            <div>
              <input type="tel" placeholder="Τηλ. Γονέα *" value={form.parentPhone || ""}
                onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.parentPhone ? "border-rose-500" : "border-zinc-700"}`} />
              {errors.parentPhone && <p className="text-xs text-rose-400 mt-1">{errors.parentPhone}</p>}
            </div>
            <input type="email" placeholder="Email Γονέα (προαιρ.)" value={form.parentEmail || ""}
              onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />

            <textarea placeholder="Σημειώσεις" value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="md:col-span-2 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              rows={2} />
          </div>

          {/* ===== ΜΑΘΗΜΑΤΑ + ΤΜΗΜΑ (υποχρεωτικό!) ===== */}
          <div className="mt-5 pt-5 border-t border-zinc-700">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">📚 Μαθήματα + Τμήμα</h3>
              <span className="text-xs text-zinc-500">
                ({(form.enrollments || []).length} από {availableSubjects.length} διαθέσιμα)
              </span>
            </div>
            {errors.enrollments && (
              <div className="mb-3 px-3 py-2 bg-rose-500/10 border border-rose-500/40 rounded-lg text-xs text-rose-400">
                {errors.enrollments}
              </div>
            )}

            {availableSubjects.length === 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-3 text-xs text-amber-300">
                ⚠️ Δεν υπάρχουν μαθήματα για «{form.grade}». Πήγαινε στη σελίδα <b>«Μαθήματα»</b>.
              </div>
            ) : (
              <div className="space-y-2">
                {availableSubjects.map((c) => {
                  const enr = form.enrollments?.find((e) => e.lessonName === c.name);
                  const isChecked = !!enr;
                  return (
                    <div key={c.name} className={`p-3 rounded-lg border ${isChecked ? "bg-indigo-500/5 border-indigo-500/40" : "bg-zinc-800 border-zinc-700"}`}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input type="checkbox" checked={isChecked}
                            onChange={() => toggleEnrollment(c.name)}
                            className="accent-indigo-500 w-4 h-4" />
                          <span className="text-white text-sm font-semibold">{c.name}</span>
                        </label>
                        {isChecked && (
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-zinc-400">Τμήμα *:</label>
                            <select value={enr.className || ""}
                              onChange={(e) => setClassForLesson(c.name, e.target.value)}
                              className={`px-2 py-1 bg-zinc-900 border rounded text-sm text-white ${!enr.className ? "border-rose-500/50" : "border-zinc-700"}`}>
                              <option value="">— Επίλεξε —</option>
                              <option value={RANDOM_CLASS}>🎲 Τυχαία κατανομή</option>
                              <optgroup label="Συγκεκριμένο τμήμα">
                                {availableClasses.map((cls) => (
                                  <option key={cls.id} value={cls.name}>{cls.name}</option>
                                ))}
                              </optgroup>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-zinc-500 mt-2">
              💡 Αν επιλέξεις «<b>🎲 Τυχαία κατανομή</b>», ο μαθητής θα τοποθετηθεί αργότερα στη σελίδα «Τοποθέτηση».
            </p>
          </div>

          {/* Καλοκαιρινό 09:00-17:00 */}
          {form.grade === "Γ Λυκείου" && (
            <div className="mt-5 pt-5 border-t border-zinc-700">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-amber-500/10 border border-amber-500/40 rounded-lg">
                <input type="checkbox" checked={form.attendsSummer || false}
                  onChange={(e) => setForm({ ...form, attendsSummer: e.target.checked })}
                  className="accent-amber-500 w-4 h-4" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-amber-400">☀️ Παρακολουθεί καλοκαιρινό πρόγραμμα</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Ιούν-Ιουλ-Αυγ · <b>Δευ-Παρ 09:00-17:00</b> (καθημερινές μόνο)
                  </div>
                </div>
              </label>
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-zinc-700">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-3">⏰ Διαθεσιμότητα Ωρών</h3>
            <AvailabilityMatrix
              availability={form.availability || []}
              onChange={(slots) => setForm({ ...form, availability: slots })}
            />
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

      <div className="mb-4">
        <input type="text" placeholder="🔍 Αναζήτηση..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white" />
      </div>

      <div className="grid gap-2">
        {filtered.length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-8 text-center text-zinc-500">
            {search ? "Δεν βρέθηκαν αποτελέσματα." : "Δεν υπάρχουν μαθητές ακόμα."}
          </div>
        ) : filtered.map((s) => (
          <div key={s.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              {(s.firstName?.[0] || "") + (s.lastName?.[0] || "")}
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-sm">{s.firstName} {s.lastName}</div>
              <div className="text-xs text-zinc-400">
                🎓 {s.grade} · 👨‍👩 {s.parentFirstName} {s.parentLastName} ({s.parentPhone || "—"})
              </div>
              <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2 flex-wrap">
                {(s.enrollments || []).length > 0 ? (
                  <>
                    <span className="text-indigo-400">📚 {s.enrollments?.length} μαθήματα</span>
                    {s.enrollments?.some((e) => !e.className) && (
                      <span className="text-amber-400">🎲 {s.enrollments?.filter((e) => !e.className).length} σε τυχαία κατανομή</span>
                    )}
                  </>
                ) : (
                  <span className="text-amber-400">⚠ Χωρίς μαθήματα</span>
                )}
                {s.attendsSummer && <span className="text-amber-400">· ☀️ Καλοκαιρινό</span>}
              </div>
            </div>
            <button onClick={() => handleEdit(s)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs">✏️ Edit</button>
            <button onClick={() => handleDelete(s.id)} className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded text-xs">🗑</button>
          </div>
        ))}
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
