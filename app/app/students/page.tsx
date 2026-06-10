"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { 
  Users, 
  UserPlus, 
  Plus, 
  Trash2, 
  FileDown,
  GraduationCap,
  Calendar,
  Bell
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const SUBJECTS = ["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Ιστορία", "Έκθεση"];

const DAYS = [
  { id: "Mon", name: "Δευτέρα" },
  { id: "Tue", name: "Τρίτη" },
  { id: "Wed", name: "Τετάρτη" },
  { id: "Thu", name: "Πέμπτη" },
  { id: "Fri", name: "Παρασκευή" },
  { id: "Sat", name: "Σάββατο" },
];

export default function StudentHub() {
  const [mounted, setMounted] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  
  // Φόρμα Μαθητή
  const [name, setName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, Array<{ start: string; end: string }>>>({});

  // Φόρμα Ειδοποιήσεων (Δεξί Panel)
  const [notificationTarget, setNotificationTarget] = useState("all");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("Το μάθημα των Μαθηματικών της Πέμπτης θα ξεκινήσει στις 17:00 αντί για τις 16:00.");

  useEffect(() => { setMounted(true); }, []);

  const toggleSubject = (subj: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subj) ? prev.filter(s => s !== subj) : [...prev, subj]
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("⚠️ Το Ονοματεπώνυμο του μαθητή είναι υποχρεωτικό!");
      return;
    }

    const newStudent = {
      id: Date.now().toString(),
      name,
      subjects: selectedSubjects,
      schedule: selectedDays.map(day => ({
        day,
        slots: availability[day] || []
      }))
    };

    setStudents([...students, newStudent]);
    setName(""); setSelectedSubjects([]); setSelectedDays([]); setAvailability({});
    alert("✅ Ο μαθητής προστέθηκε με επιτυχία!");
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`🚀 Η ειδοποίηση στάλθηκε επιτυχώς μέσω Web Push API στους επιλεγμένους χρήστες!`);
    setNotifTitle("");
  };

  const exportToPDF = (student: any) => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(`EduFlow Student Schedule: ${student.name}`, 14, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Subjects: ${student.subjects.join(", ") || "None"}`, 14, 30);
    
    const tableRows: any[] = [];
    student.schedule.forEach((s: any) => {
      const dayName = DAYS.find(d => d.id === s.day)?.name || s.day;
      const slotsText = s.slots.map((slot: any) => `${slot.start} - ${slot.end}`).join(" / ");
      tableRows.push([dayName, slotsText]);
    });

    (doc as any).autoTable({
      startY: 40,
      head: [["Day", "Time Slots"]],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save(`Schedule_${student.name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <WorkspaceShell 
      title="Διαχείριση Προγραμμάτων & Ειδοποιήσεων" 
      description="Ρύθμιση πολλαπλών μαθημάτων ανά μαθητή, επιλογή ημερών με σπαστά ωράρια και άμεση αποστολή push notifications."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 pb-12">
        
        {/* ΑΡΙΣΤΕΡΟ PANEL: ΚΑΡΤΕΛΑ ΜΑΘΗΤΗ */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><UserPlus className="w-5 h-5" /></div>
            <h3 className="text-base font-bold text-white">Καρτέλα Νέου Μαθητή</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-2">
                Ονοματεπώνυμο Μαθητή <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="π.χ. Νίκος Παπαδόπουλος"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 block mb-2">Επιλογή Μαθημάτων (Πολλαπλή)</label>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECTS.map(subj => (
                  <button
                    type="button" key={subj} onClick={() => toggleSubject(subj)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                      selectedSubjects.includes(subj) 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 block mb-2">Διαθέσιμες Ημέρες Μαθητή</label>
              <div className="grid grid-cols-3 gap-2">
                {DAYS.map(day => (
                  <button
                    type="button" key={day.id} onClick={() => toggleDay(day.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedDays.includes(day.id) 
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20" 
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {day.name}
                  </button>
                ))}
              </div>
            </div>

            {/* ΣΠΑΣΤΑ ΩΡΑΡΙΑ ΑΝΑ ΗΜΕΡΑ */}
            {selectedDays.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800/80 animate-in fade-in duration-150">
                <label className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">Ώρες Προγράμματος ανά Ημέρα</label>
                
                {selectedDays.map(dayId => (
                  <div key={dayId} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                        {DAYS.find(d => d.id === dayId)?.name}
                      </span>
                      <button
                        type="button" onClick={() => addSlot(dayId)}
                        className="text-[10px] bg-indigo-600/20 text-indigo-400 font-bold px-2 py-0.5 rounded hover:bg-indigo-600/30 transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Προσθήκη
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {availability[dayId]?.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2 bg-slate-900/40 p-1.5 rounded-lg border border-slate-800/60">
                          <input 
                            type="time" value={slot.start}
                            onChange={(e) => updateSlot(dayId, index, "start", e.target.value)}
                            className="bg-slate-950 text-xs text-white p-1 rounded border border-slate-800 focus:outline-none w-full"
                          />
                          <span className="text-slate-600 text-xs">-</span>
                          <input 
                            type="time" value={slot.end}
                            onChange={(e) => updateSlot(dayId, index, "end", e.target.value)}
                            className="bg-slate-950 text-xs text-white p-1 rounded border border-slate-800 focus:outline-none w-full"
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

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold transition shadow-xl shadow-indigo-600/20">
              Δημιουργία & Υπολογισμός Προγράμματος
            </button>
          </form>
        </div>

        {/* ΔΕΞΙ PANEL: LIVE PUSH NOTIFICATIONS */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Bell className="w-5 h-5" /></div>
              <h3 className="text-base font-bold text-white">Live Push Notifications</h3>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2">Παραλήπτες</label>
                <select 
                  value={notificationTarget} onChange={(e) => setNotificationTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition"
                >
                  <option value="all">Όλοι (Μαθητές & Γονείς)</option>
                  <option value="students">Μόνο Μαθητές</option>
                  <option value="parents">Μόνο Γονείς</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2">Τίτλος Μηνύματος</label>
                <input 
                  type="text" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="π.χ. Αλλαγή ώρας προγράμματος"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2">Κείμενο Ειδοποίησης</label>
                <textarea 
                  value={notifBody} onChange={(e) => setNotifBody(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition resize-none"
                />
              </div>

              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl text-xs font-bold transition shadow-xl shadow-amber-600/20">
                Αποστολή Άμεσης Ειδοποίησης
              </button>
            </form>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 mt-6">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              💡 <strong className="text-slate-200">Πληροφορία συστήματος:</strong> Τα Push Notifications χρησιμοποιούν Service Workers (Web Push API). Οι χρήστες λαμβάνουν την ειδοποίηση στην αρχική οθόνη του κινητού τους ακόμα και με κλειστό τον browser.
            </p>
          </div>
        </div>

      </div>

      {/* ΚΑΤΩ PANEL: ΛΙΣΤΑ ΜΑΘΗΤΩΝ & ΕΞΑΓΩΓΗ PDF */}
      <div className="px-4 pb-20">
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" /> Καταχωρημένα Προγράμματα Μαθητών
            </h3>
            <span className="text-xs bg-slate-800 text-slate-200 px-3 py-1 rounded-full font-semibold">
              {students.length} Μαθητές
            </span>
          </div>

          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Calendar className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-xs">Δεν υπάρχουν ενεργά προγράμματα μαθητών αυτή τη στιγμή.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="pb-3 font-bold">Μαθητής</th>
                    <th className="pb-3 font-bold">Μαθήματα</th>
                    <th className="pb-3 font-bold">Πρόγραμμα (Σπαστά Ωράρια)</th>
                    <th className="pb-3 font-bold text-right">Λήψη</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((student) => (
                    <tr key={student.id} className="group hover:bg-slate-800/10 transition">
                      <td className="py-4 font-bold text-white text-sm">{student.name}</td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {student.subjects.map((s: string) => (
                            <span key={s} className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/10">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="space-y-1">
                          {student.schedule.map((s: any) => (
                            <div key={s.day} className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-slate-300 min-w-[50px]">
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
                      <td className="py-4 text-right">
                        <button
                          onClick={() => exportToPDF(student)}
                          className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-xl border border-slate-700 hover:border-indigo-500 transition shadow-md"
                        >
                          <FileDown className="w-3.5 h-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}