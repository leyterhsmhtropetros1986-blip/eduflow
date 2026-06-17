"use client";

import { useEffect, useState } from "react";

// Λατινικά → Ελληνικά lookalikes (για πρόταση)
const LATIN_TO_GREEK: Record<string, string> = {
  A: "Α", B: "Β", E: "Ε", Z: "Ζ", H: "Η", I: "Ι", K: "Κ", M: "Μ",
  N: "Ν", O: "Ο", P: "Ρ", T: "Τ", X: "Χ", Y: "Υ",
};
function suggest(raw: string): string {
  let s = (raw || "").trim();
  s = s.replace(/[A-Z]/g, (ch) => LATIN_TO_GREEK[ch] || ch);
  s = s.replace(/\s+/g, " "); // πολλαπλά κενά → ένα
  return s;
}
// Εμφάνιση κενών ως ␣
function showSpaces(s: string): string {
  return s.replace(/^ +| +$/g, (m) => "␣".repeat(m.length)).replace(/  +/g, (m) => "␣".repeat(m.length));
}

type Row = { raw: string; sugg: string; target: string; inCourses: number; inClasses: number; inEnroll: number; inTeachers: number };

export default function CleanupPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [done, setDone] = useState<string>("");
  const [hasBackup, setHasBackup] = useState(false);

  const load = () => {
    const S = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const C = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    const L = JSON.parse(localStorage.getItem("eduflow_courses") || localStorage.getItem("eduflow_lessons") || "[]");
    const T = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");

    const tally: Record<string, Row> = {};
    const bump = (raw: string, field: keyof Row) => {
      if (raw === undefined || raw === null || raw === "") return;
      if (!tally[raw]) tally[raw] = { raw, sugg: suggest(raw), target: suggest(raw), inCourses: 0, inClasses: 0, inEnroll: 0, inTeachers: 0 };
      (tally[raw] as any)[field]++;
    };

    L.forEach((l: any) => bump(typeof l === "string" ? l : l.name, "inCourses"));
    C.forEach((c: any) => bump(c.subject, "inClasses"));
    S.forEach((s: any) => (s.enrollments || []).forEach((e: any) => bump(e.lessonName, "inEnroll")));
    T.forEach((t: any) => {
      (t.subjects || []).forEach((x: string) => bump(x, "inTeachers"));
      if (t.subject) bump(t.subject, "inTeachers");
    });

    setRows(Object.values(tally).sort((a, b) => a.sugg.localeCompare(b.sugg, "el")));
    setHasBackup(!!localStorage.getItem("eduflow_cleanup_backup"));
  };

  useEffect(() => { load(); }, []);

  const setTarget = (raw: string, val: string) => {
    setRows((prev) => prev.map((r) => (r.raw === raw ? { ...r, target: val } : r)));
  };

  const apply = () => {
    // Mapping raw → target
    const mapping: Record<string, string> = {};
    rows.forEach((r) => { mapping[r.raw] = r.target.trim(); });

    const S = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const C = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    const Lraw = localStorage.getItem("eduflow_courses") ? "eduflow_courses" : "eduflow_lessons";
    const L = JSON.parse(localStorage.getItem(Lraw) || "[]");
    const T = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");

    // BACKUP
    localStorage.setItem("eduflow_cleanup_backup", JSON.stringify({
      students: S, classes: C, courses: L, coursesKey: Lraw, teachers: T, ts: new Date().toISOString(),
    }));

    const m = (x: string) => (x in mapping ? mapping[x] : x);

    const L2 = L.map((l: any) => (typeof l === "string" ? m(l) : { ...l, name: m(l.name) }));
    const C2 = C.map((c: any) => ({ ...c, subject: c.subject ? m(c.subject) : c.subject }));
    const S2 = S.map((s: any) => ({
      ...s,
      enrollments: (s.enrollments || []).map((e: any) => ({ ...e, lessonName: m(e.lessonName) })),
    }));
    const T2 = T.map((t: any) => ({
      ...t,
      subjects: (t.subjects || []).map((x: string) => m(x)),
      subject: t.subject ? m(t.subject) : t.subject,
    }));

    localStorage.setItem(Lraw, JSON.stringify(L2));
    localStorage.setItem("eduflow_classes", JSON.stringify(C2));
    localStorage.setItem("eduflow_students", JSON.stringify(S2));
    localStorage.setItem("eduflow_teachers", JSON.stringify(T2));

    setDone("✓ Ολοκληρώθηκε! Τα ονόματα ενοποιήθηκαν παντού. Έγινε backup.");
    load();
  };

  const restore = () => {
    const b = localStorage.getItem("eduflow_cleanup_backup");
    if (!b) return;
    if (!confirm("Επαναφορά στα δεδομένα ΠΡΙΝ το cleanup;")) return;
    const data = JSON.parse(b);
    localStorage.setItem(data.coursesKey || "eduflow_courses", JSON.stringify(data.courses));
    localStorage.setItem("eduflow_classes", JSON.stringify(data.classes));
    localStorage.setItem("eduflow_students", JSON.stringify(data.students));
    localStorage.setItem("eduflow_teachers", JSON.stringify(data.teachers));
    setDone("↩ Έγινε επαναφορά.");
    load();
  };

  const box: React.CSSProperties = { background: "#1e2330", border: "1px solid #334155", borderRadius: 16, padding: 20, marginBottom: 16 };
  const inp: React.CSSProperties = { background: "#0b0e14", border: "1px solid #475569", borderRadius: 8, color: "#fff", padding: "6px 10px", fontSize: 14, width: "100%" };
  const tag: React.CSSProperties = { fontSize: 10, padding: "1px 6px", borderRadius: 4, marginRight: 4, background: "#334155", color: "#cbd5e1" };

  // Πόσα distinct targets — αν λιγότερα από raw, γίνεται merge
  const distinctTargets = new Set(rows.map((r) => r.target.trim())).size;

  return (
    <div style={{ padding: 32, color: "#e2e8f0", background: "#0b0e14", minHeight: "100vh", maxWidth: 820, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>🧹 Καθάρισμα Ονομάτων Μαθημάτων</h1>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
        Όρισε το <b>σωστό όνομα</b> για κάθε παραλλαγή. Βάλε το <b>ΙΔΙΟ</b> όνομα σε όσες θες να ενώσεις.
        Αλλάζει παντού: μαθήματα, τμήματα, εγγραφές, καθηγητές.
      </p>

      {done && <div style={{ ...box, borderColor: "#065f46", color: "#34d399", fontWeight: 700 }}>{done}</div>}

      <div style={box}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 12, alignItems: "center", marginBottom: 12, fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
          <div>Τι υπάρχει τώρα</div><div></div><div>Σωστό όνομα (επεξεργάσιμο)</div>
        </div>
        {rows.map((r) => (
          <div key={r.raw} style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr", gap: 12, alignItems: "center", marginBottom: 10 }}>
            <div>
              <span style={{ fontFamily: "monospace", fontSize: 14, color: showSpaces(r.raw) !== r.raw ? "#fb7185" : "#fff" }}>
                {showSpaces(r.raw)}
              </span>
              <div style={{ marginTop: 3 }}>
                {r.inCourses > 0 && <span style={tag}>📘 μάθημα ×{r.inCourses}</span>}
                {r.inClasses > 0 && <span style={tag}>🏫 τμήμα ×{r.inClasses}</span>}
                {r.inEnroll > 0 && <span style={tag}>👨‍🎓 εγγραφή ×{r.inEnroll}</span>}
                {r.inTeachers > 0 && <span style={tag}>👨‍🏫 καθ. ×{r.inTeachers}</span>}
              </div>
            </div>
            <div style={{ textAlign: "center", color: "#64748b" }}>→</div>
            <input style={inp} value={r.target} onChange={(e) => setTarget(r.raw, e.target.value)} />
          </div>
        ))}
        {rows.length === 0 && <p style={{ color: "#64748b" }}>Δεν βρέθηκαν μαθήματα.</p>}
      </div>

      <div style={{ ...box, borderColor: "#1e40af", background: "#1e293b" }}>
        <p style={{ fontSize: 13, marginBottom: 4 }}>
          {rows.length} παραλλαγές → <b style={{ color: "#818cf8" }}>{distinctTargets} τελικά μαθήματα</b>
          {rows.length > distinctTargets && <span style={{ color: "#34d399" }}> (θα ενωθούν {rows.length - distinctTargets})</span>}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={apply} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          ✓ Εφαρμογή Καθαρίσματος
        </button>
        {hasBackup && (
          <button onClick={restore} style={{ background: "transparent", color: "#fb7185", border: "1px solid #be123c", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            ↩ Επαναφορά (undo)
          </button>
        )}
      </div>

      <p style={{ color: "#64748b", fontSize: 12, marginTop: 20 }}>
        💡 Μετά το καθάρισμα: πήγαινε στους <b>Μαθητές</b> και βάλε τμήμα στις εγγραφές Χημείας/Μαθηματικών (τώρα είναι κενές).
        Έπειτα ξανατρέξε <b>Αυτόματη Δημιουργία</b> στο Πρόγραμμα.
      </p>
    </div>
  );
}
