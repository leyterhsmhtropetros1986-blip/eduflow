"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Download, Upload, AlertTriangle, CheckCircle2, FileSpreadsheet, Users } from "lucide-react";

const GRADES = ["Α Γυμνασίου","Β Γυμνασίου","Γ Γυμνασίου","Α Λυκείου","Β Λυκείου","Γ Λυκείου"];

interface ParsedRow {
  rowNum: number;
  lastName: string; firstName: string; grade: string; phone?: string;
  parentName?: string; parentPhone?: string; parentEmail?: string;
  enrollments?: { lessonName: string; className: string }[];
  errors: string[];
}

declare global { interface Window { XLSX: any; } }

export default function ImportPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [xlsxReady, setXlsxReady] = useState(false);
  const [fileName, setFileName] = useState("");
  const [imported, setImported] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    // Load SheetJS dynamically
    if (!(window as any).XLSX) {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      s.onload = () => setXlsxReady(true);
      document.head.appendChild(s);
    } else setXlsxReady(true);
  }, []);

  // ⬇ Κατέβασμα template
  const downloadTemplate = () => {
    if (!window.XLSX) { alert("Φόρτωση Excel βιβλιοθήκης..."); return; }
    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();

    // Φύλλο 1: Μαθητές (με 3 παραδείγματα)
    const headers = ["Επώνυμο*","Όνομα*","Τάξη*","Τηλέφωνο","Όνομα Γονέα","Τηλέφωνο Γονέα","Email Γονέα","Μαθήματα","Τμήματα"];
    const examples = [
      ["Παπαδόπουλος","Γιάννης","Α Γυμνασίου","","Νίκος Παπαδόπουλος","6900000001","nikos@example.com","Μαθηματικά, Φυσική","Α1, Α1"],
      ["Δημητρίου","Μαρία","Β Λυκείου","6940000002","Ελένη Δημητρίου","6900000002","eleni@example.com","Μαθηματικά","Β2"],
      ["Γεωργίου","Πέτρος","Γ Λυκείου","","","","","",""],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...examples]);
    ws["!cols"] = [{ wch: 18 },{ wch: 14 },{ wch: 18 },{ wch: 14 },{ wch: 22 },{ wch: 14 },{ wch: 24 },{ wch: 25 },{ wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, "Μαθητές");

    // Φύλλο 2: Οδηγίες
    const instr = [
      ["EduFlow — Πρότυπο εισαγωγής μαθητών"],
      [""],
      ["ΟΔΗΓΙΕΣ:"],
      ["1. Συμπληρώστε όλους τους μαθητές στο φύλλο «Μαθητές»."],
      ["2. ΥΠΟΧΡΕΩΤΙΚΑ πεδία: Επώνυμο, Όνομα, Τάξη."],
      ["3. ΑΠΟΔΕΚΤΕΣ ΤΑΞΕΙΣ:"],
      ["   - Α Γυμνασίου"],
      ["   - Β Γυμνασίου"],
      ["   - Γ Γυμνασίου"],
      ["   - Α Λυκείου"],
      ["   - Β Λυκείου"],
      ["   - Γ Λυκείου"],
      ["4. Μαθήματα & Τμήματα: χωρίστε με κόμμα και με την ίδια σειρά."],
      ["   Παράδειγμα: «Μαθηματικά, Φυσική» / «Α1, Α2» = Μαθηματικά→Α1, Φυσική→Α2"],
      ["5. Σβήστε τις 3 παραδείγματος γραμμές πριν το ανέβασμα!"],
      ["6. Διπλοεγγραφές (ίδιο όνομα+επώνυμο+τάξη) θα παραλειφθούν."],
    ];
    const wsI = XLSX.utils.aoa_to_sheet(instr);
    wsI["!cols"] = [{ wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsI, "Οδηγίες");

    XLSX.writeFile(wb, "EduFlow_Template_Μαθητές.xlsx");
  };

  // ⬆ Φόρτωση αρχείου
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!window.XLSX) { alert("Περίμενε φόρτωση βιβλιοθήκης..."); return; }
    setFileName(file.name);
    const r = new FileReader();
    r.onload = (ev) => {
      const data = new Uint8Array(ev.target!.result as ArrayBuffer);
      const wb = window.XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as any[][];

      if (raw.length < 2) { alert("Το αρχείο είναι κενό ή μόνο headers."); return; }

      const existing = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
      const parsed: ParsedRow[] = [];

      // Skip header (row 0)
      for (let i = 1; i < raw.length; i++) {
        const r = raw[i];
        if (!r || r.every((c) => !c)) continue; // skip empty rows
        const [lastName, firstName, grade, phone, parentName, parentPhone, parentEmail, lessons, sections] = r.map((x) => String(x || "").trim());

        const errors: string[] = [];
        if (!lastName) errors.push("Λείπει Επώνυμο");
        if (!firstName) errors.push("Λείπει Όνομα");
        if (!grade) errors.push("Λείπει Τάξη");
        else if (!GRADES.includes(grade)) errors.push(`Άκυρη τάξη «${grade}» (αποδεκτές: ${GRADES.join(", ")})`);

        // Διπλοεγγραφή
        const dup = existing.find((s: any) => s.lastName === lastName && s.firstName === firstName && s.grade === grade);
        if (dup) errors.push("Διπλοεγγραφή (υπάρχει ήδη)");

        // Mαθήματα/Τμήματα
        const lessonList = lessons ? lessons.split(",").map((x) => x.trim()).filter(Boolean) : [];
        const sectionList = sections ? sections.split(",").map((x) => x.trim()).filter(Boolean) : [];
        if (lessonList.length !== sectionList.length && (lessonList.length > 0 || sectionList.length > 0)) {
          errors.push(`Μαθήματα (${lessonList.length}) και Τμήματα (${sectionList.length}) δεν συμφωνούν`);
        }
        const enrollments = lessonList.map((ln, idx) => ({ lessonName: ln, className: sectionList[idx] || "" }));

        parsed.push({ rowNum: i + 1, lastName, firstName, grade, phone, parentName, parentPhone, parentEmail, enrollments, errors });
      }
      setRows(parsed);
      setImported(0);
    };
    r.readAsArrayBuffer(file);
  };

  const validRows = rows.filter((r) => r.errors.length === 0);
  const errorRows = rows.filter((r) => r.errors.length > 0);

  // Εισαγωγή στους μαθητές
  const importAll = () => {
    if (validRows.length === 0) { alert("Δεν υπάρχουν έγκυροι μαθητές."); return; }
    if (!confirm(`Εισαγωγή ${validRows.length} μαθητών;`)) return;
    const existing = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const newOnes = validRows.map((r) => ({
      id: "s-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
      lastName: r.lastName, firstName: r.firstName, grade: r.grade,
      phone: r.phone || "",
      parentName: r.parentName || "", parentPhone: r.parentPhone || "", parentEmail: r.parentEmail || "",
      enrollments: r.enrollments || [],
      isLockedHours: false, lockedSlots: [], availability: [],
    }));
    const merged = [...existing, ...newOnes];
    localStorage.setItem("eduflow_students", JSON.stringify(merged));
    setImported(newOnes.length);
    setRows([]);
    setFileName("");
  };

  if (!isMounted) return null;

  return (
    <WorkspaceShell title="Εισαγωγή Μαθητών από Excel" description="Κατέβασε template, συμπλήρωσε στο Excel, ανέβασε εδώ.">

      {/* ΒΗΜΑΤΑ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* ΒΗΜΑ 1: TEMPLATE */}
        <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/50 border border-indigo-900/40 flex items-center justify-center font-black text-indigo-400">1</div>
            <div>
              <h3 className="text-white font-bold text-sm">Κατέβασε Template</h3>
              <p className="text-[11px] text-slate-400">Excel με τις σωστές στήλες + οδηγίες</p>
            </div>
          </div>
          <button onClick={downloadTemplate} disabled={!xlsxReady} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
            <Download size={16} /> {xlsxReady ? "Κατέβασμα Template.xlsx" : "Φόρτωση..."}
          </button>
          <div className="mt-4 bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-3 text-[11px] text-slate-300 space-y-1">
            <p className="font-bold text-indigo-300">📋 Περιλαμβάνει:</p>
            <p>• 9 στήλες με σωστά headers</p>
            <p>• 3 παραδείγματα γραμμές</p>
            <p>• Φύλλο «Οδηγίες» με αποδεκτές τάξεις</p>
          </div>
        </div>

        {/* ΒΗΜΑ 2: UPLOAD */}
        <div className="bg-[#1e2330] border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/50 border border-emerald-900/40 flex items-center justify-center font-black text-emerald-400">2</div>
            <div>
              <h3 className="text-white font-bold text-sm">Ανέβασε γεμάτο Excel</h3>
              <p className="text-[11px] text-slate-400">Θα δεις preview πριν αποθηκευτούν</p>
            </div>
          </div>
          <label className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer">
            <Upload size={16} /> Επιλογή αρχείου .xlsx
            <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" />
          </label>
          {fileName && <p className="text-[11px] text-slate-400 mt-3 text-center"><FileSpreadsheet size={11} className="inline mr-1" /> {fileName}</p>}
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {imported > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
          <div>
            <h3 className="text-emerald-300 font-bold text-sm">✓ Εισαγωγή ολοκληρώθηκε</h3>
            <p className="text-xs text-emerald-400/80">Προστέθηκαν {imported} νέοι μαθητές. <a href="/students" className="underline">Δες τους →</a></p>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {rows.length > 0 && (
        <div>
          <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 mb-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-3">
              <div className="bg-emerald-950/40 border border-emerald-900/40 rounded-xl px-4 py-2">
                <p className="text-2xl font-black text-emerald-400">{validRows.length}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">έγκυροι</p>
              </div>
              <div className="bg-rose-950/40 border border-rose-900/40 rounded-xl px-4 py-2">
                <p className="text-2xl font-black text-rose-400">{errorRows.length}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">με σφάλματα</p>
              </div>
              <div className="bg-[#0b0e14] border border-slate-800 rounded-xl px-4 py-2">
                <p className="text-2xl font-black text-white">{rows.length}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">σύνολο</p>
              </div>
            </div>
            <button onClick={importAll} disabled={validRows.length === 0} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
              <Users size={16} /> Εισαγωγή {validRows.length} έγκυρων μαθητών
            </button>
          </div>

          {errorRows.length > 0 && (
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-4 mb-4">
              <h3 className="text-rose-300 font-bold text-sm mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Γραμμές με σφάλματα (θα παραλειφθούν)</h3>
              <div className="space-y-1.5">
                {errorRows.map((r) => (
                  <div key={r.rowNum} className="bg-[#0b0e14] border border-rose-900/30 rounded-lg p-2.5 text-xs">
                    <p className="text-white font-bold">Γραμμή {r.rowNum}: {r.lastName} {r.firstName} <span className="text-slate-500 font-normal">({r.grade || "—"})</span></p>
                    {r.errors.map((err, j) => <p key={j} className="text-rose-400 text-[11px] mt-0.5">• {err}</p>)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {validRows.length > 0 && (
            <div className="bg-[#1e2330] border border-slate-800 rounded-2xl p-4 overflow-x-auto">
              <h3 className="text-emerald-300 font-bold text-sm mb-3 flex items-center gap-2"><CheckCircle2 size={14} /> Προεπισκόπηση — Έγκυροι μαθητές</h3>
              <table className="w-full text-xs">
                <thead><tr className="text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <th className="text-left py-2 px-2">Επώνυμο</th><th className="text-left py-2 px-2">Όνομα</th><th className="text-left py-2 px-2">Τάξη</th>
                  <th className="text-left py-2 px-2">Γονέας</th><th className="text-left py-2 px-2">Μαθήματα/Τμήματα</th>
                </tr></thead>
                <tbody>
                  {validRows.map((r) => (
                    <tr key={r.rowNum} className="border-b border-slate-800/50">
                      <td className="py-2 px-2 text-white font-bold">{r.lastName}</td>
                      <td className="py-2 px-2 text-slate-300">{r.firstName}</td>
                      <td className="py-2 px-2 text-indigo-400">{r.grade}</td>
                      <td className="py-2 px-2 text-slate-400 text-[11px]">{r.parentName || "—"}<br/>{r.parentPhone}</td>
                      <td className="py-2 px-2 text-[10px] text-slate-400">{r.enrollments?.map((e) => `${e.lessonName}→${e.className}`).join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {rows.length === 0 && !imported && (
        <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-2xl p-5">
          <h3 className="text-indigo-300 font-bold text-sm mb-3">💡 Συμβουλές</h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            <li>• Το <b>Επώνυμο, Όνομα, Τάξη</b> είναι υποχρεωτικά. Όλα τα άλλα προαιρετικά.</li>
            <li>• Η <b>τάξη</b> πρέπει να γραφτεί ακριβώς ως: «Α Γυμνασίου», «Β Λυκείου» κ.λπ.</li>
            <li>• Πολλαπλά <b>μαθήματα/τμήματα</b> χωρίζονται με κόμμα στην ίδια σειρά (π.χ. «Μαθηματικά, Φυσική» / «Α1, Α2»).</li>
            <li>• Διπλοεγγραφές (ίδιο όνομα+επώνυμο+τάξη) θα <b>παραλειφθούν αυτόματα</b>.</li>
            <li>• Δες προεπισκόπηση πριν αποθηκευτούν — μπορείς να ακυρώσεις.</li>
          </ul>
        </div>
      )}
    </WorkspaceShell>
  );
}
