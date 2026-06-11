import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el">
      {/* Έχουμε αφαιρέσει το <Sidebar /> από εδώ */}
      <body className="flex min-h-screen bg-slate-50 text-slate-900">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}