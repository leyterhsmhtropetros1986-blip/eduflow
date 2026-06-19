# PLACEMENT PAGE - ROOT CAUSE ANALYSIS
## Duplicate Sections Issue

**Date:** 2026-06-19  
**Status:** CRITICAL BUG IDENTIFIED

---

## EXECUTIVE SUMMARY

The placement page shows duplicate sections (multiple Γ1, Γ2, Γ3) because:

1. **Classes are stored WITHOUT subject information**
2. **The page shows ALL classes for a grade, not filtered by subject**
3. **There's no way to distinguish Physics-Γ1 from Chemistry-Γ1**

---

## ROOT CAUSE

### File: `app/placement/page.tsx`
### Lines: 54-60
### Function: `relevantClasses`

```typescript
const relevantClasses = useMemo(() => {
  if (!selectedLesson) return [];
  const grades = new Set<string>();
  eligibleStudents.forEach((s) => grades.add(s.grade));
  // ❌ BUG: Returns ALL classes for those grades
  // Does NOT filter by subject!
  return classes.filter((c) => grades.has(c.grade));
}, [classes, selectedLesson, eligibleStudents]);
```

### What Happens:

1. User selects "Φυσική" (Physics)
2. System finds students in "Γ Λυκείου" enrolled in Physics
3. System returns **ALL** classes for "Γ Λυκείου":
   - Γ1 (could be Physics, Chemistry, Math...)
   - Γ2 (could be Physics, Chemistry, Math...)
   - Γ3 (could be Physics, Chemistry, Math...)

### Why It Shows Duplicates:

If there are 8 subjects and 3 sections per subject:
- 8 subjects × 3 sections = 24 class records
- All named Γ1, Γ2, Γ3
- All for same grade
- **ALL 24 appear on the page!**

---

## DATA MODEL ISSUE

### Current Class Structure (WRONG):

```typescript
interface ClassItem {
  id: string;
  name: string;      // "Γ1", "Γ2", "Γ3"
  grade: string;     // "Γ Λυκείου"
  maxStudents?: number;
  // ❌ NO SUBJECT FIELD!
}
```

### Correct Class Structure (NEEDED):

```typescript
interface ClassItem {
  id: string;
  name: string;      // "Γ1", "Γ2", "Γ3"
  grade: string;     // "Γ Λυκείου"
  subject: string;   // "Φυσική", "Χημεία", etc.
  maxStudents?: number;
}
```

---

## WHERE CLASSES ARE CREATED

### 1. Settings Page (`app/settings/page.tsx`)

Classes are created as:
```typescript
{ id: `id-${Date.now()}`, name: value }
```

**NO subject field!**

### 2. Students Page

When students enroll, they create enrollments:
```typescript
{ lessonName: "Φυσική", className: "Γ1" }
```

But this doesn't create class records with subjects.

### 3. Teachers Page

Teachers have preferred sections:
```typescript
{ className: "Γ1", subject: "Φυσική" }
```

But this doesn't update the classes array.

---

## THE FUNDAMENTAL PROBLEM

**Classes are created as generic "Γ1", "Γ2", "Γ3" without subject context.**

Then:
- Students link to them via `{ lessonName, className }`
- Teachers link to them via `{ className, subject }`
- Schedule links to them via `{ groupName, subject }`

But the **classes array itself has no subject field!**

---

## WHY THIS CAUSES DUPLICATES

Example scenario:

**Classes in localStorage:**
```json
[
  { "id": "1", "name": "Γ1", "grade": "Γ Λυκείου", "maxStudents": 6 },
  { "id": "2", "name": "Γ2", "grade": "Γ Λυκείου", "maxStudents": 6 },
  { "id": "3", "name": "Γ3", "grade": "Γ Λυκείου", "maxStudents": 6 },
  { "id": "4", "name": "Γ1", "grade": "Γ Λυκείου", "maxStudents": 6 },
  { "id": "5", "name": "Γ2", "grade": "Γ Λυκείου", "maxStudents": 6 },
  { "id": "6", "name": "Γ3", "grade": "Γ Λυκείου", "maxStudents": 6 }
]
```

**When user selects "Φυσική":**
- System filters by grade: "Γ Λυκείου"
- Returns ALL 6 classes
- Shows: Γ1, Γ2, Γ3, Γ1, Γ2, Γ3 (duplicates!)

---

## SOLUTION OPTIONS

### Option 1: Add Subject to Classes (RECOMMENDED)

**Pros:**
- Proper data model
- Clear section identity
- Easy to filter

**Cons:**
- Requires data migration
- Changes to multiple pages

### Option 2: Filter by Enrollment Data

**Pros:**
- No data migration needed
- Works with current structure

**Cons:**
- Complex logic
- Doesn't fix root cause
- Still ambiguous

### Option 3: Deduplicate by Name

**Pros:**
- Quick fix
- Minimal changes

**Cons:**
- Doesn't solve the real problem
- Still shows wrong sections

---

## RECOMMENDED FIX

### 1. Update Class Interface

```typescript
interface ClassItem {
  id: string;
  name: string;
  grade: string;
  subject: string;  // ADD THIS
  maxStudents?: number;
}
```

### 2. Update Placement Page Filter

```typescript
const relevantClasses = useMemo(() => {
  if (!selectedLesson) return [];
  const grades = new Set<string>();
  eligibleStudents.forEach((s) => grades.add(s.grade));
  // ✅ Filter by BOTH grade AND subject
  return classes.filter((c) => 
    grades.has(c.grade) && c.subject === selectedLesson
  );
}, [classes, selectedLesson, eligibleStudents]);
```

### 3. Update Class Creation

Wherever classes are created, add subject field.

### 4. Data Migration

Add migration script to add subject to existing classes based on:
- Student enrollments
- Teacher assignments
- Schedule data

---

## TEMPORARY WORKAROUND

Until proper fix is implemented, deduplicate by name:

```typescript
const relevantClasses = useMemo(() => {
  if (!selectedLesson) return [];
  const grades = new Set<string>();
  eligibleStudents.forEach((s) => grades.add(s.grade));
  
  const filtered = classes.filter((c) => grades.has(c.grade));
  
  // Deduplicate by name (temporary fix)
  const seen = new Set<string>();
  return filtered.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });
}, [classes, selectedLesson, eligibleStudents]);
```

---

## FILES AFFECTED

1. `app/placement/page.tsx` - Main issue
2. `app/settings/page.tsx` - Class creation
3. `app/classes/page.tsx` - Class management
4. `lib/schema.ts` - Type definitions
5. All pages that use classes array

---

## VERIFICATION STEPS

After fix:

1. ✅ Select "Φυσική" → See only Physics sections (Γ1, Γ2, Γ3)
2. ✅ Select "Χημεία" → See only Chemistry sections (Γ1, Γ2, Γ3)
3. ✅ No duplicates
4. ✅ Each section shows correct subject
5. ✅ Student placement works correctly

---

## CONCLUSION

**Root Cause:** Classes stored without subject information

**Impact:** Placement page shows all classes for a grade, not filtered by subject

**Fix:** Add subject field to class data model and filter by subject

**Priority:** CRITICAL - Affects core functionality
