"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { AvailabilityMatrix } from "../../components/AvailabilityMatrix";
import { Trash2, Edit2, UserPlus, Plus, X, GraduationCap, AlertTriangle, BookOpen, Layers, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

interface AvailabilitySlot { day: string; start: string; end: string; }
interface StudentEnrollment { lessonName: string; className: string; }

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  school_grade: string;
  phone: string;
  parent_name: string;
  parent_phone: string;
  email: string;
  enrollments: StudentEnrollment[];
  isLockedHours: boolean;
  lockedSlots: AvailabilitySlot[];
  availability: AvailabilitySlot[];
}

export default function StudentsPage() {
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<string[]>([]);
  
  // States Φόρμας
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [grade, setGrade] = useState("");
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [formEnrollments, setFormEnrollments] = useState<StudentEnrollment[]>([]);
  const [isLockedHours, setIsLockedHours] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<AvailabilitySlot[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    init();
  }, []);

  // 1. Αρχικοποίηση: Μόνο μία κλήση για το User Auth
  const init = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // FUTURE-PROOF: Εδώ θα γίνει το query στον "profiles" πίνακα
      // const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user.id).single();
      // const currentSchoolId = profile.school_id;
      
      const currentSchoolId = user.id; // Προσωρινό
      setSchoolId(currentSchoolId);
      await loadData(currentSchoolId);
    } catch (err) {
      console.error("Auth init error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Data Loading: Καθαρή συνάρτηση που δέχεται το schoolId
  const loadData = async (sid: string) => {
    try {
      // Fetch Students
      const { data: studentsData, error: sErr } = await supabase
        .from("students")
        .select("*")
        .eq("school_id", sid);
        
      if (sErr) throw sErr;
      setStudents(studentsData || []);

      // Fetch Local Configs
      const localClasses = localStorage.getItem("eduflow_classes_data");
      setClassesList(localClasses ? JSON.parse(localClasses) : []);

      const localLessons = localStorage.getItem("eduflow_lessons");
      const parsed = localLessons ? JSON.parse(localLessons) : [];
      setLessonsList(
        parsed.map((l: any) => (typeof l === "string" ? l : l.name))
      );
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId) return;

    const payload = {
      school_id: schoolId,
      first_name: firstName,
      last_name: lastName,
      school_grade: grade,
      phone: phone,
      parent_name: parentName,
      parent_phone: parentPhone,
      email: parentEmail,
      enrollments: formEnrollments,
      isLockedHours: isLockedHours,
      lockedSlots: lockedSlots,
      availability: availability
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("students")
          .update(payload)
          .eq("id", editingId)
          .eq("school_id", schoolId)
          .select();
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("students")
          .insert(payload)
          .select();
        
        if (error) throw error;
      }
      
      await loadData(schoolId);
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const deleteStudent = async (id: string) => {
    if(!confirm("Οριστική διαγραφή;") || !schoolId) return;
    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id)
        .eq("school_id", schoolId);
        
      if (error) throw error;
      await loadData(schoolId);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFirstName(""); setLastName(""); setGrade(""); setPhone("");
    setParentName(""); setParentPhone(""); setParentEmail("");
    setFormEnrollments([]); setIsLockedHours(false); setLockedSlots([]); setAvailability([]);
  };

  const startEdit = (s: Student) => {
    setEditingId(s.id);
    setFirstName(s.first_name); setLastName(s.last_name);
    setGrade(s.school_grade); setPhone(s.phone);
    setParentName(s.parent_name); setParentPhone(s.parent_phone);
    setParentEmail(s.email); setFormEnrollments(s.enrollments || []);
    setIsLockedHours(s.isLockedHours || false);
    setLockedSlots(s.lockedSlots || []); setAvailability(s.availability || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <WorkspaceShell title="Διαχείριση Μαθητών" description="Supabase Powered ERP">
       {/* Το UI σου παραμένει εδώ... */}
    </WorkspaceShell>
  );
}