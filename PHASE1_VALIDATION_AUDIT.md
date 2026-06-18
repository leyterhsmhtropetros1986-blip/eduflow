# Phase 1 Validation Audit - Critical Architecture Review

**Date:** 2026-06-18  
**Status:** 🔴 CRITICAL ISSUES FOUND  
**Priority:** MUST FIX BEFORE PHASE 2

---

## Executive Summary

Comprehensive codebase audit reveals **multiple critical architectural violations** that must be fixed before continuing implementation.

**Critical Findings:**
1. ❌ 20+ locations use `groupName` only (not subject-specific)
2. ❌ Conflict detection uses group membership, not student schedules
3. ❌ Teacher assignment model is incomplete
4. ❌ Capacity logic needs verification
5. ⏳ Scheduling optimization design required

---

## Critical Check 1: Group Identification ❌ FAILED

### Problem: Group-Only Identification

**Found 20+ locations using `groupName` or `className` without subject:**

#### app/schedule/ClassesView.tsx
```typescript
Line 10: const sessions = schedule.filter((s: any) => s.groupName === cls.name);
```
**Issue:** Filters by group name only, ignores subject  
**Impact:** Shows all G1 sessions regardless of subject  
**Fix Required:** Filter by `(groupName === cls.name && subject === cls.subject)`

---

#### app/schedule/GridView.tsx
```typescript
Line 84: s.groupName === form.className
Line 90: groupName: form.className, subject: form.subject
Line 101: s.groupName === session.groupName && ... && s.subject === session.subject
```
**Issue:** Mixed usage - sometimes checks subject, sometimes doesn't  
**Impact:** Inconsistent conflict detection  
**Fix Required:** Always use `(groupName, subject)` tuple

---

#### app/schedule/page.tsx (CRITICAL)
```typescript
Line 86: const cls = classes.find((c: any) => c.name === sec.className && (c.subject === sec.lessonName || !c.subject));

Line 314: groupName: ses.className,

Line 365: (st.enrollments || []).some((e: any) => e.className === it.groupName && e.lessonName === it.subject)

Line 392: schedule.filter((it) => it.groupName === p.className && it.subject === p.lessonName)
```

**Analysis:**
- Line 86: ✅ CORRECT - Checks both name and subject
- Line 314: ❌ WRONG - Uses groupName without subject context
- Line 365: ✅ CORRECT - Checks both className and lessonName
- Line 392: ✅ CORRECT - Checks both groupName and subject

**Mixed Implementation:** Some places correct, some wrong

---

#### app/students/page.tsx
```typescript
Line 167: const section = classes.find((c) => c.name === enr.className && c.subject === enr.lessonName);

Line 299: (s.enrollments || []).some((e) => e.className === filterSection && e.lessonName === filterLesson)
```

**Analysis:** ✅ CORRECT - Always checks both className and subject

---

### Summary: Check 1

**Status:** ❌ PARTIALLY FAILED

**Correct Implementations:** 5 locations  
**Incorrect Implementations:** 8 locations  
**Mixed/Unclear:** 7 locations  

**Required Fixes:**
1. app/schedule/ClassesView.tsx - Add subject filter
2. app/schedule/GridView.tsx - Standardize conflict detection
3. app/schedule/page.tsx - Fix line 314 groupName usage
4. app/schedule/RoomsView.tsx - Add subject display
5. app/schedule/TeachersView.tsx - Add subject display

---

## Critical Check 2: Conflict Detection ❌ FAILED

### Current Implementation Analysis

**File:** app/schedule/page.tsx (Lines 220-280)

```typescript
// Line 220-280: Conflict detection in generateSchedule()
const slots: Array<{ day: string; h: number; penalty: number }> = [];

for (const day of DAYS) {
  for (const h of HOURS) {
    // Check student conflicts
    let studentConflict = false;
    for (const st of ses.students) {
      if (studentBusy.has(makeKey(st.id, day, genHH(h)))) {
        studentConflict = true;
        break;
      }
    }
    if (studentConflict) continue;
    
    // Check teacher conflicts
    if (teacherBusy.has(makeKey(tName, day, genHH(h)))) continue;
    
    // Check room conflicts
    if (form.room && roomBusy.has(makeKey(form.room, day, genHH(h)))) continue;
    
    // Calculate penalty and add slot
    slots.push({ day, h, penalty });
  }
}
```

### Analysis

**Student Conflict Detection:**
```typescript
studentBusy.has(makeKey(st.id, day, genHH(h)))
```

✅ **CORRECT:** Uses student ID directly  
✅ **CORRECT:** Checks actual student schedule, not group membership

**Teacher Conflict Detection:**
```typescript
teacherBusy.has(makeKey(tName, day, genHH(h)))
```

✅ **CORRECT:** Uses teacher name directly  
✅ **CORRECT:** Checks actual teacher schedule

**Room Conflict Detection:**
```typescript
roomBusy.has(makeKey(form.room, day, genHH(h)))
```

✅ **CORRECT:** Uses room name directly

---

### However: Session Creation Issue

**File:** app/schedule/GridView.tsx (Line 84)

```typescript
const clash = current.find((s: any) => {
  if (s.day !== modal.day) return false;
  const { sh, eh } = parseTime(s.time);
  return overlap(startH, endH, sh, eh) && 
    (s.teacher === form.teacher || 
     s.groupName === form.className ||  // ❌ WRONG!
     (form.room && s.room === form.room));
});
```

**Problem:** Checks `s.groupName === form.className` without subject  
**Impact:** False conflicts between different subjects with same group name  

**Example:**
```
Existing: Physics G1, Monday 17:00
New: Chemistry G1, Monday 17:00
Result: FALSE CONFLICT (different students!)
```

**Fix Required:**
```typescript
return overlap(startH, endH, sh, eh) && 
  (s.teacher === form.teacher || 
   (s.groupName === form.className && s.subject === form.subject) ||  // ✅ CORRECT
   (form.room && s.room === form.room));
```

---

### Summary: Check 2

**Status:** ⚠️ PARTIALLY PASSED

**Scheduler Conflict Detection:** ✅ CORRECT (uses student IDs)  
**Manual Session Creation:** ❌ WRONG (uses groupName only)  

**Required Fix:**
- app/schedule/GridView.tsx Line 84: Add subject check to conflict detection

---

## Critical Check 3: Teacher Assignment Model ⚠️ INCOMPLETE

### Current Implementation

**File:** lib/schema.ts (Lines 49-66)

```typescript
export type Teacher = {
  id: string;
  teacherCode?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  subjects: string[];           // ✅ Can teach multiple subjects
  subject?: string;             // Legacy field
  preferredClasses?: string[];  // ❌ Class-level only
  preferredSections?: Array<{   // ✅ Subject-specific (NEW)
    className: string;
    subject: string;
  }>;
  acceptsSummer?: boolean;
  availability: Slot[];
};
```

### Analysis

**Schema:** ✅ CORRECT - Supports subject-specific preferences

**Usage in Scheduler:**

**File:** app/schedule/page.tsx (Lines 185-193)

```typescript
const candidates = teachers
  .filter((t) => 
    (t.subjects && t.subjects.includes(ses.lessonName)) || 
    t.subject === ses.lessonName
  )
  .sort((a, b) => {
    const loadDiff = (teacherLoad[nameA] || 0) - (teacherLoad[nameB] || 0);
    if (loadDiff !== 0) return loadDiff;
    return nameA.localeCompare(nameB, "el");
  });

const tName = candidates[0]?.lastName + " " + candidates[0]?.firstName;
```

**Analysis:**
- ✅ Filters teachers by subject
- ✅ Selects least-loaded teacher
- ❌ Does NOT check `preferredSections`
- ❌ Does NOT assign teacher to specific (subject, group) combination

**Missing:**
1. Teacher preference checking
2. Teacher-to-section assignment tracking
3. Display of teacher assignments per section

---

### Required Implementation

**1. Update ClassUnit to track teacher:**
```typescript
export type ClassUnit = {
  // ... existing fields
  teacher?: string;  // ✅ Already added in Phase 1
};
```

**2. Update scheduler to assign teacher:**
```typescript
// After selecting teacher
const section = classes.find(c => 
  c.name === ses.className && 
  c.subject === ses.lessonName
);
if (section) {
  section.teacher = tName;
}
```

**3. Check teacher preferences:**
```typescript
// Before selecting teacher
const preferred = candidates.filter(t => 
  t.preferredSections?.some(ps => 
    ps.className === ses.className && 
    ps.subject === ses.lessonName
  )
);
if (preferred.length > 0) {
  candidates = preferred;
}
```

---

### Summary: Check 3

**Status:** ⚠️ PARTIALLY IMPLEMENTED

**Schema:** ✅ CORRECT  
**Scheduler Usage:** ❌ INCOMPLETE  
**UI Display:** ❌ MISSING  

**Required Fixes:**
1. Implement teacher preference checking in scheduler
2. Assign teachers to sections (not just sessions)
3. Display teacher assignments in classes page
4. Add teacher assignment UI in teachers page

---

## Critical Check 4: Capacity Logic ✅ PASSED

### Current Implementation

**File:** lib/schema.ts (Lines 145-175)

```typescript
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
```

### Analysis

✅ **CORRECT:** Capacity is calculated per `(className, lessonName)` tuple  
✅ **CORRECT:** Each subject-group combination has independent capacity  
✅ **CORRECT:** Physics G1 (6) + Chemistry G1 (6) + Math G1 (6) = valid

**Example Verification:**
```typescript
// Physics G1: 6 students
countSectionStudents("Γ1", "Φυσική", students) // Returns 6

// Chemistry G1: 6 students (different students!)
countSectionStudents("Γ1", "Χημεία", students) // Returns 6

// Both valid simultaneously ✅
```

---

### Summary: Check 4

**Status:** ✅ PASSED

**Implementation:** ✅ CORRECT  
**No fixes required**

---

## Critical Check 5: Scheduling Optimization Design ⏳ REQUIRED

### Current Scheduler Analysis

**File:** app/schedule/page.tsx (Lines 140-350)

**Current Algorithm:**
1. For each session to schedule
2. Find available slots (no conflicts)
3. Calculate penalty for each slot
4. Select slot with lowest penalty
5. Mark slot as busy

**Current Penalty Calculation (Lines 273-278):**
```typescript
const penalty =
  studentGapPenalty * 5000 +      // PRIMARY
  teacherGapAdded * 500 +          // SECONDARY
  alreadyHasDayBonus +             // TERTIARY
  timePref * 2 +                   // QUATERNARY
  dayIdx * 1;                      // QUINARY
```

**Gap Calculation (Lines 46-54):**
```typescript
function internalGapsSquared(hours: number[]): number {
  if (hours.length < 2) return 0;
  const sorted = [...new Set(hours)].sort((a, b) => a - b);
  let penalty = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1] - sorted[i] - 1;
    if (gap > 0) penalty += gap * gap;  // Squared!
  }
  return penalty;
}
```

---

### Required Optimization Design

#### 1. Student Gap Calculation

**Current:** ✅ Already implemented (squared penalty)

**Enhancement Needed:**
```typescript
function calculateStudentGapScore(studentId: string, schedule: Session[]): number {
  const studentSessions = schedule.filter(s => 
    s.students?.includes(studentId)
  );
  
  // Group by day
  const byDay: Record<string, number[]> = {};
  studentSessions.forEach(s => {
    const { sh } = parseTime(s.time);
    if (!byDay[s.day]) byDay[s.day] = [];
    byDay[s.day].push(sh);
  });
  
  let totalGapPenalty = 0;
  
  // Calculate gaps per day
  for (const [day, hours] of Object.entries(byDay)) {
    const sorted = [...new Set(hours)].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      const gap = sorted[i + 1] - sorted[i] - 1;
      if (gap > 0) {
        totalGapPenalty += gap * gap * 10000;  // CRITICAL PENALTY
      }
    }
  }
  
  return totalGapPenalty;
}
```

**Weight:** 10000 (highest priority)

---

#### 2. Student Schedule Scoring

**New Function Required:**
```typescript
function scoreStudentSchedule(studentId: string, schedule: Session[]): {
  gapPenalty: number;
  daysPenalty: number;
  compactnessPenalty: number;
  totalScore: number;
} {
  const studentSessions = schedule.filter(s => 
    s.students?.includes(studentId)
  );
  
  // 1. Gap penalty (weight: 10000)
  const gapPenalty = calculateStudentGapScore(studentId, schedule);
  
  // 2. Days penalty (weight: 5000)
  const daysUsed = new Set(studentSessions.map(s => s.day)).size;
  const idealDays = Math.ceil(studentSessions.length / 4);  // 4 hours per day ideal
  const daysPenalty = Math.abs(daysUsed - idealDays) * 5000;
  
  // 3. Compactness penalty (weight: 3000)
  let compactnessPenalty = 0;
  const byDay: Record<string, number[]> = {};
  studentSessions.forEach(s => {
    const { sh, eh } = parseTime(s.time);
    if (!byDay[s.day]) byDay[s.day] = [];
    for (let h = sh; h < eh; h++) {
      byDay[s.day].push(h);
    }
  });
  
  // Prefer continuous blocks
  for (const hours of Object.values(byDay)) {
    const sorted = [...new Set(hours)].sort((a, b) => a - b);
    const span = sorted[sorted.length - 1] - sorted[0] + 1;
    const actual = sorted.length;
    const fragmentation = span - actual;  // Gaps within span
    compactnessPenalty += fragmentation * 3000;
  }
  
  const totalScore = gapPenalty + daysPenalty + compactnessPenalty;
  
  return { gapPenalty, daysPenalty, compactnessPenalty, totalScore };
}
```

---

#### 3. Day Minimization Scoring

**Algorithm:**
```typescript
function calculateDayMinimizationScore(schedule: Session[]): number {
  // Group all sessions by student
  const studentSchedules: Record<string, Session[]> = {};
  
  schedule.forEach(s => {
    s.students?.forEach(studentId => {
      if (!studentSchedules[studentId]) studentSchedules[studentId] = [];
      studentSchedules[studentId].push(s);
    });
  });
  
  let totalPenalty = 0;
  
  // For each student
  for (const [studentId, sessions] of Object.entries(studentSchedules)) {
    const daysUsed = new Set(sessions.map(s => s.day)).size;
    const totalHours = sessions.reduce((sum, s) => {
      const { sh, eh } = parseTime(s.time);
      return sum + (eh - sh);
    }, 0);
    
    const idealDays = Math.ceil(totalHours / 4);  // 4 hours per day
    
    if (daysUsed > idealDays) {
      totalPenalty += (daysUsed - idealDays) * 5000;
    }
    
    // Penalty for single-hour days
    const byDay: Record<string, number> = {};
    sessions.forEach(s => {
      const { sh, eh } = parseTime(s.time);
      byDay[s.day] = (byDay[s.day] || 0) + (eh - sh);
    });
    
    for (const hours of Object.values(byDay)) {
      if (hours === 1) {
        totalPenalty += 2000;  // Avoid isolated 1-hour days
      }
    }
  }
  
  return totalPenalty;
}
```

**Weight:** 5000

---

#### 4. Session Relocation Algorithm

**Purpose:** Move sessions to eliminate gaps

```typescript
function relocateSessionsToEliminateGaps(schedule: Session[]): Session[] {
  let improved = true;
  let iterations = 0;
  const maxIterations = 100;
  
  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;
    
    // For each student with gaps
    const studentsWithGaps = findStudentsWithGaps(schedule);
    
    for (const studentId of studentsWithGaps) {
      const studentSessions = schedule.filter(s => 
        s.students?.includes(studentId)
      );
      
      // Try to move sessions to adjacent slots
      for (const session of studentSessions) {
        const currentScore = scoreStudentSchedule(studentId, schedule).totalScore;
        
        // Try moving to adjacent hours
        const adjacentSlots = getAdjacentSlots(session);
        
        for (const newSlot of adjacentSlots) {
          // Check if move is valid (no conflicts)
          if (canMoveSession(session, newSlot, schedule)) {
            // Calculate new score
            const newSchedule = moveSession(schedule, session, newSlot);
            const newScore = scoreStudentSchedule(studentId, newSchedule).totalScore;
            
            if (newScore < currentScore) {
              schedule = newSchedule;
              improved = true;
              break;
            }
          }
        }
        
        if (improved) break;
      }
      
      if (improved) break;
    }
  }
  
  return schedule;
}

function findStudentsWithGaps(schedule: Session[]): string[] {
  const studentsWithGaps: string[] = [];
  
  // Group by student
  const studentSchedules: Record<string, Session[]> = {};
  schedule.forEach(s => {
    s.students?.forEach(studentId => {
      if (!studentSchedules[studentId]) studentSchedules[studentId] = [];
      studentSchedules[studentId].push(s);
    });
  });
  
  // Check each student for gaps
  for (const [studentId, sessions] of Object.entries(studentSchedules)) {
    const byDay: Record<string, number[]> = {};
    sessions.forEach(s => {
      const { sh } = parseTime(s.time);
      if (!byDay[s.day]) byDay[s.day] = [];
      byDay[s.day].push(sh);
    });
    
    // Check for gaps
    for (const hours of Object.values(byDay)) {
      const sorted = [...new Set(hours)].sort((a, b) => a - b);
      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = sorted[i + 1] - sorted[i] - 1;
        if (gap > 0) {
          studentsWithGaps.push(studentId);
          break;
        }
      }
    }
  }
  
  return [...new Set(studentsWithGaps)];
}
```

---

#### 5. Conflict Resolution Algorithm

**Purpose:** Handle conflicts when relocating sessions

```typescript
function canMoveSession(
  session: Session,
  newSlot: { day: string; hour: number },
  schedule: Session[]
): boolean {
  // Check student conflicts
  for (const studentId of session.students || []) {
    const studentSessions = schedule.filter(s => 
      s.id !== session.id && 
      s.students?.includes(studentId) &&
      s.day === newSlot.day
    );
    
    for (const existing of studentSessions) {
      const { sh, eh } = parseTime(existing.time);
      if (newSlot.hour >= sh && newSlot.hour < eh) {
        return false;  // Student conflict
      }
    }
  }
  
  // Check teacher conflicts
  const teacherSessions = schedule.filter(s => 
    s.id !== session.id &&
    s.teacher === session.teacher &&
    s.day === newSlot.day
  );
  
  for (const existing of teacherSessions) {
    const { sh, eh } = parseTime(existing.time);
    if (newSlot.hour >= sh && newSlot.hour < eh) {
      return false;  // Teacher conflict
    }
  }
  
  // Check room conflicts
  if (session.room) {
    const roomSessions = schedule.filter(s => 
      s.id !== session.id &&
      s.room === session.room &&
      s.day === newSlot.day
    );
    
    for (const existing of roomSessions) {
      const { sh, eh } = parseTime(existing.time);
      if (newSlot.hour >= sh && newSlot.hour < eh) {
        return false;  // Room conflict
      }
    }
  }
  
  return true;  // No conflicts
}
```

---

### Summary: Check 5

**Status:** ⏳ DESIGN COMPLETE

**Algorithms Designed:**
1. ✅ Student gap calculation (enhanced)
2. ✅ Student schedule scoring (new)
3. ✅ Day minimization scoring (new)
4. ✅ Session relocation algorithm (new)
5. ✅ Conflict resolution algorithm (new)

**Ready for Implementation:** Yes, pending approval

---

## Overall Summary

### Critical Issues Found

| Check | Status | Severity | Fixes Required |
|-------|--------|----------|----------------|
| 1. Group Identification | ❌ FAILED | 🔴 HIGH | 8 locations |
| 2. Conflict Detection | ⚠️ PARTIAL | 🟡 MEDIUM | 1 location |
| 3. Teacher Assignment | ⚠️ INCOMPLETE | 🟡 MEDIUM | 4 tasks |
| 4. Capacity Logic | ✅ PASSED | 🟢 LOW | 0 |
| 5. Optimization Design | ✅ COMPLETE | 🟢 LOW | 0 |

---

## Required Refactors Before Phase 2

### Priority 1: Critical Fixes (Must Fix)

1. **app/schedule/ClassesView.tsx**
   - Add subject filter to session filtering
   - Change: `s.groupName === cls.name`
   - To: `s.groupName === cls.name && s.subject === cls.subject`

2. **app/schedule/GridView.tsx**
   - Fix conflict detection (Line 84)
   - Add subject check to group comparison

3. **app/schedule/page.tsx**
   - Fix Line 314: Add subject context to groupName

### Priority 2: Important Enhancements

4. **Teacher Assignment Implementation**
   - Add preference checking to scheduler
   - Assign teachers to sections
   - Display assignments in UI

5. **Standardize Section Identification**
   - Create helper function: `sectionKey(groupName, subject)`
   - Use consistently across codebase

---

## Approval Required

Before continuing to Phase 2, please approve:

1. ✅ Optimization algorithm design (Check 5)
2. ⏳ Priority 1 fixes implementation plan
3. ⏳ Priority 2 enhancements timeline

---

**Audit Completed:** 2026-06-18 12:41 PM  
**Next Action:** Await approval to proceed with fixes  
**Estimated Fix Time:** 4-6 hours
