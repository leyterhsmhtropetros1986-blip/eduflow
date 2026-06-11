"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, School, BookOpen, Users, MapPin } from "lucide-react";

export default function SettingsPage() {
  const [data, setData] = useState({
    schools: [] as string[],
    courses: [] as string[],
    classes: [] as { id: string, name: string }[],
    rooms: [] as { id: string, name: string }[],
  });

  useEffect(() => {
    setData({
      schools: JSON.parse(localStorage.getItem("eduflow_schools") || "[]"),
      courses: JSON.parse(localStorage.getItem("eduflow_courses") || "[]"),
      classes: JSON.parse(localStorage.getItem("eduflow_classes") || "[]"),
      rooms: JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"),
    });
  }, []);

  const saveItem = (key: keyof typeof data, value: string) => {
    if (!value) return;
    
    let newItem: any;

    if (key === "classes" || key === "rooms") {
      newItem = { id: `id-${Date.now()}`, name: value };
    } else {
      newItem = value;
    }

    const updated = [...(data[key] as any[]), newItem];
    
    localStorage.setItem(`eduflow_${key}`, JSON.stringify(updated));
    setData(prev => ({ ...prev, [key]: updated }));
  };

  const removeItem = (key: keyof typeof data, index: number) => {
    const updated = (data[key] as any[]).filter((_, i) => i !== index);
    localStorage.setItem(`eduflow_${key}`, JSON.stringify(updated));
    setData(prev => ({ ...prev, [key]: updated }));
  };

  return (
    <WorkspaceShell title="Ρυθμίσεις" description="Διαχείριση βασικών δεδομένων συστήματος.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        
        <SettingsCard title="Σχολεία" icon={<School size={16}/>} onAdd={(val) => saveItem("schools", val)}>
           {data.schools.map((item, i) => (
             <ListItem key={i} label={item} onRemove={() => removeItem("schools", i)} />
           ))}
        </SettingsCard>

        <SettingsCard title="Μαθήματα" icon={<BookOpen size={16}/>} onAdd={(val) => saveItem("courses", val)}>
           {data.courses.map((item, i) => (
             <ListItem key={i} label={item} onRemove={() => removeItem("courses", i)} />
           ))}
        </SettingsCard>

        <SettingsCard title="Τμήματα" icon={<Users size={16}/>} onAdd={(val) => saveItem("classes", val)}>
           {data.classes.map((item: any, i) => (
             <ListItem key={item.id} label={item.name} onRemove={() => removeItem("classes", i)} />
           ))}
        </SettingsCard>

        <SettingsCard title="Αίθουσες" icon={<MapPin size={16}/>} onAdd={(val) => saveItem("rooms", val)}>
           {data.rooms.map((item: any, i) => (
             <ListItem key={item.id} label={item.name} onRemove={() => removeItem("rooms", i)} />
           ))}
        </SettingsCard>

      </div>
    </WorkspaceShell>
  );
}

function SettingsCard({ title, icon, children, onAdd }: any) {
  const [input, setInput] = useState("");
  
  return (
    <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
      <h2 className="font-bold text-white text-xs mb-4 flex items-center gap-2 uppercase tracking-wider text-indigo-400">
        {icon} {title}
      </h2>
      <div className="flex gap-2 mb-4">
        <input 
          className="bg-[#0b0e14] border border-slate-800 p-2 rounded-xl text-xs text-white flex-1" 
          placeholder={`Προσθήκη...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-indigo-600 text-white p-2 px-4 rounded-xl hover:bg-indigo-500 transition-all" onClick={() => { onAdd(input); setInput(""); }}>
          <Plus size={16} />
        </button>
      </div>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

// Εδώ προστέθηκε η αγκύλη { που έλειπε
function ListItem({ label, onRemove }: { label: string, onRemove: () => void }) {
  return (
    <li className="flex justify-between items-center p-3 bg-[#0b0e14] border border-slate-800 rounded-xl text-xs text-slate-300">
      {label}
      <button onClick={onRemove} className="text-slate-600 hover:text-rose-500"><Trash2 size={14}/></button>
    </li>
  );
}