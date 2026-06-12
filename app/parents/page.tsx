"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Edit2, Search, Phone, Mail, UserPlus, GraduationCap, X, Users, Link2 } from "lucide-react";

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  childrenNames: string[];
}

function studentName(s: any) {
  return s.name || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "Μαθητής";
}
// Κλειδί ταύτισης γονέα: τηλέφωνο (μόνο ψηφία) αλλιώς ονοματεπώνυμο
const keyOf = (name: string, phone: string) =>
  (phone && phone.replace(/\D/g, "")) || (name || "").trim().toLowerCase();

export default function ParentsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]); // χειροκίνητοι (eduflow_parents)
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "", email: "", childrenInput: "" });

  useEffect(() => {
    setIsMounted(true);
    try {
      const raw = JSON.parse(localStorage.getItem("eduflow_parents") || "[]");
      // migration: παλιοί γονείς με ενιαίο "name" -> firstName/lastName
      const norm = raw.map((p: any) => {
        const parts = (p.name || `${p.firstName || ""} ${p.lastName || ""}`).trim().split(/\s+/).filter(Boolean);
        return {
          id: p.id || `p-${Date.now()}-${Math.random()}`,
          firstName: p.firstName || parts[0] || "",
          lastName: p.lastName || parts.slice(1).join(" ") || "",
          phone: p.phone || "",
          email: p.email || "",
          childrenNames: p.childrenNames || [],
        };
      });
      setParents(norm);
    } catch { setParents([]); }
    try { setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]")); } catch { setStudents([]); }
  }, []);

  const persist = (updated: Parent[]) => {
    setParents(updated);
    localStorage.setItem("eduflow_parents", JSON.stringify(updated));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ firstName: "", lastName: "", phone: "", email: "", childrenInput: "" });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() && !formData.lastName.trim()) { alert("Συμπλήρωσε Όνομα ή Επίθετο."); return; }
    const newParent: Parent = {
      id: editingId || `p-${Date.now()}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      childrenNames: formData.childrenInput.split(",").map(c => c.trim()).filter(Boolean),
    };
    persist(editingId ? parents.map(p => (p.id === editingId ? newParent : p)) : [...parents, newParent]);
    resetForm();
  };

  const handleEdit = (id: string) => {
    const p = parents.find(x => x.id === id);
    if (!p) return;
    setEditingId(p.id);
    setFormData({ firstName: p.firstName, lastName: p.lastName, phone: p.phone, email: p.email, childrenInput: (p.childrenNames || []).join(", ") });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Διαγραφή του γονέα "${name}";`)) return;
    persist(parents.filter(p => p.id !== id));
    if (editingId === id) resetForm();
  };

  // 🔗 ΕΝΩΣΗ: χειροκίνητοι γονείς + γονείς από εγγραφές μαθητών
  const unified = useMemo(() => {
    const byKey: Record<string, any> = {};

    // 1) Χειροκίνητοι
    parents.forEach((p) => {
      const k = keyOf(`${p.firstName} ${p.lastName}`, p.phone);
      byKey[k] = {
        id: p.id, manual: true,
        firstName: p.firstName, lastName: p.lastName,
        phone: p.phone, email: p.email,
        children: [...(p.childrenNames || [])],
        linkedStudents: 0,
      };
    });

    // 2) Από μαθητές (parentName/parentPhone/parentEmail)
    students.forEach((s) => {
      const pname = (s.parentName || "").trim();
      const pphone = (s.parentPhone || "").trim();
      if (!pname && !pphone) return;
      const parts = pname.split(/\s+/).filter(Boolean);
      const fn = parts[0] || "";
      const ln = parts.slice(1).join(" ") || "";
      const k = keyOf(pname, pphone);
      if (!byKey[k]) {
        byKey[k] = { id: null, manual: false, firstName: fn, lastName: ln, phone: pphone, email: s.parentEmail || "", children: [], linkedStudents: 0 };
      } else {
        if (!byKey[k].phone) byKey[k].phone = pphone;
        if (!byKey[k].email) byKey[k].email = s.parentEmail || "";
      }
      const sn = studentName(s);
      if (!byKey[k].children.includes(sn)) byKey[k].children.push(sn);
      byKey[k].linkedStudents++;
    });

    return Object.values(byKey).sort((a: any, b: any) =>
      `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`, "el")
    );
  }, [parents, students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return unified;
    return unified.filter((p: any) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.phone || "").includes(q) ||
      (p.email || "").toLowerCase().includes(q) ||
      (p.children || []).some((c: string) => c.toLowerCase().includes(q))
    );
  }, [unified, search]);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Διαχείριση Γονέων" description="Οι γονείς συγχρονίζονται αυτόματα από τις εγγραφές μαθητών — χωρίς διπλή καταχώρηση.">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit xl:sticky xl:top-28">
          <h2 className="text-white font-bold mb-5 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-800 pb-3">
            <UserPlus size={16} className="text-emerald-400" /> {editingId ? "Επεξεργασία Γονέα" : "Νέος Γονέας (χειροκίνητα)"}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Όνομα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-emerald-500 outline-none" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
              <input placeholder="Επίθετο" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-emerald-500 outline-none" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Τηλέφωνο" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-emerald-500 outline-none" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              <input placeholder="Email" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-emerald-500 outline-none" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <input placeholder="Παιδιά (χωρισμένα με κόμμα)" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-emerald-500 outline-none" value={formData.childrenInput} onChange={e => setFormData({ ...formData, childrenInput: e.target.value })} />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">{editingId ? "ΕΝΗΜΕΡΩΣΗ" : "ΑΠΟΘΗΚΕΥΣΗ"}</button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition"><X size={14} /> Άκυρο</button>}
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed pt-1">
              💡 Δεν χρειάζεται να προσθέσεις χειροκίνητα όσους γονείς υπάρχουν ήδη στη φόρμα Μαθητή — εμφανίζονται αυτόματα δεξιά.
            </p>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="xl:col-span-2 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3.5 text-slate-500" />
            <input placeholder="Αναζήτηση σε όνομα, τηλέφωνο, email ή παιδί..." className="w-full bg-[#1e2330] border border-slate-800 p-3 pl-10 rounded-2xl text-white text-xs focus:border-emerald-500 outline-none" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider border-b border-slate-800 pb-2">
            Γονείς ({filtered.length})
          </h3>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl">
              Δεν υπάρχουν γονείς ακόμα. Πρόσθεσε μαθητή με στοιχεία γονέα ή γονέα από τη φόρμα.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((p: any, idx: number) => (
                <div key={p.id || `auto-${idx}`} className="bg-[#1e2330] p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="text-white font-bold text-sm">{`${p.firstName} ${p.lastName}`.trim() || "—"}</h3>
                      {!p.manual && (
                        <span className="text-[9px] text-sky-400 bg-sky-950/40 border border-sky-900/30 px-1.5 py-0.5 rounded inline-flex items-center gap-1 mt-1">
                          <Link2 size={9} /> Από εγγραφή μαθητή
                        </span>
                      )}
                    </div>
                    {p.manual && (
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleEdit(p.id)} className="text-slate-500 hover:text-indigo-400 p-1 rounded-lg hover:bg-[#0b0e14] transition"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(p.id, `${p.firstName} ${p.lastName}`)} className="text-slate-500 hover:text-rose-500 p-1 rounded-lg hover:bg-[#0b0e14] transition"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {p.phone && <a href={`tel:${p.phone}`} className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-emerald-400 transition"><Phone size={12} /> {p.phone}</a>}
                    {p.email && <a href={`mailto:${p.email}`} className="flex items-center gap-2 text-[11px] text-slate-400 hover:text-sky-400 transition truncate"><Mail size={12} /> {p.email}</a>}
                  </div>

                  {(p.children || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.children.map((c: string, i: number) => (
                        <span key={i} className="text-[10px] text-indigo-300 bg-indigo-950/40 border border-indigo-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                          <GraduationCap size={10} /> {c}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${p.linkedStudents > 0 ? "text-emerald-400" : "text-slate-600"}`}>
                      <Users size={11} /> {p.linkedStudents} εγγεγραμμένοι μαθητές
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
