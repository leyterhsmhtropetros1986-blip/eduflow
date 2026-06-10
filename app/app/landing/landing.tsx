"use client";

import { useState } from "react";
import { 
  Calendar, 
  Users, 
  Smartphone, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  Zap
} from "lucide-react";

export default function LandingPage() {
  // State για το FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* BACKGROUND DECORATIONS (Glow Effects) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-[20%] right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[60%] left-1/3 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-4 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-400 font-medium mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" /> Το Μέλλον της Εκπαιδευτικής Διαχείρισης είναι Εδώ
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent max-w-4xl mx-auto leading-[1.15] md:leading-[1.1]">
          Οργανώστε το Φροντιστήριό σας με τη Δύναμη του <span className="text-indigo-500">AI</span>
        </h1>
        
        <p className="mt-6 text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Αυτόματη δημιουργία προγράμματος χωρίς conflicts, ενσωματωμένο CRM και mobile εφαρμογή για μαθητές και γονείς. Όλα σε μία πλατφόρμα.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center justify-center gap-2 group">
            Ξεκινήστε Δωρεάν <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 text-slate-300 font-semibold border border-slate-800 hover:bg-slate-800/60 hover:text-white transition-all duration-300">
            Δείτε ένα Demo
          </button>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-16 rounded-3xl border border-slate-800 bg-slate-900/50 p-2 backdrop-blur-xl shadow-2xl max-w-5xl mx-auto relative group">
          <div className="absolute -top-px left-20 right-20 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden aspect-[16/9] flex items-center justify-center text-slate-600 text-sm">
            {/* Εδώ μπαίνει ένα screenshot της εφαρμογής σου */}
            <div className="p-8 text-center space-y-2">
              <Calendar className="w-12 h-12 mx-auto text-indigo-500/50 mb-2" />
              <p className="text-slate-400 font-medium">Έξυπνο Dashboard & AI Scheduler Preview</p>
              <p className="text-xs text-slate-600">Interactive UI με Tailwind CSS & Next.js</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-20 px-4 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Ένα εργαλείο, αμέτρητες δυνατότητες
          </h2>
          <p className="mt-4 text-slate-400">
            Σχεδιασμένο αποκλειστικά για τις ανάγκες των σύγχρονων εκπαιδευτικών οργανισμών.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          
          {/* FEATURE 1: AI Scheduler */}
          <div className="p-8 rounded-3xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-md relative hover:border-indigo-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Scheduler</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ξεχάστε τις ώρες χαμένες πάνω από excel. Ο αλγόριθμος AI παράγει αυτόματα το εβδομαδιαίο πρόγραμμα χωρίς καμία διένεξη σε αίθουσες, καθηγητές ή μαθητές.
            </p>
          </div>

          {/* FEATURE 2: CRM */}
          <div className="p-8 rounded-3xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-md relative hover:border-purple-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Εξελιγμένο CRM</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Πλήρες ιστορικό μαθητών, καρτέλες διδάκτρων, παρακολούθηση απουσιών και βαθμολογιών. Όλη η πληροφορία οργανωμένη και άμεσα προσβάσιμη με ένα κλικ.
            </p>
          </div>

          {/* FEATURE 3: Mobile App */}
          <div className="p-8 rounded-3xl border border-slate-800/80 bg-slate-900/20 backdrop-blur-md relative hover:border-fuchsia-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-6 group-hover:bg-fuchsia-600 group-hover:text-white transition-all duration-300">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Mobile App</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Εφαρμογή για iOS και Android. Οι μαθητές βλέπουν το πρόγραμμα και τις εργασίες τους, ενώ οι γονείς ενημερώνονται άμεσα για απουσίες και οικονομικές εκκρεμότητες.
            </p>
          </div>

        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section className="py-20 px-4 max-w-7xl mx-auto relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white">Απλή και διάφανη κοστολόγηση</h2>
          <p className="mt-4 text-slate-400">Επιλέξτε το πλάνο που ταιριάζει στο μέγεθος του οργανισμού σας.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          
          {/* Plan 1: Standard */}
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md relative flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Growth</h3>
              <p className="text-slate-400 text-sm mt-1">Για μικρά και μεσαία φροντιστήρια</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">€49</span>
                <span className="text-slate-500 text-sm">/μήνα</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-slate-300">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" /> Έως 150 μαθητές</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" /> AI Αυτόματο Πρόγραμμα</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" /> Βασικό CRM & Απουσίες</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0" /> Web Πλατφόρμα (Όχι Mobile App)</li>
              </ul>
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition">
              Επιλογή Πλάνου
            </button>
          </div>

          {/* Plan 2: Professional (Featured) */}
          <div className="p-8 rounded-3xl border-2 border-indigo-600 bg-gradient-to-b from-slate-900 to-indigo-950/30 relative flex flex-col justify-between shadow-xl shadow-indigo-600/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-xs text-white font-semibold tracking-wide uppercase">
              ΔΗΜΟΦΙΛΕΣ
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Ultimate Pro</h3>
              <p className="text-indigo-200 text-sm mt-1">Για απαιτητικούς οργανισμούς</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">€99</span>
                <span className="text-slate-400 text-sm">/μήνα</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-slate-200">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" /> Απεριόριστοι Μαθητές & Καθηγητές</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" /> Advanced AI Scheduling Optimization</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" /> Πλήρες CRM & Οικονομική Διαχείριση</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" /> **Mobile App για iOS & Android**</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" /> Προτεραιότητα στην Υποστήριξη 24/7</li>
              </ul>
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition">
              Δοκιμάστε το Δωρεάν
            </button>
          </div>

        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-20 px-4 max-w-7xl mx-auto relative bg-slate-900/20 rounded-3xl border border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white">Τι λένε οι πελάτες μας</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Γιάννης Παπαδόπουλος", role: "Ιδιοκτήτης Φροντιστηρίου 'Μάθηση'", text: "Ο AI Scheduler μας έλυσε τα χέρια. Εκεί που θέλαμε 3 μέρες για το πρόγραμμα του Σεπτεμβρίου, τώρα το έχουμε έτοιμο σε 5 λεπτά χωρίς κανένα λάθος." },
            { name: "Ελένη Κωνσταντίνου", role: "Διευθύντρια Σπουδών", text: "Οι γονείς έχουν λατρέψει το Mobile App. Βλέπουν αμέσως τις απουσίες και τους βαθμούς, μειώνοντας τα τηλεφωνήματα στη γραμματεία κατά 70%." },
            { name: "Μιχάλης Ράπτης", role: "Ιδιοκτήτης Κέντρου Ξένων Γλωσσών", text: "Η καλύτερη επένδυση που κάναμε φέτος. Εξοικονομούμε χρόνο, χρήμα και προσφέρουμε μια high-tech εμπειρία στους μαθητές μας." }
          ].map((t, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col justify-between">
              <p className="text-slate-400 italic text-sm leading-relaxed">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-20 px-4 max-w-3xl mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Συχνές Ερωτήσεις</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: "Πόσο ασφαλή είναι τα δεδομένα των μαθητών;", a: "Απολύτως ασφαλή. Χρησιμοποιούμε κρυπτογράφηση enterprise επιπέδου (AES-256) και οι βάσεις δεδομένων μας φιλοξενούνται σε GDPR-compliant servers με καθημερινά backups." },
            { q: "Μπορώ να εισάγω τα υπάρχοντα δεδομένα μου από Excel;", a: "Φυσικά! Η πλατφόρμα διαθέτει έξυπνο εργαλείο μαζικής εισαγωγής για να μεταφέρετε μαθητές, καθηγητές και τμήματα μέσα σε λίγα δευτερόλεπτα." },
            { q: "Υπάρχει δέσμευση συμβολαίου;", a: "Όχι, δεν υπάρχει καμία δέσμευση. Μπορείτε να ακυρώσετε, να αναβαθμίσετε ή να υποβαθμίσετε το πλάνο σας ανά πάσα στιγμή χωρίς καμία κρυφή χρέωση." }
          ].map((faq, index) => (
            <div key={index} className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden">
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full p-5 text-left flex justify-between items-center bg-transparent hover:bg-slate-900/50 transition duration-200"
              >
                <span className="font-semibold text-sm md:text-base text-white">{faq.q}</span>
                {openFaq === index ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? "max-h-40 border-t border-slate-800/50" : "max-h-0"}`}>
                <p className="p-5 text-sm text-slate-400 leading-relaxed bg-slate-950/40">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FINAL CTA SECTION --- */}
      <section className="py-24 px-4 text-center max-w-5xl mx-auto relative">
        <div className="p-12 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-indigo-950/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Έτοιμοι να μεταμορφώσετε το φροντιστήριό σας;
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Ξεκινήστε τη δωρεάν δοκιμή 14 ημερών σήμερα. Δεν απαιτείται πιστωτική κάρτα.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20">
              Δημιουργία Δωρεάν Λογαριασμού
            </button>
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> 14 ημέρες δωρεάν δοκιμή
            </span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} EduPlan AI. All rights reserved.
      </footer>

    </div>
  );
}
