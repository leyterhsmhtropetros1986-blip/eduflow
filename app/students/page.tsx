"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { AvailabilityMatrix } from "../../components/AvailabilityMatrix";
import { Trash2, Edit2, UserPlus, Plus, X, Clock, GraduationCap, AlertTriangle } from "lucide-react";

interface AvailabilitySlot { day: string; start: string; end: string; }

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  selectedLessons: string[];
  isLockedHours: boolean;
  lockedSlots: AvailabilitySlot[];
  availability: AvailabilitySlot[];
}

export default function StudentsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<string[]>([]);
  
  // States για τη Φόρμα
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  
  const [isLockedHours, setIsLockedHours] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<AvailabilitySlot[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  // Δυναμικό ωράριο: Το Σάββατο επεκτάθηκε 09:00 - 17:00
  const getAvailableTimes = (day: string) => {
    if (day === "Σάββατο") return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    return ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  };

  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({ day: "Δευτέρα", start: "14:00", end: "15:00" });

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  const loadData = () => {
    if (typeof window !== "undefined") {
      setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
      setClassesList(JSON.parse(localStorage.getItem("eduflow_classes") || "[]"));
      setLessonsList(JSON.parse(localStorage.getItem("eduflow_lessons") || "[]"));
    }
  };

  const addSlot = () => {
    setLockedSlots([...lockedSlots, newSlot]);
    setNewSlot({ day: newSlot.day, start: getAvailableTimes(newSlot.day)[0], end: getAvailableTimes(newSlot.day)[1] || "15:00" });
  };

  const handleLessonChange = (lesson: string) => {
    if (selectedLessons.includes(lesson)) {
      setSelectedLessons(selectedLessons.filter(l => l !== lesson));
    } else {
      setSelectedLessons([...selectedLessons, lesson]);
    }
  };

  // --- SAVE & DUPLICATE DETECTION ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId) {
      const isDuplicate = students.some(
        s => s.firstName.trim().toLowerCase() === firstName.trim().toLowerCase() &&
             s.lastName.trim().toLowerCase() === lastName.trim().toLowerCase()
      );

      if (isDuplicate) {
        const proceed = confirm(`⚠️ Προσοχή! Υπάρχει ήδη μαθητής με το όνομα "${lastName} ${firstName}". Θέλετε να προχωρήσετε στην εγγραφή;`);
        if (!proceed) return;
      }
    }

    const studentData: Student = {
      id: editingId || `s-${Date.now()}`,
      firstName,
      lastName,
      grade,
      section,
      phone,
      parentName,
      parentPhone,
      parentEmail,
      selectedLessons,
      isLockedHours,
      lockedSlots: isLockedHours ? lockedSlots : [],
      availability
    };

    const updated = editingId ? students.map(s => s.id === editingId ? studentData : s) : [...students, studentData];
    setStudents(updated);
    localStorage.setItem("eduflow_students", JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFirstName("");
    setLastName("");
    setGrade("");
    setSection("");
    setPhone("");
    setParentName("");
    setParentPhone("");
    setParentEmail("");
    setSelectedLessons([]);
    setIsLockedHours(false);
    setLockedSlots([]);
    setAvailability([]);
  };

  const startEdit = (s: Student) => {
    setEditingId(s.id);
    setFirstName(s.firstName || "");
    setLastName(s.lastName || "");
    setGrade(s.grade || "");
    setSection(s.section || "");
    setPhone(s.phone || "");
    setParentName(s.parentName || "");
    setParentPhone(s.parentPhone || "");
    setParentEmail(s.parentEmail || "");
    setSelectedLessons(s.selectedLessons || []);
    setIsLockedHours(s.isLockedHours || false);
    setLockedSlots(s.lockedSlots || []);
    setAvailability(s.availability || []);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <div className="text-slate-500 text-xs font-mono animate-pulse">Φόρτωση Πίνακα Μαθητών...</div>
      </div>
    );
  }

  const sortedStudents = [...students].sort((a, b) => a.lastName.localeCompare(b.lastName, 'el'));

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών" description="Πλήρες προφίλ μαθητών, αναθέσεις τμημάτων και σύνδεση με Scheduler.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* 📝 ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ / ΕΠΕΞΕΡΓΑΣΙΑΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit shadow-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-800 pb-3 tracking-wider">
              <UserPlus size={14} /> {editingId ? "Επεξεργασία Μαθητή" : "Εγγραφή Νέου Μαθητή"}
            </h4>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Όνομα Μαθητή *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
                <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Επώνυμο Μαθητή *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select required value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 outline-none transition-all cursor-pointer">
                  <option value="">Τάξη *</option>
                  {/* Μπορείς να βάλεις στατικά values ή δυναμικά από το classesList */}
                  {["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"].map((g, i) => <option key={i} value={g}>{g}</option>)}
                </select>
                <select required value={section} onChange={e => setSection(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 outline-none transition-all cursor-pointer">
                  <option value="">Τμήμα *</option>
                  {classesList.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Τηλέφωνο Μαθητή *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
              
              <div className="border-t border-slate-800/60 pt-2 space-y-3">
                <input required type="text" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Ονοματεπώνυμο Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
                <div className="grid grid-cols-2 gap-2">
                  <input required type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="Τηλ. Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
                  <input required type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="Email Γονέα *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* 📚 ΜΑΘΗΜΑΤΑ (ΕΠΙΛΟΓΗ ΠΟΛΛΑΠΛΩΝ) */}
            <div className="bg-[#0b0e14] border border-slate-800 rounded-xl p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Προγράμματα Σπουδών Μαθητή:</p>
              <div className="max-h-36 overflow-y-auto custom-scrollbar space-y-1.5">
                {lessonsList.map((lesson, idx) => (
                  <label key={idx} className="flex items-center gap-3 p-2 bg-[#1e2330]/50 border border-slate-800/60 rounded-lg text-xs text-slate-300 cursor-pointer hover:bg-[#1e2330] transition-colors select-none">
                    <input type="checkbox" checked={selectedLessons.includes(lesson)} onChange={() => handleLessonChange(lesson)} className="accent-indigo-500 h-3.5 w-3.5 rounded" />
                    <span>{lesson}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* INTERACTIVE AVAILABILITY MATRIX */}
            <AvailabilityMatrix availability={availability} onChange={setAvailability} />

            {/* CHECKBOX ΓΙΑ ΚΛΕΙΔΩΜΑ ΩΡΩΝ */}
            <div className="pt-2">
               <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input type="checkbox" checked={isLockedHours} onChange={e => setIsLockedHours(e.target.checked)} className="accent-rose-500" /> Κλείδωμα / Περιορισμός ωρών διαθεσιμότητας (Busy)
               </label>
            </div>

            {isLockedHours && (
              <div className="bg-[#0b0e14] p-4 rounded-xl border border-rose-500/20 space-y-3">
                <div className="grid grid-cols-4 gap-1">
                  <select className="bg-[#1e2330] p-1.5 text-[10px] text-white rounded col-span-2 border border-slate-800 focus:border-rose-500 outline-none cursor-pointer" value={newSlot.day} onChange={e => {const d = e.target.value; setNewSlot({day: d, start: getAvailableTimes(d)[0], end: getAvailableTimes(d)[1] || "15:00"});}}>
                    {["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].map(d => <option key={d}>{d}</option>)}
                  </select>
                  <select className="bg-[#1e2330] p-1.5 text-[10px] text-white rounded border border-slate-800 cursor-pointer" value={newSlot.start} onChange={e => setNewSlot({...newSlot, start: e.target.value})}>{getAvailableTimes(newSlot.day).map(t => <option key={t}>{t}</option>)}</select>
                  <select className="bg-[#1e2330] p-1.5 text-[10px] text-white rounded border border-slate-800 cursor-pointer" value={newSlot.end} onChange={e => setNewSlot({...newSlot, end: e.target.value})}>{getAvailableTimes(newSlot.day).map(t => <option key={t}>{t}</option>)}</select>
                </div>
                <button type="button" onClick={addSlot} className="w-full bg-rose-600/90 hover:bg-rose-600 py-1.5 rounded text-white text-[11px] font-semibold flex justify-center items-center gap-1 transition-colors"><Plus size={12}/> Προσθήκη Slot</button>
                
                <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                  {lockedSlots.map((s, i) => (
                    <div key={i} className="text-[10px] text-slate-300 bg-[#1e2330] p-2 rounded flex justify-between items-center border border-slate-800">
                      <span>{s.day.substring(0,3)}: {s.start} έως {s.end}</span>
                      <X size={12} className="cursor-pointer text-rose-500 hover:text-rose-400" onClick={() => setLockedSlots(lockedSlots.filter((_,idx) => idx !== i))}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button type="button" onClick={resetForm} className="w-1/3 p-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors">
                  Ακύρωση
                </button>
              )}
              <button type="submit" className={`p-3 rounded-xl text-white font-bold text-xs transition-colors shadow-lg shadow-indigo-600/10 ${editingId ? 'w-2/3 bg-emerald-600 hover:bg-emerald-500' : 'w-full bg-indigo-600 hover:bg-indigo-500'}`}>
                {editingId ? "Ενημέρωση Μαθητή" : "Αποθήκευση Μαθητή"}
              </button>
            </div>
          </form>
        </div>

        {/* 🔍 ΛΙΣΤΑ ΕΓΓΕΓΡΑΜΜΕΝΩΝ ΜΑΘΗΤΩΝ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-xl h-fit">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-800 pb-2 flex justify-between items-center">
            <span>Εγγεγραμμένοι Μαθητές</span>
            <span className="bg-[#0b0e14] px-2 py-0.5 rounded-full text-indigo-400 font-extrabold">{students.length}</span>
          </h3>
          {sortedStudents.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2">
              <AlertTriangle size={22} className="text-slate-700" />
              <span>Δεν υπάρχουν καταχωρημένοι μαθητές στο σύστημα.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedStudents.map(s => (
                <div key={s.id} className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800/80 border-l-4 border-l-indigo-500 flex flex-col gap-2 hover:border-slate-700 transition-all shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-white text-xs font-bold uppercase tracking-wide">{s.lastName} {s.firstName}</p>
                      
                      <div className="flex flex-wrap gap-2 text-[10px] mt-1.5 items-center">
                         <span className="text-indigo-400 font-bold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30 flex items-center gap-1"><GraduationCap size={10}/> {s.grade} - {s.section}</span>
                         <span className="text-emerald-400 font-medium bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/10">⏱️ {s.availability?.length || 0} ώρες διαθέσιμος</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startEdit(s)} className="text-slate-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors" title="Επεξεργασία"><Edit2 size={12}/></button>
                      <button onClick={() => {
                        if(confirm(`Οριστική διαγραφή του μαθητή ${s.lastName} ${s.firstName};`)) {
                          const updated = students.filter(x => x.id !== s.id);
                          setStudents(updated);
                          localStorage.setItem("eduflow_students", JSON.stringify(updated));
                        }
                      }} className="text-slate-600 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-900 transition-colors" title="Διαγραφή"><Trash2 size={12}/></button>
                    </div>
                  </div>

                  {/* Στοιχεία Επικοινωνίας & Γονέα */}
                  <div className="pt-2 border-t border-slate-900/60 text-slate-400 text-[10px] space-y-1">
                     <p>📞 Κιν. Μαθητή: <span className="text-slate-200 font-mono">{s.phone || "-"}</span></p>
                     <p>👨‍👩‍👦 Γονέας: <span className="text-slate-200 font-medium">{s.parentName}</span> <span className="text-slate-400 font-mono">({s.parentPhone || "-"})</span></p>
                     <p className="truncate">📧 Email: <span className="text-slate-200 font-mono" title={s.parentEmail}>{s.parentEmail || "-"}</span></p>
                  </div>

                  {/* Επιλεγμένα Μαθήματα */}
                  {s.selectedLessons && s.selectedLessons.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1 border-t border-slate-900/30 mt-1">
                      {s.selectedLessons.map((l, i) => (
                        <span key={i} className="bg-slate-900 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-800">{l}</span>
                      ))}
                    </div>
                  )}

                  {/* Εμφάνιση Κλειδωμένων Ωρών (Busy Slots) αν υπάρχουν */}
                  {s.isLockedHours && s.lockedSlots && s.lockedSlots.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      {s.lockedSlots.map((slot, idx) => (
                        <span key={idx} className="bg-rose-950/60 text-rose-300 text-[8px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 border border-rose-900/40">
                          <Clock size={8}/> {slot.day.substring(0,3)} {slot.start}-{slot.end}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}