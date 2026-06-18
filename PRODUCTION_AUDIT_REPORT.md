# PRODUCTION AUDIT REPORT - CRITICAL ISSUES FOUND

**Date:** 2026-06-18  
**Status:** ⚠️ DEPLOYMENT BLOCKED - Critical Issues Found  
**Auditor:** System Analysis

---

## BUILD STATUS ✅

```
✓ Compiled successfully in 20.2s
✓ TypeScript check passed (10.6s)
✓ All 37 pages generated
```

**TypeScript Errors:** 0  
**Warnings:** 0  
**Build Status:** ✅ PASSING

---

## CRITICAL ISSUES FOUND

### 🔴 ISSUE #1: Teacher-Subject Validation in Scheduler

**Severity:** CRITICAL - PRODUCTION BLOCKING  
**File:** `app/schedule/page.tsx`  
**Lines:** 186-194

**Finding:**
Scheduler DOES validate teacher-subject matching:

```typescript
const candidates = teachers
  .filter((t) => (t.subjects && t.subjects.includes(ses.lessonName)) || t.subject === ses.lessonName)
  .sort((a, b) => {
    const nameA = `${a.lastName || ""} ${a.firstName || ""}`.trim();
    const nameB = `${b.lastName || ""} ${b.firstName || ""}`.trim();
    const loadDiff = (teacherLoad[nameA] || 0) - (teacherLoad[nameB] || 0);
    if (loadDiff !== 0) return loadDiff;
    return nameA.localeCompare(nameB, "el");
  });
```

**Status:** ✅ VALIDATED - Teachers filtered by `teacher.subjects.includes(session.subject)`

**Evidence:**
- Line 187: `t.subjects && t.subjects.includes(ses.lessonName)`
- Line 187: Fallback to legacy `t.subject === ses.lessonName`
- Only qualified teachers are candidates for assignment

---

### 🔴 ISSUE #2: preferredClasses Data Model - UNSAFE

**Severity:** CRITICAL - DATA INTEGRITY ISSUE  
**Files:** 
- `app/teachers/page.tsx` (19 occurrences)
- `lib/schema.ts` (type definition)

**Finding:**
Current implementation uses `preferredClasses: string[]` based on class NAME only.

**Problem:**
```typescript
// UNSAFE: Uses only class name
preferredClasses: ["G1", "G2"]

// This is ambiguous because:
// - G1 (Physics)
// - G1 (Chemistry)
// - G1 (Math)
// All share the same name "G1"
```

**Evidence from app/teachers/page.tsx:**

**Line 359:**
```typescript
checked={form.preferredClasses?.includes(c.name) || false}
```
Uses `c.name` only - NO subject check!

**Line 181:**
```typescript
const validPreferredClasses = (form.preferredClasses || []).filter((className) => {
  const matchingClass = classes.find((c) => c.name === className);
  return matchingClass && newSubjects.includes(matchingClass.subject || '');
});
```
Attempts to match by name, but `classes.find()` returns FIRST match only!

**Line 362:**
```typescript
<span>{c.name}{c.subject ? ` (${c.subject})` : ""}</span>
```
Displays subject in UI, but stores only name!

**Status:** ❌ UNSAFE - Ambiguous section identification

**Recommendation:**
Replace with:
```typescript
preferredSections: Array<{
  className: string;
  subject: string;
  sectionKey: string; // "${subject}__${className}"
}>
```

---

### 🔴 ISSUE #3: lib/schema.ts Has BOTH Data Models

**Severity:** HIGH - INCONSISTENT DATA MODEL  
**File:** `lib/schema.ts`  
**Lines:** 18-24

**Finding:**
Schema defines BOTH old and new models:

```typescript
export type Teacher = {
  // ... other fields
  preferredClasses?: string[];  // Legacy: class-level preferences
  preferredSections?: Array<{   // New: subject-specific preferences
    className: string;
    subject: string;
  }>;
  // ...
};
```

**Problem:**
- UI uses `preferredClasses` (string[])
- Optimization engine uses `preferredSections` (object[])
- NO migration between the two
- Data inconsistency

**Evidence from lib/schema.ts (lines 1000-1006):**
```typescript
if (teacher?.preferredSections) {
  const hasPreference = teacher.preferredSections.some(ps => 
    ps.className === session.groupName && ps.subject === session.subject
  );
  
  if (!hasPreference) {
    teacherPenalty += 500;
    teacherPreferenceViolations++;
  }
}
```

Optimization uses `preferredSections`, but UI saves `preferredClasses`!

**Status:** ❌ INCONSISTENT - Two data models in use

---

### 🟡 ISSUE #4: Optimization Engine - Subject Preservation

**Severity:** MEDIUM - NEEDS VERIFICATION  
**File:** `lib/schema.ts`  
**Functions:** tryMoveSessionToAdjacentHour, tryMoveSessionToAnyHour, trySwapSessions

**Finding:**
Optimization moves preserve session identity but don't explicitly validate teacher qualification.

**Analysis:**

**trySwapSessions (lines 1133-1165):**
```typescript
export function trySwapSessions(
  schedule: Session[],
  sessionId1: string,
  sessionId2: string
): Session[] | null {
  // ... swap logic
  newSchedule[idx1] = { ...session1, day: session2.day, time: session2.time };
  newSchedule[idx2] = { ...session2, day: session1.day, time: session1.time };
  // ...
}
```

**Problem:** Swaps preserve teacher and subject, but doesn't validate if swapped teacher can teach swapped subject!

**Example:**
- Session 1: Teacher A (Chemistry) teaching Chemistry
- Session 2: Teacher B (Physics) teaching Physics
- After swap: Teacher A still assigned to Chemistry ✅
- But what if swap logic changes teacher assignment? ❌

**Status:** ⚠️ NEEDS REVIEW - Swaps preserve assignments but no explicit validation

---

### 🟢 ISSUE #5: Printable Schedule - FIXED

**Severity:** LOW - ALREADY FIXED  
**Files:** 
- `app/timetable/page.tsx` (FIXED)
- `app/timetable-by-grade/page.tsx` (FIXED)

**Finding:**
Both files now properly filter and display sections:

**app/timetable/page.tsx (lines 52-77):**
```typescript
const classOptions = useMemo(() => {
  const uniqueMap = new Map<string, any>();
  classes.forEach((c: any) => {
    const name = c.name || c.className || "";
    const subject = c.subject || "";
    const grade = c.grade || "";
    const key = `${name}|||${subject}|||${grade}`;
    
    if (!uniqueMap.has(key) && name) {
      uniqueMap.set(key, {
        value: key,
        name,
        subject,
        grade,
        label: subject ? `${subject} - ${name}` : (grade ? `${name} — ${grade}` : name)
      });
    }
  });
  
  return Array.from(uniqueMap.values())
    .sort((a, b) => {
      const nameCompare = a.name.localeCompare(b.name, "el");
      if (nameCompare !== 0) return nameCompare;
      return (a.subject || "").localeCompare(b.subject || "", "el");
    });
}, [classes]);
```

**Status:** ✅ FIXED - Unique section keys, proper display format

---

### 🟢 ISSUE #6: Operating Hours Validation - FIXED

**Severity:** LOW - ALREADY FIXED  
**File:** `lib/schema.ts`  
**Functions:** All optimization move functions

**Finding:**
All move functions now validate operating hours:

```typescript
// HARD CONSTRAINT: Validate operating hours
if (!isValidTimeSlot(session.day, newStart, newEnd)) {
  return null;
}
```

**Status:** ✅ FIXED - Operating hours enforced in all moves

---

## DATA INTEGRITY AUDIT

### A. Teachers Assigned to Wrong Subjects

**Method:** Check if scheduler validates teacher.subjects

**Result:** ✅ VALIDATED

**Evidence:**
- Scheduler filters candidates by `teacher.subjects.includes(session.subject)`
- Only qualified teachers can be assigned
- No invalid assignments possible in scheduler

**Count:** 0 violations (scheduler prevents this)

---

### B. Sections with Missing Subjects

**Method:** Search for sections without subject field

**Result:** ⚠️ POSSIBLE

**Evidence:**
- Schema allows `subject?: string` (optional)
- Legacy sections may have empty subject
- No migration enforces subject requirement

**Recommendation:** Run data migration to ensure all sections have subjects

---

### C. Duplicate Section Identities

**Method:** Check for sections with same name+subject+grade

**Result:** ⚠️ POSSIBLE

**Evidence:**
- No unique constraint in data model
- UI deduplicates in display, but storage allows duplicates
- `classIdMap[${nm}#${c.subject}]` in scheduler assumes uniqueness

**Recommendation:** Add unique constraint or deduplication on save

---

### D. Students Assigned to Nonexistent Sections

**Method:** Check enrollment.sectionId references

**Result:** ⚠️ POSSIBLE

**Evidence:**
- Enrollments store `sectionId` and `className`
- No foreign key validation
- Section deletion doesn't clean up enrollments

**Recommendation:** Add referential integrity checks

---

### E. Sessions Referencing Invalid Section Identifiers

**Method:** Check schedule sessions reference valid sections

**Result:** ⚠️ POSSIBLE

**Evidence:**
- Sessions store `groupName` and `subject`
- No validation that section exists
- Scheduler creates sessions without checking section existence

**Recommendation:** Validate section exists before creating session

---

## PRODUCTION SAFETY METRICS

### Build Metrics ✅
- **TypeScript Errors:** 0
- **Warnings:** 0
- **Build Time:** 20.2s
- **Pages Generated:** 37/37

### Code Quality Metrics ⚠️
- **Duplicate Section Keys:** Unknown (requires runtime data)
- **Invalid Teacher Assignments:** 0 (prevented by scheduler)
- **Operating Hour Violations:** 0 (prevented by validation)
- **preferredClasses Ambiguity:** HIGH (uses name only)
- **Data Model Inconsistency:** 2 models (preferredClasses vs preferredSections)

---

## CRITICAL BLOCKERS FOR DEPLOYMENT

### 🔴 BLOCKER #1: preferredClasses Data Model

**Issue:** Uses class name only, ambiguous for multi-subject sections

**Impact:** 
- Teacher preferences may match wrong section
- G1 Chemistry teacher might be assigned to G1 Physics
- Data integrity compromised

**Required Fix:**
1. Migrate `preferredClasses: string[]` to `preferredSections: Array<{className, subject}>`
2. Update UI to save subject with class name
3. Update all matching logic to use subject+name
4. Run data migration for existing teachers

**Estimated Effort:** 2-4 hours

---

### 🟡 WARNING #1: Data Model Inconsistency

**Issue:** Two preference models in codebase

**Impact:**
- UI saves `preferredClasses`
- Optimization reads `preferredSections`
- Preferences may not work correctly

**Required Fix:**
1. Choose one model (preferredSections recommended)
2. Remove deprecated model
3. Update all code paths
4. Migrate existing data

**Estimated Effort:** 3-5 hours

---

### 🟡 WARNING #2: No Referential Integrity

**Issue:** No validation that referenced sections exist

**Impact:**
- Orphaned enrollments possible
- Invalid schedule sessions possible
- Data cleanup difficult

**Required Fix:**
1. Add validation on enrollment save
2. Add validation on session creation
3. Add cleanup on section deletion
4. Run data integrity audit

**Estimated Effort:** 2-3 hours

---

## RECOMMENDATIONS

### Immediate (Before Deployment)

1. ✅ **Operating Hours:** FIXED - No action needed
2. ✅ **Printable Schedule:** FIXED - No action needed
3. ✅ **Teacher-Subject Validation:** VERIFIED - No action needed
4. ❌ **preferredClasses Model:** MUST FIX - Critical data integrity issue

### Short Term (Next Sprint)

1. Migrate to `preferredSections` model
2. Add referential integrity checks
3. Run data integrity audit
4. Add unique constraints for sections

### Long Term (Technical Debt)

1. Add database with proper foreign keys
2. Implement data validation layer
3. Add automated integrity tests
4. Document data model clearly

---

## DEPLOYMENT DECISION

**Status:** ⚠️ CONDITIONAL APPROVAL

**Can Deploy IF:**
1. Accept risk of preferredClasses ambiguity
2. Document known limitation
3. Plan fix for next release
4. No existing data uses preferences

**Cannot Deploy IF:**
1. Existing teachers have preferredClasses set
2. Production data has multi-subject sections
3. Teacher preferences are critical feature

**Recommendation:** 
- Deploy with warning if preferences not used
- Block deployment if preferences are active
- Fix preferredClasses model before enabling preferences

---

## EVIDENCE SUMMARY

### What Works ✅
- Build passes (0 errors, 0 warnings)
- Teacher-subject validation in scheduler
- Operating hours validation
- Printable schedule deduplication
- Section display format

### What's Broken ❌
- preferredClasses uses name only (ambiguous)
- Two data models (preferredClasses vs preferredSections)
- No referential integrity
- No unique constraints

### What's Unknown ⚠️
- Runtime duplicate section count
- Existing preferredClasses data
- Orphaned enrollment count
- Invalid session count

---

## CONCLUSION

**Build Status:** ✅ PASSING  
**Code Quality:** ⚠️ ACCEPTABLE WITH WARNINGS  
**Data Model:** ❌ CRITICAL ISSUES  
**Deployment:** ⚠️ CONDITIONAL - Fix preferredClasses first

**Next Steps:**
1. Review this audit with team
2. Decide on preferredClasses fix timeline
3. Run runtime data integrity check
4. Make deployment decision based on data

---

**This audit provides evidence-based analysis. Deployment decision requires business judgment on acceptable risk level.**
