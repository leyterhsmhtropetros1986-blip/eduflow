"use client";

import { useEffect, useState, useMemo } from "react";
import { AvailabilityMatrix } from "../../components/AvailabilityMatrix";
import { generateId, nextCode, getSectionKey, sectionLabel } from "../../lib/schema";

type Slot = { day: string; start: string; end: string };

type Teacher = {
  id: string;
  teacherCode?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  subject?: string;
  subjects: string[];
  preferredSections?: Array<{
    className: string;
    subject: string;
  }>;
  acceptsSummer?: boolean;
  availability: Slot[];
};

type Course = { name: string; grade: string };
type ClassUnit = { id: string; name: string; grade: string; subject?: string };

const GRADE_ORDER = ["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"];
const DAY_ORDER = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassUnit[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSubjectsDropdown, setShowSubjectsDropdown] = useState(false);
  const [showClassesDropdown, setShowClassesDropdown] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  const [form, setForm] = useState<Partial<Teacher>>({
    firstName: "", lastName: "", phone: "", email: "",
    subjects: [], preferredSections: [], acceptsSummer: false,
    availability: [],
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    const storedT = localStorage.getItem("eduflow_teachers");
    if (storedT) {
      try {
        const parsed = JSON.parse(storedT);
        const migrated = parsed.map((t: any) => ({
          ...t,
          id: t.id || generateId("tea"),
          subjects: t.subjects || (t.subject ? [t.subject] : []),
          // Migrate old preferredClasses to preferredSections
          preferredSections: t.preferredSections || [],
        }));
        setTeachers(migrated);
      } catch {}
    }
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
    const storedCls = localStorage.getItem("eduflow_classes");
    if (storedCls) {
      try {
        const parsed = JSON.parse(storedCls);
        const normalized = parsed.map((c: any) => ({
          id: c.id, name: c.name, grade: c.grade || c.category || "", subject: c.subject || "",
        }));
        setClasses(normalized);
      } catch {}
    }
    const storedSch = localStorage.getItem("eduflow_schedule");
    if (storedSch) {
      try { setSchedule(JSON.parse(storedSch)); } catch {}
    }
  }, []);

  const persist = (list: Teacher[]) => {
    setTeachers(list);
    localStorage.setItem("eduflow_teachers", JSON.stringify(list));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const resetForm = () => {
    setForm({
      firstName: "", lastName: "", phone: "", email: "",
      subjects: [], preferredSections: [], acceptsSummer: false,
      availability: [],
    });
    setErrors({});
    setEditingId(null);
    setShowSubjectsDropdown(false);
    setShowClassesDropdown(false);
  };

  const validate = (): boolean => {
    const e: { [k: string]: string } = {};
    if (!form.firstName?.trim()) e.firstName = "Υποχρεωτικό";
    if (!form.lastName?.trim()) e.lastName = "Υποχρεωτικό";
    if (!form.phone?.trim()) e.phone = "Υποχρεωτικό τηλέφωνο";
    else if (!/^[0-9+\s-]{8,}$/.test(form.phone.trim())) e.phone = "Μη έγκυρο τηλέφωνο";
    if (!form.email?.trim()) e.email = "Υποχρεωτικό email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Μη έγκυρο email";
    if (!form.subjects || form.subjects.length === 0) {
      e.subjects = "Πρέπει να επιλέξεις τουλάχιστον 1 μάθημα";
    }
    if (!form.availability || form.availability.length === 0) {
      e.availability = "⚠ Πρέπει να ορίσεις τουλάχιστον 1 ώρα διαθεσιμότητας";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const existingCodes = teachers.map((t) => t.teacherCode).filter(Boolean) as string[];
    const teacherCode = editingId
      ? teachers.find((t) => t.id === editingId)?.teacherCode || nextCode("T", existingCodes)
      : nextCode("T", existingCodes);

    const teacher: Teacher = {
      id: editingId || generateId("tea"),
      teacherCode,
      firstName: form.firstName!.trim(),
      lastName: form.lastName!.trim(),
      phone: form.phone!.trim(),
      email: form.email!.trim(),
      subjects: form.subjects || [],
      subject: form.subjects?.[0] || "",
      preferredSections: form.preferredSections || [],
      acceptsSummer: form.acceptsSummer || false,
      availability: form.availability || [],
    };
    const updated = editingId
      ? teachers.map((t) => (t.id === editingId ? teacher : t))
      : [...teachers, teacher];
    persist(updated);
    showToast(editingId ? "✓ Ενημερώθηκε" : `✓ Καταχωρήθηκε ${teacherCode}`);
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (t: Teacher) => {
    setForm({
      ...t,
      subjects: t.subjects || (t.subject ? [t.subject] : []),
      availability: t.availability || [],
      preferredSections: t.preferredSections || [],
    });
    setEditingId(t.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Διαγραφή καθηγητή;")) return;
    persist(teachers.filter((t) => t.id !== id));
    if (selectedTeacherId === id) setSelectedTeacherId("");
    showToast("🗑 Διαγράφηκε");
  };

  const toggleSubject = (n: string) => {
    const cur = form.subjects || [];
    const newSubjects = cur.includes(n) ? cur.filter((s) => s !== n) : [...cur, n];
    
    // Auto-cleanup: Remove preferred sections that don't match the new subjects
    const validPreferredSections = (form.preferredSections || []).filter((ps) => 
      newSubjects.includes(ps.subject)
    );
    
    setForm({ 
      ...form, 
      subjects: newSubjects,
      preferredSections: validPreferredSections
    });
  };

  const togglePreferredSection = (className: string, subject: string) => {
    const cur = form.preferredSections || [];
    const exists = cur.some(ps => ps.className === className && ps.subject === subject);
    
    const newPreferred = exists
      ? cur.filter(ps => !(ps.className === className && ps.subject === subject))
      : [...cur, { className, subject }];
    
    setForm({ ...form, preferredSections: newPreferred });
  };

  const coursesByGrade = courses.reduce<{ [k: string]: Course[] }>((acc, c) => {
    const g = c.grade || "Άλλο";
    if (!acc[g]) acc[g] = [];
    acc[g].push(c);
    return acc;
  }, {});
  
  // CRITICAL: Filter classes by teacher's subjects - Only show sections for subjects the teacher teaches
  const availableClasses = useMemo(() => {
    const teacherSubjects = form.subjects || [];
    if (teacherSubjects.length === 0) return [];
    
    return classes.filter((c) => 
      c.subject && teacherSubjects.includes(c.subject)
    );
  }, [classes, form.subjects]);
  
  const classesByGrade = availableClasses.reduce<{ [k: string]: ClassUnit[] }>((acc, c) => {
    const g = c.grade || "Άλλο";
    if (!acc[g]) acc[g] = [];
    acc[g].push(c);
    return acc;
  }, {});

  const selectedTeacher = useMemo(
    () => teachers.find((t) => t.id === selectedTeacherId),
    [teachers, selectedTeacherId]
  );

  const teacherSchedule = useMemo(() => {
    if (!selectedTeacher) return [];
    const fullName = `${selectedTeacher.firstName} ${selectedTeacher.lastName}`.trim();
    const lastFirst = `${selectedTeacher.lastName} ${selectedTeacher.firstName}`.trim();
    return schedule
      .filter((s: any) => {
        const t = String(s.teacher || "").trim();
        return t === fullName || t === lastFirst || s.teacherId === selectedTeacher.id;
      })
      .sort((a: any, b: any) => {
        const dayA = DAY_ORDER.indexOf(a.day);
        const dayB = DAY_ORDER.indexOf(b.day);
        if (dayA !== dayB) return dayA - dayB;
        return String(a.time).localeCompare(String(b.time));
      });
  }, [selectedTeacher, schedule]);

  const sortedTeachers = useMemo(
    () => [...teachers].sort((a, b) => a.lastName.localeCompare(b.lastName, "el")),
    [teachers]
  );

  const isSectionPreferred = (className: string, subject: string): boolean => {
    return (form.preferredSections || []).some(ps => 
      ps.className === className && ps.subject === subject
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Καθηγητές</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {teachers.length > 0 ? <><b className="text-white">{teachers.length}</b> καθηγητές</> : "Όλα τα πεδία υποχρεωτικά εκτός σημειώσεων."}
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold">+ Νέος Καθηγητής</button>
        )}
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-indigo-400">
              {editingId ? "✏️ Επεξεργασία" : "+ Νέος Καθηγητής"}
              {editingId && teachers.find((t) => t.id === editingId)?.teacherCode && (
                <span className="ml-2 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs">
                  {teachers.find((t) => t.id === editingId)?.teacherCode}
                </span>
              )}
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
              <input type="tel" placeholder="Τηλέφωνο *" value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.phone ? "border-rose-500" : "border-zinc-700"}`} />
              {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <input type="email" placeholder="Email *" value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.email ? "border-rose-500" : "border-zinc-700"}`} />
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">
                Μαθήματα διδασκαλίας * <span className="text-rose-400">(υποχρεωτικό)</span>
              </label>
              <button type="button" onClick={() => setShowSubjectsDropdown(!showSubjectsDropdown)}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white text-left flex items-center justify-between ${errors.subjects ? "border-rose-500" : "border-zinc-700"}`}>
                <span className="text-sm">
                  {form.subjects && form.subjects.length > 0
                    ? `✓ ${form.subjects.length} μαθήματα: ${form.subjects.slice(0, 3).join(", ")}${form.subjects.length > 3 ? "..." : ""}`
                    : "— Επίλεξε μαθήματα —"}
                </span>
                <span className="text-zinc-400">{showSubjectsDropdown ? "▲" : "▼"}</span>
              </button>
              {errors.subjects && <p className="text-xs text-rose-400 mt-1">{errors.subjects}</p>}

              {showSubjectsDropdown && (
                <div className="mt-2 bg-zinc-800 border border-indigo-500 rounded-lg p-3 max-h-80 overflow-y-auto">
                  {courses.length === 0 ? (
                    <p className="text-amber-400 text-xs text-center py-4">
                      ⚠️ Δεν υπάρχουν μαθήματα. Πήγαινε στη σελίδα «Μαθήματα».
                    </p>
                  ) : (
                    GRADE_ORDER.filter((g) => coursesByGrade[g]).map((grade) => (
                      <div key={grade} className="mb-3 last:mb-0">
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">{grade}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                          {coursesByGrade[grade].map((c) => (
                            <label key={c.name} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-zinc-700 px-2 py-1 rounded">
                              <input type="checkbox"
                                checked={form.subjects?.includes(c.name) || false}
                                onChange={() => toggleSubject(c.name)}
                                className="accent-indigo-500" />
                              <span>{c.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                  <div className="sticky bottom-0 bg-zinc-800 pt-2 mt-2 border-t border-zinc-700 flex justify-between items-center">
                    <button type="button" onClick={() => setForm({ ...form, subjects: [] })}
                      className="text-xs text-zinc-400 hover:text-white">🗑 Καθαρισμός</button>
                    <button type="button" onClick={() => setShowSubjectsDropdown(false)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-sm font-semibold">
                      ✓ Έτοιμο ({form.subjects?.length || 0})
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">
                Τμήματα προτίμησης (προαιρ.)
              </label>
              <button type="button" onClick={() => setShowClassesDropdown(!showClassesDropdown)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-left flex items-center justify-between">
                <span className="text-sm">
                  {form.preferredSections && form.preferredSections.length > 0
                    ? `✓ ${form.preferredSections.length} τμήματα`
                    : "— Όλα διαθέσιμα —"}
                </span>
                <span className="text-zinc-400">{showClassesDropdown ? "▲" : "▼"}</span>
              </button>

              {showClassesDropdown && (
                <div className="mt-2 bg-zinc-800 border border-indigo-500 rounded-lg p-3 max-h-80 overflow-y-auto">
                  {availableClasses.length === 0 ? (
                    <p className="text-amber-400 text-xs text-center py-4">
                      {form.subjects && form.subjects.length > 0
                        ? "⚠️ Δεν υπάρχουν τμήματα για τα επιλεγμένα μαθήματα."
                        : "⚠️ Επίλεξε πρώτα μαθήματα διδασκαλίας."}
                    </p>
                  ) : (
                    GRADE_ORDER.filter((g) => classesByGrade[g]).map((grade) => (
                      <div key={grade} className="mb-3 last:mb-0">
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">{grade}</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                          {classesByGrade[grade].map((c) => (
                            <label key={c.id} className="flex items-center gap-1 text-sm cursor-pointer hover:bg-zinc-700 px-2 py-1 rounded">
                              <input type="checkbox"
                                checked={isSectionPreferred(c.name, c.subject || "")}
                                onChange={() => togglePreferredSection(c.name, c.subject || "")}
                                className="accent-indigo-500" />
                              <span className="truncate">{sectionLabel(c)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                  <div className="sticky bottom-0 bg-zinc-800 pt-2 mt-2 border-t border-zinc-700 flex justify-between items-center">
                    <button type="button" onClick={() => setForm({ ...form, preferredSections: [] })}
                      className="text-xs text-zinc-400 hover:text-white">🗑 Καθαρισμός</button>
                    <button type="button" onClick={() => setShowClassesDropdown(false)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-sm font-semibold">
                      ✓ Έτοιμο ({form.preferredSections?.length || 0})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-zinc-700">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide">⏰ Διαθεσιμότητα Ωρών *</h3>
              <span className="text-xs text-rose-400">(υποχρεωτικό)</span>
            </div>
            {errors.availability && (
              <div className="mb-3 px-3 py-2 bg-rose-500/10 border border-rose-500/40 rounded-lg text-xs text-rose-400">
                {errors.availability}
              </div>
            )}
            <AvailabilityMatrix
              availability={form.availability || []}
              onChange={(slots) => setForm({ ...form, availability: slots })}
            />
          </div>

          <div className="mt-5 pt-5 border-t border-zinc-700">
            <label className="flex items-center gap-2 cursor-pointer p-3 bg-amber-500/10 border border-amber-500/40 rounded-lg">
              <input type="checkbox" checked={form.acceptsSummer || false}
                onChange={(e) => setForm({ ...form, acceptsSummer: e.target.checked })}
                className="accent-amber-500 w-4 h-4" />
              <div className="flex-1">
                <div className="text-sm font-bold text-amber-400">☀️ Αποδέχεται καλοκαιρινό πρόγραμμα</div>
                <div className="text-xs text-zinc-400 mt-0.5">Ιούν-Ιουλ-Αυγ · Δευ-Παρ <b>09:00-17:00</b></div>
              </div>
            </label>
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

      {!showForm && teachers.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-6">
          <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-2 block">
            👤 Επιλογή Καθηγητή
          </label>
          <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-base">
            <option value="">— Επίλεξε καθηγητή για προβολή —</option>
            {sortedTeachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.teacherCode ? `${t.teacherCode} - ` : ""}{t.lastName} {t.firstName} ({t.subjects?.join(", ") || t.subject || "—"})
              </option>
            ))}
          </select>
        </div>
      )}

      {!showForm && selectedTeacher && (
        <div className="bg-zinc-900 border border-indigo-500/40 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl">
              {(selectedTeacher.lastName?.[0] || "") + (selectedTeacher.firstName?.[0] || "")}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {selectedTeacher.teacherCode && (
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs font-mono font-bold">
                    {selectedTeacher.teacherCode}
                  </span>
                )}
                <h2 className="text-xl font-bold text-white">
                  {selectedTeacher.lastName} {selectedTeacher.firstName}
                </h2>
              </div>
              <div className="text-sm text-zinc-400 mt-1">
                📚 {selectedTeacher.subjects?.join(", ") || selectedTeacher.subject || "—"}
              </div>
              <div className="text-sm text-zinc-400">
                📞 {selectedTeacher.phone} · 📧 {selectedTeacher.email}
              </div>
              <div className="text-xs text-zinc-500 mt-1 flex items-center gap-3 flex-wrap">
                <span>⏰ {(selectedTeacher.availability || []).length} σλοτ διαθεσιμότητας</span>
                {selectedTeacher.preferredSections && selectedTeacher.preferredSections.length > 0 && (
                  <span className="text-indigo-400">📌 {selectedTeacher.preferredSections.length} τμήματα προτίμησης</span>
                )}
                {selectedTeacher.acceptsSummer && <span className="text-amber-400">☀️ Καλοκαιρινό</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(selectedTeacher)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs">✏️ Edit</button>
              <button onClick={() => handleDelete(selectedTeacher.id)} className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded text-xs">🗑</button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-700">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide mb-3">📅 Πρόγραμμα Διδασκαλίας</h3>
            {teacherSchedule.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-6">
                Δεν υπάρχει πρόγραμμα ακόμα. Δημιούργησέ το στη σελίδα «Πρόγραμμα».
              </p>
            ) : (
              <div className="space-y-2">
                {teacherSchedule.map((s: any, i: number) => (
                  <div key={s.id || i} className="bg-[#0b0e14] border border-zinc-700 rounded-lg p-3 flex items-center gap-3">
                    <div className="font-mono text-xs text-indigo-400 font-bold w-20">{s.time}</div>
                    <div className="text-xs text-zinc-300 font-semibold w-24">{s.day}</div>
                    <div className="flex-1">
                      <span className="text-white text-sm font-semibold">{s.subject}</span>
                      <span className="text-zinc-400 text-xs ml-2">{s.groupName}</span>
                    </div>
                    {s.room && <span className="text-xs text-zinc-500">🚪 {s.room}</span>}
                  </div>
                ))}
                <div className="mt-2 text-xs text-zinc-500">
                  Σύνολο: <b className="text-white">{teacherSchedule.length}</b> ώρες/εβδομάδα
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!showForm && teachers.length > 0 && !selectedTeacher && (
        <div className="text-center text-zinc-500 text-sm py-8">
          👆 Επίλεξε καθηγητή από το dropdown για να δεις τα στοιχεία και το πρόγραμμά του
        </div>
      )}

      {!showForm && teachers.length === 0 && (
        <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-8 text-center text-zinc-500">
          Δεν υπάρχουν καθηγητές ακόμα.
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
