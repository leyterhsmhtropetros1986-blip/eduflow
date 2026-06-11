"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Save, Plus } from "lucide-react";

export default function SettingsPage() {
  const [data, setData] = useState({
    teachers: [] as any[],
    classes: [] as any[],
    courses: [] as string[],
    rooms: [] as any[],
  });

  // Load initial data
  useEffect(() => {
    setData({
      teachers: JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"),
      classes: JSON.parse(localStorage.getItem("eduflow_classes") || "[]"),
      courses: JSON.parse(localStorage.getItem("eduflow_courses") || "[]"),
      rooms: JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"),
    });
  }, []);

  const saveItem = (key: string, item: any) => {
    if (!item) return;
    const updated = [...data[key as keyof typeof data], item];
    localStorage.setItem(`eduflow_${key}`, JSON.stringify(updated));
    setData(prev => ({ ...prev, [key]: updated }));
  };

  const removeItem = (key: string, index: number) => {
    const updated = data[key as keyof typeof data].filter((_, i) => i !== index);
    localStorage.setItem(`eduflow_${key}`, JSON.stringify(updated));
    setData(prev => ({ ...prev, [key]: updated }));
  };

  return (
    <WorkspaceShell title="Ρυθμίσεις" description="Διαχείριση βασικών δεδομένων συστήματος.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ΜΑΘΗΜΑΤΑ */}
        <SettingsCard title="Μαθήματα" onAdd={(val) => saveItem("courses", val)}>
          <ul className="space-y-2 mt-4">
            {data.courses.map((c, i) => (
              <li key={i} className="flex justify-between p-2 bg-slate-100 rounded text-sm">
                {c} <button onClick={() => removeItem("courses", i)} className="text-red-500"><Trash2 size={14}/></button>
              </li>
            ))}
          </ul>
        </SettingsCard>

        {/* ΤΑΞΕΙΣ */}
        <SettingsCard title="Τάξεις (Τμήματα)" onAdd={(val) => saveItem("classes", { name: val })}>
           <ul className="space-y-2 mt-4">
            {data.classes.map((c, i) => (
              <li key={i} className="flex justify-between p-2 bg-slate-100 rounded text-sm">
                {c.name} <button onClick={() => removeItem("classes", i)} className="text-red-500"><Trash2 size={14}/></button>
              </li>
            ))}
          </ul>
        </SettingsCard>

        {/* ΑΙΘΟΥΣΕΣ */}
        <SettingsCard title="Αίθουσες" onAdd={(val) => saveItem("rooms", { name: val })}>
           <ul className="space-y-2 mt-4">
            {data.rooms.map((r, i) => (
              <li key={r.id} className="flex justify-between p-2 bg-slate-100 rounded text-sm">
                {r.name} <button onClick={() => removeItem("rooms", i)} className="text-red-500"><Trash2 size={14}/></button>
              </li>
            ))}
          </ul>
        </SettingsCard>

      </div>
    </WorkspaceShell>
  );
}

// Βοηθητικό Component για τις κάρτες
function SettingsCard({ title, children, onAdd }: { title: string, children: React.ReactNode, onAdd: (val: string) => void }) {
  const [input, setInput] = useState("");
  
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <h2 className="font-bold text-lg mb-4">{title}</h2>
      <div className="flex gap-2">
        <input 
          className="border p-2 rounded-lg flex-1 text-sm" 
          placeholder={`Προσθήκη ${title.toLowerCase()}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button 
          className="bg-cyan-600 text-white p-2 px-4 rounded-lg" 
          onClick={() => { onAdd(input); setInput(""); }}
        >
          <Plus size={18} />
        </button>
      </div>
      {children}
    </div>
  );
}