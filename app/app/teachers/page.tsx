"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { Users, UserPlus, Trash2 } from "lucide-react";

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
      // Αρχικά default δεδομένα αν η βάση είναι άδεια
      const defaultTeachers = [
        { id: "t1", name: "Ελένη Παπαδοπούλου", specialty: "Μαθηματικά", email: "eleni@eduflow.gr" },
        { id: "t2", name: "Κωνσταντίνος Βασιλείου", specialty: "Φυσική", email: "kostas@eduflow.gr" }
      ];
      localStorage.setItem("eduflow_teachers", JSON.stringify(defaultTeachers));
      setTeachers(defaultTeachers);
    }
  }, []);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert("⚠️ Παρακαλώ συμπληρώστε όλα τα πεδία!");
      return;
    }

    const newTeacher = {
      id: `teacher-${Date.now()}`,
      name,
      specialty,
      email
    };

    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));

    setName("");
    setEmail("");
    alert("🎉 Ο καθηγητής καταχωρήθηκε με επιτυχία!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Είστε σίγουροι για τη διαγραφή αυτού του καθηγητή;")) {
      const updated = teachers.filter(t => t.id !== id);
      setTeachers(updated);
      localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
    }
  };

  return (
    <WorkspaceShell 
      title="Διαχείριση Καθηγητών" 
      description="Πλήρες προφίλ εκπαιδευτικών, διαχείριση ειδικοτήτων και αυτόματη σύνδεση με το σύστημα έξυπνης ανάθεσης τμημάτων."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΛΙΣΤΑ ΚΑΘΗΓΗΤΩΝ */}
        <div className="lg:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Κατάλογος Ενεργών Καθηγητών
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-[10px] uppercase">
                  <th className="pb-3">Όνομα</th>
                  <th className="pb-3">Ειδικότητα</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3 text-right">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {teachers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/10 transition">
                    <td className="py-3.5 font-semibold text-white">{t.name}</td>
                    <td className="py-3.5 text-purple-400 font-medium">{t.specialty}</td>
                    <td className="py-3.5 text-slate-400 font-mono">{t.email}</td>
                    <td className="py-3.5 text-right">
                      <button onClick={() => handleDelete(t.id)} className="text-rose-500 hover:text-rose-400 p-1 transition">
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
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-400" /> Προσθήκη Καθηγητή
          </h3>
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ονοματεπώνυμο *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="π.χ. Ιωάννης Παππάς" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ειδικότητα *</label>
              <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none">
                {["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Ιστορία", "Έκθεση"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Επικοινωνίας *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teacher@eduflow.gr" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md">
              Αποθήκευση Καθηγητή
            </button>
          </form>
        </div>

      </div>
    </WorkspaceShell>
  );
}