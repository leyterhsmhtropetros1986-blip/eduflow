"use client";
import { Users, GraduationCap, BookOpen, Clock } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">EduFlow Operations</h1>
        <p className="text-slate-500">Κεντρικός έλεγχος λειτουργίας εκπαιδευτηρίου.</p>
      </header>

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
    </div>
  );
}