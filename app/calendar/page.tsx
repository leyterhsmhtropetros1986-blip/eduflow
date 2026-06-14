"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { CalendarOff, CalendarClock, Plus, Trash2, Edit3, X, Calendar as CalIcon, AlertTriangle } from "lucide-react";

interface Holiday { id: string; date: string; label: string; type: "holiday"|"closure"|"special"; }
interface Change {
  id: string; date: string; type: "cancel"|"makeup"|"swap";
  // Πεδία που εφαρμόζονται ανάλογα με τον τύπο
  scheduleId?: string;           // ποιο μάθημα αναφέρεται
  newDate?: string;              // για makeup
  newStart?: string;             // για makeup/swap
  reason?: string;
  notifiedParents?: boolean;
}

const TYPE_LABEL: Record<string,string> = { holiday: "Αργία", closure: "Κλειστά", special: "Ειδική ημέρα" };
const CHANGE_LABEL: Record<string,string> = { cancel: "Ακύρωση", makeup: "Αναπλήρωση", swap: "Μετάθεση" };

export default function CalendarPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [tab, setTab] = useState<"holidays"|"changes">("holidays");

  // Holiday form
  const [hForm, setHForm] = useState<Holiday>({ id: "", date: "", label: "", type: "holiday" });
  const [hEdit, setHEdit] = useState<Holiday | null>(null);

  // Change form
  const [cForm, setCForm] = useState<Change>({ id: "", date: "", type: "cancel", scheduleId: "", reason: "" });
  const [cEdit, setCEdit] = useState<Change | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setHolidays(JSON.parse(localStorage.getItem("eduflow_holidays") || "[]"));
    setChanges(JSON.parse(localStorage.getItem("eduflow_changes") || "[]"));
    setSchedule(JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"));
  }, []);

  const saveHolidays = (next: Holiday[]) => { setHolidays(next); localStorage.setItem("eduflow_holidays", JSON.stringify(next)); };
  const saveChanges = (next: Change[]) => { setChanges(next); localStorage.setItem("eduflow_changes", JSON.stringify(next)); };

  // --- HOLIDAYS ---
  const submitHoliday = () => {
    if (!hForm.date || !hForm.label) { alert("Συμπλήρωσε Ημερομηνία και Περιγραφή."); return; }
    if (hEdit) saveHolidays(holidays.map((h) => h.id === hEdit.id ? { ...hForm, id: hEdit.id } : h));
    else saveHolidays([...holidays, { ...hForm, id: "h-" + Date.now() }]);
    setHForm({ id: "", date: "", label: "", type: "holiday" }); setHEdit(null);
  };
  const removeHoliday = (id: string) => { if (confirm("Διαγραφή;")) saveHolidays(holidays.filter((h) => h.id !== id)); };

  // --- CHANGES ---
  const submitChange = () => {
    if (!cForm.date || !cForm.scheduleId) { alert("Συμπλήρωσε Ημερομηνία και Μάθημα."); return; }
    if (cEdit) saveChanges(changes.map((c) => c.id === cEdit.id ? { ...cForm, id: cEdit.id } : c));
    else saveChanges([...changes, { ...cForm, id: "c-" + Date.now() }]);
    setCForm({ id: "", date: "", type: "cancel", scheduleId: "", reason: "" }); setCEdit(null);
  };
  const removeChange = (id: string) => { if (confirm("Διαγραφή;")) saveChanges(changes.filter((c) => c.id !== id)); };
  const toggleNotified = (id: string) => saveChanges(changes.map((c) => c.id === id ? { ...c, notifiedParents: !c.notifiedParents } : c));

  // Sorted lists
  const sortedHolidays = useMemo(() => [...holidays].sort((a, b) => a.date.localeCompare(b.date)), [holidays]);
  const sortedChanges = useMemo(() => [...changes].sort((a, b) => a.date.localeCompare(b.date)), [changes]);

  // Lookup μαθήματος από schedule
  const lessonOf = (id: string) => {
    const s = schedule.find((x: any) => x.id === id);
    if (!s) return "Διαγραμμένο";
    return `${s.day} ${s.time} · ${s.subject} (${s.groupName})`;
  };

  const fmtDate = (iso: string) => iso ? new Date(iso + "T00:00:00").toLocaleDateString("el-GR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }) : "";

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Ημερολόγιο & Αλλαγές" description="Αργίες, διακοπές, ακυρώσεις και αναπληρώσεις μαθημάτων.">

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("holidays")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${tab === "holidays" ? "bg-indigo-600 text-white" : "bg-[#1e2330] text-slate-400 border border-slate-800"}`}>
          <CalendarOff size={14} /> Αργίες & Διακοπές ({holidays.length})
        </button>
        <button onClick={() => setTab("changes")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${tab === "changes" ? "bg-indigo-600 text-white" : "bg-[#1e2330] text-slate-400 border border-slate-800"}`}>
          <CalendarClock size={14} /> Αλλαγές Μαθημάτων ({changes.length})
        </button>
      </div>

      {tab === "holidays" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ΦΟΡΜΑ ΑΡΓΙΩΝ */}
          <div className="bg-[#1e2330] border border-slate-800 p-5 rounded-3xl h-fit lg:sticky lg:top-28 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2"><Plus size={14} /> {hEdit ? "Επεξεργασία" : "Νέα Αργία"}</h3>
              {hEdit && <button onClick={() => { setHEdit(null); setHForm({ id: "", date: "", label: "", type: "holiday" }); }} className="text-slate-500 hover:text-rose-400"><X size={14} /></button>}
            </div>
            <input type="date" value={hForm.date} onChange={(e) => setHForm({ ...hForm, date: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
            <input value={hForm.label} onChange={(e) => setHForm({ ...hForm, label: e.target.value })} placeholder="Περιγραφή (π.χ. Πάσχα)" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
            <select value={hForm.type} onChange={(e) => setHForm({ ...hForm, type: e.target.value as any })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="holiday">Αργία</option>
              <option value="closure">Κλειστά (διακοπές)</option>
              <option value="special">Ειδική ημέρα</option>
            </select>
            <button onClick={submitHoliday} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold">{hEdit ? "Αποθήκευση" : "+ Προσθήκη"}</button>
          </div>

          {/* ΛΙΣΤΑ ΑΡΓΙΩΝ */}
          <div className="lg:col-span-2 space-y-2">
            {sortedHolidays.length === 0 ? (
              <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">Δεν υπάρχουν αργίες. Πρόσθεσε π.χ. «Πάσχα», «Χριστούγεννα».</div>
            ) : sortedHolidays.map((h) => (
              <div key={h.id} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${h.type === "holiday" ? "bg-rose-950/40 text-rose-400 border border-rose-900/40" : h.type === "closure" ? "bg-amber-950/40 text-amber-400 border border-amber-900/40" : "bg-indigo-950/40 text-indigo-400 border border-indigo-900/40"}`}>
                  <CalendarOff size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{h.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">📅 {fmtDate(h.date)} · {TYPE_LABEL[h.type]}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setHEdit(h); setHForm(h); }} className="text-slate-500 hover:text-indigo-400 p-2"><Edit3 size={14} /></button>
                  <button onClick={() => removeHoliday(h.id)} className="text-slate-500 hover:text-rose-400 p-2"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "changes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ΦΟΡΜΑ ΑΛΛΑΓΩΝ */}
          <div className="bg-[#1e2330] border border-slate-800 p-5 rounded-3xl h-fit lg:sticky lg:top-28 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2"><Plus size={14} /> {cEdit ? "Επεξεργασία" : "Νέα Αλλαγή"}</h3>
              {cEdit && <button onClick={() => { setCEdit(null); setCForm({ id: "", date: "", type: "cancel", scheduleId: "", reason: "" }); }} className="text-slate-500 hover:text-rose-400"><X size={14} /></button>}
            </div>
            <select value={cForm.type} onChange={(e) => setCForm({ ...cForm, type: e.target.value as any })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
              <option value="cancel">❌ Ακύρωση μαθήματος</option>
              <option value="makeup">✅ Αναπλήρωση</option>
              <option value="swap">🔄 Μετάθεση</option>
            </select>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Ημερομηνία *</label>
              <input type="date" value={cForm.date} onChange={(e) => setCForm({ ...cForm, date: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Μάθημα *</label>
              <select value={cForm.scheduleId} onChange={(e) => setCForm({ ...cForm, scheduleId: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
                <option value="">— Επίλεξε —</option>
                {schedule.map((s: any) => <option key={s.id} value={s.id}>{s.day} {s.time} · {s.subject} ({s.groupName})</option>)}
              </select>
            </div>
            {(cForm.type === "makeup" || cForm.type === "swap") && (
              <>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Νέα Ημερομηνία</label>
                  <input type="date" value={cForm.newDate || ""} onChange={(e) => setCForm({ ...cForm, newDate: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Νέα Ώρα</label>
                  <input type="time" value={cForm.newStart || ""} onChange={(e) => setCForm({ ...cForm, newStart: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
                </div>
              </>
            )}
            <textarea value={cForm.reason || ""} onChange={(e) => setCForm({ ...cForm, reason: e.target.value })} rows={2} placeholder="Αιτιολογία (προαιρ.)" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none" />
            <button onClick={submitChange} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold">{cEdit ? "Αποθήκευση" : "+ Προσθήκη"}</button>
          </div>

          {/* ΛΙΣΤΑ ΑΛΛΑΓΩΝ */}
          <div className="lg:col-span-2 space-y-2">
            {sortedChanges.length === 0 ? (
              <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">Δεν υπάρχουν αλλαγές. Πρόσθεσε όταν κάποιο μάθημα ακυρώνεται ή αναπληρώνεται.</div>
            ) : sortedChanges.map((c) => (
              <div key={c.id} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${c.type === "cancel" ? "bg-rose-950/40 text-rose-400 border border-rose-900/40" : c.type === "makeup" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40" : "bg-amber-950/40 text-amber-400 border border-amber-900/40"}`}>
                    <CalendarClock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm flex items-center gap-2 flex-wrap">
                      {CHANGE_LABEL[c.type]} <span className="text-[10px] font-normal text-slate-400">{fmtDate(c.date)}</span>
                      {c.notifiedParents && <span className="text-[10px] bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded">✓ ενημερώθηκαν γονείς</span>}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">📚 {lessonOf(c.scheduleId || "")}</p>
                    {(c.newDate || c.newStart) && <p className="text-[11px] text-emerald-400 mt-0.5">→ Νέο: {c.newDate ? fmtDate(c.newDate) : ""} {c.newStart}</p>}
                    {c.reason && <p className="text-[11px] text-slate-500 mt-1 italic">«{c.reason}»</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => toggleNotified(c.id)} className={`px-2 py-1 rounded text-[10px] font-bold ${c.notifiedParents ? "bg-emerald-950/40 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>{c.notifiedParents ? "✓" : "Ειδ."}</button>
                    <button onClick={() => { setCEdit(c); setCForm(c); }} className="text-slate-500 hover:text-indigo-400 p-1"><Edit3 size={14} /></button>
                    <button onClick={() => removeChange(c.id)} className="text-slate-500 hover:text-rose-400 p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}
