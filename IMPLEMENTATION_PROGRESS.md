# Scheduling Engine Redesign - Implementation Progress

**Started:** 2026-06-18 12:31 PM  
**Status:** 🟡 IN PROGRESS  
**Current Phase:** 1 of 7 COMPLETE

---

## ✅ Phase 1: Database Schema Updates - COMPLETE

### Changes Made

#### 1.1 Updated ClassUnit Type
**File:** `lib/schema.ts` (Lines 67-78)

**Added Fields:**
- `enrolledStudents?: string[]` - Subject-specific student list
- `teacher?: string` - Teacher assigned to this section

**Key Change:** Sections now properly support independent student lists per subject

**Example:**
```typescript
// Physics G1
{
  id: "sec_001",
  name: "Γ1",
  subject: "Φυσική",
  enrolledStudents: ["stu_A", "stu_B", "stu_C"]
}

// Chemistry G1 (different students!)
{
  id: "sec_002",
  name: "Γ1",
  subject: "Χημεία",
  enrolledStudents: ["stu_B", "stu_D", "stu_F"]
}
```

---

#### 1.2 Added GroupCapacityConfig Type
**File:** `lib/schema.ts` (Lines 80-83)

```typescript
export type GroupCapacityConfig = {
  grade: string;
  defaultMaxStudents: number;
};
```

**Purpose:** Single configuration point for group capacity

---

#### 1.3 Added Deterministic Helper Functions
**File:** `lib/schema.ts` (Lines 485-600)

**Functions Added:**

1. **`getDefaultCapacity(grade: string): number`**
   - Returns default capacity (currently 6)
   - TODO: Load from configuration

2. **`createSectionsForSubject(...): ClassUnit[]`**
   - Creates sections deterministically
   - Fills G1, then G2, then G3
   - Sorts students alphabetically
   - Same input = same output

3. **`placeStudentInSection(...): string`**
   - Places student in least-filled section
   - Always fills G1 first
   - Creates new section when full
   - Deterministic placement

4. **`getStudentsInSection(sectionId, sections): string[]`**
   - Returns students in a section

5. **`isSectionFull(sectionId, sections): boolean`**
   - Checks if section is at capacity

---

### Key Achievements

✅ **Subject-Specific Groups:** Sections now properly support different students per subject  
✅ **Deterministic Allocation:** Same input always produces same output  
✅ **Capacity Management:** Single source of truth for group capacity  
✅ **Helper Functions:** Reusable functions for group creation and placement  

---

## 🟡 Phase 2: Group Creation Logic - NEXT

### Planned Changes

**File:** `app/classes/page.tsx`

**Tasks:**
1. Update bulk creation to use `createSectionsForSubject()`
2. Ensure sections are created with `enrolledStudents` field
3. Remove any random allocation logic
4. Add capacity configuration UI

**Estimated Time:** 2 hours

---

## ⏳ Phase 3: Student Placement Engine - PENDING

### Planned Changes

**File:** `app/students/page.tsx`

**Tasks:**
1. Update enrollment logic to use `placeStudentInSection()`
2. Show which students are in which sections
3. Allow manual section selection
4. Prevent over-capacity enrollments

**Estimated Time:** 3 hours

---

## ⏳ Phase 4: Scheduling Optimization Engine - PENDING

### Planned Changes

**File:** `app/schedule/page.tsx`

**Tasks:**
1. Rewrite `generateSchedule()` function
2. Implement gap elimination algorithm
3. Implement day consolidation
4. Add scoring system
5. Remove all random decisions

**Key Requirements:**
- Zero student gaps (weight: 10000)
- Minimize attendance days (weight: 5000)
- Compact schedules (weight: 3000)
- Teacher preferences (weight: 500)
- Room optimization (weight: 100)

**Estimated Time:** 8 hours

---

## ⏳ Phase 5: Gap Elimination - PENDING

### Planned Algorithm

```typescript
function eliminateStudentGaps(schedule: Session[]): Session[] {
  for (each student) {
    for (each day) {
      // Find gaps
      const gaps = findGaps(studentSchedule, day);
      
      if (gaps.length > 0) {
        // Try to move sessions to adjacent slots
        tryMoveToAdjacentSlots(gaps);
        
        // Try to swap with other students
        trySwapWithOtherStudents(gaps);
        
        // Try to consolidate into fewer days
        tryConsolidateDays(gaps);
      }
    }
  }
  
  return schedule;
}
```

**Estimated Time:** 4 hours

---

## ⏳ Phase 6: Timetable UI Fixes - PENDING

### Issues to Fix

**File:** `app/schedule/GridView.tsx`

**Problems:**
- Overlapping lessons
- Overlapping blocks
- Grid alignment issues

**Solutions:**
- Fixed-height cells
- Proper z-index management
- Clear visual separation

**Estimated Time:** 3 hours

---

## ⏳ Phase 7: Testing - PENDING

### Test Cases

1. **Cross-Subject Groups**
   - Student in Physics G1, Chemistry G2, Math G1
   - Verify independent group composition

2. **Deterministic Allocation**
   - Same students → same groups
   - Reproducible results

3. **Gap Elimination**
   - No 1-hour gaps in student schedules
   - Compact daily schedules

4. **Capacity Limits**
   - Cannot exceed max students per section
   - Automatic creation of new sections

**Estimated Time:** 4 hours

---

## Timeline

**Total Estimated Time:** 24 hours

**Phase 1:** ✅ 2 hours (COMPLETE)  
**Phase 2:** 🟡 2 hours (NEXT)  
**Phase 3:** ⏳ 3 hours  
**Phase 4:** ⏳ 8 hours  
**Phase 5:** ⏳ 4 hours  
**Phase 6:** ⏳ 3 hours  
**Phase 7:** ⏳ 4 hours  

**Completion Target:** 3 working days

---

## Next Steps

1. ✅ Complete Phase 1 schema updates
2. 🟡 Begin Phase 2: Update group creation in classes page
3. ⏳ Continue with student placement
4. ⏳ Rewrite scheduling engine
5. ⏳ Test and validate

---

## Technical Decisions

### Deterministic Allocation
- ✅ Alphabetical sorting for students
- ✅ Sequential group filling (G1, G2, G3)
- ✅ No random placement

### Capacity Management
- ✅ Default capacity: 6 students per group
- ✅ Same capacity across all subjects
- ✅ Configurable per grade (future)

### Section Independence
- ✅ Each subject has own sections
- ✅ Different student composition per subject
- ✅ No shared student lists

---

## Migration Strategy

### Backward Compatibility
- ✅ Existing data preserved
- ✅ New fields are optional
- ✅ Migration scripts ready

### Data Migration
- ✅ Migration v1: IDs and codes
- ✅ Migration v2: Subject-specific sections
- ⏳ Migration v3: Populate enrolledStudents (TODO)

---

**Last Updated:** 2026-06-18 12:32 PM  
**Next Update:** After Phase 2 completion
