"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { 
  Calendar, 
  Cpu, 
  Save, 
  Layers, 
  CheckCircle, 
  Clock,
  User,
  ShieldCheck,
  Users,
  Home
} from "lucide-react";

// 1. ΔΕΔΟΜΕΝΑ ΚΑΘΗΓΗΤΩΝ (Από τη διαχείριση καθηγητών)
const MOCK_TEACHERS = [
  { 
    id: "t1", 
    name: "Ελένη Παπαδοπούλου", 
    specialty: "Μαθηματικά", 
    classes: ["Γ' ΛΥΚΕΙΟΥ", "Α' ΓΥΜΝΑΣΙΟΥ"],
    schedule: [
      { day: "Mon", slots: [{ start: "14:00", end: "16:00" }, { start: "17:00", end: "19:00" }] },
      { day: "Wed", slots: [{ start: "15:00", end: "18:00" }] }
    ] 
  },
  { 
    id: "t2", 
    name: "Κωνσταντίνος Βασιλείου", 
    specialty: "Φυσική", 
    classes: ["Β' ΛΥΚΕΙΟΥ"],
    schedule: [
      { day: "Tue", slots: [{ start: "16:00", end: "19:00" }] },
      { day: "Thu", slots: [{ start: "14:00", end: "17:00" }] }
    ] 
  }
];

// 2. ΔΕΔΟΜΕΝΑ ΠΥΛΗΣ ΓΟΝΕΩΝ & ΜΑΘΗΤΩΝ (Σύνδεση γονέα-μαθητή & απαιτήσεις μαθημάτων/ωρών)
const MOCK_PARENTS_AND_STUDENTS = [
  {
    parentName: "Ανδρέας Παπαδόπουλος",
    studentName: "Γιάννης Παπαδόπουλος",
    relation: "Πατέρας",
    requestedSubjects: ["Μαθηματικά"],
    studentClass: "Γ' ΛΥΚΕΙΟΥ",
    availability: [
      { day: "Mon", slots: [{ start: "14:00", end: "16:00" }] }
    ]
  },
  {
    parentName: "Ελένη Κωνσταντίνου",
    studentName: "Μαρία Κωνσταντίνου",
    relation: "Μητέρα",
    requestedSubjects: ["Φυσική", "Μαθηματικά"],
    studentClass: "Β' ΛΥΚΕΙΟΥ",
    availability: [
      { day: "Tue", slots: [{ start: "16:00", end: "18:00" }] },
      { day: "Wed", slots: [{ start: "15:00", end: "17:00" }] }
    ]
  }
];

// 3. ΔΙΑΘΕΣΙΜΕΣ ΑΙΘΟΥΣΕΣ ΦΡΟΝΤΙΣΤΗΡΙΟΥ
const AVAILABLE_ROOMS = ["Αίθουσα Α", "Αίθουσα Β", "Αίθουσα Γ"];

const DAY_LABELS: Record<string, string> = {
  Mon: "Δευτέρα", 
  Tue: "Τρίτη", 
  Wed: "Τετάρτη", 
  Thu: "Πέμπτη", 
  Fri: "Παρασκευή", 
  Sat: "Σάββατο"
};

export default function SmartScheduler() {
  const [mounted, setMounted] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ totalLessons: 0, conflictsSolved: 0, dataSources: 0 });

  useEffect(() => { 
    setMounted(true); 
  }, []);

  // ΑΛΓΟΡΙΘΜΟΣ ΣΥΝΔΥΑΣΤΙΚΗΣ ΕΠΙΛΥΣΗΣ ΩΡΑΡΙΩΝ (CROSS-REFERENCE SOLVER)
  const handleCrossReferenceOptimization = () => {
    setIsProcessing(true);
    setGeneratedSchedule([]);
    
    setTimeout(() => {
      const newSchedule: any[] = [];
      let conflictsCounter = 0;
      let roomIndex = 0;

      // Σκανάρισμα της Πύλης Γονέων / Μαθητών
      MOCK_PARENTS_AND_STUDENTS.forEach(record => {
        record.requestedSubjects.forEach(subject => {
          
          // Εύρεση κατάλληλου καθηγητή που διδάσκει αυτό το μάθημα ΚΑΙ αυτή την τάξη
          const suitableTeacher = MOCK_TEACHERS.find(t => 
            t.specialty === subject && t.classes.includes(record.studentClass)
          );
          
          if (suitableTeacher) {
            // Διασταύρωση ωραρίων που δήλωσε ο γονέας με τα σπαστά ωράρια του καθηγητή
            record.availability.forEach(studentDay => {
              const teacherDay = suitableTeacher.schedule.find(td => td.day === studentDay.day);
              
              if (teacherDay) {
                studentDay.slots.forEach(sSlot => {
                  teacherDay.slots.forEach(tSlot => {
                    
                    // Έλεγχος αν το slot του μαθητή/γονέα συμπίπτει με το σπαστό ωράριο του καθηγητή
                    if (sSlot.start >= tSlot.start && sSlot.end <= tSlot.end) {
                      
                      // Έλεγχος διπλοκράτησης καθηγητή ή αίθουσας την ίδια μέρα και ώρα
                      const hasConflict = newSchedule.some(item => 
                        item.day === studentDay.day &&
                        ((sSlot.start >= item.start && sSlot.start < item.end) || 
                         (sSlot.end > item.start && sSlot.end <= item.end)) &&
                        (item.teacherId === suitableTeacher.id || item.room === AVAILABLE_ROOMS[roomIndex])
                      );

                      if (!hasConflict) {
                        newSchedule.push({
                          id: `optimized-${Date.now()}-${Math.random()}`,
                          day: studentDay.day,
                          start: sSlot.start,
                          end: sSlot.end,
                          subject,
                          teacher: suitableTeacher.name,
                          teacherId: suitableTeacher.id,
                          student: record.studentName,
                          parent: record.parentName,
                          room: AVAILABLE_ROOMS[roomIndex]
                        });
                        
                        // Εναλλαγή αιθουσών
                        roomIndex = (roomIndex + 1) % AVAILABLE_ROOMS.length;
                      } else {
                        conflictsCounter++;
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
      setStats({ 
        totalLessons: newSchedule.length, 
        conflictsSolved: conflictsCounter,
        dataSources: 3
      });
      setIsProcessing(false);
    }, 1400);
  };

  const saveSchedule = () => {
    alert("💾 Το πρόγραμμα κλειδώθηκε! Ενημερώθηκαν αυτόματα οι λογαριασμοί των Καθηγητών και οι Πύλες των αντίστοιχων Γονέων.");
  };

  if (!mounted) return null;

  return (
    <WorkspaceShell 
      title="Έξυπνη Μηχανή Ανάλυσης & Δημιουργίας" 
      description="Αυτόματη άντληση δεδομένων από το προφίλ καθηγητών και τις φόρμες διαθεσιμότητας γονέων για την παραγωγή του βέλτιστου εβδομαδιαίου πλάνου."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: ΠΗΓΕΣ ΔΕΔΟΜΕΝΩΝ & ΕΛΕΓΧΟΣ */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Συγκέντρωση Πηγών</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Η μηχανή διαβάζει ταυτόχρονα τις αιτήσεις μαθημάτων από την <strong>Πύλη Γονέων</strong>, τα σπαστά ωράρια από τη <strong>Διαχείριση Καθηγητών</strong> και το πλήθος των <strong>Διαθέσιμων Αιθουσών</strong>.
            </p>

            {/* ΣΥΝΔΕΔΕΜΕΝΕΣ ΠΗΓΕΣ */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-indigo-400" /> Σύνδεση με Πύλη Γονέων
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">ΕΝΕΡΓΗ</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-purple-400" /> Ωράρια Καθηγητών
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">ΕΝΕΡΓΗ</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Home className="w-3.5 h-3.5 text-amber-400" /> Χωρητικότητα Αιθουσών
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">ΕΝΕΡΓΗ</span>
              </div>
            </div>

            <button
              onClick={handleCrossReferenceOptimization}
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xl ${
                isProcessing 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              }`}
            >
              {isProcessing ? "Ανάλυση & Διασταύρωση..." : "Αυτόματη Επίλυση & Παραγωγή"}
            </button>
          </div>

          {/* ΣΤΑΤΙΣΤΙΚΑ */}
          {stats.totalLessons > 0 && (
            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ανάλυση Solver</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 text-center">
                  <div className="text-base font-mono font-bold text-emerald-400">{stats.totalLessons}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Μαθήματα</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 text-center">
                  <div className="text-base font-mono font-bold text-indigo-400">{stats.conflictsSolved}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Συγκρούσεις</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 text-center">
                  <div className="text-base font-mono font-bold text-purple-400">{stats.dataSources}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Βάσεις</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ΔΕΞΙΑ: ΠΙΝΑΚΑΣ ΠΡΟΓΡΑΜΜΑΤΟΣ */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl min-h-[480px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" /> Παραγόμενο Πλάνο Φροντιστηρίου
                </h3>
                {generatedSchedule.length > 0 && (
                  <button 
                    onClick={saveSchedule}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/10"
                  >
                    <Save className="w-3.5 h-3.5" /> Κλείδωμα & Ενημέρωση Γονέων
                  </button>
                )}
              </div>

              {generatedSchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 text-slate-500 text-center">
                  <Layers className={`w-12 h-12 mb-3 opacity-20 ${isProcessing ? "animate-pulse text-indigo-400 opacity-60" : ""}`} />
                  <p className="text-sm font-medium text-slate-300">
                    {isProcessing ? "Η μηχανή συνδυάζει τα ωράρια..." : "Εκκρεμεί η αυτόματη συγχώνευση."}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Πατήστε το κουμπί για να γίνει αυτόματη διασταύρωση ανάμεσα στις 3 βάσεις δεδομένων.
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
                        <th className="pb-3 font-bold">Μαθητής (Γονέας)</th>
                        <th className="pb-3 font-bold">Χώρος</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {generatedSchedule.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/10 transition">
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
                          <td className="py-3.5">
                            <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-500" /> {item.student}
                            </div>
                            <div className="text-[10px] text-slate-500 pl-4">κρ. {item.parent}</div>
                          </td>
                          <td className="py-3.5 text-xs font-bold text-amber-400 font-mono">{item.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-3.5 mt-6 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                🛡️ <strong className="text-slate-200">Συγχρονισμός 3-Way:</strong> Κάθε φορά που ένας γονέας αλλάζει διαθεσιμότητα στην πύλη του ή ένας καθηγητής αλλάζει σπαστό ωράριο, ο αλγόριθμος το λαμβάνει υπόψη άμεσα στον επόμενο υπολογισμό.
              </p>
            </div>
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}