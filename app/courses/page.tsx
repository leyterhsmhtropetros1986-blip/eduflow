"use client";
import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";

export default function CoursesPage() {
  const [courses, setCourses] = useState<string[]>([]);
  const [newCourse, setNewCourse] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("eduflow_courses");
    if (saved) setCourses(JSON.parse(saved));
  }, []);

  const addCourse = () => {
    if (!newCourse) return;
    const updated = [...courses, newCourse];
    setCourses(updated);
    localStorage.setItem("eduflow_courses", JSON.stringify(updated));
    setNewCourse("");
  };

  return (
    <WorkspaceShell title="Μαθήματα" description="Διαχείριση προσφερόμενων μαθημάτων">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex gap-4 mb-8">
          <input 
            className="border p-3 rounded-xl w-full" 
            placeholder="Όνομα μαθήματος (π.χ. Μαθηματικά)" 
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
          />
          <button onClick={addCourse} className="bg-cyan-600 text-white px-6 rounded-xl">Προσθήκη</button>
        </div>
        <ul className="space-y-2">
          {courses.map((c, i) => (
            <li key={i} className="p-3 bg-slate-50 rounded-lg border">{c}</li>
          ))}
        </ul>
      </div>
    </WorkspaceShell>
  );
}