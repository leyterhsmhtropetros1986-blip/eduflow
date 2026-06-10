"use client";

import { WorkspaceShell } from "../components/WorkspaceShell";

export default function ClassesPage() {
  return (
    <WorkspaceShell title="Διαχείριση Τμημάτων" description="Διαχειριστείτε τα τμήματα διδασκαλίας σας.">
      <div className="p-6">
        <h1 className="text-white">Εδώ θα εμφανίζονται τα Τμήματα</h1>
      </div>
    </WorkspaceShell>
  );
}