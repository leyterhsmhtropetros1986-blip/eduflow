"use client";

import { useMemo } from "react";

interface Slot { day: string; start: string; end: string; }
interface Props { availability: Slot[]; onChange: (slots: Slot[]) => void; }

const DAYS = [
  { key: "Δευτέρα", short: "ΔΕΥ" },
  { key: "Τρίτη", short: "ΤΡΙ" },
  { key: "Τετάρτη", short: "ΤΕΤ" },
  { key: "Πέμπτη", short: "ΠΕΜ" },
  { key: "Παρασκευή", short: "ΠΑΡ" },
  { key: "Σάββατο", short: "ΣΑΒ" },
];

// Ώρες έναρξης ανά μέρα: καθημερινές 14:00–23:00 (14..22), Σάββατο 09:00–17:00 (9..16)
const validHours = (day: string): number[] =>
  day === "Σάββατο" ? [9, 10, 11, 12, 13, 14, 15, 16] : [14, 15, 16, 17, 18, 19, 20, 21, 22];

// Ένωση όλων των πιθανών ωρών για τις γραμμές του πίνακα (9..22)
const ROWS = Array.from({ length: 14 }, (_, i) => i + 9);
const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

export function AvailabilityMatrix({ availability, onChange }: Props) {
  // Σύνολο επιλεγμένων "μέρα|ώρα"
  const selected = useMemo(() => {
    const set = new Set<string>();
    DAYS.forEach((d) => validHours(d.key).forEach((h) => {
      const on = (availability || []).some((s) => s.day === d.key && parseInt(s.start) <= h && h < parseInt(s.end));
      if (on) set.add(`${d.key}|${h}`);
    }));
    return set;
  }, [availability]);

  // Ανακατασκευή availability (συγχώνευση συνεχόμενων ωρών σε ένα slot ανά μέρα)
  const rebuild = (set: Set<string>): Slot[] => {
    const out: Slot[] = [];
    DAYS.forEach((d) => {
      const hrs = validHours(d.key).filter((h) => set.has(`${d.key}|${h}`)).sort((a, b) => a - b);
      let i = 0;
      while (i < hrs.length) {
        let j = i;
        while (j + 1 < hrs.length && hrs[j + 1] === hrs[j] + 1) j++;
        out.push({ day: d.key, start: pad(hrs[i]), end: pad(hrs[j] + 1) });
        i = j + 1;
      }
    });
    return out;
  };

  const toggle = (day: string, hour: number) => {
    const key = `${day}|${hour}`;
    const next = new Set(selected);
    next.has(key) ? next.delete(key) : next.add(key);
    onChange(rebuild(next));
  };

  const totalHours = selected.size;

  return (
    <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
      <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-wider">Πίνακας Διαθεσιμότητας</h3>
      <p className="text-slate-500 text-xs mb-4">Κάντε κλικ στα κουτάκια για εναλλαγή (On/Off).</p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[11px] font-bold text-slate-400 uppercase p-2 w-20">Ώρα</th>
              {DAYS.map((d) => <th key={d.key} className="text-center text-[11px] font-bold text-slate-300 uppercase p-2">{d.short}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((h) => (
              <tr key={h}>
                <td className="text-[11px] font-mono text-slate-400 p-2">{pad(h)}</td>
                {DAYS.map((d) => {
                  const valid = validHours(d.key).includes(h);
                  if (!valid) return <td key={d.key} className="p-1"><div className="h-9 rounded-lg bg-[#0b0e14]/40 border border-dashed border-slate-800/50" title="Εκτός ωραρίου"></div></td>;
                  const on = selected.has(`${d.key}|${h}`);
                  return (
                    <td key={d.key} className="p-1">
                      <button type="button" onClick={() => toggle(d.key, h)}
                        className={`w-full h-9 rounded-lg border transition-all ${on ? "bg-emerald-600 border-emerald-500 hover:bg-emerald-500" : "bg-[#0b0e14] border-slate-800 hover:border-slate-600"}`}
                        title={`${d.key} ${pad(h)}-${pad(h + 1)}`} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500"></span> Επιλεγμένο ({totalHours} ώρες)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#0b0e14] border border-slate-800"></span> Κενό</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border border-dashed border-slate-700"></span> Εκτός ωραρίου</span>
      </div>
    </div>
  );
}
