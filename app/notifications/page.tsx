"use client";

import { useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import {
  Mail,
  MessageSquare,
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

const demoNotifications = [
  {
    id: "1",
    type: "absence",
    recipient: "Μαρία Παπαδοπούλου",
    channel: "email",
    message: "Απουσία μαθητή σήμερα στις 18:00",
    status: "sent",
    date: "12/06/2026 18:15",
  },
  {
    id: "2",
    type: "schedule",
    recipient: "Γιώργος Νικολάου",
    channel: "sms",
    message: "Αλλαγή προγράμματος",
    status: "pending",
    date: "12/06/2026 17:00",
  },
];

export default function NotificationsPage() {
  const [notifications] = useState(demoNotifications);

  return (
    <WorkspaceShell
      title="Notifications Center"
      description="Διαχείριση Email / SMS / Push"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Stats */}

        <div className="space-y-4">

          <StatCard
            title="Στάλθηκαν"
            value={notifications.filter(n => n.status === "sent").length}
            icon={<CheckCircle2 className="text-emerald-400" />}
          />

          <StatCard
            title="Εκκρεμούν"
            value={notifications.filter(n => n.status === "pending").length}
            icon={<Clock className="text-amber-400" />}
          />

          <StatCard
            title="Αποτυχίες"
            value={notifications.filter(n => n.status === "failed").length}
            icon={<XCircle className="text-rose-400" />}
          />

        </div>

        {/* Table */}

        <div className="lg:col-span-3 bg-[#1e2330] rounded-3xl border border-slate-800 overflow-hidden">

          <div className="p-5 border-b border-slate-800">

            <h3 className="text-white font-bold">
              Ιστορικό Ειδοποιήσεων
            </h3>

          </div>

          <table className="w-full text-sm">

            <thead className="bg-[#0b0e14]">

              <tr className="text-slate-500">

                <th className="p-3 text-left">Παραλήπτης</th>

                <th className="p-3 text-left">Κανάλι</th>

                <th className="p-3 text-left">Μήνυμα</th>

                <th className="p-3 text-left">Status</th>

                <th className="p-3 text-left">Ημερομηνία</th>

              </tr>

            </thead>

            <tbody>

              {notifications.map((n) => (

                <tr
                  key={n.id}
                  className="border-b border-slate-800 hover:bg-slate-900/30"
                >

                  <td className="p-3 text-white">
                    {n.recipient}
                  </td>

                  <td className="p-3">

                    {n.channel === "email" && (
                      <Mail size={16} className="text-sky-400" />
                    )}

                    {n.channel === "sms" && (
                      <MessageSquare size={16} className="text-emerald-400" />
                    )}

                    {n.channel === "push" && (
                      <Bell size={16} className="text-purple-400" />
                    )}

                  </td>

                  <td className="p-3 text-slate-300">
                    {n.message}
                  </td>

                  <td className="p-3">

                    {n.status === "sent" && (
                      <span className="text-emerald-400 font-bold">
                        SENT
                      </span>
                    )}

                    {n.status === "pending" && (
                      <span className="text-amber-400 font-bold">
                        PENDING
                      </span>
                    )}

                    {n.status === "failed" && (
                      <span className="text-rose-400 font-bold">
                        FAILED
                      </span>
                    )}

                  </td>

                  <td className="p-3 text-slate-500">
                    {n.date}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>
    </WorkspaceShell>
  );
}

function StatCard({
  title,
  value,
  icon,
}: any) {
  return (
    <div className="bg-[#1e2330] rounded-3xl border border-slate-800 p-5 flex justify-between items-center">

      <div>

        <p className="text-[10px] uppercase text-slate-500 font-bold">
          {title}
        </p>

        <h3 className="text-2xl font-black text-white">
          {value}
        </h3>

      </div>

      {icon}

    </div>
  );
}