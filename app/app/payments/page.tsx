"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { fetchPayments } from "../lib/api";
import type { PaymentRecord } from "../lib/data";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [student, setStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<PaymentRecord["status"]>("Pending");

  useEffect(() => {
    fetchPayments().then(setPayments);
  }, []);

  function handleAddPayment() {
    if (!student || !amount || !dueDate) {
      return;
    }

    setPayments((current) => [
      {
        id: `pay_${Date.now()}`,
        student,
        amount,
        dueDate,
        status,
      },
      ...current,
    ]);

    setStudent("");
    setAmount("");
    setDueDate("");
    setStatus("Pending");
  }

  return (
    <WorkspaceShell
      title="Payments"
      description="Track invoices, record payments, and manage tuition revenue for every student."
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Payment ledger</h2>
            <p className="mt-1 text-sm text-slate-500">Monitor pending invoices, settle tuition, and view overdue payments.</p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 py-3 text-left font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold">Due date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-900">{payment.student}</td>
                    <td className="px-4 py-4 text-slate-600">{payment.amount}</td>
                    <td className="px-4 py-4 text-slate-600">{payment.dueDate}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          payment.status === "Paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : payment.status === "Overdue"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Add payment</h2>
            <p className="mt-1 text-sm text-slate-500">Record a new payment or invoice for one of your students.</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Student name</label>
            <input
              value={student}
              onChange={(event) => setStudent(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Μαρία Κωνσταντίνου"
            />
            <label className="block text-sm font-medium text-slate-700">Amount</label>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="€160"
            />
            <label className="block text-sm font-medium text-slate-700">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as PaymentRecord["status"])}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <button
            onClick={handleAddPayment}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Save payment
          </button>
        </section>
      </div>
    </WorkspaceShell>
  );
}
