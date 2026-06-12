"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import {
  AlertTriangle, Calendar, CreditCard, Cake, Megaphone,
  Mail, MessageSquare, BellRing, CheckCheck, Trash2, Inbox, Bell,
} from "lucide-react";

const TYPE_CFG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  absence:        { label: "Απουσία",          icon: AlertTriangle, color: "text-rose-400",    bg: "bg-rose-500/10" },
  scheduleChange: { label: "Αλλαγή Προγρ.",     icon: Calendar,      color: "text-indigo-400",  bg: "bg-indigo-500/10" },
  payment:        { label: "Πληρωμή",           icon: CreditCard,    color: "text-emerald-400", bg: "bg-emerald-500/10" },
  birthday:       { label: "Γενέθλια",          icon: Cake,          color: "text-amber-400",   bg: "bg-amber-500/10" },
  announcement:   { label: "Ανακοίνωση",        icon: Megaphone,     color: "text-sky-400",     bg: "bg-sky-500/10" },
};

const CHANNEL_ICON: Record<string, any> = { email: Mail, sms: MessageSquare, push: BellRing };

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    setMounted(true);
    setItems(load());
  }, []);

  const load = () => {
    try { return JSON.parse(localStorage.getItem("eduflow_notifications") || "[]"); }
    catch { return []; }
  };

  const persist = (next: any[]) => {
    setItems(next);
    localStorage.setItem("eduflow_notifications", JSON.stringify(next));
  };

  const unreadCount = items.filter((n) => !n.read).length;
  const filtered = useMemo(
    () => (filter === "unread" ? items.filter((n) => !n.read) : items),
    [items, filter]
  );

  const markRead = (id: string) => persist(items.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllRead = () => persist(items.map((n) => ({ ...n, read: true })));
  const remove = (id: string) => persist(items.filter((n) => n.id !== id));
  const clearAll = () => {
    if (confirm("Διαγραφή ΟΛΩΝ των ειδοποιήσεων;")) persist([]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <div className="text-slate-500 text-xs font-mono animate-pulse">Φόρτωση...</div>
      </div>
    );
  }

  return (
    <WorkspaceShell title="Ειδοποιήσεις" description="Όλες οι ειδοποιήσεις προς γονείς & μαθητές (απουσίες, αλλαγές, ανακοινώσεις).">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${filter === "all" ? "bg-indigo-600 text-white" : "bg-[#1e2330] text-slate-400 border border-slate-800"}`}
          >
            Όλες ({items.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${filter === "unread" ? "bg-indigo-600 text-white" : "bg-[#1e2330] text-slate-400 border border-slate-800"}`}
          >
            Αδιάβαστες ({unreadCount})
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1e2330] text-slate-300 border border-slate-800 hover:text-white disabled:opacity-40 flex items-center gap-1.5"
          >
            <CheckCheck size={14} /> Όλες ως διαβασμένες
          </button>
          <button
            onClick={clearAll}
            disabled={items.length === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1e2330] text-rose-400 border border-slate-800 hover:bg-rose-600 hover:text-white disabled:opacity-40 flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Καθαρισμός
          </button>
        </div>
      </div>

      {/* Λίστα */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-sm border border-dashed border-slate-800 rounded-3xl flex flex-col items-center gap-2">
          <Inbox size={28} className="text-slate-700" />
          {filter === "unread" ? "Δεν υπάρχουν αδιάβαστες ειδοποιήσεις." : "Δεν υπάρχουν ειδοποιήσεις ακόμα."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const cfg = TYPE_CFG[n.type] || { label: n.type, icon: Bell, color: "text-slate-400", bg: "bg-slate-500/10" };
            const Icon = cfg.icon;
            const ChIcon = CHANNEL_ICON[n.channel] || Bell;
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`bg-[#1e2330] border rounded-2xl p-4 flex items-start gap-3 cursor-pointer transition ${n.read ? "border-slate-800 opacity-70" : "border-indigo-500/30"}`}
              >
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}>
                  <Icon size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                    <p className="text-white text-sm font-bold truncate">{n.title}</p>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><ChIcon size={11} /> {n.channel}</span>
                    <span>👤 {n.recipientName}{n.recipientEmail ? ` (${n.recipientEmail})` : ""}</span>
                    <span className="ml-auto font-mono">{n.createdAt}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                  className="text-slate-600 hover:text-rose-500 p-1 rounded-lg shrink-0"
                  title="Διαγραφή"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </WorkspaceShell>
  );
}
