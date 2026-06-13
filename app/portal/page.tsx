"use client";

import { useState, useEffect, useMemo } from "react";
import { LogIn, LogOut, Key, BookOpen, Calendar, ClipboardList, CheckCircle2, TrendingUp, Award } from "lucide-react";

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");
const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 9);
const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

export default function PortalPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [parent, setParent] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [exams, setExams] = useState<any[]>([]);
  const [selectedKid, setSelectedKid] = useState("");
  const [tab, setTab] = useState<"schedule" | "attendance" | "progress" | "exams">("schedule");

  useEffect(() => {
    setIsMounted(true);
    const saved = sessionStorage.getItem("portal_session");
    if (saved) { try { const p = JSON.parse(saved); loginWith(p.phone, p.pin); } catch {} }
  }, []);

  const loadData = () => {
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
    setSchedule(JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"));
    setAttendance(JSON.parse(localStorage.getItem("eduflow_attendance") || "[]"));
    setProgress(JSON.parse(localStorage.getItem("eduflow_progress") || "{}"));
    setExams(JSON.parse(localStorage.getItem("eduflow_exams") || "[]"));
  };

  const loginWith = (ph: string, pn: string) => {
    const parents = JSON.parse(localStorage.getItem("eduflow_parents") || "[]");
    const p = parents.find((x: any) => onlyDigits(x.phone) === onlyDigits(ph) && x.pin === pn);
    if (!p) { setError("Λάθος τηλέφωνο ή PIN."); return; }
    setParent(p); setError(""); loadData();
    sessionStorage.setItem("portal_session", JSON.stringify({ phone: ph, pin: pn }));
  };

  const logout = () => { setParent(null); setPhone(""); setPin(""); sessionStorage.removeItem("portal_session"); };

  const myKids = useMemo(() => {
    if (!parent) return [];
    return students.filter((s) => parent.studentIds?.includes(s.id) || onlyDigits(s.parentPhone) === onlyDigits(parent.phone));
  }, [parent, students]);

  useEffect(() => { if (myKids.length && !selectedKid) setSelectedKid(myKids[0].id); }, [myKids, selectedKid]);
  const kid = myKids.find((k) => k.id === selectedKid);

  // Πρόγραμμα παιδιού
  const kidSchedule = useMemo(() => {
    if (!kid) return [];
    return schedule.filter((it) => (kid.enrollments || []).some((e: any) => e.className === it.groupName && e.lessonName === it.subject));
  }, [schedule, kid]);

  // Παρουσίες
  const kidAttendance = useMemo(() => {
    if (!kid) return { present: 0, absent: 0, total: 0 };
    const full = `${kid.firstName || ""} ${kid.lastName || ""}`.trim();
    const recs = attendance.filter((r: any) => r.studentId === kid.id || r.studentName === full || r.studentName === `${kid.lastName} ${kid.firstName}`.trim());
    const present = recs.filter((r: any) => (r.status || (r.present ? "present" : "absent")) === "present").length;
    return { present, absent: recs.length - present, total: recs.length };
  }, [attendance, kid]);

  // Βαθμοί
  const kidProgress = kid ? progress[kid.id] : null;
  const testEntries = kidProgress?.testEntries || [];
  const testsAvg = testEntries.length ? Math.round(testEntries.reduce((a: number, t: any) => a + (t.max > 0 ? (t.score / t.max) * 100 : 0), 0) / testEntries.length) : 0;

  // Διαγωνίσματα παιδιού (από την τάξη του)
  const kidExams = useMemo(() => {
    if (!kid) return [];
    return exams.filter((e: any) => e.grade === kid.grade).sort((a: any, b: any) => (a.date + a.start).localeCompare(b.date + b.start));
  }, [exams, kid]);

  if (!isMounted) return null;

  // LOGIN SCREEN
  if (!parent) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center p-6 text-slate-200">
        <div className="max-w-md w-full bg-[#1e2330] border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-3xl font-black text-indigo-400">EduFlow</div>
            <p className="text-slate-400 text-sm mt-1">Πύλη Γονέα</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">📱 Τηλέφωνο</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="6900000000" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">🔑 PIN (6 ψηφία)</label>
              <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" maxLength={6} placeholder="••••••" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-2xl text-center text-white font-mono tracking-widest outline-none focus:border-indigo-500" />
            </div>
            {error && <p className="text-rose-400 text-xs text-center font-bold">{error}</p>}
            <button onClick={() => loginWith(phone, pin)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><LogIn size={16} /> Σύνδεση</button>
            <p className="text-[10px] text-slate-500 text-center mt-4">Δεν έχεις PIN; Επικοινώνησε με τη γραμματεία.</p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PORTAL
  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-200">
      <header className="bg-[#1e2330] border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xl font-black text-white">Καλώς ήρθες, {parent.name}!</p>
          <p className="text-xs text-slate-400">{myKids.length} παιδί{myKids.length > 1 ? "ά" : ""} στο σύστημα</p>
        </div>
        <button onClick={logout} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><LogOut size={14} /> Αποσύνδεση</button>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {/* Επιλογή παιδιού */}
        {myKids.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {myKids.map((k) => (
              <button key={k.id} onClick={() => setSelectedKid(k.id)} className={`px-4 py-2 rounded-xl text-xs font-bold ${selectedKid === k.id ? "bg-indigo-600 text-white" : "bg-[#1e2330] text-slate-400 border border-slate-800"}`}>
                {k.firstName} {k.lastName}
              </button>
            ))}
          </div>
        )}

        {!kid ? <div className="text-slate-600 text-sm text-center py-16">Δεν βρέθηκε παιδί.</div> : <>
          {/* Κάρτα μαθητή */}
          <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 mb-6">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Μαθητής</p>
            <h2 className="text-2xl font-black text-white">{kid.lastName} {kid.firstName}</h2>
            <p className="text-sm text-slate-400 mt-1">{kid.grade}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { id: "schedule", label: "Πρόγραμμα", icon: <Calendar size={14} /> },
              { id: "attendance", label: "Παρουσίες", icon: <CheckCircle2 size={14} /> },
              { id: "progress", label: "Πρόοδος", icon: <TrendingUp size={14} /> },
              { id: "exams", label: "Διαγωνίσματα", icon: <ClipboardList size={14} /> },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap ${tab === t.id ? "bg-indigo-600 text-white" : "bg-[#1e2330] text-slate-400 border border-slate-800"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* TAB: Πρόγραμμα */}
          {tab === "schedule" && (
            <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
              <h3 className="text-white font-bold text-sm mb-4">Εβδομαδιαίο Πρόγραμμα</h3>
              {kidSchedule.length === 0 ? <p className="text-slate-500 text-xs text-center py-8">Δεν υπάρχει πρόγραμμα ακόμα.</p> :
                <div className="space-y-2">
                  {DAYS.filter((d) => kidSchedule.some((it: any) => it.day === d)).map((day) => (
                    <div key={day}>
                      <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">{day}</p>
                      {kidSchedule.filter((it: any) => it.day === day).sort((a: any, b: any) => a.time.localeCompare(b.time)).map((it: any) => (
                        <div key={it.id} className="bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2 mb-1 text-xs flex justify-between">
                          <span className="text-white font-bold">{it.subject}</span>
                          <span className="text-slate-400">{it.time} · {it.teacher}{it.room ? ` · 🚪${it.room}` : ""}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* TAB: Παρουσίες */}
          {tab === "attendance" && (
            <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
              <h3 className="text-white font-bold text-sm mb-4">Παρουσίες</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0b0e14] rounded-2xl p-4 text-center"><p className="text-3xl font-black text-emerald-400">{kidAttendance.present}</p><p className="text-[11px] text-slate-400 mt-1">Παρουσίες</p></div>
                <div className="bg-[#0b0e14] rounded-2xl p-4 text-center"><p className="text-3xl font-black text-rose-400">{kidAttendance.absent}</p><p className="text-[11px] text-slate-400 mt-1">Απουσίες</p></div>
                <div className="bg-[#0b0e14] rounded-2xl p-4 text-center"><p className="text-3xl font-black text-indigo-400">{kidAttendance.total ? Math.round(kidAttendance.present * 100 / kidAttendance.total) : 0}%</p><p className="text-[11px] text-slate-400 mt-1">Ποσοστό</p></div>
              </div>
            </div>
          )}

          {/* TAB: Πρόοδος */}
          {tab === "progress" && (
            <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-white font-bold text-sm">Πρόοδος</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0b0e14] rounded-2xl p-4"><p className="text-[11px] text-slate-400">Εργασίες</p><p className="text-2xl font-black text-white mt-1">{kidProgress?.homework || 0}%</p></div>
                <div className="bg-[#0b0e14] rounded-2xl p-4"><p className="text-[11px] text-slate-400">Συμμετοχή</p><p className="text-2xl font-black text-white mt-1">{kidProgress?.participation || 0}%</p></div>
                <div className="bg-[#0b0e14] rounded-2xl p-4"><p className="text-[11px] text-slate-400">Τεστ (Μ.Ο.)</p><p className="text-2xl font-black text-white mt-1">{testsAvg}%</p></div>
              </div>
              {testEntries.length > 0 && <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Πρόσφατοι βαθμοί</p>
                <div className="space-y-1">
                  {testEntries.map((t: any) => (
                    <div key={t.id} className="bg-[#0b0e14] border border-slate-800 rounded-xl px-3 py-2 flex justify-between text-xs">
                      <span className="text-white font-bold">{t.subject}</span>
                      <span className="text-slate-400">{t.date ? new Date(t.date).toLocaleDateString("el-GR") : ""} · {t.score}/{t.max}</span>
                    </div>
                  ))}
                </div>
              </div>}
              {kidProgress?.notes && <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-3"><p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Σχόλια καθηγητή</p><p className="text-xs text-slate-300">{kidProgress.notes}</p></div>}
            </div>
          )}

          {/* TAB: Διαγωνίσματα */}
          {tab === "exams" && (
            <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
              <h3 className="text-white font-bold text-sm mb-4">Προγραμματισμένα Διαγωνίσματα</h3>
              {kidExams.length === 0 ? <p className="text-slate-500 text-xs text-center py-8">Δεν υπάρχουν προγραμματισμένα διαγωνίσματα.</p> :
                <div className="space-y-2">
                  {kidExams.map((e: any) => (
                    <div key={e.id} className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3">
                      <p className="text-white font-bold text-sm">{e.subject}</p>
                      <p className="text-[11px] text-slate-400 mt-1">📅 {new Date(e.date).toLocaleDateString("el-GR", { weekday: "long", day: "2-digit", month: "2-digit" })} · {e.start} · ⏱ {e.duration}ω{e.room ? ` · 🚪 ${e.room}` : ""}</p>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}
        </>}
      </div>
    </div>
  );
}
