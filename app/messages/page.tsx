"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Mail, MessageSquare, Phone, Search, Users, Send } from "lucide-react";

const GRADES = ["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"];

// Πρότυπα μηνυμάτων — {student} & {parent} αντικαθίστανται ανά παραλήπτη
const TEMPLATES = [
  {
    id: "absence",
    label: "Απουσία",
    subject: "Ειδοποίηση απουσίας",
    body: "Αγαπητέ/ή {parent},\nσας ενημερώνουμε ότι ο/η {student} απουσίασε σήμερα από το μάθημα. Παρακαλούμε επικοινωνήστε μαζί μας για οποιαδήποτε διευκρίνιση.\n\nΜε εκτίμηση,\nΤη Γραμματεία",
  },
  {
    id: "schedule",
    label: "Αλλαγή προγράμματος",
    subject: "Αλλαγή προγράμματος",
    body: "Αγαπητέ/ή {parent},\nσας ενημερώνουμε για αλλαγή στο πρόγραμμα του/της {student}. Παρακαλούμε δείτε το νέο ωρολόγιο πρόγραμμα.\n\nΜε εκτίμηση,\nΤη Γραμματεία",
  },
  {
    id: "payment",
    label: "Υπενθύμιση πληρωμής",
    subject: "Υπενθύμιση πληρωμής διδάκτρων",
    body: "Αγαπητέ/ή {parent},\nσας υπενθυμίζουμε ότι εκκρεμεί η πληρωμή των διδάκτρων για τον/την {student}. Σας ευχαριστούμε για τη συνεργασία.\n\nΜε εκτίμηση,\nΤη Γραμματεία",
  },
  {
    id: "announcement",
    label: "Γενική ανακοίνωση",
    subject: "Ανακοίνωση",
    body: "Αγαπητέ/ή {parent},\nθα θέλαμε να σας ενημερώσουμε ότι...\n\nΜε εκτίμηση,\nΤη Γραμματεία",
  },
  { id: "custom", label: "Δικό μου κείμενο", subject: "", body: "" },
];

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");
const waNumber = (phone: string) => { const d = onlyDigits(phone); return d.startsWith("30") ? d : "30" + d; };

export default function MessagesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [templateId, setTemplateId] = useState("absence");
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [singleId, setSingleId] = useState("");

  useEffect(() => {
    setIsMounted(true);
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
  }, []);

  const pickTemplate = (id: string) => {
    setTemplateId(id);
    const t = TEMPLATES.find((x) => x.id === id);
    if (t && id !== "custom") { setSubject(t.subject); setBody(t.body); }
  };

  const render = (text: string, s: any) =>
    text.replace(/{student}/g, `${s.firstName || ""} ${s.lastName || ""}`.trim())
        .replace(/{parent}/g, s.parentName || "γονέα");

  const gradeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    students.forEach((s) => { m[s.grade] = (m[s.grade] || 0) + 1; });
    return m;
  }, [students]);

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return [...students]
      .sort((a, b) => (a.lastName || "").localeCompare(b.lastName || "", "el"))
      .filter((s) => {
        if (gradeFilter && s.grade !== gradeFilter) return false;
        if (!q) return true;
        return `${s.lastName} ${s.firstName}`.toLowerCase().includes(q) || (s.parentName || "").toLowerCase().includes(q);
      });
  }, [students, search, gradeFilter]);

  // Μαζικό email (BCC) σε όσους φαίνονται & έχουν email
  const bulkEmails = useMemo(() => visible.map((s) => s.parentEmail).filter(Boolean), [visible]);
  const bulkMailto = `mailto:?bcc=${encodeURIComponent(bulkEmails.join(","))}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/{student}/g, "").replace(/{parent}/g, "γονείς"))}`;

  // Γονείς με email — για μεμονωμένο email (ονοματεπώνυμο — email)
  const parentOptions = useMemo(() => [...students]
    .filter((s) => s.parentEmail)
    .sort((a, b) => (a.parentName || a.lastName || "").localeCompare(b.parentName || b.lastName || "", "el"))
    .map((s) => ({ id: s.id, label: `${s.parentName || `Γονέας ${s.lastName}`} — ${s.parentEmail}`, student: s })), [students]);

  const singleStudent = students.find((s) => s.id === singleId);
  const singleMailto = singleStudent
    ? `mailto:${singleStudent.parentEmail}?subject=${encodeURIComponent(render(subject, singleStudent))}&body=${encodeURIComponent(render(body, singleStudent))}`
    : "";

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Επικοινωνία με Γονείς" description="Στείλε Email / SMS / WhatsApp με ένα κλικ. Ανοίγει το δικό σου πρόγραμμα προσυμπληρωμένο — πατάς εσύ «αποστολή».">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">

        {/* ΑΡΙΣΤΕΡΑ: ΣΥΝΘΕΣΗ ΜΗΝΥΜΑΤΟΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-5 rounded-3xl h-fit shadow-xl space-y-4 lg:sticky lg:top-28">
          <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-800 pb-3 tracking-wider"><Send size={14} /> Σύνθεση Μηνύματος</h3>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Πρότυπο</label>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => pickTemplate(t.id)} className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition ${templateId === t.id ? "bg-indigo-600 text-white border-indigo-500" : "bg-[#0b0e14] text-slate-400 border-slate-800 hover:text-white"}`}>{t.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Θέμα (για email)</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Κείμενο</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none leading-relaxed" />
            <p className="text-[10px] text-slate-500 mt-1.5">Μεταβλητές: <span className="text-indigo-400 font-mono">{"{student}"}</span> = όνομα μαθητή, <span className="text-indigo-400 font-mono">{"{parent}"}</span> = όνομα γονέα.</p>
          </div>

          <a href={bulkMailto} className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition ${bulkEmails.length ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-900 text-slate-600 pointer-events-none"}`}>
            <Mail size={14} /> Email σε όλους ({bulkEmails.length}) — BCC
          </a>
          <p className="text-[10px] text-slate-500 -mt-2">Το μαζικό email στέλνεται χωρίς προσωποποίηση ({"{student}"} αφαιρείται).</p>

          {/* ΜΕΜΟΝΩΜΕΝΟ EMAIL */}
          <div className="border-t border-slate-800 pt-4 space-y-2">
            <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5"><Mail size={12} /> Μεμονωμένο Email</label>
            <select value={singleId} onChange={(e) => setSingleId(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer">
              <option value="">Επίλεξε γονέα...</option>
              {parentOptions.length === 0 ? <option value="" disabled>— Κανένας γονέας με email —</option> : parentOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            {singleStudent && (
              <p className="text-[10px] text-slate-500">Προς: <span className="text-slate-300">{singleStudent.parentName}</span> · μαθητής/τρια: <span className="text-slate-300">{singleStudent.firstName} {singleStudent.lastName}</span></p>
            )}
            <a href={singleMailto || undefined} className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition ${singleStudent ? "bg-indigo-600 hover:bg-indigo-500 text-white" : "bg-slate-900 text-slate-600 pointer-events-none"}`}>
              <Send size={14} /> Αποστολή ατομικού email
            </a>
          </div>
        </div>

        {/* ΔΕΞΙΑ: ΛΙΣΤΑ ΠΑΡΑΛΗΠΤΩΝ */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Αναζήτηση μαθητή ή γονέα..." className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 pl-9 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setGradeFilter("")} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${gradeFilter === "" ? "bg-indigo-600 text-white border-indigo-500" : "bg-[#0b0e14] text-slate-400 border-slate-800 hover:text-white"}`}>Όλοι ({students.length})</button>
              {GRADES.filter((g) => gradeCounts[g]).map((g) => (
                <button key={g} onClick={() => setGradeFilter(g)} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${gradeFilter === g ? "bg-indigo-600 text-white border-indigo-500" : "bg-[#0b0e14] text-slate-400 border-slate-800 hover:text-white"}`}>{g} ({gradeCounts[g]})</button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-2">
              <Users size={22} className="text-slate-700" /><span>{students.length === 0 ? "Δεν υπάρχουν μαθητές." : "Κανένα αποτέλεσμα."}</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
              {visible.map((s) => {
                const msg = render(body, s);
                const subj = render(subject, s);
                const email = s.parentEmail;
                const phone = s.parentPhone || s.phone;
                const mailto = email ? `mailto:${email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(msg)}` : null;
                const smsto = phone ? `sms:${onlyDigits(phone)}?body=${encodeURIComponent(msg)}` : null;
                const wa = phone ? `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(msg)}` : null;
                return (
                  <div key={s.id} className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white text-xs font-bold">{s.lastName} {s.firstName} <span className="text-slate-500 font-normal">· {s.grade}</span></p>
                      <p className="text-[11px] text-slate-400 truncate">👨‍👩‍👦 {s.parentName || "—"} · {phone || "χωρίς τηλ."} · {email || "χωρίς email"}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a href={mailto || undefined} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold border transition ${mailto ? "bg-sky-950/40 border-sky-900/50 text-sky-400 hover:bg-sky-950" : "bg-slate-900 border-slate-800 text-slate-600 pointer-events-none"}`} title="Email"><Mail size={13} /> Email</a>
                      <a href={smsto || undefined} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold border transition ${smsto ? "bg-amber-950/40 border-amber-900/50 text-amber-400 hover:bg-amber-950" : "bg-slate-900 border-slate-800 text-slate-600 pointer-events-none"}`} title="SMS"><Phone size={13} /> SMS</a>
                      <a href={wa || undefined} target="_blank" rel="noreferrer" className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold border transition ${wa ? "bg-emerald-950/40 border-emerald-900/50 text-emerald-400 hover:bg-emerald-950" : "bg-slate-900 border-slate-800 text-slate-600 pointer-events-none"}`} title="WhatsApp"><MessageSquare size={13} /> WhatsApp</a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
