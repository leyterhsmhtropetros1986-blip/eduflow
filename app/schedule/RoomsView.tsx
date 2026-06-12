"use client";

interface RoomsViewProps {
  schedule: any[];
  rooms: any[];
}

const dayOrder = [
  "Δευτέρα",
  "Τρίτη",
  "Τετάρτη",
  "Πέμπτη",
  "Παρασκευή",
  "Σάββατο",
];

export function RoomsView({ schedule, rooms }: RoomsViewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

      {rooms.map((room: any, rIdx: number) => {
        const roomName = room.name || room.title || "";

        const sessions = schedule
          .filter((s: any) => s.room === roomName)
          .sort((a: any, b: any) => {
            const d = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            if (d !== 0) return d;
            return a.time.localeCompare(b.time);
          });

        return (
          <div
            key={room.id ?? roomName ?? rIdx}
            className="bg-[#1e2330] border border-slate-800 rounded-3xl overflow-hidden"
          >
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-white text-xl font-black">🏫 {roomName || "Αίθουσα"}</h2>
              <p className="text-slate-500 text-xs">
                Συνολικά Μαθήματα: {sessions.length}
              </p>
            </div>

            <div className="p-5 space-y-2">
              {sessions.length === 0 && (
                <div className="text-xs text-slate-600 italic">
                  Δεν υπάρχουν κρατήσεις.
                </div>
              )}

              {sessions.map((session: any, idx: number) => (
                <div
                  key={session.id ?? idx}
                  className="bg-[#0b0e14] border border-slate-800 rounded-xl p-3 flex justify-between"
                >
                  <div>
                    <p className="text-white font-bold text-sm">{session.groupName}</p>
                    <p className="text-[10px] text-slate-500">👨‍🏫 {session.teacher}</p>
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
