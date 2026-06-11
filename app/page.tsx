"use client";
import { Users, GraduationCap, BookOpen } from "lucide-react";
import { WorkspaceShell } from "../components/WorkspaceShell"; // Βεβαιώσου ότι το path είναι σωστό

export default function Dashboard() {
  return (
    <WorkspaceShell 
      title="EduFlow Operations" 
      description="Κεντρικός έλεγχος λειτουργίας εκπαιδευτηρίου."
    >
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24}/></div>
          <div>
            <p className="text-slate-500 text-sm">Ενεργά Τμήματα</p>
            <p className="text-2xl font-bold">42</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><GraduationCap size={24}/></div>
          <div>
            <p className="text-slate-500 text-sm">Καθηγητές</p>
            <p className="text-2xl font-bold">28</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><BookOpen size={24}/></div>
          <div>
            <p className="text-slate-500 text-sm">Επόμενο Μάθημα</p>
            <p className="text-xl font-bold">Μαθηματικά Γ3</p>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}