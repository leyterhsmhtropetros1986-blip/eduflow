"use client";

import { useState } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { CreditCard, DollarSign } from "lucide-react";

export default function PaymentsPage() {
  return (
    <WorkspaceShell title="Βιβλίο Πληρωμών & Εσόδων" description="Παρακολούθηση διδάκτρων, τιμολογήσεων και ιστορικού πληρωμών ανά οικογένεια.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
        
        {/* ΠΙΝΑΚΑΣ ΠΛΗΡΩΜΩΝ */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4">Καταγραφή Συναλλαγών</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-800">
                <th className="pb-3">Μαθητής</th>
                <th className="pb-3">Ποσό</th>
                <th className="pb-3">Κατάσταση</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3 text-sm font-medium text-white">Γιάννης Παπαδόπουλος</td>
                <td className="py-3 text-sm text-emerald-400 font-bold">€140</td>
                <td className="py-3"><span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">Εκκρεμεί</span></td>
              </tr>
              <tr>
                <td className="py-3 text-sm font-medium text-white">Μαρία Κωνσταντίνου</td>
                <td className="py-3 text-sm text-emerald-400 font-bold">€160</td>
                <td className="py-3"><span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Εξοφλήθηκε</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ΦΟΡΜΑ ΕΙΣΑΓΩΓΗΣ */}
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Νέα Είσπραξη
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">Όνομα Μαθητή</label>
              <input type="text" placeholder="Μαρία Κωνσταντίνου" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-200 block mb-1">Ποσό (€)</label>
              <input type="number" placeholder="160" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" />
            </div>
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-bold transition">Αποθήκευση Πληρωμής</button>
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}