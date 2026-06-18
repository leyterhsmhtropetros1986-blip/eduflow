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
  sectionId: string;           // → ClassUnit.id (robust linking)
  teacherId?: string;
  pickSection?: boolean;
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
  preferredClasses?: string[];  // Legacy: class-level preferences
  preferredSections?: Array<{   // New: subject-specific preferences
    className: string;
    subject: string;
  }>;
  acceptsSummer?: boolean;
  availability: Slot[];
};

export type ClassUnit = {
  id: string;
  name: string;                 // π.χ. "Γα1" (group code)
  grade: string;                // "Γ Λυκείου"
  subject: string;              // π.χ. "Φυσική" - REQUIRED for subject-specific groups
  maxStudents?: number;         // Capacity for THIS specific section
  category?: string;            // Legacy field
  enrolledStudents?: string[];  // Student IDs enrolled in THIS section (subject-specific)
  teacher?: string;             // Teacher assigned to THIS section
};

// Global configuration for group capacity
export type GroupCapacityConfig = {
  grade: string;                // "Γ Λυκείου"
  defaultMaxStudents: number;   // Default capacity per group (e.g., 6)
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

// =====================================================
// GROUP CREATION & STUDENT PLACEMENT (DETERMINISTIC)
// =====================================================

/**
 * Get default capacity for a grade
 * Returns configured capacity or default of 6
 */
export function getDefaultCapacity(grade: string): number {
  // TODO: Load from configuration
  // For now, return default of 6
  return 6;
}

/**
 * Create sections for a subject deterministically
 * Fills G1, then G2, then G3, etc.
 * 
 * @param subject - Subject name (e.g., "Φυσική")
 * @param grade - Grade (e.g., "Γ Λυκείου")
 * @param studentIds - Array of student IDs wanting this subject
 * @param capacity - Max students per section
 * @returns Array of created sections
 */
export function createSectionsForSubject(
  subject: string,
  grade: string,
  studentIds: string[],
  capacity: number = 6
): ClassUnit[] {
  if (studentIds.length === 0) return [];
  
  const sections: ClassUnit[] = [];
  const gradePrefix = grade.split(" ")[0].charAt(0); // "Γ" from "Γ Λυκείου"
  
  // Sort students alphabetically for deterministic placement
  const sortedStudents = [...studentIds].sort();
  
  let groupIndex = 1;
  for (let i = 0; i < sortedStudents.length; i += capacity) {
    const groupStudents = sortedStudents.slice(i, i + capacity);
    const groupCode = `${gradePrefix}${groupIndex}`;
    
    sections.push({
      id: generateId("sec"),
      name: groupCode,
      grade: grade,
      subject: subject,
      maxStudents: capacity,
      enrolledStudents: groupStudents,
    });
    
    groupIndex++;
  }
  
  return sections;
}

/**
 * Place student in least-filled section for a subject
 * Deterministic: always fills G1 first, then G2, etc.
 * 
 * @param studentId - Student ID to place
 * @param subject - Subject name
 * @param grade - Grade
 * @param sections - Existing sections for this subject
 * @param capacity - Max capacity per section
 * @returns Section ID where student was placed
 */
export function placeStudentInSection(
  studentId: string,
  subject: string,
  grade: string,
  sections: ClassUnit[],
  capacity: number = 6
): string {
  // Find sections for this subject and grade
  const subjectSections = sections
    .filter(s => s.subject === subject && s.grade === grade)
    .sort((a, b) => a.name.localeCompare(b.name)); // G1, G2, G3...
  
  // Find first non-full section
  for (const section of subjectSections) {
    const enrolled = section.enrolledStudents || [];
    if (enrolled.length < capacity) {
      // Add student to this section
      if (!section.enrolledStudents) section.enrolledStudents = [];
      section.enrolledStudents.push(studentId);
      return section.id;
    }
  }
  
  // All sections full, create new one
  const gradePrefix = grade.split(" ")[0].charAt(0);
  const nextGroupIndex = subjectSections.length + 1;
  const newSection: ClassUnit = {
    id: generateId("sec"),
    name: `${gradePrefix}${nextGroupIndex}`,
    grade: grade,
    subject: subject,
    maxStudents: capacity,
    enrolledStudents: [studentId],
  };
  
  sections.push(newSection);
  return newSection.id;
}

/**
 * Get students enrolled in a specific section
 */
export function getStudentsInSection(
  sectionId: string,
  sections: ClassUnit[]
): string[] {
  const section = sections.find(s => s.id === sectionId);
  return section?.enrolledStudents || [];
}

/**
 * Check if a section is full
 */
export function isSectionFull(
  sectionId: string,
  sections: ClassUnit[]
): boolean {
  const section = sections.find(s => s.id === sectionId);
  if (!section) return true;
  
  const enrolled = section.enrolledStudents || [];
  const capacity = section.maxStudents || 6;
  return enrolled.length >= capacity;
}

// =====================================================
// OPTIMIZATION ENGINE - STUDENT-CENTRIC SCORING
// =====================================================

export type Session = {
  id: string;
  groupName: string;
  subject: string;
  teacher: string;
  room?: string;
  day: string;
  time: string;
  students?: string[];
};

export type ScheduleScore = {
  totalScore: number;
  gapPenalty: number;
  attendancePenalty: number;
  compactnessPenalty: number;
  teacherPenalty: number;
  roomPenalty: number;
  studentGapCount: number;
  attendanceDaysPerStudent: Record<string, number>;
  teacherPreferenceViolations: number;
  roomViolations: number;
};

export type OptimizationReport = {
  initialScore: number;
  finalScore: number;
  improvementPercent: number;
  gapsRemoved: number;
  attendanceDaysReduced: number;
  teacherImprovements: number;
  roomImprovements: number;
  iterations: number;
  executionTimeMs: number;
};

/**
 * Parse time string to start and end hours
 */
function parseTime(time: string): { start: number; end: number } {
  const [startStr, endStr] = time.split('-');
  const start = parseInt(startStr.split(':')[0]);
  const end = endStr ? parseInt(endStr.split(':')[0]) : start + 1;
  return { start, end };
}

/**
 * Calculate gap penalty for a single student (WEIGHT: 10000)
 */
function calculateStudentGapPenalty(studentId: string, schedule: Session[]): number {
  const studentSessions = schedule.filter(s => s.students?.includes(studentId));
  
  // Group by day
  const byDay: Record<string, number[]> = {};
  studentSessions.forEach(s => {
    const { start } = parseTime(s.time);
    if (!byDay[s.day]) byDay[s.day] = [];
    byDay[s.day].push(start);
  });
  
  let totalPenalty = 0;
  
  // Calculate gaps per day
  for (const hours of Object.values(byDay)) {
    const sorted = [...new Set(hours)].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1] - sorted[i] - 1;
      if (gap > 0) {
        totalPenalty += gap * gap * 10000;  // Squared gap penalty
      }
    }
  }
  
  return totalPenalty;
}

/**
 * Calculate attendance day penalty for a single student (WEIGHT: 5000)
 */
function calculateStudentAttendancePenalty(studentId: string, schedule: Session[]): number {
  const studentSessions = schedule.filter(s => s.students?.includes(studentId));
  
  if (studentSessions.length === 0) return 0;
  
  // Calculate total hours
  const totalHours = studentSessions.reduce((sum, s) => {
    const { start, end } = parseTime(s.time);
    return sum + (end - start);
  }, 0);
  
  // Ideal days (4 hours per day)
  const idealDays = Math.ceil(totalHours / 4);
  
  // Actual days
  const actualDays = new Set(studentSessions.map(s => s.day)).size;
  
  let penalty = 0;
  
  // Penalty for too many days
  if (actualDays > idealDays) {
    penalty += (actualDays - idealDays) * 5000;
  }
  
  // Additional penalty for single-hour days
  const byDay: Record<string, number> = {};
  studentSessions.forEach(s => {
    const { start, end } = parseTime(s.time);
    byDay[s.day] = (byDay[s.day] || 0) + (end - start);
  });
  
  for (const hours of Object.values(byDay)) {
    if (hours === 1) {
      penalty += 2000;  // Avoid isolated 1-hour days
    }
  }
  
  return penalty;
}

/**
 * Calculate compactness penalty for a single student (WEIGHT: 3000)
 */
function calculateStudentCompactnessPenalty(studentId: string, schedule: Session[]): number {
  const studentSessions = schedule.filter(s => s.students?.includes(studentId));
  
  // Group by day
  const byDay: Record<string, number[]> = {};
  studentSessions.forEach(s => {
    const { start, end } = parseTime(s.time);
    if (!byDay[s.day]) byDay[s.day] = [];
    for (let h = start; h < end; h++) {
      byDay[s.day].push(h);
    }
  });
  
  let totalPenalty = 0;
  
  // Calculate fragmentation per day
  for (const hours of Object.values(byDay)) {
    const sorted = [...new Set(hours)].sort((a, b) => a - b);
    if (sorted.length < 2) continue;
    
    const span = sorted[sorted.length - 1] - sorted[0] + 1;
    const actual = sorted.length;
    const fragmentation = span - actual;
    
    totalPenalty += fragmentation * 3000;
  }
  
  return totalPenalty;
}

/**
 * Calculate global schedule score (student-centric)
 */
export function calculateScheduleScore(
  schedule: Session[],
  students: Student[],
  teachers: Teacher[]
): ScheduleScore {
  let gapPenalty = 0;
  let attendancePenalty = 0;
  let compactnessPenalty = 0;
  let studentGapCount = 0;
  const attendanceDaysPerStudent: Record<string, number> = {};
  
  // Calculate student-centric penalties
  students.forEach(student => {
    const studentSessions = schedule.filter(s => s.students?.includes(student.id));
    if (studentSessions.length === 0) return;
    
    // Gap penalty
    const gaps = calculateStudentGapPenalty(student.id, schedule);
    gapPenalty += gaps;
    if (gaps > 0) studentGapCount++;
    
    // Attendance penalty
    attendancePenalty += calculateStudentAttendancePenalty(student.id, schedule);
    
    // Compactness penalty
    compactnessPenalty += calculateStudentCompactnessPenalty(student.id, schedule);
    
    // Track attendance days
    const days = new Set(studentSessions.map(s => s.day)).size;
    attendanceDaysPerStudent[student.id] = days;
  });
  
  // Teacher preference penalty (WEIGHT: 500)
  let teacherPenalty = 0;
  let teacherPreferenceViolations = 0;
  
  schedule.forEach(session => {
    const teacher = teachers.find(t => 
      `${t.lastName} ${t.firstName}` === session.teacher
    );
    
    if (teacher?.preferredSections) {
      const hasPreference = teacher.preferredSections.some(ps => 
        ps.className === session.groupName && ps.subject === session.subject
      );
      
      if (!hasPreference) {
        teacherPenalty += 500;
        teacherPreferenceViolations++;
      }
    }
  });
  
  // Room penalty (WEIGHT: 100) - placeholder
  const roomPenalty = 0;
  const roomViolations = 0;
  
  const totalScore = 
    gapPenalty + 
    attendancePenalty + 
    compactnessPenalty + 
    teacherPenalty + 
    roomPenalty;
  
  return {
    totalScore,
    gapPenalty,
    attendancePenalty,
    compactnessPenalty,
    teacherPenalty,
    roomPenalty,
    studentGapCount,
    attendanceDaysPerStudent,
    teacherPreferenceViolations,
    roomViolations,
  };
}

/**
 * Check if schedule violates hard constraints
 */
export function hasHardConstraintViolations(schedule: Session[]): boolean {
  // Check student overlaps
  const studentSlots = new Map<string, Set<string>>();
  
  for (const session of schedule) {
    const { start, end } = parseTime(session.time);
    
    for (const studentId of session.students || []) {
      if (!studentSlots.has(studentId)) {
        studentSlots.set(studentId, new Set());
      }
      
      const slots = studentSlots.get(studentId)!;
      
      for (let h = start; h < end; h++) {
        const slotKey = `${session.day}_${h}`;
        if (slots.has(slotKey)) {
          return true;  // Student overlap detected
        }
        slots.add(slotKey);
      }
    }
  }
  
  // Check teacher overlaps
  const teacherSlots = new Map<string, Set<string>>();
  
  for (const session of schedule) {
    const { start, end } = parseTime(session.time);
    
    if (!teacherSlots.has(session.teacher)) {
      teacherSlots.set(session.teacher, new Set());
    }
    
    const slots = teacherSlots.get(session.teacher)!;
    
    for (let h = start; h < end; h++) {
      const slotKey = `${session.day}_${h}`;
      if (slots.has(slotKey)) {
        return true;  // Teacher overlap detected
      }
      slots.add(slotKey);
    }
  }
  
  // Check room overlaps
  const roomSlots = new Map<string, Set<string>>();
  
  for (const session of schedule) {
    if (!session.room) continue;
    
    const { start, end } = parseTime(session.time);
    
    if (!roomSlots.has(session.room)) {
      roomSlots.set(session.room, new Set());
    }
    
    const slots = roomSlots.get(session.room)!;
    
    for (let h = start; h < end; h++) {
      const slotKey = `${session.day}_${h}`;
      if (slots.has(slotKey)) {
        return true;  // Room overlap detected
      }
      slots.add(slotKey);
    }
  }
  
  return false;  // No violations
}

/**
 * Try to move a session to an adjacent hour to eliminate gaps
 */
export function tryMoveSessionToAdjacentHour(
  schedule: Session[],
  sessionId: string,
  direction: 'earlier' | 'later'
): Session[] | null {
  const sessionIndex = schedule.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return null;
  
  const session = schedule[sessionIndex];
  const { start, end } = parseTime(session.time);
  
  const newStart = direction === 'earlier' ? start - 1 : start + 1;
  const newEnd = direction === 'earlier' ? end - 1 : end + 1;
  
  if (newStart < 9 || newEnd > 23) return null;  // Out of bounds
  
  const newTime = `${String(newStart).padStart(2, '0')}:00-${String(newEnd).padStart(2, '0')}:00`;
  
  const newSchedule = [...schedule];
  newSchedule[sessionIndex] = {
    ...session,
    time: newTime,
  };
  
  // Check if move is valid
  if (hasHardConstraintViolations(newSchedule)) {
    return null;
  }
  
  return newSchedule;
}

/**
 * Try to move a session to any valid hour on the same day
 */
export function tryMoveSessionToAnyHour(
  schedule: Session[],
  sessionId: string,
  newHour: number
): Session[] | null {
  const sessionIndex = schedule.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return null;
  
  const session = schedule[sessionIndex];
  const { start, end } = parseTime(session.time);
  const duration = end - start;
  
  if (newHour < 9 || newHour + duration > 23) return null;
  
  const newTime = `${String(newHour).padStart(2, '0')}:00-${String(newHour + duration).padStart(2, '0')}:00`;
  
  const newSchedule = [...schedule];
  newSchedule[sessionIndex] = { ...session, time: newTime };
  
  if (hasHardConstraintViolations(newSchedule)) return null;
  
  return newSchedule;
}

/**
 * Try to move a session to another day
 */
export function tryMoveSessionToDay(
  schedule: Session[],
  sessionId: string,
  newDay: string
): Session[] | null {
  const sessionIndex = schedule.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return null;
  
  const session = schedule[sessionIndex];
  
  const newSchedule = [...schedule];
  newSchedule[sessionIndex] = { ...session, day: newDay };
  
  if (hasHardConstraintViolations(newSchedule)) return null;
  
  return newSchedule;
}

/**
 * Try to swap two sessions
 */
export function trySwapSessions(
  schedule: Session[],
  sessionId1: string,
  sessionId2: string
): Session[] | null {
  const idx1 = schedule.findIndex(s => s.id === sessionId1);
  const idx2 = schedule.findIndex(s => s.id === sessionId2);
  
  if (idx1 === -1 || idx2 === -1) return null;
  
  const session1 = schedule[idx1];
  const session2 = schedule[idx2];
  
  const newSchedule = [...schedule];
  newSchedule[idx1] = { ...session1, day: session2.day, time: session2.time };
  newSchedule[idx2] = { ...session2, day: session1.day, time: session1.time };
  
  if (hasHardConstraintViolations(newSchedule)) return null;
  
  return newSchedule;
}

/**
 * Perform local search optimization on a schedule
 */
function localSearchOptimization(
  initialSchedule: Session[],
  students: Student[],
  teachers: Teacher[],
  maxIterations: number = 50
): { schedule: Session[]; iterations: number } {
  let currentSchedule = [...initialSchedule];
  let currentScore = calculateScheduleScore(currentSchedule, students, teachers);
  
  let bestSchedule = currentSchedule;
  let bestScore = currentScore;
  
  let iterations = 0;
  let improved = true;
  
  const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
  const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  
  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;
    
    // Try different move types
    for (const session of currentSchedule) {
      // Move 1: Adjacent hour moves
      for (const direction of ['earlier', 'later'] as const) {
        const newSchedule = tryMoveSessionToAdjacentHour(currentSchedule, session.id, direction);
        if (newSchedule) {
          const newScore = calculateScheduleScore(newSchedule, students, teachers);
          if (newScore.totalScore < bestScore.totalScore) {
            bestSchedule = newSchedule;
            bestScore = newScore;
            currentSchedule = newSchedule;
            improved = true;
            break;
          }
        }
      }
      
      if (improved) break;
      
      // Move 2: Try moving to any valid hour (sample a few)
      for (let i = 0; i < 3; i++) {
        const randomHour = HOURS[Math.floor(Math.random() * HOURS.length)];
        const newSchedule = tryMoveSessionToAnyHour(currentSchedule, session.id, randomHour);
        if (newSchedule) {
          const newScore = calculateScheduleScore(newSchedule, students, teachers);
          if (newScore.totalScore < bestScore.totalScore) {
            bestSchedule = newSchedule;
            bestScore = newScore;
            currentSchedule = newSchedule;
            improved = true;
            break;
          }
        }
      }
      
      if (improved) break;
      
      // Move 3: Try moving to another day
      for (const newDay of DAYS) {
        if (newDay === session.day) continue;
        const newSchedule = tryMoveSessionToDay(currentSchedule, session.id, newDay);
        if (newSchedule) {
          const newScore = calculateScheduleScore(newSchedule, students, teachers);
          if (newScore.totalScore < bestScore.totalScore) {
            bestSchedule = newSchedule;
            bestScore = newScore;
            currentSchedule = newSchedule;
            improved = true;
            break;
          }
        }
      }
      
      if (improved) break;
    }
    
    // Move 4: Try swapping random pairs of sessions
    if (!improved && currentSchedule.length > 1) {
      for (let i = 0; i < Math.min(5, currentSchedule.length); i++) {
        const idx1 = Math.floor(Math.random() * currentSchedule.length);
        const idx2 = Math.floor(Math.random() * currentSchedule.length);
        if (idx1 === idx2) continue;
        
        const newSchedule = trySwapSessions(
          currentSchedule,
          currentSchedule[idx1].id,
          currentSchedule[idx2].id
        );
        
        if (newSchedule) {
          const newScore = calculateScheduleScore(newSchedule, students, teachers);
          if (newScore.totalScore < bestScore.totalScore) {
            bestSchedule = newSchedule;
            bestScore = newScore;
            currentSchedule = newSchedule;
            improved = true;
            break;
          }
        }
      }
    }
  }
  
  return { schedule: bestSchedule, iterations };
}

/**
 * Shuffle schedule sessions randomly (for random restarts)
 */
function shuffleSchedule(schedule: Session[]): Session[] {
  const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"];
  const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  
  const shuffled = schedule.map(session => {
    const { start, end } = parseTime(session.time);
    const duration = end - start;
    
    // Try random day and hour
    for (let attempts = 0; attempts < 20; attempts++) {
      const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];
      const randomHour = HOURS[Math.floor(Math.random() * (HOURS.length - duration))];
      const newTime = `${String(randomHour).padStart(2, '0')}:00-${String(randomHour + duration).padStart(2, '0')}:00`;
      
      const testSchedule = schedule.map(s => 
        s.id === session.id ? { ...s, day: randomDay, time: newTime } : s
      );
      
      if (!hasHardConstraintViolations(testSchedule)) {
        return { ...session, day: randomDay, time: newTime };
      }
    }
    
    // If can't find valid random position, keep original
    return session;
  });
  
  return shuffled;
}

/**
 * Optimize schedule using multi-start local search
 * Runs multiple optimization attempts from different starting points
 */
export function optimizeSchedule(
  initialSchedule: Session[],
  students: Student[],
  teachers: Teacher[],
  options: {
    maxIterationsPerRun?: number;
    numRestarts?: number;
  } = {}
): { schedule: Session[]; report: OptimizationReport } {
  const startTime = Date.now();
  
  const maxIterationsPerRun = options.maxIterationsPerRun || 50;
  const numRestarts = options.numRestarts || 3;
  
  // Calculate initial score
  const initialScore = calculateScheduleScore(initialSchedule, students, teachers);
  const initialScoreValue = initialScore.totalScore;
  const initialGaps = initialScore.studentGapCount;
  const initialDays = Object.values(initialScore.attendanceDaysPerStudent).reduce((a, b) => a + b, 0);
  
  let globalBestSchedule = initialSchedule;
  let globalBestScore = initialScore;
  let totalIterations = 0;
  
  // Run 1: Optimize from initial schedule
  const run1 = localSearchOptimization(initialSchedule, students, teachers, maxIterationsPerRun);
  const run1Score = calculateScheduleScore(run1.schedule, students, teachers);
  totalIterations += run1.iterations;
  
  if (run1Score.totalScore < globalBestScore.totalScore) {
    globalBestSchedule = run1.schedule;
    globalBestScore = run1Score;
  }
  
  // Additional runs: Random restarts
  for (let restart = 0; restart < numRestarts - 1; restart++) {
    // Create randomized starting point
    const shuffled = shuffleSchedule(globalBestSchedule);
    
    // Optimize from this starting point
    const runResult = localSearchOptimization(shuffled, students, teachers, maxIterationsPerRun);
    const runScore = calculateScheduleScore(runResult.schedule, students, teachers);
    totalIterations += runResult.iterations;
    
    // Keep if better
    if (runScore.totalScore < globalBestScore.totalScore) {
      globalBestSchedule = runResult.schedule;
      globalBestScore = runScore;
    }
  }
  
  const finalGaps = globalBestScore.studentGapCount;
  const finalDays = Object.values(globalBestScore.attendanceDaysPerStudent).reduce((a, b) => a + b, 0);
  
  const executionTimeMs = Date.now() - startTime;
  
  const report: OptimizationReport = {
    initialScore: initialScoreValue,
    finalScore: globalBestScore.totalScore,
    improvementPercent: initialScoreValue > 0 
      ? ((initialScoreValue - globalBestScore.totalScore) / initialScoreValue) * 100 
      : 0,
    gapsRemoved: initialGaps - finalGaps,
    attendanceDaysReduced: initialDays - finalDays,
    teacherImprovements: 0,
    roomImprovements: 0,
    iterations: totalIterations,
    executionTimeMs,
  };
  
  return { schedule: globalBestSchedule, report };
}
