"use client";

import { useState } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { Users, UserPlus, Plus, Trash2, BookOpen } from "lucide-react";

const SPECIALTIES = ["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Φιλολογικά"];
const CLASSES = ["Α' ΓΥΜΝΑΣΙΟΥ", "Β' ΓΥΜΝΑΣΙΟΥ", "Γ' ΓΥΜΝΑΣΙΟΥ", "Α' ΛΥΚΕΙΟΥ", "Β' ΛΥΚΕΙΟΥ", "Γ' ΛΥΚΕΙΟΥ"];
const DAYS = [
  { id: "Mon", name: "Δευτέρα" },
  { id: "Tue", name: "Τρίτη" },
  { id: "Wed", name: "Τετάρτη" },
  { id: "Thu", name: "Πέμπτη" },
  { id: "Fri", name: "Παρασκευή" },
  { id: "Sat", name: "Σάββατο" }
];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([
    { id: "1", name: "Ελένη Παπαδοπούλου", specialty: "Μαθηματικά", classes: ["Α' ΓΥΜΝΑΣΙΟΥ", "Γ' ΓΥΜΝΑΣΙΟΥ"], schedule: [{ day: "Mon", slots: [{ start: "14:00", end: "16:00" }, { start: "17:00", end: "19:00" }] }] }
  ]);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, Array<{ start: string; end: string }>>>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialty) return alert("Συμπληρώστε τα υποχρεωτικά πεδία!");
    
    setTeachers([...teachers, {
      id: Date.now().toString(),
      name,
      specialty,
      classes: selectedClasses,
      schedule: selectedDays.map(d => ({ day: d, slots: availability[d] || [] }))
    }]);
    setName(""); setSpecialty(""); setSelectedClasses([]); setSelectedDays([]); setAvailability({});
  };

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Πλήρες προφίλ εκπαιδευτικών, αναθέσεις τάξεων και σπαστά ωράρια.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
        
        {/* ΦΟΡΜΑ - ΔΙΟΡΘΩΜΕΝΗ ΜΕ ΥΨΗΛΗ ΑΝΤΙΘΕΣΗ */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-400" /> Προσθήκη Καθηγητή
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">Ονοματεπώνυμο *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Κωνσταντίνος Βασιλείου" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">Ειδικότητα *</label>
              <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none">
                <option value="">Επιλέξτε Ειδικότητα</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">Τάξεις Διδασκαλίας</label>
              <div className="grid grid-cols-2 gap-1.5">
                {CLASSES.map(c => (
                  <button type="button" key={c} onClick={() => setSelectedClasses(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} className={`p-2 rounded-lg text-[11px] font-bold border transition ${selectedClasses.includes(c) ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-950 border-slate-800 text-slate-300"}`}>{c}</button>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold transition mt-2">Αποθήκευση Καθηγητή</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4">Κατάλογος Καθηγητών</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-800">
                  <th className="pb-3">Όνομα</th>
                  <th className="pb-3">Ειδικότητα</th>
                  <th className="pb-3">Τάξεις</th>
                  <th className="pb-3">Ωράριο</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {teachers.map(t => (
                  <tr key={t.id}>
                    <td className="py-3 text-sm font-bold text-white">{t.name}</td>
                    <td className="py-3 text-sm text-slate-300">{t.specialty}</td>
                    <td className="py-3"><div className="flex gap-1">{t.classes.map(c => <span key={c} className="text-[10px] bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded">{c}</span>)}</div></td>
                    <td className="py-3 text-xs text-emerald-400 font-mono">Σπαστό Ωράριο Ενεργό</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}