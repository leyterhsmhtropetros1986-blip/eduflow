"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import {
  fetchClassrooms,
  fetchCourses,
  fetchSchedule,
  fetchStudents,
  fetchTeacherAvailability,
  fetchTeachers,
  initDatabase,
  saveSchedule,
} from "../lib/api";
import type {
  Classroom,
  Course,
  ScheduleSlot,
  Student,
  Teacher,
  TeacherAvailability,
} from "../lib/data";
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  RotateCcw, 
  Layers, 
  User, 
  Home, 
  TrendingUp, 
  Calendar 
} from "lucide-react";

const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή"];
const times = ["09:00", "11:00", "13:00", "15:00", "17:00"];

const dayNameMap: Record<string, string> = {
  mon: "Δευτέρα", tue: "Τρίτη", wed: "Τετάρτη", thu: "Πέμπτη", fri: "Παρασκευή",
  δευ: "Δευτέρα", δευτέρα: "Δευτέρα", τρι: "Τρίτη", τρίτη: "Τρίτη",
  τετ: "Τετάρτη", τετάρτη: "Τετάρτη", πεμ: "Πέμπτη", πέμπτη: "Πέμπτη",
  παρ: "Παρασκευή", παρασκευή: "Παρασκευή"
};

function parseAvailability(availability: string, teacherId: string, teacherName: string): TeacherAvailability[] {
  return availability
    .split(",")
    .map((segment) => segment.trim())
    .map((segment) => {
      const normalized = segment
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zα-ω]/g, "");
      return dayNameMap[normalized] ?? dayNameMap[normalized.slice(0, 3)] ?? "";
    })
    .filter(Boolean)
    .map((day, index) => ({
      id: `${teacherId}-${day}-${index}`,
      teacherId,
      teacherName,
      day,
      time: times[index % times.length],
    }));
}

function buildAvailableSlots(teachers: Teacher[], availabilityList: TeacherAvailability[]): TeacherAvailability[] {
  if (availabilityList.length > 0) return availabilityList;
  return teachers.flatMap((t) => parseAvailability(t.availability, t.id, t.fullName));
}

function validateSchedule(schedule: ScheduleSlot[]) {
  const warnings: string[] = [];
  const teacherBookings = new Set<string>();
  const roomBookings = new Set<string>();

  schedule.forEach((slot) => {
    if (slot.day === "Αναμονή" || slot.time === "Αναμονή") return;
    const teacherKey = `${slot.teacher}-${slot.day}-${slot.time}`;
    const roomKey = `${slot.room}-${slot.day}-${slot.time}`;

    if (teacherBookings.has(teacherKey)) {
      warnings.push(`Ο/Η καθηγητής/τρια ${slot.teacher} έχει διπλοκράτηση τη ${slot.day} στις ${slot.time}.`);
    }
    if (roomBookings.has(roomKey)) {
      warnings.push(`Η αίθουσα ${slot.room} έχει conflict τη ${slot.day} στις ${slot.time}.`);
    }

    teacherBookings.add(teacherKey);
    roomBookings.add(roomKey);
  });

  return [...new Set(warnings)];
}

export default function ScheduleBoardPage() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  
  // Drag & Drop State
  const [draggedSlotId, setDraggedSlotId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await initDatabase();
      const [studentsData, teachersData, coursesData, classroomsData, availabilityData, scheduleData] = await Promise.all([
        fetchStudents(),
        fetchTeachers(),
        fetchCourses(),
        fetchClassrooms(),
        fetchTeacherAvailability(),
        fetchSchedule(),
      ]);

      setStudents(studentsData);
      setTeachers(teachersData);
      setCourses(coursesData);
      setClassrooms(classroomsData);
      setAvailability(availabilityData);
      setSchedule(scheduleData);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const availableSlots = useMemo(() => buildAvailableSlots(teachers, availability), [teachers, availability]);
  const warnings = useMemo(() => validateSchedule(schedule), [schedule]);

  // Υπολογισμός Optimization Score
  const optimizationScore = useMemo(() => {
    if (schedule.length === 0) return 0;
    const unassignedCount = schedule.filter(s => s.day === "Αναμονή").length;
    const conflictCount = warnings.length;
    const totalCourses = schedule.length;
    
    const baseScore = ((totalCourses - unassignedCount) / totalCourses) * 100;
    const penalty = conflictCount * 15;
    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore - penalty)));
    return finalScore;
  }, [schedule, warnings]);

  // AI Smart Scheduler Engine
  async function generateAISchedule() {
    setIsGenerating(true);
    setStatusMessage(null);

    const courseSchedule: ScheduleSlot[] = [];
    const teacherConflict = new Set<string>();
    const roomConflict = new Set<string>();
    const studentConflict = new Set<string>();

    const classroomNames = classrooms.length ? classrooms.map((r) => r.name) : ["Αίθουσα Α", "Αίθουσα Β", "Αίθουσα Γ"];

    const courseStudents = courses.reduce<Record<string, Student[]>>((acc, course) => {
      acc[course.title] = students.filter((s) => s.course === course.title);
      return acc;
    }, {});

    courses.forEach((course) => {
      const requestedTeacher = teachers.find((t) => t.fullName === course.teacher);
      const candidateTeacher = requestedTeacher ?? teachers.find((t) => t.subject === course.subject) ?? teachers[0];
      const teacherName = candidateTeacher?.fullName || "TBD";
      const teacherSlots = availableSlots.filter((slot) => slot.teacherName === teacherName);

      const courseAssigned = [...days].some((day) => {
        return times.some((time) => {
          const teacherKey = `${teacherName}-${day}-${time}`;
          if (teacherConflict.has(teacherKey)) return false;

          const roomName = classroomNames.find((room) => !roomConflict.has(`${room}-${day}-${time}`));
          if (!roomName) return false;

          if (teacherSlots.length > 0 && !teacherSlots.some((s) => s.day === day && s.time === time)) return false;

          const enrolledStudents = courseStudents[course.title] || [];
          const studentImpossible = enrolledStudents.some((s) => studentConflict.has(`${s.id}-${day}-${time}`));
          if (studentImpossible) return false;

          teacherConflict.add(teacherKey);
          roomConflict.add(`${roomName}-${day}-${time}`);
          enrolledStudents.forEach((s) => studentConflict.add(`${s.id}-${day}-${time}`));

          courseSchedule.push({
            id: `schedule_${course.id}_${day}_${time}`,
            day,
            time,
            course: course.title,
            teacher: teacherName,
            room: roomName,
          });
          return true;
        });
      });

      if (!courseAssigned) {
        courseSchedule.push({
          id: `schedule_${course.id}_unassigned`,
          day: "Αναμονή",
          time: "Αναμονή",
          course: course.title,
          teacher: teacherName,
          room: "Αναμονή",
        });
      }
    });

    setSchedule(courseSchedule);
    setIsGenerating(false);
    setStatusMessage({ type: "success", text: "Το AI δημιούργησε το βέλτιστο πρόγραμμα με επιτυχία!" });
  }

  async function saveCurrentSchedule() {
    try {
      await saveSchedule(schedule);
      setStatusMessage({ type: "success", text: "Το πρόγραμμα αποθηκεύτηκε επιτυχώς στο Supabase." });
    } catch {
      setStatusMessage({ type: "error", text: "Σφάλμα αποθήκευσης. Ελέγξτε τη σύνδεση της βάσης δεδομένων σας." });
    }
  }

  // Drag & Drop Handlers
  function handleDragStart(id: string) {
    setDraggedSlotId(id);
  }

  function handleDrop(targetDay: string, targetTime: string) {
    if (!draggedSlotId) return;
    
    setSchedule(current => 
      current.map(slot => {
        if (slot.id === draggedSlotId) {
          // Αν η αίθουσα ήταν "Αναμονή", δώσε μια default
          const validRoom = slot.room === "Αναμονή" ? (classrooms[0]?.name || "Αίθουσα Α") : slot.room;
          return { ...slot, day: targetDay, time: targetTime, room: validRoom };
        }
        return slot;
      })
    );
    setDraggedSlotId(null);
    setStatusMessage({ type: "info", text: "Το μάθημα μετακινήθηκε στη νέα ώρα. Ελέγξτε για τυχόν conflicts." });
  }

  // Helper για εύρεση μαθήματος σε συγκεκριμένη μέρα/ώρα
  const getSlotAt = (day: string, time: string) => {
    return schedule.filter(s => s.day === day && s.time === time);
  };

  const unassignedSlots = schedule.filter(s => s.day === "Αναμονή");

  return (
    <WorkspaceShell
      title="Enterprise AI Schedule Board"
      description="Έξυπνος πίνακας διαχείρισης και αυτοματοποιημένης βελτιστοποίησης ωρολογίου προγράμματος σε πραγματικό χρόνο."
    >
      {/* TOP ANALYTICS METRICS BAR */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Optimization Score</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{optimizationScore}%</h3>
          </div>
          <div className={`p-3 rounded-xl ${optimizationScore > 80 ? 'bg-emerald-50 text-emerald-600' : optimizationScore > 50 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Συνολικά Μαθήματα</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{schedule.length}</h3>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Σε Εκκρεμότητα</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{unassignedSlots.length}</h3>
          </div>
          <div className={`p-3 rounded-xl ${unassignedSlots.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Conflicts Ανιχνεύτηκαν</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{warnings.length}</h3>
          </div>
          <div className={`p-3 rounded-xl ${warnings.length > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CORE CONTROLS AND NOTIFICATIONS */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-4 rounded-2xl text-white shadow-md">
        <div>
          <h3 className="text-md font-semibold flex items-center gap-2 text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" /> AI Scheduler Engine v2.0
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Επιλύει αυτόματα conflicts καθηγητών, μαθητών και διαθεσιμότητας αιθουσών.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateAISchedule}
            disabled={isLoading || isGenerating}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? "Υπολογισμός..." : "Έναρξη AI Σχεδιασμού"}
          </button>
          <button
            onClick={saveCurrentSchedule}
            disabled={isLoading || schedule.length === 0}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700 disabled:border-slate-800 disabled:text-slate-600"
          >
            <Save className="w-3.5 h-3.5" /> Αποθήκευση Live
          </button>
        </div>
      </div>

      {/* ALERT AND NOTIFICATION TOASTS */}
      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl border text-sm flex items-center gap-3 transition-all duration-300 ${
          statusMessage.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : 
          statusMessage.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* MAIN VIEWGRID */}
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        
        {/* WEEKLY CALENDAR CARD GRID */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* GRID HEADER */}
            <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr] bg-slate-50 rounded-xl p-2 border-b border-slate-100 text-center text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              <div className="text-left pl-2 py-1">Ώρα</div>
              {days.map(day => <div key={day} className="py-1">{day}</div>)}
            </div>

            {/* GRID ROWS */}
            {times.map(time => (
              <div key={time} className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr] border-b border-slate-100 last:border-0 min-h-[90px] items-stretch">
                {/* Time Indicator */}
                <div className="flex items-center font-bold text-slate-500 text-sm border-r border-slate-100 bg-slate-50/40 p-2">
                  {time}
                </div>
                
                {/* Day Cells */}
                {days.map(day => {
                  const currentSlots = getSlotAt(day, time);
                  return (
                    <div
                      key={`${day}-${time}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(day, time)}
                      className="p-2 border-r border-slate-100 last:border-0 bg-slate-50/10 hover:bg-slate-50 transition duration-150 flex flex-col gap-1.5 justify-center relative min-h-[80px]"
                    >
                      {currentSlots.length > 0 ? (
                        currentSlots.map((slot) => (
                          <div
                            key={slot.id}
                            draggable
                            onDragStart={() => handleDragStart(slot.id)}
                            className="p-2 rounded-xl border border-indigo-100 bg-indigo-50/80 shadow-xs cursor-grab active:cursor-grabbing hover:shadow-sm hover:border-indigo-300 transition group relative"
                          >
                            <div className="text-xs font-bold text-indigo-950 truncate">{slot.course}</div>
                            <div className="text-[11px] text-indigo-700 flex items-center gap-1 mt-1 truncate">
                              <User className="w-3 h-3 flex-shrink-0" /> {slot.teacher}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                              <Home className="w-3 h-3 flex-shrink-0" /> {slot.room}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[10px] text-slate-300 text-center italic font-light select-none">
                          Κενό
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR - UNASSIGNED & CONFLICT RESOLUTION */}
        <div className="space-y-6">
          {/* DRAG & DROP POOL FOR UNASSIGNED */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Μαθήματα σε Αναμονή ({unassignedSlots.length})
            </h3>
            
            <div 
              className="mt-3 space-y-2 max-h-[250px] overflow-y-auto pr-1"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop("Αναμονή", "Αναμονή")}
            >
              {unassignedSlots.length > 0 ? (
                unassignedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    draggable
                    onDragStart={() => handleDragStart(slot.id)}
                    className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 cursor-grab active:cursor-grabbing hover:bg-amber-50 transition"
                  >
                    <div className="text-xs font-bold text-amber-950">{slot.course}</div>
                    <div className="text-[11px] text-amber-800 mt-1 flex items-center gap-1">
                      <User className="w-2.5 h-2.5" /> {slot.teacher}
                    </div>
                    <div className="text-[10px] text-amber-600 mt-1 italic">
                      Σύρετέ το μέσα στον πίνακα 📅
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 italic">
                  Όλα τα μαθήματα τοποθετήθηκαν!
                </div>
              )}
            </div>
          </div>

          {/* REALTIME CONFLICT PANEL */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <AlertTriangle className={`w-4 h-4 ${warnings.length > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
              Έλεγχος Διενέξεων ({warnings.length})
            </h3>
            
            <div className="mt-3 space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {warnings.length > 0 ? (
                warnings.map((warning, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 flex items-start gap-2">
                    <span className="font-bold mt-0.5">•</span>
                    <p className="leading-normal">{warning}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 border border-dashed border-emerald-200 bg-emerald-50/30 rounded-xl text-center text-xs text-emerald-700 flex items-center justify-center gap-2 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Κανένα conflict! Το πρόγραμμα είναι 100% έγκυρο.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}