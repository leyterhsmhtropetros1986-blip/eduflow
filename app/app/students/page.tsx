"use client";

import { useState } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { BookOpen, Calendar, Bell, Check, UserPlus } from "lucide-react";

// Δείγματα δεδομένων για το UI
const AVAILABLE_COURSES = [
  { id: "math", name: "Μαθηματικά" },
  { id: "phys", name: "Φυσική" },
  { id: "chem", name: "Χημεία" },
  { id: "bio", name: "Βιολογία" },
  { id: "hist", name: "Ιστορία" },
];

const WEEK_DAYS = [
  { id: "Mon", name: "Δευτέρα" },
  { id: "Tue", name: "Τρίτη" },
  { id: "Wed", name: "Τετάρτη" },
  { id: "Thu", name: "Πέμπτη" },
  { id: "Fri", name: "Παρασκευή" },
  { id: "Sat", name: "Σάββατο" },
];

export default function StudentManagement() {
  // States για τη φόρμα μαθητή
  const [studentName, setStudentName] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  // States για το Push Notification Widget
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifTarget, setNotifTarget] = useState("all"); // all, students, parents

  // Handle Multi-select για Μαθήματα
  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  // Handle Multi-select για Ημέρες
  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]
    );
  };

  // Υποβολή Μαθητή
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || selectedCourses.length === 0 || selectedDays.length === 0) {
      alert("Παρακαλώ συμπληρώστε όνομα, τουλάχιστον 1 μάθημα και 1 ημέρα!");
      return;
    }

    const newStudent = {
      name: studentName,
      courses: selectedCourses,
      days: selectedDays
    };

    console.log("Saving Student Data:", newStudent);
    alert(`Ο μαθητής ${studentName} αποθηκεύτηκε με ${selectedCourses.length} μαθήματα!`);
    
    // Reset φόρμας
    setStudentName("");
    setSelectedCourses([]);
    setSelectedDays([]);
  };

  // Προσομοίωση Αποστολής Push Notification
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;

    alert(`Στάλθηκε Push Notification στους ${
      notifTarget === "all" ? "Γονείς & Μαθητές" : notifTarget === "students" ? "Μαθητές" : "Γονείς"
    }\nΤίτλος: ${notifTitle}`);

    setNotifTitle("");
    setNotifBody("");
  };

  return (
    <WorkspaceShell 
      title="Διαχείριση Προγραμμάτων & Ειδοποιήσεων" 
      description="Ρύθμιση πολλαπλών μαθημάτων ανά μαθητή, επιλογή ημερών και άμεση αποστολή push notifications."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2 sm:p-4 text-slate-100">
        
        {/* ΚΑΡΤΑ Α: ΕΓΓΡΑΦΗ ΜΑΘΗΤΗ ΜΕ ΠΟΛΛΑΠΛΑ ΜΑΘΗΜΑΤΑ & ΗΜΕΡΕΣ */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><UserPlus className="w-5 h-5" /></div>
            <h3 className="text-base font-bold text-white">Καρτέλα Νέου Μαθητή</h3>
          </div>

          <form onSubmit={handleCreateStudent} className="space-y-5">
            {/* Όνομα */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Oνοματεπώνυμο Μαθητή</label>
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="π.χ. Νίκος Παπαδόπουλος"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Πολλαπλή Επιλογή Μαθημάτων */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Επιλογή Μαθημάτων (Πολλαπλή)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_COURSES.map((course) => {
                  const isSelected = selectedCourses.includes(course.id);
                  return (
                    <button
                      type="button"
                      key={course.id}
                      onClick={() => toggleCourse(course.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected 
                          ? "bg-indigo-600/20 border-indigo-500 text-white" 
                          : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {course.name}
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Επιλογή Ημερών */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Διαθέσιμες Ημέρες Μαθημάτων
              </label>
              <div className="grid grid-cols-3 gap-2">
                {WEEK_DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day.id);
                  return (
                    <button
                      type="button"
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                        isSelected 
                          ? "bg-purple-600/20 border-purple-500 text-white" 
                          : "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {day.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20"
            >
              Δημιουργία & Υπολογισμός Προγράμματος
            </button>
          </form>
        </div>

        {/* ΚΑΡΤΑ Β: PUSH NOTIFICATIONS CENTER */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Bell className="w-5 h-5" /></div>
              <h3 className="text-base font-bold text-white">Live Push Notifications</h3>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              {/* Στόχος Ειδοποίησης */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Παραλήπτες</label>
                <select 
                  value={notifTarget}
                  onChange={(e) => setNotifTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
                >
                  <option value="all">Όλοι (Μαθητές & Γονείς)</option>
                  <option value="students">Μόνο Μαθητές</option>
                  <option value="parents">Μόνο Γονείς</option>
                </select>
              </div>

              {/* Τίτλος */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Τίτλος Μηνύματος</label>
                <input 
                  type="text" 
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="π.χ. Αλλαγή ώρας προγράμματος"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Περιεχόμενο */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Κείμενο Ειδοποίησης</label>
                <textarea 
                  rows={3}
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  placeholder="Το μάθημα των Μαθηματικών της Πέμπτης θα ξεκινήσει στις 17:00 αντί για τις 16:00."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition resize-none"
                />
              </div>

              {/* Send Button */}
              <button 
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-600/20"
              >
                Αποστολή Άμεσης Ειδοποίησης
              </button>
            </form>
          </div>

          {/* Τεχνική Σημείωση */}
          <div className="mt-6 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-500">
            💡 <strong>Πληροφορία συστήματος:</strong> Τα Push Notifications χρησιμοποιούν Service Workers (Web Push API). Οι χρήστες λαμβάνουν την ειδοποίηση στην αρχική οθόνη του κινητού τους ακόμα και με κλειστό τον browser.
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}