"use client";

import { useState } from "react";
import { Mail, MessageSquare, Bell, Send } from "lucide-react";

const templates = [
  {
    id: "absence",
    title: "📌 Απουσία Μαθητή",
    message:
      "Αγαπητέ γονέα, σας ενημερώνουμε ότι ο μαθητής απουσίασε από το σημερινό μάθημα.",
  },
  {
    id: "schedule",
    title: "📅 Αλλαγή Προγράμματος",
    message:
      "Σας ενημερώνουμε ότι το πρόγραμμα μαθημάτων έχει τροποποιηθεί. Παρακαλούμε ελέγξτε το νέο πρόγραμμα.",
  },
  {
    id: "payment",
    title: "💳 Υπενθύμιση Διδάκτρων",
    message:
      "Σας υπενθυμίζουμε ότι εκκρεμεί η πληρωμή των διδάκτρων του μήνα.",
  },
  {
    id: "birthday",
    title: "🎂 Χρόνια Πολλά",
    message:
      "Το EduFlow και οι καθηγητές σας εύχονται Χρόνια Πολλά με υγεία και επιτυχίες!",
  },
  {
    id: "announcement",
    title: "📢 Γενική Ανακοίνωση",
    message:
      "Παρακαλούμε ενημερωθείτε για τη νέα ανακοίνωση του φροντιστηρίου.",
  },
];

export default function NotificationTemplates() {
  const [selected, setSelected] = useState<any>(templates[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Templates */}

      <div className="bg-[#1e2330] rounded-3xl border border-slate-800 p-5">

        <h2 className="text-white font-bold mb-5">
          Πρότυπα Μηνυμάτων
        </h2>

        <div className="space-y-3">

          {templates.map((t) => (

            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={`w-full text-left p-4 rounded-2xl transition ${
                selected.id === t.id
                  ? "bg-indigo-600 text-white"
                  : "bg-[#0b0e14] text-slate-300 hover:bg-slate-800"
              }`}
            >
              {t.title}
            </button>

          ))}

        </div>

      </div>

      {/* Preview */}

      <div className="lg:col-span-2 bg-[#1e2330] rounded-3xl border border-slate-800 p-6">

        <h2 className="text-white font-bold text-lg mb-4">
          Προεπισκόπηση
        </h2>

        <div className="bg-[#0b0e14] rounded-2xl border border-slate-800 p-5">

          <h3 className="text-indigo-400 font-bold text-lg mb-3">
            {selected.title}
          </h3>

          <p className="text-slate-300 leading-relaxed">
            {selected.message}
          </p>

        </div>

        <div className="flex gap-3 mt-6">

          <button className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 px-5 py-3 rounded-xl text-white font-bold">
            <Mail size={18} />
            Email
          </button>

          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-xl text-white font-bold">
            <MessageSquare size={18} />
            SMS
          </button>

          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded-xl text-white font-bold">
            <Bell size={18} />
            Push
          </button>

          <button className="ml-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl text-white font-bold">
            <Send size={18} />
            Αποστολή
          </button>

        </div>

      </div>

    </div>
  );
}