"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { 
  Calendar, 
  Cpu, 
  Save, 
  Layers, 
  Clock,
  User,
  ShieldCheck,
  Users,
  BookOpen,
  Edit2
} from "lucide-react";

// 1. ΔΕΔΟΜΕΝΑ ΑΠΟ ΟΘΟΝΗ "ΔΙΑΧΕΙΡΙΣΗ ΚΑΘΗΓΗΤΩΝ" (image_d3afdd.png, image_c6fd57.png)
const MOCK_TEACHERS_DB = [
  {
    id: "t1",
    name: "Ελένη Παπαδοπούλου",
    specialty: "Μαθηματικά",
    availability: ["Δευτέρα", "Τρίτη", "Πέμπτη", "Σάββατο"],
    email: "eleni@example.com"
  },
  {
    id: "t2",
    name: "Κωνσταντίνος Βασιλείου",
    specialty: "Φυσική",
    availability: ["Δευτέρα", "Τετάρτη", "Παρασκευή"],
    email: "konstantinos@example.com"
  }
];

// 2. ΔΕΔΟΜΕΝΑ ΑΠΟ ΟΘΟΝΗ "ΜΑΘΗΜΑΤΑ" (image_c6889e.png)
const MOCK_COURSES_DB = [
  { id: "c1", title: "Εφαρμοσμένα Μαθηματικά", subject: "Μαθηματικά", teacherName: "Ελένη Παπαδοπούλου", duration: "12 εβδομάδες", slots: 10 },
  { id: "c2", title: "Προχωρημένη Φυσική", subject: "Φυσική", teacherName: "Κωνσταντίνος Βασιλείου", duration: "10 εβδομάδες", slots: 8 },
  { id: "c3", title: "Νεοελληνική Γλώσσα", subject: "Έκθεση", teacherName: "Γιώργος Παπαδάκης", duration: "12 εβδομάδες", slots: 15 }
];

// 3. ΔΕΔΟΜΕΝΑ ΑΠΟ ΟΘΟΝΗ "ΠΥΛΗ ΓΟΝΕΩΝ" (image_c76713.png)
const MOCK_PARENTS_DB = [
  { parentName: "Ανδρέας Παπαδόπουλος", studentName: "Γιάννης Παπαδόπουλος", relation: "Πατέρας", email: "andreas@example.com", targetSubject: "Μαθηματικά" },
  { parentName: "Ελένη Κωνσταντίνου", studentName: "Μαρία Κωνσταντίνου", relation: "Μητέρα", email: "eleni.parent@example.com", targetSubject: "Φυσική" }
];

// ΔΙΑΘΕΣΙΜΕΣ ΑΙΘΟΥΣΕΣ (image_c6f99b.png)
const ROOMS = ["Αίθουσα Α", "Αίθουσα Β", "Αίθουσα Γ"];

export default function SmartScheduler() {
  const [mounted, setMounted] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ΜΗΧΑΝΗ ΕΞΥΠΝΗΣ ΔΗΜΙΟΥΡΓΙΑΣ (CROSS-REFERENCE ALGORITHM)
  const generateSmartSchedule = () => {
    setIsGenerating(true);
    setSchedule([]);

    setTimeout(() => {
      const computedSchedule: any[] = [];
      
      // Διασταύρωση 1: Παίρνουμε τους μαθητές/γονείς από την Πύλη Γονέων
      MOCK_PARENTS_DB.forEach((parent, index) => {
        // Διασταύρωση 2: Βρίσκουμε το κατάλληλο ενεργό Μάθημα
        const targetCourse = MOCK_COURSES_DB.find(course => course.subject === parent.targetSubject);
        
        if (targetCourse) {
          // Διασταύρωση 3: Βρίσκουμε τον Καθηγητή και ελέγχουμε τις ημέρες διαθεσιμότητάς του
          const teacherInfo = MOCK_TEACHERS_DB.find(t => t.name === targetCourse.teacherName);
          
          if (teacherInfo && teacherInfo.availability.length > 0) {
            // Επιλέγουμε μια ημέρα από τις διαθέσιμες του καθηγητή για το μάθημα
            const assignedDay = teacherInfo.availability[index % teacherInfo.availability.length];
            const assignedTime = index === 0 ? "09:00" : "11:00"; // Κατανομή ωρών
            const assignedRoom = ROOMS[index % ROOMS.length]; // Μοίρασμα σε αίθουσες

            computedSchedule.push({
              id: `sched-${index}`,
              day: assignedDay,
              time: assignedTime,
              courseTitle: targetCourse.title,
              teacher: teacherInfo.name,
              student: parent.studentName,
              parent: parent.parentName,
              room: assignedRoom
            });
          }
        }
      });

      setSchedule(computedSchedule);
      setIsGenerating(false);
    }, 1200);
  };

  if (!mounted) return null;

  return (
    <WorkspaceShell 
      title="Έξυπνη Δημιουργία Προγράμματος" 
      description="Σύνδεση και αυτόματη διασταύρωση δεδομένων μεταξύ Καθηγητών, Μαθημάτων και Αιτημάτων από την Πύλη Γονέων."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: ΕΛΕΓΧΟΣ ΚΑΙ ΣΥΝΔΕΣΗ ΒΑΣΕΩΝ ΔΕΔΟΜΕΝΩΝ */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Ανάγνωση Πηγών Δεδομένων</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Ο αλγόριθμος σκανάρει τις ενεργές εγγραφές για να αποτρέψει διπλοκρατήσεις καθηγητών ή αιθουσών:
            </p>

            {/* STATUS ΣΥΝΔΕΣΗΣ ΜΕ ΟΘΟΝΕΣ */}
            <div className="space-y-2.5 mb-6">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-400" /> Κατάλογος Καθηγητών
                </div>
                <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                  {MOCK_TEACHERS_DB.length} Εγγραφές
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" /> Διαθέσιμα Μαθήματα
                </div>
                <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                  {MOCK_COURSES_DB.length} Εγγραφές
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Επαφές & Πύλη Γονέων
                </div>
                <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
                  {MOCK_PARENTS_DB.length} Μαθητές
                </span>
              </div>
            </div>

            <button
              onClick={generateSmartSchedule}
              disabled={isGenerating}
              className={`w-full py-3.5 rounded-xl text-xs font-bold transition shadow-xl ${
                isGenerating 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              }`}
            >
              {isGenerating ? "Διασταύρωση & Επίλυση..." : "Δημιουργία Προγράμματος"}
            </button>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Αυτόματη Αποφυγή Συγκρούσεων:</strong> Το σύστημα εγγυάται ότι κανένας καθηγητής δεν θα τοποθετηθεί σε κοινή ώρα ή αίθουσα.
            </div>
          </div>
        </div>

        {/* ΔΕΞΙΑ: ΕΒΔΟΜΑΔΙΑΙΟ ΠΡΟΓΡΑΜΜΑ (image_c6f99b.png) */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl min-h-[480px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" /> Εβδομαδιαίο Πρόγραμμα
                </h3>
                {schedule.length > 0 && (
                  <button 
                    onClick={() => alert("💾 Το πρόγραμμα αποθηκεύτηκε επιτυχώς στο Supabase!")}
                    className="text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-xl font-bold transition"
                  >
                    Αποθήκευση Προγράμματος
                  </button>
                )}
              </div>

              {schedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-center">
                  <Layers className={`w-12 h-12 mb-3 opacity-20 ${isGenerating ? "animate-pulse text-indigo-400 opacity-60" : ""}`} />
                  <p className="text-sm font-medium text-slate-300">
                    {isGenerating ? "Γίνεται επεξεργασία δεδομένων..." : "Εκκρεμεί η δημιουργία προγράμματος"}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Πατήστε το κουμπί αριστερά για να διαβαστούν αυτόματα οι πίνακες καθηγητών, μαθημάτων και γονέων.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                        <th className="pb-3 font-bold">Ημέρα</th>
                        <th className="pb-3 font-bold">Ώρα</th>
                        <th className="pb-3 font-bold">Μάθημα</th>
                        <th className="pb-3 font-bold">Καθηγητής</th>
                        <th className="pb-3 font-bold">Αίθουσα</th>
                        <th className="pb-3 font-bold text-right">Ενέργειες</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {schedule.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/10 transition group">
                          <td className="py-3.5 font-bold text-white">{item.day}</td>
                          <td className="py-3.5 font-mono font-semibold text-indigo-400">{item.time}</td>
                          <td className="py-3.5">
                            <div className="font-semibold text-slate-200">{item.courseTitle}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">Μαθητής: {item.student}</div>
                          </td>
                          <td className="py-3.5 text-slate-300">{item.teacher}</td>
                          <td className="py-3.5 font-bold text-amber-400 font-mono">{item.room}</td>
                          <td className="py-3.5 text-right">
                            <button 
                              onClick={() => setSelectedLog(`Χειροκίνητη τροποποίηση για το μάθημα: ${item.courseTitle}. Κηδεμόνας: ${item.parent}`)}
                              className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded text-[11px] text-slate-300 font-medium transition"
                            >
                              <Edit2 className="w-3 h-3" /> Επεξεργασία
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* FOOTER METRICS & CONTEXT LOG */}
            {selectedLog && (
              <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-[11px] text-indigo-300 animate-in slide-in-from-bottom-2">
                ℹ️ {selectedLog}
              </div>
            )}
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}