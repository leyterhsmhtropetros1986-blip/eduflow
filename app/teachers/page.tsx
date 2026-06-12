"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { AvailabilityMatrix } from "../../components/AvailabilityMatrix";
import { Trash2, Edit2, UserPlus, Plus, X, Clock, Phone, Mail } from "lucide-react";

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

const DAYS_ORDER: Record<string, number> = { 
  "Δευτέρα": 1, "Τρίτη": 2, "Τετάρτη": 3, "Πέμπτη": 4, "Παρασκευή": 5, "Σάββατο": 6 
};

export default function TeachersPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  
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
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({ day: "Δευτέρα", start: "14:00", end: "15:00" });
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  const getAvailableTimes = (day: string) => {
    if (day === "Σάββατο") return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
    return ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  };

  useEffect(() => {
    setIsMounted(true);
    loadData();
  }, []);

  const loadData = () => {
    if (typeof window !== "undefined") {
      try {
        const storedTeachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
        const sorted = [...storedTeachers].sort((a, b) => a.lastName.localeCompare(b.lastName, "el"));
        setTeachers(sorted);
        setClassesList(JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]"));
        setLessonsList(JSON.parse(localStorage.getItem("eduflow_lessons") || "[]"));
      } catch {
        setTeachers([]); setClassesList([]); setLessonsList([]);
      }
    }
  };

  const addSlot = () => {
    if (newSlot.start >= newSlot.end) { alert("Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης."); return; }
    const overlap = lockedSlots.some(s => s.day === newSlot.day && newSlot.start < s.end && newSlot.end > s.start);
    if (overlap) { alert("Υπάρχει ήδη επικαλυπτόμενο busy slot."); return; }
    setLockedSlots([...lockedSlots, newSlot]);
    setNewSlot({ day: "Δευτέρα", start: "14:00", end: "15:00" });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isDuplicate = teachers.some(t => t.id !== editingId && (
           (t.firstName.trim().toLowerCase() === firstName.trim().toLowerCase() && t.lastName.trim().toLowerCase() === lastName.trim().toLowerCase()) ||
           t.email.toLowerCase() === email.toLowerCase() || t.phone === phone
    ));
    if (isDuplicate && !confirm(`⚠️ Προσοχή! Υπάρχει ήδη καθηγητής με αυτά τα στοιχεία. Θέλετε να συνεχίσετε;`)) return;

    const sortFn = (a: AvailabilitySlot, b: AvailabilitySlot) => (DAYS_ORDER[a.day] || 7) - (DAYS_ORDER[b.day] || 7) || a.start.localeCompare(b.start);
    const teacherData: Teacher = {
      id: editingId || `t-${Date.now()}`,
      firstName, lastName, phone, email, subject, 
      isLockedClass, assignedClassId: isLockedClass ? assignedClassId : null,
      isLockedHours,
      lockedSlots: isLockedHours ? [...lockedSlots].sort(sortFn) : [],
      availability: [...availability].sort(sortFn)
    };

    const updated = editingId ? teachers.map(t => t.id === editingId ? teacherData : t) : [...teachers, teacherData];
    const sorted = [...updated].sort((a, b) => a.lastName.localeCompare(b.lastName, "el"));
    
    setTeachers(sorted);
    localStorage.setItem("eduflow_teachers", JSON.stringify(sorted));
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null); setFirstName(""); setLastName(""); setPhone(""); setEmail(""); setSubject(""); 
    setIsLockedClass(false); setAssignedClassId(""); setIsLockedHours(false); setLockedSlots([]); setAvailability([]);
  };

  const startEdit = (t: Teacher) => {
    setEditingId(t.id); setFirstName(t.firstName); setLastName(t.lastName); setPhone(t.phone); 
    setEmail(t.email); setSubject(t.subject); setIsLockedClass(t.isLockedClass); setAssignedClassId(t.assignedClassId || ""); 
    setIsLockedHours(t.isLockedHours); setLockedSlots(t.lockedSlots || []); setAvailability(t.availability || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTeacher = (id: string) => {
    if(confirm("Να διαγραφεί ο καθηγητής;")) {
      const updated = teachers
        .filter(t => t.id !== id)
        .sort((a, b) => a.lastName.localeCompare(b.lastName, "el"));
      
      setTeachers(updated);
      localStorage.setItem("eduflow_teachers", JSON.stringify(updated));
    }
  };

  if (!isMounted) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center"><div className="text-slate-500 text-xs font-mono animate-pulse">Φόρτωση...</div></div>;

  const lockedCount = teachers.filter(t => t.isLockedClass || t.isLockedHours).length;
  const totalSlots = teachers.reduce((acc, t) => acc + (t.availability?.length || 0), 0);

  return (
    <WorkspaceShell title="Διαχείριση Καθηγητών" description="Προφίλ καθηγητών, επικοινωνία, ορισμός διαθεσιμότητας και δεσμεύσεις.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        {/* ΦΟΡΜΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit shadow-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-indigo-400 font-bold text-xs uppercase flex items-center gap-2 border-b border-slate-800 pb-3 tracking-wider">
              <UserPlus size={14} /> {editingId ? "Επεξεργασία Στοιχείων" : "Εγγραφή Νέου Καθηγητή"}
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Όνομα *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all" />
              <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Επίθετο *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Τηλέφωνο *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all" />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *" className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all" />
            </div>
            <select required value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-xs text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all cursor-pointer">
              <option value="">Επιλέξτε Κύριο Μάθημα *</option>
              {lessonsList.map((l: any) => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>

            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Διαθεσιμότητα</label>
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Επιλεγμένες ώρες: {availability.length}</span>
                </div>
                <AvailabilityMatrix availability={availability} onChange={setAvailability} />
            </div>

            <div className="flex gap-2">
                {editingId && (
                  <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-all">
                    Ακύρωση
                  </button>
                )}
                <button type="submit" className={`flex-1 p-3 rounded-xl text-white font-bold text-xs transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ${editingId ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                  <Plus size={16} /> {editingId ? "Ενημέρωση Καθηγητή" : "Προσθήκη Καθηγητή"}
                </button>
            </div>
          </form>
        </div>

        {/* ΛΙΣΤΑ */}
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl shadow-xl h-fit">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-800 pb-2 flex justify-between items-center">
            <span>Εγγεγραμμένοι Καθηγητές</span>
            <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Active: {teachers.length}
            </span>
          </h3>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
             <div className="bg-[#0b0e14] p-2 rounded-xl border border-slate-800 text-center"><p className="text-[10px] text-slate-500">Σύνολο</p><p className="text-sm font-bold text-white">{teachers.length}</p></div>
             <div className="bg-[#0b0e14] p-2 rounded-xl border border-slate-800 text-center"><p className="text-[10px] text-slate-500">Locked</p><p className="text-sm font-bold text-rose-400">{lockedCount}</p></div>
             <div className="bg-[#0b0e14] p-2 rounded-xl border border-slate-800 text-center"><p className="text-[10px] text-slate-500">Slots</p><p className="text-sm font-bold text-emerald-400">{totalSlots}</p></div>
          </div>

          <div className="space-y-2">
            {teachers.map(t => (
              <div key={t.id} className="bg-[#0b0e14] p-3 rounded-xl border border-slate-800 hover:border-indigo-500 transition-all duration-300 hover:shadow-lg border-l-4 border-l-indigo-500 group">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-white text-xs font-bold uppercase">{t.lastName} {t.firstName}</p>
                    <div className="flex flex-wrap gap-2 text-[10px] mt-1.5 items-center">
                       <span className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">{t.subject}</span>
                       {t.isLockedClass && <span className="bg-indigo-950 text-indigo-400 font-bold px-1.5 py-0.5 rounded border border-indigo-900/40">🔒 {t.assignedClassId}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(t)} className="text-slate-500 hover:text-indigo-400 p-1.5"><Edit2 size={12}/></button>
                    <button onClick={() => deleteTeacher(t.id)} className="text-slate-600 hover:text-rose-500 p-1.5"><Trash2 size={12}/></button>
                  </div>
                </div>
                
                {t.isLockedHours && t.lockedSlots?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-900/60 flex flex-wrap gap-1">
                    {t.lockedSlots.map((slot, idx) => (
                      <span key={idx} className="bg-rose-950/40 text-rose-300 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 border border-rose-900/30">
                        <Clock size={8}/> {slot.day.substring(0,3)} {slot.start}-{slot.end}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 mt-2 border-t border-slate-900/60 text-slate-400 text-[10px] flex gap-4">
                   <a href={`tel:${t.phone}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"><Phone size={10}/> {t.phone}</a>
                   <a href={`mailto:${t.email}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"><Mail size={10}/> {t.email}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}