"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { AvailabilityMatrix } from "../../components/AvailabilityMatrix";
import { Trash2, Edit2, UserPlus, Plus, X, Lock, Clock, BookOpen, AlertTriangle } from "lucide-react";

interface AvailabilitySlot { day: string; start: string; end: string; }

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  subject: string;
  isLockedClass: boolean;
  assignedClassId: string | null;
  isLockedHours: boolean;
  lockedSlots: AvailabilitySlot[];
  availability: AvailabilitySlot[];
}

export default function TeachersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<string[]>([]);
  
  // States για το Form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  
  const [isLockedClass, setIsLockedClass] = useState(false);
  const [assignedClassId, setAssignedClassId] = useState("");
  
  const [isLockedHours, setIsLockedHours] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<AvailabilitySlot[]>([]);
  
  // Δυναμικό ωράριο: Το Σάββατο επεκτάθηκε έως τις 17:00
  const getAvailableTimes = (day: string) => {
    if (day === "Σάββατο") return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    return ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  };

  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({ day: "Δευτέρα", start: "14:00", end: "15:00" });
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  const loadData = () => {
    if (typeof window !== "undefined") {
      setTeachers(JSON.parse(localStorage.getItem("eduflow_teachers") || "[]"));
      setClassesList(JSON.parse(localStorage.getItem("eduflow_classes") || "[]"));
      setLessonsList(JSON.parse(localStorage.getItem("eduflow_lessons") || "[]"));
    }
  };

  const addSlot = () => {
    setLockedSlots([...lockedSlots, newSlot]);
    setNewSlot({ day: newSlot.day, start: getAvailableTimes(newSlot.day)[0], end: getAvailableTimes(newSlot.day)[1] || "15:00" });
  };

  // --- SAVE & VALIDATION & DUPLICATE DETECTION ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId) {
      const isDuplicate = teachers.some(
        t => t.firstName.trim().toLowerCase() === firstName.trim().toLowerCase() &&
             t.lastName.trim().toLowerCase() === lastName.trim().toLowerCase()
      );

      if (isDuplicate) {
        const proceed = confirm(`⚠️ Προσοχή! Υπάρχει ήδη καθηγητής με το όνομα "${lastName} ${firstName}". Θέλετε να προχωρήσετε στην εγγραφή;`);
        if (!proceed) return;
      }
    }

    const teacherData: Teacher = {
      id: editingId || `t-${Date.now()}`,
      firstName,
      lastName,
      phone,
      email,
      subject, 
      isLockedClass,
      assignedClassId: isLockedClass ? assignedClassId : null,
      isLockedHours,
      lockedSlots: isLockedHours ? lockedSlots : [],
      availability
    };

    const updated = editingId ? teachers.map(t => t.id === editingId ? teacherData : t) : [...teachers, teacherData];
    setTeachers(updated);
    localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null); 
    setFirstName(""); 
    setLastName(""); 
    setPhone(""); 
    setEmail(""); 
    setSubject(""); 
    setIsLockedClass(false);
    setAssignedClassId(""); 
    setIsLockedHours(false); 
    setLockedSlots([]); 
    setAvailability([]);
  };

  const startEdit = (t: Teacher) => {
    setEditingId(t.id); 
    setFirstName(t.firstName || ""); 
    setLastName(t.lastName || "");
    setPhone(t.phone || "");
    setEmail(t.email || "");
    setSubject(t.subject); 
    setIsLockedClass(t.isLockedClass);
    setAssignedClassId(t.assignedClassId || ""); 
    setIsLockedHours(t.isLockedHours);
    setLockedSlots(t.lockedSlots || []); 
    setAvailability(t.availability || []);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <div className="text-slate-500 text-xs font-mono animate-pulse">Φόρτωση Πίνακα Καθηγητών...</div>
      </div>
    );
  }

  const sortedTeachers = [...teachers].sort((a, b) => a.lastName.localeCompare(b.lastName, 'el'));

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Προφίλ καθηγητών, επικοινωνία, ορισμός διαθεσιμότητας και δεσμεύσεις.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* 📝 ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ / ΕΠΕΞΕΡΓΑΣΙΑΣ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit shadow-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-800 pb-3 tracking-wider">
              <UserPlus size={14} /> {editingId ? "Επεξεργασία Στοιχείων" : "Εγγραφή Νέου Καθηγητή"}
            </h4>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Όνομα *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
                <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Επίθετο *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Τηλέφωνο *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-all" />
              </div>

              <select required value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 outline-none transition-all cursor-pointer">
                <option value="">Επιλέξτε Κύριο Μάθημα *</option>
                {lessonsList.map((l, i) => <option key={i} value={l}>{l}</option>)}
              </select>
            </div>

            {/* INTERACTIVE MATRIX */}
            <AvailabilityMatrix availability={availability} onChange={setAvailability} />

            {/* CHECKBOXES & LOCKED SLOTS */}
            <div className="grid grid-cols-2 gap-4 pt-2">
               <div className="space-y-2">
                 <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input type="checkbox" checked={isLockedClass} onChange={e => setIsLockedClass(e.target.checked)} className="accent-indigo-500" /> Κλείδωμα Τμήματος
                 </label>
                 {isLockedClass && (
                    <select value={assignedClassId} onChange={e => setAssignedClassId(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded-xl text-xs text-white focus:border-indigo-500 outline-none">
                      <option value="">Επιλογή...</option>
                      {classesList.map((c, i) => <option key={i} value={c.name}>{c.name}</option>)}
                    </select>
                 )}
               </div>

               <div className="space-y-2">
                 <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input type="checkbox" checked={isLockedHours} onChange={e => setIsLockedHours(e.target.checked)} className="accent-rose-500" /> Κλείδωμα Ωρών (Busy)
                 </label>
               </div>
            </div>

            {isLockedHours && (
              <div className="bg-[#0b0e14] p-4 rounded-xl border border-rose-500/20 space-y-3">
                <div className="grid grid-cols-4 gap-1">
                  <select className="bg-[#1e2330] p-1.5 text-[10px] text-white rounded col-span-2 border border-slate-800 focus:border-rose-500 outline-none" value={newSlot.day} onChange={e => {const d = e.target.value; setNewSlot({day: d, start: getAvailableTimes(d)[0], end: getAvailableTimes(d)[1] || "15:00"});}}>
                    {["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].map(d => <option key={d}>{d}</option>)}
                  </select>
                  <select className="bg-[#1e2330] p-1.5 text-[10px] text-white rounded border border-slate-800" value={newSlot.start} onChange={e => setNewSlot({...newSlot, start: e.target.value})}>{getAvailableTimes(newSlot.day).map(t => <option key={t}>{t}</option>)}</select>
                  <select className="bg-[#1e2330] p-1.5 text-[10px] text-white rounded border border-slate-800" value={newSlot.end} onChange={e => setNewSlot({...newSlot, end: e.target.value})}>{getAvailableTimes(newSlot.day).map(t => <option key={t}>{t}</option>)}</select>
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
                {editingId ? "Ενημέρωση Καθηγητή" : "Προσθήκη Καθηγητή"}
              </button>
            </div>
          </form>
        </div>

        {/* 🔍 ΛΙΣΤΑ ΚΑΘΗΓΗΤΩΝ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-xl h-fit">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-800 pb-2 flex justify-between items-center">
            <span>Εγγεγραμμένοι Καθηγητές</span>
            <span className="bg-[#0b0e14] px-2 py-0.5 rounded-full text-indigo-400 font-extrabold">{teachers.length}</span>
          </h3>
          {sortedTeachers.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2">
              <AlertTriangle size={22} className="text-slate-700" />
              <span>Δεν υπάρχουν καταχωρημένοι καθηγητές.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedTeachers.map(t => (
                <div key={t.id} className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800/80 border-l-4 border-l-indigo-500 flex flex-col gap-2 hover:border-slate-700 transition-all shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-white text-xs font-bold uppercase tracking-wide">{t.lastName} {t.firstName}</p>
                      
                      <div className="flex flex-wrap gap-2 text-[10px] mt-1.5 items-center">
                         <span className="text-slate-400 font-medium bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{t.subject}</span>
                         {t.isLockedClass && <span className="bg-indigo-950 text-indigo-400 font-bold px-1.5 py-0.5 rounded border border-indigo-900/40">🔒 {t.assignedClassId}</span>}
                         <span className="text-emerald-400 font-medium bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/10">⏱️ {t.availability?.length || 0} ώρες</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startEdit(t)} className="text-slate-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors" title="Επεξεργασία"><Edit2 size={12}/></button>
                      <button onClick={() => {
                        if(confirm(`Οριστική διαγραφή του καθηγητή ${t.lastName} ${t.firstName};`)) {
                          const updated = teachers.filter(x => x.id !== t.id);
                          setTeachers(updated);
                          localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
                        }
                      }} className="text-slate-600 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-900 transition-colors" title="Διαγραφή"><Trash2 size={12}/></button>
                    </div>
                  </div>

                  {/* Στοιχεία Επικοινωνίας */}
                  <div className="pt-2 border-t border-slate-900/60 text-slate-400 text-[10px] grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-2">
                     <p>📞 Τηλ: <span className="text-slate-200 font-mono">{t.phone || "-"}</span></p>
                     <p className="truncate">📧 Email: <span className="text-slate-200 font-mono" title={t.email}>{t.email || "-"}</span></p>
                  </div>

                  {/* Εμφάνιση Κλειδωμένων Ωρών (Busy Slots) αν υπάρχουν */}
                  {t.isLockedHours && t.lockedSlots && t.lockedSlots.length > 0 && (
                    <div className="pt-1.5 flex flex-wrap gap-1">
                      {t.lockedSlots.map((slot, idx) => (
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