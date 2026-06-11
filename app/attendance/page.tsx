"use client";

import { WorkspaceShell } from "../../components/WorkspaceShell";
import { CheckCircle2 } from "lucide-react";

export default function AttendancePage() {
  return (
    <WorkspaceShell title="Παρακολούθηση" description="Διαχείριση παρουσιών μαθητών.">
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl m-4">
        <CheckCircle2 size={48} className="mb-4 text-slate-700" />
        <p className="text-sm">Η ενότητα Παρακολούθησης είναι υπό ανάπτυξη.</p>
      </div>
    </WorkspaceShell>
  );
}