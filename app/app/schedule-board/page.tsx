"use client";

import { WorkspaceShell } from "../components/WorkspaceShell";

const schedule = [
  {
    time: "16:00",
    monday: "Μαθηματικά Γ3",
    tuesday: "",
    wednesday: "Φυσική Β2",
    thursday: "",
    friday: "",
  },
  {
    time: "17:00",
    monday: "",
    tuesday: "Χημεία Γ3",
    wednesday: "",
    thursday: "Έκθεση Α1",
    friday: "",
  },
  {
    time: "18:00",
    monday: "Πληροφορική",
    tuesday: "",
    wednesday: "Μαθηματικά",
    thursday: "",
    friday: "ΑΟΘ",
  },
];

export default function ScheduleBoardPage() {
  return (
    <WorkspaceShell
      title="Εβδομαδιαίο Πρόγραμμα"
      description="Προβολή των μαθημάτων ανά ημέρα και ώρα, για γρήγορη εποπτεία του εβδομαδιαίου πλάνου."
    >
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Πίνακας προγράμματος</h2>
            <p className="mt-1 text-sm text-slate-500">Μια γρήγορη επισκόπηση για το τρέχον εβδομαδιαίο πρόγραμμα των μαθημάτων.</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Ενημέρωση σε πραγματικό χρόνο</div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200">

        <table className="w-full">
          <thead>
            <tr>
              <th className="border p-3">Ώρα</th>
              <th className="border p-3">Δευτέρα</th>
              <th className="border p-3">Τρίτη</th>
              <th className="border p-3">Τετάρτη</th>
              <th className="border p-3">Πέμπτη</th>
              <th className="border p-3">Παρασκευή</th>
            </tr>
          </thead>

          <tbody>
            {schedule.map((slot) => (
              <tr key={slot.time}>
                <td className="border p-3">{slot.time}</td>
                <td className="border p-3">{slot.monday}</td>
                <td className="border p-3">{slot.tuesday}</td>
                <td className="border p-3">{slot.wednesday}</td>
                <td className="border p-3">{slot.thursday}</td>
                <td className="border p-3">{slot.friday}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </WorkspaceShell>
  );
}