"use client";

interface TeachersViewProps {
  schedule: any[];
  teachers: any[];
}

const dayOrder = [
  "Δευτέρα",
  "Τρίτη",
  "Τετάρτη",
  "Πέμπτη",
  "Παρασκευή",
  "Σάββατο",
];

// Το ίδιο string που γράφει ο auto-scheduler: "Επώνυμο Όνομα"
function teacherDisplayName(t: any) {
  return t.name || `${t.lastName || ""} ${t.firstName || ""}`.trim();
}

export function TeachersView({ schedule, teachers }: TeachersViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

      {teachers.map((teacher: any, tIdx: number) => {
        const name = teacherDisplayName(teacher);

        const sessions = schedule
          .filter((s: any) => s.teacher === name)
          .sort((a: any, b: any) => {
            const day = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            if (day !== 0) return day;
            return a.time.localeCompare(b.time);
          });

        return (
          <div
            key={teacher.id ?? tIdx}
            className="bg-[#1e2330] border border-slate-800 rounded-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-white font-black text-xl">{name || "Καθηγητής"}</h2>
              <p className="text-indigo-400 text-xs uppercase font-bold">
                {teacher.subject || "-"}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 p-5">
              <div className="bg-[#0b0e14] rounded-xl p-3">
                <p className="text-[10px] uppercase text-slate-500">Μαθήματα</p>
                <p className="text-xl font-black text-white">{sessions.length}</p>
              </div>

              <div className="bg-[#0b0e14] rounded-xl p-3">
                <p className="text-[10px] uppercase text-slate-500">Διαθεσιμότητα</p>
                <p className="text-sm text-emerald-400 font-bold">
                  {teacher.availability?.length ?? 0} ώρες
                </p>
              </div>
            </div>

            {/* Schedule */}
            <div className="px-5 pb-5 space-y-2">
              {sessions.length === 0 && (
                <div className="text-xs text-slate-600 italic">
                  Δεν υπάρχουν αναθέσεις.
                </div>
              )}

              {sessions.map((session: any, idx: number) => (
                <div
                  key={session.id ?? idx}
                  className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white text-sm font-bold">{session.groupName}</p>
                    <p className="text-[10px] text-slate-500">
                      📘 {session.subject}{session.room ? ` • 🏫 ${session.room}` : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-indigo-400 text-xs font-bold">{session.day}</p>
                    <p className="text-white text-xs">{session.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
