"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { 
  Trash2, Edit2, Users, Search, Phone, Mail, 
  MessageSquare, UserPlus, Star 
} from "lucide-react";

interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  childrenNames: string[];
}

export default function ParentsPage() {
  // Προσθέτουμε το 'isMounted' για να μην "κρασάρει" το Vercel στο build
  const [isMounted, setIsMounted] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", childrenInput: "" });

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("eduflow_parents");
    if (saved) {
      try {
        setParents(JSON.parse(saved));
      } catch (e) {
        setParents([]);
      }
    }
  }, []);

  // Αν δεν έχει φορτώσει ακόμα, μην δείξεις τίποτα (αποφεύγει το error)
  if (!isMounted) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newParent: Parent = {
      id: editingId || `p-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      childrenNames: formData.childrenInput.split(",").map(c => c.trim()),
    };

    const updated = editingId ? parents.map(p => p.id === editingId ? newParent : p) : [...parents, newParent];
    setParents(updated);
    localStorage.setItem("eduflow_parents", JSON.stringify(updated));
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "", childrenInput: "" });
  };

  const filteredParents = parents.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search)
  );

  return (
    <WorkspaceShell title="Διαχείριση Γονέων" description="Στοιχεία οικογενειών.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-4">
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-4">
            <input required placeholder="Ονοματεπώνυμο *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Τηλέφωνο *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required placeholder="Email *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <input required placeholder="Παιδιά (κόμμα)" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.childrenInput} onChange={e => setFormData({...formData, childrenInput: e.target.value})} />
            <button type="submit" className="w-full p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs">{editingId ? "ΕΝΗΜΕΡΩΣΗ" : "ΑΠΟΘΗΚΕΥΣΗ"}</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="xl:col-span-2 space-y-4">
          <input placeholder="Αναζήτηση..." className="w-full bg-[#1e2330] border border-slate-800 p-3 rounded-2xl text-white text-xs" value={search} onChange={e => setSearch(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredParents.map(p => (
              <div key={p.id} className="bg-[#1e2330] p-5 rounded-2xl border border-slate-800">
                <h3 className="text-white font-bold">{p.name}</h3>
                <p className="text-[10px] text-slate-400">{p.phone}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setParents(parents.filter(pt => pt.id !== p.id))} className="text-rose-500"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}