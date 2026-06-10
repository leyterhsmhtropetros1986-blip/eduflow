"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { fetchParents } from "../lib/api";
import type { ParentContact } from "../lib/data";

export default function ParentsPage() {
  const [parents, setParents] = useState<ParentContact[]>([]);

  useEffect(() => {
    fetchParents().then(setParents);
  }, []);

  return (
    <WorkspaceShell
      title="Πύλη Γονέων"
      description="Παροχή πρόσβασης σε παρουσίες, πληρωμές και πρόοδο μαθημάτων από μια ενιαία πύλη."
    >
      <section className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Επαφές γονέων</h2>
            <p className="mt-1 text-sm text-slate-500">Διαχειριστείτε τα στοιχεία κηδεμόνων και στείλτε σύντομα μηνύματα για την πρόοδο των μαθητών.</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Η πρόσβαση είναι έτοιμη</div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Γονέας</th>
                <th className="px-4 py-3 text-left font-semibold">Μαθητής</th>
                <th className="px-4 py-3 text-left font-semibold">Σχέση</th>
                <th className="px-4 py-3 text-left font-semibold">Επικοινωνία</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {parents.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-900">{record.parentName}</td>
                  <td className="px-4 py-4 text-slate-600">{record.student}</td>
                  <td className="px-4 py-4 text-slate-600">{record.relationship}</td>
                  <td className="px-4 py-4 text-slate-600">{record.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Κέντρο μηνυμάτων</div>
            <p className="mt-2 text-sm text-slate-600">Στείλτε ενημερώσεις για επερχόμενες συνεδρίες και ειδοποιήσεις απουσιών.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Πρόοδος μαθητή</div>
            <p className="mt-2 text-sm text-slate-600">Συνδέστε τα προφίλ γονέων με την πρόοδο στα μαθήματα και τα συνοπτικά στοιχεία παρουσιών.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Επισκόπηση πληρωμών</div>
            <p className="mt-2 text-sm text-slate-600">Μοιράζετε τιμολόγια και ιστορικό πληρωμών απευθείας με τους λογαριασμούς των οικογενειών.</p>
          </div>
        </div>
      </section>
    </WorkspaceShell>
  );
}
