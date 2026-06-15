'use client';

import { useEffect, useState } from 'react';

type ClassUnit = {
  id: string;
  category: string;
  name: string;
  teacherId?: string;
  roomId?: string;
  schedule?: { day: string; from: string; to: string }[];
  studentIds?: string[];
};

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  subject?: string;
};

type Room = {
  id: string;
  name: string;
  capacity?: number;
};

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  parentPhone?: string;
};

export default function ClassDetailView({
  selectedClass,
  onClose,
}: {
  selectedClass: ClassUnit;
  onClose: () => void;
}) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<ClassUnit>(selectedClass);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setTeachers(JSON.parse(localStorage.getItem('eduflow_teachers') || '[]'));
    setRooms(JSON.parse(localStorage.getItem('eduflow_rooms') || '[]'));
    setStudents(JSON.parse(localStorage.getItem('eduflow_students') || '[]'));
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const teacher = teachers.find(t => t.id === selectedClass.teacherId);
  const room = rooms.find(r => r.id === selectedClass.roomId);
  const classStudents = students.filter(s =>
    selectedClass.studentIds?.includes(s.id) || s.category === selectedClass.category
  );

  const handleSaveEdit = () => {
    const allClasses: ClassUnit[] = JSON.parse(localStorage.getItem('eduflow_classes') || '[]');
    const updated = allClasses.map(c => c.id === form.id ? form : c);
    localStorage.setItem('eduflow_classes', JSON.stringify(updated));
    showToast('✓ Αποθηκεύτηκε');
    setEditMode(false);
  };

  // PRINT — απλώς window.print με κατάλληλο styling
  const handlePrint = () => {
    window.print();
  };

  // PDF Export — χρησιμοποιεί browser's print to PDF
  const handlePdfExport = () => {
    // Άνοιγμα σε νέο tab με μόνο τα δεδομένα + αυτόματη εκτύπωση→PDF
    const html = `<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8" />
<title>${selectedClass.name} - ${selectedClass.category}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
  h1 { color: #4f46e5; border-bottom: 3px solid #4f46e5; padding-bottom: 8px; margin-bottom: 16px; }
  h2 { color: #4f46e5; margin-top: 20px; font-size: 16px; border-bottom: 1px solid #d4d4d8; padding-bottom: 4px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .meta div { padding: 8px; background: #f4f4f5; border-radius: 4px; }
  .meta b { color: #4f46e5; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  th, td { border: 1px solid #d4d4d8; padding: 6px 8px; text-align: left; }
  th { background: #f4f4f5; font-weight: 700; color: #4f46e5; }
  .footer { margin-top: 30px; font-size: 10px; color: #71717a; text-align: center; }
  @media print {
    @page { margin: 1.5cm; }
  }
</style>
</head>
<body>
<h1>${selectedClass.name} — ${selectedClass.category}</h1>

<div class="meta">
  <div><b>Καθηγητής:</b> ${teacher ? `${teacher.lastName} ${teacher.firstName}` : 'Δεν έχει ανατεθεί'}${teacher?.subject ? ` (${teacher.subject})` : ''}</div>
  <div><b>Αίθουσα:</b> ${room ? room.name : 'Δεν έχει ανατεθεί'}</div>
</div>

<h2>Πρόγραμμα Εβδομάδας</h2>
<table>
  <thead><tr><th>Ημέρα</th><th>Ώρες</th></tr></thead>
  <tbody>
    ${['Δευτέρα','Τρίτη','Τετάρτη','Πέμπτη','Παρασκευή','Σάββατο'].map(day => {
      const slots = selectedClass.schedule?.filter(s => s.day === day) || [];
      const text = slots.length ? slots.map(s => `${s.from}–${s.to}`).join(', ') : '—';
      return `<tr><td><b>${day}</b></td><td>${text}</td></tr>`;
    }).join('')}
  </tbody>
</table>

<h2>Μαθητές (${classStudents.length})</h2>
<table>
  <thead>
    <tr><th>#</th><th>Επώνυμο</th><th>Όνομα</th><th>Τηλ. Γονέα</th></tr>
  </thead>
  <tbody>
    ${classStudents.length === 0
      ? `<tr><td colspan="4" style="text-align:center;color:#71717a;">Κανένας μαθητής</td></tr>`
      : classStudents.map((s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${s.lastName}</td>
          <td>${s.firstName}</td>
          <td>${s.parentPhone || '—'}</td>
        </tr>
      `).join('')}
  </tbody>
</table>

<div class="footer">
  Εκτυπώθηκε από EduFlow · ${new Date().toLocaleDateString('el-GR')}
</div>

<script>
  window.onload = () => {
    window.print();
    // Don't close — let user decide
  };
</script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      alert('Επίτρεψε popups για να γίνει η εκτύπωση/PDF.');
    }
    showToast('📄 Άνοιξε το print dialog — διάλεξε «Save as PDF»');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{selectedClass.name}</h2>
          <p className="text-xs text-indigo-400 mt-1">{selectedClass.category}</p>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm">
          ✕ Κλείσιμο
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1">Καθηγητής</div>
          {editMode ? (
            <select value={form.teacherId || ''}
              onChange={e => setForm({ ...form, teacherId: e.target.value })}
              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm text-white">
              <option value="">— Δεν έχει ανατεθεί —</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.lastName} {t.firstName} {t.subject ? `(${t.subject})` : ''}</option>
              ))}
            </select>
          ) : (
            <div className="font-semibold text-white">
              {teacher ? `${teacher.lastName} ${teacher.firstName}` : 'Δεν έχει ανατεθεί'}
            </div>
          )}
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-1">Αίθουσα</div>
          {editMode ? (
            <select value={form.roomId || ''}
              onChange={e => setForm({ ...form, roomId: e.target.value })}
              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm text-white">
              <option value="">— Δεν έχει ανατεθεί —</option>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          ) : (
            <div className="font-semibold text-white">{room ? room.name : 'Δεν έχει ανατεθεί'}</div>
          )}
        </div>
      </div>

      {/* Schedule */}
      <div className="mb-4">
        <h3 className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-2">📅 Πρόγραμμα Εβδομάδας</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'].map(day => {
            const slots = selectedClass.schedule?.filter(s => s.day === day) || [];
            return (
              <div key={day} className="bg-zinc-800 border border-zinc-700 rounded-lg p-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{day}</span>
                <span className="text-xs text-zinc-400">
                  {slots.length ? slots.map(s => `${s.from}–${s.to}`).join(', ') : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Students */}
      <div className="mb-4">
        <h3 className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-2">
          👥 Μαθητές ({classStudents.length})
        </h3>
        {classStudents.length === 0 ? (
          <div className="text-zinc-500 text-sm py-4 text-center">Κανένας μαθητής</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {classStudents.map((s, i) => (
              <div key={s.id} className="text-sm text-white bg-zinc-800 px-3 py-1.5 rounded">
                <span className="text-zinc-500 mr-2">{i + 1}.</span>
                {s.lastName} {s.firstName}
                {s.parentPhone && <span className="text-xs text-zinc-500 ml-2">📞 {s.parentPhone}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons — ΟΛΑ ΕΝΕΡΓΑ */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-700">
        {editMode ? (
          <>
            <button onClick={() => { setForm(selectedClass); setEditMode(false); }}
              className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm">
              ✕ Άκυρο
            </button>
            <button onClick={handlePrint}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm">
              🖨 Print
            </button>
            <button onClick={handleSaveEdit}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold">
              💾 Αποθήκευση
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditMode(true)}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold">
              ✏️ Edit
            </button>
            <button onClick={handlePrint}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-semibold border border-zinc-700">
              🖨 Print
            </button>
            <button onClick={handlePdfExport}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold">
              📄 PDF
            </button>
          </>
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
