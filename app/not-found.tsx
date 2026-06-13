import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center p-6 text-slate-200">
      <div className="max-w-md w-full bg-[#1e2330] border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <div className="text-6xl font-black text-indigo-500 mb-2">404</div>
        <h1 className="text-lg font-black text-white mb-2">Η σελίδα δεν βρέθηκε</h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          Η διεύθυνση που ζήτησες δεν υπάρχει. Ίσως μετακινήθηκε ή πληκτρολογήθηκε λάθος.
        </p>
        <Link href="/" className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-xs font-bold transition-colors">
          Επιστροφή στην Αρχική
        </Link>
      </div>
    </div>
  );
}
