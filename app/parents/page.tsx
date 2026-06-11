"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { 
  Trash2, Edit2, Users, Search, Phone, Mail, 
  MessageSquare, UserPlus, Star, ChevronDown, Plus 
} from "lucide-react";

interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  childrenNames: string[];
  tags: string[];
  notes: string;
  lastContact: string;
}

export default function ParentsPage() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", childrenInput: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem("eduflow_parents");
    if (saved) setParents(JSON.parse(saved));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newParent: Parent = {
      id: editingId || `p-${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      childrenNames: formData.childrenInput.split(",").map(c => c.trim()),
      tags: ["#VIP"],
      notes: "",
      lastContact: new Date().toLocaleDateString("el-GR")
    };

    const updated = editingId ? parents.map(p => p.id === editingId ? newParent : p) : [...parents, newParent];
    setParents(updated);
    localStorage.setItem("eduflow_parents", JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "", childrenInput: "" });
  };

  const filteredParents = parents.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search) ||
    p.childrenNames.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <WorkspaceShell title="Διαχείριση Γονέων & Οικογενειών" description="Σύνδεση γονέων με πολλαπλούς μαθητές και CRM επικοινωνία.">
      
      {/* 📊 STATS BOX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 mb-6">
        <div className="bg-[#1e2330] p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-emerald-950/50 text-emerald-400 rounded-xl"><Users size={20}/></div>
          <div>
            <p className="text-[10px] uppercase text-slate-500 font-bold">Σύνολο Γονέων</p>
            <h3 className="text-white font-black text-xl">{parents.length}</h3>
          </div>
        </div>
        <div className="bg-[#1e2330] p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-indigo-950/50 text-indigo-400 rounded-xl"><Users size={20}/></div>
          <div>
            <p className="text-[10px] uppercase text-slate-500 font-bold">Σύνολο Παιδιών</p>
            <h3 className="text-white font-black text-xl">{parents.reduce((acc, p) => acc + p.childrenNames.length, 0)}</h3>
          </div>
        </div>
        <div className="bg-[#1e2330] p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-amber-950/50 text-amber-400 rounded-xl"><Star size={20}/></div>
          <div>
            <p className="text-[10px] uppercase text-slate-500 font-bold">Μέσος Όρος/Οικογένεια</p>
            <h3 className="text-white font-black text-xl">
              {parents.length > 0 ? (parents.reduce((acc, p) => acc + p.childrenNames.length, 0) / parents.length).toFixed(1) : 0}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-4">
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <h4 className="text-emerald-400 font-bold text-xs flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
            <UserPlus size={14} /> {editingId ? "ΕΠΕΞΕΡΓΑΣΙΑ ΣΤΟΙΧΕΙΩΝ" : "ΠΡΟΣΘΗΚΗ ΝΕΑΣ ΟΙΚΟΓΕΝΕΙΑΣ"}
          </h4>
          <form onSubmit={handleSave} className="space-y-4">
            <input required placeholder="Ονοματεπώνυμο Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input required type="tel" placeholder="Τηλέφωνο *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              <input required type="email" placeholder="Email *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <input required placeholder="Ονόματα Παιδιών (χωρισμένα με κόμμα) *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs" value={formData.childrenInput} onChange={e => setFormData({...formData, childrenInput: e.target.value})} />
            <button type="submit" className="w-full p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500">{editingId ? "ΕΝΗΜΕΡΩΣΗ" : "ΑΠΟΘΗΚΕΥΣΗ"}</button>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="xl:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={16} />
            <input 
              placeholder="Αναζήτηση γονέα ή μαθητή..." 
              className="w-full bg-[#1e2330] border border-slate-800 p-3 pl-10 rounded-2xl text-white text-xs"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredParents.map(p => (
              <div key={p.id} className="bg-[#1e2330] p-5 rounded-2xl border border-slate-800 hover:border-emerald-900 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold">{p.name}</h3>
                    <p className="text-[10px] text-slate-400 mt-1">{p.phone} • {p.email}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingId(p.id)} className="text-slate-600 hover:text-white p-1.5"><Edit2 size={14}/></button>
                    <button onClick={() => setParents(parents.filter(pt => pt.id !== p.id))} className="text-slate-600 hover:text-rose-500 p-1.5"><Trash2 size={14}/></button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-[9px] uppercase font-bold text-slate-500">Μαθητές ({p.childrenNames.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {p.childrenNames.map((child, i) => (
                      <span key={i} className="bg-indigo-950/50 text-indigo-300 text-[10px] px-2 py-1 rounded-lg border border-indigo-900">{child}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-800">
                  <button className="flex-1 bg-[#0b0e14] hover:bg-slate-800 p-2 rounded-lg text-emerald-400 flex justify-center"><Phone size={14}/></button>
                  <button className="flex-1 bg-[#0b0e14] hover:bg-slate-800 p-2 rounded-lg text-sky-400 flex justify-center"><Mail size={14}/></button>
                  <button className="flex-1 bg-[#0b0e14] hover:bg-slate-800 p-2 rounded-lg text-emerald-500 flex justify-center"><MessageSquare size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}