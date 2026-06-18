"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Plus, School, BookOpen, Users, MapPin, Palette, Image as ImageIcon, Type, Save, RotateCcw, Check, Settings } from "lucide-react";

interface Branding { name: string; tagline: string; logo: string; primaryColor: string; address: string; phone: string; email: string; website: string; }
const DEFAULT_BRAND: Branding = { name: "EduFlow", tagline: "Smart Tutoring ERP", logo: "", primaryColor: "#4f46e5", address: "", phone: "", email: "", website: "" };
const COLORS = [
  { name: "Indigo", value: "#4f46e5" }, { name: "Μπλε", value: "#2563eb" }, { name: "Πράσινο", value: "#059669" }, { name: "Μωβ", value: "#7c3aed" },
  { name: "Ροζ", value: "#db2777" }, { name: "Πορτοκαλί", value: "#ea580c" }, { name: "Κόκκινο", value: "#dc2626" }, { name: "Τιρκουάζ", value: "#0891b2" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<"data" | "branding">("data");

  // ===== ΥΠΑΡΧΟΥΣΑ ΛΟΓΙΚΗ - Basic Data =====
  const [data, setData] = useState({
    schools: [] as string[],
    courses: [] as string[],
    classes: [] as { id: string; name: string }[],
    rooms: [] as { id: string; name: string }[],
  });

  useEffect(() => {
    try {
      setData({
        schools: JSON.parse(localStorage.getItem("eduflow_schools") || "[]"),
        courses: JSON.parse(localStorage.getItem("eduflow_courses") || "[]"),
        classes: JSON.parse(localStorage.getItem("eduflow_classes") || "[]"),
        rooms: JSON.parse(localStorage.getItem("eduflow_rooms") || "[]"),
      });
    } catch (error) {
      console.error("Failed to load settings data:", error);
      // Set safe defaults on error
      setData({
        schools: [],
        courses: [],
        classes: [],
        rooms: [],
      });
    }
  }, []);

  const saveItem = (key: keyof typeof data, value: string) => {
    if (!value) return;
    let newItem: any;
    if (key === "classes" || key === "rooms") newItem = { id: `id-${Date.now()}`, name: value };
    else newItem = value;
    const updated = [...(data[key] as any[]), newItem];
    localStorage.setItem(`eduflow_${key}`, JSON.stringify(updated));
    setData((prev) => ({ ...prev, [key]: updated }));
  };

  const removeItem = (key: keyof typeof data, index: number) => {
    const updated = (data[key] as any[]).filter((_, i) => i !== index);
    localStorage.setItem(`eduflow_${key}`, JSON.stringify(updated));
    setData((prev) => ({ ...prev, [key]: updated }));
  };

  // ===== ΝΕΑ ΛΟΓΙΚΗ - Branding =====
  const [brand, setBrand] = useState<Branding>(DEFAULT_BRAND);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { const b = JSON.parse(localStorage.getItem("eduflow_branding") || "{}"); setBrand({ ...DEFAULT_BRAND, ...b }); } catch {}
  }, []);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 500_000) { alert("Logo μέγιστο 500KB."); return; }
    const r = new FileReader();
    r.onload = () => setBrand({ ...brand, logo: r.result as string });
    r.readAsDataURL(file);
  };

  const saveBrand = () => {
    localStorage.setItem("eduflow_branding", JSON.stringify(brand));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    window.dispatchEvent(new Event("storage"));
  };

  const resetBrand = () => { if (confirm("Επαναφορά branding;")) { setBrand(DEFAULT_BRAND); localStorage.removeItem("eduflow_branding"); window.dispatchEvent(new Event("storage")); } };

  return (
    <WorkspaceShell title="Ρυθμίσεις" description="Βασικά δεδομένα συστήματος και branding φροντιστηρίου.">

      {/* TABS */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("data")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${tab === "data" ? "bg-indigo-600 text-white" : "bg-[#1e2330] text-slate-400 border border-slate-800"}`}>
          <Settings size={14} /> Βασικά Δεδομένα
        </button>
        <button onClick={() => setTab("branding")} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${tab === "branding" ? "bg-indigo-600 text-white" : "bg-[#1e2330] text-slate-400 border border-slate-800"}`}>
          <Palette size={14} /> Branding
        </button>
      </div>

      {/* TAB 1: Basic Data (η υπάρχουσα σου σελίδα) */}
      {tab === "data" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingsCard title="Σχολεία" icon={<School size={16} />} onAdd={(val: string) => saveItem("schools", val)}>
            {data.schools.map((item, i) => <ListItem key={i} label={item} onRemove={() => removeItem("schools", i)} />)}
          </SettingsCard>
          <SettingsCard title="Μαθήματα" icon={<BookOpen size={16} />} onAdd={(val: string) => saveItem("courses", val)}>
            {data.courses.map((item, i) => <ListItem key={i} label={item} onRemove={() => removeItem("courses", i)} />)}
          </SettingsCard>
          <SettingsCard title="Τμήματα" icon={<Users size={16} />} onAdd={(val: string) => saveItem("classes", val)}>
            {data.classes.map((item: any, i) => <ListItem key={item.id} label={item.name} onRemove={() => removeItem("classes", i)} />)}
          </SettingsCard>
          <SettingsCard title="Αίθουσες" icon={<MapPin size={16} />} onAdd={(val: string) => saveItem("rooms", val)}>
            {data.rooms.map((item: any, i) => <ListItem key={item.id} label={item.name} onRemove={() => removeItem("rooms", i)} />)}
          </SettingsCard>
        </div>
      )}

      {/* TAB 2: Branding */}
      {tab === "branding" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-800 pb-3 tracking-wider"><Type size={14} /> Στοιχεία Φροντιστηρίου</h3>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Όνομα *</label>
                <input value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} placeholder="π.χ. Φροντιστήριο Δημητρίου" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-sm text-white outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Tagline / Υπότιτλος</label>
                <input value={brand.tagline} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} placeholder="π.χ. Λύκειο & Γυμνάσιο" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Τηλέφωνο</label>
                  <input value={brand.phone} onChange={(e) => setBrand({ ...brand, phone: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Email</label>
                  <input value={brand.email} onChange={(e) => setBrand({ ...brand, email: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Διεύθυνση</label>
                <input value={brand.address} onChange={(e) => setBrand({ ...brand, address: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Website</label>
                <input value={brand.website} onChange={(e) => setBrand({ ...brand, website: e.target.value })} placeholder="https://..." className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-800 pb-3 tracking-wider"><ImageIcon size={14} /> Logo</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-[#0b0e14] border border-slate-800 flex items-center justify-center overflow-hidden">
                  {brand.logo ? <img src={brand.logo} alt="logo" className="w-full h-full object-contain" /> : <ImageIcon size={28} className="text-slate-700" />}
                </div>
                <div className="flex-1">
                  <label className="block">
                    <span className="text-xs text-slate-400 mb-1 block">Ανέβασε PNG/JPG (max 500KB)</span>
                    <input type="file" accept="image/*" onChange={handleLogo} className="text-xs text-slate-400 file:bg-indigo-600 file:hover:bg-indigo-500 file:text-white file:border-0 file:px-3 file:py-1.5 file:rounded-lg file:font-bold file:text-xs file:cursor-pointer file:mr-3" />
                  </label>
                  {brand.logo && <button onClick={() => setBrand({ ...brand, logo: "" })} className="text-[10px] text-rose-400 mt-2">✕ Αφαίρεση logo</button>}
                </div>
              </div>
            </div>

            <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
              <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-800 pb-3 tracking-wider mb-4"><Palette size={14} /> Κύριο Χρώμα</h3>
              <div className="grid grid-cols-4 gap-3">
                {COLORS.map((c) => (
                  <button key={c.value} onClick={() => setBrand({ ...brand, primaryColor: c.value })} className={`p-3 rounded-xl border transition ${brand.primaryColor === c.value ? "border-white" : "border-slate-800 hover:border-slate-600"}`}>
                    <div className="w-full h-10 rounded-lg mb-2" style={{ background: c.value }}>
                      {brand.primaryColor === c.value && <div className="w-full h-full flex items-center justify-center"><Check size={20} className="text-white" /></div>}
                    </div>
                    <p className="text-[11px] text-slate-300 text-center font-bold">{c.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={saveBrand} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"><Save size={16} /> {saved ? "✓ Αποθηκεύτηκε!" : "Αποθήκευση"}</button>
              <button onClick={resetBrand} className="bg-slate-800 hover:bg-slate-700 text-white py-3 px-6 rounded-xl text-sm font-bold flex items-center gap-2"><RotateCcw size={16} /> Reset</button>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6 h-fit lg:sticky lg:top-28">
            <h3 className="text-indigo-400 font-bold text-xs uppercase border-b border-slate-800 pb-3 mb-4 tracking-wider">Προεπισκόπηση</h3>
            <div className="bg-[#0b0e14] rounded-xl p-4 mb-3">
              <div className="flex items-center gap-2 mb-2">
                {brand.logo ? <img src={brand.logo} alt="" className="w-8 h-8 rounded object-contain" /> : <div className="w-8 h-8 rounded" style={{ background: brand.primaryColor }}></div>}
                <div>
                  <p className="text-base font-black" style={{ color: brand.primaryColor }}>{brand.name || "EduFlow"}</p>
                  <p className="text-[9px] text-slate-500 uppercase">{brand.tagline || "Smart Tutoring ERP"}</p>
                </div>
              </div>
            </div>
            <div className="bg-[#0b0e14] rounded-xl p-3 mb-3">
              <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold">Κουμπιά</p>
              <button className="w-full text-white text-xs font-bold py-2 rounded-lg" style={{ background: brand.primaryColor }}>Δημιουργία</button>
            </div>
            <div className="bg-[#0b0e14] rounded-xl p-3 text-[10px] text-slate-400 space-y-1">
              {brand.phone && <p>📞 {brand.phone}</p>}
              {brand.email && <p>✉ {brand.email}</p>}
              {brand.address && <p>📍 {brand.address}</p>}
              {brand.website && <p>🌐 {brand.website}</p>}
              {!brand.phone && !brand.email && !brand.address && !brand.website && <p className="text-slate-600 italic">Συμπλήρωσε στοιχεία...</p>}
            </div>
            <p className="text-[10px] text-slate-500 mt-4 text-center">Οι αλλαγές εμφανίζονται παντού.</p>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

function SettingsCard({ title, icon, children, onAdd }: any) {
  const [input, setInput] = useState("");
  return (
    <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl">
      <h2 className="font-bold text-white text-xs mb-4 flex items-center gap-2 uppercase tracking-wider text-indigo-400">{icon} {title}</h2>
      <div className="flex gap-2 mb-4">
        <input className="bg-[#0b0e14] border border-slate-800 p-2 rounded-xl text-xs text-white flex-1" placeholder="Προσθήκη..." value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="bg-indigo-600 text-white p-2 px-4 rounded-xl hover:bg-indigo-500 transition-all" onClick={() => { onAdd(input); setInput(""); }}><Plus size={16} /></button>
      </div>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function ListItem({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li className="flex justify-between items-center p-3 bg-[#0b0e14] border border-slate-800 rounded-xl text-xs text-slate-300">
      {label}
      <button onClick={onRemove} className="text-slate-600 hover:text-rose-500"><Trash2 size={14} /></button>
    </li>
  );
}
