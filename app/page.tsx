export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Καλώς ήρθατε στο EduFlow</h1>
      <a href="/reports" className="text-blue-500 hover:underline mt-4">
        Μετάβαση στα Reports
      </a>
    </main>
  );
}