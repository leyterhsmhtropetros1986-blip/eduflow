"use client";

export function ClassesView({ schedule, classes, students }: any) {
  const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {classes.map((cls: any) => {
        // 1. Dynamic Resolution based on Schedule
        const sessions = schedule.filter((s: any) => s.groupName === cls.name && s.subject === cls.subject);
        const teacherName = sessions.length > 0 ? sessions[0].teacher : "Δεν έχει ανατεθεί";
        const roomName = sessions.length > 0 ? sessions[0].room : "-";

        // 2. Safe Student Filter
        const classStudents = students.filter((s: any) => 
          s.classId === cls.id || 
          s.className === cls.name || 
          s.enrollments?.some((e: any) => e.classId === cls.id || e.className === cls.name)
        );

        return (
          <div key={cls.id} className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 flex flex-col shadow-xl">
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-white font-black text-xl">{cls.name}</h3>
              <p className="text-slate-500 text-xs font-bold uppercase">{cls.grade}</p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800">
                <p className="text-[9px] text-slate-500 uppercase">Καθηγητής</p>
                <p className="text-xs text-white font-bold truncate">{teacherName}</p>
              </div>
              <div className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800">
                <p className="text-[9px] text-slate-500 uppercase">Αίθουσα</p>
                <p className="text-xs text-white font-bold">{roomName}</p>
              </div>
            </div>

            {/* Weekly Grid */}
            <div className="mb-6 border border-slate-800 rounded-xl overflow-hidden bg-[#0b0e14]">
              {days.map(day => {
                const session = sessions.find((s: any) => s.day === day);
                return (
                  <div key={day} className="flex text-[10px] border-b border-slate-800 last:border-0">
                    <div className="w-1/3 p-2 text-slate-400 font-bold bg-slate-900/30">{day}</div>
                    <div className="w-2/3 p-2 text-white font-mono">{session ? session.time : "-"}</div>
                  </div>
                );
              })}
            </div>

            {/* Students List */}
            <div className="flex-grow">
              <p className="text-[10px] uppercase font-bold text-slate-600 mb-2 flex items-center gap-2">
                👥 Μαθητές ({classStudents.length})
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {classStudents.map((s: any, i: number) => (
                  <p key={i} className="text-xs text-slate-400 border-l-2 border-indigo-500/20 pl-2">
                    {s.name}
                  </p>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between gap-2">
              <button className="flex-1 py-2 rounded-lg bg-slate-800 text-[10px] font-bold hover:bg-slate-700">✏ Edit</button>
              <button className="flex-1 py-2 rounded-lg bg-slate-800 text-[10px] font-bold hover:bg-slate-700">📄 Print</button>
              <button className="flex-1 py-2 rounded-lg bg-indigo-600 text-[10px] font-bold hover:bg-indigo-500">📤 PDF</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}