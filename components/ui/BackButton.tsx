"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
    >
      <ArrowLeft size={16} />
      <span>Πίσω</span>
    </button>
  );
}
