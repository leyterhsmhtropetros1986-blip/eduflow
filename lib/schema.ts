// lib/schema.ts
// =====================================================
// EduFlow — Κεντρικό Schema v2
// =====================================================
// v2: Τα τμήματα έχουν τώρα subject. Π.χ. "Γα1 - Φυσική" είναι
// διαφορετικό τμήμα από "Γα1 - Χημεία".
//
// Συμβατότητα: Παλιά τμήματα χωρίς subject θα έχουν subject="" και
// θα θεωρούνται "γενικά" (legacy). Το migration v2 τα μετατρέπει
// σε ένα τμήμα ανά μάθημα βάσει των ενεργών enrollments.

// =====================================================
// TYPES
// =====================================================

export type Slot = {
  day: string;
  start: string;
  end: string;
};

export type Enrollment = {
  id: string;
  lessonName: string;          // π.χ. "Φυσική Γ' Λυκείου"
  className: string;            // π.χ. "Γα1"
  sectionId?: string;           // → ClassUnit.id (robust linking)
  teacherId?: string;
};

export type Student = {
  id: string;
  studentCode?: string;         // "S001"
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
  teacherCode?: string;         // "T001"
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  subjects: string[];
  subject?: string;
  preferredClasses?: string[];
  acceptsSummer?: boolean;
  availability: Slot[];
};

export type ClassUnit = {
  id: string;
  name: string;                 // π.χ. "Γα1"
  grade: string;                // "Γ Λυκείου"
  subject: string;              // ⭐ ΝΕΟ: π.χ. "Φυσική" (κενό = legacy)
  maxStudents?: number;
  category?: string;
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

export function nextCode(prefix: string, existing: string[]): string {
  const nums = existing
    .filter((c) => c && c.startsWith(prefix))
    .map((c) => parseInt(c.slice(prefix.length), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

/** Μοναδικό κλειδί τμήματος: (όνομα, μάθημα) */
export function sectionKey(className: string, lessonName: string): string {
  return `${className || ""}__${lessonName || ""}`;
}

/** Display label τμήματος: "Γα1 - Φυσική" */
export function sectionLabel(section: { name: string; subject?: string }): string {
  if (!section.subject) return section.name;
  return `${section.name} - ${section.subject}`;
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
  backupPreMigrationV2: "eduflow_backup_pre_migration_v2",
  migrationDone: "eduflow_migration_v1_done",
  migrationV2Done: "eduflow_migration_v2_done",
} as const;

// =====================================================
// CAPACITY CHECKS — σωστοί ανά (section + lesson)
// =====================================================

export type SectionLoad = {
  current: number;
  max: number;
  percent: number;
  isFull: boolean;
  isOverloaded: boolean;
};

/** Πόσοι μαθητές είναι εγγεγραμμένοι σε ένα τμήμα ΓΙΑ συγκεκριμένο μάθημα */
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

/** Πληροφορίες χωρητικότητας */
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
    isOverloaded: maxStudents > 0 && current > maxStudents,
  };
}

/** Έλεγχος αν μαθητής έχει ήδη εγγραφεί στο ίδιο μάθημα */
export function hasDuplicateEnrollment(
  enrollments: Enrollment[] | undefined,
  lessonName: string,
  excludeId?: string
): boolean {
  if (!enrollments) return false;
  return enrollments.some(
    (e) => e.lessonName === lessonName && e.id !== excludeId
  );
}

// =====================================================
// LOAD HELPERS
// =====================================================

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
  const c = safeRead<any[]>(STORAGE_KEYS.courses, []);
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

// =====================================================
// MIGRATION v1 — IDs (όπως πριν)
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

export function runMigration(force: boolean = false): MigrationResult {
  if (typeof window === "undefined") {
    return {
      ok: false, studentsUpdated: 0, teachersUpdated: 0, classesUpdated: 0,
      enrollmentsUpdated: 0, backupKey: "", message: "SSR — no migration",
    };
  }

  if (!force && localStorage.getItem(STORAGE_KEYS.migrationDone) === "true") {
    return {
      ok: true, studentsUpdated: 0, teachersUpdated: 0, classesUpdated: 0,
      enrollmentsUpdated: 0, backupKey: "", message: "Migration v1 done",
    };
  }

  // Backup
  const backup = {
    students: safeRead(STORAGE_KEYS.students, []),
    teachers: safeRead(STORAGE_KEYS.teachers, []),
    classes: safeRead(STORAGE_KEYS.classes, []),
    timestamp: new Date().toISOString(),
  };
  safeWrite(STORAGE_KEYS.backupPreMigration, backup);

  // Students
  const students: any[] = safeRead(STORAGE_KEYS.students, []);
  const existingStudentCodes = students.map((s) => s.studentCode).filter(Boolean);
  let studentsUpdated = 0, enrollmentsUpdated = 0;
  students.forEach((s) => {
    let touched = false;
    if (!s.id) { s.id = generateId("stu"); touched = true; }
    if (!s.studentCode) {
      s.studentCode = nextCode("S", existingStudentCodes);
      existingStudentCodes.push(s.studentCode);
      touched = true;
    }
    if (Array.isArray(s.enrollments)) {
      s.enrollments.forEach((e: any) => {
        if (!e.id) { e.id = generateId("enr"); enrollmentsUpdated++; }
      });
    }
    if (touched) studentsUpdated++;
  });
  safeWrite(STORAGE_KEYS.students, students);

  // Teachers
  const teachers: any[] = safeRead(STORAGE_KEYS.teachers, []);
  const existingTeacherCodes = teachers.map((t) => t.teacherCode).filter(Boolean);
  let teachersUpdated = 0;
  teachers.forEach((t) => {
    let touched = false;
    if (!t.id) { t.id = generateId("tea"); touched = true; }
    if (!t.teacherCode) {
      t.teacherCode = nextCode("T", existingTeacherCodes);
      existingTeacherCodes.push(t.teacherCode);
      touched = true;
    }
    if (!Array.isArray(t.subjects)) {
      t.subjects = t.subject ? [t.subject] : [];
      touched = true;
    }
    if (touched) teachersUpdated++;
  });
  safeWrite(STORAGE_KEYS.teachers, teachers);

  // Classes
  const classes: any[] = safeRead(STORAGE_KEYS.classes, []);
  let classesUpdated = 0;
  classes.forEach((c) => {
    let touched = false;
    if (!c.id) { c.id = generateId("sec"); touched = true; }
    if (!c.grade && c.category) { c.grade = c.category; touched = true; }
    if (touched) classesUpdated++;
  });
  safeWrite(STORAGE_KEYS.classes, classes);

  localStorage.setItem(STORAGE_KEYS.migrationDone, "true");

  return {
    ok: true, studentsUpdated, teachersUpdated, classesUpdated, enrollmentsUpdated,
    backupKey: STORAGE_KEYS.backupPreMigration,
    message: `✅ Migration v1: ${studentsUpdated} μαθητές, ${teachersUpdated} καθηγητές, ${classesUpdated} τμήματα, ${enrollmentsUpdated} εγγραφές`,
  };
}

// =====================================================
// MIGRATION v2 — Subject στα τμήματα
// =====================================================

export type MigrationV2Result = {
  ok: boolean;
  classesExpanded: number;
  sectionsTotal: number;
  message: string;
};

/**
 * Migration v2: Σπάει παλιά τμήματα χωρίς subject σε ένα τμήμα
 * ανά μάθημα που πραγματικά διδάσκεται.
 *
 * Παράδειγμα: Αν είχες ένα τμήμα "Γα1" χωρίς subject, και υπάρχουν
 * μαθητές με enrollments [Φυσική Γα1, Χημεία Γα1], θα δημιουργηθούν
 * 2 νέα τμήματα: "Γα1 + Φυσική" και "Γα1 + Χημεία".
 */
export function runMigrationV2(force: boolean = false): MigrationV2Result {
  if (typeof window === "undefined") {
    return { ok: false, classesExpanded: 0, sectionsTotal: 0, message: "SSR" };
  }

  if (!force && localStorage.getItem(STORAGE_KEYS.migrationV2Done) === "true") {
    return { ok: true, classesExpanded: 0, sectionsTotal: 0, message: "Migration v2 done" };
  }

  // Backup
  const backup = {
    classes: safeRead(STORAGE_KEYS.classes, []),
    students: safeRead(STORAGE_KEYS.students, []),
    timestamp: new Date().toISOString(),
  };
  safeWrite(STORAGE_KEYS.backupPreMigrationV2, backup);

  const classes: any[] = safeRead(STORAGE_KEYS.classes, []);
  const students: any[] = safeRead(STORAGE_KEYS.students, []);

  // Βρες ποια μαθήματα έχει το κάθε class name από τις enrollments
  const subjectsPerClassName: Record<string, Set<string>> = {};
  students.forEach((s) => {
    (s.enrollments || []).forEach((e: any) => {
      if (e.className && e.lessonName) {
        if (!subjectsPerClassName[e.className]) {
          subjectsPerClassName[e.className] = new Set();
        }
        subjectsPerClassName[e.className].add(e.lessonName);
      }
    });
  });

  let classesExpanded = 0;
  const newClasses: any[] = [];

  classes.forEach((c) => {
    // Αν έχει ήδη subject, το αφήνουμε ως έχει
    if (c.subject && c.subject !== "") {
      newClasses.push(c);
      return;
    }

    // Παλιό τμήμα χωρίς subject — δες τα ενεργά μαθήματα
    const subjects = subjectsPerClassName[c.name];
    if (!subjects || subjects.size === 0) {
      // Δεν έχει χρησιμοποιηθεί ακόμη — κράτα το με κενό subject (legacy)
      c.subject = c.subject || "";
      newClasses.push(c);
      return;
    }

    // Σπάσε σε ένα τμήμα ανά μάθημα
    const subjectsArr = Array.from(subjects);
    subjectsArr.forEach((subj, idx) => {
      if (idx === 0) {
        // Update υπάρχοντος (διατηρεί το id)
        c.subject = subj;
        newClasses.push(c);
      } else {
        // Νέο τμήμα με νέο id
        newClasses.push({
          id: generateId("sec"),
          name: c.name,
          grade: c.grade,
          subject: subj,
          maxStudents: c.maxStudents,
        });
      }
    });
    classesExpanded++;
  });

  safeWrite(STORAGE_KEYS.classes, newClasses);
  localStorage.setItem(STORAGE_KEYS.migrationV2Done, "true");

  return {
    ok: true,
    classesExpanded,
    sectionsTotal: newClasses.length,
    message: `✅ Migration v2: ${classesExpanded} τμήματα σπάστηκαν, σύνολο ${newClasses.length} τμήματα`,
  };
}

/** Rollback v2 */
export function rollbackMigrationV2(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const backup = safeRead(STORAGE_KEYS.backupPreMigrationV2, null as any);
    if (!backup) return false;
    safeWrite(STORAGE_KEYS.classes, backup.classes || []);
    localStorage.removeItem(STORAGE_KEYS.migrationV2Done);
    return true;
  } catch (e) {
    console.error("Rollback v2 failed", e);
    return false;
  }
}

// =====================================================
// SECTION HELPERS
// =====================================================

/** Φιλτράρει τμήματα ανά τάξη ή μάθημα */
export function filterSections(
  classes: ClassUnit[],
  filter: { grade?: string; subject?: string }
): ClassUnit[] {
  return classes.filter((c) => {
    if (filter.grade && c.grade !== filter.grade) return false;
    if (filter.subject && c.subject !== filter.subject) return false;
    return true;
  });
}

/** Όλες οι τάξεις (μοναδικές) από classes */
export function uniqueGrades(classes: ClassUnit[]): string[] {
  return Array.from(new Set(classes.map((c) => c.grade).filter(Boolean))).sort();
}

/** Όλα τα μαθήματα (μοναδικά) από classes */
export function uniqueSubjects(classes: ClassUnit[]): string[] {
  return Array.from(new Set(classes.map((c) => c.subject).filter(Boolean))).sort();
}