"use client";

import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Users } from "lucide-react";

export default function CrmPage() {
  return (
    <WorkspaceShell title="CRM" description="Διαχείριση υποψήφιων μαθητών και επικοινωνίας.">
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl m-4">
        <Users size={48} className="mb-4 text-slate-700" />
        <p className="text-sm">Η ενότητα CRM είναι υπό ανάπτυξη.</p>
      </div>
    </WorkspaceShell>
  );
}