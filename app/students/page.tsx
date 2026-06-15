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
  parentFirstName?: string;
  parentLastName?: string;
  parentName?: string; // computed για backward compat
  parentPhone?: string;
  parentEmail?: string;
  studentPhone?: string;
  grade: string;       // ⚠️ field "grade", όχι "category" — σύμφωνα με placement & scheduler
  enrollments?: Enrollment[]; // ⚠️ NEW: συνδέει τον μαθητή με μαθήματα
  notes?: string;
  attendsSummer?: boolean;
  availability: Slot[];
};

type Course = { id?: string; name: string; grade: string };

const GRADES = [
  "Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου",
  "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου",
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const [form, setForm] = useState<Partial<Student> & { selectedSubjects?: string[] }>({
    firstName: "", lastName: "",
    parentFirstName: "", parentLastName: "",
    parentPhone: "", parentEmail: "", studentPhone: "",
    grade: "Α Γυμνασίου",
    selectedSubjects: [],
    notes: "",
    attendsSummer: false,
    availability: [],
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    // Load students με auto-migration από παλιό schema
    const storedS = localStorage.getItem("eduflow_students");
    if (storedS) {
      try {
        const parsed = JSON.parse(storedS);
        const migrated = parsed.map((s: any) => ({
          ...s,
          // Migration: αν παλιά έχει category αντί για grade
          grade: s.grade || s.category || "Α Γυμνασίου",
          // Migration: αν παλιά έχει parentName ενιαία
          parentLastName: s.parentLastName || (s.parentName ? s.parentName.split(/\s+/)[0] : ""),
          parentFirstName: s.parentFirstName || (s.parentName ? s.parentName.split(/\s+/).slice(1).join(" ") : ""),
        }));
        setStudents(migrated);
      } catch {}
    }

    // Load courses (διαβάζει και από τα 2 keys που χρησιμοποιεί το app)
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
  }, []);

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
      selectedSubjects: [], notes: "",
      attendsSummer: false,
      availability: [],
    });
    setErrors({});
    setEditingId(null);
  };

  const validate = (): boolean => {
    const e: { [k: string]: string } = {};
    if (!form.firstName?.trim()) e.firstName = "Υποχρεωτικό";
    if (!form.lastName?.trim()) e.lastName = "Υποχρεωτικό";
    if (!form.grade) e.grade = "Υποχρεωτική τάξη";
    if (form.attendsSummer && form.grade !== "Γ Λυκείου") {
      e.attendsSummer = "Καλοκαιρινό μόνο για Γ Λυκείου";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    // Build enrollments από selectedSubjects + προηγούμενα enrollments (κρατάει className αν υπήρχε)
    const prevEnrollments = (editingId && students.find((s) => s.id === editingId)?.enrollments) || [];
    const newEnrollments: Enrollment[] = (form.selectedSubjects || []).map((subjName) => {
      const prev = prevEnrollments.find((e) => e.lessonName === subjName);
      return { lessonName: subjName, className: prev?.className || "" };
    });

    const student: Student = {
      id: editingId || Date.now().toString(),
      firstName: form.firstName!, lastName: form.lastName!,
      parentFirstName: form.parentFirstName,
      parentLastName: form.parentLastName,
      parentPhone: form.parentPhone,
      parentEmail: form.parentEmail,
      studentPhone: form.studentPhone,
      grade: form.grade!,
      enrollments: newEnrollments,
      notes: form.notes || "",
      attendsSummer: form.attendsSummer || false,
      availability: form.availability || [],
    };
    const updated = editingId
      ? students.map((s) => (s.id === editingId ? student : s))
      : [...students, student];
    persist(updated);
    showToast(editingId ? "✓ Ενημερώθηκε" : "✓ Καταχωρήθηκε");
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (s: Student) => {
    setForm({
      ...s,
      availability: s.availability || [],
      selectedSubjects: (s.enrollments || []).map((e) => e.lessonName),
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Διαγραφή μαθητή;")) return;
    persist(students.filter((s) => s.id !== id));
    showToast("🗑 Διαγράφηκε");
  };

  // Toggle επιλογή μαθήματος (στα checkboxes)
  const toggleSubject = (subjName: string) => {
    const current = form.selectedSubjects || [];
    setForm({
      ...form,
      selectedSubjects: current.includes(subjName)
        ? current.filter((s) => s !== subjName)
        : [...current, subjName],
    });
  };

  // Μαθήματα που ταιριάζουν στην τάξη του μαθητή
  const availableSubjects = courses.filter((c) => c.grade === form.grade);

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

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Επώνυμο*", "Όνομα*", "Τάξη*", "Επώνυμο Γονέα", "Όνομα Γονέα", "Τηλ. Γονέα", "Email Γονέα", "Τηλ. Μαθητή", "Καλοκαιρινό (Y/N)", "Μαθήματα (κόμμα)", "Σημειώσεις"],
      ["Παπαδόπουλος", "Γιώργος", "Γ Λυκείου", "Παπαδόπουλος", "Νίκος", "6970000000", "nick@example.com", "6980000000", "Y", "Μαθηματικά,Φυσική", "Καλό παιδί"],
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
      const preview = dataRows.map((row: any, idx: number) => {
        const lastName = String(row[0] || "").trim();
        const firstName = String(row[1] || "").trim();
        const grade = String(row[2] || "").trim();
        if (!GRADES.includes(grade)) errs.push(`Γραμμή ${idx + 2}: άγνωστη τάξη "${grade}"`);
        return {
          lastName, firstName, grade,
          parentLastName: String(row[3] || "").trim(),
          parentFirstName: String(row[4] || "").trim(),
          parentPhone: String(row[5] || "").trim(),
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
    showToast(`✓ Εισήχθησαν ${newStudents.length} μαθητές`);
    setImportPreview([]);
    setImportErrors([]);
    setShowImport(false);
  };

  const exportExcel = () => {
    const rows = students.map((s) => ({
      "Επώνυμο": s.lastName,
      "Όνομα": s.firstName,
      "Τάξη": s.grade,
      "Επώνυμο Γονέα": s.parentLastName || "",
      "Όνομα Γονέα": s.parentFirstName || "",
      "Τηλ. Γονέα": s.parentPhone || "",
      "Email Γονέα": s.parentEmail || "",
      "Τηλ. Μαθητή": s.studentPhone || "",
      "Καλοκαιρινό": s.attendsSummer ? "Y" : "N",
      "Μαθήματα": (s.enrollments || []).map((e) => e.lessonName).join(", "),
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
            Στοιχεία μαθητή, μαθήματα παρακολούθησης, και διαθεσιμότητα.
          </p>
        </div>
        <div className="flex gap-2">
          {!showForm && (
            <>
              <button onClick={() => setShowImport(!showImport)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm">
                📥 Excel Import
              </button>
              <button onClick={exportExcel} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm">
                📤 Excel Export
              </button>
              <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold">
                + Νέος Μαθητής
              </button>
            </>
          )}
        </div>
      </div>

      {showImport && !showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-indigo-400">📥 Εισαγωγή από Excel</h3>
            <button onClick={() => { setShowImport(false); setImportPreview([]); setImportErrors([]); }}
              className="text-zinc-400 hover:text-white text-sm">✕</button>
          </div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <button onClick={downloadTemplate} className="bg-emerald-600/20 border border-emerald-600/40 text-emerald-400 px-3 py-1.5 rounded-lg text-sm">
              ⬇️ Λήψη Template
            </button>
            <input type="file" accept=".xlsx,.xls,.csv"
              onChange={(e) => e.target.files && handleImportFile(e.target.files[0])}
              className="text-sm text-zinc-400" />
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
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-semibold">
                ✓ Επιβεβαίωση Εισαγωγής
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
            <div>
              <input type="text" placeholder="Επώνυμο *" value={form.lastName || ""}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.lastName ? "border-rose-500" : "border-zinc-700"}`} />
              {errors.lastName && <p className="text-xs text-rose-400 mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <input type="text" placeholder="Όνομα *" value={form.firstName || ""}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.firstName ? "border-rose-500" : "border-zinc-700"}`} />
              {errors.firstName && <p className="text-xs text-rose-400 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">Τάξη *</label>
              <select value={form.grade}
                onChange={(e) => setForm({
                  ...form,
                  grade: e.target.value,
                  attendsSummer: e.target.value === "Γ Λυκείου" ? form.attendsSummer : false,
                  selectedSubjects: [], // καθαρισμός όταν αλλάζει τάξη
                })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.grade ? "border-rose-500" : "border-zinc-700"}`}>
                {GRADES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <input type="tel" placeholder="Τηλ. Μαθητή" value={form.studentPhone || ""}
              onChange={(e) => setForm({ ...form, studentPhone: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />

            <div className="md:col-span-2 mt-2">
              <h4 className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-2">Στοιχεία Γονέα</h4>
            </div>
            <input type="text" placeholder="Επώνυμο Γονέα" value={form.parentLastName || ""}
              onChange={(e) => setForm({ ...form, parentLastName: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
            <input type="text" placeholder="Όνομα Γονέα" value={form.parentFirstName || ""}
              onChange={(e) => setForm({ ...form, parentFirstName: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
            <input type="tel" placeholder="Τηλ. Γονέα" value={form.parentPhone || ""}
              onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
            <input type="email" placeholder="Email Γονέα" value={form.parentEmail || ""}
              onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />

            <textarea placeholder="Σημειώσεις" value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="md:col-span-2 w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              rows={2} />
          </div>

          {/* ========== ΜΑΘΗΜΑΤΑ (enrollments) ========== */}
          <div className="mt-5 pt-5 border-t border-zinc-700">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">📚 Μαθήματα που παρακολουθεί</h3>
              <span className="text-xs text-zinc-500">
                ({(form.selectedSubjects || []).length} επιλεγμένα από {availableSubjects.length} διαθέσιμα στην τάξη)
              </span>
            </div>

            {availableSubjects.length === 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/40 rounded-lg p-3 text-xs text-amber-300">
                ⚠️ Δεν υπάρχουν μαθήματα για την τάξη «{form.grade}».
                Πήγαινε στη σελίδα <b>«Μαθήματα»</b> και δημιούργησε πρώτα τα μαθήματα.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                {availableSubjects.map((c) => (
                  <label key={c.name} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-700 px-2 py-1.5 rounded">
                    <input type="checkbox"
                      checked={form.selectedSubjects?.includes(c.name) || false}
                      onChange={() => toggleSubject(c.name)}
                      className="accent-indigo-500" />
                    <span className="text-white text-sm">{c.name}</span>
                  </label>
                ))}
              </div>
            )}

            <p className="text-xs text-zinc-500 mt-2">
              💡 Αφού επιλέξεις μαθήματα, πάει στη σελίδα <b>«Τοποθέτηση»</b> για να ορίσεις σε ποιο τμήμα παρακολουθεί κάθε μάθημα.
            </p>
          </div>

          {/* Καλοκαιρινό */}
          {form.grade === "Γ Λυκείου" && (
            <div className="mt-5 pt-5 border-t border-zinc-700">
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-amber-500/10 border border-amber-500/40 rounded-lg">
                <input type="checkbox" checked={form.attendsSummer || false}
                  onChange={(e) => setForm({ ...form, attendsSummer: e.target.checked })}
                  className="accent-amber-500 w-4 h-4" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-amber-400">☀️ Παρακολουθεί καλοκαιρινό πρόγραμμα</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Ιούν-Ιουλ-Αυγ · Δευ-Παρ 09:00-14:00
                  </div>
                </div>
              </label>
              {errors.attendsSummer && <p className="text-xs text-rose-400 mt-1">{errors.attendsSummer}</p>}
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
        <input type="text" placeholder="🔍 Αναζήτηση..."
          value={search} onChange={(e) => setSearch(e.target.value)}
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
              {(s.lastName?.[0] || "") + (s.firstName?.[0] || "")}
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-sm">{s.lastName} {s.firstName}</div>
              <div className="text-xs text-zinc-400">
                🎓 {s.grade} · 📞 {s.studentPhone || "—"}
                {s.parentName && <span> · 👨‍👩 {s.parentName} ({s.parentPhone || "—"})</span>}
              </div>
              <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2 flex-wrap">
                {(s.enrollments || []).length > 0 ? (
                  <span className="text-indigo-400">
                    📚 {s.enrollments?.length} μαθήματα: {(s.enrollments || []).map((e) => e.lessonName).slice(0, 3).join(", ")}
                    {(s.enrollments?.length || 0) > 3 ? "..." : ""}
                  </span>
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
