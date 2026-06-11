"use client";

import { WorkspaceShell } from "../../components/WorkspaceShell";
import { UserCheck } from "lucide-react";

export default function ParentsPage() {
  return (
    <WorkspaceShell title="Γονείς" description="Διαχείριση στοιχείων γονέων και επικοινωνία.">
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl m-4">
        <UserCheck size={48} className="mb-4 text-slate-700" />
        <p className="text-sm">Η ενότητα Γονέων είναι υπό ανάπτυξη.</p>
      </div>
    </WorkspaceShell>
  );
}