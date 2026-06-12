"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Search, CheckCircle2, Save, CheckCheck, CalendarDays, Users, History as HistoryIcon } from "lucide-react";
import { sendNotification } from "../../lib/notifications";

type Status = "present" | "absent" | "late" | "excused";

const STATUSES: Record<Status, { label: string; dot: string; activeBtn: string; text: string }> = {
  present:  { label: "Παρών",    dot: "bg-emerald-500", activeBtn: "bg-emerald-600 text-white", text: "text-emerald-400" },
  absent:   { label: "Απών",     dot: "bg-rose-500",    activeBtn: "bg-rose-600 text-white",    text: "text-rose-400" },
  late:     { label: "Καθυστ.",  dot: "bg-amber-500",   activeBtn: "bg-amber-600 text-white",   text: "text-amber-400" },
  excused:  { label: "Δικαιολ.", dot: "bg-slate-400",   activeBtn: "bg-slate-600 text-white",   text: "text-slate-300" },
};
const STATUS_ORDER: Status[] = ["present", "absent", "late", "excused"];
const DAYS = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];

function studentName(s: any) {
  return s.name || `${s.lastName || ""} ${s.firstName || ""}`.trim() || "Άγνωστος";
}

// 🔑 Συμμετοχή σε τμήμα: μέσω enrollments[].className (ή παλιό επίπεδο className ως fallback)
function isInClass(s: any, cls: string) {
  if (!cls) return false;
  if (s.className === cls) return true;
  return (s.enrollments || []).some((e: any) => e.className === cls);
}

export default function AttendancePage() {
  const [mounted, setMounted] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [summary, setSummary] = useState<{ saved: number; absences: number; emails: number } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [today, setToday] = useState("");
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
    // ✅ σωστό key (με fallback στο παλιό)
    setClassesData(JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]"));
    setSchedule(JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"));
    setHistory(JSON.parse(localStorage.getItem("eduflow_attendance") || "[]"));
    const now = new Date();
    setToday(DAYS[now.getDay()]);
    setDateLabel(now.toLocaleDateString("el-GR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }));
    setMounted(true);
  }, []);

  // Λίστα τμημάτων: από Τμήματα + enrollments μαθητών
  const classOptions = useMemo(() => {
    const fromClasses = classesData.map((c) => c.name || c.className).filter(Boolean);
    const fromEnroll = students.flatMap((s) => (s.enrollments || []).map((e: any) => e.className)).filter(Boolean);
    const fromFlat = students.map((s) => s.className).filter(Boolean);
    return Array.from(new Set([...fromClasses, ...fromEnroll, ...fromFlat])).sort();
  }, [classesData, students]);

  // Μαθήματα της ημέρας (από Scheduler)
  const todaysLessons = useMemo(() => {
    return schedule
      .filter((l) => l.day?.toLowerCase() === today.toLowerCase())
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [schedule, today]);

  const countInClass = (cls: string) => students.filter((s) => isInClass(s, cls)).length;

  // Μαθητές του επιλεγμένου τμήματος (+ αναζήτηση)
  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(
      (s) => isInClass(s, selectedClass) && studentName(s).toLowerCase().includes(search.toLowerCase())
    );
  }, [students, selectedClass, search]);

  // Αρχικοποίηση: όλοι "Παρών" μόλις επιλεγεί τμήμα
  useEffect(() => {
    if (!selectedClass) return;
    const init: Record<string, Status> = {};
    students.filter((s) => isInClass(s, selectedClass)).forEach((s) => { init[s.id] = "present"; });
    setStatuses(init);
    setSummary(null);
  }, [selectedClass, students]);

  const setStatus = (id: string, status: Status) => setStatuses((prev) => ({ ...prev, [id]: status }));

  const markAllPresent = () => {
    const all: Record<string, Status> = {};
    students.filter((s) => isInClass(s, selectedClass)).forEach((s) => { all[s.id] = "present"; });
    setStatuses(all);
  };

  const openLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setSelectedClass(lesson.groupName);
    setSearch("");
  };

  const handleSave = () => {
    const list = students.filter((s) => isInClass(s, selectedClass));
    if (list.length === 0) return;

    const existing = JSON.parse(localStorage.getItem("eduflow_attendance") || "[]");
    const dateStr = new Date().toLocaleString("el-GR");
    let absences = 0;
    let emails = 0;

    const records = list.map((s) => {
      const status: Status = statuses[s.id] || "present";
      const present = status === "present";

      if (status === "absent") {
        absences++;
        sendNotification({
          type: "absence",
          recipientId: s.parentId || s.id,
          recipientName: s.parentName || studentName(s),
          recipientEmail: s.parentEmail || "",
          channel: "email",
          title: "Απουσία Μαθητή",
          message: `${studentName(s)} απουσίασε σήμερα${selectedLesson ? ` από το μάθημα ${selectedLesson.subject} (${selectedLesson.time})` : ""}.`,
          studentId: s.id,
          studentName: studentName(s),
        });
        if (s.parentEmail) emails++;
      }

      return {
        id: crypto.randomUUID(),
        studentId: s.id,
        studentName: studentName(s),
        className: selectedClass,
        status,
        present,
        time: selectedLesson?.time || null,
        subject: selectedLesson?.subject || null,
        date: dateStr,
      };
    });

    const updated = [...records, ...existing];
    localStorage.setItem("eduflow_attendance", JSON.stringify(updated));
    setHistory(updated);
    setSummary({ saved: records.length, absences, emails });
  };

  if (!mounted) {
    return (
      <WorkspaceShell title="Παρουσίες" description="Διαχείριση παρουσιών μαθητών">
        <div className="p-10 text-slate-400 text-sm">Φόρτωση...</div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="Παρουσίες" description="Διαχείριση παρουσιών μαθητών">
      <div className="space-y-6">

        <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <CalendarDays size={18} className="text-indigo-400" />
            <span className="font-bold capitalize">{dateLabel}</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setSelectedLesson(null); }}
            className="bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500"
          >
            <option value="">Επιλογή Τμήματος ▾</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>{c} ({countInClass(c)})</option>
            ))}
          </select>
        </div>

        {todaysLessons.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Μαθήματα Σήμερα ({today})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {todaysLessons.map((l, i) => (
                <div key={i} className={`bg-[#1e2330] border rounded-2xl p-4 ${selectedClass === l.groupName ? "border-indigo-500" : "border-slate-800"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-mono font-bold text-sm">{l.time}</span>
                    <span className="text-slate-500 text-[10px] flex items-center gap-1"><Users size={12} /> {countInClass(l.groupName)}</span>
                  </div>
                  <h4 className="text-white font-bold text-sm mt-1">{l.groupName}</h4>
                  <p className="text-slate-500 text-[11px]">{l.subject} • {l.teacher}</p>
                  <button
                    onClick={() => openLesson(l)}
                    className="mt-3 w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold py-2 rounded-lg border border-indigo-500/20 transition"
                  >
                    Παρουσιολόγιο
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-sm text-slate-200 space-y-1">
            <p className="text-emerald-400 font-bold flex items-center gap-2"><CheckCircle2 size={16} /> Αποθηκεύτηκαν {summary.saved} παρουσίες</p>
            {summary.absences > 0 && <p className="text-rose-400">❌ {summary.absences} απουσίες</p>}
            {summary.emails > 0 && <p className="text-indigo-300">📧 Στάλθηκαν {summary.emails} email στους γονείς</p>}
          </div>
        )}

        {selectedClass ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Αναζήτηση μαθητή..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1e2330] border border-slate-800 rounded-xl text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={markAllPresent} className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-500/20 transition">
                  <CheckCheck size={16} /> Όλοι Παρόντες
                </button>
                <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                  <Save size={16} /> Αποθήκευση
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              {classStudents.map((student) => {
                const cur: Status = statuses[student.id] || "present";
                return (
                  <div key={student.id} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${STATUSES[cur].dot}`} />
                      <div>
                        <h3 className="text-white font-bold text-sm">{studentName(student)}</h3>
                        <p className={`text-[11px] ${STATUSES[cur].text}`}>{STATUSES[cur].label}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_ORDER.map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatus(student.id, st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${cur === st ? STATUSES[st].activeBtn : "bg-[#0b0e14] text-slate-400 border border-slate-800 hover:text-white"}`}
                        >
                          {STATUSES[st].label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {classStudents.length === 0 && (
                <div className="text-center py-16 text-slate-500 text-sm">Δεν βρέθηκαν μαθητές σε αυτό το τμήμα.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 text-sm border border-dashed border-slate-800 rounded-2xl">
            Επίλεξε τμήμα (ή μάθημα της ημέρας) για να ανοίξεις το παρουσιολόγιο.
          </div>
        )}

        <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-5">
          <button onClick={() => setShowHistory((v) => !v)} className="w-full flex items-center justify-between text-white font-bold text-sm">
            <span className="flex items-center gap-2"><HistoryIcon size={16} className="text-indigo-400" /> Ιστορικό Παρουσιών ({history.length})</span>
            <span className="text-slate-500 text-xs">{showHistory ? "Απόκρυψη ▴" : "Εμφάνιση ▾"}</span>
          </button>

          {showHistory && (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {history.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Δεν υπάρχει ιστορικό.</p>}
              {history.slice(0, 50).map((rec) => {
                const st: Status = (rec.status as Status) || (rec.present ? "present" : "absent");
                const cfg = STATUSES[st] || STATUSES.present;
                return (
                  <div key={rec.id} className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span className="text-white font-bold">{rec.studentName}</span>
                      <span className="text-slate-500">{rec.className || "-"}{rec.subject ? ` • ${rec.subject}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cfg.text}>{cfg.label}</span>
                      <span className="text-slate-600 font-mono">{rec.date}</span>
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
