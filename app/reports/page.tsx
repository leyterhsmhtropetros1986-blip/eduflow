"use client";

import { WorkspaceShell } from "../app/components/WorkspaceShell";
import { FileText, Printer, Users, UserCheck, DoorOpen, Calendar, Clock, List } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  return (
    <WorkspaceShell title="Κέντρο Αναφορών (Reports)" description="Κεντρική διαχείριση εκτυπώσεων και εξαγωγών δεδομένων.">
      
      <div className="px-4 pb-20 space-y-8">
        
        {/* ΚΑΤΗΓΟΡΙΑ 1: ΠΡΟΓΡΑΜΜΑΤΑ */}
        <section>
          <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-400" /> Προγραμματισμός & Scheduler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl flex justify-between items-center">
              <div>
                <h3 className="text-white font-bold">Πρόγραμμα ανά Τάξη</h3>
                <p className="text-slate-400 text-xs mt-1">Εξαγωγή προγραμμάτων για εκτύπωση/PDF.</p>
              </div>
              <Link href="/scheduler" className="bg-indigo-600 px-4 py-2 rounded-xl text-white text-xs font-bold">Μετάβαση</Link>
            </div>
          </div>
        </section>

        {/* ΚΑΤΗΓΟΡΙΑ 2: ΔΙΟΙΚΗΤΙΚΑ */}
        <section>
          <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400" /> Μητρώα & Λίστες</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl flex justify-between items-center">
              <div className="flex items-center gap-4">
                <List className="text-emerald-400" />
                <div>
                    <h3 className="text-white font-bold">Κατάσταση Μαθητών</h3>
                    <p className="text-slate-400 text-xs mt-1">Λίστα εγγεγραμμένων ανά τάξη.</p>
                </div>
              </div>
              <button onClick={() => window.print()} className="bg-slate-800 px-4 py-2 rounded-xl text-white text-xs">Εκτύπωση</button>
            </div>
            <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl flex justify-between items-center">
              <div className="flex items-center gap-4">
                <UserCheck className="text-emerald-400" />
                <div>
                    <h3 className="text-white font-bold">Κατάσταση Καθηγητών</h3>
                    <p className="text-slate-400 text-xs mt-1">Λίστα καθηγητών με μαθήματα.</p>
                </div>
              </div>
              <button onClick={() => window.print()} className="bg-slate-800 px-4 py-2 rounded-xl text-white text-xs">Εκτύπωση</button>
            </div>
          </div>
        </section>

        {/* ΚΑΤΗΓΟΡΙΑ 3: ΛΕΙΤΟΥΡΓΙΚΑ */}
        <section>
          <h2 className="text-white font-bold mb-4 flex items-center gap-2"><DoorOpen className="w-5 h-5 text-amber-400" /> Λειτουργικά</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Clock className="text-amber-400" />
                <div>
                    <h3 className="text-white font-bold">Διαθεσιμότητα Αιθουσών</h3>
                    <p className="text-slate-400 text-xs mt-1">Αναλυτικό πλάνο δεσμεύσεων.</p>
                </div>
              </div>
              <button onClick={() => window.print()} className="bg-slate-800 px-4 py-2 rounded-xl text-white text-xs">Εκτύπωση</button>
            </div>
          </div>
        </section>

      </div>
    </WorkspaceShell>
  );
}