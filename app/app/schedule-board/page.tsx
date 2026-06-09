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
      title="📅 Εβδομαδιαίο Πρόγραμμα"
      description="Προβολή μαθημάτων ανά ημέρα και ώρα"
    >
      <div className="overflow-x-auto rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
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
    </WorkspaceShell>
  );
}