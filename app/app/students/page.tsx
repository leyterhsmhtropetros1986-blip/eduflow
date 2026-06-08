"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import {
  createStudent,
  deleteStudent,
  fetchCourses,
  fetchStudents,
  searchStudents,
  updateStudent,
} from "../lib/api";
import type { Course, Student } from "../lib/data";

const initialStudentState: Omit<Student, "id" | "status"> = {
  fullName: "",
  grade: "",
  course: "",
  parentName: "",
  email: "",
  phone: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formValues, setFormValues] = useState<Omit<Student, "id" | "status">>(initialStudentState);

  useEffect(() => {
    async function load() {
      const [studentData, courseData] = await Promise.all([fetchStudents(), fetchCourses()]);
      setStudents(studentData);
      setCourses(courseData);
    }

    load();
  }, []);

  const displayedStudents = useMemo(() => {
    if (!searchTerm.trim()) {
      return students;
    }

    return students.filter((student) => {
      const term = searchTerm.toLowerCase();
      return (
        student.fullName.toLowerCase().includes(term) ||
        student.course.toLowerCase().includes(term) ||
        student.parentName.toLowerCase().includes(term)
      );
    });
  }, [students, searchTerm]);

  function resetForm() {
    setSelectedStudent(null);
    setFormValues(initialStudentState);
  }

  async function saveStudent() {
    const trimmedName = formValues.fullName.trim();
    if (!trimmedName || !formValues.grade || !formValues.course || !formValues.parentName) {
      return;
    }

    const record: Student = {
      id: selectedStudent?.id ?? `stu_${Date.now()}`,
      status: selectedStudent?.status ?? "active",
      fullName: trimmedName,
      grade: formValues.grade,
      course: formValues.course,
      parentName: formValues.parentName,
      email: formValues.email || `${trimmedName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: formValues.phone || "+30 698 000 0000",
    };

    const savedStudent = selectedStudent
      ? await updateStudent(record.id, record)
      : await createStudent(record);

    if (!savedStudent) {
      return;
    }

    setStudents((current) => {
      const updated = current.filter((student) => student.id !== savedStudent.id);
      return [savedStudent, ...updated];
    });

    resetForm();
  }

  async function handleDelete(id: string) {
    const deleted = await deleteStudent(id);
    if (!deleted) {
      return;
    }

    setStudents((current) => current.filter((student) => student.id !== id));
    if (selectedStudent?.id === id) {
      resetForm();
    }
  }

  function handleEdit(student: Student) {
    setSelectedStudent(student);
    setFormValues({
      fullName: student.fullName,
      grade: student.grade,
      course: student.course,
      parentName: student.parentName,
      email: student.email,
      phone: student.phone,
    });
  }

  return (
    <WorkspaceShell
      title="Students"
      description="Manage student profiles, enrollment status, and course assignments from one workspace."
    >
      <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
        <section className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Student roster</h2>
              <p className="mt-1 text-sm text-slate-500">Search, browse, and update enrolled learners.</p>
            </div>
            <div className="w-full md:w-80">
              <label className="block text-sm font-medium text-slate-700">Search students</label>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                placeholder="Search by name, course, or parent"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Grade</th>
                  <th className="px-4 py-3 text-left font-semibold">Course</th>
                  <th className="px-4 py-3 text-left font-semibold">Parent</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {displayedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-900">{student.fullName}</td>
                    <td className="px-4 py-4 text-slate-600">{student.grade}</td>
                    <td className="px-4 py-4 text-slate-600">{student.course}</td>
                    <td className="px-4 py-4 text-slate-600">{student.parentName}</td>
                    <td className="px-4 py-4 space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(student)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(student.id)}
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
            <h2 className="text-xl font-semibold text-slate-950">{selectedStudent ? "Edit student" : "Add student"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedStudent
                ? "Update the student record and save your changes."
                : "Create student records and assign them to your next course."}
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Full name</label>
            <input
              value={formValues.fullName}
              onChange={(event) => setFormValues({ ...formValues, fullName: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Ελένη Παπαδοπούλου"
            />

            <label className="block text-sm font-medium text-slate-700">Grade</label>
            <input
              value={formValues.grade}
              onChange={(event) => setFormValues({ ...formValues, grade: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="B Λυκείου"
            />

            <label className="block text-sm font-medium text-slate-700">Course</label>
            <select
              value={formValues.course}
              onChange={(event) => setFormValues({ ...formValues, course: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="">Select course</option>
              {courses.map((courseOption) => (
                <option key={courseOption.id} value={courseOption.title}>
                  {courseOption.title}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-slate-700">Parent / Guardian</label>
            <input
              value={formValues.parentName}
              onChange={(event) => setFormValues({ ...formValues, parentName: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Μαρία Κωνσταντίνου"
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={saveStudent}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {selectedStudent ? "Update student" : "Save student"}
            </button>
            {selectedStudent ? (
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
