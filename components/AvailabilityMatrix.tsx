"use client";

interface AvailabilitySlot {
  day: string;
  start: string;
  end: string;
}

interface AvailabilityMatrixProps {
  availability: AvailabilitySlot[];
  onChange: (updated: AvailabilitySlot[]) => void;
}

const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const HOURS = ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];

export function AvailabilityMatrix({ availability, onChange }: AvailabilityMatrixProps) {
  
  const toggleSlot = (day: string, hour: string) => {
    // Υπολογισμός λήξης (π.χ. "14:00" -> "15:00")
    const startHourInt = parseInt(hour.split(":")[0]);
    const endHourStr = `${startHourInt + 1}:00`;

    const exists = availability.some(
      (slot) => slot.day === day && slot.start === hour
    );

    if (exists) {
      // Αν υπάρχει ήδη, το αφαιρούμε (uncheck)
      onChange(availability.filter((slot) => !(slot.day === day && slot.start === hour)));
    } else {
      // Αν δεν υπάρχει, το προσθέτουμε (check)
      onChange([...availability, { day, start: hour, end: endHourStr }]);
    }
  };

  const isSelected = (day: string, hour: string) => {
    return availability.some((slot) => slot.day === day && slot.start === hour);
  };

  return (
    <div className="bg-[#0b0e14] p-4 rounded-2xl border border-indigo-500/10 space-y-3">
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Πίνακας Διαθεσιμότητας</span>
        <span className="text-[10px] text-slate-500 mt-0.5">Κάντε κλικ στα κουτάκια για εναλλαγή (On/Off).</span>
      </div>

      <div className="overflow-x-auto select-none">
        <table className="w-full border-collapse min-w-[450px]">
          <thead>
            <tr>
              <th className="p-1 text-[10px] font-black text-slate-500 text-left uppercase tracking-wider w-14">Ώρα</th>
              {DAYS.map((day) => (
                <th key={day} className="p-1 text-[10px] font-black text-slate-400 text-center uppercase tracking-wider">
                  {day.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} className="border-t border-slate-900">
                <td className="p-1.5 text-[10px] font-mono text-slate-500 font-bold align-middle">{hour}</td>
                {DAYS.map((day) => {
                  const active = isSelected(day, hour);
                  return (
                    <td key={day} className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSlot(day, hour)}
                        className={`w-full h-7 rounded-lg transition-all border outline-none ${
                          active
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                            : "bg-[#161a24] border-slate-800/80 text-transparent hover:border-slate-700"
                        }`}
                      >
                        ✓
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] font-semibold pt-1 text-slate-500 border-t border-slate-900">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40"></div>
          <span>Επιλεγμένο ({availability.length} ώρες)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-[#161a24] border border-slate-800"></div>
          <span>Κενό</span>
        </div>
      </div>
    </div>
  );
}