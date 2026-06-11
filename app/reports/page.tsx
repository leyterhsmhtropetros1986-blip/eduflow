"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { FileDown, Users, BookOpen, GraduationCap, Calendar, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ReportsPage() {
  const [data, setData] = useState({ 
    students: [], 
    teachers: [], 
    classes: [], 
    schedule: [] 
  });
  
  const [status, setStatus] = useState({
    students: false,
    teachers: false,
    classes: false,
    schedule: false
  });

  // Φόρτωση και έλεγχος δεδομένων
  const loadData = () => {
    const s = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const t = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const c = JSON.parse(localStorage.getItem("eduflow_classes_data") || "[]");
    const sc = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");

    setData({ students: s, teachers: t, classes: c, schedule: sc });
    
    // Έλεγχος πληρότητας (Status Check)
    setStatus({
      students: s.length > 0,
      teachers: t.length > 0,
      classes: c.length > 0,
      schedule: sc.length > 0
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Συνάρτηση δημιουργίας PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("EduFlow - Αναφορά Σχολής", 14, 20);
    doc.setFontSize(10);
    doc.text(`Ημερομηνία: ${new Date().toLocaleDateString()}`, 14, 28);

    // 1. Μαθητές
    if (data.students.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Λίστα Μαθητών", 14, 20);
      (doc as any).autoTable({
        startY: 25,
        head: [['Όνομα', 'Τάξη', 'Τμήμα', 'Γονέας']],
        body: data.students.map((s: any) => [s.name, s.grade, s.assignedClass || '-', s.parentName]),
      });
    }

    // 2. Καθηγητές
    if (data.teachers.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Λίστα Καθηγητών", 14, 20);
      (doc as any).autoTable({
        startY: 25,
        head: [['Όνομα', 'Μάθημα', 'Τηλέφωνο']],
        body: data.teachers.map((t: any) => [t.name, t.subject, t.phone]),
      });
    }

    // 3. Πρόγραμμα
    if (data.schedule.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Εβδομαδιαίο Πρόγραμμα", 14, 20);
        (doc as any).autoTable({
            startY: 25,
            head: [['Ημέρα', 'Ώρα', 'Τμήμα', 'Καθηγητής', 'Αίθουσα']],
            body: data.schedule.map((s: any) => [s.day, s.time, s.groupName, s.teacher, s.room]),
        });
    }

    doc.save("EduFlow_Report.pdf");
  };

  return (
    <WorkspaceShell title="Αναφορές" description="Συγκεντρωτικά στοιχεία και εξαγωγή δεδομένων.">
      <div className="px-4 max-w-6xl mx-auto space-y-8">
        
        {/* HEALTH CHECKER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(status).map(([key, isReady]) => (
                <div key={key} className={`p-4 rounded-2xl border ${isReady ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="capitalize text-slate-300 text-[10px] font-bold uppercase">{key}</span>
                        {isReady ? <CheckCircle2 className="text-emerald-500" size={16} /> : <AlertCircle className="text-red-500" size={16} />}
                    </div>
                    <div className="text-white font-bold text-sm">{isReady ? "Διαθέσιμα" : "Κενό"}</div>
                </div>
            ))}
        </div>

        {/* ACTION BAR */}
        <div className="bg-[#1e2330] p-8 rounded-3xl border border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-white text-xl font-bold">Εξαγωγή Αναφορών</h2>
            <p className="text-slate-400 text-sm">Δημιουργία πλήρους αρχείου PDF με όλα τα ενεργά δεδομένα.</p>
          </div>
          <div className="flex gap-3">
              <button onClick={loadData} className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-2xl transition-all">
                  <RefreshCcw size={18} />
              </button>
              <button 
                onClick={exportToPDF}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all shadow-lg hover:shadow-indigo-500/20"
              >
                <FileDown size={18} /> Εξαγωγή σε PDF
              </button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Μαθητές" value={data.students.length} icon={<GraduationCap />} />
            <StatCard title="Καθηγητές" value={data.teachers.length} icon={<Users />} />
            <StatCard title="Τμήματα" value={data.classes.length} icon={<BookOpen />} />
            <StatCard title="Πρόγραμμα" value={data.schedule.length} icon={<Calendar />} />
        </div>
      </div>
    </WorkspaceShell>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
    return (
        <div className="bg-[#1e2330] p-5 rounded-3xl border border-slate-800 flex items-center gap-4">
            <div className="bg-[#0b0e14] p-3 rounded-xl text-indigo-400">{icon}</div>
            <div>
                <p className="text-[10px] uppercase text-slate-500 font-bold">{title}</p>
                <h4 className="text-white font-bold text-xl">{value}</h4>
            </div>
        </div>
    );
}