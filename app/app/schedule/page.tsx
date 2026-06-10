"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { Cpu, Calendar, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ students: 0, teachers: 0 });

  useEffect(() => {
    // Φορτώνουμε σωστά τους μαθητές και τους καθηγητές
    const storedStudents = localStorage.getItem("eduflow_students") || "[]";
    const storedTeachers = localStorage.getItem("eduflow_teachers") || "[]";
    const storedSchedule = localStorage.getItem("eduflow_generated_schedule");

    setStats({
      students: JSON.parse(storedStudents).length,
      teachers: JSON.parse(storedTeachers).length
    });

    if (storedSchedule) {
      setSchedule(JSON.parse(storedSchedule));
    }
  }, []);

  const generateSmartSchedule = () => {
    setLoading(true);

    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");

    if (students.length === 0) {
      alert("⚠️ Δεν υπάρχουν καταχωρημένοι μαθητές για να δημιουργηθεί πρόγραμμα!");
      setLoading(false);
      return;
    }

    const hours = ["15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
    const rooms = ["Αίθουσα Α", "Αίθουσα Β", "Αίθουσα Γ", "Αίθουσα Δ"];
    const generatedEntries: any[] = [];

    // Trackers για αποφυγή διπλοκρατήσεων
    const occupiedTeachers = new Set<string>(); // "Ημέρα-Ώρα-Καθηγητής"
    const occupiedRooms = new Set<string>();    // "Ημέρα-Ώρα-Αίθουσα"
    const occupiedStudents = new Set<string>(); // "Ημέρα-Ώρα-Μαθητής"

    // 1. Παίρνουμε κάθε μαθητή ξεχωριστά
    students.forEach((student: any) => {
      // 2. Παίρνουμε κάθε μάθημα που έχει επιλέξει ο μαθητής
      const studentCourses = student.courses || [];
      // 3. Διαβάζουμε ΜΟΝΟ τις ημέρες που δήλωσε ο μαθητής ότι είναι διαθέσιμος
      const studentAvailableDays = student.days && student.days.length > 0 ? student.days : ["Δευτέρα", "Τρίτη"];

      studentCourses.forEach((courseTitle: string, cIndex: number) => {
        // Βρίσκουμε τον κατάλληλο καθηγητή για το μάθημα
        const assignedTeacher = teachers.find((t: any) => t.specialty === courseTitle) || 
                                teachers[Math.floor(Math.random() * teachers.length)];
        const teacherName = assignedTeacher ? assignedTeacher.name : "Εκκρεμεί Ανάθεση";

        let assignedDay = "";
        let assignedTime = "";
        let assignedRoom = "";
        let slotFound = false;

        // Ψάχνουμε slot ΜΟΝΟ μέσα στις ημέρες που έχει δηλώσει ο μαθητής
        for (let d of studentAvailableDays) {
          for (let h of hours) {
            for (let r of rooms) {
              
              const teacherKey = `${d}-${h}-${teacherName}`;
              const roomKey = `${d}-${h}-${r}`;
              const studentKey = `${d}-${h}-${student.name}`;

              // Έλεγχος: Να μην συμπίπτει ο καθηγητής, η αίθουσα ΚΑΙ ο μαθητής
              if (!occupiedTeachers.has(teacherKey) && !occupiedRooms.has(roomKey) && !occupiedStudents.has(studentKey)) {
                assignedDay = d;
                assignedTime = h;
                assignedRoom = r;
                slotFound = true;

                // Κλείδωμα των slots
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

        // Fallback αν γεμίσουν όλες οι αίθουσες
        if (!slotFound) {
          assignedDay = studentAvailableDays[0];
          assignedTime = hours[cIndex % hours.length];
          assignedRoom = rooms[0];
        }

        // Προσθήκη στο πρόγραμμα ΜΑΖΙ με το όνομα του μαθητή
        generatedEntries.push({
          id: `slot-${Date.now()}-${Math.random()}`,
          studentName: student.name,
          day: assignedDay,
          time: assignedTime,
          course: courseTitle,
          teacher: teacherName,
          room: assignedRoom
        });
      });
    });

    // Ταξινόμηση ανά ημέρα και ώρα
    const dayOrder = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
    generatedEntries.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) || a.time.localeCompare(b.time));

    setSchedule(generatedEntries);
    localStorage.setItem("eduflow_generated_schedule", JSON.stringify(generatedEntries));
    
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  return (
    <WorkspaceShell 
      title="Έξυπνη Δημιουργία Προγράμματος" 
      description="Αυτόματη γεννήτρια εβδομαδιαίου πλάνου βασισμένη αποκλειστικά στις διαθέσιμες ώρες Μαθητών, Καθηγητών και Αιθουσών."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: ΕΛΕΓΧΟΣ ΔΙΑΘΕΣΙΜΟΤΗΤΑΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" /> Φίλτρα Διαθεσιμότητας
          </h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center bg-[#0b0e14] border border-slate-800/60 p-3 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">👥 Εγγεγραμμένοι Μαθητές</span>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded text-xs font-bold">
                {stats.students} Προφίλ
              </span>
            </div>
            <div className="flex justify-between items-center bg-[#0b0e14] border border-slate-800/60 p-3 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">👨‍🏫 Ωράρια Καθηγητών</span>
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded text-xs font-bold">
                {stats.teachers} Καθηγητές
              </span>
            </div>
          </div>

          <button
            onClick={generateSmartSchedule}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Διασταύρωση Ημερών Μαθητή..." : "Υπολογισμός & Δημιουργία"}
          </button>
        </div>

        {/* ΔΕΞΙΑ: ΠΙΝΑΚΑΣ ΜΕ ΣΤΗΛΗ ΜΑΘΗΤΗ */}
        <div className="lg:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Εβδομαδιαίο Πλάνο Μαθημάτων
          </h3>

          {schedule.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-[#0b0e14]/50">
              <p className="text-xs text-slate-400">Δεν έχει δημιουργηθεί πρόγραμμα</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <th className="pb-3">Ημέρα</th>
                    <th className="pb-3">Ώρα</th>
                    <th className="pb-3">Μαθητής</th>
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
                      {/* Η ΣΗΜΑΝΤΙΚΗ ΣΤΗΛΗ ΠΟΥ ΕΛΕΙΠΕ */}
                      <td className="py-3.5 text-amber-400 font-bold">{s.studentName}</td>
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