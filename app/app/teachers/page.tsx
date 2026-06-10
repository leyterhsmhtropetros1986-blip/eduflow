"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { Trash2, Check } from "lucide-react";

// Όλες οι τάξεις από το UI σου (image_c6fd57.png)
const AVAILABLE_CLASSES = [
  "A' ΓΥΜΝΑΣΙΟΥ", "B' ΓΥΜΝΑΣΙΟΥ", "Γ' ΓΥΜΝΑΣΙΟΥ", 
  "A' ΛΥΚΕΙΟΥ", "B' ΛΥΚΕΙΟΥ", "Γ' ΛΥΚΕΙΟΥ"
];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // States Φόρμας
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("Μαθηματικά");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState("Σπαστό Ωράριο Ενεργό");

  // Φόρτωση δεδομένων
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("eduflow_teachers");
    if (stored) {
      setTeachers(JSON.parse(stored));
    } else {
      const defaults = [
        { 
          id: "t1", 
          name: "Ελένη Παπαδοπούλου", 
          specialty: "Μαθηματικά", 
          classes: ["A' ΓΥΜΝΑΣΙΟΥ", "Γ' ΓΥΜΝΑΣΙΟΥ"],
          hours: "Σπαστό Ωράριο Ενεργό"
        }
      ];
      setTeachers(defaults);
      localStorage.setItem("eduflow_teachers", JSON.stringify(defaults));
    }
  }, []);

  // Toggle επιλογής τάξης (κλικ πάνω στα badges)
  const handleClassToggle = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter(c => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  // Αποθήκευση στη "βάση"
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newTeacher = {
      id: Date.now().toString(),
      name,
      specialty,
      classes: selectedClasses.length > 0 ? selectedClasses : ["Δεν ορίστηκαν"],
      hours: workingHours || "Συμβατικό Ωράριο"
    };

    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));

    // Reset Φόρμας
    setName("");
    setSelectedClasses([]);
    setWorkingHours("Σπαστό Ωράριο Ενεργό");
  };

  // Διαγραφή Καθηγητή
  const handleDelete = (id: string) => {
    const updated = teachers.filter(t => t.id !== id);
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
  };

  if (!mounted) return null;

  return (
    <WorkspaceShell 
      title="Διαχείριση Καθηγητών" 
      description="Πλήρες προφίλ εκπαιδευτικών, αναθέσεις τάξεων και σπαστά ωράρια."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: ΦΟΡΜΑ ΠΡΟΣΘΗΚΗΣ ΚΑΘΗΓΗΤΗ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
            <span className="text-indigo-400">👤+</span> Προσθήκη Καθηγητή
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Ονοματεπώνυμο */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Ονοματεπώνυμο *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="π.χ. Κωνσταντίνος Βασιλείου" 
                className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" 
                required 
              />
            </div>

            {/* Ειδικότητα */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Ειδικότητα *</label>
              <select 
                value={specialty} 
                onChange={(e) => setSpecialty(e.target.value)} 
                className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Μαθηματικά">Μαθηματικά</option>
                <option value="Φυσική">Φυσική</option>
                <option value="Φιλολογικά">Φιλολογικά</option>
                <option value="Έκθεση">Έκθεση</option>
              </select>
            </div>

            {/* Τάξεις Διδασκαλίας (Clickable Badges όπως στη φωτογραφία σου) */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-2 font-medium">Τάξεις Διδασκαλίας</label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_CLASSES.map((cls) => {
                  const isSelected = selectedClasses.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => handleClassToggle(cls)}
                      className={`py-2 px-2 rounded-lg text-[10px] font-bold border transition text-center ${
                        isSelected 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md" 
                          : "bg-[#0b0e14] border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {cls}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ωράριο */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 font-medium">Ωράριο</label>
              <input 
                type="text" 
                value={workingHours} 
                onChange={(e) => setWorkingHours(e.target.value)} 
                placeholder="π.χ. Σπαστό Ωράριο Ενεργό" 
                className="w-full bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none" 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Αποθήκευση Καθηγητή
            </button>
          </form>
        </div>

        {/* ΔΕΞΙΑ: ΚΑΤΑΛΟΓΟΣ ΚΑΘΗΓΗΤΩΝ */}
        <div className="lg:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">👥</span> Κατάλογος Καθηγητών
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                  <th className="pb-3">Όνομα</th>
                  <th className="pb-3">Ειδικότητα</th>
                  <th className="pb-3">Τάξεις</th>
                  <th className="pb-3">Ωράριο</th>
                  <th className="pb-3 text-right">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/10">
                    <td className="py-4 font-bold text-white">{t.name}</td>
                    <td className="py-4 text-purple-400 font-medium">{t.specialty}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {t.classes.map((c: string, idx: number) => (
                          <span key={idx} className="bg-slate-950 text-slate-400 border border-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-emerald-400 font-medium">{t.hours}</td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => handleDelete(t.id)} 
                        className="text-red-400 hover:text-red-300 p-1 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
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