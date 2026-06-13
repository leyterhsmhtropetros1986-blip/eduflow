"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { UserCircle, Key, Copy, MessageSquare, RefreshCw, Search, ExternalLink } from "lucide-react";

interface Parent { id: string; name: string; phone: string; email: string; pin: string; studentIds: string[]; }

// Παραγωγή 6ψήφιου PIN
const genPin = () => String(Math.floor(100000 + Math.random() * 900000));
const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");
const waNumber = (p: string) => { const d = onlyDigits(p); return d.startsWith("30") ? d : "30" + d; };

export default function ParentsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setIsMounted(true);
    syncFromStudents();
  }, []);

  // Αυτο-συγχρονισμός: για κάθε μοναδικό τηλέφωνο/όνομα γονέα από τους μαθητές, φτιάχνει εγγραφή Parent με PIN
  const syncFromStudents = () => {
    const sts = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    setStudents(sts);
    const existing: Parent[] = JSON.parse(localStorage.getItem("eduflow_parents") || "[]");
    const byPhone: Record<string, Parent> = {}; existing.forEach((p) => { if (p.phone) byPhone[onlyDigits(p.phone)] = { ...p, studentIds: [] }; });

    sts.forEach((s: any) => {
      const phone = onlyDigits(s.parentPhone || ""); if (!phone) return;
      if (!byPhone[phone]) {
        byPhone[phone] = { id: "p-" + phone, name: s.parentName || `Γονέας ${s.lastName}`, phone: s.parentPhone || "", email: s.parentEmail || "", pin: genPin(), studentIds: [] };
      }
      // ενημέρωση email/ονόματος αν λείπει
      if (!byPhone[phone].email && s.parentEmail) byPhone[phone].email = s.parentEmail;
      if (!byPhone[phone].name && s.parentName) byPhone[phone].name = s.parentName;
      byPhone[phone].studentIds.push(s.id);
    });
    const arr = Object.values(byPhone).sort((a, b) => (a.name || "").localeCompare(b.name || "", "el"));
    setParents(arr);
    localStorage.setItem("eduflow_parents", JSON.stringify(arr));
  };

  const regeneratePin = (id: string) => {
    if (!confirm("Νέο PIN; Το παλιό δεν θα δουλεύει πια.")) return;
    const next = parents.map((p) => p.id === id ? { ...p, pin: genPin() } : p);
    setParents(next); localStorage.setItem("eduflow_parents", JSON.stringify(next));
  };

  const portalLink = typeof window !== "undefined" ? `${window.location.origin}/portal` : "/portal";

  const copyAccess = (p: Parent) => {
    const text = `Σύνδεση στο EduFlow:\n${portalLink}\n📱 Τηλέφωνο: ${p.phone}\n🔑 PIN: ${p.pin}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(p.id); setTimeout(() => setCopied(""), 2000); });
  };

  const smsLink = (p: Parent) => {
    const msg = `Σύνδεση EduFlow: ${portalLink} | Τηλ: ${p.phone} | PIN: ${p.pin}`;
    return `sms:${onlyDigits(p.phone)}?body=${encodeURIComponent(msg)}`;
  };

  const waLink = (p: Parent) => {
    const msg = `Σύνδεση στο EduFlow 📚\n${portalLink}\nΤηλέφωνο: ${p.phone}\nPIN: *${p.pin}*`;
    return `https://wa.me/${waNumber(p.phone)}?text=${encodeURIComponent(msg)}`;
  };

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return parents.filter((p) => !q || `${p.name} ${p.phone} ${p.email}`.toLowerCase().includes(q));
  }, [parents, search]);

  const studentNamesOf = (p: Parent) => p.studentIds.map((id) => {
    const s = students.find((x) => x.id === id);
    return s ? `${s.lastName} ${s.firstName}` : null;
  }).filter(Boolean).join(", ");

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Γονείς & Πύλη Πρόσβασης" description="Κάθε γονέας έχει PIN για να μπει στην πύλη του (/portal) και να δει τα παιδιά του.">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Σύνολο Γονέων</p>
          <p className="text-3xl font-black text-white mt-1">{parents.length}</p>
        </div>
        <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Με Email</p>
          <p className="text-3xl font-black text-emerald-400 mt-1">{parents.filter((p) => p.email).length}</p>
        </div>
        <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Σύνδεσμος Πύλης</p>
          <a href={portalLink} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-xs font-mono break-all flex items-center gap-1 mt-2">{portalLink} <ExternalLink size={11} /></a>
        </div>
      </div>

      <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Αναζήτηση γονέα..." className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 pl-9 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
        </div>
        <button onClick={syncFromStudents} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"><RefreshCw size={14} /> Συγχρονισμός</button>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">Δεν υπάρχουν γονείς. Προστίθενται αυτόματα όταν καταχωρείς μαθητές με στοιχεία γονέα.</div>
      ) : (
        <div className="space-y-2">
          {visible.map((p) => (
            <div key={p.id} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-indigo-950/50 border border-indigo-900/40 rounded-xl flex items-center justify-center shrink-0"><UserCircle size={20} className="text-indigo-400" /></div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{p.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">📱 {p.phone || "—"} {p.email && `· ✉ ${p.email}`}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">👶 {studentNamesOf(p) || "Κανένα παιδί"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-[#0b0e14] border border-indigo-900/40 rounded-xl px-3 py-2">
                  <p className="text-[9px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1"><Key size={10} /> PIN</p>
                  <p className="text-lg font-black text-white font-mono tracking-widest">{p.pin}</p>
                </div>
                <button onClick={() => regeneratePin(p.id)} title="Νέο PIN" className="text-slate-500 hover:text-amber-400"><RefreshCw size={14} /></button>
              </div>

              <div className="flex gap-2 shrink-0">
                <button onClick={() => copyAccess(p)} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5" title="Αντιγραφή στοιχείων"><Copy size={12} /> {copied === p.id ? "✓" : "Αντιγραφή"}</button>
                {p.phone && <a href={smsLink(p)} className="bg-amber-950/40 hover:bg-amber-950/60 border border-amber-900/50 text-amber-400 px-3 py-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5" title="SMS"><MessageSquare size={12} /> SMS</a>}
                {p.phone && <a href={waLink(p)} target="_blank" rel="noreferrer" className="bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-900/50 text-emerald-400 px-3 py-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5" title="WhatsApp"><MessageSquare size={12} /> WA</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}
