  "use client";

import { useEffect, useState } from "react";
import { AvailabilityMatrix } from "../../components/AvailabilityMatrix";

type Slot = { day: string; start: string; end: string };

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  subject?: string;       // legacy single
  subjects: string[];     // πολλαπλά μαθήματα
  preferredClasses?: string[];
  acceptsSummer?: boolean;
  availability: Slot[];
};

type Course = { name: string; grade: string };
type ClassUnit = { id: string; name: string; grade: string };

const GRADE_ORDER = ["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassUnit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSubjectsDropdown, setShowSubjectsDropdown] = useState(false);
  const [showClassesDropdown, setShowClassesDropdown] = useState(false);

  const [form, setForm] = useState<Partial<Teacher>>({
    firstName: "", lastName: "", phone: "", email: "",
    subjects: [], preferredClasses: [], acceptsSummer: false,
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
          subjects: t.subjects || (t.subject ? [t.subject] : []),
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
          id: c.id, name: c.name, grade: c.grade || c.category || "",
        }));
        setClasses(normalized);
      } catch {}
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
      subjects: [], preferredClasses: [], acceptsSummer: false,
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

    // ⭐ ΥΠΟΧΡΕΩΤΙΚΑ
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
    const teacher: Teacher = {
      id: editingId || Date.now().toString(),
      firstName: form.firstName!.trim(),
      lastName: form.lastName!.trim(),
      phone: form.phone!.trim(),
      email: form.email!.trim(),
      subjects: form.subjects || [],
      subject: form.subjects?.[0] || "", // legacy compat
      preferredClasses: form.preferredClasses || [],
      acceptsSummer: form.acceptsSummer || false,
      availability: form.availability || [],
    };
    const updated = editingId
      ? teachers.map((t) => (t.id === editingId ? teacher : t))
      : [...teachers, teacher];
    persist(updated);
    showToast(editingId ? "✓ Ενημερώθηκε" : "✓ Καταχωρήθηκε");
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (t: Teacher) => {
    setForm({
      ...t,
      subjects: t.subjects || (t.subject ? [t.subject] : []),
      availability: t.availability || [],
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Διαγραφή καθηγητή;")) return;
    persist(teachers.filter((t) => t.id !== id));
    showToast("🗑 Διαγράφηκε");
  };

  const toggleSubject = (n: string) => {
    const cur = form.subjects || [];
    setForm({ ...form, subjects: cur.includes(n) ? cur.filter((s) => s !== n) : [...cur, n] });
  };
  const togglePreferredClass = (n: string) => {
    const cur = form.preferredClasses || [];
    setForm({ ...form, preferredClasses: cur.includes(n) ? cur.filter((c) => c !== n) : [...cur, n] });
  };

  const coursesByGrade = courses.reduce<{ [k: string]: Course[] }>((acc, c) => {
    const g = c.grade || "Άλλο";
    if (!acc[g]) acc[g] = [];
    acc[g].push(c);
    return acc;
  }, {});
  const classesByGrade = classes.reduce<{ [k: string]: ClassUnit[] }>((acc, c) => {
    const g = c.grade || "Άλλο";
    if (!acc[g]) acc[g] = [];
    acc[g].push(c);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Καθηγητές</h1>
          <p className="text-zinc-400 text-sm mt-1">Όλα τα πεδία υποχρεωτικά εκτός σημειώσεων.</p>
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
            </h2>
            <button onClick={() => { resetForm(); setShowForm(false); }} className="text-zinc-400 hover:text-white text-sm">✕ Κλείσιμο</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            {/* Μαθήματα διδασκαλίας */}
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

            {/* Τμήματα προτίμησης */}
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">
                Τμήματα προτίμησης (προαιρ.)
              </label>
              <button type="button" onClick={() => setShowClassesDropdown(!showClassesDropdown)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-left flex items-center justify-between">
                <span className="text-sm">
                  {form.preferredClasses && form.preferredClasses.length > 0
                    ? `✓ ${form.preferredClasses.length} τμήματα`
                    : "— Όλα διαθέσιμα —"}
                </span>
                <span className="text-zinc-400">{showClassesDropdown ? "▲" : "▼"}</span>
              </button>

              {showClassesDropdown && (
                <div className="mt-2 bg-zinc-800 border border-indigo-500 rounded-lg p-3 max-h-80 overflow-y-auto">
                  {classes.length === 0 ? (
                    <p className="text-amber-400 text-xs text-center py-4">
                      ⚠️ Δεν υπάρχουν τμήματα. Πήγαινε στη σελίδα «Τμήματα».
                    </p>
                  ) : (
                    GRADE_ORDER.filter((g) => classesByGrade[g]).map((grade) => (
                      <div key={grade} className="mb-3 last:mb-0">
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">{grade}</div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
                          {classesByGrade[grade].map((c) => (
                            <label key={c.id} className="flex items-center gap-1 text-sm cursor-pointer hover:bg-zinc-700 px-2 py-1 rounded">
                              <input type="checkbox"
                                checked={form.preferredClasses?.includes(c.name) || false}
                                onChange={() => togglePreferredClass(c.name)}
                                className="accent-indigo-500" />
                              <span>{c.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                  <div className="sticky bottom-0 bg-zinc-800 pt-2 mt-2 border-t border-zinc-700 flex justify-between items-center">
                    <button type="button" onClick={() => setForm({ ...form, preferredClasses: [] })}
                      className="text-xs text-zinc-400 hover:text-white">🗑 Καθαρισμός</button>
                    <button type="button" onClick={() => setShowClassesDropdown(false)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-sm font-semibold">
                      ✓ Έτοιμο ({form.preferredClasses?.length || 0})
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

      <div className="grid gap-3">
        {teachers.length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-8 text-center text-zinc-500">
            Δεν υπάρχουν καθηγητές ακόμα.
          </div>
        ) : teachers.map((t) => (
          <div key={t.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
              {(t.firstName?.[0] || "") + (t.lastName?.[0] || "")}
            </div>
            <div className="flex-1">
              <div className="font-bold text-white">{t.firstName} {t.lastName}</div>
              <div className="text-xs text-zinc-400">
                📚 {t.subjects?.join(", ") || t.subject || "—"} · 📞 {t.phone} · 📧 {t.email}
              </div>
              <div className="text-xs text-zinc-500 mt-1 flex items-center gap-3 flex-wrap">
                <span>Διαθ.: {(t.availability || []).length} σλοτ</span>
                {t.preferredClasses && t.preferredClasses.length > 0 && (
                  <span className="text-indigo-400">📌 {t.preferredClasses.length} τμήματα</span>
                )}
                {t.acceptsSummer && <span className="text-amber-400">☀️ Καλοκαιρινό</span>}
              </div>
            </div>
            <button onClick={() => handleEdit(t)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs">✏️ Edit</button>
            <button onClick={() => handleDelete(t.id)} className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded text-xs">🗑</button>
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
