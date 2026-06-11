"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, User, GraduationCap, Layers } from 'lucide-react';

// Σταθερή αντιστοίχιση Τάξης με τα Τμήματά της για τα κουμπιά πλοήγησης
const gradesWithSections: Record<string, string[]> = {
  "Α' Γυμνασίου": ["Α1", "Α2", "Α3"],
  "Β' Γυμνασίου": ["Β1", "Β2", "Β3"],
  "Γ' Γυμνασίου": ["Γ1", "Γ2"]
};

export default function EduFlowSchedulerViewer() {
  const [selectedGrade, setSelectedGrade] = useState<string>("Β' Γυμνασίου");
  const [selectedSection, setSelectedSection] = useState<string>("Β1");
  
  // Κατάσταση για την αποθήκευση των live δεδομένων από τον Scheduler
  const [schedulerData, setSchedulerData] = useState<Record<string, Array<{ day: string, subject: string, teacher: string, time: string }>>>({});

  // Μόλις φορτώσει η σελίδα, τραβάμε live το πρόγραμμα από το localStorage
  useEffect(() => {
    const savedSchedule = localStorage.getItem("eduflow_schedule");
    if (savedSchedule) {
      try {
        setSchedulerData(JSON.parse(savedSchedule));
      } catch (error) {
        console.error("Σφάλμα κατά την ανάγνωση του προγράμματος:", error);
      }
    }
  }, []);

  // Όταν αλλάζει η τάξη, επιλέγουμε αυτόματα το πρώτο τμήμα της
  const handleGradeClick = (grade: string) => {
    setSelectedGrade(grade);
    const sections = gradesWithSections[grade] || [];
    setSelectedSection(sections[0] || "");
  };

  // Φιλτράρισμα των μαθημάτων για το τμήμα που κλικάραμε
  const activeSchedule = schedulerData[selectedSection] || [];

  return (
    <div className="p-6 bg-[#0b0e14] text-[#f1f5f9] min-h-screen">
      
      {/* Τίτλος */}
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="text-blue-500" /> Προβολή Προγράμματος (Live)
        </h1>
        <p className="text-gray-400 text-sm mt-1">Επιλέξτε τάξη και τμήμα για να δείτε τις ώρες διδασκαλίας από τον Scheduler</p>
      </div>

      {/* ΒΗΜΑ 1: Επιλογή Τάξης (Μεγάλα Clickable Cards) */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
          <GraduationCap className="w-4 h-4 text-blue-400" /> 1. Επιλέξτε Τάξη:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.keys(gradesWithSections).map((grade) => (
            <button
              key={grade}
              onClick={() => handleGradeClick(grade)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                selectedGrade === grade
                  ? "bg-blue-950/40 border-blue-500 shadow-md shadow-blue-950 text-blue-400"
                  : "bg-[#161b26] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-slate-200"
              }`}
            >
              <div className="font-bold text-base">{grade}</div>
              <div className="text-xs opacity-75 mt-1">{gradesWithSections[grade].length} Ενεργά Τμήματα</div>
            </button>
          ))}
        </div>
      </div>

      {/* ΒΗΜΑ 2: Δυναμικά Τμήματα (Εμφανίζονται μόνο της επιλεγμένης τάξης) */}
      {selectedGrade && (
        <div className="mb-8 bg-[#161b26]/50 p-4 rounded-xl border border-gray-800">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
            <Layers className="w-4 h-4 text-emerald-400" /> 2. Διαθέσιμα Τμήματα για την {selectedGrade}:
          </label>
          <div className="flex flex-wrap gap-2">
            {gradesWithSections[selectedGrade]?.map((section) => (
              <button
                key={section}
                onClick={() => setSelectedSection(section)}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm border transition-all ${
                  selectedSection === section
                    ? "bg-emerald-500 border-emerald-400 text-[#0b0e14] shadow-lg shadow-emerald-950"
                    : "bg-[#1e2533] border-gray-700 text-gray-300 hover:bg-[#242d3e]"
                }`}
              >
                Τμήμα {section}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ΒΗΜΑ 3: Εμφάνιση Live Δεδομένων από τον Scheduler */}
      <div className="bg-[#161b26] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="text-indigo-400 w-5 h-5" /> 
            Πρόγραμμα Μαθημάτων: <span className="text-emerald-400">{selectedSection}</span>
          </h2>
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full">
            {activeSchedule.length} Ώρες καταγεγραμμένες
          </span>
        </div>

        {activeSchedule.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSchedule.map((item, index) => (
              <div 
                key={index} 
                className="bg-[#1e2533] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-950 text-blue-400 text-xs font-bold px-2 py-0.5 rounded border border-blue-900">
                      {item.day}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.time}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-1">{item.subject}</h3>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 pt-2 border-t border-gray-800/60">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Καθηγητής: <strong className="text-slate-300">{item.teacher}</strong></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-lg">
            Δεν έχουν δημιουργηθεί ακόμα ώρες στον Scheduler για το τμήμα {selectedSection} ή το localStorage είναι άδειο.
          </div>
        )}
      </div>

    </div>
  );
}