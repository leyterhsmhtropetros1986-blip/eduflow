"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { 
  Users, 
  UserPlus, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  Mail, 
  Briefcase,
  AlertCircle
} from "lucide-react";

// Δείγματα Ειδικοτήτων
const SPECIALTIES = [
  "Μαθηματικός", "Φυσικός", "Χημικός", "Βιολόγος", 
  "Φιλόλογος", "Πληροφορικός", "Αγγλικών", "Γερμανικών"
];

const DAYS = [
  { id: "Mon", name: "Δευτέρα" },
  { id: "Tue", name: "Τρίτη" },
  { id: "Wed", name: "Τετάρτη" },
  { id: "Thu", name: "Πέμπτη" },
  { id: "Fri", name: "Παρασκευή" },
  { id: "Sat", name: "Σάββατο" },
];

export default function TeacherHub() {
  const [mounted, setMounted] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  // Φόρμα
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [availability, setAvailability] = useState<any>({});

  useEffect(() => { setMounted(true); }, []);

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]
    );
    if (!availability[dayId]) {
      setAvailability({ ...availability, [dayId]: { start: "16:00", end: "21:00" } });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialty) {
      alert("⚠️ Το Ονοματεπώνυμο και η Ειδικότητα είναι υποχρεωτικά!");
      return;
    }

    const newTeacher = {
      id: Date.now().toString(),
      name,
      specialty,
      email,
      schedule: selectedDays.map(day => ({
        day,
        times: availability[day]
      }))
    };

    setTeachers([...teachers, newTeacher]);
    setName(""); setSpecialty(""); setEmail(""); setSelectedDays([]);
    alert("✅ Ο καθηγητής προστέθηκε με επιτυχία!");
  };

  return (
    <WorkspaceShell 
      title="Educator Enterprise Hub" 
      description="Διαχείριση προσωπικού, εξειδικεύσεων και ωραρίου σε Premium Dark περιβάλλον."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2 sm:px-4 pb-20">
        
        {/* FORM COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><UserPlus className="w-5 h-5" /></div>
              <h3 className="text-base font-bold text-white">Προσθήκη Καθηγητή</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  Ονοματεπώνυμο <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="π.χ. Ιωάννης Παππάς"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  Ειδικότητα <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={specialty} onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition"
                >
                  <option value="">Επιλέξτε Ειδικότητα</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Email Επικοινωνίας</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@eduflow.gr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div className="pt-4 border-t border-slate-800/60">
                <label className="text-xs font-semibold text-slate-400 mb-3 block">Διαθεσιμότητα ανά Ημέρα</label>
                <div className="grid grid-cols-3 gap-2">
                  {DAYS.map(day => (
                    <button
                      type="button" key={day.id} onClick={() => toggleDay(day.id)}
                      className={`p-2 rounded-xl border text-[10px] font-bold transition-all ${
                        selectedDays.includes(day.id) 
                          ? "bg-indigo-600/20 border-indigo-500 text-white" 
                          : "bg-slate-950 border-slate-800 text-slate-500"
                      }`}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDays.length > 0 && (
                <div className="space-y-3 mt-4 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Ωράριο Επιλεγμένων Ημερών</label>
                  {selectedDays.map(dayId => (
                    <div key={dayId} className="flex items-center justify-between bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                      <span className="text-xs text-slate-300">{DAYS.find(d => d.id === dayId)?.name}</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="time" value={availability[dayId]?.start}
                          onChange={(e) => setAvailability({...availability, [dayId]: {...availability[dayId], start: e.target.value}})}
                          className="bg-transparent text-[10px] text-white focus:outline-none"
                        />
                        <span className="text-slate-600">-</span>
                        <input 
                          type="time" value={availability[dayId]?.end}
                          onChange={(e) => setAvailability({...availability, [dayId]: {...availability[dayId], end: e.target.value}})}
                          className="bg-transparent text-[10px] text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold transition shadow-xl shadow-indigo-600/20">
                Αποθήκευση Καθηγητή
              </button>
            </form>
          </div>
        </div>

        {/* LIST COLUMN */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-xl min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Ενεργό Προσωπικό
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-full uppercase tracking-tighter">
                {teachers.length} Καθηγητές
              </span>
            </div>

            {teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-xs font-medium">Δεν υπάρχουν καταχωρημένοι καθηγητές.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
                      <th className="pb-3 font-semibold">Καθηγητής</th>
                      <th className="pb-3 font-semibold">Ειδικότητα</th>
                      <th className="pb-3 font-semibold">Ωράριο</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {teachers.map((t) => (
                      <tr key={t.id} className="group hover:bg-slate-800/20 transition">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                              {t.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-200">{t.name}</div>
                              <div className="text-[10px] text-slate-500">{t.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {t.specialty}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1">
                            {t.schedule.map((s: any) => (
                              <span key={s.day} className="text-[9px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded-md">
                                {s.day} ({s.times.start})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ενεργός
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}