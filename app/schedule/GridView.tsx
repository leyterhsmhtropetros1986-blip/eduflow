"use client";

import { Fragment } from "react";

interface GridViewProps {
  schedule: any[];
}

export function GridView({ schedule }: GridViewProps) {
  const days = [
    "Δευτέρα",
    "Τρίτη",
    "Τετάρτη",
    "Πέμπτη",
    "Παρασκευή",
    "Σάββατο",
  ];

  const hours = Array.from({ length: 13 }, (_, i) => {
    const h = i + 9;
    return `${h.toString().padStart(2, "0")}:00`;
  });

  return (
    <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 overflow-x-auto">

      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: "80px repeat(6, minmax(140px,1fr))",
        }}
      >
        {/* Header */}

        <div></div>

        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-slate-400 py-3 bg-[#0b0e14]"
          >
            {day}
          </div>
        ))}

        {/* Body */}

        {hours.map((hour) => (
          <Fragment key={hour}>
            <div className="flex items-start justify-center text-xs text-slate-500 pt-3 bg-[#0b0e14]">
              {hour}
            </div>

            {days.map((day) => {
              const sessions = schedule.filter(
                (s) =>
                  s.day === day &&
                  s.time.substring(0, 2) === hour.substring(0, 2)
              );

              return (
                <div
                  key={`${day}-${hour}`}
                  className="min-h-[70px] border border-slate-800 bg-[#0b0e14] p-1"
                >
                  {sessions.map((session: any, idx: number) => (
                    <div
                      key={session.id ?? idx}
                      className="mb-1 rounded-lg bg-indigo-600/20 border-l-4 border-indigo-500 p-2 hover:bg-indigo-600/30 transition"
                    >
                      <p className="text-[11px] font-bold text-white truncate">
                        {session.groupName}
                      </p>

                      <p className="text-[10px] text-indigo-300 truncate">
                        👨‍🏫 {session.teacher}
                      </p>

                      <p className="text-[10px] text-slate-400 truncate">
                        🏫 {session.room}
                      </p>

                      <p className="text-[10px] text-slate-500">
                        {session.time}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
