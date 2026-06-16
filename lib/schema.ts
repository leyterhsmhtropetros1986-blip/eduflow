// lib/schema.ts
// =====================================================
// EduFlow — Κεντρικό Schema & Migration
// =====================================================
// Αυτό το αρχείο είναι το ΜΟΝΟ μέρος που ορίζει τους τύπους
// μαθητών, καθηγητών, τμημάτων και εγγραφών. Όλες οι σελίδες
// πρέπει να imports από εδώ.

// =====================================================
// TYPES
// =====================================================

export type Slot = {
  day: string;    // "Δευτέρα", "Τρίτη", ...
  start: string;  // "16:00"
  end: string;    // "20:00"
};

export type Enrollment = {
  id: string;          // ⭐ unique id (auto-generated)
  lessonName: string;  // π.χ. "Φυσική Γ' Λυκείου"
  className: string;   // π.χ. "Γ1"
  sectionId?: string;  // → ClassUnit.id (για robust linking — όχι breaking change)
  teacherId?: string;  // → Teacher.id (optional)
};

export type Student = {
  id: string;
  studentCode?: string;       // ⭐ ΝΕΟ: human-readable "S001"
  firstName: string;
  lastName: string;
  parentFirstName: string;
  parentLastName: string;
  parentName?: string;
  parentPhone: string;
  parentEmail?: string;
  studentPhone?: string;
  grade: string;
  enrollments?: Enrollment[];
  notes?: string;
  attendsSummer?: boolean;
  availability: Slot[];
};

export type Teacher = {
  id: string;
  teacherCode?: string;       // ⭐ ΝΕΟ: human-readable "T001"
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  subjects: string[];          // multi-subject
  subject?: string;            // legacy fallback
  preferredClasses?: string[];
  acceptsSummer?: boolean;
  availability: Slot[];
};

export type ClassUnit = {
  id: string;
  name: string;        // π.χ. "Γ1"
  grade: string;       // "Γ Λυκείου"
  maxStudents?: number;
  category?: string;   // legacy fallback
};

export type Course = {
  id?: string;
  name: string;
  grade: string;
};

// =====================================================
// HELPERS: ID & CODE GENERATION
// =====================================================

export function generateId(prefix: string = "id"): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${ts}_${rand}`;
}

/** Δίνει τον επόμενο διαθέσιμο κωδικό μορφής "S001", "S002", ... */
export function nextCode(prefix: string, existing: string[]): string {
  const nums = existing
    .filter((c) => c && c.startsWith(prefix))
    .map((c) => parseInt(c.slice(prefix.length), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

// =====================================================
// LOCALSTORAGE KEYS
// =====================================================

export const STORAGE_KEYS = {
  students: "eduflow_students",
  teachers: "eduflow_teachers",
  classes: "eduflow_classes",
  courses: "eduflow_courses",
  lessons: "eduflow_lessons",
  rooms: "eduflow_rooms",
  schedule: "eduflow_schedule",
  parents: "eduflow_parents",
  notifications: "eduflow_notifications",
  branding: "eduflow_branding",
  navGroups: "eduflow_nav_groups",
  backupPreMigration: "eduflow_backup_pre_migration_v1",
  migrationDone: "eduflow_migration_v1_done",
} as const;

// =====================================================
// CAPACITY CHECKS — σωστοί ανά section_id
// =====================================================

export type SectionLoad = {
  current: number;
  max: number;
  percent: number;
  isFull: boolean;
};

/** Επιστρέφει πόσοι μαθητές είναι εγγεγραμμένοι σε ένα τμήμα ΓΙΑ συγκεκριμένο μάθημα */
export function countSectionStudents(
  className: string,
  lessonName: string,
  students: Student[]
): number {
  let count = 0;
  for (const s of students) {
    if (!s.enrollments) continue;
    const matches = s.enrollments.some(
      (e) => e.className === className && e.lessonName === lessonName
    );
    if (matches) count++;
  }
  return count;
}

/** Πληροφορίες χωρητικότητας για ένα τμήμα σε συγκεκριμένο μάθημα */
export function getSectionLoad(
  className: string,
  lessonName: string,
  students: Student[],
  maxStudents: number = 0
): SectionLoad {
  const current = countSectionStudents(className, lessonName, students);
  const max = maxStudents || 999;
  const percent = max > 0 ? Math.round((current / max) * 100) : 0;
  return {
    current,
    max,
    percent,
    isFull: maxStudents > 0 && current >= maxStudents,
  };
}

/** Όλα τα enrollments ενός μαθητή σε format για display */
export function studentEnrollmentSummary(s: Student): string {
  if (!s.enrollments || s.enrollments.length === 0) return "—";
  return s.enrollments
    .map((e) => `${e.lessonName}: ${e.className || "—"}`)
    .join(" · ");
}

// =====================================================
// MIGRATION — προσθέτει id όπου λείπει, χωρίς να σπάσει τίποτα
// =====================================================

export type MigrationResult = {
  ok: boolean;
  studentsUpdated: number;
  teachersUpdated: number;
  classesUpdated: number;
  enrollmentsUpdated: number;
  backupKey: string;
  message: string;
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, val: any): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch (e) {
    console.error(`Failed to write ${key}`, e);
    return false;
  }
}

/**
 * Migration που τρέχει ΜΟΝΟ μία φορά.
 * - Δημιουργεί backup πριν αλλάξει οτιδήποτε
 * - Προσθέτει id σε ό,τι λείπει
 * - Προσθέτει studentCode / teacherCode
 * - Δεν αλλάζει την παλιά λογική (lessonName, className διατηρούνται)
 */
export function runMigration(force: boolean = false): MigrationResult {
  if (typeof window === "undefined") {
    return {
      ok: false,
      studentsUpdated: 0,
      teachersUpdated: 0,
      classesUpdated: 0,
      enrollmentsUpdated: 0,
      backupKey: "",
      message: "Δεν είμαστε σε browser",
    };
  }

  if (!force && localStorage.getItem(STORAGE_KEYS.migrationDone) === "true") {
    return {
      ok: true,
      studentsUpdated: 0,
      teachersUpdated: 0,
      classesUpdated: 0,
      enrollmentsUpdated: 0,
      backupKey: "",
      message: "Migration έχει ήδη γίνει",
    };
  }

  // === STEP 1: Backup ===
  const backup = {
    students: safeRead(STORAGE_KEYS.students, [] as any[]),
    teachers: safeRead(STORAGE_KEYS.teachers, [] as any[]),
    classes: safeRead(STORAGE_KEYS.classes, [] as any[]),
    timestamp: new Date().toISOString(),
  };
  safeWrite(STORAGE_KEYS.backupPreMigration, backup);

  // === STEP 2: Migrate Students ===
  const students: any[] = safeRead(STORAGE_KEYS.students, []);
  const existingStudentCodes = students.map((s) => s.studentCode).filter(Boolean);
  let studentsUpdated = 0;
  let enrollmentsUpdated = 0;

  students.forEach((s) => {
    let touched = false;
    if (!s.id) {
      s.id = generateId("stu");
      touched = true;
    }
    if (!s.studentCode) {
      s.studentCode = nextCode("S", existingStudentCodes);
      existingStudentCodes.push(s.studentCode);
      touched = true;
    }
    if (Array.isArray(s.enrollments)) {
      s.enrollments.forEach((e: any) => {
        if (!e.id) {
          e.id = generateId("enr");
          enrollmentsUpdated++;
        }
      });
    }
    if (touched) studentsUpdated++;
  });
  safeWrite(STORAGE_KEYS.students, students);

  // === STEP 3: Migrate Teachers ===
  const teachers: any[] = safeRead(STORAGE_KEYS.teachers, []);
  const existingTeacherCodes = teachers.map((t) => t.teacherCode).filter(Boolean);
  let teachersUpdated = 0;

  teachers.forEach((t) => {
    let touched = false;
    if (!t.id) {
      t.id = generateId("tea");
      touched = true;
    }
    if (!t.teacherCode) {
      t.teacherCode = nextCode("T", existingTeacherCodes);
      existingTeacherCodes.push(t.teacherCode);
      touched = true;
    }
    // Convert legacy 'subject' to 'subjects' array
    if (!Array.isArray(t.subjects)) {
      t.subjects = t.subject ? [t.subject] : [];
      touched = true;
    }
    if (touched) teachersUpdated++;
  });
  safeWrite(STORAGE_KEYS.teachers, teachers);

  // === STEP 4: Migrate Classes (ClassUnits / Sections) ===
  const classes: any[] = safeRead(STORAGE_KEYS.classes, []);
  let classesUpdated = 0;

  classes.forEach((c) => {
    let touched = false;
    if (!c.id) {
      c.id = generateId("sec");
      touched = true;
    }
    // Convert legacy 'category' to 'grade'
    if (!c.grade && c.category) {
      c.grade = c.category;
      touched = true;
    }
    if (touched) classesUpdated++;
  });
  safeWrite(STORAGE_KEYS.classes, classes);

  // === STEP 5: Mark as done ===
  localStorage.setItem(STORAGE_KEYS.migrationDone, "true");

  return {
    ok: true,
    studentsUpdated,
    teachersUpdated,
    classesUpdated,
    enrollmentsUpdated,
    backupKey: STORAGE_KEYS.backupPreMigration,
    message: `✅ Migration ολοκληρώθηκε: ${studentsUpdated} μαθητές, ${teachersUpdated} καθηγητές, ${classesUpdated} τμήματα, ${enrollmentsUpdated} εγγραφές`,
  };
}

/** Rollback από backup (μόνο αν τρελαθεί κάτι) */
export function rollbackMigration(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const backup = safeRead(STORAGE_KEYS.backupPreMigration, null as any);
    if (!backup) return false;
    safeWrite(STORAGE_KEYS.students, backup.students || []);
    safeWrite(STORAGE_KEYS.teachers, backup.teachers || []);
    safeWrite(STORAGE_KEYS.classes, backup.classes || []);
    localStorage.removeItem(STORAGE_KEYS.migrationDone);
    return true;
  } catch (e) {
    console.error("Rollback failed", e);
    return false;
  }
}

// =====================================================
// LOAD HELPERS — όλες οι σελίδες χρησιμοποιούν αυτά
// =====================================================

export function loadStudents(): Student[] {
  return safeRead(STORAGE_KEYS.students, []);
}

export function loadTeachers(): Teacher[] {
  return safeRead(STORAGE_KEYS.teachers, []);
}

export function loadClasses(): ClassUnit[] {
  return safeRead(STORAGE_KEYS.classes, []);
}

export function loadCourses(): Course[] {
  // Try eduflow_courses first, fallback to eduflow_lessons
  const c = safeRead(STORAGE_KEYS.courses, []);
  if (c.length > 0) return c;
  return safeRead(STORAGE_KEYS.lessons, []);
}

export function saveStudents(students: Student[]): boolean {
  return safeWrite(STORAGE_KEYS.students, students);
}

export function saveTeachers(teachers: Teacher[]): boolean {
  return safeWrite(STORAGE_KEYS.teachers, teachers);
}

export function saveClasses(classes: ClassUnit[]): boolean {
  return safeWrite(STORAGE_KEYS.classes, classes);
}