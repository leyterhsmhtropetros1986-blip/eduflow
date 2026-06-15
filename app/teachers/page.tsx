'use client';

import { useEffect, useState } from 'react';
import { AvailabilityMatrix } from '@/components/AvailabilityMatrix';

type Slot = { day: string; start: string; end: string };

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  subject?: string;
  preferredClasses?: string[];
  acceptsSummer?: boolean;
  availability: Slot[]; // array, σύμφωνα με το υπάρχον AvailabilityMatrix
  summerAvailability?: Slot[];
};

const ALL_CLASSES = {
  'Α Γυμνασίου': ['Α1', 'Α2', 'Α3', 'Α4', 'Α5', 'Α6'],
  'Β Γυμνασίου': ['Β1', 'Β2', 'Β3', 'Β4', 'Β5', 'Β6'],
  'Γ Γυμνασίου': ['Γ1', 'Γ2', 'Γ3', 'Γ4', 'Γ5', 'Γ6'],
  'Α Λυκείου': ['Α1', 'Α2', 'Α3', 'Α4'],
  'Β Λυκείου': ['Β1', 'Β2', 'Β3', 'Β4'],
  'Γ Λυκείου': ['Γ1', 'Γ2', 'Γ3', 'Γ4'],
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showClassesDropdown, setShowClassesDropdown] = useState(false);

  const [form, setForm] = useState<Partial<Teacher>>({
    firstName: '', lastName: '', phone: '', email: '', subject: '',
    preferredClasses: [], acceptsSummer: false,
    availability: [], summerAvailability: [],
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('eduflow_teachers');
    if (stored) setTeachers(JSON.parse(stored));
  }, []);

  const persist = (list: Teacher[]) => {
    setTeachers(list);
    localStorage.setItem('eduflow_teachers', JSON.stringify(list));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const resetForm = () => {
    setForm({
      firstName: '', lastName: '', phone: '', email: '', subject: '',
      preferredClasses: [], acceptsSummer: false,
      availability: [], summerAvailability: [],
    });
    setErrors({});
    setEditingId(null);
    setShowClassesDropdown(false);
  };

  const validate = (): boolean => {
    const e: { [k: string]: string } = {};
    if (!form.firstName?.trim()) e.firstName = 'Υποχρεωτικό';
    if (!form.lastName?.trim()) e.lastName = 'Υποχρεωτικό';
    if (!form.subject?.trim()) e.subject = 'Υποχρεωτικό μάθημα';

    // Έλεγχος διαθεσιμότητας: τουλάχιστον 1 σλοτ
    if (!form.availability || form.availability.length === 0) {
      e.availability = '⚠ Πρέπει να ορίσεις τουλάχιστον 1 ώρα διαθεσιμότητας';
    }

    if (form.acceptsSummer && (!form.summerAvailability || form.summerAvailability.length === 0)) {
      e.summerAvailability = '⚠ Αποδέχεσαι καλοκαιρινό — όρισε τις ώρες';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const teacher: Teacher = {
      id: editingId || Date.now().toString(),
      firstName: form.firstName!, lastName: form.lastName!,
      phone: form.phone, email: form.email, subject: form.subject,
      preferredClasses: form.preferredClasses || [],
      acceptsSummer: form.acceptsSummer || false,
      availability: form.availability || [],
      summerAvailability: form.acceptsSummer ? (form.summerAvailability || []) : [],
    };
    const updated = editingId
      ? teachers.map(t => (t.id === editingId ? teacher : t))
      : [...teachers, teacher];
    persist(updated);
    showToast(editingId ? '✓ Ενημερώθηκε' : '✓ Καταχωρήθηκε');
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (t: Teacher) => {
    setForm({
      ...t,
      availability: t.availability || [],
      summerAvailability: t.summerAvailability || [],
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Διαγραφή καθηγητή;')) return;
    persist(teachers.filter(t => t.id !== id));
    showToast('🗑 Διαγράφηκε');
  };

  const togglePreferredClass = (cls: string) => {
    const current = form.preferredClasses || [];
    setForm({
      ...form,
      preferredClasses: current.includes(cls) ? current.filter(c => c !== cls) : [...current, cls],
    });
  };

  // Quick-fill summer (09:00-14:00 Δευ-Παρ)
  const quickFillSummer = () => {
    const slots: Slot[] = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή'].map(day => ({
      day, start: '09:00', end: '14:00',
    }));
    setForm({ ...form, summerAvailability: slots });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Καθηγητές</h1>
          <p className="text-zinc-400 text-sm mt-1">Στοιχεία, μάθημα και τμήματα προτίμησης.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold">
            + Νέος Καθηγητής
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-indigo-400">
              {editingId ? '✏️ Επεξεργασία' : '+ Νέος Καθηγητής'}
            </h2>
            <button onClick={() => { resetForm(); setShowForm(false); }}
              className="text-zinc-400 hover:text-white text-sm">✕ Κλείσιμο</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input type="text" placeholder="Επώνυμο *" value={form.lastName || ''}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.lastName ? 'border-rose-500' : 'border-zinc-700'}`} />
              {errors.lastName && <p className="text-xs text-rose-400 mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <input type="text" placeholder="Όνομα *" value={form.firstName || ''}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.firstName ? 'border-rose-500' : 'border-zinc-700'}`} />
              {errors.firstName && <p className="text-xs text-rose-400 mt-1">{errors.firstName}</p>}
            </div>
            <input type="tel" placeholder="Τηλέφωνο" value={form.phone || ''}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
            <input type="email" placeholder="Email" value={form.email || ''}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white" />
            <div className="md:col-span-2">
              <input type="text" placeholder="Μάθημα διδασκαλίας *"
                value={form.subject || ''}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.subject ? 'border-rose-500' : 'border-zinc-700'}`} />
              {errors.subject && <p className="text-xs text-rose-400 mt-1">{errors.subject}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">
                Τμήματα προτίμησης (πολλαπλή επιλογή, προαιρ.)
              </label>
              <button type="button" onClick={() => setShowClassesDropdown(!showClassesDropdown)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-left flex items-center justify-between">
                <span className="text-sm">
                  {form.preferredClasses && form.preferredClasses.length > 0
                    ? `✓ ${form.preferredClasses.length} επιλεγμένα`
                    : '— Κανένα (όλα τα τμήματα διαθέσιμα) —'}
                </span>
                <span className="text-zinc-400">{showClassesDropdown ? '▲' : '▼'}</span>
              </button>

              {showClassesDropdown && (
                <div className="mt-2 bg-zinc-800 border border-indigo-500 rounded-lg p-3 max-h-80 overflow-y-auto">
                  {Object.entries(ALL_CLASSES).map(([category, classes]) => (
                    <div key={category} className="mb-3 last:mb-0">
                      <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">{category}</div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
                        {classes.map(cls => (
                          <label key={`${category}-${cls}`}
                            className="flex items-center gap-1 text-sm cursor-pointer hover:bg-zinc-700 px-2 py-1 rounded">
                            <input type="checkbox"
                              checked={form.preferredClasses?.includes(`${category}-${cls}`) || false}
                              onChange={() => togglePreferredClass(`${category}-${cls}`)}
                              className="accent-indigo-500" />
                            <span>{cls}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="sticky bottom-0 bg-zinc-800 pt-2 mt-2 border-t border-zinc-700 flex justify-between items-center">
                    <button type="button"
                      onClick={() => setForm({ ...form, preferredClasses: [] })}
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
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input type="checkbox" checked={form.acceptsSummer || false}
                onChange={e => setForm({ ...form, acceptsSummer: e.target.checked })}
                className="accent-amber-500 w-4 h-4" />
              <span className="text-sm font-bold text-amber-400">☀️ Αποδέχεται καλοκαιρινό πρόγραμμα</span>
              <span className="text-xs text-zinc-400">(Ιούν-Ιουλ-Αυγ, Γ Λυκείου — Δευ-Παρ 09:00-14:00)</span>
            </label>
            {form.acceptsSummer && (
              <div>
                {errors.summerAvailability && (
                  <div className="mb-3 px-3 py-2 bg-rose-500/10 border border-rose-500/40 rounded-lg text-xs text-rose-400">
                    {errors.summerAvailability}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <button type="button" onClick={quickFillSummer}
                    className="text-xs bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-lg hover:bg-amber-500/30">
                    ⚡ Auto-fill: Δευ-Παρ 09:00-14:00
                  </button>
                </div>
                <AvailabilityMatrix
                  availability={form.summerAvailability || []}
                  onChange={(slots) => setForm({ ...form, summerAvailability: slots })}
                />
              </div>
            )}
          </div>

          <div className="mt-5 pt-5 border-t border-zinc-700 flex items-center justify-end gap-2">
            <button type="button" onClick={() => { resetForm(); setShowForm(false); }}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm">Άκυρο</button>
            <button type="button" onClick={handleSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-emerald-500/20">
              💾 {editingId ? 'Ενημέρωση' : 'Αποθήκευση'}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {teachers.length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-8 text-center text-zinc-500">
            Δεν υπάρχουν καθηγητές ακόμα.
          </div>
        ) : teachers.map(t => (
          <div key={t.id} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
              {(t.lastName?.[0] || '') + (t.firstName?.[0] || '')}
            </div>
            <div className="flex-1">
              <div className="font-bold text-white">{t.lastName} {t.firstName}</div>
              <div className="text-xs text-zinc-400">
                📚 {t.subject} · 📞 {t.phone || '—'} · 📧 {t.email || '—'}
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
