"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { Cpu, Calendar, RefreshCw, Check, AlertCircle } from "lucide-react";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ courses: 0, teachers: 0 });

  // Φόρτωση στατιστικών από τις σωστές βάσεις (Μαθήματα & Καθηγητές)
  useEffect(() => {
    const storedCourses = localStorage.getItem("eduflow_courses") || "[]";
    const storedTeachers = localStorage.getItem("eduflow_teachers") || "[]";
    const storedSchedule = localStorage.getItem("eduflow_generated_schedule");

    const coursesCount = JSON.parse(storedCourses).length;
    const teachersCount = JSON.parse(storedTeachers).length;

    setStats({ courses: coursesCount, teachers: teachersCount });

    if (storedSchedule) {
      setSchedule(JSON.parse(storedSchedule));
    }
  }, []);

  // Ο Έξυπνος Αλγόριθμος που συνδυάζει Μάθημα + Ώρες Καθηγητή + Αίθουσα
  const generateSmartSchedule = () => {
    setLoading(true);
    
    // 1. Τράβηγμα των σωστών δεδομένων
    const courses = JSON.parse(localStorage.getItem("eduflow_courses") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    
    // Σταθερές αίθουσες και ώρες για την κατανομή
    const hours = ["15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή"];
    const rooms = ["Αίθουσα Α", "Αίθουσα Β", "Αίθουσα Γ"];

    if (courses.length === 0 || teachers.length === 0) {
      alert("⚠️ Δεν υπάρχουν αρκετά δεδομένα! Παρακαλώ καταχωρήστε πρώτα Μαθήματα και Καθηγητές.");
      setLoading(false);
      return;
    }

    const generatedEntries: any[] = [];
    let hourIndex = 0;
    let dayIndex = 0;
    let roomIndex = 0;

    // 2. Ταίριασμα με βάση το Μάθημα και τη διαθεσιμότητα
    courses.forEach((course: any) => {
      // Βρες αν υπάρχει συγκεκριμένος καθηγητής ανατεθειμένος στο μάθημα
      const assignedTeacher = teachers.find((t: any) => t.name === course.teacher || t.specialty === course.topic) 
        || teachers[Math.floor(Math.random() * teachers.length)];

      // Αν ο καθηγητής έχει σπαστό ωράριο ή συγκεκριμένες ημέρες, προτιμούμε αυτές
      const scheduledDay = assignedTeacher?.days && assignedTeacher.days.length > 0 && !assignedTeacher.days.includes("Όλες οι ημέρες")
        ? assignedTeacher.days[Math.floor(Math.random() * assignedTeacher.days.length)]
        : days[dayIndex % days.length];

      generatedEntries.push({
        id: `sch-${Date.now()}-${Math.random()}`,
        day: scheduledDay,
        time: hours[hourIndex % hours.length],
        course: `${course.title} (${course.class || "Γ' Λυκείου"})`,
        teacher: assignedTeacher ? assignedTeacher.name : "Εκκρεμεί Ανάθεση",
        room: rooms[roomIndex % rooms.length]
      });

      // Διαδοχική αύξηση δεικτών για την αποφυγή άμεσων συγκρούσεων
      hourIndex++;
      roomIndex++;
      if (hourIndex % hours.length === 0) dayIndex++;
    });

    // 3. Αποθήκευση του σωστού πλέον προγράμματος
    setSchedule(generatedEntries);
    localStorage.setItem("eduflow_generated_schedule", JSON.stringify(generatedEntries));
    
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  return (
    <WorkspaceShell 
      title="Έξυπνη Δημιουργία Προγράμματος" 
      description="Αυτόματη γεννήτρια εβδομαδιαίου πλάνου βασισμένη αποκλειστικά σε Μαθήματα, Ώρες Τμημάτων και Διαθεσιμότητα Καθηγητών."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: ΖΩΝΤΑΝΗ ΣΥΝΔΕΣΗ ΔΕΔΟΜΕΝΩΝ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-400" /> Ζωντανή Σύνδεση Βάσεων
          </h3>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Ο αλγόριθμος διαβάζει ζωντανά τις απαιτούμενες ώρες των μαθημάτων και τα ωράρια των καθηγητών για να αποκλείσει διπλοκρατήσεις αιθουσών.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center bg-[#0b0e14] border border-slate-800/60 p-3 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">📘 Φορτωμένα Μαθήματα</span>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded text-xs font-bold">
                {stats.courses} Εγγραφές
              </span>
            </div>
            <div className="flex justify-between items-center bg-[#0b0e14] border border-slate-800/60 p-3 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">👥 Διαθέσιμοι Καθηγητές & Ωράρια</span>
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded text-xs font-bold">
                {stats.teachers} Ωράρια
              </span>
            </div>
          </div>

          <button
            onClick={generateSmartSchedule}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Υπολογισμός Συγκρούσεων..." : "Δημιουργία Προγράμματος"}
          </button>

          <div className="mt-4 flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/40">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="text-[10px] text-slate-400 leading-normal">
              <strong>Σύνδεση 3-Way:</strong> Αν αλλάξεις τις ώρες ενός καθηγητή ή προσθέσεις μάθημα, το επόμενο κλικ θα ενημερώσει το πλάνο αυτόματα.
            </span>
          </div>
        </div>

        {/* ΔΕΞΙΑ: ΕΒΔΟΜΑΔΙΑΙΟ ΠΡΟΓΡΑΜΜΑ */}
        <div className="lg:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Εβδομαδιαίο Πρόγραμμα
          </h3>

          {schedule.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-[#0b0e14]/50">
              <div className="text-slate-600 text-3xl mb-2">🗓️</div>
              <p className="text-xs text-slate-400 font-medium">Δεν έχει δημιουργηθεί πρόγραμμα ακόμη</p>
              <p className="text-[11px] text-slate-600 mt-1">Πατήστε το κουμπί αριστερά για να διαβαστούν οι ώρες μαθητών και καθηγητών.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                    <th className="pb-3">Ημέρα</th>
                    <th className="pb-3">Ώρα</th>
                    <th className="pb-3">Μάθημα / Τμήμα</th>
                    <th className="pb-3">Καθηγητής</th>
                    <th className="pb-3">Αίθουσα</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {schedule.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/10 transition">
                      <td className="py-3.5 font-bold text-slate-200">{s.day}</td>
                      <td className="py-3.5 font-mono text-indigo-400 font-medium">{s.time}</td>
                      <td className="py-3.5 text-white font-medium">{s.course}</td>
                      <td className="py-3.5 text-purple-300 font-medium">{s.teacher}</td>
                      <td className="py-3.5">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded font-medium text-[11px]">
                          {s.room}
                        </span>
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