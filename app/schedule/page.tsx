"use client";
import { useEffect, useMemo, useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { ClassesView } from "./ClassesView";
import { GridView } from "./GridView";
import { TeachersView } from "./TeachersView";
import { RoomsView } from "./RoomsView";
import { Zap, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

const DAYS_MAP = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];

function shuffleArray(array: any[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const makeKey = (id: string, day: string, time: string) => `${id}|${day}|${time}`;

function genDayHours(day: string): number[] {
  return day === "Σάββατο" ? [9, 10, 11, 12, 13, 14, 15, 16] : [14, 15, 16, 17, 18, 19, 20, 21, 22];
}
function genHH(h: number) { return `${String(h).padStart(2, "0")}:00`; }

// 🔑 Σπάει τις συνολικές ώρες σε μπλοκ ΕΩΣ 2 ώρες (π.χ. 5 -> [2,2,1], 4 -> [2,2], 3 -> [2,1])
function splitBlocks(total: number): number[] {
  const blocks: number[] = [];
  let rem = Math.max(0, Math.round(total || 0));
  while (rem >= 2) { blocks.push(2); rem -= 2; }
  if (rem === 1) blocks.push(1);
  return blocks.length ? blocks : [1];
}

function genIsAvailable(availability: any[], lockedSlots: any[], day: string, time: string): boolean {
  if (lockedSlots?.some((sl: any) => {
    const start = parseInt(sl.start, 10);
    const end = parseInt(sl.end, 10);
    const h = parseInt(time, 10);
    return sl.day === day && h >= start && h < end;
  })) return false;
  if (availability && availability.length > 0) {
    return availability.some((sl: any) => {
        const start = parseInt(sl.start, 10);
        const end = parseInt(sl.end, 10);
        const h = parseInt(time, 10);
        return sl.day === day && h >= start && h < end;
    });
  }
  return true;
}

// Score προγράμματος: μεγιστοποίηση τοποθετήσεων, ελαχιστοποίηση κενών μαθητών & αργών ωρών
function calculateScore(schedule: any[], students: any[]): number {
    let score = schedule.length * 1000;
    // Βαθμίδα ανά τμήμα (από τις εγγραφές των μαθητών)
    const gradeByClass: Record<string, string> = {};
    students.forEach((s: any) => (s.enrollments || []).forEach((e: any) => {
        if (e.className && !gradeByClass[e.className]) gradeByClass[e.className] = s.grade || "";
    }));
    schedule.forEach(item => {
        const startHour = parseInt(item.time.split('-')[0].split(':')[0]);
        const g = gradeByClass[item.groupName] || "";
        if (g.includes("Γυμν")) score -= startHour * 8;          // Γυμνάσιο: όσο νωρίτερα, τόσο καλύτερα
        else if (g.includes("Λυκείου")) score += startHour * 8;  // Λύκειο: όσο αργότερα, τόσο καλύτερα
        else if (startHour >= 20) score -= 50;                   // αδιευκρίνιστο: μικρή ποινή πολύ αργά
    });
    students.forEach(s => {
        const cls = s.class || s.className;
        DAYS_MAP.forEach(day => {
            const studentDayItems = schedule.filter(i => i.groupName === cls && i.day === day)
                                            .sort((a,b) => parseInt(a.time.split('-')[0].split(':')[0]) - parseInt(b.time.split('-')[0].split(':')[0]));
            for (let i = 0; i < studentDayItems.length - 1; i++) {
                const endCurrent = parseInt(studentDayItems[i].time.split('-')[1].split(':')[0]);
                const startNext = parseInt(studentDayItems[i+1].time.split('-')[0].split(':')[0]);
                const gap = startNext - endCurrent;
                if (gap > 0) score -= (gap * 120); // βαριά ποινή στα κενά των παιδιών
            }
        });
    });
    return score;
}

function generateSchedule(data: { students: any[]; teachers: any[]; classes: any[]; rooms: any[]; lessons: any[] }): { schedule: any[], unplaced: any[], placed: number, teacherScore: Record<string, number> } {
  const { students = [], teachers = [], classes = [], rooms = [], lessons = [] } = data;

  // Βαθμίδα ανά τμήμα (για προτεραιότητα ώρας: Γυμνάσιο νωρίς, Λύκειο αργά)
  const classGrade: Record<string, string> = {};
  classes.forEach((c: any) => { const nm = c.name || c.className; if (nm) classGrade[nm] = c.grade || ""; });

  let bestResult: any = { schedule: [], unplaced: [], placed: -1, score: -Infinity, teacherScore: {} };
  let sessionCount = 0;

  for (let attempt = 0; attempt < 50; attempt++) {
    const teacherBusy = new Set<string>();
    const roomBusy = new Set<string>();
    const classRoom: Record<string, string> = {}; // 🚪 σταθερή αίθουσα ανά τμήμα (να μην μπερδεύονται)
    const groupBusy = new Set<string>();
    const studentBusy = new Set<string>();
    const teacherLoad: Record<string, number> = {}; // 🏷️ score ανά καθηγητή = προγραμματισμένες ώρες
    const schedule: any[] = [];
    const unplaced: any[] = [];
    const roomNames = (rooms || []).map((r: any) => r.name || r.title || r).filter(Boolean);

    const pairs: Record<string, any> = {};
    students.forEach((s) => {
      if (!s.enrollments) return;
      s.enrollments.forEach((e: any) => {
        if (!e.lessonName || !e.className) return;
        const key = `${e.lessonName}|||${e.className}`;
        if (!pairs[key]) pairs[key] = { lessonName: e.lessonName, className: e.className, students: [] };
        pairs[key].students.push(s);
      });
    });
    sessionCount = Object.values(pairs).length;
    const sessions = shuffleArray(Object.values(pairs));

    for (const ses of sessions) {
      const lessonInfo = lessons.find((l: any) => (l?.name || l) === ses.lessonName);
      // Σεβόμαστε την κατανομή που όρισε ο χρήστης στη σελίδα Μαθημάτων (ασφαλώς ≤2)
      let distribution: number[];
      if (Array.isArray(lessonInfo?.distribution) && lessonInfo.distribution.length > 0) {
        distribution = lessonInfo.distribution.flatMap((b: number) => (b > 2 ? splitBlocks(b) : [b]));
      } else {
        // fallback: ώρες/εβδομάδα ΑΠΟ ΤΟ ΜΑΘΗΜΑ (όχι από το τμήμα), σπασμένες σε μπλοκ ≤2
        const totalHours = Number(lessonInfo?.weeklyHours ?? lessonInfo?.hoursPerWeek ?? 2) || 2;
        distribution = splitBlocks(totalHours);
      }
      distribution = distribution.sort((a, b) => b - a); // μεγαλύτερα μπλοκ (2ωρα) πρώτα
      const minGap = lessonInfo?.minGapDays ?? 1; // 1 = διαφορετική μέρα ανά μπλοκ
      // Προτεραιότητα ώρας ανά βαθμίδα
      const sesGrade = classGrade[ses.className] || ses.students?.[0]?.grade || "";
      const isGym = sesGrade.includes("Γυμν");

      // Επιλογή καθηγητών: πρώτα όσοι έχουν ΛΙΓΟΤΕΡΕΣ ώρες (χαμηλότερο score) -> ισορροπία
      const candidates = teachers.filter((t) => (t.subjects && t.subjects.includes(ses.lessonName)) || t.subject === ses.lessonName).sort((a, b) => {
          const nameA = `${a.lastName || ""} ${a.firstName || ""}`.trim();
          const nameB = `${b.lastName || ""} ${b.firstName || ""}`.trim();
          return (teacherLoad[nameA] || 0) - (teacherLoad[nameB] || 0);
      });

      let placedSession = false;
      for (const teacher of candidates) {
        const tName = `${teacher.lastName || ""} ${teacher.firstName || ""}`.trim();
        const tempSchedule: any[] = [];
        const tempBusy = { teacher: [] as string[], group: [] as string[], student: [] as string[], room: [] as string[] };
        let placedAllBlocks = true;
        let usedDayIndices: number[] = [];

        for (const blockHours of distribution) {
          let placedBlock = false;
          const shuffledDays = shuffleArray(DAYS_MAP); // τυχαία σειρά ημερών (όχι από Δευτέρα)
          for (const day of shuffledDays) {
            const dayIdx = DAYS_MAP.indexOf(day);
            // ⛔ διαφορετική μέρα ανά μπλοκ ίδιου μαθήματος
            if (usedDayIndices.some(uIdx => Math.abs(uIdx - dayIdx) < minGap)) continue;
            const availableHours = genDayHours(day);
            // ⛔ Όριο 4 ωρών/μέρα ανά μαθητή (συνολικά σε όλα τα μαθήματα)
            const exceedsDaily = ses.students.some((st: any) => {
              const cur = availableHours.filter((hh) => studentBusy.has(makeKey(st.id, day, genHH(hh)))).length;
              return cur + blockHours > 4;
            });
            if (exceedsDaily) continue;
            // Γυμνάσιο: νωρίτερες ώρες πρώτα. Λύκειο/άλλο: αργότερες ώρες πρώτα.
            const orderedHours = [...availableHours].sort((a, b) => (isGym ? a - b : b - a));
            for (const h of orderedHours) {
              const isWithinBounds = (h + blockHours - 1) <= Math.max(...availableHours);
              if (!isWithinBounds) continue;
              const timeSlots = [];
              for (let i = 0; i < blockHours; i++) timeSlots.push(genHH(h + i));
              let possible = true;
              for (const ts of timeSlots) {
                const tKey = makeKey(tName, day, ts);
                const gKey = makeKey(ses.className, day, ts);
                if (teacherBusy.has(tKey) || groupBusy.has(gKey)) { possible = false; break; }
                if (!genIsAvailable(teacher.availability, teacher.lockedSlots, day, ts)) { possible = false; break; }
                for (const st of ses.students) {
                  const sKey = makeKey(st.id, day, ts);
                  if (studentBusy.has(sKey) || !genIsAvailable(st.availability, st.lockedSlots, day, ts)) { possible = false; break; }
                }
                if (roomNames.length > 0) {
                   if (roomNames.every((rn: string) => roomBusy.has(makeKey(rn, day, ts)))) { possible = false; break; }
                }
              }
              if (possible) {
                // Προτίμησε τη σταθερή αίθουσα του τμήματος (αν είναι ελεύθερη), αλλιώς την πρώτη ελεύθερη
                const roomFree = (rn: string) => !timeSlots.some((ts) => roomBusy.has(makeKey(rn, day, ts)));
                const preferred = classRoom[ses.className];
                let room: string | undefined = preferred && roomFree(preferred) ? preferred : roomNames.find(roomFree);
                if (room && !classRoom[ses.className]) classRoom[ses.className] = room; // «κλείδωσε» την αίθουσα στο τμήμα
                timeSlots.forEach(ts => {
                  const tKey = makeKey(tName, day, ts);
                  const gKey = makeKey(ses.className, day, ts);
                  const rKey = room ? makeKey(room, day, ts) : null;
                  teacherBusy.add(tKey); tempBusy.teacher.push(tKey);
                  groupBusy.add(gKey); tempBusy.group.push(gKey);
                  ses.students.forEach((st: any) => {
                    const sKey = makeKey(st.id, day, ts);
                    studentBusy.add(sKey); tempBusy.student.push(sKey);
                  });
                  if (rKey) { roomBusy.add(rKey); tempBusy.room.push(rKey); }
                });
                tempSchedule.push({ id: `${ses.className}-${ses.lessonName}-${day}-${h}`, groupName: ses.className, grade: sesGrade, teacher: tName, day, time: `${genHH(h)}-${genHH(h + blockHours)}`, subject: ses.lessonName, room });
                usedDayIndices.push(dayIdx);
                placedBlock = true;
                break;
              }
            }
            if (placedBlock) break;
          }
          if (!placedBlock) { placedAllBlocks = false; break; }
        }

        if (placedAllBlocks) {
          schedule.push(...tempSchedule);
          teacherLoad[tName] = (teacherLoad[tName] || 0) + distribution.reduce((sum, hh) => sum + hh, 0);
          placedSession = true;
          break;
        } else {
          tempBusy.teacher.forEach(k => teacherBusy.delete(k));
          tempBusy.group.forEach(k => groupBusy.delete(k));
          tempBusy.student.forEach(k => studentBusy.delete(k));
          tempBusy.room.forEach(k => roomBusy.delete(k));
        }
      }
      if (!placedSession) {
        unplaced.push({ ...ses, reason: candidates.length === 0 ? "Δεν υπάρχει καθηγητής" : "Αδυναμία τοποθέτησης με διαθέσιμους καθηγητές" });
      }
    }

    const currentScore = calculateScore(schedule, students);
    if (currentScore > bestResult.score) {
      bestResult = { schedule, unplaced, placed: schedule.length, score: currentScore, teacherScore: teacherLoad };
    }
  }

  console.log("Scheduling Report:", { students: students.length, teachers: teachers.length, lessons: lessons.length, rooms: rooms.length, sessions: sessionCount, schedule: bestResult.schedule.length, unplaced: bestResult.unplaced.length });
  console.log("Ώρες ανά καθηγητή (score):", bestResult.teacherScore);
  if (bestResult.unplaced.length > 0) { console.table(bestResult.unplaced); }
  return bestResult;
}

// Δείκτες ποιότητας προγράμματος
function computeQuality(schedule: any[], students: any[]) {
  const parseT = (t: string) => { const [a, b] = String(t).split("-"); const s = parseInt(a); const e = b ? parseInt(b) : s + 1; return { s, e: isNaN(e) ? s + 1 : e }; };
  const gapsFor = (sessions: any[]) => {
    let gaps = 0;
    DAYS_MAP.forEach((day) => {
      const items = sessions.filter((i) => i.day === day).map((i) => parseT(i.time)).sort((a, b) => a.s - b.s);
      for (let i = 0; i < items.length - 1; i++) { const g = items[i + 1].s - items[i].e; if (g > 0) gaps += g; }
    });
    return gaps;
  };
  let studentGaps = 0;
  students.forEach((st) => {
    const sess = schedule.filter((it) => (st.enrollments || []).some((e: any) => e.className === it.groupName && e.lessonName === it.subject));
    studentGaps += gapsFor(sess);
  });
  let teacherGaps = 0;
  [...new Set(schedule.map((it) => it.teacher))].forEach((name) => { teacherGaps += gapsFor(schedule.filter((it) => it.teacher === name)); });
  const perDay = DAYS_MAP.map((d) => schedule.filter((it) => it.day === d).length);
  const active = perDay.filter((n) => n > 0);
  const mean = active.length ? active.reduce((a, b) => a + b, 0) / active.length : 0;
  const stdev = active.length ? Math.sqrt(active.reduce((a, b) => a + (b - mean) ** 2, 0) / active.length) : 0;
  const balanced = mean === 0 ? true : stdev / mean <= 0.6;
  return { studentGaps, teacherGaps, balanced, perDay };
}

// Κάλυψη ωρών: σύγκριση δηλωμένων ωρών μαθήματος (weeklyHours) με τις προγραμματισμένες
function computeCoverage(schedule: any[], students: any[], lessons: any[]) {
  const lessonHours: Record<string, number> = {};
  lessons.forEach((l: any) => { const name = typeof l === "string" ? l : l?.name; if (name) lessonHours[name] = typeof l === "object" ? (l.weeklyHours || 0) : 0; });
  const dur = (t: string) => { const [a, b] = String(t).split("-"); const s = parseInt(a); const e = b ? parseInt(b) : s + 1; return isNaN(s) || isNaN(e) ? 0 : Math.max(0, e - s); };
  const pairs: Record<string, { className: string; lessonName: string; students: string[] }> = {};
  students.forEach((st: any) => (st.enrollments || []).forEach((e: any) => {
    if (!e.className || !e.lessonName) return;
    const k = `${e.className}|||${e.lessonName}`;
    (pairs[k] = pairs[k] || { className: e.className, lessonName: e.lessonName, students: [] }).students.push(`${st.lastName || ""} ${st.firstName || ""}`.trim());
  }));
  const shortfalls: { className: string; lessonName: string; expected: number; scheduled: number; missing: number; students: string[] }[] = [];
  Object.values(pairs).forEach((p) => {
    const expected = lessonHours[p.lessonName] || 0;
    if (expected <= 0) return;
    const scheduled = schedule.filter((it) => it.groupName === p.className && it.subject === p.lessonName).reduce((a, it) => a + dur(it.time), 0);
    if (scheduled < expected) shortfalls.push({ className: p.className, lessonName: p.lessonName, expected, scheduled, missing: expected - scheduled, students: [...new Set(p.students)] });
  });
  return { shortfalls };
}

type TabType = "classes" | "grid" | "teachers" | "rooms" | "students";
const tabs: { id: TabType; label: string }[] = [
  { id: "classes", label: "🏫 Ανά Τάξη" },
  { id: "grid", label: "📅 Grid" },
  { id: "teachers", label: "👨‍🏫 Καθηγητές" },
  { id: "rooms", label: "🚪 Αίθουσες" },
  { id: "students", label: "👨‍🎓 Μαθητές" },
];

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState<TabType>("classes");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ schedule: [], classes: [], students: [], teachers: [], rooms: [], lessons: [] });
  const [search, setSearch] = useState("");

  const loadData = () => {
    try {
      setData({
        schedule: JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"),
        classes: JSON.parse(localStorage.getItem("eduflow_classes") || localStorage.getItem("eduflow_classes_data") || "[]"),
        students: JSON.parse(localStorage.getItem("eduflow_students") || localStorage.getItem("eduflow_students_data") || "[]"),
        teachers: JSON.parse(localStorage.getItem("eduflow_teachers") || localStorage.getItem("eduflow_teachers_data") || "[]"),
        rooms: JSON.parse(localStorage.getItem("eduflow_rooms") || localStorage.getItem("eduflow_rooms_data") || "[]"),
        lessons: JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_lessons_data") || "[]"),
      });
    } catch (err) { console.error(err); }
  };
  useEffect(() => { loadData(); setLoading(false); }, []);

  const handleAutoGenerate = () => {
    if (data.schedule.length > 0 && !confirm("Να αντικατασταθεί το υπάρχον πρόγραμμα;")) return;
    const result = generateSchedule(data);
    if (result.schedule.length === 0) { alert("Δεν ήταν δυνατή η δημιουργία προγράμματος. Ελέγξτε καθηγητές, μαθήματα και εγγραφές."); return; }
    localStorage.setItem("eduflow_schedule", JSON.stringify(result.schedule));
    loadData();
    setActiveTab("grid");
  };
  const handleClearSchedule = () => {
    if (confirm("Καθαρισμός προγράμματος;")) {
      localStorage.setItem("eduflow_schedule", "[]");
      loadData();
    }
  };

  const filteredClasses = useMemo(() => data.classes.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase())), [search, data.classes]);
  const quality = useMemo(() => computeQuality(data.schedule, data.students), [data.schedule, data.students]);
  const coverage = useMemo(() => computeCoverage(data.schedule, data.students, data.lessons), [data.schedule, data.students, data.lessons]);
  const filteredStudents = useMemo(() => data.students.filter((s: any) => `${s.lastName || ""} ${s.firstName || ""}`.toLowerCase().includes(search.toLowerCase())), [search, data.students]);

  return (
    <WorkspaceShell title="Master Scheduler" description="Πλήρης διαχείριση προγράμματος">
      <div className="flex gap-3 mb-6">
        <input placeholder="Αναζήτηση..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[#1e2330] border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm w-80" />
        <button onClick={handleAutoGenerate} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold"><Zap size={16} /> Αυτόματη Δημιουργία</button>
        <button onClick={handleClearSchedule} className="bg-[#1e2330] text-rose-400 border border-rose-500/30 px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold"><Trash2 size={16} /> Καθαρισμός</button>
      </div>
      {data.schedule.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <QualityRow ok={quality.balanced} label="Ισοκατανομή εβδομάδας" detail={`Ανά μέρα: ${quality.perDay.filter((n) => n > 0).join(" · ") || "—"}`} />
          <QualityRow ok={quality.studentGaps === 0} label="Ελάχιστα κενά μαθητών" detail={quality.studentGaps === 0 ? "Χωρίς κενά 🎉" : `${quality.studentGaps} ώρες κενά συνολικά`} />
          <QualityRow ok={quality.teacherGaps === 0} label="Ελάχιστα κενά καθηγητών" detail={quality.teacherGaps === 0 ? "Χωρίς κενά 🎉" : `${quality.teacherGaps} ώρες κενά συνολικά`} />
        </div>
      )}
      {data.schedule.length > 0 && (
        coverage.shortfalls.length === 0 ? (
          <div className="mb-8 flex items-center gap-3 p-4 rounded-2xl border bg-emerald-950/20 border-emerald-900/40">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <p className="text-xs font-bold text-emerald-400">Όλες οι δηλωμένες ώρες των μαθημάτων καλύφθηκαν πλήρως.</p>
          </div>
        ) : (
          <div className="mb-8 p-4 rounded-2xl border bg-rose-950/20 border-rose-900/50">
            <div className="flex items-center gap-2 mb-3"><AlertTriangle size={18} className="text-rose-400" /><p className="text-xs font-black text-rose-400 uppercase tracking-wider">Ακάλυπτες ώρες ({coverage.shortfalls.length})</p></div>
            <div className="space-y-1.5">
              {coverage.shortfalls.map((s, i) => (
                <div key={i} className="text-[11px] bg-[#0b0e14] border border-rose-900/30 rounded-xl px-3 py-2">
                  <span className="text-white font-bold">{s.className} · {s.lessonName}</span>: <span className="text-rose-400 font-bold">{s.scheduled}/{s.expected} ώρες</span> <span className="text-slate-500">(λείπει {s.missing}ω)</span>
                  <div className="text-slate-500 mt-0.5">Επηρεάζονται: {s.students.slice(0, 6).join(", ")}{s.students.length > 6 ? ` +${s.students.length - 6}` : ""}</div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-3">Συνήθεις αιτίες: περιορισμένη διαθεσιμότητα μαθητών/καθηγητή, όριο 4 ωρών/μέρα, ή λίγες ελεύθερες αίθουσες. Δοκίμασε ξανά «Αυτόματη Δημιουργία» ή χαλάρωσε περιορισμούς.</p>
          </div>
        )
      )}
      <div className="flex gap-2 mb-8">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2 rounded-xl text-sm font-bold ${activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-[#1e2330] text-slate-400"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      {!loading && (
        <>
          {activeTab === "classes" && <ClassesView schedule={data.schedule} classes={filteredClasses} students={data.students} />}
          {activeTab === "grid" && <GridView schedule={data.schedule} onUpdate={loadData} />}
          {activeTab === "teachers" && <TeachersView schedule={data.schedule} teachers={data.teachers} />}
          {activeTab === "rooms" && <RoomsView schedule={data.schedule} rooms={data.rooms} />}
          {activeTab === "students" && <StudentsView students={filteredStudents} />}
        </>
      )}
    </WorkspaceShell>
  );
}

function QualityRow({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${ok ? "bg-emerald-950/20 border-emerald-900/40" : "bg-amber-950/20 border-amber-900/40"}`}>
      {ok ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />}
      <div>
        <p className={`text-xs font-bold ${ok ? "text-emerald-400" : "text-amber-400"}`}>{label}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

function StudentsView({ students }: { students: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {students.map((s: any, i: number) => (
        <div key={i} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 text-white">
          <p className="font-bold">{[s.lastName, s.firstName].join(" ")}</p>
          <p className="text-slate-500 text-xs">{s.grade}</p>
        </div>
      ))}
    </div>
  );
}
