"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { UserPlus, Send, Users, ShieldAlert, CheckCircle } from "lucide-react";

export default function StudentManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // States για τα Στοιχεία Μαθητή
  const [studentName, setStudentName] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // States για τα Στοιχεία Γονέα (Ενιαία Εγγραφή)
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  // Διαθέσιμες επιλογές πλατφόρμας
  const availableCourses = ["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Ιστορία", "Έκθεση"];
  const availableDays = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];

  useEffect(() => {
    setMounted(true);
    const storedStudents = localStorage.getItem("eduflow_students");
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
  }, []);

  // Διαχείριση πολλαπλής επιλογής μαθημάτων
  const toggleCourse = (course: string) => {
    setSelectedCourses(prev =>
      prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]
    );
  };

  // Διαχείριση πολλαπλής επιλογής ημερών
  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Υποβολή Εγγραφής και αυτόματη ενημέρωση και των δύο πινάκων
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !parentName || !parentPhone) {
      alert("⚠️ Παρακαλώ συμπληρώστε τα υποχρεωτικά στοιχεία μαθητή και γονέα.");
      return;
    }

    const newStudentId = `stud-${Date.now()}`;

    // 1. Δομή Μαθητή
    const newStudent = {
      id: newStudentId,
      name: studentName,
      courses: selectedCourses,
      days: selectedDays,
      parentName: parentName,
      parentPhone: parentPhone
    };

    // 2. Δομή Γονέα (για να ενημερώνεται αυτόματα το πεδίο/βάση των γονέων)
    const newParent = {
      id: `parent-${Date.now()}`,
      studentId: newStudentId,
      studentName: studentName,
      parentName: parentName,
      phone: parentPhone
    };

    // Αποθήκευση Μαθητών
    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    localStorage.setItem("eduflow_students", JSON.stringify(updatedStudents));

    // Αυτόματη ενημέρωση της βάσης γονέων (eduflow_parents)
    const existingParents = JSON.parse(localStorage.getItem("eduflow_parents") || "[]");
    localStorage.setItem("eduflow_parents", JSON.stringify([...existingParents, newParent]));

    // Καθαρισμός Φόρμας
    setStudentName("");
    setParentName("");
    setParentPhone("");
    setSelectedCourses([]);
    setSelectedDays([]);

    alert("✨ Η εγγραφή ολοκληρώθηκε! Ενημερώθηκαν αυτόματα οι Μαθητές και οι Επαφές Γονέων.");
  };

  if (!mounted) return null;

  return (
    <WorkspaceShell
      title="Διαχείριση Προγραμμάτων & Ειδοποιήσεων"
      description="Ρύθμιση πολλαπλών μαθημάτων ανά μαθητή, επιλογή ημερών με σπαστά ωράρια και άμεση αποστολή push notifications."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: ΕΝΙΑΙΑ ΚΑΡΤΕΛΑ ΝΕΟΥ ΜΑΘΗΤΗ & ΣΤΟΙΧΕΙΑ ΓΟΝΕΑ */}
        <div className="lg:col-span-2 bg-[#232936] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-400" /> Καρτέλα Νέου Μαθητή & Γονέα
          </h3>

          <form onSubmit={handleSaveStudent} className="space-y-6">
            
            {/* 1. Στοιχεία Μαθητή */}
            <div className="bg-[#181d26] p-4 rounded-2xl border border-slate-800/60">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">📌 Βασικά Στοιχεία Μαθητή</h4>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">Ονοματεπώνυμο Μαθητή *</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="π.χ. Νίκος Παπαδόπουλος"
                  className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* 2. Στοιχεία Γονέα (Ενσωματωμένα) */}
            <div className="bg-[#181d26] p-4 rounded-2xl border border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">👨‍👩‍👦 Στοιχεία Γονέα / Κηδεμόνα</h4>
                <p className="text-[10px] text-slate-500 mb-2">Οι επαφές γονέων θα ενημερωθούν αυτόματα στο σύστημα.</p>
              </div>
              
              <div>
                <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">Ονοματεπώνυμο Γονέα *</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="π.χ. Ιωάννης Παπαδόπουλος"
                  className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1.5 font-medium">Τηλέφωνο / Κινητό για SMS *</label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="π.χ. 69XXXXXXXX"
                  className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* 3. Επιλογή Μαθημάτων (Πολλαπλή) */}
            <div>
              <label className="block text-[11px] text-slate-300 mb-2 font-medium">Επιλογή Μαθημάτων (Πολλαπλή)</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {availableCourses.map((course) => {
                  const isSelected = selectedCourses.includes(course);
                  return (
                    <button
                      type="button"
                      key={course}
                      onClick={() => toggleCourse(course)}
                      className={`py-2 px-1 text-center rounded-xl text-[11px] font-medium transition border ${
                        isSelected
                          ? "bg-indigo-600/20 text-indigo-400 border-indigo-500"
                          : "bg-[#090d14] text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {course}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Διαθέσιμες Ημέρες Μαθητή */}
            <div>
              <label className="block text-[11px] text-slate-300 mb-2 font-medium">Διαθέσιμες Ημέρες Μαθητή</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {availableDays.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`py-2 px-1 text-center rounded-xl text-[11px] font-medium transition border ${
                        isSelected
                          ? "bg-purple-600/20 text-purple-400 border-purple-500"
                          : "bg-[#090d14] text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Κουμπί Αποθήκευσης */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              Δημιουργία & Υπολογισμός Προγράμματος
            </button>

          </form>
        </div>

        {/* ΔΕΞΙΑ: LIVE PUSH NOTIFICATIONS / ΣΥΝΟΨΗ */}
        <div className="space-y-6">
          <div className="bg-[#232936] border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-500" /> Live Push Notifications
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-medium">Παραλήπτες</label>
                <select className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none">
                  <option>Όλοι (Μαθητές & Γονείς)</option>
                  <option>Μόνο Γονείς (SMS)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-medium">Τίτλος Μηνύματος</label>
                <input
                  type="text"
                  placeholder="π.χ. Αλλαγή ώρας προγράμματος"
                  className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-medium">Κείμενο Ειδοποίησης</label>
                <textarea
                  rows={3}
                  placeholder="Το μάθημα των Μαθηματικών της Πέμπτης..."
                  className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 rounded-xl transition">
                Αποστολή Άμεσης Ειδοποίησης
              </button>
            </div>
          </div>

          {/* Στατιστικό Πάνελ */}
          <div className="bg-[#181d26]/40 border border-slate-800/70 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-400">Σύνολο Εγγεγραμμένων</div>
                <div className="text-xs font-bold text-white">{students.length} Μαθητές</div>
              </div>
            </div>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-medium">Live</span>
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}