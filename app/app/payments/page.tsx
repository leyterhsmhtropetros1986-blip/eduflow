"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { Trash2, CheckCircle, Search, Bell } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  // States Φόρμας
  const [studentName, setStudentName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Εκκρεμεί");
  const [paymentMethod, setPaymentMethod] = useState("Μετρητά");
  const [description, setDescription] = useState("");

  // Φόρτωση από το localStorage
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("eduflow_payments");
    if (stored) {
      setPayments(JSON.parse(stored));
    } else {
      const defaults = [
        { id: "p1", studentName: "Γιάννης Παπαδόπουλος", amount: "140", dueDate: "2026-06-14", status: "Εκκρεμεί", method: "Μετρητά", description: "Δίδακτρα Μαΐου" },
        { id: "p2", studentName: "Μαρία Κωνσταντίνου", amount: "160", dueDate: "2026-06-10", status: "Εξοφλημένο", method: "Κάρτα", description: "Δίδακτρα Ιουνίου" }
      ];
      setPayments(defaults);
      localStorage.setItem("eduflow_payments", JSON.stringify(defaults));
    }
  }, []);

  // Υποβολή νέας εισπραξης
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !amount) return;

    const newPayment = {
      id: Date.now().toString(),
      studentName,
      amount,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status,
      method: paymentMethod,
      description: description || "Δίδακτρα"
    };

    const updated = [...payments, newPayment];
    setPayments(updated);
    localStorage.setItem("eduflow_payments", JSON.stringify(updated));

    // Καθαρισμός Φόρμας
    setStudentName("");
    setAmount("");
    setDueDate("");
    setDescription("");
  };

  const handleDelete = (id: string) => {
    const updated = payments.filter(p => p.id !== id);
    setPayments(updated);
    localStorage.setItem("eduflow_payments", JSON.stringify(updated));
  };

  if (!mounted) return null;

  return (
    <WorkspaceShell 
      title="Βιβλίο Πληρωμών & Εσόδων" 
      description="Παρακολούθηση διδάκτρων, τιμολογήσεων και ιστορικού πληρωμών ανά οικογένεια."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΑΡΙΣΤΕΡΑ: ΚΑΤΑΓΡΑΦΗ ΣΥΝΑΛΛΑΓΩΝ */}
        <div className="lg:col-span-2 bg-[#343a4a] border border-slate-700/40 p-6 rounded-3xl shadow-xl">
          <h3 className="text-sm font-bold text-white mb-5">Καταγραφή Συναλλαγών</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 font-medium text-[11px]">
                  <th className="pb-3">Μαθητής</th>
                  <th className="pb-3">Ποσό</th>
                  <th className="pb-3">Τρόπος / Ανάλυση</th>
                  <th className="pb-3">Λήξη</th>
                  <th className="pb-3">Κατάσταση</th>
                  <th className="pb-3 text-right">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-700/10">
                    <td className="py-4 font-semibold text-white">{p.studentName}</td>
                    <td className="py-4 text-[#10b981] font-bold">€{p.amount}</td>
                    <td className="py-4">
                      <div className="text-slate-200 font-medium">{p.method}</div>
                      <div className="text-slate-400 text-[10px]">{p.description}</div>
                    </td>
                    <td className="py-4 font-mono text-slate-400">{p.dueDate}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        p.status === "Εξοφλημένο" 
                          ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20" 
                          : p.status === "Καθυστερημένο"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ΔΕΞΙΑ: ΝΕΑ ΕΙΣΠΡΑΞΗ */}
        <div className="bg-[#343a4a] border border-slate-700/40 p-6 rounded-3xl shadow-xl h-fit">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-1.5">
            <span className="text-[#10b981] font-bold">$</span> Νέα Είσπραξη
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Όνομα Μαθητή */}
            <div>
              <label className="block text-[11px] text-slate-300 mb-1 font-medium">Όνομα Μαθητή</label>
              <input 
                type="text" 
                value={studentName} 
                onChange={(e) => setStudentName(e.target.value)} 
                placeholder="Μαρία Κωνσταντίνου" 
                className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none" 
                required 
              />
            </div>

            {/* Ποσό */}
            <div>
              <label className="block text-[11px] text-slate-300 mb-1 font-medium">Ποσό (€)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="160" 
                className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none font-mono" 
                required 
              />
            </div>

            {/* Ημερομηνία Λήξης */}
            <div>
              <label className="block text-[11px] text-slate-300 mb-1 font-medium">Ημερομηνία Λήξης</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none [color-scheme:dark]" 
              />
            </div>

            {/* Τρόπος Πληρωμής */}
            <div>
              <label className="block text-[11px] text-slate-300 mb-1 font-medium">Τρόπος Πληρωμής</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
                className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Μετρητά">💵 Μετρητά</option>
                <option value="Κάρτα">💳 Κάρτα / POS</option>
                <option value="Κατάθεση">🏦 Τραπεζική Κατάθεση</option>
              </select>
            </div>

            {/* Κατάσταση */}
            <div>
              <label className="block text-[11px] text-slate-300 mb-1 font-medium">Κατάσταση</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Εκκρεμεί">Εκκρεμεί</option>
                <option value="Εξοφλημένο">Εξοφλημένο</option>
                <option value="Καθυστερημένο">Καθυστερημένο</option>
              </select>
            </div>

            {/* Περαιτέρω Ανάλυση */}
            <div>
              <label className="block text-[11px] text-slate-300 mb-1 font-medium">Περαιτέρω Ανάλυση / Αιτιολογία</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="e.g. Δίδακτρα Ιουνίου" 
                className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none" 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#00966d] hover:bg-[#00825d] text-white font-semibold text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
            >
              Αποθήκευση Πληρωμής
            </button>
          </form>
        </div>

      </div>
    </WorkspaceShell>
  );
}