"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { Trash2, Edit2, X, GraduationCap, CheckCircle2, AlertCircle } from "lucide-react";

interface Student {
  id: string; name: string; grade: string; subject: string; school: string;
  groupSize: number; studentPhone: string; parentPhone: string; parentEmail: string;
  availability: Record<string, string[]>;
  isClassEnabled: boolean;
  assignedClassId: string | null;
}

const AVAILABLE_DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
const TIME_SLOTS = ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const GRADES = ["Α' Γυμνασίου", "Β' Γυμνασίου", "Γ' Γυμνασίου", "Α' Λυκείου", "Β' Λυκείου", "Γ' Λυκείου"];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolsList, setSchoolsList] = useState<string[]>([]);
  const [coursesList, setCoursesList] = useState<string[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]); // Για τα τμήματα
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [school, setSchool] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  
  // Νέα πεδία για το κλείδωμα
  const [isClassEnabled, setIsClassEnabled] = useState(false);
  const [assignedClassId, setAssignedClassId] = useState("");

  const loadData = () => {
    try {
      setStudents(JSON.parse(localStorage.getItem("eduflow_students") || "[]"));
      setSchoolsList(JSON.parse(localStorage.getItem("eduflow_schools") || "[]"));
      setCoursesList(JSON.parse(localStorage.getItem("eduflow_courses") || "[]"));
      setClassesList(JSON.parse(localStorage.getItem("eduflow_classes") || "[]"));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);

  const toggleSlot = (day: string, slot: string) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(slot) ? daySlots.filter(s => s !== slot) : [...daySlots, slot];
      return { ...prev, [day]: updated };
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setName(""); setGrade(""); setSubject(""); setSchool(""); setGroupSize("");
    setStudentPhone(""); setParentPhone(""); setParentEmail(""); setAvailability({});
    setIsClassEnabled(false); setAssignedClassId("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(availability).length === 0) { alert("Επιλέξτε διαθεσιμότητα."); return; }

    const studentData: Student = {
      id: editingId || `s-${Date.now()}`,
      name, grade, subject, school,
      groupSize: parseInt(groupSize) || 1,
      studentPhone, parentPhone, parentEmail, availability,
      isClassEnabled,
      assignedClassId: isClassEnabled ? assignedClassId : null
    };

    let updatedStudents;
    if (editingId) {
      updatedStudents = students.map(s => s.id === editingId ? studentData : s);
    } else {
      updatedStudents = [...students, studentData];
    }

    setStudents(updatedStudents);
    localStorage.setItem("eduflow_students", JSON.stringify(updatedStudents));
    resetForm();
  };

  const startEdit = (s: Student) => {
    setEditingId(s.id);
    setName(s.name); setGrade(s.grade); setSubject(s.subject); setSchool(s.school);
    setGroupSize(s.groupSize.toString()); setStudentPhone(s.studentPhone);
    setParentPhone(s.parentPhone); setParentEmail(s.parentEmail);
    setAvailability(s.availability);
    setIsClassEnabled(s.isClassEnabled || false);
    setAssignedClassId(s.assignedClassId || "");
  };

  const handleDelete = (id: string) => {
    const filtered = students.filter(s => s.id !== id);
    setStudents(filtered);
    localStorage.setItem("eduflow_students", JSON.stringify(filtered));
  };

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών" description="Οργάνωση μαθητών και ανάθεση σε τμήματα.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
        
        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <form onSubmit={handleSave} className="space-y-6">
            <h4 className="text-indigo-400 font-bold text-xs">{editingId ? "ΕΠΕΞΕΡΓΑΣΙΑ" : "ΝΕΟΣ ΜΑΘΗΤΗΣ"}</h4>

            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ονοματεπώνυμο" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            
            <div className="grid grid-cols-3 gap-2">
              <select required value={grade} onChange={e => setGrade(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
                <option value="">Τάξη</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select required value={subject} onChange={e => setSubject(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
                <option value="">Μάθημα</option>
                {coursesList.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
              <select required value={school} onChange={e => setSchool(e.target.value)} className="bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white">
                <option value="">Σχολείο</option>
                {schoolsList.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>

            {/* BLOCK: CLASS LOCKING */}
            <div className="bg-[#0b0e14] p-4 rounded-xl border border-indigo-500/20 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-indigo-300 cursor-pointer">
                <input type="checkbox" checked={isClassEnabled} onChange={(e) => setIsClassEnabled(e.target.checked)} className="rounded border-slate-700 bg-slate-800" />
                Κλείδωμα σε συγκεκριμένο Τμήμα
              </label>
              {isClassEnabled && (
                <select value={assignedClassId} onChange={e => setAssignedClassId(e.target.value)} className="w-full bg-[#1e2330] border border-slate-800 p-2 rounded text-xs text-white">
                  <option value="">Επιλέξτε Τμήμα...</option>
                  {classesList.map(c => <option key={c.id} value={c.id}>{c.name} ({c.subject})</option>)}
                </select>
              )}
              {!isClassEnabled && <p className="text-[10px] text-slate-500 italic">Αφήστε το κενό για αυτόματη επιλογή από τον Scheduler.</p>}
            </div>

            <div className="grid grid-cols-1 gap-3">
                <input required type="number" value={groupSize} onChange={e => setGroupSize(e.target.value)} placeholder="Αριθμός ατόμων" className="w-full bg-[#0b0e14] border border-slate-800 p-2 rounded text-xs text-white" />
            </div>

            <div className="pt-4 border-t border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 mb-2">ΔΙΑΘΕΣΙΜΟΤΗΤΑ</p>
              {AVAILABLE_DAYS.map(day => (
                <div key={day} className="flex gap-2 items-center mb-1">
                  <span className="w-16 text-[9px] text-slate-500 font-bold">{day}</span>
                  <div className="grid grid-cols-4 gap-1 flex-1">
                    {TIME_SLOTS.map(slot => (
                      <button type="button" key={slot} onClick={() => toggleSlot(day, slot)} className={`p-1 rounded text-[8px] ${availability[day]?.includes(slot) ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>{slot}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button type="submit" className={`w-full p-3 rounded-xl text-white font-bold text-xs mt-2 transition-all ${editingId ? "bg-emerald-600" : "bg-indigo-600"}`}>
              {editingId ? "Αποθήκευση Αλλαγών" : "Αποθήκευση Μαθητή"}
            </button>
          </form>
        </div>

        <div className="bg-[#1e2330] border border-slate-800 p-6 rounded-3xl h-fit">
          <h3 className="text-sm font-bold text-white mb-4">Μαθητές ({students.length})</h3>
          <div className="space-y-2">
            {students.map(s => (
              <div key={s.id} className="bg-[#0b0e14] p-3 rounded border border-slate-800 flex justify-between items-center hover:border-indigo-500/30 transition-colors">
                <div>
                  <p className="text-white text-xs font-bold">{s.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-slate-400 text-[10px]">{s.grade} • {s.school}</p>
                    {s.isClassEnabled && s.assignedClassId && (
                      <span className="bg-indigo-900/50 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded border border-indigo-800 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Κλειδωμένος
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => startEdit(s)} className="text-slate-400 hover:text-white p-2"><Edit2 className="w-3 h-3"/></button>
                    <button onClick={() => handleDelete(s.id)} className="text-slate-600 hover:text-rose-500 p-2"><Trash2 className="w-3 h-3"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}