"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Check, Pin, Bell, Mail, RefreshCw, X } from "lucide-react";

interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  pinned?: boolean;
}

// Utility για σχετικό χρόνο
const getTimeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "πριν από λίγο";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `πριν από ${minutes} λεπτά`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `πριν από ${hours} ώρες`;
  return new Intl.DateTimeFormat("el-GR", { dateStyle: "short", timeStyle: "short" }).format(new Date(date));
};

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const loadNotifications = () => {
    try { return JSON.parse(localStorage.getItem("eduflow_notifications") || "[]"); } 
    catch { return []; }
  };

  const save = (newItems: AppNotification[]) => {
    localStorage.setItem("eduflow_notifications", JSON.stringify(newItems));
    setItems(newItems);
    // Custom event για συγχρονισμό στο ίδιο tab
    window.dispatchEvent(new Event("eduflow-notifications-updated"));
  };

  useEffect(() => {
    setItems(loadNotifications());

    const reload = () => setItems(loadNotifications());
    window.addEventListener("storage", reload);
    window.addEventListener("eduflow-notifications-updated", reload);

    return () => {
      window.removeEventListener("storage", reload);
      window.removeEventListener("eduflow-notifications-updated", reload);
    };
  }, []);

  // Stats
  const stats = {
    total: items.length,
    unread: items.filter(n => !n.read).length,
    pinned: items.filter(n => n.pinned).length,
  };

  const markAllRead = () => {
    if (confirm("Να σημειωθούν όλες οι ειδοποιήσεις ως διαβασμένες;")) {
      save(items.map(n => ({ ...n, read: true })));
    }
  };

  const deleteAll = () => {
    if (confirm("ΠΡΟΣΟΧΗ: Θα διαγραφούν ΟΛΕΣ οι ειδοποιήσεις. Συνέχεια;")) {
      save([]);
    }
  };

  const remove = (id: string) => {
    if (confirm("Να διαγραφεί η ειδοποίηση;")) {
      save(items.filter(n => n.id !== id));
    }
  };

  const togglePin = (id: string) => {
    save(items.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const toggleRead = (id: string) => {
    save(items.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const filtered = useMemo(() => {
    const list = filter === "unread" ? items.filter((n) => !n.read) : items;
    return [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [items, filter]);

  return (
    <WorkspaceShell title="Κέντρο Ειδοποιήσεων" description="Διαχείριση ενημερώσεων συστήματος.">
      
      {/* Summary Header */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e2330] p-4 rounded-2xl border border-slate-800">
           <p className="text-[10px] text-slate-500 uppercase font-bold">Σύνολο</p>
           <p className="text-xl font-black text-white">{stats.total}</p>
        </div>
        <div className="bg-[#1e2330] p-4 rounded-2xl border border-slate-800">
           <p className="text-[10px] text-indigo-400 uppercase font-bold">Μη διαβασμένες</p>
           <p className="text-xl font-black text-indigo-400">{stats.unread}</p>
        </div>
        <div className="bg-[#1e2330] p-4 rounded-2xl border border-slate-800">
           <p className="text-[10px] text-amber-400 uppercase font-bold">Καρφιτσωμένες</p>
           <p className="text-xl font-black text-amber-400">{stats.pinned}</p>
        </div>
      </div>

      <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-bold text-sm flex items-center">
            <Bell size={16} className="mr-2 text-indigo-400" />
            Ειδοποιήσεις
            {stats.unread > 0 && (
              <span className="ml-2 bg-rose-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                {stats.unread}
              </span>
            )}
          </h3>
          
          <div className="flex gap-2">
            <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filter === "all" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>Όλες</button>
            <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filter === "unread" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}`}>Μη διαβασμένες</button>
            <button onClick={markAllRead} className="ml-2 px-3 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 text-xs font-bold hover:bg-emerald-600/20">Διαβασμένα</button>
            <button onClick={deleteAll} className="px-3 py-1.5 rounded-lg bg-rose-600/10 text-rose-400 text-xs font-bold hover:bg-rose-600/20">🗑</button>
          </div>
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-10">
              {filter === "unread" ? "Δεν υπάρχουν μη διαβασμένες ειδοποιήσεις." : "Δεν βρέθηκαν ειδοποιήσεις."}
            </p>
          ) : (
            filtered.map((n) => (
              <div key={n.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${n.read ? "bg-[#0b0e14] border-slate-800" : "bg-indigo-950/10 border-indigo-500/30"}`}>
                <div className={`p-2 rounded-full ${n.read ? "bg-slate-800" : "bg-indigo-500/20"}`}>
                    <Mail size={14} className={n.read ? "text-slate-500" : "text-indigo-400"} />
                </div>
                
                <div className="flex-1">
                  <p className={`text-xs ${n.read ? "text-slate-400" : "text-white font-semibold"}`}>{n.message}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">{getTimeAgo(n.createdAt)}</p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => togglePin(n.id)} className="p-1.5 rounded-lg transition-colors">
                        <Pin size={14} className={n.pinned ? "text-amber-400 fill-amber-400" : "text-slate-600"} />
                    </button>
                    {!n.read && (
                        <button onClick={() => toggleRead(n.id)} className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg"><Check size={14} /></button>
                    )}
                    <button onClick={() => remove(n.id)} className="p-1.5 text-slate-600 hover:text-rose-500 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}