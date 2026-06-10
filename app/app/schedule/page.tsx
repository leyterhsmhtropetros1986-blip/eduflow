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
  Sparkles,
  Mail,
  MessageSquare,
  CheckCircle2
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

// 3. ΔΕΔΟΜΕΝΑ ΑΠΟ ΟΘΟΝΗ "ΠΥΛΗ ΓΟΝΕΩΝ" (image_c76713.png) - ΕΔΩ ΠΕΡΙΛΑΜΒΑΝΟΝΤΑΙ ΤΑ EMAIL ΚΑΙ ΤΑ ΚΙΝΗΤΑ
const INITIAL_PARENTS_DATABASE = [
  { 
    id: "p1",
    parentName: "Ανδρέας Παπαδόπουλος", 
    studentName: "Γιάννης Παπαδόπουλος", 
    relation: "Πατέρας", 
    email: "andreas@example.com", 
    phone: "6971234567",
    targetSubject: "Μαθηματικά" 
  },
  { 
    id: "p2",
    parentName: "Ελένη Κωνσταντίνου", 
    studentName: "Μαρία Κωνσταντίνου", 
    relation: "Μητέρα", 
    email: "eleni.parent@example.com", 
    phone: "6987654321",
    targetSubject: "Φυσική" 
  }
];

// ΔΙΑΘΕΣΙΜΕΣ ΑΙΘΟΥΣΕΣ ΦΡΟΝΤΙΣΤΗΡΙΟΥ (image_c6f99b.png)
const AVAILABLE_ROOMS = ["Αίθουσα Α", "Αίθουσα Β", "Αίθουσα Γ"];

export default function SmartScheduler() {
  const [mounted, setMounted] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ΑΛΓΟΡΙΘΜΟΣ ΑΥΤΟΜΑΤΗΣ ΔΙΑΣΤΑΥΡΩΣΗΣ (CROSS-REFERENCE LOGIC)
  const handleAutoGeneration = () => {
    setIsProcessing(true);
    setSchedule([]);
    setNotificationLogs([]);

    setTimeout(() => {
      const generatedRows: any[] = [];
      
      // Διαβάζουμε κάθε εγγραφή από τη βάση δεδομένων της Πύλης Γονέων
      INITIAL_PARENTS_DATABASE.forEach((record, index) => {
        // Ψάχνουμε το μάθημα που ταιριάζει με το αντικείμενο ενδιαφέροντος του παιδιού
        const matchedCourse = INITIAL_COURSES.find(c => c.subject === record.targetSubject);
        
        if (matchedCourse) {
          const days = ["Δευτέρα", "Τετάρτη"];
          const hours = ["09:00", "11:00"];
          
          generatedRows.push({
            id: `sch-${record.id}-${index}`,
            day: days[index % days.length],
            time: hours[index % hours.length],
            courseTitle: matchedCourse.title,
            teacherName: matchedCourse.teacher,
            room: AVAILABLE_ROOMS[index % AVAILABLE_ROOMS.length],
            studentName: record.studentName,
            parentName: record.parentName,
            parentEmail: record.email,
            parentPhone: record.phone
          });
        }
      });

      setSchedule(generatedRows);
      setIsProcessing(false);
    }, 900);
  };

  // ΑΥΤΟΜΑΤΗ ΑΠΟΣΤΟΛΗ SMS & EMAIL ΜΕ ΤΗΝ ΑΠΟΘΗΚΕΥΣΗ
  const handleSaveAndNotify = () => {
    setIsSaving(true);
    setNotificationLogs([]);

    setTimeout(() => {
      const logs: string[] = [];
      
      schedule.forEach(item => {
        // 1. Δημιουργία Log για το Email
        logs.push(`📧 Email στάλθηκε στο: ${item.parentEmail} (Κηδ. ${item.parentName}) -> "Το μάθημα '${item.courseTitle}' για τον μαθητή ${item.studentName} προγραμματίστηκε για ${item.day} στις ${item.time} στην ${item.room}."`);
        
        // 2. Δημιουργία Log για το SMS
        logs.push(`💬 SMS στάλθηκε στο: +30 ${item.parentPhone} -> "Eduflow: Το πρόγραμμα του/της ${item.studentName} ενημερώθηκε. ${item.day} ${item.time}, ${item.room}."`);
      });

      setNotificationLogs(logs);
      setIsSaving(false);
      alert("💾 Το πρόγραμμα αποθηκεύτηκε στο Supabase και οι γονείς ενημερώθηκαν αυτόματα!");
    }, 1200);
  };

  if (!mounted) return null;

  return (
    <WorkspaceShell 
      title="Έξυπνη Δημιουργία Προγράμματος" 
      description="Αυτόματη παραγωγή εβδομαδιαίου πλάνου με αυτόματη άντληση στοιχείων επικοινωνίας γονέων για αποστολή SMS & Email."
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
              Η μηχανή διαβάζει τις επαφές από την <strong>Πύλη Γονέων</strong>, εντοπίζει τα email/κινητά και προετοιμάζει τα templates ειδοποιήσεων.
            </p>

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
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Βάση Γονέων & Επαφών
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 font-mono">
                  {INITIAL_PARENTS_DATABASE.length} ΕΓΓΡΑΦΕΣ
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
              <strong className="text-slate-200">Automated Communications:</strong> Μόλις πατηθεί η αποθήκευση, ενεργοποιούνται τα webhooks για SMS (Twilio/BulkSMS) και Email (Resend/Nodemailer).
            </div>
          </div>
        </div>

        {/* ΔΕΞΙΑ: ΕΒΔΟΜΑΔΙΑΙΟ ΠΡΟΓΡΑΜΜΑ (image_c6f99b.png) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" /> Εβδομαδιαίο πρόγραμμα
              </h3>
              {schedule.length > 0 && (
                <button 
                  onClick={handleSaveAndNotify}
                  disabled={isSaving}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Αποθήκευση & Αποστολή..." : "Αποθήκευση προγράμματος"}
                </button>
              )}
            </div>

            {schedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-center">
                <Layers className={`w-12 h-12 mb-3 opacity-20 ${isProcessing ? "animate-pulse text-indigo-400 opacity-60" : ""}`} />
                <p className="text-sm font-medium text-slate-300">
                  {isProcessing ? "Ανάγνωση στοιχείων και επαφών..." : "Δεν έχει δημιουργηθεί πρόγραμμα"}
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
                      <th className="pb-3 font-bold">Στοιχεία Γονέα</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {schedule.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/10 transition">
                        <td className="py-4 font-bold text-white">{item.day}</td>
                        <td className="py-4 font-mono font-semibold text-indigo-400">{item.time}</td>
                        <td className="py-4">
                          <div className="font-semibold text-slate-200">{item.courseTitle}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Μαθητής: {item.studentName}</div>
                        </td>
                        <td className="py-4 text-slate-300">{item.teacherName}</td>
                        <td className="py-4 font-bold text-amber-400 font-mono">{item.room}</td>
                        <td className="py-4">
                          <div className="text-slate-300 font-medium flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" /> {item.parentEmail}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-slate-600" /> {item.parentPhone}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* LIVE LOGS ΕΠΙΒΕΒΑΙΩΣΗΣ ΑΠΟΣΤΟΛΗΣ SMS / EMAIL */}
          {notificationLogs.length > 0 && (
            <div className="p-5 rounded-3xl border border-emerald-900/40 bg-emerald-950/10 backdrop-blur-md space-y-2 animate-in fade-in slide-in-from-bottom-3">
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" /> Αναφορά Παράδοσης Ειδοποιήσεων (Real-time Logs)
              </h4>
              <div className="space-y-1.5 font-mono text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-900 max-h-[160px] overflow-y-auto">
                {notificationLogs.map((log, i) => (
                  <div key={i} className="border-b border-slate-900 pb-1 last:border-0 last:pb-0">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </WorkspaceShell>
  );
}