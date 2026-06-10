"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { UserPlus, Users, Trash2, Check } from "lucide-react";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("Μαθηματικά");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_teachers");
    if (stored) {
      setTeachers(JSON.parse(stored));
    } else {
      const defaults = [
        { id: "1", name: "Ελένη Παπαδοπούλου", specialty: "Μαθηματικά", email: "eleni@eduflow.gr" },
        { id: "2", name: "Κωνσταντίνος Βασιλείου", specialty: "Φυσική", email: "kostas@eduflow.gr" }
      ];
      setTeachers(defaults);
      localStorage.setItem("eduflow_teachers", JSON.stringify(defaults));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newTeacher = {
      id: Date.now().toString(),
      name,
      specialty,
      email: email || "info@eduflow.gr"
    };

    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));

    setName("");
    setEmail("");
  };

  const handleDelete = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Πλήρες προφίλ εκπαιδευτικών, αναθέσεις τάξεων και σπαστά ωράρια.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΛΙΣΤΑ ΚΑΘΗΓΗΤΩΝ */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Κατάλογος Καθηγητών
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Όνομα</th>
                  <th className="pb-3">Ειδικότητα</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3 text-right">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/20">
                    <td className="py-3 font-semibold text-white">{t.name}</td>
                    <td className="py-3 text-purple-400 font-medium">{t.specialty}</td>
                    <td className="py-3 font-mono text-slate-400">{t.email}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ΦΟΡΜΑ ΠΡΟΣΘΗΚΗΣ */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-purple-400" /> Προσθήκη Καθηγητή
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Ονοματεπώνυμο *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="π.χ. Ιωάννης Παππάς" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Ειδικότητα *</label>
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="Μαθηματικά">Μαθηματικά</option>
                <option value="Φυσική">Φυσική</option>
                <option value="Φιλολογικά">Φιλολογικά</option>
                <option value="Έκθεση">Έκθεση</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Email Επικοινωνίας</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@eduflow.gr" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" /> Αποθήκευση Καθηγητή
            </button>
          </form>
        </div>

      </div>
    </WorkspaceShell>
  );
}