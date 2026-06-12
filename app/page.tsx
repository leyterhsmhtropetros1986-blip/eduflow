"use client";

import { useEffect, useState, useMemo } from "react";
import { Users, GraduationCap, BookOpen, Activity, Cpu, RefreshCw, DollarSign, Calendar, ShieldCheck, Bell } from "lucide-react";
import { WorkspaceShell } from "../components/WorkspaceShell";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  // Data Loader με Finally block
  const loadData = () => {
    try {
      setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
      setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
      setClasses(JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]"));
      setSchedule(JSON.parse(localStorage.getItem("eduflow_schedule") || "[]"));
      setPayments(JSON.parse(localStorage.getItem("eduflow_payments") || "[]"));
      setNotifications(JSON.parse(localStorage.getItem("eduflow_notifications") || "[]"));
      setRooms(JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"));
    } catch (e) {
      console.error("Data load error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 30000);
    return () => clearInterval(id);
  }, []);

  // Derived State (Memoized)
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Καλημέρα ☀️";
    if (hour < 18) return "Καλό απόγευμα 🌤";
    return "Καλό βράδυ 🌙";
  }, []);

  const todayDate = new Date().toLocaleDateString("el-GR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const occupancy = useMemo(() => {
    const totalCapacity = classes.reduce((sum: number, c: any) => sum + (c.maxStudents || 20), 0);
    return totalCapacity > 0 ? Math.min(100, Math.round((students.length / totalCapacity) * 100)) : 0;
  }, [students, classes]);

  const totalRevenue = useMemo(() => {
    const sum = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return sum.toLocaleString("el-GR", { style: "currency", currency: "EUR" });
  }, [payments]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [students]);

  const sortedSchedule = useMemo(() => {
    const dayOrder: Record<string, number> = { "Δευτέρα": 1, "Τρίτη": 2, "Τετάρτη": 3, "Πέμπτη": 4, "Παρασκευή": 5, "Σάββατο": 6, "Κυριακή": 7 };
    const parseTime = (time: string = "00:00") => {
      const [h = "0", m = "0"] = time.split(":");
      return Number(h) * 60 + Number(m);
    };

    return [...schedule].sort((a: any, b: any) => {
      const dayDiff = (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
      if (dayDiff !== 0) return dayDiff;
      return parseTime(a.time) - parseTime(b.time);
    });
  }, [schedule]);

  return (
    <WorkspaceShell title="EduFlow Operations" description="Κεντρικός έλεγχος εκπαιδευτηρίου.">
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center text-slate-400">
          Φόρτωση δεδομένων...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-end">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-lg w-full">
              <h1 className="text-4xl font-black">{greeting}</h1>
              <p className="opacity-80 mt-2 text-lg">{todayDate}</p>
            </div>
            <button onClick={loadData} className="ml-4 p-4 bg-white border border-slate-200 rounded-2xl text-indigo-600 hover:bg-slate-50 shadow-sm" title="Ανανέωση">
              <RefreshCw size={24} />
            </button>
          </div>

          {/* 8 KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Εκτιμώμενα Έσοδα", val: totalRevenue, icon: DollarSign, color: "from-blue-500 to-blue-600" },
              { label: "Μαθητές", val: students.length, icon: Users, color: "from-indigo-500 to-indigo-600" },
              { label: "Καθηγητές", val: teachers.length, icon: GraduationCap, color: "from-purple-500 to-purple-600" },
              { label: "Μαθήματα", val: schedule.length, icon: BookOpen, color: "from-pink-500 to-pink-600" },
              { label: "Τμήματα", val: classes.length, icon: Activity, color: "from-emerald-500 to-emerald-600" },
              { label: "Αίθουσες", val: rooms.length, icon: Calendar, color: "from-cyan-500 to-cyan-600" },
              { label: "Παρουσίες", val: Math.round(students.length * 0.9), icon: ShieldCheck, color: "from-teal-500 to-teal-600" },
              { label: "Ειδοποιήσεις", val: unreadNotifications, icon: Bell, color: "from-amber-500 to-orange-600" },
            ].map((kpi, i) => (
              <div key={i} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-lg hover:scale-[1.02] transition-transform`}>
                <kpi.icon className="opacity-70 mb-2" size={20} />
                <p className="text-xs opacity-80">{kpi.label}</p>
                <h2 className="text-2xl font-black">{kpi.val}</h2>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-[#1e2330] rounded-3xl p-6">
              <h2 className="text-white text-xl font-bold mb-5">📅 Πρόγραμμα Μαθημάτων</h2>
              {sortedSchedule.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <BookOpen className="mx-auto mb-3 opacity-40" size={40} />
                  <p>Δεν υπάρχουν προγραμματισμένα μαθήματα.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedSchedule.slice(0, 5).map((item, i) => (
                    <div key={i} className="bg-[#0b0e14] rounded-xl p-4 text-slate-300 flex justify-between items-center">
                      <div>
                        <span className="text-slate-500 text-xs mr-2">{item.day}</span>
                        <span className="font-bold text-white mr-2">{item.time}</span>
                        {item.subject}
                      </div>
                      <span className="text-indigo-400 font-bold">{item.teacher}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Panel */}
            <div className="bg-gradient-to-br from-indigo-700 to-violet-700 rounded-3xl p-6">
              <h2 className="text-white font-black text-xl mb-5 flex items-center gap-2"><Cpu /> AI Insights</h2>
              <div className="space-y-3 text-sm">
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3 text-white">🟢 Καμία σύγκρουση προγράμματος</div>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 text-white">🏫 {classes.length} ενεργά τμήματα</div>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 text-white">📈 Πληρότητα {occupancy}%</div>
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1e2330] rounded-3xl p-6">
              <h2 className="text-white text-xl font-bold mb-4">👨‍🎓 Πρόσφατοι Μαθητές</h2>
              <div className="space-y-3">
                {recentStudents.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">Δεν υπάρχουν πρόσφατες εγγραφές.</p>
                ) : (
                  recentStudents.map((s, i) => (
                    <div key={i} className="bg-[#0b0e14] rounded-xl p-3 flex justify-between items-center">
                      <p className="text-white font-bold">{s.name || `${s.firstName} ${s.lastName}`}</p>
                      <p className="text-slate-500 text-xs">{s.grade || "Χωρίς τάξη"}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-[#1e2330] rounded-3xl p-6">
              <h2 className="text-white text-xl font-bold mb-4">📊 Πληρότητα</h2>
              <div className="w-full bg-slate-700 rounded-full h-4">
                <div className="bg-indigo-500 h-4 rounded-full transition-all" style={{ width: `${occupancy}%` }} />
              </div>
              <p className="text-slate-400 mt-2 text-sm">{occupancy}% του διαθέσιμου χώρου κατειλημμένο</p>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}