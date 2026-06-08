"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { fetchParents } from "../lib/api";
import type { ParentContact } from "../lib/data";

export default function ParentsPage() {
  const [parents, setParents] = useState<ParentContact[]>([]);

  useEffect(() => {
    fetchParents().then(setParents);
  }, []);

  return (
    <WorkspaceShell
      title="Parent Portal"
      description="Give parents access to attendance, payments, and course progress in one portal."
    >
      <section className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Parent contacts</h2>
            <p className="mt-1 text-sm text-slate-500">Manage guardian records and send quick updates about student progress.</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">Portal access ready</div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Parent</th>
                <th className="px-4 py-3 text-left font-semibold">Student</th>
                <th className="px-4 py-3 text-left font-semibold">Relationship</th>
                <th className="px-4 py-3 text-left font-semibold">Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {parents.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-900">{record.parentName}</td>
                  <td className="px-4 py-4 text-slate-600">{record.student}</td>
                  <td className="px-4 py-4 text-slate-600">{record.relationship}</td>
                  <td className="px-4 py-4 text-slate-600">{record.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Message center</div>
            <p className="mt-2 text-sm text-slate-600">Send updates to parents about upcoming sessions and absence alerts.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Student progress</div>
            <p className="mt-2 text-sm text-slate-600">Connect parent profiles to student course progress and attendance summaries.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-semibold text-slate-900">Billing overview</div>
            <p className="mt-2 text-sm text-slate-600">Share invoices and payment history directly with family accounts.</p>
          </div>
        </div>
      </section>
    </WorkspaceShell>
  );
}
