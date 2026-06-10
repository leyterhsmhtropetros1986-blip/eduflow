"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Check, 
  Mail, 
  Phone, 
  Clock, 
  CalendarDays 
} from "lucide-react";

// Διαθέσιμες ημέρες βάσει του UI (image_c7da92.png)
const DAYS_OF_WEEK = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // Στοιχεία Φόρμας
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("Μαθηματικά");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Διαθεσιμότητα (Πολλαπλή Επιλογή Ημερών)
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  // Σπαστό Ωράριο (Πρωί / Απόγευμα ή Ελεύθερο Κείμενο)
  const [workingHours, setWorkingHours] = useState("");

  // Φόρτωση από το localStorage κατά το build
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("eduflow_teachers");
    if (stored) {
      setTeachers(JSON.parse(stored));
    } else {
      // Default αρχικά δεδομένα για να μην είναι άδεια η οθόνη στην αρχή
      const defaults = [
        { 
          id: "t1", 
          name: "Ελένη Παπαδοπούλου", 
          specialty: "Μαθηματικά", 
          email: "eleni@eduflow.gr", 
          phone: "6944123456",
          days: ["Δευτέρα", "Τετάρτη"],
          hours: "Σπαστό Ωράριο (09:00-13:00 & 17:00-21:00)"
        },
        { 
          id: "t2", 
          name: "Κωνσταντίνος Βασιλείου", 
          specialty: "Φυσική", 
          email: "kostas@eduflow.gr", 
          phone: "6977123456",
          days: ["Τρίτη", "Πέμπτη"],
          hours: "Απογευματινό (16:00-21:00)"
        }
      ];
      setTeachers(defaults);
      localStorage.setItem("eduflow_teachers", JSON.stringify(defaults));
    }
  }, []);

  // Διαχείριση επιλογής ημερών (Toggle)
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Υποβολή Φόρμας και Αποθήκευση
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία (Όνομα, Κινητό)!");
      return;
    }

    const newTeacher = {
      id: Date.now().toString(),
      name,
      specialty,
      email: email || "info@eduflow.gr",
      phone,
      days: selectedDays.length > 0 ? selectedDays : ["Όλες οι ημέρες"],
      hours: workingHours || "Συμβατικό Ωράριο"
    };

    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));

    // Reset Φόρμας
    setName("");
    setEmail("");
    setPhone("");
    setSelectedDays([]);
    setWorkingHours("");
    alert("💾 Ο καθηγητής και το ωράριό του αποθηκεύτηκαν επιτυχώς!");
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
      description="Πλήρες προφίλ εκπαιδευτικών, αναθέσεις τάξεων, τηλέφωνα, email και σπαστά ωράρια ανά ημέρα."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: ΠΙΝΑΚΑΣ / ΚΑΤΑΛΟΓΟΣ ΚΑΘΗΓΗΤΩΝ (Premium Dark UI) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Κατάλογος Καθηγητών
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Καθηγητής</th>
                  <th className="pb-3">Ειδικότητα</th>
                  <th className="pb-3">Επικοινωνία</th>
                  <th className="pb-3">Διαθεσιμότητα / Ώρες</th>
                  <th className="pb-3 text-right">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-4 font-semibold text-white">{t.name}</td>
                    <td className="py-4">
                      <span className="bg-purple-500/10 text-purple-400 border border-purple-500/10 px-2 py-1 rounded-md font-medium">
                        {t.specialty}
                      </span>
                    </td>
                    <td className="py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono">{t.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-600" />
                        <span className="font-mono">{t.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 space-y-1 max-w-[220px]">
                      <div className="flex items-center gap-1 text-amber-400 font-medium">
                        <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{t.days.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                        <span className="text-emerald-400 font-medium">{t.hours}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => handleDelete(t.id)} 
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-xl transition"
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

        {/* ΔΕΞΙΑ: ΦΟΡΜΑ ΠΡΟΣΘΗΚΗΣ ΜΕ ΔΙΑΘΕΣΙΜΟΤΗΤΑ ΚΑΙ ΣΠΑΣΤΑ ΩΡΑΡΙΑ */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-purple-400" /> Προσθήκη Καθηγητή
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Ονοματεπώνυμο *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="π.χ. Ιωάννης Παππάς" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium" 
                required 
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Ειδικότητα *</label>
              <select 
                value={specialty} 
                onChange={(e) => setSpecialty(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Μαθηματικά">Μαθηματικά</option>
                <option value="Φυσική">Φυσική</option>
                <option value="Φιλολογικά">Φιλολογικά</option>
                <option value="Έκθεση">Έκθεση</option>
                <option value="Χημεία">Χημεία</option>
                <option value="Βιολογία">Βιολογία</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Email Επικοινωνίας</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="teacher@eduflow.gr" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" 
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Κινητό Τηλέφωνο *</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="69xxxxxxxx" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" 
                  required
                />
              </div>
            </div>

            {/* ΔΙΑΘΕΣΙΜΟΤΗΤΑ ΑΝΑ ΗΜΕΡΑ (image_c7da92.png) */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-2 font-medium">Δαθεσιμότητα ανά Ημέρα</label>
              <div className="grid grid-cols-3 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition text-center ${
                        isSelected 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ΣΠΑΣΤΟ ΩΡΑΡΙΟ / ΩΡΕΣ ΜΕΣΑ ΣΤΗΝ ΗΜΕΡΑ */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Ωράριο Διδασκαλίας / Σπαστό</label>
              <input 
                type="text" 
                value={workingHours} 
                onChange={(e) => setWorkingHours(e.target.value)} 
                placeholder="π.χ. 10:00-13:00 & 17:00-21:00" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium" 
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Πληκτρολογήστε τις ώρες ή αν πρόκειται για σπαστό ωράριο μέσα στην ημέρα.
              </span>
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5 mt-2"
            >
              <Check className="w-4 h-4" /> Αποθήκευση Καθηγητή
            </button>
          </form>
        </div>

      </div>
    </WorkspaceShell>
  );
}