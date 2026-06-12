"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { ClassesView } from "./ClassesView";
import { GridView } from "./GridView";
import { TeachersView } from "./TeachersView";
import { RoomsView } from "./RoomsView";
import { Users, BookOpen, UserCheck, Building2, CalendarDays, Zap, AlertTriangle, Trash2 } from "lucide-react";

/* =========================================================================
   UTILS & GENERATOR
   ========================================================================= */

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
  return day === "Σάββατο" ? [9, 10, 11, 12, 13, 14, 15, 16] : [14, 15, 16, 17, 18, 19, 20, 21];
}

function genHH(h: number) { return `${String(h).padStart(2, "0")}:00`; }

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

// ΣΥΝΑΡΤΗΣΗ ΒΑΘΜΟΛΟΓΗΣΗΣ
function calculateScore(schedule: any[], students: any[]): number {
    let score = schedule.length * 1000; // Reward για κάθε μάθημα

    schedule.forEach(item => {
        const startHour = parseInt(item.time.split(':')[0]);
        // Penalty αν το μάθημα είναι αργά (μετά τις 20:00)
        if (startHour >= 20) score -= 100;
    });

    // Penalty για κενά μαθητών (Gaps)
    students.forEach(s => {
        DAYS_MAP.forEach(day => {
            const studentDayItems = schedule.filter(i => i.groupName === s.class && i.day === day)
                                            .sort((a,b) => parseInt(a.time) - parseInt(b.time));
            for (let i = 0; i < studentDayItems.length - 1; i++) {
                const endCurrent = parseInt(studentDayItems[i].time.split('-')[1]);
                const startNext = parseInt(studentDayItems[i+1].time.split('-')[0]);
                const gap = startNext - endCurrent;
                if (gap > 0) score -= (gap * 50); // Κάθε ώρα κενού αφαιρεί σκορ
            }
        });
    });
    return score;
}

function generateSchedule(data: { students: any[]; teachers: any[]; classes: any[]; rooms: any[]; lessons: any[] }): { schedule: any[], unplaced: any[], placed: number } {
  const { students = [], teachers = [], classes = [], rooms = [], lessons = [] } = data;
  
  let bestResult = { schedule: [], unplaced: [], placed: -1, score: -Infinity };

  for (let attempt = 0; attempt < 50; attempt++) {
    const teacherBusy = new Set<string>();
    const roomBusy = new Set<string>();
    const groupBusy = new Set<string>();
    const studentBusy = new Set<string>();
    const teacherLoad: Record<string, number> = {}; // Tracking load
    
    const schedule: any[] = [];
    const unplaced: any[] = [];
    const roomNames = (rooms || []).map((r: any) => r.name || r.title || r).filter(Boolean);

    const pairs: Record<string, any> = {};
    students.forEach((s) => {
      (s.enrollments || []).forEach((e: any) => {
        if (!e.lessonName || !e.className) return;
        const key = `${e.lessonName}|||${e.className}`;
        if (!pairs[key]) pairs[key] = { lessonName: e.lessonName, className: e.className, students: [] };
        pairs[key].students.push(s);
      });
    });

    const sessions = shuffleArray(Object.values(pairs));

    for (const ses of sessions) {
      const lessonInfo = lessons.find((l: any) => l.name === ses.lessonName);
      const distribution = lessonInfo ? [...lessonInfo.distribution].sort((a, b) => b - a) : [1];
      const minGap = lessonInfo?.minGapDays ?? 1;
      
      // Επιλογή καθηγητή με το μικρότερο load
      const candidates = teachers.filter((t) => t.subject === ses.lessonName);
      const bestTeacher = candidates.sort((a,b) => {
          const nameA = `${a.lastName || ""} ${a.firstName || ""}`.trim();
          const nameB = `${b.lastName || ""} ${b.firstName || ""}`.trim();
          return (teacherLoad[nameA] || 0) - (teacherLoad[nameB] || 0);
      })[0];

      if (!bestTeacher) {
        unplaced.push({ ...ses, reason: "Δεν υπάρχει καθηγητής" });
        continue;
      }

      const tName = `${bestTeacher.lastName || ""} ${bestTeacher.firstName || ""}`.trim();
      
      const tempSchedule: any[] = [];
      const tempBusy = { teacher: [] as string[], group: [] as string[], student: [] as string[], room: [] as string[] };
      let placedAllBlocks = true;
      let usedDayIndices: number[] = [];

      for (const blockHours of distribution) {
        let placedBlock = false;
        const shuffledDays = shuffleArray(DAYS_MAP);

        for (const day of shuffledDays) {
          const dayIdx = DAYS_MAP.indexOf(day);
          if (usedDayIndices.some(uIdx => Math.abs(uIdx - dayIdx) <= minGap)) continue;

          const availableHours = genDayHours(day);
          const shuffledHours = shuffleArray(availableHours);

          for (const h of shuffledHours) {
            const isWithinBounds = (h + blockHours - 1) <= Math.max(...availableHours);
            if (!isWithinBounds) continue;

            const timeSlots = [];
            for(let i=0; i<blockHours; i++) timeSlots.push(genHH(h + i));

            let possible = true;
            for (const ts of timeSlots) {
              const tKey = makeKey(tName, day, ts);
              const gKey = makeKey(ses.className, day, ts);
              if (teacherBusy.has(tKey) || groupBusy.has(gKey)) { possible = false; break; }
              if (!genIsAvailable(bestTeacher.availability, bestTeacher.lockedSlots, day, ts)) { possible = false; break; }
              
              for (const st of ses.students) {
                const sKey = makeKey(st.id, day, ts);
                if (studentBusy.has(sKey) || !genIsAvailable(st.availability, st.lockedSlots, day, ts)) { possible = false; break; }
              }
              
              if (roomNames.length > 0) {
                 if (roomNames.every(rn => roomBusy.has(makeKey(rn, day, ts)))) { possible = false; break; }
              }
            }

            if (possible) {
              const room = roomNames.find(rn => !timeSlots.some(ts => roomBusy.has(makeKey(rn, day, ts))));
              
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

              tempSchedule.push({ id: `${ses.className}-${ses.lessonName}-${day}-${h}`, groupName: ses.className, teacher: tName, day, time: `${genHH(h)}-${genHH(h + blockHours)}`, subject: ses.lessonName, room });
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
        teacherLoad[tName] = (teacherLoad[tName] || 0) + 1;
      } else {
        tempBusy.teacher.forEach(k => teacherBusy.delete(k));
        tempBusy.group.forEach(k => groupBusy.delete(k));
        tempBusy.student.forEach(k => studentBusy.delete(k));
        tempBusy.room.forEach(k => roomBusy.delete(k));
        unplaced.push({ ...ses, reason: "Αποτυχία τοποθέτησης ολοκληρωμένου distribution" });
      }
    }

    const currentScore = calculateScore(schedule, students);
    if (currentScore > bestResult.score) {
      bestResult = { schedule, unplaced, placed: schedule.length, score: currentScore };
    }
  }

  return bestResult;
}

/* =========================================================================
   COMPONENT
   ========================================================================= */

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
  const [genResult, setGenResult] = useState<any>(null);
  const [data, setData] = useState({ schedule: [], classes: [], students: [], teachers: [], rooms: [], lessons: [] });
  const [search, setSearch] = useState("");

  const loadData = () => {
    try {
      setData({
        schedule: JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"),
        classes: JSON.parse(localStorage.getItem("eduflow_classes") || "[]"),
        students: JSON.parse(localStorage.getItem("eduflow_students") || "[]"),
        teachers: JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"),
        rooms: JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"),
        lessons: JSON.parse(localStorage.getItem("eduflow_lessons") || "[]"),
      });
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData(); setLoading(false); }, []);

  const handleAutoGenerate = () => {
    if (data.schedule.length > 0 && !confirm("Να αντικατασταθεί το υπάρχον πρόγραμμα;")) return;
    const result = generateSchedule(data);
    localStorage.setItem("eduflow_schedule", JSON.stringify(result.schedule));
    loadData();
    setGenResult(result);
    setActiveTab("grid");
  };

  const handleClearSchedule = () => {
    if (confirm("Καθαρισμός προγράμματος;")) {
      localStorage.setItem("eduflow_schedule", "[]");
      loadData();
      setGenResult(null);
    }
  };

  const filteredClasses = useMemo(() => data.classes.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase())), [search, data.classes]);
  const filteredStudents = useMemo(() => data.students.filter((s: any) => s.name?.toLowerCase().includes(search.toLowerCase())), [search, data.students]);

  return (
    <WorkspaceShell title="Master Scheduler" description="Πλήρης διαχείριση προγράμματος">
      <div className="flex gap-3 mb-6">
        <input placeholder="Αναζήτηση..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-[#1e2330] border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm w-80" />
        <button onClick={handleAutoGenerate} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold"><Zap size={16} /> Αυτόματη Δημιουργία</button>
        <button onClick={handleClearSchedule} className="bg-[#1e2330] text-rose-400 border border-rose-500/30 px-5 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold"><Trash2 size={16} /> Καθαρισμός</button>
      </div>

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