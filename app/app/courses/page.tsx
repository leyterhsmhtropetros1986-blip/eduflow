"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import {
  assignTeacherToCourse,
  createCourse,
  deleteCourse,
  fetchCourses,
  fetchTeachers,
  updateCourse,
} from "../lib/api";
import type { Course, Teacher } from "../lib/data";

const initialCourseState: Omit<Course, "id"> = {
  title: "",
  subject: "",
  teacher: "",
  duration: "",
  seats: 0,
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formValues, setFormValues] = useState<Omit<Course, "id">>(initialCourseState);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function load() {
      const [courseData, teacherData] = await Promise.all([fetchCourses(), fetchTeachers()]);
      setCourses(courseData);
      setTeachers(teacherData);
    }

    load();
  }, []);

  const displayedCourses = useMemo(() => {
    if (!searchTerm.trim()) {
      return courses;
    }

    const lower = searchTerm.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(lower) ||
        course.subject.toLowerCase().includes(lower) ||
        course.teacher.toLowerCase().includes(lower)
    );
  }, [searchTerm, courses]);

  function resetForm() {
    setSelectedCourse(null);
    setFormValues(initialCourseState);
  }

  async function saveCourse() {
    const trimmedTitle = formValues.title.trim();
    if (!trimmedTitle || !formValues.subject || !formValues.teacher || !formValues.duration) {
      return;
    }

    const record: Course = {
      id: selectedCourse?.id ?? `course_${Date.now()}`,
      title: trimmedTitle,
      subject: formValues.subject,
      teacher: formValues.teacher,
      duration: formValues.duration,
      seats: formValues.seats,
    };

    const savedCourse = selectedCourse
      ? await updateCourse(record.id, record)
      : await createCourse(record);

    if (!savedCourse) {
      return;
    }

    setCourses((current) => {
      const updated = current.filter((course) => course.id !== savedCourse.id);
      return [savedCourse, ...updated];
    });

    resetForm();
  }

  async function handleDelete(id: string) {
    const deleted = await deleteCourse(id);
    if (!deleted) {
      return;
    }

    setCourses((current) => current.filter((course) => course.id !== id));
    if (selectedCourse?.id === id) {
      resetForm();
    }
  }

  function handleEdit(course: Course) {
    setSelectedCourse(course);
    setFormValues({
      title: course.title,
      subject: course.subject,
      teacher: course.teacher,
      duration: course.duration,
      seats: course.seats,
    });
  }

  async function assignTeacher(courseId: string, teacherName: string) {
    const updatedCourse = await assignTeacherToCourse(courseId, teacherName);
    if (!updatedCourse) {
      return;
    }

    setCourses((current) => current.map((course) => (course.id === courseId ? updatedCourse : course)));
  }

  return (
    <WorkspaceShell
      title="Courses"
      description="Organize tutoring courses, manage capacity, and match teachers to live sessions."
    >
      <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
        <section className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Available courses</h2>
              <p className="mt-1 text-sm text-slate-500">Courses available for enrollment, session planning, and assignments.</p>
            </div>
            <div className="w-full md:w-80">
              <label className="block text-sm font-medium text-slate-700">Search courses</label>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                placeholder="Search by title, subject, or teacher"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold">Teacher</th>
                  <th className="px-4 py-3 text-left font-semibold">Duration</th>
                  <th className="px-4 py-3 text-left font-semibold">Seats</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {displayedCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-900">{course.title}</td>
                    <td className="px-4 py-4 text-slate-600">{course.subject}</td>
                    <td className="px-4 py-4 text-slate-600">{course.teacher}</td>
                    <td className="px-4 py-4 text-slate-600">{course.duration}</td>
                    <td className="px-4 py-4 text-slate-600">{course.seats}</td>
                    <td className="px-4 py-4 space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(course)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(course.id)}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{selectedCourse ? "Edit course" : "Create course"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedCourse
                ? "Update an existing course or assign a different teacher."
                : "Add a new tutoring course and plan capacity for the term."}
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Course title</label>
            <input
              value={formValues.title}
              onChange={(event) => setFormValues({ ...formValues, title: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Προχωρημένη Άλγεβρα"
            />

            <label className="block text-sm font-medium text-slate-700">Subject</label>
            <input
              value={formValues.subject}
              onChange={(event) => setFormValues({ ...formValues, subject: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Μαθηματικά"
            />

            <label className="block text-sm font-medium text-slate-700">Teacher</label>
            <select
              value={formValues.teacher}
              onChange={(event) => setFormValues({ ...formValues, teacher: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="">Select teacher</option>
              {teachers.map((teacherOption) => (
                <option key={teacherOption.id} value={teacherOption.fullName}>
                  {teacherOption.fullName}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-slate-700">Duration</label>
            <input
              value={formValues.duration}
              onChange={(event) => setFormValues({ ...formValues, duration: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="12 weeks"
            />

            <label className="block text-sm font-medium text-slate-700">Seats</label>
            <input
              value={formValues.seats}
              onChange={(event) => setFormValues({ ...formValues, seats: Number(event.target.value) })}
              type="number"
              min={0}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="10"
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={saveCourse}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {selectedCourse ? "Update course" : "Save course"}
            </button>
            {selectedCourse ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
