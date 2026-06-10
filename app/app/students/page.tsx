"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { UserPlus, Bell, Users, CheckCircle, Smartphone, Mail, ShieldAlert } from "lucide-react";

export default function StudentsManagementPage() {
  // States για τη Φόρμα Μαθητή / Γονέα
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState(""); // ΝΕΟ ΥΠΟΧΡΕΩΤΙΚΟ
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState(""); // ΥΠΟΧΡΕΩΤΙΚΟ
  const [parentEmail, setParentEmail] = useState(""); // ΝΕΟ ΥΠΟΧΡΕΩΤΙΚΟ
  
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);

  // States για τα Push Notifications
  const [notificationRecipient, setNotificationRecipient] = useState("all");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationLogs, setNotificationLogs] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_students") || "[]";
    setStudentsList(JSON.parse(stored));
  }, []);

  // Διαχείριση επιλογής μαθημάτων (Πολλαπλή)
  const toggleCourse = (course: string) => {
    setSelectedCourses(prev => 
      prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]
    );
  };

  // Διαχείριση επιλογής ημερών (Πολλαπλή)
  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Υποβολή Νέας Καρτέλας με full Validations
  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();

    // Αυστηρός έλεγχος για όλα τα υποχρεωτικά στοιχεία
    if (!studentName.trim() || !studentPhone.trim() || !parentName.trim() || !parentPhone.trim() || !parentEmail.trim()) {
      alert("⚠️ Σφάλμα: Όλα τα πεδία (Όνομα/Τηλ Μαθητή, Όνομα/Τηλ/Email Γονέα) είναι υποχρεωτικά!");
      return;
    }

    if (selectedCourses.length === 0 || selectedDays.length === 0) {
      alert("⚠️ Σφάλμα: Πρέπει να επιλέξετε τουλάχιστον ένα Μάθημα και μία Διαθέσιμη Ημέρα!");
      return;
    }

    const newStudent = {
      id: `student-${Date.now()}`,
      name: studentName,
      studentPhone: studentPhone,
      parentName: parentName,
      parentPhone: parentPhone,
      parentEmail: parentEmail,
      courses: selectedCourses,
      days: selectedDays
    };

    const updatedList = [...studentsList, newStudent];
    setStudentsList(updatedList);
    localStorage.setItem("eduflow_students", JSON.stringify(updatedList));

    // Reset Φόρμας
    setStudentName("");
    setStudentPhone("");
    setParentName("");
    setParentPhone("");
    setParentEmail("");
    setSelectedCourses([]);
    setSelectedDays([]);
    alert("🎉 Η καρτέλα μαθητή και γονέα δημιουργήθηκε με επιτυχία!");
  };

  // Αποστολή Ταυτόχρονης Ειδοποίησης σε SMS & Email
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();

    if (!notificationTitle.trim() || !notificationBody.trim()) {
      alert("⚠️ Παρακαλώ συμπληρώστε Τίτλο και Κείμενο Ειδοποίησης.");
      return;
    }

    // Προσομοίωση αποστολής multi-channel
    const timestamp = new Date().toLocaleTimeString();
    const newLogs = [
      `[${timestamp}] 📱 SMS στάλθηκε στα τηλέφωνα μαθητών & γονέων.`,
      `[${timestamp}] 📧 Email στάλθηκε στις διευθύνσεις των γονέων.`,
      `[${timestamp}] 🔔 Live Push Notification εμφανίστηκε στην πλατφόρμα.`
    ];

    setNotificationLogs(prev => [...newLogs, ...prev]);
    setNotificationTitle("");
    setNotificationBody("");
    alert("🚀 Η ειδοποίηση στάλθηκε επιτυχώς και στα 3 κανάλια ταυτόχρονα (SMS Μαθητή/Γονέα & Email Γονέα)!");
  };

  return (
    <WorkspaceShell 
      title="Διαχείριση Προγραμμάτων & Ειδοποιήσεων" 
      description="Πλήρης καρτέλα εκπαιδευόμενου και κηδεμόνα με αυτοματοποιημένη 3-Way αποστολή ενημερώσεων."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ ΜΕ ΥΠΟΧΡΕΩΤΙΚΑ ΣΤΟΙΧΕΙΑ */}
        <div className="lg:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-400" /> Καρτέλα Νέου Μαθητή & Γονέα
          </h3>

          <form onSubmit={handleRegisterStudent} className="space-y-6">
            
            {/* ΒΑΣΙΚΑ ΣΤΟΙΧΕΙΑ ΜΑΘΗΤΗ */}
            <div className="space-y-3 bg-[#161a24] p-4 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-blue-400 flex items-center gap-1">
                📌 Βασικά Στοιχεία Μαθητή
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Ονοματεπώνυμο Μαθητή *</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="π.χ. Νίκος Παπαδόπουλος"
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Κινητό Τηλέφωνο Μαθητή *</label>
                  <input
                    type="tel"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="π.χ. 69XXXXXXXX"
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* ΣΤΟΙΧΕΙΑ ΓΟΝΕΑ / ΚΗΔΕΜΟΝΑ */}
            <div className="space-y-3 bg-[#161a24] p-4 rounded-xl border border-slate-800/80">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-400 flex items-center gap-1">
                👨‍👩‍👦 Στοιχεία Γονέα / Κηδεμόνα
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Ονοματεπώνυμο Γονέα *</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="π.χ. Ιωάννης Παπαδόπουλος"
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Τηλέφωνο Κινητό (SMS) *</label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="π.χ. 69XXXXXXXX"
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Email Επικοινωνίας *</label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* ΕΠΙΛΟΓΗ ΜΑΘΗΜΑΤΩΝ */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-2">Επιλογή Μαθημάτων (Πολλαπλή)</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Ιστορία", "Έκθεση"].map((course) => {
                  const isSelected = selectedCourses.includes(course);
                  return (
                    <button
                      type="button"
                      key={course}
                      onClick={() => toggleCourse(course)}
                      className={`py-2 px-1 text-[11px] font-semibold rounded-lg border transition text-center ${
                        isSelected 
                          ? "bg-blue-600/20 text-blue-400 border-blue-500" 
                          : "bg-[#0b0e14] text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {course}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ΔΙΑΘΕΣΙΜΕΣ ΗΜΕΡΕΣ */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-2">Διαθέσιμες Ημέρες Μαθητή</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`py-2 px-1 text-[11px] font-semibold rounded-lg border transition text-center ${
                        isSelected 
                          ? "bg-indigo-600/20 text-indigo-400 border-indigo-500" 
                          : "bg-[#0b0e14] text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl transition shadow-lg"
            >
              Δημιουργία & Υπολογισμός Προγράμματος
            </button>
          </form>
        </div>

        {/* ΔΕΞΙΑ: LIVE PUSH NOTIFICATIONS ΣΕ ΤΡΙΑ ΚΑΝΑΛΙΑ */}
        <div className="space-y-6">
          <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Live Push Notifications
            </h3>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Παραλήπτες</label>
                <select
                  value={notificationRecipient}
                  onChange={(e) => setNotificationRecipient(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="all">Όλοι (Μαθητές & Γονείς)</option>
                  <option value="active">Μόνο Γονείς (Email & SMS)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Τίτλος Μηνύματος</label>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="π.χ. Αλλαγή ώρας προγράμματος"
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Κείμενο Ειδοποίησης</label>
                <textarea
                  rows={3}
                  value={notificationBody}
                  onChange={(e) => setNotificationBody(e.target.value)}
                  placeholder="Το μάθημα των Μαθηματικών της Πέμπτης θα ξεκινήσει στις 17:00 αντί για τις 16:00."
                  className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg"
              >
                Αποστολή Άμεσης Ειδοποίησης
              </button>
            </form>
          </div>

          {/* LIVE LOGS ΓΙΑ ΕΠΙΒΕΒΑΙΩΣΗ ΤΩΝ 3 ΚΑΝΑΛΙΩΝ */}
          <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              📜 Αναφορά Παράδοσης Δικτύου
            </span>
            <div className="bg-[#0b0e14] rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 border border-slate-800/50">
              {notificationLogs.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">Δεν υπάρχουν πρόσφατες αποστολές.</p>
              ) : (
                notificationLogs.map((log, i) => (
                  <p key={i} className="text-[10px] font-mono text-slate-300 leading-relaxed">{log}</p>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}