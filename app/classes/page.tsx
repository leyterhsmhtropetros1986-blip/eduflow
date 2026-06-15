'use client';

import { useEffect, useState } from 'react';

type ClassUnit = {
  id: string;
  category: string;       // π.χ. "Α Γυμνασίου"
  name: string;           // π.χ. "Α1"
  capacity?: number;
};

const CATEGORIES = [
  'Α Γυμνασίου', 'Β Γυμνασίου', 'Γ Γυμνασίου',
  'Α Λυκείου', 'Β Λυκείου', 'Γ Λυκείου',
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassUnit[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkCount, setBulkCount] = useState<number>(3);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('eduflow_classes');
    if (stored) setClasses(JSON.parse(stored));
  }, []);

  const persist = (list: ClassUnit[]) => {
    setClasses(list);
    localStorage.setItem('eduflow_classes', JSON.stringify(list));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Bulk save (πρώην Bulk Create — μετονομάστηκε σε «Αποθήκευση»)
  const handleBulkSave = () => {
    const e: { [k: string]: string } = {};
    if (!bulkCategory) e.bulkCategory = 'Επίλεξε τάξη';
    if (!bulkCount || bulkCount < 1) e.bulkCount = 'Μη έγκυρος αριθμός';
    if (bulkCount > 20) e.bulkCount = 'Πολύ μεγάλος αριθμός (max 20)';

    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});

    // Δημιουργία ή αναπροσαρμογή
    // Αφαιρώ τυχόν υπάρχοντα και ξαναφτιάχνω
    const prefix = bulkCategory.split(' ')[0].charAt(0); // π.χ. "Α"
    const newOnes: ClassUnit[] = [];
    for (let i = 1; i <= bulkCount; i++) {
      newOnes.push({
        id: `${bulkCategory}-${prefix}${i}-${Date.now()}-${i}`,
        category: bulkCategory,
        name: `${prefix}${i}`,
      });
    }

    // Διαγραφή υπαρχόντων ίδιας κατηγορίας και αντικατάσταση
    const filtered = classes.filter(c => c.category !== bulkCategory);
    const updated = [...filtered, ...newOnes];
    persist(updated);
    showToast(`✓ Αποθηκεύτηκαν ${newOnes.length} τμήματα για ${bulkCategory}`);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Διαγραφή τμήματος;')) return;
    persist(classes.filter(c => c.id !== id));
    showToast('🗑 Διαγράφηκε');
  };

  // Group by category
  const grouped = classes.reduce<{ [k: string]: ClassUnit[] }>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Τμήματα</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Όρισε μία φορά τα τμήματά σου εδώ. Παντού αλλού θα επιλέγονται από dropdown — όχι πια typos.
        </p>
      </div>

      {/* Bulk Quick-Save */}
      <div className="bg-indigo-500/5 border border-indigo-500/30 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-bold text-indigo-400 mb-3 uppercase tracking-wide">
          🚀 Γρήγορη Δημιουργία
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">
              Τάξη *
            </label>
            <select value={bulkCategory}
              onChange={e => setBulkCategory(e.target.value)}
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.bulkCategory ? 'border-rose-500' : 'border-zinc-700'}`}>
              <option value="">— Επίλεξε τάξη —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.bulkCategory && <p className="text-xs text-rose-400 mt-1">{errors.bulkCategory}</p>}
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1 block">
              Αριθμός τμημάτων *
            </label>
            <input type="number" min={1} max={20} value={bulkCount}
              onChange={e => setBulkCount(parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-white ${errors.bulkCount ? 'border-rose-500' : 'border-zinc-700'}`} />
            {errors.bulkCount && <p className="text-xs text-rose-400 mt-1">{errors.bulkCount}</p>}
          </div>
          <button onClick={handleBulkSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-emerald-500/20">
            💾 Αποθήκευση
            {bulkCategory && bulkCount > 0 && (
              <span className="text-xs ml-2 opacity-80">
                ({Array.from({ length: Math.min(bulkCount, 6) }, (_, i) => {
                  const p = bulkCategory.split(' ')[0].charAt(0);
                  return `${p}${i + 1}`;
                }).join(', ')}{bulkCount > 6 ? '...' : ''})
              </span>
            )}
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          💡 π.χ. «Α Γυμνασίου» + «6» → δημιουργεί Α1, Α2, Α3, Α4, Α5, Α6.
          Αν υπάρχουν ήδη τμήματα στην τάξη, θα αντικατασταθούν.
        </p>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-8 text-center text-zinc-500">
            Δεν υπάρχουν τμήματα. Χρησιμοποίησε τη «Γρήγορη Δημιουργία» πάνω.
          </div>
        ) : (
          CATEGORIES.filter(cat => grouped[cat]).map(cat => (
            <div key={cat} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide">
                  {cat} <span className="text-zinc-500">({grouped[cat].length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {grouped[cat].map(c => (
                  <div key={c.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-2 flex items-center justify-between">
                    <span className="font-bold text-white">{c.name}</span>
                    <button onClick={() => handleDelete(c.id)}
                      className="text-rose-400 hover:text-rose-300 text-xs">🗑</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
