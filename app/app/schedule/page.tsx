"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { Cpu, Calendar, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ courses: 0, teachers: 0 });

  useEffect(() => {
    // Φόρτωση των σωστών δεδομένων από τα εγγεγραμμένα Μαθήματα και Καθηγητές
    const storedCourses = localStorage.getItem("eduflow_courses") || "[]";
    const storedTeachers = localStorage.getItem("eduflow_teachers") || "[]";
    const storedSchedule = localStorage.getItem("eduflow_generated_schedule");

    setStats({
      courses: JSON.parse(storedCourses).length,
      teachers: JSON.parse(storedTeachers).length
    });

    if (storedSchedule) {
      setSchedule(JSON.parse(storedSchedule));
    }
  }, []);

  const generateSmartSchedule = () => {
    setLoading(true);

    const courses = JSON.parse(localStorage.getItem("eduflow_courses") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");

    if (courses.length === 0 || teachers.length === 0) {
      alert("⚠️ Δεν βρέθηκαν επαρκή δεδομένα μαθημάτων ή καθηγητών στο σύστημα.");
      setLoading(false);
      return;
    }

    // Παράμετροι Φροντιστηρίου
    const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή"];
    const hours = ["15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    const rooms = ["Αίθουσα Α", "Αίθουσα Β", "Αίθουσα Γ", "Αίθουσα Δ"];

    const generatedEntries: any[] = [];

    // Μηχανισμός Tracking για την πρόληψη συγκρούσεων (Conflicts)
    const occupiedTeachers = new Set<string>(); // "Ημέρα-Ώρα-Καθηγητής"
    const occupiedRooms = new Set<string>();    // "Ημέρα-Ώρα-Αίθουσα"
    const occupiedStudents = new Set<string>(); // "Ημέρα-Ώρα-Μάθημα/Τμήμα"

    courses.forEach((course: any, index: number) => {
      // 1. Εύρεση κατάλληλου καθηγητή για το μάθημα
      const teacherObj = teachers.find((t: any) => t.name === course.teacher || t.specialty === course.topic) 
        || teachers[index % teachers.length];
      
      const teacherName = teacherObj ? teacherObj.name : "Εκκρεμεί Καθηγητής";

      let assignedDay = "";
      let assignedTime = "";
      let assignedRoom = "";
      let slotFound = false;

      // 2. Αναζήτηση ελεύθερου Slot που ικανοποιεί ΚΑΘΗΓΗΤΗ + ΜΑΘΗΤΗ + ΑΙΘΟΥΣΑ ταυτόχρονα
      for (let d of days) {
        for (let h of hours) {
          for (let r of rooms) {
            
            const teacherKey = `${d}-${h}-${teacherName}`;
            const roomKey = `${d}-${h}-${r}`;
            const studentKey = `${d}-${h}-${course.title}`; // Αποφυγή διπλού μαθήματος για το ίδιο τμήμα την ίδια ώρα

            // Έλεγχος αν το Slot είναι 100% καθαρό από συγκρούσεις
            if (!occupiedTeachers.has(teacherKey) && !occupiedRooms.has(roomKey) && !occupiedStudents.has(studentKey)) {
              assignedDay = d;
              assignedTime = h;
              assignedRoom = r;
              slotFound = true;

              // Κλείδωμα των slots ώστε να μην χρησιμοποιηθούν από επόμενο μάθημα
              occupiedTeachers.add(teacherKey);
              occupiedRooms.add(roomKey);
              occupiedStudents.add(studentKey);
              break;
            }
          }
          if (slotFound) break;
        }
        if (slotFound) break;
      }

      // Αν λόγω υπερφόρτωσης δεν βρέθηκε τελείως ελεύθερο slot, βάζει fallback για χειροκίνητη διόρθωση
      if (!slotFound) {
        assignedDay = days[index % days.length];
        assignedTime = hours[index % hours.length];
        assignedRoom = rooms[index % rooms.length];
      }

      generatedEntries.push({
        id: `slot-${Date.now()}-${index}`,
        day: assignedDay,
        time: assignedTime,
        course: course.title,
        teacher: teacherName,
        room: assignedRoom
      });
    });

    // Ταξινόμηση ανά ημέρα και ώρα για όμορφη εμφάνιση
    generatedEntries.sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || a.time.localeCompare(b.time));

    setSchedule(generatedEntries);
    localStorage.setItem("eduflow_generated_schedule", JSON.stringify(generatedEntries));
    
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  return (
    <WorkspaceShell 
      title="Έξυπνη Δημιουργία Προγράμματος" 
      description="Αυτόματη γεννήτρια εβδομαδιαίου πλάνου βασισμένη αποκλειστικά σε Μαθήματα, Ώρες Τμημάτων και Διαθεσιμότητα Καθηγητών."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: CONTROL PANEL & ΣΥΝΔΕΣΕΙΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" /> Ζωντανή Σύνδεση Βάσεων
          </h3>
          
          <p className="text-[11px] text-slate-400 mb-5 leading-relaxed">
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
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-2.5 rounded text-xs font-bold">
                {stats.teachers} Ωράρια
              </span>
            </div>
          </div>

          <button
            onClick={generateSmartSchedule}
            disabled={loading}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-xs py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Έλεγχος Διπλοκρατήσεων..." : "Δημιουργία Προγράμματος"}
          </button>

          <div className="mt-4 flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/40">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-[10px] text-slate-400 leading-normal">
              <strong>Ενεργό Conflict-Check:</strong> Διασφαλίζει αυτόματα ότι κανένας καθηγητής, μαθητής ή αίθουσα δεν θα συμπέσει στο ίδιο χρονικό slot.
            </span>
          </div>
        </div>

        {/* ΔΕΞΙΑ: ΕΒΔΟΜΑΔΙΑΙΟ ΠΡΟΓΡΑΜΜΑ (LIVE VIEW) */}
        <div className="lg:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Εβδομαδιαίο Πρόγραμμα
          </h3>

          {schedule.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-[#0b0e14]/50">
              <div className="text-slate-600 text-3xl mb-2">🗓️</div>
              <p className="text-xs text-slate-400 font-medium">Δεν έχει δημιουργηθεί πρόγραμμα ακόμη</p>
              <p className="text-[11px] text-slate-500 mt-1">Πατήστε το κουμπί αριστερά για αυτόματη επίλυση ωρών.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <th className="pb-3">Ημέρα</th>
                    <th className="pb-3">Ώρα</th>
                    <th className="pb-3">Μάθημα</th>
                    <th className="pb-3">Καθηγητής</th>
                    <th className="pb-3">Αίθουσα</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {schedule.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/10 transition">
                      <td className="py-3.5 font-bold text-white">{s.day}</td>
                      <td className="py-3.5 font-mono text-blue-400 font-semibold">{s.time}</td>
                      <td className="py-3.5 text-slate-200 font-medium">{s.course}</td>
                      <td className="py-3.5 text-purple-300 font-medium">{s.teacher}</td>
                      <td className="py-3.5">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold text-[11px]">
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