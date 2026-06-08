"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { fetchAttendance } from "../lib/api";
import type { AttendanceRecord } from "../lib/data";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchAttendance().then(setAttendance);
  }, []);

  function updateStatus(id: string, status: AttendanceRecord["status"]) {
    setAttendance((current) =>
      current.map((record) =>
        record.id === id ? { ...record, status } : record
      )
    );
  }

  return (
    <WorkspaceShell
      title="Attendance"
      description="Record attendance quickly and keep student presence data up to date."
    >
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Attendance tracker</h2>
            <p className="mt-1 text-sm text-slate-500">Mark students present, absent, or late and review recent attendance history.</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            Last sync: 2 minutes ago
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Student</th>
                <th className="px-4 py-3 text-left font-semibold">Course</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-900">{record.student}</td>
                  <td className="px-4 py-4 text-slate-600">{record.course}</td>
                  <td className="px-4 py-4 text-slate-600">{record.date}</td>
                  <td className="px-4 py-4 text-slate-900">{record.status}</td>
                  <td className="px-4 py-4 space-x-2">
                    <button
                      onClick={() => updateStatus(record.id, "Present")}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                    >
                      Present
                    </button>
                    <button
                      onClick={() => updateStatus(record.id, "Absent")}
                      className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => updateStatus(record.id, "Late")}
                      className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                    >
                      Late
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </WorkspaceShell>
  );
}
