"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { UserPlus, Bell, Calendar, Clock } from "lucide-react";

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00"];

export default function StudentsPage() {
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  
  // Αποθήκευση διαθεσιμότητας ως: { "Δευτέρα": ["15:00-16:00", "16:00-17:00"], "Τρίτη": [...] }
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationLogs, setNotificationLogs] = useState<string[]>([]);

  const toggleCourse = (course: string) => {
    setSelectedCourses(prev => prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]);
  };

  const toggleTimeSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const updatedSlots = daySlots.includes(slot) 
        ? daySlots.filter(s => s !== slot) 
        : [...daySlots, slot];
      return { ...prev, [day]: updatedSlots };
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !studentPhone.trim() || !parentName.trim() || !parentPhone.trim() || !parentEmail.trim()) {
      alert("⚠️ Όλα τα πεδία επικοινωνίας μαθητή και γονέα είναι υποχρεωτικά!");
      return;
    }

    if (selectedCourses.length === 0) {
      alert("⚠️ Επιλέξτε τουλάχιστον ένα μάθημα!");
      return;
    }

    const hasAvailability = Object.values(availability).some(slots => slots.length > 0);
    if (!hasAvailability) {
      alert("⚠️ Πρέπει να επιλέξετε τουλάχιστον μία ημέρα και ώρα διαθεσιμότητας!");
      return;
    }

    const newStudent = {
      id: `student-${Date.now()}`,
      name: studentName,
      studentPhone,
      parentName,
      parentPhone,
      parentEmail,
      courses: selectedCourses,
      availability // Το πλήρες αντικείμενο ωρών
    };

    const stored = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    localStorage.setItem("eduflow_students", JSON.stringify([...stored, newStudent]));

    alert("🎉 Η καρτέλα μαθητή αποθηκεύτηκε επιτυχώς!");
    setStudentName(""); setStudentPhone(""); setParentName(""); setParentPhone(""); setParentEmail("");
    setSelectedCourses([]); setAvailability({});
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationTitle.trim() || !notificationBody.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    setNotificationLogs(prev => [
      `[${timestamp}] 📱 SMS στάλθηκε στο κινητό μαθητή (${studentPhone || "Γενικό"}) & γονέα.`,
      `[${timestamp}] 📧 Email στάλθηκε στο γονέα: ${parentEmail || "Γενικό"}`,
      `[${timestamp}] 🔔 Live Push Notification εκπέμφθηκε στην πλατφόρμα.`,
      ...prev
    ]);
    setNotificationTitle(""); setNotificationBody("");
  };

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών & Ειδοποιήσεων">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ */}
        <div className="lg:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><UserPlus className="w-4 h-4 text-blue-400" /> Νέα Καρτέλα Εκπαιδευόμενου</h3>
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#161a24] p-4 rounded-xl border border-slate-800">
              <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Ονοματεπώνυμο Μαθητή *" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
              <input type="tel" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} placeholder="Κινητό Μαθητή *" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#161a24] p-4 rounded-xl border border-slate-800">
              <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Ονοματεπώνυμο Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
              <input type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="Κινητό Γονέα (SMS) *" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
              <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="Email Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
            </div>

            {/* ΜΑΘΗΜΑΤΑ */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-2">Επιλογή Μαθημάτων</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Ιστορία", "Έκθεση"].map(c => (
                  <button type="button" key={c} onClick={() => toggleCourse(c)} className={`py-2 text-[11px] font-semibold rounded-lg border transition ${selectedCourses.includes(c) ? "bg-blue-600/20 text-blue-400 border-blue-500" : "bg-[#0b0e14] text-slate-400 border-slate-800"}`}>{c}</button>
                ))}
              </div>
            </div>

            {/* ΠΙΝΑΚΑΣ ΕΠΙΛΟΓΗΣ ΩΡΑΣ ΑΝΑ ΗΜΕΡΑ */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Επιλογή Ωραρίων Διαθεσιμότητας Μαθητή</label>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {AVAILABLE_DAYS.map(day => (
                  <div key={day} className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800/80">
                    <span className="text-xs font-bold text-slate-300 block mb-2">{day}</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
                      {TIME_SLOTS.map(slot => {
                        const isChecked = (availability[day] || []).includes(slot);
                        return (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => toggleTimeSlot(day, slot)}
                            className={`py-1 px-2 text-[10px] font-mono rounded border transition text-center ${isChecked ? "bg-emerald-500/20 text-emerald-400 border-emerald-500" : "bg-[#161a24] text-slate-500 border-slate-800 hover:border-slate-700"}`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl transition shadow-lg">Αποθήκευση Καρτέλας Μαθητή</button>
          </form>
        </div>

        {/* ΕΙΔΟΠΟΙΗΣΕΙΣ */}
        <div className="space-y-6">
          <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-amber-400" /> 3-Way Live Notifications</h3>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <input type="text" value={notificationTitle} onChange={e => setNotificationTitle(e.target.value)} placeholder="Τίτλος Ειδοποίησης" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
              <textarea rows={3} value={notificationBody} onChange={e => setNotificationBody(e.target.value)} placeholder="Κείμενο ενημέρωσης..." className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none" />
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-3 rounded-xl transition">Αποστολή (SMS & Email)</button>
            </form>
          </div>

          <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 block mb-2">📜 Αναφορά Παράδοσης</span>
            <div className="bg-[#0b0e14] rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5 border border-slate-800">
              {notificationLogs.length === 0 ? <p className="text-[10px] text-slate-500 italic">Καμία αποστολή ακόμη.</p> : notificationLogs.map((log, i) => <p key={i} className="text-[10px] font-mono text-slate-300">{log}</p>)}
            </div>
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}