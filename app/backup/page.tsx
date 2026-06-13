"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Download, Upload, CheckCircle2, AlertTriangle, Calendar, HardDrive } from "lucide-react";

const KEYS = [
  "eduflow_students", "eduflow_teachers", "eduflow_classes", "eduflow_classes_data",
  "eduflow_lessons", "eduflow_courses", "eduflow_rooms", "eduflow_schedule",
  "eduflow_attendance", "eduflow_progress", "eduflow_exams", "eduflow_crm_leads",
  "eduflow_notifications", "eduflow_parents",
];
const LAST_BACKUP_KEY = "eduflow_last_backup";
const REMINDER_DAYS = 7;

const LABELS: Record<string,string> = {
  eduflow_students: "Μαθητές", eduflow_teachers: "Καθηγητές", eduflow_classes: "Τμήματα", eduflow_classes_data: "Τμήματα (data)",
  eduflow_lessons: "Μαθήματα", eduflow_courses: "Μαθήματα (legacy)", eduflow_rooms: "Αίθουσες", eduflow_schedule: "Πρόγραμμα",
  eduflow_attendance: "Παρουσίες", eduflow_progress: "Πρόοδος", eduflow_exams: "Διαγωνίσματα", eduflow_crm_leads: "CRM Leads",
  eduflow_notifications: "Ειδοποιήσεις", eduflow_parents: "Γονείς",
};

export default function BackupPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [totalSize, setTotalSize] = useState(0);
  const [message, setMessage] = useState("");

  const computeStats = () => {
    const s: Record<string, number> = {};
    let total = 0;
    KEYS.forEach((k) => {
      const raw = localStorage.getItem(k);
      if (!raw) return;
      try {
        const d = JSON.parse(raw);
        if (Array.isArray(d)) s[k] = d.length;
        else if (typeof d === "object" && d !== null) s[k] = Object.keys(d).length;
        else s[k] = 1;
        total += raw.length;
      } catch {}
    });
    setStats(s); setTotalSize(total);
  };

  useEffect(() => {
    setIsMounted(true);
    setLastBackup(localStorage.getItem(LAST_BACKUP_KEY));
    computeStats();
  }, []);

  const daysSince = useMemo(() => {
    if (!lastBackup) return null;
    return Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86400000);
  }, [lastBackup]);
  const needs = daysSince === null || daysSince >= REMINDER_DAYS;

  const handleBackup = () => {
    const backup: any = { _meta: { version: "1.0", createdAt: new Date().toISOString(), app: "EduFlow" } };
    KEYS.forEach((k) => { const raw = localStorage.getItem(k); if (raw) { try { backup[k] = JSON.parse(raw); } catch {} } });
    const name = `eduflow-backup-${new Date().toISOString().slice(0,10)}.json`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    a.download = name; a.click();
    const now = new Date().toISOString();
    localStorage.setItem(LAST_BACKUP_KEY, now); setLastBackup(now);
    setMessage(`✓ Backup ολοκληρώθηκε: ${name}`);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!confirm("⚠ Η επαναφορά θα ΑΝΤΙΚΑΤΑΣΤΗΣΕΙ όλα τα τρέχοντα δεδομένα. Σίγουρα;")) { e.target.value = ""; return; }
    const r = new FileReader();
    r.onload = () => {
      try {
        const b = JSON.parse(r.result as string);
        let n = 0;
        KEYS.forEach((k) => { if (b[k] !== undefined) { localStorage.setItem(k, JSON.stringify(b[k])); n++; } });
        setMessage(`✓ Επαναφορά: ${n} σύνολα δεδομένων. Επαναφόρτωση...`);
        computeStats();
        setTimeout(() => window.location.reload(), 1500);
      } catch { alert("⛔ Μη έγκυρο αρχείο."); }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  const fmtSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(2)} MB`;
  const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleString("el-GR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Ποτέ";

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Backup & Επαναφορά" description="Αποθήκευσε τα δεδομένα σου τοπικά. Συστήνεται κάθε εβδομάδα.">
      <div className={`mb-6 p-5 rounded-2xl border flex items-start gap-4 ${needs ? "bg-amber-950/30 border-amber-900/50" : "bg-emerald-950/20 border-emerald-900/40"}`}>
        {needs ? <AlertTriangle size={28} className="text-amber-400 shrink-0" /> : <CheckCircle2 size={28} className="text-emerald-400 shrink-0" />}
        <div className="flex-1">
          <h3 className={`font-black text-base ${needs ? "text-amber-300" : "text-emerald-300"}`}>
            {needs ? (lastBackup ? "⚠ Συστήνεται νέο backup" : "⚠ Δεν έχεις κάνει ποτέ backup!") : "✓ Τα δεδομένα σου είναι ασφαλή"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Τελευταίο backup: <span className="text-white font-bold">{fmtDate(lastBackup)}</span>
            {daysSince !== null && <span> · πριν <span className="font-bold">{daysSince} ημέρες</span></span>}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Τα δεδομένα ζουν τοπικά στον browser. Καθαρισμός cookies/cache = χάνονται όλα. Κάνε backup τακτικά (κάθε {REMINDER_DAYS} μέρες).</p>
        </div>
      </div>

      {message && <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-emerald-300 text-sm font-bold">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button onClick={handleBackup} className="bg-indigo-600 hover:bg-indigo-500 text-white p-6 rounded-3xl shadow-xl flex items-center gap-4 transition-all">
          <Download size={32} className="shrink-0" />
          <div className="text-left">
            <p className="font-black text-base">Δημιουργία Backup</p>
            <p className="text-xs text-indigo-200 mt-0.5">Κατεβάζει JSON με όλα τα δεδομένα</p>
          </div>
        </button>
        <label className="bg-[#1e2330] hover:bg-[#262d3d] border border-slate-800 text-white p-6 rounded-3xl shadow-xl flex items-center gap-4 cursor-pointer transition-all">
          <Upload size={32} className="text-emerald-400 shrink-0" />
          <div className="text-left">
            <p className="font-black text-base">Επαναφορά από αρχείο</p>
            <p className="text-xs text-slate-400 mt-0.5">Αντικαθιστά τα τρέχοντα δεδομένα</p>
          </div>
          <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
        </label>
      </div>

      <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2"><HardDrive size={16} className="text-indigo-400" /> Δεδομένα προς backup</h3>
          <span className="text-xs text-slate-400">Συνολικό μέγεθος: <span className="text-white font-bold">{fmtSize(totalSize)}</span></span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {KEYS.filter((k) => stats[k] > 0).map((k) => (
            <div key={k} className="bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2.5">
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{LABELS[k] || k}</p>
              <p className="text-white font-black text-lg">{stats[k]}</p>
            </div>
          ))}
          {Object.keys(stats).length === 0 && <p className="col-span-full text-slate-600 text-xs text-center py-4">Δεν υπάρχουν δεδομένα ακόμα.</p>}
        </div>
      </div>

      <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-3xl p-6">
        <h3 className="text-indigo-300 font-bold text-sm mb-3 flex items-center gap-2"><Calendar size={16} /> Συστάσεις ασφαλείας</h3>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex gap-2"><span className="text-indigo-400">•</span> Κάνε backup <b>κάθε εβδομάδα</b> ή μετά από σημαντικές αλλαγές.</li>
          <li className="flex gap-2"><span className="text-indigo-400">•</span> Αποθήκευσε τα αρχεία σε <b>Google Drive / Dropbox / OneDrive</b>.</li>
          <li className="flex gap-2"><span className="text-indigo-400">•</span> Κράτα <b>πολλαπλά</b> backups (τουλάχιστον 3-4 τελευταία).</li>
          <li className="flex gap-2"><span className="text-indigo-400">•</span> ΜΗΝ καθαρίσεις cookies/cache χωρίς πρόσφατο backup.</li>
          <li className="flex gap-2"><span className="text-indigo-400">•</span> Όταν είμαστε έτοιμοι, θα μεταφερθούν αυτόματα σε cloud (Supabase).</li>
        </ul>
      </div>
    </WorkspaceShell>
  );
}
  