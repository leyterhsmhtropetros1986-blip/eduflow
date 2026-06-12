"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Edit2, Search, Phone, Mail, UserPlus, GraduationCap, X, Users } from "lucide-react";

interface Parent {
  id: string;
  name: string;
  phone: string;
  email: string;
  childrenNames: string[];
}

export default function ParentsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", childrenInput: "" });

  useEffect(() => {
    setIsMounted(true);
    try { setParents(JSON.parse(localStorage.getItem("eduflow_parents") || "[]")); } catch { setParents([]); }
    try { setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]")); } catch { setStudents([]); }
  }, []);

  const persist = (updated: Parent[]) => {
    setParents(updated);
    localStorage.setItem("eduflow_parents", JSON.stringify(updated));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", phone: "", email: "", childrenInput: "" });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert("Συμπλήρωσε το ονοματεπώνυμο."); return; }

    const newParent: Parent = {
      id: editingId || `p-${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      childrenNames: formData.childrenInput.split(",").map(c => c.trim()).filter(Boolean),
    };

    const updated = editingId
      ? parents.map(p => (p.id === editingId ? newParent : p))
      : [...parents, newParent];
    persist(updated);
    resetForm();
  };

  const handleEdit = (p: Parent) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      phone: p.phone,
      email: p.email,
      childrenInput: (p.childrenNames || []).join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (p: Parent) => {
    if (!confirm(`Διαγραφή του γονέα "${p.name}";`)) return;
    persist(parents.filter(pt => pt.id !== p.id));
    if (editingId === p.id) resetForm();
  };

  // Πόσοι εγγεγραμμένοι μαθητές αντιστοιχούν σε αυτόν τον γονέα
  const linkedStudents = (p: Parent) => {
    const ph = (p.phone || "").replace(/\D/g, "");
    return students.filter((s: any) =>
      (s.parentName && p.name && s.parentName.trim().toLowerCase() === p.name.trim().toLowerCase()) ||
      (ph && s.parentPhone && String(s.parentPhone).replace(/\D/g, "") === ph)
    ).length;
  };

  const filteredParents = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return parents;
    return parents.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.phone || "").includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.childrenNames || []).some(c => c.toLowerCase().includes(q))
    );
  }, [parents, search]);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Διαχείριση Γονέων" description="Στοιχεία οικογενειών και σύνδεση με εγγεγραμμένους μαθητές.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit xl:sticky xl:top-28">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-800 pb-3">
            <UserPlus size={16} className="text-emerald-400" /> {editingId ? "Επεξεργασία Γονέα" : "Νέος Γονέας"}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <input required placeholder="Ονοματεπώνυμο *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-emerald-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Τηλέφωνο" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-emerald-500 outline-none" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              <input placeholder="Email" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-emerald-500 outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <input placeholder="Παιδιά (χωρισμένα με κόμμα)" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-emerald-500 outline-none" value={formData.childrenInput} onChange={e => setFormData({ ...formData, childrenInput: e.target.value })} />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">{editingId ? "ΕΝΗΜΕΡΩΣΗ" : "ΑΠΟΘΗΚΕΥΣΗ"}</button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition"><X size={14} /> Άκυρο</button>
              )}
            </div>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="xl:col-span-2 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3.5 text-slate-500" />
            <input placeholder="Αναζήτηση σε όνομα, τηλέφωνο, email ή παιδί..." className="w-full bg-[#1e2330] border border-slate-800 p-3 pl-10 rounded-2xl text-white text-xs focus:border-emerald-500 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider border-b border-slate-800 pb-2">
            Γονείς ({filteredParents.length})
          </h3>

          {filteredParents.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">
              {parents.length === 0 ? "Δεν υπάρχουν γονείς ακόμα. Πρόσθεσε τον πρώτο από τη φόρμα." : "Κανένα αποτέλεσμα για την αναζήτηση."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredParents.map(p => {
                const linked = linkedStudents(p);
                return (
                  <div key={p.id} className="bg-[#1e2330] p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-bold text-sm">{p.name}</h3>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(p)} className="text-slate-500 hover:text-indigo-400 p-1 rounded-lg hover:bg-[#0b0e14] transition"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(p)} className="text-slate-500 hover:text-rose-500 p-1 rounded-lg hover:bg-[#0b0e14] transition"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {p.phone && (
                        <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-emerald-400 transition"><Phone size={12} /> {p.phone}</a>
                      )}
                      {p.email && (
                        <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-sky-400 transition truncate"><Mail size={12} /> {p.email}</a>
                      )}
                    </div>

                    {(p.childrenNames || []).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.childrenNames.map((c, i) => (
                          <span key={i} className="text-[10px] text-indigo-300 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                            <GraduationCap size={10} /> {c}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${linked > 0 ? "text-emerald-400" : "text-slate-600"}`}>
                        <Users size={11} /> {linked} εγγεγραμμένοι μαθητές
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
