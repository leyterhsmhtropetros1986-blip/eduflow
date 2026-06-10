"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { 
  Users, 
  UserPlus, 
  Plus, 
  Trash2, 
  BookOpen,
  Calendar,
  Clock
} from "lucide-react";

const SPECIALTIES = ["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Φιλολογικά", "Έκθεση"];

const CLASSES = [
  "Α' ΓΥΜΝΑΣΙΟΥ", "Β' ΓΥΜΝΑΣΙΟΥ", "Γ' ΓΥΜΝΑΣΙΟΥ", 
  "Α' ΛΥΚΕΙΟΥ", "Β' ΛΥΚΕΙΟΥ", "Γ' ΛΥΚΕΙΟΥ"
];

const DAYS = [
  { id: "Mon", name: "Δευτέρα" },
  { id: "Tue", name: "Τρίτη" },
  { id: "Wed", name: "Τετάρτη" },
  { id: "Thu", name: "Πέμπτη" },
  { id: "Fri", name: "Παρασκευή" },
  { id: "Sat", name: "Σάββατο" },
];

export default function TeachersHub() {
  const [mounted, setMounted] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([
    { 
      id: "1", 
      name: "Ελένη Παπαδοπούλου", 
      specialty: "Μαθηματικά", 
      classes: ["Α' ΓΥΜΝΑΣΙΟΥ", "Γ' ΓΥΜΝΑΣΙΟΥ"],
      schedule: [
        { day: "Mon", slots: [{ start: "14:00", end: "16:00" }, { start: "17:00", end: "19:00" }] },
        { day: "Wed", slots: [{ start: "15:00", end: "18:00" }] }
      ]
    }
  ]);
  
  // Φόρμα Καθηγητή
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, Array<{ start: string; end: string }>>>({});

  useEffect(() => { setMounted(true); }, []);

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev => 
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

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
        [dayId]: [{ start: "15:00", end: "17:00" }]
      }));
    }
  };

  const addSlot = (dayId: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), { start: "18:00", end: "20:00" }]
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialty) {
      alert("⚠️ Τα πεδία Ονοματεπώνυμο και Ειδικότητα είναι υποχρεωτικά!");
      return;
    }

    const newTeacher = {
      id: Date.now().toString(),
      name,
      specialty,
      classes: selectedClasses,
      schedule: selectedDays.map(day => ({
        day,
        slots: availability[day] || []
      }))
    };

    setTeachers([...teachers, newTeacher]);
    setName(""); setSpecialty(""); setSelectedClasses([]); setSelectedDays([]); setAvailability({});
    alert("✅ Ο καθηγητής προστέθηκε με επιτυχία!");
  };

  return (
    <WorkspaceShell 
      title="Διαχείριση Προσωπικού & Σπαστών Ωραρίων" 
      description="Καταχώρηση καθηγητών, ανάθεση τμημάτων διδασκαλίας και λεπτομερής ρύθμιση πολλαπλών slots διαθεσιμότητας ανά ημέρα."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΚΑΡΤΕΛΑ ΚΑΘΗΓΗΤΗ */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><UserPlus className="w-5 h-5" /></div>
              <h3 className="text-base font-bold text-white">Προσθήκη Καθηγητή</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1 mb-2">
                  Ονοματεπώνυμο <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="π.χ. Κωνσταντίνος Βασιλείου"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 mb-2 block">
                  Ειδικότητα / Μάθημα <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={specialty} onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition"
                >
                  <option value="" className="text-slate-500">Επιλέξτε Ειδικότητα</option>
                  {SPECIALTIES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* ΤΑΞΕΙΣ ΔΙΔΑΣΚΑΛΙΑΣ */}
              <div>
                <label className="text-xs font-bold text-slate-200 mb-2 block">Τάξεις Διδασκαλίας</label>
                <div className="grid grid-cols-2 gap-2">
                  {CLASSES.map(cls => (
                    <button
                      type="button" key={cls} onClick={() => toggleClass(cls)}
                      className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
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

              {/* ΕΠΙΛΟΓΗ ΗΜΕΡΩΝ ΔΙΑΘΕΣΙΜΟΤΗΤΑΣ */}
              <div className="pt-4 border-t border-slate-800/60">
                <label className="text-xs font-bold text-slate-200 mb-2 block">Ημέρες Διαθεσιμότητας</label>
                <div className="grid grid-cols-3 gap-2">
                  {DAYS.map(day => (
                    <button
                      type="button" key={day.id} onClick={() => toggleDay(day.id)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                        selectedDays.includes(day.id) 
                          ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {day.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* ΣΠΑΣΤΑ ΩΡΑΡΙΑ ΑΝΑ ΗΜΕΡΑ (MATRIX) */}
              {selectedDays.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-800/60 animate-in fade-in duration-150">
                  <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">Ώρες Διαθεσιμότητας (Σπαστό Ωράριο)</label>
                  
                  {selectedDays.map(dayId => (
                    <div key={dayId} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                          {DAYS.find(d => d.id === dayId)?.name}
                        </span>
                        <button
                          type="button" onClick={() => addSlot(dayId)}
                          className="text-[10px] bg-indigo-600/20 text-indigo-400 font-bold px-2 py-0.5 rounded flex items-center gap-1 hover:bg-indigo-600/30 transition"
                        >
                          <Plus className="w-3 h-3" /> Προσθήκη Slot
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {availability[dayId]?.map((slot, index) => (
                          <div key={index} className="flex items-center gap-2 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/60">
                            <input 
                              type="time" value={slot.start}
                              onChange={(e) => updateSlot(dayId, index, "start", e.target.value)}
                              className="bg-slate-950 text-xs text-white p-1 rounded border border-slate-800 focus:outline-none w-full font-mono"
                            />
                            <span className="text-slate-600 text-xs">-</span>
                            <input 
                              type="time" value={slot.end}
                              onChange={(e) => updateSlot(dayId, index, "end", e.target.value)}
                              className="bg-slate-950 text-xs text-white p-1 rounded border border-slate-800 focus:outline-none w-full font-mono"
                            />
                            <button
                              type="button" onClick={() => removeSlot(dayId, index)}
                              className="p-1 text-rose-400 hover:bg-rose-500/10 rounded transition"
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

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl text-xs font-bold transition shadow-xl shadow-indigo-600/20 mt-2">
                Αποθήκευση Καθηγητή
              </button>
            </form>
          </div>
        </div>

        {/* ΚΑΤΑΛΟΓΟΣ ΚΑΘΗΓΗΤΩΝ */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl min-h-[550px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Κατάλογος Εκπαιδευτικού Προσωπικού
              </h3>
              <span className="text-xs bg-slate-800 text-slate-200 font-semibold px-3 py-1 rounded-full">
                {teachers.length} Καθηγητές
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="pb-3 font-bold">Όνομα</th>
                    <th className="pb-3 font-bold">Ειδικότητα</th>
                    <th className="pb-3 font-bold">Αναθέσεις Τμημάτων</th>
                    <th className="pb-3 font-bold">Εβδομαδιαία Διαθεσιμότητα</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="group hover:bg-slate-800/10 transition">
                      <td className="py-4 font-bold text-white text-sm">{teacher.name}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/10 font-semibold">
                          <BookOpen className="w-3 h-3" /> {teacher.specialty}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {teacher.classes.map((c: string) => (
                            <span key={c} className="text-[10px] bg-slate-950 text-slate-300 font-bold px-2 py-0.5 rounded border border-slate-800">
                              {c}
                            </span>
                          ))}
                          {teacher.classes.length === 0 && <span className="text-xs text-slate-600">-</span>}
                        </div>
                      </td>
                      <td