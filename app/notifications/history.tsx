"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  MessageSquare,
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

interface Notification {
  id: string;
  recipientName: string;
  title: string;
  message: string;
  channel: "email" | "sms" | "push";
  status: "sent" | "pending" | "failed";
  createdAt: string;
}

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("eduflow_notifications") || "[]"
    );

    setNotifications(data.reverse());
  }, []);

  if (notifications.length === 0) {
    return (
      <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-10 text-center">
        <Bell className="mx-auto mb-4 text-slate-600" size={40} />
        <h3 className="text-white font-bold">
          Δεν υπάρχουν ειδοποιήσεις
        </h3>
        <p className="text-slate-500 text-sm mt-2">
          Μόλις σταλεί Email ή SMS θα εμφανιστεί εδώ.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e2330] rounded-3xl border border-slate-800 overflow-hidden">

      <div className="p-5 border-b border-slate-800">
        <h2 className="text-white font-bold text-lg">
          Ιστορικό Ειδοποιήσεων
        </h2>
      </div>

      <table className="w-full">

        <thead className="bg-[#0b0e14]">

          <tr className="text-slate-500 text-xs uppercase">

            <th className="text-left p-4">Παραλήπτης</th>

            <th className="text-left p-4">Κανάλι</th>

            <th className="text-left p-4">Τίτλος</th>

            <th className="text-left p-4">Κατάσταση</th>

            <th className="text-left p-4">Ημερομηνία</th>

          </tr>

        </thead>

        <tbody>

          {notifications.map((n) => (

            <tr
              key={n.id}
              className="border-b border-slate-800 hover:bg-slate-900/40 transition"
            >

              <td className="p-4 text-white">
                {n.recipientName}
              </td>

              <td className="p-4">

                {n.channel === "email" && (
                  <Mail size={18} className="text-sky-400" />
                )}

                {n.channel === "sms" && (
                  <MessageSquare
                    size={18}
                    className="text-emerald-400"
                  />
                )}

                {n.channel === "push" && (
                  <Bell
                    size={18}
                    className="text-purple-400"
                  />
                )}

              </td>

              <td className="p-4">

                <p className="text-white font-semibold">
                  {n.title}
                </p>

                <p className="text-slate-500 text-xs mt-1">
                  {n.message}
                </p>

              </td>

              <td className="p-4">

                {n.status === "sent" && (
                  <span className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 size={15} />
                    Sent
                  </span>
                )}

                {n.status === "pending" && (
                  <span className="flex items-center gap-2 text-amber-400 font-bold">
                    <Clock size={15} />
                    Pending
                  </span>
                )}

                {n.status === "failed" && (
                  <span className="flex items-center gap-2 text-rose-400 font-bold">
                    <XCircle size={15} />
                    Failed
                  </span>
                )}

              </td>

              <td className="p-4 text-slate-400 text-sm">
                {n.createdAt}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}