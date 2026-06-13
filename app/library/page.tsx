"use client";

import { useState, useEffect, useMemo } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { FileText, Video, Link as LinkIcon, Folder, Plus, Trash2, Search, ExternalLink, Edit3, X, BookOpen } from "lucide-react";

interface Resource { id: string; title: string; lessonName: string; grade: string; type: "pdf"|"video"|"link"; url: string; description?: string; addedAt: string; }

const GRADES = ["Α Γυμνασίου","Β Γυμνασίου","Γ Γυμνασίου","Α Λυκείου","Β Λυκείου","Γ Λυκείου"];
const TYPE_LABEL: Record<string,string> = { pdf: "PDF / Σημειώσεις", video: "Βίντεο", link: "Σύνδεσμος" };
const TYPE_ICON = (t: string) => t === "pdf" ? <FileText size={16} /> : t === "video" ? <Video size={16} /> : <LinkIcon size={16} />;
const TYPE_COLOR: Record<string,string> = { pdf: "rose", video: "indigo", link: "emerald" };

// Auto-detect type from URL
function detectType(url: string): "pdf"|"video"|"link" {
  const u = url.toLowerCase();
  if (u.endsWith(".pdf") || u.includes("/document/") || u.includes(".pdf?")) return "pdf";
  if (u.includes("youtube.") || u.includes("youtu.be") || u.includes("vimeo.") || u.endsWith(".mp4")) return "video";
  return "link";
}

export default function LibraryPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [lessons, setLessons] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterLesson, setFilterLesson] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterType, setFilterType] = useState("");
  const [editing, setEditing] = useState<Resource | null>(null);
  const [form, setForm] = useState<Resource>({ id: "", title: "", lessonName: "", grade: "", type: "pdf", url: "", description: "", addedAt: "" });

  useEffect(() => {
    setIsMounted(true);
    setResources(JSON.parse(localStorage.getItem("eduflow_library") || "[]"));
    const raw = JSON.parse(localStorage.getItem("eduflow_lessons") || localStorage.getItem("eduflow_courses") || "[]");
    setLessons(raw.map((l: any) => typeof l === "string" ? l : l?.name).filter(Boolean));
  }, []);

  const persist = (next: Resource[]) => { setResources(next); localStorage.setItem("eduflow_library", JSON.stringify(next)); };

  const reset = () => { setForm({ id: "", title: "", lessonName: "", grade: "", type: "pdf", url: "", description: "", addedAt: "" }); setEditing(null); };

  const onUrlChange = (url: string) => setForm((f) => ({ ...f, url, type: detectType(url) }));

  const submit = () => {
    if (!form.title || !form.url || !form.lessonName) { alert("Συμπλήρωσε Τίτλο, Μάθημα και URL."); return; }
    if (editing) {
      persist(resources.map((r) => r.id === editing.id ? { ...form, id: editing.id } : r));
    } else {
      persist([{ ...form, id: "lib-" + Date.now(), addedAt: new Date().toISOString() }, ...resources]);
    }
    reset();
  };

  const remove = (id: string) => { if (confirm("Διαγραφή υλικού;")) persist(resources.filter((r) => r.id !== id)); };
  const startEdit = (r: Resource) => { setEditing(r); setForm(r); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const visible = useMemo(() => {
    const q = search.toLowerCase().trim();
    return resources.filter((r) => {
      if (filterLesson && r.lessonName !== filterLesson) return false;
      if (filterGrade && r.grade !== filterGrade) return false;
      if (filterType && r.type !== filterType) return false;
      if (!q) return true;
      return `${r.title} ${r.description || ""} ${r.lessonName}`.toLowerCase().includes(q);
    });
  }, [resources, search, filterLesson, filterGrade, filterType]);

  const counts = useMemo(() => ({
    total: resources.length,
    pdf: resources.filter((r) => r.type === "pdf").length,
    video: resources.filter((r) => r.type === "video").length,
    link: resources.filter((r) => r.type === "link").length,
  }), [resources]);

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Βιβλιοθήκη Υλικού" description="Συνδέσμοι σε σημειώσεις, βίντεο και πηγές ανά μάθημα. Τα αρχεία ζουν στο Drive/YouTube σου.">

      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard label="Σύνολο" value={counts.total} icon={<BookOpen size={16} />} />
        <StatCard label="PDF" value={counts.pdf} icon={<FileText size={16} />} color="rose" />
        <StatCard label="Βίντεο" value={counts.video} icon={<Video size={16} />} color="indigo" />
        <StatCard label="Σύνδεσμοι" value={counts.link} icon={<LinkIcon size={16} />} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-5 rounded-3xl h-fit shadow-xl space-y-3 lg:sticky lg:top-28">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 tracking-wider"><Plus size={14} /> {editing ? "Επεξεργασία" : "Νέο Υλικό"}</h3>
            {editing && <button onClick={reset} className="text-slate-500 hover:text-rose-400"><X size={14} /></button>}
          </div>

          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Τίτλος *" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
          <select value={form.lessonName} onChange={(e) => setForm({ ...form, lessonName: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            <option value="">Μάθημα *</option>{lessons.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            <option value="">Τάξη (προαιρ.)</option>{GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <input value={form.url} onChange={(e) => onUrlChange(e.target.value)} placeholder="URL * (Drive, YouTube, link...)" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
            {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Σύντομη περιγραφή (προαιρ.)" className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-indigo-500 resize-none" />

          <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-3 text-[10px] text-slate-400 leading-relaxed">
            💡 <b className="text-indigo-300">Συμβουλή:</b> ανέβασε το αρχείο σε <b>Google Drive</b> (δεξί κλικ → «Λήψη συνδέσμου» → όποιος έχει το link) ή το βίντεο σε <b>YouTube (unlisted)</b> και επικόλλησε το link εδώ.
          </div>

          <button onClick={submit} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl text-xs font-bold">{editing ? "Αποθήκευση Αλλαγών" : "+ Προσθήκη"}</button>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Αναζήτηση..." className="w-full bg-[#0b0e14] border border-slate-800 p-2.5 pl-9 rounded-xl text-xs text-white outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <select value={filterLesson} onChange={(e) => setFilterLesson(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded-lg text-[11px] text-white outline-none">
                <option value="">Όλα τα μαθήματα</option>{lessons.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded-lg text-[11px] text-white outline-none">
                <option value="">Όλες οι τάξεις</option>{GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded-lg text-[11px] text-white outline-none">
                <option value="">Όλοι οι τύποι</option>{Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl flex flex-col items-center gap-2">
              <Folder size={22} className="text-slate-700" /><span>{resources.length === 0 ? "Δεν υπάρχει υλικό ακόμα. Πρόσθεσε το πρώτο από αριστερά." : "Κανένα αποτέλεσμα."}</span>
            </div>
          ) : (
            <div className="space-y-2">
              {visible.map((r) => (
                <div key={r.id} className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 bg-${TYPE_COLOR[r.type]}-950/40 border border-${TYPE_COLOR[r.type]}-900/40 text-${TYPE_COLOR[r.type]}-400`}>
                    {TYPE_ICON(r.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold text-sm truncate">{r.title}</p>
                      <span className="text-[10px] bg-indigo-950/50 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/30">{r.lessonName}</span>
                      {r.grade && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{r.grade}</span>}
                    </div>
                    {r.description && <p className="text-[11px] text-slate-400 mt-1 truncate">{r.description}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <a href={r.url} target="_blank" rel="noreferrer" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5"><ExternalLink size={12} /> Άνοιγμα</a>
                    <button onClick={() => startEdit(r)} className="text-slate-500 hover:text-indigo-400 p-2"><Edit3 size={14} /></button>
                    <button onClick={() => remove(r.id)} className="text-slate-500 hover:text-rose-400 p-2"><Trash2 size={14} /></button>
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

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: any; color?: string }) {
  const c = color || "slate";
  return (
    <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-${c}-950/40 border border-${c}-900/30 text-${c}-400`}>{icon}</div>
      <div>
        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">{label}</p>
        <p className="text-white font-black text-lg">{value}</p>
      </div>
    </div>
  );
}
