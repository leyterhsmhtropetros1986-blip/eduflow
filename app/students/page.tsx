"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { 
  Trash2, Edit2, UserPlus, Plus, X, Clock, BookOpen, Layers, 
  Search, Filter, Users, Lock, GraduationCap, School, AlertTriangle 
} from "lucide-react";

interface AvailabilitySlot { day: string; start: string; end: string; }

interface Student {
  id: string; 
  firstName: string; 
  lastName: string;  
  grade: string; 
  section: string;   
  subjects: string[]; 
  studentPhone: string;
  parentName: string; 
  parentPhone: string; 
  parentEmail: string;
  isLockedHours: boolean; 
  lockedSlots: AvailabilitySlot[];
}

const gradeSectionsMap: Record<string, string[]> = {
  'Α ΓΥΜΝΑΣΙΟΥ': ['Α1', 'Α2', 'Α3'],
  'Β ΓΥΜΝΑΣΙΟΥ': ['Β1', 'Β2', 'Β3'],
  'Γ ΓΥΜΝΑΣΙΟΥ': ['Γ1', 'Γ2'],
  'Α ΛΥΚΕΙΟΥ': ['Α1', 'Α2'],
  'Β ΛΥΚΕΙΟΥ': ['Β1', 'Β2'],
  'Γ ΛΥΚΕΙΟΥ': ['Γ1', 'Γ2'],
  'ΜΕΤΑΛΥΚΕΙΑΚΟΙ': ['Μ1', 'Μ2']
};

const availableSubjectsList = [
  'Μαθηματικά', 'Φυσική', 'Χημεία', 'Βιολογία', 
  'Νέα Ελληνικά / Έκθεση', 'Αρχαία Ελληνικά', 'Ιστορία', 'Πληροφορική'
];

export default function StudentsPage() {
  // --- STATES ---
  const [students, setStudents] = useState<Student[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterSection, setFilterSection] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", grade: "", section: "", subjects: [] as string[], 
    studentPhone: "", parentName: "", parentPhone: "", parentEmail: ""
  });
  
  const [isLockedHours, setIsLockedHours] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<AvailabilitySlot[]>([]);
  const [newSlot, setNewSlot] = useState<AvailabilitySlot>({ day: "Δευτέρα", start: "14:00", end: "15:00" });

  const getAvailableTimes = (day: string) => {
    if (day === "Σάββατο") return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];
    return ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  };

  // Load from localStorage
  useEffect(() => {
    setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
  }, []);

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const addSlot = () => {
    setLockedSlots([...lockedSlots, newSlot]);
    setNewSlot({ day: newSlot.day, start: getAvailableTimes(newSlot.day)[0], end: getAvailableTimes(newSlot.day)[1] || "15:00" });
  };

  // --- SAVE & VALIDATION & DUPLICATE DETECTION ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.subjects.length === 0) {
      alert("⚠️ Πρέπει να επιλέξεις τουλάχιστον ένα μάθημα για τον μαθητή!");
      return;
    }

    // Duplicate Detection (Μόνο όταν προσθέτουμε νέο μαθητή, όχι στο edit)
    if (!editingId) {
      const isDuplicate = students.some(
        s => s.firstName.trim().toLowerCase() === formData.firstName.trim().toLowerCase() &&
             s.lastName.trim().toLowerCase() === formData.lastName.trim().toLowerCase()
      );

      if (isDuplicate) {
        const proceed = confirm(`⚠️ Προσοχή! Υπάρχει ήδη καταχωρημένος μαθητής με το όνομα "${formData.lastName} ${formData.firstName}". Θέλετε να προχωρήσετε σε διπλή εγγραφή;`);
        if (!proceed) return;
      }
    }

    const studentData: Student = {
      id: editingId || `s-${Date.now()}`,
      ...formData,
      isLockedHours, 
      lockedSlots: isLockedHours ? lockedSlots : []
    };
    
    const updated = editingId 
      ? students.map(s => s.id === editingId ? studentData : s) 
      : [...students, studentData];
      
    setStudents(updated);
    localStorage.setItem("eduflow_students", JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null); 
    setFormData({ firstName: "", lastName: "", grade: "", section: "", subjects: [], studentPhone: "", parentName: "", parentPhone: "", parentEmail: "" });
    setIsLockedHours(false); 
    setLockedSlots([]);
  };

  // --- DERIVED METRICS (STATS) ---
  const totalStudents = students.length;
  const lockedSchedulesCount = students.filter(s => s.isLockedHours).length;
  const gymnasioCount = students.filter(s => s.grade.includes("ΓΥΜΝΑΣΙΟΥ")).length;
  const lykeioCount = students.filter(s => s.grade.includes("ΛΥΚΕΙΟΥ")).length;

  // --- LIVE FILTERING ---
  const filteredStudents = students
    .filter(s => {
      const fullName = `${s.lastName} ${s.firstName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesGrade = filterGrade === "" || s.grade === filterGrade;
      const matchesSection = filterSection === "" || s.section === filterSection;
      return matchesSearch && matchesGrade && matchesSection;
    })
    .sort((a, b) => a.lastName.localeCompare(b.lastName, 'el'));

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών" description="Πλήρες προφίλ μαθητών, live φίλτρα, στατιστικά και έλεγχος διαθεσιμότητας.">
      
      {/* 📊 STATISTICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 mb-6">
        <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Users size={20} /></div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Συνολικοί Μαθητές</p>
            <h3 className="text-white text-xl font-black">{totalStudents}</h3>
          </div>
        </div>

        <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><Lock size={20} /></div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Κλειδωμένα Ωράρια</p>
            <h3 className="text-white text-xl font-black">{lockedSchedulesCount}</h3>
          </div>
        </div>

        <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><School size={20} /></div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Μαθητές Γυμνασίου</p>
            <h3 className="text-white text-xl font-black">{gymnasioCount}</h3>
          </div>
        </div>

        <div className="bg-[#1e2330] border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><GraduationCap size={20} /></div>
          <div>
            <p className="text-slate-500 text-[10px] font-bold tracking-wider uppercase">Μαθητές Λυκείου</p>
            <h3 className="text-white text-xl font-black">{lykeioCount}</h3>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-4">
        
        {/* 📝 ΦΟΡΜΑ ΕΓΓΡΑΦΗΣ / ΕΠΕΞΕΡΓΑΣΙΑΣ */}
        <div className="xl:col-span-1 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit shadow-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-indigo-400 font-bold text-xs flex items-center gap-2 border-b border-slate-800 pb-2.5 tracking-wider">
              <UserPlus size={14} /> {editingId ? "ΕΠΕΞΕΡΓΑΣΙΑ ΣΤΟΙΧΕΙΩΝ ΜΑΘΗΤΗ" : "ΕΓΓΡΑΦΗ ΝΕΟΥ ΜΑΘΗΤΗ"}
            </h4>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="Όνομα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-indigo-500 outline-none transition-colors w-full" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                <input required placeholder="Επώνυμο *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-indigo-500 outline-none transition-colors w-full" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <select required className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs cursor-pointer focus:border-indigo-500 outline-none w-full" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value, section: ""})}>
                  <option value="">Τάξη *</option>
                  {Object.keys(gradeSectionsMap).map(g => <option key={g} value={g}>{g}</option>)}
                </select>

                <select required disabled={!formData.grade} className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus:border-indigo-500 outline-none transition-all w-full" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}>
                  <option value="">Τμήμα *</option>
                  {formData.grade && gradeSectionsMap[formData.grade]?.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <input required type="tel" placeholder="Τηλέφωνο Μαθητή *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-indigo-500 outline-none w-full" value={formData.studentPhone} onChange={e => setFormData({...formData, studentPhone: e.target.value})} />
              <input required placeholder="Ονοματεπώνυμο Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-indigo-500 outline-none w-full" value={formData.parentName} onChange={e => setFormData({...formData, parentName: e.target.value})} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input required type="tel" placeholder="Τηλ. Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-indigo-500 outline-none w-full" value={formData.parentPhone} onChange={e => setFormData({...formData, parentPhone: e.target.value})} />
                <input required type="email" placeholder="Email Γονέα *" className="bg-[#0b0e14] border border-slate-800 p-3 rounded-xl text-white text-xs focus:border-indigo-500 outline-none w-full" value={formData.parentEmail} onChange={e => setFormData({...formData, parentEmail: e.target.value})} />
              </div>
            </div>

            {/* CHECKBOXES ΜΑΘΗΜΑΤΩΝ */}
            <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800/80 space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={13} className="text-indigo-400" /> Μαθήματα (Επιλογή πολλαπλών):
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                {availableSubjectsList.map(sub => {
                  const isChecked = formData.subjects.includes(sub);
                  return (
                    <label key={sub} className={`flex items-center gap-3 p-2 rounded-lg border text-[11px] cursor-pointer select-none transition-all ${
                      isChecked 
                        ? "bg-indigo-950/40 border-indigo-500 text-indigo-300 shadow-sm" 
                        : "bg-[#1e2330] border-slate-800/60 text-slate-400 hover:border-slate-700"
                    }`}>
                      <input type="checkbox" checked={isChecked} onChange={() => handleSubjectToggle(sub)} className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer" />
                      {sub}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ΔΙΑΘΕΣΙΜΟΤΗΤΑ */}
            <div className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="flex items-center gap-2 text-xs text-rose-300 font-medium cursor-pointer select-none">
                <input type="checkbox" checked={isLockedHours} onChange={e => setIsLockedHours(e.target.checked)} className="rounded text-rose-600 focus:ring-rose-500" />
                Κλείδωμα / Περιορισμός ωρών διαθεσιμότητας
              </label>
              {isLockedHours && (
                <div className="space-y-2 transition-all">
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
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2 pt-2">
              {editingId && (
                <button type="button" onClick={resetForm} className="w-1/3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors">
                  ΑΚΥΡΩΣΗ
                </button>
              )}
              <button type="submit" className={`p-3 rounded-xl text-white font-bold text-xs transition-colors ${editingId ? 'w-2/3 bg-emerald-600 hover:bg-emerald-500' : 'w-full bg-indigo-600 hover:bg-indigo-500'}`}>
                {editingId ? "ΕΝΗΜΕΡΩΣΗ ΜΑΘΗΤΗ" : "ΑΠΟΘΗΚΕΥΣΗ ΜΑΘΗΤΗ"}
              </button>
            </div>
          </form>
        </div>

        {/* 🔍 ΛΙΣΤΑ ΜΑΘΗΤΩΝ ΜΕ SEARCH & ΦΙΛΤΡΑ */}
        <div className="xl:col-span-2 bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-[85vh] flex flex-col shadow-xl">
          
          {/* SEARCH & FILTERS HEADER ZONE */}
          <div className="bg-[#0b0e14] p-4 rounded-2xl border border-slate-800/60 mb-4 space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span>ΕΓΓΕΓΡΑΜΜΕΝΟΙ ΜΑΘΗΤΕΣ</span>
                <span className="bg-[#1e2330] px-2 py-0.5 rounded-full text-indigo-400 font-extrabold">{filteredStudents.length}</span>
              </h3>
              {(searchTerm || filterGrade || filterSection) && (
                <button onClick={() => { setSearchTerm(""); setFilterGrade(""); setFilterSection(""); }} className="text-[10px] text-rose-400 hover:underline flex items-center gap-1">
                  Καθαρισμός φίλτρων
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Live Search Input */}
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-slate-500" />
                <input type="text" placeholder="Αναζήτηση με όνομα..." className="bg-[#1e2330] border border-slate-800 pl-9 pr-3 py-2 rounded-xl text-white text-xs outline-none focus:border-indigo-500 w-full placeholder-slate-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>

              {/* Filter Grade */}
              <div className="relative flex items-center">
                <Filter size={12} className="absolute left-3 text-slate-500" />
                <select className="bg-[#1e2330] border border-slate-800 pl-8 pr-3 py-2 rounded-xl text-white text-xs outline-none focus:border-indigo-500 w-full cursor-pointer" value={filterGrade} onChange={e => { setFilterGrade(e.target.value); setFilterSection(""); }}>
                  <option value="">Όλες οι Τάξεις</option>
                  {Object.keys(gradeSectionsMap).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Filter Section */}
              <div className="relative flex items-center">
                <Layers size={12} className="absolute left-3 text-slate-500" />
                <select disabled={!filterGrade} className="bg-[#1e2330] border border-slate-800 pl-8 pr-3 py-2 rounded-xl text-white text-xs outline-none focus:border-indigo-500 w-full cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" value={filterSection} onChange={e => setFilterSection(e.target.value)}>
                  <option value="">Όλα τα Τμήματα</option>
                  {filterGrade && gradeSectionsMap[filterGrade]?.map(sec => (
                    <option key={sec} value={sec}>Τμήμα {sec}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* CARDS LIST CONTAINER */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-16 text-slate-600 text-xs border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2">
                <AlertTriangle size={24} className="text-slate-700" />
                <span>Δεν βρέθηκαν μαθητές με τα επιλεγμένα κριτήρια.</span>
              </div>
            ) : (
              filteredStudents.map(s => (
                <div key={s.id} className="bg-[#0b0e14] p-4 rounded-xl border border-slate-800/80 border-l-4 border-l-indigo-500 space-y-2.5 hover:border-slate-700 transition-all shadow-sm">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="text-slate-100 text-xs font-bold uppercase tracking-wide">{s.lastName} {s.firstName}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="text-[8px] bg-slate-900 text-slate-400 font-medium px-1.5 py-0.5 rounded border border-slate-800">{s.grade}</span>
                            <span className="text-[8px] bg-emerald-950/60 text-emerald-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-900/50">
                              <Layers size={8} /> {s.section}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {s.subjects?.map((sub, idx) => (
                              <span key={idx} className="text-[8px] bg-indigo-950 text-indigo-300 font-medium px-1.5 py-0.5 rounded border border-indigo-900/40">
                                {sub}
                              </span>
                            ))}
                          </div>
                      </div>
                      
                      <div className="flex gap-2.5 shadow-sm">
                        <button onClick={() => { 
                            setFormData({ firstName: s.firstName, lastName: s.lastName, grade: s.grade, section: s.section, subjects: s.subjects || [], studentPhone: s.studentPhone, parentName: s.parentName, parentPhone: s.parentPhone, parentEmail: s.parentEmail }); 
                            setIsLockedHours(s.isLockedHours); setLockedSlots(s.lockedSlots); setEditingId(s.id); 
                          }} className="text-slate-500 hover:text-indigo-400 transition-colors" title="Επεξεργασία"><Edit2 size={12}/></button>
                        <button onClick={() => {
                            if(confirm(`Διαγραφή του μαθητή ${s.lastName} ${s.firstName};`)) {
                              const updated = students.filter(st => st.id !== s.id);
                              setStudents(updated);
                              localStorage.setItem("eduflow_students", JSON.stringify(updated));
                            }
                        }} className="text-slate-600 hover:text-rose-500 transition-colors" title="Διαγραφή"><Trash2 size={12}/></button>
                      </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-900/60 space-y-1 text-slate-400 text-[10px] grid grid-cols-1 sm:grid-cols-3 gap-x-2">
                      <p>📞 Μαθητής: <span className="text-slate-200 font-mono">{s.studentPhone}</span></p>
                      <p>👨‍👩‍👧 Γονέας: <span className="text-slate-200">{s.parentName}</span> <span className="text-slate-400 font-mono">({s.parentPhone})</span></p>
                      <p className="truncate">📧 Email: <span className="text-slate-200 font-mono" title={s.parentEmail}>{s.parentEmail}</span></p>
                  </div>

                  {s.isLockedHours && s.lockedSlots && s.lockedSlots.length > 0 && (
                      <div className="pt-1.5 flex flex-wrap gap-1">
                          {s.lockedSlots.map((slot, idx) => (
                              <span key={idx} className="bg-rose-950/60 text-rose-300 text-[8px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 border border-rose-900/40">
                                  <Clock size={8}/> {slot.day.substring(0,3)} {slot.start}-{slot.end}
                              </span>
                          ))}
                      </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}