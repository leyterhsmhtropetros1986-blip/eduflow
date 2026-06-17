# Scheduler Stress Test Plan

**Date:** 2026-06-17  
**Objective:** Test scheduler performance with large dataset (200 students, 20 teachers, 30 sections, 10 rooms)

---

## Test Configuration

### Dataset Specifications:
- **Students:** 200
- **Teachers:** 20
- **Sections (ClassUnits):** 30
- **Rooms:** 10
- **Subjects:** 8 (Μαθηματικά, Φυσική, Χημεία, Βιολογία, Ιστορία, Γλώσσα, Αγγλικά, Πληροφορική)
- **Grades:** 6 (Α-Γ Γυμνασίου, Α-Γ Λυκείου)

---

## Test Execution Instructions

### Step 1: Generate Test Data

Run this script in the browser console on the EduFlow app:

```javascript
// STRESS TEST DATA GENERATOR
console.log("🚀 Generating stress test data...");

const GRADES = ["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"];
const SUBJECTS = ["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Ιστορία", "Γλώσσα", "Αγγλικά", "Πληροφορική"];
const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή"];

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// 1. Generate 30 Sections (5 per grade)
const sections = [];
GRADES.forEach((grade, gIdx) => {
  for (let i = 1; i <= 5; i++) {
    const prefix = grade.charAt(0);
    SUBJECTS.forEach((subject) => {
      sections.push({
        id: generateId("sec"),
        name: `${prefix}${i}`,
        grade: grade,
        subject: subject,
        maxStudents: 8
      });
    });
  }
});
console.log(`✓ Generated ${sections.length} sections`);

// 2. Generate 20 Teachers (2-3 subjects each)
const teachers = [];
const teacherNames = [
  ["Παπαδόπουλος", "Γιώργος"], ["Κωνσταντίνου", "Μαρία"], ["Νικολάου", "Δημήτρης"],
  ["Γεωργίου", "Ελένη"], ["Ιωάννου", "Νίκος"], ["Χριστοδούλου", "Σοφία"],
  ["Μιχαηλίδης", "Κώστας"], ["Αντωνίου", "Άννα"], ["Παναγιώτου", "Πέτρος"],
  ["Δημητρίου", "Κατερίνα"], ["Σταύρου", "Ανδρέας"], ["Θεοδώρου", "Μαρίνα"],
  ["Χαραλάμπους", "Γιάννης"], ["Σάββα", "Ειρήνη"], ["Λοΐζου", "Χρήστος"],
  ["Κυριάκου", "Δέσποινα"], ["Φιλίππου", "Μάριος"], ["Ανδρέου", "Βασιλική"],
  ["Νεοφύτου", "Παναγιώτης"], ["Σωτηρίου", "Αλεξάνδρα"]
];

teacherNames.forEach(([lastName, firstName], idx) => {
  const subjectCount = 2 + Math.floor(Math.random() * 2); // 2-3 subjects
  const teacherSubjects = [];
  for (let i = 0; i < subjectCount; i++) {
    const subj = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
    if (!teacherSubjects.includes(subj)) teacherSubjects.push(subj);
  }
  
  // Generate availability (3-4 days, 4-6 hours per day)
  const availability = [];
  const dayCount = 3 + Math.floor(Math.random() * 2);
  const selectedDays = DAYS.sort(() => Math.random() - 0.5).slice(0, dayCount);
  selectedDays.forEach(day => {
    const startHour = 14 + Math.floor(Math.random() * 3); // 14-16
    const duration = 4 + Math.floor(Math.random() * 3); // 4-6 hours
    availability.push({
      day: day,
      start: `${startHour}:00`,
      end: `${startHour + duration}:00`
    });
  });
  
  teachers.push({
    id: generateId("tea"),
    teacherCode: `T${String(idx + 1).padStart(3, '0')}`,
    firstName: firstName,
    lastName: lastName,
    phone: `697${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.gr`,
    subjects: teacherSubjects,
    subject: teacherSubjects[0],
    preferredClasses: [],
    acceptsSummer: false,
    availability: availability
  });
});
console.log(`✓ Generated ${teachers.length} teachers`);

// 3. Generate 200 Students (distributed across grades)
const students = [];
const firstNames = ["Γιώργος", "Μαρία", "Δημήτρης", "Ελένη", "Νίκος", "Σοφία", "Κώστας", "Άννα", "Πέτρος", "Κατερίνα"];
const lastNames = ["Παπαδόπουλος", "Κωνσταντίνου", "Νικολάου", "Γεωργίου", "Ιωάννου", "Χριστοδούλου", "Μιχαηλίδης", "Αντωνίου"];

for (let i = 0; i < 200; i++) {
  const grade = GRADES[Math.floor(i / 34)]; // ~33-34 per grade
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  // Each student enrolls in 3-5 subjects
  const subjectCount = 3 + Math.floor(Math.random() * 3);
  const studentSubjects = [];
  for (let j = 0; j < subjectCount; j++) {
    const subj = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
    if (!studentSubjects.includes(subj)) studentSubjects.push(subj);
  }
  
  // Assign to sections (find sections for this grade and subjects)
  const enrollments = studentSubjects.map(subj => {
    const availableSections = sections.filter(s => s.grade === grade && s.subject === subj);
    const section = availableSections[Math.floor(Math.random() * availableSections.length)];
    return {
      id: generateId("enr"),
      lessonName: subj,
      className: section ? section.name : "",
      sectionId: section ? section.id : ""
    };
  });
  
  // Generate availability (4-5 days, 5-8 hours per day)
  const availability = [];
  const dayCount = 4 + Math.floor(Math.random() * 2);
  const selectedDays = DAYS.sort(() => Math.random() - 0.5).slice(0, dayCount);
  selectedDays.forEach(day => {
    const startHour = 14 + Math.floor(Math.random() * 2); // 14-15
    const duration = 5 + Math.floor(Math.random() * 4); // 5-8 hours
    availability.push({
      day: day,
      start: `${startHour}:00`,
      end: `${startHour + duration}:00`
    });
  });
  
  students.push({
    id: generateId("stu"),
    studentCode: `S${String(i + 1).padStart(3, '0')}`,
    firstName: firstName,
    lastName: lastName,
    parentFirstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    parentLastName: lastName,
    parentPhone: `697${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
    parentEmail: `parent${i}@example.com`,
    studentPhone: `698${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
    grade: grade,
    enrollments: enrollments,
    notes: "",
    attendsSummer: false,
    availability: availability
  });
}
console.log(`✓ Generated ${students.length} students`);

// 4. Generate 10 Rooms
const rooms = [];
for (let i = 1; i <= 10; i++) {
  rooms.push({
    id: generateId("room"),
    name: `Αίθουσα ${i}`,
    title: `Αίθουσα ${i}`,
    capacity: 10 + Math.floor(Math.random() * 10)
  });
}
console.log(`✓ Generated ${rooms.length} rooms`);

// 5. Generate Lessons/Courses
const lessons = SUBJECTS.map(subj => ({
  name: subj,
  grade: "", // Available for all grades
  weeklyHours: 2 + Math.floor(Math.random() * 2), // 2-3 hours per week
  hoursPerWeek: 2 + Math.floor(Math.random() * 2)
}));
console.log(`✓ Generated ${lessons.length} lessons`);

// 6. Save to localStorage
localStorage.setItem("eduflow_classes", JSON.stringify(sections));
localStorage.setItem("eduflow_teachers", JSON.stringify(teachers));
localStorage.setItem("eduflow_students", JSON.stringify(students));
localStorage.setItem("eduflow_rooms", JSON.stringify(rooms));
localStorage.setItem("eduflow_courses", JSON.stringify(lessons));
localStorage.setItem("eduflow_lessons", JSON.stringify(lessons));

console.log("✅ Stress test data saved to localStorage");
console.log("📊 Summary:");
console.log(`   - Sections: ${sections.length}`);
console.log(`   - Teachers: ${teachers.length}`);
console.log(`   - Students: ${students.length}`);
console.log(`   - Rooms: ${rooms.length}`);
console.log(`   - Lessons: ${lessons.length}`);
console.log("\n🚀 Ready to run scheduler!");
```

### Step 2: Run Scheduler with Performance Monitoring

```javascript
// SCHEDULER STRESS TEST RUNNER
console.log("🧪 Starting scheduler stress test...");

// Clear existing schedule
localStorage.removeItem("eduflow_schedule");

// Performance monitoring
const startTime = performance.now();
const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

// Trigger scheduler (you'll need to click the "Generate Schedule" button in the UI)
// Or if you have access to the generateSchedule function:
// const result = generateSchedule(data);

console.log("⏱️ Scheduler started at:", new Date().toISOString());
console.log("💾 Initial memory:", (startMemory / 1024 / 1024).toFixed(2), "MB");

// After scheduler completes, run this:
function analyzeResults() {
  const endTime = performance.now();
  const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  const memoryUsed = ((endMemory - startMemory) / 1024 / 1024).toFixed(2);
  
  const schedule = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");
  const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
  const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
  
  console.log("\n📊 STRESS TEST RESULTS");
  console.log("=".repeat(50));
  console.log(`⏱️  Runtime: ${duration} seconds`);
  console.log(`💾 Memory Used: ${memoryUsed} MB`);
  console.log(`📅 Sessions Scheduled: ${schedule.length}`);
  
  // 1. Student Conflicts
  const studentConflicts = [];
  students.forEach(st => {
    const sessions = schedule.filter(s => 
      (st.enrollments || []).some(e => e.className === s.groupName && e.lessonName === s.subject)
    );
    const conflicts = [];
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        if (sessions[i].day === sessions[j].day) {
          const [s1, e1] = sessions[i].time.split('-').map(t => parseInt(t));
          const [s2, e2] = sessions[j].time.split('-').map(t => parseInt(t));
          if (s1 < e2 && s2 < e1) {
            conflicts.push({ session1: sessions[i], session2: sessions[j] });
          }
        }
      }
    }
    if (conflicts.length > 0) {
      studentConflicts.push({ student: `${st.lastName} ${st.firstName}`, conflicts });
    }
  });
  console.log(`\n❌ Student Conflicts: ${studentConflicts.length}`);
  if (studentConflicts.length > 0) {
    console.log("   First 5:", studentConflicts.slice(0, 5).map(c => c.student));
  }
  
  // 2. Teacher Conflicts
  const teacherConflicts = [];
  teachers.forEach(t => {
    const tName = `${t.lastName} ${t.firstName}`;
    const sessions = schedule.filter(s => s.teacher === tName);
    const conflicts = [];
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        if (sessions[i].day === sessions[j].day) {
          const [s1, e1] = sessions[i].time.split('-').map(t => parseInt(t));
          const [s2, e2] = sessions[j].time.split('-').map(t => parseInt(t));
          if (s1 < e2 && s2 < e1) {
            conflicts.push({ session1: sessions[i], session2: sessions[j] });
          }
        }
      }
    }
    if (conflicts.length > 0) {
      teacherConflicts.push({ teacher: tName, conflicts });
    }
  });
  console.log(`❌ Teacher Conflicts: ${teacherConflicts.length}`);
  if (teacherConflicts.length > 0) {
    console.log("   First 5:", teacherConflicts.slice(0, 5).map(c => c.teacher));
  }
  
  // 3. Room Conflicts
  const rooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");
  const roomConflicts = [];
  rooms.forEach(room => {
    const sessions = schedule.filter(s => s.room === room.name);
    const conflicts = [];
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        if (sessions[i].day === sessions[j].day) {
          const [s1, e1] = sessions[i].time.split('-').map(t => parseInt(t));
          const [s2, e2] = sessions[j].time.split('-').map(t => parseInt(t));
          if (s1 < e2 && s2 < e1) {
            conflicts.push({ session1: sessions[i], session2: sessions[j] });
          }
        }
      }
    }
    if (conflicts.length > 0) {
      roomConflicts.push({ room: room.name, conflicts });
    }
  });
  console.log(`❌ Room Conflicts: ${roomConflicts.length}`);
  
  // 4. Unplaced Sessions
  const lessons = JSON.parse(localStorage.getItem("eduflow_lessons") || "[]");
  const expectedSessions = {};
  students.forEach(st => {
    (st.enrollments || []).forEach(e => {
      const key = `${e.className}#${e.lessonName}`;
      if (!expectedSessions[key]) {
        const lesson = lessons.find(l => l.name === e.lessonName);
        expectedSessions[key] = {
          className: e.className,
          lessonName: e.lessonName,
          expectedHours: lesson ? (lesson.weeklyHours || 2) : 2,
          scheduledHours: 0
        };
      }
    });
  });
  schedule.forEach(s => {
    const key = `${s.groupName}#${s.subject}`;
    if (expectedSessions[key]) {
      const [start, end] = s.time.split('-').map(t => parseInt(t));
      expectedSessions[key].scheduledHours += (end - start);
    }
  });
  const unplaced = Object.values(expectedSessions).filter(s => s.scheduledHours < s.expectedHours);
  console.log(`❌ Unplaced/Incomplete Sessions: ${unplaced.length}`);
  if (unplaced.length > 0) {
    console.log("   First 5:", unplaced.slice(0, 5).map(u => `${u.className} ${u.lessonName} (${u.scheduledHours}/${u.expectedHours}h)`));
  }
  
  // 5. Student Gap Statistics
  const studentGaps = [];
  students.forEach(st => {
    const sessions = schedule.filter(s => 
      (st.enrollments || []).some(e => e.className === s.groupName && e.lessonName === s.subject)
    );
    let totalGaps = 0;
    ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].forEach(day => {
      const daySessions = sessions.filter(s => s.day === day)
        .map(s => {
          const [start, end] = s.time.split('-').map(t => parseInt(t));
          return { start, end };
        })
        .sort((a, b) => a.start - b.start);
      for (let i = 0; i < daySessions.length - 1; i++) {
        const gap = daySessions[i + 1].start - daySessions[i].end;
        if (gap > 0) totalGaps += gap;
      }
    });
    if (totalGaps > 0) {
      studentGaps.push({ student: `${st.lastName} ${st.firstName}`, gaps: totalGaps });
    }
  });
  const avgStudentGap = studentGaps.length > 0 
    ? (studentGaps.reduce((sum, s) => sum + s.gaps, 0) / studentGaps.length).toFixed(2)
    : 0;
  const maxStudentGap = studentGaps.length > 0 
    ? Math.max(...studentGaps.map(s => s.gaps))
    : 0;
  console.log(`\n📊 Student Gap Statistics:`);
  console.log(`   Students with gaps: ${studentGaps.length} / ${students.length}`);
  console.log(`   Average gap: ${avgStudentGap} hours`);
  console.log(`   Maximum gap: ${maxStudentGap} hours`);
  
  // 6. Teacher Gap Statistics
  const teacherGaps = [];
  teachers.forEach(t => {
    const tName = `${t.lastName} ${t.firstName}`;
    const sessions = schedule.filter(s => s.teacher === tName);
    let totalGaps = 0;
    ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].forEach(day => {
      const daySessions = sessions.filter(s => s.day === day)
        .map(s => {
          const [start, end] = s.time.split('-').map(t => parseInt(t));
          return { start, end };
        })
        .sort((a, b) => a.start - b.start);
      for (let i = 0; i < daySessions.length - 1; i++) {
        const gap = daySessions[i + 1].start - daySessions[i].end;
        if (gap > 0) totalGaps += gap;
      }
    });
    if (totalGaps > 0) {
      teacherGaps.push({ teacher: tName, gaps: totalGaps });
    }
  });
  const avgTeacherGap = teacherGaps.length > 0 
    ? (teacherGaps.reduce((sum, t) => sum + t.gaps, 0) / teacherGaps.length).toFixed(2)
    : 0;
  const maxTeacherGap = teacherGaps.length > 0 
    ? Math.max(...teacherGaps.map(t => t.gaps))
    : 0;
  console.log(`\n📊 Teacher Gap Statistics:`);
  console.log(`   Teachers with gaps: ${teacherGaps.length} / ${teachers.length}`);
  console.log(`   Average gap: ${avgTeacherGap} hours`);
  console.log(`   Maximum gap: ${maxTeacherGap} hours`);
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ Stress test complete!");
  
  return {
    runtime: duration,
    memory: memoryUsed,
    sessionsScheduled: schedule.length,
    studentConflicts: studentConflicts.length,
    teacherConflicts: teacherConflicts.length,
    roomConflicts: roomConflicts.length,
    unplacedSessions: unplaced.length,
    studentGapStats: {
      count: studentGaps.length,
      average: avgStudentGap,
      maximum: maxStudentGap
    },
    teacherGapStats: {
      count: teacherGaps.length,
      average: avgTeacherGap,
      maximum: maxTeacherGap
    }
  };
}

// Run after scheduler completes
// analyzeResults();
```

---

## Expected Results Template

```
📊 SCHEDULER STRESS TEST RESULTS
==================================================
⏱️  Runtime: [X.XX] seconds
💾 Memory Used: [X.XX] MB
📅 Sessions Scheduled: [XXX]

❌ Student Conflicts: [X]
❌ Teacher Conflicts: [X]
❌ Room Conflicts: [X]
❌ Unplaced/Incomplete Sessions: [X]

📊 Student Gap Statistics:
   Students with gaps: [X] / 200
   Average gap: [X.XX] hours
   Maximum gap: [X] hours

📊 Teacher Gap Statistics:
   Teachers with gaps: [X] / 20
   Average gap: [X.XX] hours
   Maximum gap: [X] hours

==================================================
✅ Stress test complete!
```

---

## Performance Benchmarks (Expected)

Based on the scheduler algorithm complexity:

### Time Complexity:
- **Sessions to schedule:** ~200 students × 4 subjects avg = ~800 sessions
- **Candidate slots per session:** ~5 days × ~8 hours × ~2 teachers = ~80 candidates
- **Total iterations:** ~800 × 80 = ~64,000 evaluations
- **Expected runtime:** 5-15 seconds (depending on hardware)

### Memory Usage:
- **Data structures:** ~2-5 MB for all entities
- **Schedule state:** ~1-2 MB for busy sets
- **Expected total:** 5-10 MB

### Quality Metrics (Target):
- **Student conflicts:** 0 (hard constraint)
- **Teacher conflicts:** 0 (hard constraint)
- **Room conflicts:** 0-5 (soft constraint, may occur if rooms limited)
- **Unplaced sessions:** 0-10% (depends on availability constraints)
- **Student gaps:** <10% of students with gaps, avg <1 hour
- **Teacher gaps:** <30% of teachers with gaps, avg <2 hours

---

## Troubleshooting

### If scheduler fails or hangs:
1. Check browser console for errors
2. Verify data was generated correctly
3. Reduce dataset size (100 students, 10 teachers)
4. Check for circular dependencies in availability

### If too many unplaced sessions:
- Increase teacher availability hours
- Increase student availability hours
- Reduce weekly hours per lesson
- Add more teachers for popular subjects

---

## Manual Execution Steps

1. Open EduFlow app in browser
2. Open browser DevTools (F12)
3. Go to Console tab
4. Paste and run the data generator script
5. Navigate to Schedule page in app
6. Click "Generate Schedule" button
7. Wait for completion
8. Paste and run `analyzeResults()` in console
9. Copy results to report

---

**Note:** This is a simulation plan. Actual execution requires running the scripts in the browser environment where the EduFlow app is loaded.
