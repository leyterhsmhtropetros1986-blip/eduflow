import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <body className="bg-slate-950 min-h-screen text-slate-50">
        {children}
      </body>
    </html>
  );
}