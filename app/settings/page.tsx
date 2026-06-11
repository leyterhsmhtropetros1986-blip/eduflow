"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [teacher, setTeacher] = useState({ name: "", subject: "" });
  const [cls, setCls] = useState({ name: "", subject: "" });
  const [room, setRoom] = useState("");

  const saveToStorage = (key: string, newItem: any) => {
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([...existing, newItem]));
    alert("Αποθηκεύτηκε!");
  };

  return (
    <div className="p-10 space-y-10">
      <h1 className="text-2xl font-bold">Ρυθμίσεις & Δεδομένα</h1>
      
      {/* Προσθήκη Καθηγητή */}
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="font-bold mb-4">Προσθήκη Καθηγητή</h2>
        <input className="border p-2 mr-2" placeholder="Όνομα" onChange={e => setTeacher({...teacher, name: e.target.value})} />
        <input className="border p-2 mr-2" placeholder="Μάθημα" onChange={e => setTeacher({...teacher, subject: e.target.value})} />
        <button className="bg-blue-600 text-white p-2 rounded" onClick={() => saveToStorage("eduflow_teachers", teacher)}>Αποθήκευση</button>
      </div>

      {/* Προσθήκη Τάξης */}
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="font-bold mb-4">Προσθήκη Τάξης</h2>
        <input className="border p-2 mr-2" placeholder="Όνομα Τάξης" onChange={e => setCls({...cls, name: e.target.value})} />
        <input className="border p-2 mr-2" placeholder="Μάθημα" onChange={e => setCls({...cls, subject: e.target.value})} />
        <button className="bg-blue-600 text-white p-2 rounded" onClick={() => saveToStorage("eduflow_classes", cls)}>Αποθήκευση</button>
      </div>

      {/* Προσθήκη Αίθουσας */}
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="font-bold mb-4">Προσθήκη Αίθουσας</h2>
        <input className="border p-2 mr-2" placeholder="Όνομα Αίθουσας" onChange={e => setRoom(e.target.value)} />
        <button className="bg-blue-600 text-white p-2 rounded" onClick={() => saveToStorage("eduflow_rooms", { name: room })}>Αποθήκευση</button>
      </div>
    </div>
  );
}