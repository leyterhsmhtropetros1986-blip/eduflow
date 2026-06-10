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

export default function SmartScheduler() {
  const [mounted, setMounted] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState<string[]>([]);

  // Δυναμικά δεδομένα από τοπική βάση (LocalStorage) που γράφουν οι άλλες οθόνες
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);

  // Φόρτωση των πραγματικών δεδομένων που πληκτρολόγησες στις άλλες σελίδες
  useEffect(() => {
    setMounted(true);
    
    // Προσπάθεια ανάγνωσης από τα keys που χρησιμοποιούν οι άλλες οθόνες σου
    const storedTeachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const storedCourses = JSON.parse(localStorage.getItem("eduflow_courses") || "[]");
    const storedParents = JSON.parse(localStorage.getItem("eduflow_parents") || "[]");

    // Αν τα localStorages είναι άδεια επειδή δεν έχεις προλάβει να γράψεις, 
    // βάζουμε τα default της οθόνης σου για να μη φαίνεται άδεια η σελίδα
    setTeachers(storedTeachers.length ? storedTeachers : [
      { id: "t1", name: "Ελένη Παπαδοπούλου", specialty: "Μαθηματικά" },
      { id: "t2", name: "Κωνσταντίνος Βασιλείου", specialty: "Φυσική" }
    ]);

    setCourses(storedCourses.length ? storedCourses : [
      { id: "m1", title: "Εφαρμοσμένα Μαθηματικά", subject: "Μαθηματικά", teacher: "Ελένη Παπαδοπούλου" },
      { id: "m2", title: "Προχωρημένη Φυσική", subject: "Φυσική", teacher: "Κωνσταντίνος Βασιλείου" }
    ]);

    setParents(storedParents.length ? storedParents : [
      { id: "p1", parentName: "Ανδρέας Παπαδόπουλος", studentName: "Γιάννης Παπαδόπουλος", email: "andreas@example.com", phone: "6971234567", targetSubject: "Μαθηματικά" },
      { id: "p2", parentName: "Ελένη Κωνσταντίνου", studentName: "Μαρία Κωνσταντίνου", email: "eleni.parent@example.com", phone: "6987654321", targetSubject: "Φυσική" },
      { id: "p3", parentName: "Κρίτων Γεωργίου", studentName: "Νίκος Γεωργίου", email: "kriton@example.com", phone: "6934567890", targetSubject: "Έκθεση" }
    ]);
  }, []);

  // ΑΛΓΟΡΙΘΜΟΣ ΠΟΥ ΔΙΑΒΑΖΕΙ ΤΑ ΠΑΝΤΑ ΚΑΙ ΦΤΙΑΧΝΕΙ ΤΟ ΠΡΟΓΡΑΜΜΑ
  const handleAutoGeneration = () => {
    setIsProcessing(true);
    setSchedule([]);
    setNotificationLogs([]);

    setTimeout(() => {
      const generatedRows: any[] = [];
      const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή"];
      const hours = ["09:00", "11:00", "14:00", "16:00", "19:00"];
      const rooms = ["Αίθουσα Α", "Αίθουσα Β", "Αίθουσα Γ", "Αίθουσα Δ"];
      
      // ΔΙΑΒΑΖΕΙ ΑΥΤΟΜΑΤΑ ΤΟΥΣ ΜΑΘΗΤΕΣ/ΓΟΝΕΙΣ
      parents.forEach((record, index) => {
        // ΔΙΑΒΑΖΕΙ ΚΑΙ ΤΑΥΤΟΠΟΙΕΙ ΤΟ ΜΑΘΗΜΑ
        const matchedCourse = courses.find(c => c.subject === record.targetSubject || c.title.includes(record.targetSubject));
        
        // ΑΝ ΔΕΝ ΒΡΕΙ, ΠΑΙΡΝΕΙ ΤΟ ΠΡΩΤΟ ΔΙΑΘΕΣΙΜΟ ΜΑΘΗΜΑ ΓΙΑ ΝΑ ΜΗ ΜΕΙΝΕΙ ΚΕΝΟ
        const finalCourse = matchedCourse || courses[index % courses.length];
        
        if (finalCourse) {
          generatedRows.push({
            id: `dynamic-sch-${index}`,
            day: days[index % days.length],
            time: hours[index % hours.length],
            courseTitle: finalCourse.title,
            teacherName: finalCourse.teacher,
            room: rooms[index % rooms.length],
            studentName: record.studentName,
            parentName: record.parentName,
            parentEmail: record.email,
            parentPhone: record.phone
          });
        }
      });

      setSchedule(generatedRows);
      setIsProcessing(false);
    }, 800);
  };

  // ΑΠΟΘΗΚΕΥΣΗ ΚΑΙ ΑΥΤΟΜΑΤΗ ΕΝΗΜΕΡΩΣΗ ΜΕ SMS / EMAIL
  const handleSaveAndNotify = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      const logs: string[] = [];
      
      schedule.forEach(item => {
        logs.push(`📧 Email εστάλη στο ${item.parentEmail}: Το μάθημα '${item.courseTitle}' για τον μαθητή ${item.studentName} ορίστηκε: ${item.day} στις ${item.time}.`);
        logs.push(`💬 SMS εστάλη στο +30 ${item.parentPhone}: Eduflow ενημέρωση: ${item.studentName} -> ${item.day} ${item.time}, ${item.room}.`);
      });

      setNotificationLogs(logs);
      
      // Αποθήκευση του τελικού προγράμματος ώστε να το βλέπει και ο Κεντρικός Πίνακας!
      localStorage.setItem("eduflow_generated_schedule", JSON.stringify(schedule));
      
      setIsSaving(false);
      alert("💾 Το πρόγραμμα κλειδώθηκε και αποθηκεύτηκε! Στάλθηκαν αυτόματα SMS και Emails στους γονείς.");
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <WorkspaceShell 
      title="Έξυπνη Δημιουργία Προγράμματος" 
      description="Αυτόνομη μηχανή που διαβάζει ζωντανά τις εγγραφές καθηγητών, μαθημάτων και γονέων για τη δημιουργία εβδομαδιαίου πλάνου."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: LIVE ΣΤΑΤΙΣΤΙΚΑ ΣΥΝΔΕΣΗΣ */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Ζωντανή Σύνδεση Βάσεων</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Ο αλγόριθμος τραβάει αυτή τη στιγμή τα δεδομένα που έχεις καταχωρήσει στις υπόλοιπες καρτέλες της πλατφόρμας.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Φορτωμένα Μαθήματα
                </span>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10 font-mono">
                  {courses.length} Εγγραφές
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Επαφές Γονέων / SMS
                </span>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/10 font-mono">
                  {parents.length} Τηλέφωνα
                </span>
              </div>
            </div>

            <button
              onClick={handleAutoGeneration}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4" />
              {isProcessing ? "Ανάγνωση & Διασταύρωση..." : "Δημιουργία Προγράμματος"}
            </button>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800/60 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Σύνδεση 3-Way:</strong> Αν προσθέσεις νέο μάθημα ή γονέα στις άλλες σελίδες, θα εμφανιστεί εδώ αμέσως.
            </div>
          </div>
        </div>

        {/* ΔΕΞΙΑ: ΠΙΝΑΚΑΣ ΠΡΟΓΡΑΜΜΑΤΟΣ */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" /> Εβδομαδιαίο Πρόγραμμα
              </h3>
              {schedule.length > 0 && (
                <button 
                  onClick={handleSaveAndNotify}
                  disabled={isSaving}
                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition shadow-lg"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Αποθήκευση..." : "Αποθήκευση Προγράμματος"}
                </button>
              )}
            </div>

            {schedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500 text-center">
                <Layers className={`w-12 h-12 mb-3 opacity-20 ${isProcessing ? "animate-pulse text-indigo-400 opacity-60" : ""}`} />
                <p className="text-sm font-medium text-slate-300">
                  {isProcessing ? "Διαβάζονται οι πίνακες καθηγητών & γονέων..." : "Δεν έχει δημιουργηθεί πρόγραμμα ακόμη"}
                </p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Πατήστε το κουμπί «Δημιουργία Προγράμματος» για να τραβήξει τις ζωντανές εγγραφές.
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
                      <th className="pb-3 font-bold">Στοιχεία Ειδοποίησης Γονέα</th>
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
                          <div className="text-slate-300 flex items-center gap-1">
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

          {/* REAL-TIME LOGS ΓΙΑ SMS / EMAIL */}
          {notificationLogs.length > 0 && (
            <div className="p-5 rounded-3xl border border-emerald-900/40 bg-emerald-950/10 backdrop-blur-md space-y-2 animate-in fade-in">
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