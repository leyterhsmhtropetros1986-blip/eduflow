import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <body className="min-h-screen bg-slate-50">
        <main className="w-full">
          {children}
        </main>
      </body>
    </html>
  );
}