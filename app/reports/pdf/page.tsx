"use client";

import { useEffect, useState } from "react";

export default function ReportsPDFPage() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    setStudents(
      JSON.parse(localStorage.getItem("eduflow_students") || "[]")
    );

    setTeachers(
      JSON.parse(localStorage.getItem("eduflow_teachers") || "[]")
    );

    setClasses(
      JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]")
    );

    setSchedule(
      JSON.parse(localStorage.getItem("eduflow_schedule") || "[]")
    );
  }, []);

  return (
    <div className="bg-white min-h-screen text-black p-10">

      {/* Header */}

      <div className="flex justify-between items-center border-b pb-6 mb-8">

        <div>

          <h1 className="text-4xl font-black text-indigo-700">
            EduFlow
          </h1>

          <p className="text-gray-500">
            Smart Tutoring ERP
          </p>

        </div>

        <div className="text-right">

          <h2 className="text-3xl font-bold">
            Reports
          </h2>

          <p className="text-gray-500">
            {new Date().toLocaleDateString("el-GR")}
          </p>

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-4 gap-6 mb-10">

        <Stat
          title="Μαθητές"
          value={students.length}
        />

        <Stat
          title="Καθηγητές"
          value={teachers.length}
        />

        <Stat
          title="Τμήματα"
          value={classes.length}
        />

        <Stat
          title="Μαθήματα"
          value={schedule.length}
        />

      </div>

      {/* Students */}

      <h2 className="text-xl font-bold mb-4">
        Αναλυτική Αναφορά Μαθητών
      </h2>

      <table className="w-full border-collapse border">

        <thead>

          <tr className="bg-gray-100">

            <th className="border p-3 text-left">
              Όνομα
            </th>

            <th className="border p-3 text-left">
              Επώνυμο
            </th>

            <th className="border p-3 text-left">
              Τάξη
            </th>

            <th className="border p-3 text-left">
              Email
            </th>

            <th className="border p-3 text-left">
              Τηλέφωνο
            </th>

          </tr>

        </thead>

        <tbody>

          {students.map((s: any, i: number) => (

            <tr key={i}>

              <td className="border p-2">
                {s.firstName || s.name?.split(" ")[0] || "-"}
              </td>

              <td className="border p-2">
                {s.lastName || s.name?.split(" ").slice(1).join(" ") || "-"}
              </td>

              <td className="border p-2">
                {s.grade || "-"}
              </td>

              <td className="border p-2">
                {s.email || "-"}
              </td>

              <td className="border p-2">
                {s.phone || "-"}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* Footer */}

      <div className="mt-16 border-t pt-4 text-center text-sm text-gray-500">

        Generated automatically by EduFlow ERP

      </div>

    </div>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="border rounded-xl p-5">

      <p className="text-sm text-gray-500 uppercase">
        {title}
      </p>

      <h3 className="text-4xl font-bold">
        {value}
      </h3>

    </div>
  );
}