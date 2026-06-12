"use client";

import { useState, useEffect, useRef } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Download, Upload, Database, AlertTriangle, CheckCircle2, RefreshCw, Loader2, Calendar, FileJson } from "lucide-react";

const ALLOWED_KEYS = [
  "eduflow_students",
  "eduflow_teachers",
  "eduflow_classes_data",
  "eduflow_lessons",
  "eduflow_schedule",
  "eduflow_rooms",
  "eduflow_attendance",
  "eduflow_notifications",
  "eduflow_payments",
  "eduflow_crm_leads",
  "eduflow_backup_metadata" // Για αποθήκευση ιστορικού
];

const KEY_LABELS: Record<string, string> = {
  eduflow_students: "Μαθητές",
  eduflow_teachers: "Καθηγητές",
  eduflow_classes_data: "Τμήματα",
  eduflow_lessons: "Μαθήματα",
  eduflow_schedule: "Πρόγραμμα",
  eduflow_rooms: "Αίθουσες",
  eduflow_attendance: "Παρουσίες",
  eduflow_notifications: "Ειδοποιήσεις",
  eduflow_payments: "Πληρωμές",
  eduflow_crm_leads: "CRM Leads",
};

interface BackupMeta { lastBackup: string; version: number; }

export default function BackupPage() {
  const [mounted, setMounted] = useState(false);
  const [keys, setKeys] = useState<{ key: string; label: string; count: number }[]>([]);
  const [meta, setMeta] = useState<BackupMeta | null>(null);
  const [status, setStatus] = useState<{ type: "ok" | "err" | "loading", text: string } | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("replace");
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const scan = () => {
    const found: any[] = [];
    ALLOWED_KEYS.filter(k => k !== "eduflow_backup_metadata").forEach((k) => {
      let count = 0;
      try {
        const raw = localStorage.getItem(k);
        const parsed = raw ? JSON.parse(raw) : null;
        count = Array.isArray(parsed) ? parsed.length : parsed ? 1 : 0;
      } catch { count = 0; }
      found.push({ key: k, label: KEY_LABELS[k] || k, count });
    });
    setKeys(found);

    const m = localStorage.getItem("eduflow_backup_metadata");
    if (m) setMeta(JSON.parse(m));
  };

  useEffect(() => {
    setMounted(true);
    scan();
  }, []);

  const totalRecords = keys.reduce((acc, k) => acc + k.count, 0);

  const handleExport = () => {
    try {
      setStatus({ type: "loading", text: "Προετοιμασία backup..." });
      
      const data: Record<string, any> = {};
      ALLOWED_KEYS.forEach((k) => {
        const val = localStorage.getItem(k);
        try { data[k] = val ? JSON.parse(val) : []; } catch { data[k] = val; }
      });

      const payload = {
        app: "eduflow",
        version: 1,
        exportedAt: new Date().toISOString(),
        recordCount: totalRecords,
        data,
      };

      // Save metadata locally
      localStorage.setItem("eduflow_backup_metadata", JSON.stringify({ lastBackup: payload.exportedAt, version: 1 }));

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `eduflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus({ type: "ok", text: "Το backup ολοκληρώθηκε." });
      scan();
    } catch {
      setStatus({ type: "err", text: "Σφάλμα κατά την εξαγωγή." });
    }
  };

  const processImport = (file: File) => {
    const reader = new FileReader();
    setStatus({ type: "loading", text: "Επεξεργασία αρχείου..." });

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed?.app !== "eduflow") throw new Error("Μη έγκυρο αρχείο EduFlow.");
        
        // Confirm replace
        if (importMode === "replace") {
          if (!confirm("ΠΡΟΣΟΧΗ: Θα αντικατασταθούν όλα τα υπάρχοντα δεδομένα. Συνέχεια;")) {
            setStatus(null);
            return;
          }
          ALLOWED_KEYS.forEach(k => localStorage.removeItem(k));
        }
        
        const data = parsed.data;
        Object.keys(data).forEach(k => {
          if (!ALLOWED_KEYS.includes(k)) return;
          
          if (importMode === "merge") {
            const existingRaw = localStorage.getItem(k);
            let existingData = [];
            try { existingData = existingRaw ? JSON.parse(existingRaw) : []; } catch {}
            
            if (Array.isArray(existingData) && Array.isArray(data[k])) {
                const merged = [...existingData, ...data[k]].filter(
                  (item, index, self) => index === self.findIndex((x) => x.id === item.id)
                );
                localStorage.setItem(k, JSON.stringify(merged));
            } else {
                localStorage.setItem(k, JSON.stringify(data[k]));
            }
          } else {
            localStorage.setItem(k, JSON.stringify(data[k]));
          }
        });

        localStorage.setItem("eduflow_backup_metadata", JSON.stringify({ lastBackup: new Date().toISOString(), version: parsed.version || 1 }));
        
        scan();
        setStatus({ type: "ok", text: "Η επαναφορά ολοκληρώθηκε. Ανανεώνεται..." });
        setTimeout(() => window.location.reload(), 1000);
      } catch (e: any) {
        setStatus({ type: "err", text: e.message || "Σφάλμα εισαγωγής." });
      }
    };
    reader.readAsText(file);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0b0e14] text-slate-500 font-mono text-xs">
        <Loader2 className="animate-spin mr-2" size={16} /> Φόρτωση συστήματος...
      </div>
    );
  }

  return (
    <WorkspaceShell title="Αντίγραφα Αφαλείας" description="Διαχείριση ασφάλειας δεδομένων φροντιστηρίου.">
      
      {status && (
        <div className={`mb-6 rounded-2xl p-4 text-sm flex items-center gap-2 border ${status.type === "ok" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : status.type === "loading" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
          {status.type === "loading" ? <Loader2 size={16} className="animate-spin" /> : status.type === "ok" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {status.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 flex flex-col">
          <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Download size={16} className="text-emerald-400" /> Εξαγωγή</h2>
          <button onClick={handleExport} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2">
            <Download size={16} /> Λήψη Backup
          </button>
        </div>

        <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 flex flex-col">
          <h2 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><Upload size={16} className="text-indigo-400" /> Επαναφορά</h2>
          <div className="flex gap-2 mb-4">
             <button onClick={() => setImportMode("replace")} className={`flex-1 text-[10px] font-bold py-2 rounded-lg border ${importMode === "replace" ? "bg-indigo-600 border-indigo-500 text-white" : "bg-[#0b0e14] border-slate-800 text-slate-400"}`}>♻️ Αντικατάσταση</button>
             <button onClick={() => setImportMode("merge")} className={`flex-1 text-[10px] font-bold py-2 rounded-lg border ${importMode === "merge" ? "bg-indigo-600 border-indigo-500 text-white" : "bg-[#0b0e14] border-slate-800 text-slate-400"}`}>🔄 Συγχώνευση (Merge)</button>
          </div>
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { if (e.currentTarget.contains(e.relatedTarget as Node)) return; setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if(e.dataTransfer.files[0]) processImport(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700 bg-[#0b0e14] hover:border-slate-600"}`}
          >
            <Upload size={24} className="mx-auto text-slate-500 mb-2" />
            <p className="text-xs text-slate-400">Σύρε το αρχείο εδώ ή κάνε κλικ</p>
          </div>
          <input ref={fileRef} type="file" accept=".json" onChange={(e) => e.target.files?.[0] && processImport(e.target.files[0])} className="hidden" />
        </div>
      </div>

      <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2"><Database size={16} /> Τρέχοντα Δεδομένα</h3>
          <div className="flex gap-4 text-xs">
            <div className="text-slate-500">Συνολικές εγγραφές: <span className="text-white font-bold">{totalRecords}</span></div>
            <div className="text-slate-500 flex items-center gap-1"><Calendar size={12}/> {meta?.lastBackup ? new Date(meta.lastBackup).toLocaleString() : "Κανένα backup"}</div>
            <div className="text-slate-500">Έκδοση: <span className="text-white font-bold">v{meta?.version || 1}</span></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {keys.map((k) => (
            <div key={k.key} className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-slate-500 truncate">{k.label}</p>
              <p className="text-lg font-black text-white">{k.count}</p>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}