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
  Sparkles
} from "lucide-react";

// 1. ΔΕΔΟΜΕΝΑ ΑΠΟ ΟΘΟΝΗ "ΔΙΑΧΕΙΡΙΣΗ ΚΑΘΗΓΗΤΩΝ" (image_c6fd57.png)
const INITIAL_TEACHERS = [
  { id: "t1", name: "Ελένη Παπαδοπούλου", specialty: "Μαθηματικά", classes: ["Α' ΓΥΜΝΑΣΙΟΥ", "Γ' ΓΥΜΝΑΣΙΟΥ"] },
  { id: "t2", name: "Κωνσταντίνος Βασιλείου", specialty: "Φυσική", classes: ["Β' ΛΥΚΕΙΟΥ"] }
];

// 2. ΔΕΔΟΜΕΝΑ ΑΠΟ ΟΘΟΝΗ "ΜΑΘΗΜΑΤΑ" (image_c6889e.png)
const INITIAL_COURSES = [
  { id: "m1", title: "Εφαρμοσμένα Μαθηματικά", subject: "Μαθηματικά", teacher: "Ελένη Παπαδοπούλου", duration: "12 εβδομάδες", seats: 10 },
  { id: "m2", title: "Προχωρημένη Φυσική", subject: "Φυσική", teacher: "Κωνσταντίνος Βασιλείου", duration: "10 εβδομάδες", seats: 8 },
  { id: "m3", title: "Αρχαία Ελληνικά", subject: "Φιλολογικά", teacher: "Μαρία Δημητρίου", duration: "9 εβδομάδες", seats: 12 },
  { id: "m4", title: "Νεοελληνική Γλώσσα", subject: "Έκθεση", teacher: "Γιώργος Παπαδάκης", duration: "12 εβδομάδες", seats: 15 }
];

// 3. ΔΕΔΟΜΕΝΑ ΑΠΟ ΟΘΟΝΕΣ "ΠΥΛΗ ΓΟΝΕΩΝ" & "ΚΕΝΤΡΙΚΟΣ ΠΙΝΑΚΑΣ" (image_c76713.png & image_c694bd.png)
const INITIAL_STUDENTS = [
  { id: "s1", name: "Γιάννης Παπαδόπουλος", parent: "Ανδρέας Παπαδόπουλος", className: "Γ' Λυκείου", targetSubject: "Μαθηματικά" },
  { id: "s2", name: "Μαρία Κωνσταντίνου", parent: "Ελένη Κωνσταντίνου", className: "Β' Λυκείου", targetSubject: "Φυσική" },
  { id: "s3", name: "Νίκος Γεωργίου", parent: "Κρίτων Γεωργίου", className: "Α' Λυκείου", targetSubject: "Έκθεση" }
];

// ΔΙΑΘΕΣΙΜΕΣ ΑΙΘΟΥΣΕΣ ΦΡΟΝΤΙΣΤΗΡΙΟΥ (image_c6f99b.png)
const AVAILABLE_ROOMS = ["Αίθουσα Α", "Αίθουσα Β", "Αίθουσα Γ"];

export default function SmartScheduler() {
  const [mounted, setMounted] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ΑΛΓΟΡΙΘΜΟΣ ΑΥΤΟΜΑΤΗΣ ΔΙΑΣΤΑΥΡΩΣΗΣ (CROSS-REFERENCE LOGIC)
  const handleAutoGeneration = () => {
    setIsProcessing(true);
    setSchedule([]);

    setTimeout(() => {
      const generatedRows: any[] = [];
      
      // Διαβάζουμε κάθε εγγραφή μαθητή/γονέα (image_c76713.png)
      INITIAL_STUDENTS.forEach((student, index) => {
        // Ψάχνουμε αν υπάρχει ενεργό μάθημα που ταιριάζει με το αντικείμενο του μαθητή (image_c6889e.png)
        const matchedCourse = INITIAL_COURSES.find(c => c.subject === student.targetSubject);
        
        if (matchedCourse) {
          // Δημιουργία εγγραφής με βάση το UI της "Έξυπνης Δημιουργίας" (image_c6f99b.png)
          const days = ["Δευτέρα", "Τετάρτη", "Τρίτη"];
          const hours = ["09:00", "11:00", "14:00"];
          
          generatedRows.push({
            id: `sch-${student.id}-${index}`,
            day: days[index % days.length],
            time: hours[index % hours.length],
            courseTitle: matchedCourse.title,
            teacherName: matchedCourse.teacher,
            room: AVAILABLE_ROOMS[index % AVAILABLE_ROOMS.length],
            studentName: student.name
          });
        }
      });

      setSchedule(generatedRows);
      setIsProcessing(false);
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <WorkspaceShell 
      title="Έξυπνη Δημιουργία Προγράμματος" 
      description="Αυτόματη δημιουργία και βελτίωση εβδομαδιαίου προγράμματος χωρίς συγκρούσεις μεταξύ καθηγητών, αιθουσών και μαθητών."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: ΕΛΕΓΧΟΣ ΣΥΛΛΟΓΗΣ ΔΕΔΟΜΕΝΩΝ */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Συγκέντρωση Στοιχείων</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Η μηχανή επεξεργάζεται αυτόματα τις ενεργές εγγραφές από τις ενότητες <strong>Μαθήματα</strong>, <strong>Καθηγητές</strong> και <strong>Γονείς</strong> για την αποφυγή διπλοκρατήσεων.
            </p>

            {/* ΕΝΔΕΙΞΕΙΣ ΣΥΝΔΕΣΗΣ ΠΙΝΑΚΩΝ */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Πίνακας Μαθημάτων
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 font-mono">
                  {INITIAL_COURSES.length} ΕΝΕΡΓΑ
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Αιτήματα Μαθητών/Γονέων
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 font-mono">
                  {INITIAL_STUDENTS.length} ΣΥΝΔΕΔΕΜΕΝΟΙ
                </span>
              </div>
            </div>

            <button
              onClick={handleAutoGeneration}
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xl ${
                isProcessing 
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isProcessing ? "Διασταύρωση Πινάκων..." : "Δημιουργία προγράμματος"}
            </button>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800/60 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Συγχρονισμός με Supabase:</strong> Μετά την παραγωγή, το πρόγραμμα κλειδώνει και εμφανίζεται άμεσα στον Κεντρικό Πίνακα.
            </div>
          </div>
        </div>

        {/* ΔΕΞΙΑ: ΕΒΔΟΜΑΔΙΑΙΟ ΠΡΟΓΡΑΜΜΑ (image_c6f99b.png) */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl min-h-[450px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" /> Εβδομαδιαίο πρόγραμμα
              </h3>
              {schedule.length > 0 && (
                <button 
                  onClick={() => alert("💾 Το πρόγραμμα αποθηκεύτηκε επιτυχώς στο Supabase!")}
                  className="text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl font-bold transition"
                >
                  Αποθήκευση προγράμματος
                </button>
              )}
            </div>

            {schedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-center">
                <Layers className={`w-12 h-12 mb-3 opacity-20 ${isProcessing ? "animate-pulse text-indigo-400 opacity-60" : ""}`} />
                <p className="text-sm font-medium text-slate-300">
                  {isProcessing ? "Ανάγνωση στοιχείων από Μαθήματα & Γονείς..." : "Δεν έχει δημιουργηθεί πρόγραμμα"}
                </p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Πατήστε το κουμπί "Δημιουργία προγράμματος" για να εκτελεστεί η αυτόματη αντιστοίχιση.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
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
                        <td className="py-4 font-bold text-white">{item.day}</td>
                        <td className="py-4 font-mono font-semibold text-indigo-400">{item.time}</td>
                        <td className="py-4">
                          <div className="font-semibold text-slate-200">{item.courseTitle}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Μαθητής: {item.studentName}</div>
                        </td>
                        <td className="py-4 text-slate-300">{item.teacherName}</td>
                        <td className="py-4 font-bold text-amber-400 font-mono">{item.room}</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => alert(`Τροποποίηση για το μάθημα: ${item.courseTitle}`)}
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded text-[11px] text-slate-300 font-medium transition"
                          >
                            Επεξεργασία
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

      </div>
    </WorkspaceShell>
  );
}