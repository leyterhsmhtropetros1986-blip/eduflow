"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Καταγραφή για debugging (φαίνεται στο Console)
    console.error("EduFlow error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center p-6 text-slate-200">
      <div className="max-w-md w-full bg-[#1e2330] border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-900/40 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={30} className="text-rose-400" />
        </div>
        <h1 className="text-xl font-black text-white mb-2">Κάτι πήγε στραβά</h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          Παρουσιάστηκε ένα σφάλμα σε αυτή τη σελίδα. Τα δεδομένα σου είναι ασφαλή — δοκίμασε ξανά ή γύρνα στην αρχική.
        </p>
        <div className="flex gap-2">
          <button onClick={() => reset()} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold transition-colors">
            <RefreshCw size={14} /> Δοκίμασε ξανά
          </button>
          <Link href="/" className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-xs font-bold transition-colors">
            <Home size={14} /> Αρχική
          </Link>
        </div>
        {error?.digest && <p className="text-[10px] text-slate-600 mt-4 font-mono">Κωδικός: {error.digest}</p>}
      </div>
    </div>
  );
}
