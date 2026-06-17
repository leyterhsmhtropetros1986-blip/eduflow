"use client";

import { useEffect, useState } from "react";

export default function AuditPage() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const S = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const C = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    const L = JSON.parse(localStorage.getItem("eduflow_courses") || localStorage.getItem("eduflow_lessons") || "[]");
    const T = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");

    // 1. Classes χωρίς subject
    const classesNoSubject = C.filter((c: any) => !c.subject).map((c: any) => ({ name: c.name, grade: c.grade }));

    // 2. Students χωρίς enrollments
    const studentsNoEnroll = S.filter((s: any) => !(s.enrollments || []).length).length;

    // 3. Enrollments χωρίς class (σπάει τον scheduler)
    const noClass: Record<string, number> = {};
    S.forEach((s: any) => (s.enrollments || []).forEach((e: any) => {
      if (!e.className) noClass[e.lessonName] = (noClass[e.lessonName] || 0) + 1;
    }));

    // 4. Strings ταιριάσματος
    const courseNames = [...new Set(L.map((l: any) => typeof l === "string" ? l : l.name))];
    const classSubjects = [...new Set(C.map((c: any) => c.subject).filter(Boolean))];
    const enrollLessons = [...new Set(S.flatMap((s: any) => (s.enrollments || []).map((e: any) => e.lessonName)))];

    // 5. Grades
    const courseGrades = [...new Set(L.map((l: any) => typeof l === "object" ? l.grade : "").filter(Boolean))];
    const classGrades = [...new Set(C.map((c: any) => c.grade).filter(Boolean))];

    // 6. Classes χωρίς καθηγητή
    const subs = [...new Set(C.map((c: any) => c.subject).filter(Boolean))];
    const noTeacher = subs.filter((sub: any) => !T.some((t: any) => (t.subjects || []).includes(sub) || t.subject === sub));

    // 7. Ενεργά μαθήματα: τμήμα vs κενό
    const stat: Record<string, { withClass: number; empty: number }> = {};
    S.forEach((s: any) => (s.enrollments || []).forEach((e: any) => {
      if (!stat[e.lessonName]) stat[e.lessonName] = { withClass: 0, empty: 0 };
      if (e.className) stat[e.lessonName].withClass++; else stat[e.lessonName].empty++;
    }));

    // 8. Duplicate class names με διαφορετικό subject
    const byName: Record<string, Set<string>> = {};
    C.forEach((c: any) => {
      if (!byName[c.name]) byName[c.name] = new Set();
      if (c.subject) byName[c.name].add(c.subject);
    });
    const dupes = Object.entries(byName).filter(([_, subs]: any) => subs.size > 1).map(([name, subs]: any) => ({ name, subjects: [...subs].join(", ") }));

    setReport({
      counts: { students: S.length, classes: C.length, courses: L.length, teachers: T.length },
      classesNoSubject, studentsNoEnroll, noClass,
      courseNames, classSubjects, enrollLessons,
      courseGrades, classGrades, noTeacher, stat, dupes,
    });
  }, []);

  if (!report) return <div style={{ padding: 40, color: "#fff", background: "#0b0e14", minHeight: "100vh" }}>Φόρτωση...</div>;

  const box: React.CSSProperties = { background: "#1e2330", border: "1px solid #334155", borderRadius: 16, padding: 20, marginBottom: 16 };
  const h2: React.CSSProperties = { color: "#818cf8", fontSize: 14, fontWeight: 800, textTransform: "uppercase", marginBottom: 12 };
  const code: React.CSSProperties = { background: "#0b0e14", padding: "2px 8px", borderRadius: 6, color: "#fbbf24", fontFamily: "monospace", fontSize: 13 };
  const errText: React.CSSProperties = { color: "#fb7185" };
  const okText: React.CSSProperties = { color: "#34d399" };

  return (
    <div style={{ padding: 32, color: "#e2e8f0", background: "#0b0e14", minHeight: "100vh", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>🔬 Audit Δεδομένων</h1>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>
        Read-only. Σύνολα: <b>{report.counts.students}</b> μαθητές · <b>{report.counts.classes}</b> τμήματα · <b>{report.counts.courses}</b> μαθήματα · <b>{report.counts.teachers}</b> καθηγητές
      </p>

      {/* 3 + 7: ΓΙΑΤΙ ΜΟΝΟ ΦΥΣΙΚΗ */}
      <div style={{ ...box, borderColor: "#7f1d1d" }}>
        <div style={h2}>🔴 ΓΙΑΤΙ Ο SCHEDULER ΦΤΙΑΧΝΕΙ ΜΟΝΟ ΦΥΣΙΚΗ;</div>
        <p style={{ fontSize: 13, marginBottom: 10 }}>Πόσες εγγραφές κάθε μαθήματος έχουν <b>τμήμα</b> vs <b>κενό</b> (τα κενά αγνοούνται):</p>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead><tr style={{ color: "#94a3b8", textAlign: "left" }}><th style={{ padding: 6 }}>Μάθημα</th><th style={{ padding: 6 }}>Με τμήμα ✅</th><th style={{ padding: 6 }}>Κενό ❌ (χάνεται)</th></tr></thead>
          <tbody>
            {Object.entries(report.stat).map(([lesson, v]: any) => (
              <tr key={lesson} style={{ borderTop: "1px solid #334155" }}>
                <td style={{ padding: 6, fontWeight: 700 }}>{lesson}</td>
                <td style={{ padding: 6, ...okText }}>{v.withClass}</td>
                <td style={{ padding: 6, ...(v.empty > 0 ? errText : {}) }}>{v.empty}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>
          ⚠ Αν ένα μάθημα έχει μόνο «κενό», ο scheduler το αγνοεί τελείως → γι' αυτό βγαίνει μόνο Φυσική.
        </p>
      </div>

      {/* 4: STRING MISMATCH */}
      <div style={{ ...box, borderColor: "#7f1d1d" }}>
        <div style={h2}>🔴 ΓΙΑΤΙ «ΔΕΝ ΥΠΑΡΧΟΥΝ ΤΜΗΜΑΤΑ»; (string mismatch)</div>
        <p style={{ fontSize: 13, marginBottom: 6 }}>Ονόματα μαθημάτων σε 3 σημεία — πρέπει να είναι <b>ΑΚΡΙΒΩΣ ίδια</b>:</p>
        <div style={{ marginBottom: 8 }}>📘 Μαθήματα (courses): {report.courseNames.map((n: string, i: number) => <span key={i} style={code}>{n}</span>)}</div>
        <div style={{ marginBottom: 8 }}>🏫 Τμήματα (subject): {report.classSubjects.length ? report.classSubjects.map((n: string, i: number) => <span key={i} style={code}>{n}</span>) : <span style={errText}>ΚΑΝΕΝΑ! Τα τμήματα δεν έχουν subject</span>}</div>
        <div style={{ marginBottom: 8 }}>👨‍🎓 Εγγραφές (lessonName): {report.enrollLessons.map((n: string, i: number) => <span key={i} style={code}>{n}</span>)}</div>
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
          ⚠ Αν κάποιο δεν ταιριάζει ακριβώς (κεφαλαία/τόνοι/κενά), το φίλτρο δεν βρίσκει τμήματα.
        </p>
      </div>

      {/* 5: GRADE MISMATCH */}
      <div style={box}>
        <div style={h2}>5. Τάξεις (grades) — πρέπει να ταιριάζουν</div>
        <div style={{ marginBottom: 8 }}>📘 Courses: {report.courseGrades.map((n: string, i: number) => <span key={i} style={code}>{n}</span>)}</div>
        <div>🏫 Classes: {report.classGrades.map((n: string, i: number) => <span key={i} style={code}>{n}</span>)}</div>
      </div>

      {/* 1: classes χωρίς subject */}
      <div style={box}>
        <div style={h2}>1. Τμήματα χωρίς μάθημα ({report.classesNoSubject.length})</div>
        {report.classesNoSubject.length === 0 ? <span style={okText}>✓ Κανένα</span> :
          report.classesNoSubject.map((c: any, i: number) => <span key={i} style={code}>{c.name} ({c.grade})</span>)}
      </div>

      {/* 6: classes χωρίς teacher */}
      <div style={box}>
        <div style={h2}>6. Μαθήματα χωρίς καθηγητή ({report.noTeacher.length})</div>
        {report.noTeacher.length === 0 ? <span style={okText}>✓ Όλα έχουν καθηγητή</span> :
          report.noTeacher.map((s: string, i: number) => <span key={i} style={{ ...code, color: "#fb7185" }}>{s}</span>)}
      </div>

      {/* 2 + 8 */}
      <div style={box}>
        <div style={h2}>Λοιπά</div>
        <p style={{ fontSize: 13 }}>2. Μαθητές χωρίς εγγραφές: <b style={report.studentsNoEnroll > 0 ? errText : okText}>{report.studentsNoEnroll}</b></p>
        <p style={{ fontSize: 13, marginTop: 6 }}>8. Διπλά ονόματα τμημάτων με διαφορετικό μάθημα: {report.dupes.length === 0 ? <b style={okText}>0</b> : report.dupes.map((d: any, i: number) => <span key={i} style={code}>{d.name}: {d.subjects}</span>)}</p>
      </div>

      <p style={{ color: "#64748b", fontSize: 12, marginTop: 24 }}>
        📸 Βγάλε screenshot αυτή τη σελίδα και στείλε τη. Μετά μπορείς να σβήσεις το αρχείο app/audit/page.tsx.
      </p>
    </div>
  );
}
