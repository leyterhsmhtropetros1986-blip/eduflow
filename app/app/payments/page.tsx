"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { DollarSign, Wallet, CheckCircle2, AlertCircle } from "lucide-react";

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [studentName, setStudentName] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Εκκρεμεί");

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_payments");
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else {
      const defaultPayments = [
        { id: "p1", student: "Γιάννης Παπαδόπουλος", amount: 140, status: "Εκκρεμεί" },
        { id: "p2", student: "Μαρία Κωνσταντίνου", amount: 160, status: "Εξοφλήθηκε" }
      ];
      localStorage.setItem("eduflow_payments", JSON.stringify(defaultPayments));
      setTransactions(defaultPayments);
    }
  }, []);

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !amount) {
      alert("⚠️ Συμπληρώστε το όνομα του μαθητή και το ποσό των διδάκτρων!");
      return;
    }

    const newPayment = {
      id: `pay-${Date.now()}`,
      student: studentName,
      amount: Number(amount),
      status
    };

    const updated = [...transactions, newPayment];
    setTransactions(updated);
    localStorage.setItem("eduflow_payments", JSON.stringify(updated));

    setStudentName("");
    setAmount("");
    alert("🎉 Η νέα συναλλαγή καταγράφηκε επιτυχώς!");
  };

  const toggleStatus = (id: string) => {
    const updated = transactions.map(t => 
      t.id === id ? { ...t, status: t.status === "Εξοφλήθηκε" ? "Εκκρεμεί" : "Εξοφλήθηκε" } : t
    );
    setTransactions(updated);
    localStorage.setItem("eduflow_payments", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell 
      title="Οικονομικό Καθολικό & Δίδακτρα" 
      description="Λογιστική παρακολούθηση εισπράξεων, καταγραφή εκκρεμών οφειλών ανά οικογένεια και πλήρες ιστορικό εσόδων."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΛΙΣΤΑ ΣΥΝΑΛΛΑΓΩΝ */}
        <div className="lg:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" /> Καταγραφή Μηνιαίων Εισπράξεων
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold text-[10px] uppercase">
                  <th className="pb-3">Ονοματεπώνυμο Μαθητή</th>
                  <th className="pb-3">Ποσό</th>
                  <th className="pb-3">Κατάσταση</th>
                  <th className="pb-3 text-right">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/10 transition">
                    <td className="py-3.5 font-bold text-white">{t.student}</td>
                    <td className="py-3.5 text-emerald-400 font-mono font-bold">€{t.amount}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === "Εξοφλήθηκε" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button onClick={() => toggleStatus(t.id)} className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-2 py-1 rounded transition">
                        Αλλαγή σε {t.status === "Εξοφλήθηκε" ? "Εκκρεμεί" : "Εξοφλήθηκε"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ΦΟΡΜΑ ΕΙΣΠΡΑΞΗΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" /> Καταχώρηση Νέας Είσπραξης
          </h3>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ονοματεπώνυμο Μαθητή *</label>
              <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="π.χ. Μαρία Κωνσταντίνου" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ποσό σε Ευρώ (€) *</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="160" className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Αρχική Κατάσταση</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none">
                <option value="Εκκρεμεί">Εκκρεμεί</option>
                <option value="Εξοφλήθηκε">Εξοφλήθηκε</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md">
              Αποθήκευση Πληρωμής
            </button>
          </form>
        </div>

      </div>
    </WorkspaceShell>
  );
}