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
  const [capacity, setCapacity] = useState<number>(20);

  // Φόρτωση δεδομένων από το localStorage
  useEffect(() => {
    const stored = localStorage.getItem("eduflow_rooms");
    if (stored) {
      try {
        setRooms(JSON.parse(stored));
      } catch (e) {
        console.error("Σφάλμα κατά την ανάγνωση των αιθουσών", e);
      }
    }
  }, []);

  // Αποθήκευση και ανανέωση
  const saveRooms = (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    localStorage.setItem("eduflow_rooms", JSON.stringify(updatedRooms));
  };

  const addRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return alert("Παρακαλώ δώστε όνομα αίθουσας!");
    if (capacity < 1) return alert("Η χωρητικότητα πρέπει να είναι τουλάχιστον 1 άτομο.");

    const newRoom: Room = { 
      id: `r-${Date.now()}`, // Unique ID
      name: roomName, 
      capacity: Number(capacity) 
    };
    
    saveRooms([...rooms, newRoom]);
    setRoomName("");
    setCapacity(20); // Reset σε default τιμή
  };

  const deleteRoom = (id: string) => {
    if (confirm("Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτή την αίθουσα;")) {
      saveRooms(rooms.filter(r => r.id !== id));
    }
  };

  return (
    <WorkspaceShell title="Διαχείριση Αιθουσών" description="Προσθέστε αίθουσες και ορίστε τη χωρητικότητά τους.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ ΠΡΟΣΘΗΚΗΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={addRoom} className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase ml-1">Όνομα Αίθουσας</label>
              <input 
                type="text" 
                value={roomName} 
                onChange={e => setRoomName(e.target.value)} 
                placeholder="π.χ. Αίθουσα 101" 
                className="w-full bg-[#0b0e14] border border-slate-800 p-2 mt-1 rounded text-xs text-white" 
              />
            </div>
            
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase ml-1">Χωρητικότητα (Άτομα)</label>
              <input 
                type="number" 
                min="1"
                value={capacity} 
                onChange={e => setCapacity(Number(e.target.value))} 
                className="w-full bg-[#0b0e14] border border-slate-800 p-2 mt-1 rounded text-xs text-white" 
              />
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 mt-2">
              <Plus className="w-4 h-4" /> Προσθήκη Αίθουσας
            </button>
          </form>
        </div>

        {/* ΛΙΣΤΑ ΑΙΘΟΥΣΩΝ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
          <h3 className="text-sm font-bold text-white mb-4">Διαθέσιμες Αίθουσες ({rooms.length})</h3>
          <div className="space-y-3">
            {rooms.length === 0 && <p className="text-slate-500 text-xs italic">Δεν έχουν προστεθεί αίθουσες ακόμα.</p>}
            {rooms.map(r => (
              <div key={r.id} className="flex justify-between items-center bg-[#0b0e14] p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3">
                  <DoorOpen className="text-blue-500 w-5 h-5" />
                  <div>
                    <p className="text-white text-xs font-bold">{r.name}</p>
                    <p className="text-slate-500 text-[10px]">Χωρητικότητα: {r.capacity} άτομα</p>
                  </div>
                </div>
                <button onClick={() => deleteRoom(r.id)} className="text-rose-500 hover:text-rose-400 p-2">
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