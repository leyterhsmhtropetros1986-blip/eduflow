"use client";

// Έσχατο δίχτυ: πιάνει σφάλματα ακόμα και στο root layout.
// Πρέπει να περιέχει τα δικά του <html>/<body> και χρησιμοποιεί inline styles
// (δεν μπορεί να βασιστεί στο layout/Tailwind γιατί αντικαθιστά το root).
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="el">
      <body style={{ margin: 0, background: "#0b0e14", color: "#e2e8f0", fontFamily: "system-ui, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 420, width: "100%", background: "#1e2330", border: "1px solid #1f2937", borderRadius: 24, padding: 32, textAlign: "center", margin: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>Παρουσιάστηκε σφάλμα</h1>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 24px" }}>
            Η εφαρμογή συνάντησε ένα πρόβλημα. Τα δεδομένα σου είναι αποθηκευμένα τοπικά και είναι ασφαλή.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => reset()} style={{ flex: 1, background: "#4f46e5", color: "#fff", border: "none", padding: "12px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Δοκίμασε ξανά
            </button>
            <a href="/" style={{ flex: 1, background: "#1f2937", color: "#e2e8f0", padding: "12px", borderRadius: 12, fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              Αρχική
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
