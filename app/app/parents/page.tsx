"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { Users, UserPlus, Trash2, Save } from "lucide-react";

export default function ParentsPage() {
  const [parents, setParents] = useState<any[]>([]);
  const [parentName, setParentName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [relation, setRelation] = useState("Πατέρας");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [targetSubject, setTargetSubject] = useState("Μαθηματικά");

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_parents");
    if (stored) {
      setParents(JSON.parse(stored));
    } else {
      const defaults = [
        { id: "1", parentName: "Ανδρέας Παπαδόπουλος", studentName: "Γιάννης Παπαδόπουλος", relation: "Πατέρας", email: "andreas@example.com", phone: "6971234567", targetSubject: "Μαθηματικά" },
        { id: "2", parentName: "Ελένη Κωνσταντίνου", studentName: "Μαρία Κωνσταντίνου", relation: "Μητέρα", email: "eleni.parent@example.com", phone: "6987654321", targetSubject: "Φυσική" }
      ];
      setParents(defaults);
      localStorage.setItem("eduflow_parents", JSON.stringify(defaults));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName || !studentName || !phone) return;

    const newParent = {
      id: Date.now().toString(),
      parentName,
      studentName,
      relation,
      email: email || "parent@example.com",
      phone,
      targetSubject
    };

    const updated = [...parents, newParent];
    setParents(updated);
    localStorage.setItem("eduflow_parents", JSON.stringify(updated));

    setParentName("");
    setStudentName("");
    setEmail("");
    setPhone("");
  };

  const handleDelete = (id: string) => {
    const updated = parents.filter(p => p.id !== id);
    setParents(updated);
    localStorage.setItem("eduflow_parents", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell title="Πύλη Γονέων" description="Διαχειριστείτε τα στοιχεία κηδεμόνων και στείλτε αυτόματα μηνύματα για την πρόοδο των μαθητών.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Επαφές Γονέων
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Γονέας</th>
                  <th className="pb-3">Μαθητής</th>
                  <th className="pb-3">Σχέση</th>
                  <th className="pb-3">Επικοινωνία</th>
                  <th className="pb-3">Αντικείμενο</th>
                  <th className="pb-3 text-right">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {parents.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/20">
                    <td className="py-3 font-semibold text-white">{p.parentName}</td>
                    <td className="py-3 text-slate-300">{p.studentName}</td>
                    <td className="py-3 text-slate-400">{p.relation}</td>
                    <td className="py-3 font-mono">
                      <div>{p.email}</div>
                      <div className="text-slate-500 text-[10px]">{p.phone}</div>
                    </td>
                    <td className="py-3 text-emerald-400 font-medium">{p.targetSubject}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-2xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-400" /> Σύνδεση Γονέα - Μαθητή
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Ονοματεπώνυμο Γονέα *</label>
              <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none" required />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Ονοματεπώνυμο Μαθητή *</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Σχέση</label>
                <select value={relation} onChange={(e) => setRelation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white">
                  <option value="Πατέρας">Πατέρας</option>
                  <option value="Μητέρα">Μητέρα</option>
                  <option value="Κηδεμόνας">Κηδεμόνας</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">Στόχος Μάθημα</label>
                <input type="text" value={targetSubject} onChange={(e) => setTargetSubject(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Email Κηδεμόνα</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Κινητό Τηλέφωνο (για SMS) *</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="69xxxxxxxx" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white" required />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-1.5">
              <Save className="w-4 h-4" /> Αποθήκευση Σύνδεσης
            </button>
          </form>
        </div>

      </div>
    </WorkspaceShell>
  );
}