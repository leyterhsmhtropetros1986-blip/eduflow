"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { 
  Users, 
  UserPlus, 
  Plus, 
  Trash2, 
  Mail, 
  BookOpen, 
  Briefcase
} from "lucide-react";

const SPECIALTIES = [
  "Μαθηματικός", "Φυσικός", "Χημικός", "Βιολόγος", 
  "Φιλόλογος", "Πληροφορικός", "Αγγλικών", "Γερμανικών"
];

const CLASSES = [
  "Α' Γυμνασίου", "Β' Γυμνασίου", "Γ' Γυμνασίου",
  "Α' Λυκείου", "Β' Λυκείου", "Γ' Λυκείου"
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
  
  // Φόρμα Καθηγητή
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  // Δομή διαθεσιμότητας: { Mon: [{ start: "14:00", end: "16:00" }, { start: "17:00", end: "19:00" }] }
  const [availability, setAvailability] = useState<Record<string, Array<{ start: string; end: string }>>>({});

  useEffect(() => { setMounted(true); }, []);

  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(prev => prev.filter(id => id !== dayId));
      const newAvail = { ...availability };
      delete newAvail[dayId];
      setAvailability(newAvail);
    } else {
      setSelectedDays(prev => [...prev, dayId]);
      setAvailability(prev => ({
        ...prev,
        [dayId]: [{ start: "14:00", end: "16:00" }]
      }));
    }
  };

  const addSlot = (dayId: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), { start: "17:00", end: "19:00" }]
    }));
  };

  const removeSlot = (dayId: string, index: number) => {
    if (availability[dayId].length === 1) {
      toggleDay(dayId);
      return;
    }
    setAvailability(prev => ({
      ...prev,
      [dayId]: prev[dayId].filter((_, i) => i !== index)
    }));
  };

  const updateSlot = (dayId: string, index: number, field: "start" | "end", value: string) => {
    const updatedSlots = [...availability[dayId]];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setAvailability(prev => ({ ...prev, [dayId]: updatedSlots }));
  };

  const toggleClass = (className: string) => {
    setSelectedClasses(prev => 
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
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
      classes: selectedClasses,
      schedule: selectedDays.map(day => ({
        day,
        slots: availability[day] || []
      }))
    };

    setTeachers([...teachers, newTeacher]);
    setName(""); setSpecialty(""); setEmail(""); setSelectedDays([]); setSelectedClasses([]); setAvailability({});
    alert("✅ Ο καθηγητής προστέθηκε με επιτυχία!");
  };

  return (
    <WorkspaceShell 
      title="Educator Enterprise Hub" 
      description="Διαχείριση προσωπικού, εξειδικεύσεων και σπαστών ωραρίων σε Premium Dark περιβάλλον."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><UserPlus className="w-5 h-5" /></div>
              <h3 className="text-lg font-bold text-white">Προσθήκη Καθηγητή</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-100 flex items-center gap-1 mb-2">
                  Ονοματεπώνυμο <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="π.χ. Ιωάννης Παππάς"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-100 flex items-center gap-1 mb-2">
                  Ειδικότητα <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={specialty} onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition"
                >
                  <option value="" className="text-slate-500">Επιλέξτε Ειδικότητα</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-100 mb-2 block">Email Επικοινωνίας</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@eduflow.gr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              {/* ΕΠΙΛΟΓΗ ΤΑΞΕΩΝ */}
              <div>
                <label className="text-sm font-bold text-slate-100 mb-2 block">Τάξεις Διδασκαλίας</label>
                <div className="grid grid-cols-2 gap-2">
                  {CLASSES.map(cls => (
                    <button
                      type="button" key={cls} onClick={() => toggleClass(cls)}
                      className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        selectedClasses.includes(cls) 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* ΕΠΙΛΟΓΗ ΗΜΕΡΩΝ */}
              <div className="pt-4 border-t border-slate-800">
                <label className="text-sm font-bold text-slate-100 mb-3 block">Ημέρες Διαθεσιμότητας</label>
                <div className="grid grid-cols-3 gap-2">
                  {DAYS.map(day => (
                    <button
                      type="button" key={day.id} onClick={() => toggleDay(day.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedDays.includes(day.id) 
                          ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/10" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* ΜΗ ΣΥΝΕΧΟΜΕΝΑ ΩΡΑΡΙΑ (SPILT SLOTS) */}
              {selectedDays.length > 0 && (
                <div className="space-y-4 mt-4 pt-4 border-t border-slate-800 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Ρύθμιση Ωρών ανά Ημέρα</label>
                  
                  {selectedDays.map(dayId => (
                    <div key={dayId} className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white bg-slate-800 px-2 py-1 rounded-md">
                          {DAYS.find(d => d.id === dayId)?.name}
                        </span>
                        <button
                          type="button" onClick={() => addSlot(dayId)}
                          className="text-[10px] bg-indigo-600/20 text-indigo-400 font-bold px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-indigo-600/30 transition"
                        >
                          <Plus className="w-3 h-3" /> Προσθήκη Ωραρίου
                        </button>
                      </div>

                      <div className="space-y-2">
                        {availability[dayId]?.map((slot, index) => (
                          <div key={index} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-1.5 flex-1">
                              <input 
                                type="time" value={slot.start}
                                onChange={(e) => updateSlot(dayId, index, "start", e.target.value)}
                                className="bg-slate-950 text-xs text-white p-1.5 rounded-md border border-slate-800 focus:outline-none w-full"
                              />
                              <span className="text-slate-500 text-xs">-</span>
                              <input 
                                type="time" value={slot.end}
                                onChange={(e) => updateSlot(dayId, index, "end", e.target.value)}
                                className="bg-slate-950 text-xs text-white p-1.5 rounded-md border border-slate-800 focus:outline-none w-full"
                              />
                            </div>
                            <button
                              type="button" onClick={() => removeSlot(dayId, index)}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl text-sm font-bold transition shadow-xl shadow-indigo-600/20 mt-4">
                Αποθήκευση Καθηγητή
              </button>
            </form>
          </div>
        </div>

        {/* ΛΙΣΤΑ ΚΑΘΗΓΗΤΩΝ */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Ενεργό Εκπαιδευτικό Προσωπικό
              </h3>
              <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-3 py-1 rounded-full">
                {teachers.length} Καθηγητές
              </span>
            </div>

            {teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium text-slate-400">Δεν υπάρχουν καταχωρημένοι καθηγητές.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      <th className="pb-3 font-bold">Καθηγητής</th>
                      <th className="pb-3 font-bold">Ειδικότητα</th>
                      <th className="pb-3 font-bold">Τάξεις</th>
                      <th className="pb-3 font-bold">Διαθεσιμότητα (Σπαστά Ωράρια)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {teachers.map((t) => (
                      <tr key={t.id} className="group hover:bg-slate-800/10 transition">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm font-bold border border-indigo-500/10">
                              {t.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">{t.name}</div>
                              <div className="text-xs text-slate-400">{t.email || 'Δεν ορίστηκε email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                            {t.specialty}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {t.classes.length > 0 ? t.classes.map((c: string) => (
                              <span key={c} className="text-[10px] bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-medium">
                                {c}
                              </span>
                            )) : <span className="text-xs text-slate-500">-</span>}
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="space-y-1">
                            {t.schedule.map((s: any) => (
                              <div key={s.day} className="flex items-center gap-2 text-xs">
                                <span className="font-bold text-slate-300 min-w-[45px]">
                                  {DAYS.find(d => d.id === s.day)?.name}:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {s.slots.map((slot: any, idx: number) => (
                                    <span key={idx} className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/10 text-[11px] font-medium">
                                      {slot.start}-{slot.end}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
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