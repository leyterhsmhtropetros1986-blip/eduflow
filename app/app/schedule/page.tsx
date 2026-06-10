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

const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή"];
const times = ["09:00", "11:00", "13:00", "15:00", "17:00"];
const dayNameMap: Record<string, string> = {
  mon: "Δευτέρα",
  tue: "Τρίτη",
  wed: "Τετάρτη",
  thu: "Πέμπτη",
  fri: "Παρασκευή",
  sat: "Σάββατο",
  sun: "Κυριακή",
  δευ: "Δευτέρα",
  δευτέρα: "Δευτέρα",
  τρι: "Τρίτη",
  τρίτη: "Τρίτη",
  τετ: "Τετάρτη",
  τετάρτη: "Τετάρτη",
  πεμ: "Πέμπτη",
  πέμπτη: "Πέμπτη",
  παρ: "Παρασκευή",
  παρασκευή: "Παρασκευή",
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

function buildAvailableSlots(
  teachers: Teacher[],
  availabilityList: TeacherAvailability[]
): TeacherAvailability[] {
  if (availabilityList.length > 0) {
    return availabilityList;
  }

  return teachers.flatMap((teacher) => parseAvailability(teacher.availability, teacher.id, teacher.fullName));
}

function sortSlots(slots: ScheduleSlot[]) {
  const dayIndex = days.reduce<Record<string, number>>((acc, day, index) => {
    acc[day] = index;
    return acc;
  }, {});

  return [...slots].sort((left, right) => {
    const dayDiff = (dayIndex[left.day] ?? 0) - (dayIndex[right.day] ?? 0);
    if (dayDiff !== 0) return dayDiff;
    return left.time.localeCompare(right.time);
  });
}

function validateSchedule(schedule: ScheduleSlot[]) {
  const warnings: string[] = [];
  const teacherBookings = new Set<string>();
  const roomBookings = new Set<string>();

  schedule.forEach((slot) => {
    const teacherKey = `${slot.teacher}-${slot.day}-${slot.time}`;
    const roomKey = `${slot.room}-${slot.day}-${slot.time}`;

    if (teacherBookings.has(teacherKey)) {
      warnings.push(`Teacher ${slot.teacher} has a conflict at ${slot.day} ${slot.time}.`);
    }

    if (roomBookings.has(roomKey)) {
      warnings.push(`Room ${slot.room} has a conflict at ${slot.day} ${slot.time}.`);
    }

    teacherBookings.add(teacherKey);
    roomBookings.add(roomKey);
  });

  return [...new Set(warnings)];
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
      setSchedule(sortSlots(scheduleData));
      setIsLoading(false);
    }

    loadData();
  }, []);

  const availableSlots = useMemo(
    () => buildAvailableSlots(teachers, availability),
    [teachers, availability]
  );

  const warnings = useMemo(() => validateSchedule(schedule), [schedule]);

  async function generateSchedule() {
    setIsGenerating(true);
    setStatusMessage(null);

    const courseSchedule: ScheduleSlot[] = [];
    const teacherConflict = new Set<string>();
    const roomConflict = new Set<string>();
    const studentConflict = new Set<string>();

    const classroomNames = classrooms.length ? classrooms.map((room) => room.name) : ["Αίθουσα Α", "Αίθουσα Β", "Αίθουσα Γ"];

    const courseStudents = courses.reduce<Record<string, Student[]>>((acc, course) => {
      acc[course.title] = students.filter((student) => student.course === course.title);
      return acc;
    }, {});

    courses.forEach((course) => {
      const requestedTeacher = teachers.find((teacher) => teacher.fullName === course.teacher);
      const candidateTeacher =
  requestedTeacher ??
  teachers.find((teacher) => teacher.subject === course.subject) ??
  teachers[0];

const teacherName =
  (candidateTeacher?.fullName ?? course.teacher) || "TBD";

const teacherSlots = availableSlots.filter(
  (slot) => slot.teacherName === teacherName
);
      const courseAssigned = [...days, ...days].some((day) => {
        const validTimes = times;

        return validTimes.some((time) => {
          const teacherKey = `${teacherName}-${day}-${time}`;
          if (teacherConflict.has(teacherKey)) {
            return false;
          }

          const roomName = classroomNames.find((room) => !roomConflict.has(`${room}-${day}-${time}`));
          if (!roomName) {
            return false;
          }

          if (teacherSlots.length > 0 && !teacherSlots.some((slot) => slot.day === day && slot.time === time)) {
            return false;
          }

          const enrolledStudents = courseStudents[course.title] || [];
          const studentImpossible = enrolledStudents.some((student) => studentConflict.has(`${student.id}-${day}-${time}`));
          if (studentImpossible) {
            return false;
          }

          teacherConflict.add(teacherKey);
          roomConflict.add(`${roomName}-${day}-${time}`);
          enrolledStudents.forEach((student) => studentConflict.add(`${student.id}-${day}-${time}`));

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

    setSchedule(sortSlots(courseSchedule));
    setIsGenerating(false);
    setStatusMessage("Το πρόγραμμα δημιουργήθηκε. Ελέγξτε και αποθηκεύστε ή επεξεργαστείτε κάθε θέση χειροκίνητα.");
  }

  async function saveCurrentSchedule() {
    try {
      await saveSchedule(schedule);
      setStatusMessage("Το πρόγραμμα αποθηκεύτηκε στο Supabase.");
    } catch (error) {
      setStatusMessage("Δεν ήταν δυνατή η αποθήκευση του προγράμματος. Ελέγξτε τη διαμόρφωση της βάσης δεδομένων.");
    }
  }

  function startEdit(slot: ScheduleSlot) {
    setEditingSlot(slot);
    setStatusMessage(null);
  }

  function updateEditingSlot(field: keyof ScheduleSlot, value: string) {
    if (!editingSlot) return;
    setEditingSlot({ ...editingSlot, [field]: value });
  }

  function applySlotChanges() {
    if (!editingSlot) {
      return;
    }

    setSchedule((current) =>
      current.map((slot) => (slot.id === editingSlot.id ? editingSlot : slot))
    );
    setEditingSlot(null);
    setStatusMessage("Slot updated locally.");
  }

  const editableRoomOptions = classrooms.length ? classrooms.map((room) => room.name) : ["Αίθουσα Α", "Αίθουσα Β", "Αίθουσα Γ"];

  return (
    <WorkspaceShell
      title="Έξυπνη Δημιουργία Προγράμματος"
      description="Δημιουργία και βελτίωση εβδομαδιαίου προγράμματος χωρίς συγκρούσεις μεταξύ καθηγητών, αιθουσών και μαθητών."
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Εβδομαδιαίο πρόγραμμα</h2>
              <p className="mt-1 text-sm text-slate-500">
                Δημιουργήστε ένα αδιάκοπο εβδομαδιαίο πρόγραμμα με βάση καθηγητές, αίθουσες και εγγραφές μαθητών.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateSchedule}
                disabled={isLoading || isGenerating}
                className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isGenerating ? "Δημιουργία…" : "Δημιουργία προγράμματος"}
              </button>
              <button
                onClick={saveCurrentSchedule}
                disabled={isLoading || schedule.length === 0}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                Αποθήκευση προγράμματος
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Ημέρα</th>
                  <th className="px-4 py-3 text-left font-semibold">Ώρα</th>
                  <th className="px-4 py-3 text-left font-semibold">Μάθημα</th>
                  <th className="px-4 py-3 text-left font-semibold">Καθηγητής</th>
                  <th className="px-4 py-3 text-left font-semibold">Αίθουσα</th>
                  <th className="px-4 py-3 text-left font-semibold">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {schedule.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-900">{slot.day}</td>
                    <td className="px-4 py-4 text-slate-600">{slot.time}</td>
                    <td className="px-4 py-4 text-slate-600">{slot.course}</td>
                    <td className="px-4 py-4 text-slate-600">{slot.teacher}</td>
                    <td className="px-4 py-4 text-slate-600">{slot.room}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => startEdit(slot)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Επεξεργασία
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {statusMessage ? (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {statusMessage}
            </div>
          ) : null}

          {warnings.length > 0 ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold">Προειδοποιήσεις διενέξεων</p>
              <ul className="mt-2 list-disc pl-5">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Χειροκίνητη επεξεργασία</h2>
            <p className="mt-2 text-sm text-slate-500">
              Επιλέξτε μια εγγραφή για να αλλάξετε χειροκίνητα την ημέρα, την ώρα, τον καθηγητή ή την αίθουσα.
            </p>
          </div>

          {editingSlot ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Ημέρα</label>
                <select
                  value={editingSlot.day}
                  onChange={(event) => updateEditingSlot("day", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {["TBD", ...days].map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Ώρα</label>
                <select
                  value={editingSlot.time}
                  onChange={(event) => updateEditingSlot("time", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {["TBD", ...times].map((slotTime) => (
                    <option key={slotTime} value={slotTime}>
                      {slotTime}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Μάθημα</label>
                <select
                  value={editingSlot.course}
                  onChange={(event) => updateEditingSlot("course", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.title}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Καθηγητής</label>
                <select
                  value={editingSlot.teacher}
                  onChange={(event) => updateEditingSlot("teacher", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.fullName}>
                      {teacher.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Αίθουσα</label>
                <select
                  value={editingSlot.room}
                  onChange={(event) => updateEditingSlot("room", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {["TBD", ...editableRoomOptions].map((roomName) => (
                    <option key={roomName} value={roomName}>
                      {roomName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={applySlotChanges}
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Αποθήκευση αλλαγών
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Ακύρωση
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Επιλέξτε μια γραμμή παραπάνω για χειροκίνητη επεξεργασία μιας εγγραφής προγράμματος.
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Σύνοψη προγράμματος</div>
            <p className="mt-2 text-sm text-slate-600">Χρησιμοποιήστε τη δημιουργία για να φτιάξετε το εβδομαδιαίο πρόγραμμα και μετά αποθηκεύστε το στο Supabase.</p>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
