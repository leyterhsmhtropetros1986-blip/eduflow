"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { WorkspaceShell } from "./components/WorkspaceShell";
import {
  fetchStudents,
  fetchTeachers,
  fetchCourses,
  fetchSchedule,
} from "./lib/api";

export default function Home() {
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [s, t, c, sch] = await Promise.all([
        fetchStudents(),
        fetchTeachers(),
        fetchCourses(),
        fetchSchedule(),
      ]);

      setStudents(s);
      setTeachers(t);
      setCourses(c);
      setSchedule(sch);
    }

    load();
  }, []);

  const todayLessons = useMemo(() => schedule.slice(0, 5), [schedule]);

  return (
    <WorkspaceShell
      title="🏠 Πίνακας Ελέγχου"
      description="Επισκόπηση λειτουργίας του φροντιστηρίου σε πραγματικό χρόνο."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatCard
          title="Μαθητές"
          value={students.length}
          icon="👨‍🎓"
          color="bg-blue-500"
        />

        <StatCard
          title="Καθηγητές"
          value={teachers.length}
          icon="👨‍🏫"
          color="bg-green-500"
        />

        <StatCard
          title="Μαθήματα"
          value={courses.length}
          icon="📚"
          color="bg-purple-500"
        />

        <StatCard
          title="Προγραμματισμένα"
          value={schedule.length}
          icon="📅"
          color="bg-orange-500"
        />
      </div>

      <div className="grid xl:grid-cols-2 gap-8 mt-8">

        <div className="bg-white rounded-3xl shadow-sm p-6">

          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold">
              👨‍🎓 Πρόσφατοι Μαθητές
            </h2>

            <Link
              href="/students"
              className="text-blue-600 text-sm"
            >
              Προβολή όλων
            </Link>
          </div>

          <div className="space-y-4">

            {students.slice(0, 5).map((student: any) => (
              <div
                key={student.id}
                className="border rounded-xl p-4 flex justify-between"
              >
                <div>
                  <div className="font-semibold">
                    {student.fullName}
                  </div>

                  <div className="text-sm text-gray-500">
                    {student.grade}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  {student.course}
                </div>
              </div>
            ))}

          </div>

        </div>

        <div className="bg-white rounded-3xl shadow-sm p-6">

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-xl font-bold">
              📅 Σημερινό Πρόγραμμα
            </h2>

            <Link
              href="/schedule-board"
              className="text-blue-600 text-sm"
            >
              Αναλυτικά
            </Link>

          </div>

          <div className="space-y-4">

            {todayLessons.map((lesson: any, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="font-semibold">
                  {lesson.course}
                </div>

                <div className="text-sm text-gray-500">
                  {lesson.day} • {lesson.time}
                </div>

                <div className="text-sm">
                  👨‍🏫 {lesson.teacher}
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>

      <div className="mt-8 bg-white rounded-3xl shadow-sm p-6">

        <h2 className="text-xl font-bold mb-5">
          ⚡ Γρήγορες Ενέργειες
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

          <QuickButton
            href="/students"
            label="Νέος Μαθητής"
            icon="👨‍🎓"
          />

          <QuickButton
            href="/teachers"
            label="Νέος Καθηγητής"
            icon="👨‍🏫"
          />

          <QuickButton
            href="/courses"
            label="Νέο Μάθημα"
            icon="📚"
          />

          <QuickButton
            href="/schedule"
            label="Πρόγραμμα"
            icon="📅"
          />

          <QuickButton
            href="/crm"
            label="CRM"
            icon="🏢"
          />

          <QuickButton
            href="/payments"
            label="Πληρωμές"
            icon="💳"
          />

        </div>

      </div>

      <div className="mt-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 text-white p-8">

        <h2 className="text-2xl font-bold mb-3">
          🤖 Smart Scheduler
        </h2>

        <p className="text-slate-300 mb-5">
          Δημιουργία βέλτιστου προγράμματος μαθημάτων χωρίς συγκρούσεις.
        </p>

        <Link
          href="/schedule"
          className="inline-flex rounded-xl bg-white text-slate-900 px-6 py-3 font-semibold"
        >
          Δημιουργία Προγράμματος
        </Link>

      </div>

    </WorkspaceShell>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: any) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">

      <div className="flex justify-between items-center">

        <div>

          <div className="text-gray-500 text-sm">
            {title}
          </div>

          <div className="text-4xl font-bold mt-2">
            {value}
          </div>

        </div>

        <div
          className={`${color} text-white text-3xl rounded-2xl w-16 h-16 flex items-center justify-center`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

function QuickButton({
  href,
  label,
  icon,
}: any) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-slate-50 hover:bg-slate-100 p-5 text-center"
    >
      <div className="text-3xl mb-2">
        {icon}
      </div>

      <div className="font-medium text-sm">
        {label}
      </div>

    </Link>
  );
}