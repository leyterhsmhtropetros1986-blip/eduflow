"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { DoorOpen, Trash2 } from "lucide-react";

interface Room {
  id: string;
  name: string;
  capacity: number;
  availability: Record<string, string[]>;
}

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00", "22:00-23:00"];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [availability, setAvailability] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_rooms");
    if (stored) setRooms(JSON.parse(stored));
  }, []);

  const toggleSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(slot) ? daySlots.filter(s => s !== slot) : [...daySlots, slot];
      return { ...prev, [day]: updated };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName || !capacity) return alert("⚠️ Συμπλήρωσε Όνομα και Χωρητικότητα!");

    const newRoom: Room = { 
      id: `r-${Date.now()}`, 
      name: roomName, 
      capacity: parseInt(capacity), 
      availability 
    };
    
    const updated = [...rooms, newRoom];
    setRooms(updated);
    localStorage.setItem("eduflow_rooms", JSON.stringify(updated));
    setRoomName(""); setCapacity(""); setAvailability({});
  };

  const handleDelete = (id: string) => {
    const filtered = rooms.filter(r => r.id !== id);
    setRooms(filtered);
    localStorage.setItem("eduflow_rooms", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Αιθουσών" description="Όρισε αίθουσες και χωρητικότητα.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-4">
            <input type="text" value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="π.χ. Αίθουσα 1" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="Χωρητικότητα ατόμων" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-400">Διαθεσιμότητα</p>
              {AVAILABLE_DAYS.map(day => (
                <div key={day} className="flex gap-2 items-center">
                  <span className="w-16 text-[9px] text-slate-500 font-bold">{day}</span>
                  <div className="grid grid-cols-5 gap-1 flex-1">
                    {TIME_SLOTS.map(slot => (
                      <button type="button" key={slot} onClick={() => toggleSlot(day, slot)} className={`p-1 rounded text-[8px] ${availability[day]?.includes(slot) ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-500"}`}>{slot.split('-')[0]}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full bg-amber-600 hover:bg-amber-500 p-3 rounded-xl text-white font-bold text-xs">Αποθήκευση</button>
          </form>
        </div>
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Αίθουσες ({rooms.length})</h3>
          {rooms.map(r => (
            <div key={r.id} className="bg-[#0b0e14] mb-2 p-3 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-white font-bold text-xs">{r.name}</p>
                <p className="text-amber-400 text-[10px]">Χωρητικότητα: {r.capacity}</p>
              </div>
              <button onClick={() => handleDelete(r.id)} className="text-rose-500"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}