"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, DoorOpen } from "lucide-react";

interface Room {
  id: string;
  name: string;
  capacity: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [capacity, setCapacity] = useState(20);

  useEffect(() => {
    const stored = localStorage.getItem("eduflow_rooms");
    if (stored) setRooms(JSON.parse(stored));
  }, []);

  const addRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName) return alert("Δώσε όνομα αίθουσας!");
    
    const newRoom: Room = { 
      id: Date.now().toString(), 
      name: roomName, 
      capacity: capacity 
    };
    
    const updated = [...rooms, newRoom];
    setRooms(updated);
    localStorage.setItem("eduflow_rooms", JSON.stringify(updated));
    setRoomName("");
  };

  const deleteRoom = (id: string) => {
    const filtered = rooms.filter(r => r.id !== id);
    setRooms(filtered);
    localStorage.setItem("eduflow_rooms", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Αιθουσών" description="Προσθέστε τις αίθουσες διδασκαλίας σας.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ ΠΡΟΣΘΗΚΗΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={addRoom} className="space-y-4">
            <input 
              type="text" 
              value={roomName} 
              onChange={e => setRoomName(e.target.value)} 
              placeholder="Όνομα Αίθουσας (π.χ. Αίθουσα 101)" 
              className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" 
            />
            <input 
              type="number" 
              value={capacity} 
              onChange={e => setCapacity(Number(e.target.value))} 
              placeholder="Χωρητικότητα" 
              className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" 
            />
            <button className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Προσθήκη Αίθουσας
            </button>
          </form>
        </div>

        {/* ΛΙΣΤΑ ΑΙΘΟΥΣΩΝ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Διαθέσιμες Αίθουσες ({rooms.length})</h3>
          <div className="space-y-3">
            {rooms.map(r => (
              <div key={r.id} className="flex justify-between items-center bg-[#0b0e14] p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <DoorOpen className="text-blue-500 w-5 h-5" />
                  <div>
                    <p className="text-white text-xs font-bold">{r.name}</p>
                    <p className="text-slate-500 text-[10px]">Χωρητικότητα: {r.capacity} άτομα</p>
                  </div>
                </div>
                <button onClick={() => deleteRoom(r.id)} className="text-rose-500 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}