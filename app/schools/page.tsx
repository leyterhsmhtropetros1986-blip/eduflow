"use client";
import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus } from "lucide-react";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<string[]>([]);
  const [newSchool, setNewSchool] = useState("");

  useEffect(() => {
    setSchools(JSON.parse(localStorage.getItem("eduflow_schools") || "[]"));
  }, []);

  const addSchool = () => {
    if (!newSchool) return;
    const updated = [...schools, newSchool];
    setSchools(updated);
    localStorage.setItem("eduflow_schools", JSON.stringify(updated));
    setNewSchool("");
  };

  const deleteSchool = (school: string) => {
    const updated = schools.filter(s => s !== school);
    setSchools(updated);
    localStorage.setItem("eduflow_schools", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell title="Διαχείριση Σχολείων" description="Ορισμός σχολείων για το σύστημα.">
      <div className="max-w-md bg-[#1e2330] p-6 rounded-3xl border border-slate-800">
        <div className="flex gap-2 mb-6">
          <input 
            className="flex-1 bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white"
            value={newSchool} 
            onChange={(e) => setNewSchool(e.target.value)} 
            placeholder="Π.χ. 1ο Λύκειο Χαλκίδας" 
          />
          <button onClick={addSchool} className="bg-indigo-600 text-white p-2 rounded"><Plus size={18}/></button>
        </div>
        <ul className="space-y-2">
          {schools.map((s, i) => (
            <li key={i} className="flex justify-between items-center bg-[#0b0e14] p-3 rounded text-white text-xs border border-slate-800">
              {s}
              <button onClick={() => deleteSchool(s)} className="text-rose-500"><Trash2 size={14}/></button>
            </li>
          ))}
        </ul>
      </div>
    </WorkspaceShell>
  );
}