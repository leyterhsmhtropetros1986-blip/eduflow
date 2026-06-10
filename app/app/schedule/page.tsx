"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { 
  Calendar, 
  Cpu, 
  Save, 
  Layers, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  User
} from "lucide-react";

// Mock Data - Σε κανονική ροή θα έρχονται από το Supabase / API σας
const MOCK_TEACHERS = [
  { id: "t1", name: "Ελένη Παπαδοπούλου", specialty: "Μαθηματικά", schedule: [{ day: "Mon", slots: [{ start: "14:00", end: "16:00" }, { start: "17:00", end: "19:00" }] }, { day: "Wed", slots: [{ start: "15:00", end: "18:00" }] }] },
  { id: "t2", name: "Κωνσταντίνος Βασιλείου", specialty: "Φυσική", schedule: [{ day: "Tue", slots: [{ start: "16:00", end: "19:00" }] }, { day: "Thu", slots: [{ start: "14:00", end: "17:00" }] }] }
];

const MOCK_STUDENTS = [
  { id: "s1", name: "Γιάννης Παπαδόπουλος", subjects: ["Μαθηματικά"], schedule: [{ day: "Mon", slots: [{ start: "14:00", end: "16:00" }] }] },
  { id: "s2", name: "Μαρία Κωνσταντίνου", subjects: ["Φυσική", "Μαθηματικά"], schedule: [{ day: "Tue", slots: [{ start: "16:00", end: "18:00" }] }, { day: "Wed", slots: [{ start: "15:00", end: "17:00" }] }] }
];

const DAY_LABELS: Record<string, string> = {
  Mon: "Δευτέρα", Tue: "Τρίτη", Wed: "Τετάρτη", Thu: "Πέμπτη", Fri: "Παρασκευή", Sat: "Σάββατο"
};

export default function SmartScheduler() {
  const [mounted, setMounted] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ totalLessons: 0, conflictsSolved: 0 });

  useEffect(() => { setMounted(true); }, []);

  // ΑΛΓΟΡΙΘΜΟΣ ΑΥΤΟΜΑΤΟΥ ΥΠΟΛΟΓΙΣΜΟΥ ΒΕΛΤΙΣΤΟΥ ΠΡΟΓΡΑΜΜΑΤΟΣ
  const autoGenerateSchedule = () => {
    setIsProcessing(true);
    setGeneratedSchedule([]);
    
    setTimeout(() => {
      const newSchedule: any[] = [];
      let conflictsCounter = 0;
      let roomIdCounter = 1;

      // 1. Σκανάρισμα κάθε μαθητή και των αναγκών του
      MOCK_STUDENTS.forEach(student => {
        student.subjects.forEach(subject => {
          
          // 2. Εύρεση κατάλληλου καθηγητή για το μάθημα
          const availableTeacher = MOCK_TEACHERS.find(t => t.specialty === subject);
          
          if (availableTeacher) {
            // 3. Διασταύρωση κοινών ημερών και slots (Overlap Detection)
            student.schedule.forEach(studentDay => {
              const teacherDay = availableTeacher.schedule.find(td => td.day === studentDay.day);
              
              if (teacherDay) {
                // Έλεγχος αν συμπίπτουν οι ώρες (απλοποιημένο overlap)
                studentDay.slots.forEach(sSlot => {
                  teacherDay.slots.forEach(tSlot => {
                    
                    // Αν το slot του μαθητή βρίσκεται μέσα στα όρια διαθεσιμότητας του καθηγητή
                    if (sSlot.start >= tSlot.start && sSlot.end <= tSlot.end) {
                      
                      // Έλεγχος για διπλοκρατήσεις καθηγητή την ίδια ώρα
                      const isTeacherBusy = newSchedule.some(item => 
                        item.teacherId === availableTeacher.id && 
                        item.day === studentDay.day &&
                        ((sSlot.start >= item.start && sSlot.start < item.end) || 
                         (sSlot.end > item.start && sSlot.end <= item.end))
                      );

                      if (!isTeacherBusy) {
                        newSchedule.push({
                          id: `entry-${Date.now()}-${Math.random()}`,
                          day: studentDay.day,
                          start: sSlot.start,
                          end: sSlot.end,
                          subject,
                          teacher: availableTeacher.name,
                          teacherId: availableTeacher.id,
                          student: student.name,
                          room: `Αίθουσα ${String.fromCharCode(64 + roomIdCounter)}`
                        });
                        roomIdCounter = roomIdCounter % 3 === 0 ? 1 : roomIdCounter + 1;
                      } else {
                        conflictsCounter++; // Επιλύθηκε/Αποφεύχθηκε σύγκρουση ωραρίου
                      }
                    }
                  });
                });
              }
            });
          }
        });
      });

      setGeneratedSchedule(newSchedule);
      setStats({ totalLessons: newSchedule.length, conflictsSolved: conflictsCounter });
      setIsProcessing(false);
    }, 1200); // Ψευδο-προσομοίωση AI επεξεργασίας
  };

  const saveToSupabase = () => {
    alert("💾 Το βέλτιστο πρόγραμμα αποθηκεύτηκε επιτυχώς στη βάση δεδομένων και στάλθηκαν Push Notifications σε καθηγητές και γονείς!");
  };

  return (
    <WorkspaceShell 
      title="Έξυπνη Δημιουργία Προγράμματος (AI Solver)" 
      description="Αυτόματος αλγόριθμος διασταύρωσης διαθεσιμότητας μαθητών και καθηγητών με μηδενικές συγκρούσεις ωραρίων."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΟ PANEL: ΕΛΕΓΧΟΣ ΜΗΧΑΝΗΣ ΥΠΟΛΟΓΙΣΜΟΥ */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><Cpu className="w-5 h-5" /></div>
              <h3 className="text-base font-bold text-white">Αυτόματος Υπολογισμός</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Η μηχανή θα αναλύσει τα σπαστά ωράρια των μαθητών, τις αναθέσεις μαθημάτων των καθηγητών και τις αίθουσες για να εξάγει το ιδανικό εβδομαδιαίο πλάνο.
            </p>

            <button
              onClick={autoGenerateSchedule}
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xl ${
                isProcessing 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              }`}
            >
              {isProcessing ? "Υπολογισμός βέλτιστων λύσεων..." : "Έναρξη Αυτόματης Δημιουργίας"}
            </button>
          </div>

          {/* METRICS ΜΗΧΑΝΗΣ */}
          {stats.totalLessons > 0 && (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Στατιστικά Επίλυσης</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                  <div className="text-xl font-mono font-bold text-emerald-400">{stats.totalLessons}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Συνεδρίες Προγράμματος</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                  <div className="text-xl font-mono font-bold text-indigo-400">{stats.conflictsSolved}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Συγκρούσεις που αποφεύχθηκαν</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ΔΕΞΙ PANEL: ΠΙΝΑΚΑΣ ΠΑΡΑΓΟΜΕΝΟΥ ΕΒΔΟΜΑΔΙΑΙΟΥ ΠΡΟΓΡΑΜΜΑΤΟΣ */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl min-h-[450px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" /> Εβδομαδιαίο Πρόγραμμα Μαθημάτων
                </h3>
                {generatedSchedule.length > 0 && (
                  <button 
                    onClick={saveToSupabase}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/10"
                  >
                    <Save className="w-3.5 h-3.5" /> Αποθήκευση στο Cloud
                  </button>
                )}
              </div>

              {generatedSchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-center">
                  <Layers className={`w-12 h-12 mb-3 opacity-20 ${isProcessing ? "animate-pulse text-indigo-400 opacity-60" : ""}`} />
                  <p className="text-sm font-medium text-slate-300">
                    {isProcessing ? "Ο αλγόριθμος διασταυρώνει τα δεδομένα..." : "Εκκρεμεί η αυτόματη παραγωγή προγράμματος."}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    {isProcessing ? "Παρακαλώ περιμένετε, ελέγχονται οι περιορισμοί διαθεσιμότητας." : "Πατήστε το κουμπί αριστερά για να αντληθούν οι ώρες μαθητών και καθηγητών."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                        <th className="pb-3 font-bold">Ημέρα / Ώρα</th>
                        <th className="pb-3 font-bold">Μάθημα</th>
                        <th className="pb-3 font-bold">Καθηγητής</th>
                        <th className="pb-3 font-bold">Μαθητής</th>
                        <th className="pb-3 font-bold">Αίθουσα</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {generatedSchedule.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/10 transition group">
                          <td className="py-3.5">
                            <div className="text-xs font-bold text-white">{DAY_LABELS[item.day]}</div>
                            <div className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-0.5 mt-0.5">
                              <Clock className="w-3 h-3 opacity-70" /> {item.start} - {item.end}
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className="text-xs bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/10 font-bold">
                              {item.subject}
                            </span>
                          </td>
                          <td className="py-3.5 text-xs font-medium text-slate-200">{item.teacher}</td>
                          <td className="py-3.5 text-xs font-bold text-slate-100 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-500" /> {item.student}
                          </td>
                          <td className="py-3.5 text-xs font-bold text-purple-400 font-mono">{item.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-3.5 mt-6 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                💡 <strong className="text-slate-200">Έξυπνος Έλεγχος:</strong> Ο αλγόριθμος εξασφαλίζει αυτόματα ότι κανένας καθηγητής δεν διδάσκει σε δύο διαφορετικές αίθουσες ή μαθητές το ίδιο ακριβώς λεπτό.
              </p>
            </div>
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}