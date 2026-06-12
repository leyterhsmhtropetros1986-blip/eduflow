"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import {
  UserPlus, Phone, Mail, Trash2, CheckCircle2, AlertTriangle,
  Search, Calendar, MessageSquare, Clock, ListTodo, BarChart3, Users, X
} from "lucide-react";

const PIPELINE_STATUSES = [
  { id: "Νέος", color: "border-t-sky-500 bg-sky-950/20 text-sky-400" },
  { id: "Επικοινωνία", color: "border-t-purple-500 bg-purple-950/20 text-purple-400" },
  { id: "Ραντεβού", color: "border-t-indigo-500 bg-indigo-950/20 text-indigo-400" },
  { id: "Δοκιμαστικό", color: "border-t-amber-500 bg-amber-950/20 text-amber-400" },
  { id: "Προσφορά", color: "border-t-pink-500 bg-pink-950/20 text-pink-400" },
  { id: "Εγγραφή", color: "border-t-emerald-500 bg-emerald-950/20 text-emerald-400" },
  { id: "Χάθηκε", color: "border-t-rose-500 bg-rose-950/20 text-rose-400" }
];

const SOURCES = ["Website", "Facebook", "Instagram", "Google", "TikTok", "Σύσταση", "Flyer", "Walk-in", "Άλλο"];
const DEFAULT_LESSONS = ["Μαθηματικά", "Φυσική", "Χημεία", "Έκθεση", "Βιολογία", "Πληροφορική", "Αρχαία"];

interface TaskItem { id: string; text: string; done: boolean; }
interface LogItem { id: string; timestamp: string; text: string; }

interface Lead {
  id: number;
  name: string; phone: string; email: string; grade: string;
  parentName: string; parentPhone: string; parentType: string;
  source: string; priority: number; status: string; notes: string;
  followUpDate: string; followUpTime: string;
  interestedLessons: string[]; tags: string[];
  tasks: TaskItem[]; timeline: LogItem[]; createdAt: string;
}

// Κατάσταση follow-up σε σχέση με σήμερα
const followUpState = (dateStr: string): "overdue" | "today" | "upcoming" | null => {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  if (isNaN(d.getTime())) return null;
  if (d < today) return "overdue";
  if (d.getTime() === today.getTime()) return "today";
  return "upcoming";
};

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [lessonsOptions, setLessonsOptions] = useState<string[]>(DEFAULT_LESSONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("Όλα");
  const [isDuplicateAlert, setIsDuplicateAlert] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [grade, setGrade] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentType, setParentType] = useState("Μητέρα");
  const [source, setSource] = useState("Facebook");
  const [priority, setPriority] = useState(2);
  const [status, setStatus] = useState("Νέος");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [interestedLessons, setInterestedLessons] = useState<string[]>([]);
  const [rawTags, setRawTags] = useState("");

  useEffect(() => {
    setLeads(JSON.parse(localStorage.getItem("eduflow_crm_leads") || "[]"));
    // Πραγματικά μαθήματα από το σύστημα
    const rawLessons = JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]");
    const names = (rawLessons as any[]).map((l) => (typeof l === "string" ? l : l?.name)).filter(Boolean);
    if (names.length) setLessonsOptions(names);
  }, []);

  useEffect(() => {
    if (phone.trim().length >= 10) {
      setIsDuplicateAlert(leads.some((l) => l.phone.trim() === phone.trim()));
    } else setIsDuplicateAlert(false);
  }, [phone, leads]);

  const toggleLesson = (lesson: string) => {
    setInterestedLessons((prev) => (prev.includes(lesson) ? prev.filter((l) => l !== lesson) : [...prev, lesson]));
  };

  const persist = (updated: Lead[]) => {
    setLeads(updated);
    localStorage.setItem("eduflow_crm_leads", JSON.stringify(updated));
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    const timestamp = new Date().toLocaleString("el-GR", { hour: "2-digit", minute: "2-digit" });
    const dateStamp = new Date().toLocaleDateString("el-GR");
    const parsedTags = rawTags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (t.startsWith("#") ? t : `#${t}`));

    const newLeadItem: Lead = {
      id: Date.now(),
      name: name.trim(), phone: phone.trim(), email: email.trim(), grade,
      parentName: parentName.trim(), parentPhone: parentPhone.trim() || phone.trim(), parentType,
      source, priority, status, notes: notes.trim(), followUpDate, followUpTime,
      interestedLessons, tags: parsedTags,
      tasks: [
        { id: `t1-${Date.now()}`, text: "Να καλέσω για follow-up", done: false },
        { id: `t2-${Date.now()}`, text: "Να στείλω πρόγραμμα & κόστος", done: false },
        { id: `t3-${Date.now()}`, text: "Κλείσιμο ραντεβού", done: false },
      ],
      timeline: [{ id: `l1-${Date.now()}`, timestamp: `${dateStamp} ${timestamp}`, text: "Lead δημιουργήθηκε στο σύστημα." }],
      createdAt: dateStamp,
    };

    persist([newLeadItem, ...leads]);
    setName(""); setPhone(""); setEmail(""); setGrade(""); setParentName(""); setParentPhone("");
    setParentType("Μητέρα"); setSource("Facebook"); setPriority(2); setStatus("Νέος");
    setNotes(""); setFollowUpDate(""); setFollowUpTime(""); setInterestedLessons([]); setRawTags("");
  };

  const updateStatus = (leadId: number, nextStatus: string) => {
    const stamp = `${new Date().toLocaleDateString("el-GR")} ${new Date().toLocaleString("el-GR", { hour: "2-digit", minute: "2-digit" })}`;
    persist(leads.map((l) => l.id === leadId ? { ...l, status: nextStatus, timeline: [...l.timeline, { id: `l-${Date.now()}`, timestamp: stamp, text: `Μετακίνηση στο στάδιο: ${nextStatus}` }] } : l));
  };

  const toggleTask = (leadId: number, taskId: string) => {
    persist(leads.map((l) => l.id === leadId ? { ...l, tasks: l.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t) } : l));
  };

  const deleteLead = (id: number) => {
    if (confirm("Θέλετε να διαγράψετε οριστικά αυτό το Lead;")) persist(leads.filter((l) => l.id !== id));
  };

  const convertToStudent = (lead: Lead) => {
    if (!confirm(`Θέλετε να μετατρέψετε τον/την ${lead.name} σε επίσημο μαθητή;`)) return;
    const currentStudents = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const nameParts = lead.name.trim().split(/\s+/);
    const lastName = nameParts[0] || "";
    const firstName = nameParts.slice(1).join(" ") || lead.name;

    const dupe = currentStudents.some((s: any) => `${s.lastName} ${s.firstName}`.trim().toLowerCase() === `${lastName} ${firstName}`.trim().toLowerCase());
    if (dupe && !confirm("Υπάρχει ήδη μαθητής με αυτό το όνομα. Να συνεχίσω;")) return;

    const newStudent = {
      id: `s-converted-${Date.now()}`,
      createdAt: new Date().toISOString(),
      firstName, lastName,
      grade: lead.grade || "Α Λυκείου",
      phone: lead.phone,
      parentName: lead.parentName || `${lead.name} (Γονέας)`,
      parentPhone: lead.parentPhone,
      parentEmail: lead.email,
      enrollments: lead.interestedLessons.map((lesson) => ({ lessonName: lesson, className: "" })),
      isLockedHours: false, lockedSlots: [], availability: [],
    };

    localStorage.setItem("eduflow_students", JSON.stringify([...currentStudents, newStudent]));
    updateStatus(lead.id, "Εγγραφή");
    alert(`🎉 Επιτυχής μετατροπή! Ο/Η ${lead.name} προστέθηκε στο Μαθητολόγιο. Πήγαινε στους Μαθητές για να ορίσεις τμήματα.`);
  };

  const stats = useMemo(() => {
    const total = leads.length;
    const converted = leads.filter((l) => l.status === "Εγγραφή").length;
    const lost = leads.filter((l) => l.status === "Χάθηκε").length;
    return { total, active: total - converted - lost, converted, lost, rate: total > 0 ? Math.round((converted / total) * 100) : 0 };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return leads
      .filter((l) => {
        const matchesSearch = l.name.toLowerCase().includes(q) || l.phone.includes(searchQuery) || l.email.toLowerCase().includes(q) || l.parentName.toLowerCase().includes(q);
        const matchesStatus = selectedStatusFilter === "Όλα" || l.status === selectedStatusFilter;
        return matchesSearch && matchesStatus;
      })
      // Εκπρόθεσμα/σημερινά follow-ups πρώτα, μετά προτεραιότητα
      .sort((a, b) => {
        const w = (l: Lead) => (followUpState(l.followUpDate) === "overdue" ? 2 : followUpState(l.followUpDate) === "today" ? 1 : 0);
        return (w(b) - w(a)) || (b.priority - a.priority);
      });
  }, [leads, searchQuery, selectedStatusFilter]);

  return (
    <WorkspaceShell title="CRM & Sales Pipeline" description="Διαχείριση leads, follow-ups, πηγών και αυτόματης μετατροπής σε μαθητές.">

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-4 mb-6">
        <StatCard icon={<Users size={18}/>} cls="bg-indigo-950/60 text-indigo-400" label="Συνολικά Leads" value={stats.total} />
        <StatCard icon={<Clock size={18}/>} cls="bg-purple-950/60 text-purple-400" label="Ενεργά" value={stats.active} />
        <StatCard icon={<CheckCircle2 size={18}/>} cls="bg-emerald-950/60 text-emerald-400" label="Εγγραφές 🟢" value={stats.converted} />
        <StatCard icon={<X size={18}/>} cls="bg-rose-950/60 text-rose-400" label="Χάθηκαν 🔴" value={stats.lost} />
        <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md col-span-2 md:col-span-1">
          <div className="p-2 bg-amber-950/60 text-amber-400 rounded-xl"><BarChart3 size={18}/></div>
          <div><p className="text-[10px] uppercase font-bold text-slate-500">Conversion Rate</p><h3 className="text-amber-400 font-black text-lg">{stats.rate}%</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 px-4">

        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-5 rounded-3xl h-fit shadow-xl space-y-4">
          <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-800 pb-3 tracking-wider"><UserPlus size={14} /> Νέος Υποψήφιος (Lead)</h3>

          <form onSubmit={handleAddLead} className="space-y-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Ονοματεπώνυμο Μαθητή *</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="π.χ. Παπαδόπουλος Γιώργος" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Τηλέφωνο *</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="69..." className={`w-full bg-[#0b0e14] border p-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none ${isDuplicateAlert ? "border-rose-500 bg-rose-950/10" : "border-slate-800"}`} />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Τάξη *</label>
                <select required value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white focus:border-indigo-500 outline-none cursor-pointer">
                  <option value="">Επιλογή...</option>
                  {["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {isDuplicateAlert && <p className="text-rose-400 text-[10px] flex items-center gap-1 font-bold bg-rose-950/20 p-2 rounded border border-rose-900/30"><AlertTriangle size={12}/> Υπάρχει ήδη Lead με αυτό το τηλέφωνο!</p>}

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="test@gmail.com" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none" />
            </div>

            <div className="bg-[#0b0e14]/50 p-3 rounded-xl border border-slate-800/60 space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Στοιχεία Γονέα</label>
                <select value={parentType} onChange={(e) => setParentType(e.target.value)} className="bg-[#1e2330] text-[9px] text-slate-300 border border-slate-800 p-0.5 rounded outline-none">
                  <option value="Μητέρα">Μητέρα</option><option value="Πατέρας">Πατέρας</option><option value="Άλλο">Άλλο</option>
                </select>
              </div>
              <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Ονοματεπώνυμο Γονέα" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded-lg text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none" />
              <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="Τηλέφωνο Γονέα" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded-lg text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Μαθήματα Ενδιαφέροντος</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto border border-slate-800/80 p-2 rounded-xl bg-[#0b0e14]">
                {lessonsOptions.map((lesson) => (
                  <label key={lesson} className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none">
                    <input type="checkbox" checked={interestedLessons.includes(lesson)} onChange={() => toggleLesson(lesson)} className="accent-indigo-600 rounded" />
                    {lesson}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Πηγή</label>
                <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded-xl text-xs text-white focus:border-indigo-500 outline-none cursor-pointer">{SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Προτεραιότητα</label>
                <select value={priority} onChange={(e) => setPriority(Number(e.target.value))} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded-xl text-xs text-white focus:border-indigo-500 outline-none cursor-pointer">
                  <option value={1}>⭐ Low</option><option value={2}>⭐⭐ Medium</option><option value={3}>⭐⭐⭐ High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Αρχικό Στάδιο</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded-xl text-xs text-white focus:border-indigo-500 outline-none cursor-pointer">{PIPELINE_STATUSES.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}</select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Tags (με κόμμα)</label>
                <input type="text" value={rawTags} onChange={(e) => setRawTags(e.target.value)} placeholder="πανελλαδικές, ιδιαίτερο" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none" />
              </div>
            </div>

            <div className="bg-[#0b0e14]/40 p-2.5 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-[10px] text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1"><Calendar size={11}/> Επόμενο Follow-up</label>
              <div className="grid grid-cols-2 gap-1.5">
                <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="bg-[#0b0e14] text-[10px] text-white p-1 rounded border border-slate-800" />
                <input type="time" value={followUpTime} onChange={(e) => setFollowUpTime(e.target.value)} className="bg-[#0b0e14] text-[10px] text-white p-1 rounded border border-slate-800" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Σημειώσεις</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Θέλει απογευματινά, πακέτο..." rows={2} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none resize-none" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg">Εισαγωγή στο Pipeline</button>
          </form>
        </div>

        {/* PIPELINE */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-md">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
              <input type="text" placeholder="Αναζήτηση (όνομα, τηλ, γονέα)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none" />
            </div>
            <div className="flex gap-2 items-center w-full sm:w-auto overflow-x-auto">
              <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Φίλτρο Σταδίου:</span>
              <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded-xl text-xs text-white outline-none cursor-pointer">
                <option value="Όλα">Όλα τα στάδια</option>
                {PIPELINE_STATUSES.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-20 text-slate-600 text-xs border border-dashed border-slate-800 rounded-3xl bg-[#1e2330]/40">Δεν βρέθηκαν υποψήφιοι με αυτά τα κριτήρια.</div>
            ) : (
              filteredLeads.map((lead) => {
                const fu = followUpState(lead.followUpDate);
                return (
                  <div key={lead.id} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row justify-between gap-5 border-l-4 border-l-indigo-500 hover:border-slate-700 transition-all">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-white font-bold text-sm tracking-wide">{lead.name}</h3>
                        <span className="text-[10px] font-bold bg-indigo-950/50 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/30">{lead.grade || "Χωρίς Τάξη"}</span>
                        <span className="text-[10px] font-medium bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">📍 {lead.source}</span>
                        <span className="text-amber-400 text-xs font-bold flex">{Array.from({ length: lead.priority }).map((_, i) => <span key={i}>⭐</span>)}</span>
                        {fu === "overdue" && <span className="text-[10px] font-bold bg-rose-950/40 text-rose-400 px-2 py-0.5 rounded border border-rose-900/40">⏰ Εκπρόθεσμο</span>}
                        {fu === "today" && <span className="text-[10px] font-bold bg-amber-950/40 text-amber-400 px-2 py-0.5 rounded border border-amber-900/40">⏰ Σήμερα</span>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-[#0b0e14]/40 p-3 rounded-xl border border-slate-800/40">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-slate-400"><Phone size={12}/> {lead.phone}</p>
                          <p className="flex items-center gap-1.5 text-slate-400"><Mail size={12} className="shrink-0"/> <span className="truncate">{lead.email || "-"}</span></p>
                        </div>
                        <div className="space-y-0.5 border-t sm:border-t-0 sm:border-l border-slate-800/60 pt-1.5 sm:pt-0 sm:pl-3">
                          <p className="text-[10px] text-slate-500 uppercase font-black">{lead.parentType}</p>
                          <p className="font-medium text-slate-200">{lead.parentName || "-"}</p>
                          {lead.parentPhone && lead.parentPhone !== lead.phone && <p className="text-slate-400 font-mono text-[11px]">📞 {lead.parentPhone}</p>}
                        </div>
                      </div>

                      {lead.interestedLessons?.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] uppercase font-bold text-slate-500 mr-1">Ενδιαφέρον:</span>
                          {lead.interestedLessons.map((l) => <span key={l} className="text-[10px] font-semibold bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-400"/> {l}</span>)}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        {lead.tags?.length > 0 && <div className="flex flex-wrap gap-1">{lead.tags.map((t) => <span key={t} className="text-[9px] font-bold text-indigo-400 bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-900/30">{t}</span>)}</div>}
                        {lead.notes && <p className="text-xs text-slate-400 bg-[#0b0e14]/20 p-2 rounded-lg border border-slate-800/40 italic">💬 {lead.notes}</p>}
                      </div>
                    </div>

                    <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l lg:border-r border-slate-800/80 pt-4 lg:pt-0 lg:px-4 space-y-3">
                      {lead.followUpDate && (
                        <div className={`p-2 rounded-xl text-[11px] flex items-center gap-1.5 font-semibold border ${fu === "overdue" ? "bg-rose-950/30 border-rose-900/40 text-rose-400" : fu === "today" ? "bg-amber-950/30 border-amber-900/40 text-amber-400" : "bg-slate-900 border-slate-800 text-slate-400"}`}>
                          <Calendar size={13}/><span>Follow-up: {lead.followUpDate} {lead.followUpTime || "12:00"}</span>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1"><ListTodo size={11}/> Tasks</p>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {lead.tasks?.map((t) => (
                            <label key={t.id} className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none">
                              <input type="checkbox" checked={t.done} onChange={() => toggleTask(lead.id, t.id)} className="accent-indigo-600 rounded w-3 h-3" />
                              <span className={t.done ? "line-through text-slate-500" : ""}>{t.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-slate-800/40">
                        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1"><Clock size={11}/> Activity Log</p>
                        <div className="space-y-1 text-[10px] text-slate-400 max-h-20 overflow-y-auto custom-scrollbar">
                          {lead.timeline?.map((log) => (
                            <div key={log.id} className="border-l border-slate-700 pl-1.5 py-0.5">
                              <span className="text-[9px] text-slate-600 block">{log.timestamp}</span>
                              <p className="text-slate-300 leading-tight">{log.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-48 flex flex-col justify-between items-stretch gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/60">
                      <div className="text-center">
                        <p className="text-[9px] uppercase font-bold text-slate-500 mb-1">Τρέχον Στάδιο</p>
                        <div className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wide text-center ${PIPELINE_STATUSES.find((p) => p.id === lead.status)?.color || "bg-slate-800 text-white"}`}>{lead.status}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <a href={`https://wa.me/${lead.phone.startsWith("30") ? lead.phone : "30" + lead.phone}`} target="_blank" rel="noreferrer" className="bg-emerald-950/40 hover:bg-emerald-950 border border-emerald-900/50 p-2 rounded-xl text-emerald-400 flex justify-center items-center transition-colors" title="WhatsApp"><MessageSquare size={14}/></a>
                        <a href={`mailto:${lead.email}`} className="bg-sky-950/40 hover:bg-sky-950 border border-sky-900/50 p-2 rounded-xl text-sky-400 flex justify-center items-center transition-colors" title="Email"><Mail size={14}/></a>
                        <button onClick={() => deleteLead(lead.id)} className="bg-rose-950/20 hover:bg-rose-950 border border-rose-900/40 p-2 rounded-xl text-rose-500 flex justify-center items-center transition-colors" title="Διαγραφή"><Trash2 size={14}/></button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase font-bold text-slate-500">Αλλαγή Σταδίου</p>
                        <select value={lead.status} onChange={(e) => updateStatus(lead.id, e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-1.5 rounded-lg text-[11px] text-white focus:border-indigo-500 outline-none cursor-pointer">{PIPELINE_STATUSES.map((p) => <option key={p.id} value={p.id}>{p.id}</option>)}</select>
                      </div>
                      {lead.status !== "Εγγραφή" ? (
                        <button onClick={() => convertToStudent(lead)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-[11px] font-black uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-950/20"><CheckCircle2 size={12}/> Μετατροπή σε Μαθητή</button>
                      ) : (
                        <div className="text-center py-2 text-emerald-500 text-[10px] font-bold bg-emerald-950/20 border border-emerald-900/30 rounded-xl">✅ Μετατράπηκε σε Μαθητή</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function StatCard({ icon, cls, label, value }: any) {
  return (
    <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
      <div className={`p-2 rounded-xl ${cls}`}>{icon}</div>
      <div><p className="text-[10px] uppercase font-bold text-slate-500">{label}</p><h3 className="text-white font-black text-lg">{value}</h3></div>
    </div>
  );
}
