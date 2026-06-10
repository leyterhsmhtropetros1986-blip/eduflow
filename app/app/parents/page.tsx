"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { 
  Users, 
  UserPlus, 
  Phone, 
  Mail, 
  User, 
  MessageSquare, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function ParentHub() {
  const [mounted, setMounted] = useState(false);
  const [parents, setParents] = useState<any[]>([
    { id: "1", name: "Ανδρέας Παπαδόπουλος", student: "Γιάννης Παπαδόπουλος", relation: "Πατέρας", phone: "6912345678", email: "andreas@example.com" },
    { id: "2", name: "Ελένη Κωνσταντίνου", student: "Μαρία Κωνσταντίνου", relation: "Μητέρα", phone: "6987654321", email: "eleni.parent@example.com" }
  ]);
  
  // Φόρμα Γονέα
  const [name, setName] = useState("");
  const [student, setStudent] = useState("");
  const [relation, setRelation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => { setMounted(true); }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Έλεγχος υποχρεωτικών πεδίων (Το τηλέφωνο είναι πλέον αυστηρά υποχρεωτικό για τα notifications)
    if (!name || !student || !phone) {
      alert("⚠️ Τα πεδία: Ονοματεπώνυμο, Μαθητής και Κινητό Τηλέφωνο είναι υποχρεωτικά!");
      return;
    }

    // Απλό validation ελληνικού κινητού
    if (phone.length < 10) {
      alert("⚠️ Παρακαλώ εισάγετε ένα έγκυρο κινητό τηλέφωνο (τουλάχιστον 10 ψηφία) για τη λήψη Push Notifications.");
      return;
    }

    const newParent = {
      id: Date.now().toString(),
      name,
      student,
      relation: relation || "Κηδεμόνας",
      phone,
      email: email || "Δεν ορίστηκε"
    };

    setParents([...parents, newParent]);
    setName(""); setStudent(""); setRelation(""); setPhone(""); setEmail("");
    alert("✅ Ο γονέας/κηδεμόνας καταχωρήθηκε με επιτυχία!");
  };

  return (
    <WorkspaceShell 
      title="Πύλη Γονέων & Κηδεμόνων" 
      description="Διαχείριση στοιχείων επικοινωνίας. Το κινητό τηλέφωνο είναι υποχρεωτικό για την επιτυχή παράδοση των Live Push Notifications."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-20">
        
        {/* ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ ΓΟΝΕΑ */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><UserPlus className="w-5 h-5" /></div>
              <h3 className="text-lg font-bold text-white">Σύνδεση Νέου Γονέα</h3>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-300 font-medium leading-relaxed">
                Η εισαγωγή έγκυρου αριθμού κινητού είναι απαραίτητη. Το σύστημα χρησιμοποιεί το Service Workers Web Push API για άμεση παράδοση ειδοποιήσεων στην αρχική οθόνη της συσκευής.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1 mb-1.5">
                  Ονοματεπώνυμο Γονέα <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="π.χ. Ανδρέας Παπαδόπουλος"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1 mb-1.5">
                  Ονοματεπώνυμο Μαθητή <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" value={student} onChange={(e) => setStudent(e.target.value)}
                  placeholder="π.χ. Γιάννης Παπαδόπουλος"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-200 mb-1.5 block">Σχέση/Συγγένεια</label>
                  <select 
                    value={relation} onChange={(e) => setRelation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition"
                  >
                    <option value="">Επιλέξτε</option>
                    <option value="Πατέρας">Πατέρας</option>
                    <option value="Μητέρα">Μητέρα</option>
                    <option value="Κηδεμόνας">Κηδεμόνας</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1 mb-1.5">
                    Κινητό (SMS/Push) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="69XXXXXXXX"
                    className="w-full bg-slate-950 border border-emerald-900/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 mb-1.5 block">Email Επικοινωνίας</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-bold transition shadow-xl shadow-indigo-600/20 pt-2.5">
                Ενεργοποίηση Πρόσβασης Γονέα
              </button>
            </form>
          </div>
        </div>

        {/* ΛΙΣΤΑ ΕΠΑΦΩΝ ΓΟΝΕΩΝ */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Επαφές & Κατάσταση Ειδοποιήσεων
              </h3>
              <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-3 py-1 rounded-full">
                {parents.length} Συνδεδεμένοι Γονείς
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <th className="pb-3 font-bold">Γονέας / Σχέση</th>
                    <th className="pb-3 font-bold">Μαθητής</th>
                    <th className="pb-3 font-bold">Κινητό Τηλέφωνο</th>
                    <th className="pb-3 font-bold">Κανάλι Push</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {parents.map((p) => (
                    <tr key={p.id} className="group hover:bg-slate-800/10 transition">
                      <td className="py-4">
                        <div>
                          <div className="text-sm font-bold text-white">{p.name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <span className="px-1.5 py-0.2 bg-slate-800 rounded text-[10px] text-indigo-300 font-medium">
                              {p.relation}
                            </span>
                            <span>• {p.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm font-medium text-slate-200 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {p.student}
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 opacity-70" /> {p.phone}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" /> Έτοιμο για Push
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ΓΡΗΓΟΡΕΣ ΕΝΕΡΓΕΙΕΣ / ΚΕΝΤΡΟ ΜΗΝΥΜΑΤΩΝ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition">
              <MessageSquare className="w-5 h-5 text-indigo-400 mb-2" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Κέντρο Μηνυμάτων</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Άμεση αποστολή updates για επικείμενες συνεδρίες και απουσίες.</p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition">
              <User className="w-5 h-5 text-emerald-400 mb-2" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Πρόοδος Μαθητή</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Αυτόματη σύνδεση των βαθμών με τα προφίλ των πιστοποιημένων γονέων.</p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition">
              <ShieldCheck className="w-5 h-5 text-purple-400 mb-2" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Ασφάλεια Push</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Κρυπτογραφημένα payloads επικοινωνίας μέσω Web Push προτύπων.</p>
            </div>
          </div>
        </div>

      </div>
    </WorkspaceShell>
  );
}