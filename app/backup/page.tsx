"use client";

import { useState, useEffect, useRef } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Download, Upload, Database, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

const KEY_LABELS: Record<string, string> = {
  eduflow_students: "Μαθητές",
  eduflow_teachers: "Καθηγητές",
  eduflow_classes: "Τμήματα",
  eduflow_lessons: "Μαθήματα",
  eduflow_schedule: "Πρόγραμμα",
  eduflow_rooms: "Αίθουσες",
  eduflow_attendance: "Παρουσίες",
  eduflow_crm_leads: "CRM Leads",
};

interface KeyInfo { key: string; label: string; count: number; }

export default function BackupPage() {
  const [mounted, setMounted] = useState(false);
  const [keys, setKeys] = useState<KeyInfo[]>([]);
  const [status, setStatus] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const scan = () => {
    const found: KeyInfo[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("eduflow_")) continue;
      let count = 0;
      try {
        const parsed = JSON.parse(localStorage.getItem(k) || "null");
        count = Array.isArray(parsed) ? parsed.length : parsed ? 1 : 0;
      } catch {
        count = 0;
      }
      found.push({ key: k, label: KEY_LABELS[k] || k, count });
    }
    found.sort((a, b) => a.label.localeCompare(b.label, "el"));
    setKeys(found);
  };

  useEffect(() => {
    setMounted(true);
    scan();
  }, []);

  const totalRecords = keys.reduce((acc, k) => acc + k.count, 0);

  // ΕΞΑΓΩΓΗ
  const handleExport = () => {
    try {
      const data: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith("eduflow_")) continue;
        try {
          data[k] = JSON.parse(localStorage.getItem(k) || "null");
        } catch {
          data[k] = localStorage.getItem(k);
        }
      }

      const payload = {
        app: "eduflow",
        version: 1,
        exportedAt: new Date().toISOString(),
        data,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `eduflow-backup-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus({ type: "ok", text: `Το backup δημιουργήθηκε (${totalRecords} εγγραφές σε ${keys.length} κατηγορίες).` });
    } catch (e) {
      setStatus({ type: "err", text: "Σφάλμα κατά την εξαγωγή." });
    }
  };

  // ΕΙΣΑΓΩΓΗ
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const data = parsed?.data && typeof parsed.data === "object" ? parsed.data : parsed;

        const incomingKeys = Object.keys(data).filter((k) => k.startsWith("eduflow_"));
        if (incomingKeys.length === 0) {
          setStatus({ type: "err", text: "Το αρχείο δεν περιέχει δεδομένα EduFlow." });
          return;
        }

        if (!confirm(`Θα αντικατασταθούν ${incomingKeys.length} κατηγορίες δεδομένων με αυτές του αρχείου. Συνέχεια;`)) {
          if (fileRef.current) fileRef.current.value = "";
          return;
        }

        incomingKeys.forEach((k) => {
          const v = data[k];
          localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
        });

        scan();
        setStatus({ type: "ok", text: `Επαναφέρθηκαν ${incomingKeys.length} κατηγορίες. Η σελίδα θα ανανεωθεί...` });
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        setStatus({ type: "err", text: "Μη έγκυρο αρχείο JSON." });
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <div className="text-slate-500 text-xs font-mono animate-pulse">Φόρτωση...</div>
      </div>
    );
  }

  return (
    <WorkspaceShell title="Αντίγραφα Ασφαλείας" description="Εξαγωγή & επαναφορά όλων των δεδομένων του φροντιστηρίου σε αρχείο JSON.">

      {/* Status */}
      {status && (
        <div className={`mb-6 rounded-2xl p-4 text-sm flex items-center gap-2 border ${status.type === "ok" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-rose-500/5 border-rose-500/20 text-rose-400"}`}>
          {status.type === "ok" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {status.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* EXPORT */}
        <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 flex flex-col">
          <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-2">
            <Download size={16} className="text-emerald-400" /> Εξαγωγή Backup
          </h2>
          <p className="text-slate-400 text-xs mb-4 flex-1">
            Κατέβασε ένα αρχείο JSON με όλα τα δεδομένα (μαθητές, καθηγητές, τμήματα, μαθήματα, πρόγραμμα, αίθουσες, παρουσίες). Φύλαξέ το σε ασφαλές σημείο.
          </p>
          <button
            onClick={handleExport}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Download size={16} /> Εξαγωγή (JSON)
          </button>
        </div>

        {/* IMPORT */}
        <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 flex flex-col">
          <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-2">
            <Upload size={16} className="text-indigo-400" /> Επαναφορά Backup
          </h2>
          <p className="text-slate-400 text-xs mb-2 flex-1">
            Φόρτωσε ένα αρχείο backup για να επαναφέρεις τα δεδομένα.
          </p>
          <p className="text-amber-400 text-[11px] mb-4 flex items-start gap-1.5">
            <AlertTriangle size={13} className="shrink-0 mt-0.5" />
            Προσοχή: τα τρέχοντα δεδομένα θα αντικατασταθούν.
          </p>
          <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleImportFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Upload size={16} /> Επιλογή Αρχείου & Επαναφορά
          </button>
        </div>
      </div>

      {/* Κατάσταση δεδομένων */}
      <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Database size={16} className="text-slate-400" /> Τρέχοντα Δεδομένα
          </h3>
          <button onClick={scan} className="text-slate-500 hover:text-white text-xs flex items-center gap-1">
            <RefreshCw size={13} /> Ανανέωση
          </button>
        </div>

        {keys.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-6">Δεν υπάρχουν αποθηκευμένα δεδομένα EduFlow.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {keys.map((k) => (
              <div key={k.key} className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3">
                <p className="text-[10px] uppercase font-bold text-slate-500">{k.label}</p>
                <p className="text-2xl font-black text-white">{k.count}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
