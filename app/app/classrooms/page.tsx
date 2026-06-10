"use client";

import { WorkspaceShell } from "../../components/WorkspaceShell";

const rooms = [
  { name: "Αίθουσα Α1", capacity: 20, type: "Κανονική" },
  { name: "Αίθουσα Α2", capacity: 15, type: "Μικρή ομάδα" },
  { name: "Αίθουσα Β1", capacity: 25, type: "Μεγάλη αίθουσα" },
  { name: "Αίθουσα Πληροφορικής", capacity: 18, type: "Εργαστήριο" },
];

export default function ClassroomsPage() {
  return (
    <WorkspaceShell
      title="Αίθουσες"
      description="Επισκόπηση των διαθέσιμων χώρων του φροντιστηρίου και της χωρητικότητάς τους."
    >
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Διαθέσιμοι χώροι</h2>
            <p className="mt-1 text-sm text-slate-500">Οργανώστε τα μαθήματα ανά αίθουσα και ανάλογα με τη χωρητικότητα.</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">4 διαθέσιμοι χώροι</div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Αίθουσα</th>
                <th className="px-4 py-3 text-left font-semibold">Χωρητικότητα</th>
                <th className="px-4 py-3 text-left font-semibold">Τύπος</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {rooms.map((room) => (
                <tr key={room.name} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-900">{room.name}</td>
                  <td className="px-4 py-4 text-slate-600">{room.capacity} μαθητές</td>
                  <td className="px-4 py-4 text-slate-600">{room.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </WorkspaceShell>
  );
}