// ============================================================
// EDUFLOW SCHEDULER STRESS TEST - PRODUCTION READY
// ============================================================
// Run this in browser console with EduFlow app loaded
// 
// Usage:
// 1. Open EduFlow app
// 2. Open DevTools Console (F12)
// 3. Copy and paste this entire file
// 4. Results will be logged and returned
// ============================================================

(async function runSchedulerStressTest() {
  console.log("🚀 EduFlow Scheduler Stress Test - Starting...\n");
  
  const GRADES = ["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"];
  const SUBJECTS = ["Μαθηματικά", "Φυσική", "Χημεία", "Βιολογία", "Ιστορία", "Γλώσσα", "Αγγλικά", "Πληροφορική"];
  const DAYS = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή"];
  
  function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  
  // ============================================================
  // STEP 1: GENERATE REALISTIC SYNTHETIC DATASET
  // ============================================================
  console.log("📊 Step 1: Generating synthetic dataset...");
  
  // 1.1 Generate 30 Sections with capacity limits
  const sections = [];
  GRADES.forEach((grade) => {
    const prefix = grade.charAt(0);
    for (let i = 1; i <= 5; i++) {
      SUBJECTS.forEach((subject) => {
        sections.push({
          id: generateId("sec"),
          name: `${prefix}${i}`,
          grade: grade,
          subject: subject,
          maxStudents: 6 + Math.floor(Math.random() * 4) // 6-9 capacity
        });
      });
    }
  });
  console.log(`   ✓ Generated ${sections.length} sections (capacity: 6-9 each)`);
  
  // 1.2 Generate 20 Teachers with subject restrictions and realistic availability
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
    // Each teacher teaches 2-3 subjects (realistic constraint)
    const subjectCount = 2 + Math.floor(Math.random() * 2);
    const teacherSubjects = [];
    const startIdx = Math.floor(Math.random() * (SUBJECTS.length - subjectCount));
    for (let i = 0; i < subjectCount; i++) {
      teacherSubjects.push(SUBJECTS[startIdx + i]);
    }
    
    // Realistic availability: 3-4 days, 5-7 hours per day
    const availability = [];
    const dayCount = 3 + Math.floor(Math.random() * 2);
    const selectedDays = [...DAYS].sort(() => Math.random() - 0.5).slice(0, dayCount);
    selectedDays.forEach(day => {
      const startHour = 14 + Math.floor(Math.random() * 2); // 14-15
      const duration = 5 + Math.floor(Math.random() * 3); // 5-7 hours
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
      availability: availability,
      lockedSlots: []
    });
  });
  console.log(`   ✓ Generated ${teachers.length} teachers (2-3 subjects each, 3-4 days availability)`);
  
  // 1.3 Generate 200 Students with 2-4 lessons each, mixed grades, realistic availability
  const students = [];
  const firstNames = ["Γιώργος", "Μαρία", "Δημήτρης", "Ελένη", "Νίκος", "Σοφία", "Κώστας", "Άννα", "Πέτρος", "Κατερίνα", "Αλέξανδρος", "Χριστίνα"];
  const lastNames = ["Παπαδόπουλος", "Κωνσταντίνου", "Νικολάου", "Γεωργίου", "Ιωάννου", "Χριστοδούλου", "Μιχαηλίδης", "Αντωνίου", "Παναγιώτου", "Δημητρίου"];
  
  for (let i = 0; i < 200; i++) {
    const grade = GRADES[Math.floor(i / 34)]; // ~33-34 per grade (mixed)
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // Each student enrolls in 2-4 subjects (realistic)
    const subjectCount = 2 + Math.floor(Math.random() * 3);
    const studentSubjects = [];
    const startIdx = Math.floor(Math.random() * (SUBJECTS.length - subjectCount));
    for (let j = 0; j < subjectCount; j++) {
      const subj = SUBJECTS[startIdx + j];
      if (!studentSubjects.includes(subj)) studentSubjects.push(subj);
    }
    
    // Assign to sections
    const enrollments = studentSubjects.map(subj => {
      const availableSections = sections.filter(s => s.grade === grade && s.subject === subj);
      const section = availableSections[Math.floor(Math.random() * availableSections.length)];
      return {
        id: generateId("enr"),
        lessonName: subj,
        className: section ? section.name : "",
        sectionId: section ? section.id : "",
        pickSection: false
      };
    });
    
    // Realistic availability: 4-5 days, 6-8 hours per day
    const availability = [];
    const dayCount = 4 + Math.floor(Math.random() * 2);
    const selectedDays = [...DAYS].sort(() => Math.random() - 0.5).slice(0, dayCount);
    selectedDays.forEach(day => {
      const startHour = 14 + Math.floor(Math.random() * 2); // 14-15
      const duration = 6 + Math.floor(Math.random() * 3); // 6-8 hours
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
      availability: availability,
      lockedSlots: []
    });
  }
  console.log(`   ✓ Generated ${students.length} students (2-4 lessons each, 4-5 days availability)`);
  
  // 1.4 Generate 10 Rooms
  const rooms = [];
  for (let i = 1; i <= 10; i++) {
    rooms.push({
      id: generateId("room"),
      name: `Αίθουσα ${i}`,
      title: `Αίθουσα ${i}`,
      capacity: 10 + Math.floor(Math.random() * 10)
    });
  }
  console.log(`   ✓ Generated ${rooms.length} rooms`);
  
  // 1.5 Generate Lessons/Courses
  const lessons = SUBJECTS.map(subj => ({
    name: subj,
    grade: "",
    weeklyHours: 2,
    hoursPerWeek: 2,
    distribution: [2]
  }));
  console.log(`   ✓ Generated ${lessons.length} lessons (2 hours/week each)`);
  
  // Save to localStorage
  localStorage.setItem("eduflow_classes", JSON.stringify(sections));
  localStorage.setItem("eduflow_teachers", JSON.stringify(teachers));
  localStorage.setItem("eduflow_students", JSON.stringify(students));
  localStorage.setItem("eduflow_rooms", JSON.stringify(rooms));
  localStorage.setItem("eduflow_courses", JSON.stringify(lessons));
  localStorage.setItem("eduflow_lessons", JSON.stringify(lessons));
  localStorage.removeItem("eduflow_schedule");
  
  console.log("\n✅ Synthetic dataset generated and saved\n");
  
  // ============================================================
  // STEP 2: RUN SCHEDULER WITH PERFORMANCE MONITORING
  // ============================================================
  console.log("⚡ Step 2: Running scheduler...");
  
  const startTime = performance.now();
  const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
  
  // Note: You need to manually trigger the scheduler in the UI
  // or call the generateSchedule function if you have access to it
  console.log("⚠️  MANUAL STEP REQUIRED:");
  console.log("   1. Click 'Generate Schedule' button in the UI");
  console.log("   2. Wait for completion");
  console.log("   3. Run: analyzeSchedulerResults()");
  console.log("");
  
  // ============================================================
  // STEP 3: ANALYSIS FUNCTION
  // ============================================================
  window.analyzeSchedulerResults = function() {
    const endTime = performance.now();
    const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const memoryUsed = ((endMemory - startMemory) / 1024 / 1024).toFixed(2);
    
    const schedule = JSON.parse(localStorage.getItem("eduflow_schedule") || "[]");
    const students = JSON.parse(localStorage.getItem("eduflow_students") || "[]");
    const teachers = JSON.parse(localStorage.getItem("eduflow_teachers") || "[]");
    const sections = JSON.parse(localStorage.getItem("eduflow_classes") || "[]");
    const rooms = JSON.parse(localStorage.getItem("eduflow_rooms") || "[]");
    
    console.log("\n" + "=".repeat(70));
    console.log("📊 SCHEDULER STRESS TEST RESULTS");
    console.log("=".repeat(70));
    
    // ============================================================
    // PERFORMANCE METRICS
    // ============================================================
    console.log("\n⏱️  PERFORMANCE METRICS:");
    console.log(`   Runtime: ${duration} seconds`);
    console.log(`   Memory Used: ${memoryUsed} MB`);
    console.log(`   Sessions Scheduled: ${schedule.length}`);
    
    // ============================================================
    // VALIDATION: CONFLICTS
    // ============================================================
    console.log("\n🔍 VALIDATION: CONFLICTS");
    
    // 1. Student Conflicts
    const studentConflicts = [];
    const studentDuplicates = [];
    students.forEach(st => {
      const sessions = schedule.filter(s => 
        (st.enrollments || []).some(e => e.className === s.groupName && e.lessonName === s.subject)
      );
      
      // Check for overlaps
      const conflicts = [];
      for (let i = 0; i < sessions.length; i++) {
        for (let j = i + 1; j < sessions.length; j++) {
          if (sessions[i].day === sessions[j].day) {
            const [s1, e1] = sessions[i].time.split('-').map(t => parseInt(t));
            const [s2, e2] = sessions[j].time.split('-').map(t => parseInt(t));
            if (s1 < e2 && s2 < e1) {
              conflicts.push({
                session1: `${sessions[i].subject} ${sessions[i].time}`,
                session2: `${sessions[j].subject} ${sessions[j].time}`
              });
            }
          }
        }
      }
      
      // Check for duplicates (same subject multiple times)
      const subjectCounts = {};
      sessions.forEach(s => {
        subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
      });
      const dupes = Object.entries(subjectCounts).filter(([_, count]) => count > 1);
      
      if (conflicts.length > 0) {
        studentConflicts.push({
          student: `${st.studentCode} ${st.lastName} ${st.firstName}`,
          conflicts: conflicts
        });
      }
      if (dupes.length > 0) {
        studentDuplicates.push({
          student: `${st.studentCode} ${st.lastName} ${st.firstName}`,
          duplicates: dupes.map(([subj, count]) => `${subj} (${count}×)`)
        });
      }
    });
    
    console.log(`   ❌ Student Conflicts: ${studentConflicts.length}`);
    if (studentConflicts.length > 0) {
      console.log("      First 5:");
      studentConflicts.slice(0, 5).forEach(c => {
        console.log(`      - ${c.student}: ${c.conflicts.length} conflicts`);
      });
    }
    console.log(`   ❌ Student Duplicate Placements: ${studentDuplicates.length}`);
    if (studentDuplicates.length > 0) {
      console.log("      First 5:");
      studentDuplicates.slice(0, 5).forEach(d => {
        console.log(`      - ${d.student}: ${d.duplicates.join(', ')}`);
      });
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
              conflicts.push({
                session1: `${sessions[i].groupName} ${sessions[i].subject} ${sessions[i].time}`,
                session2: `${sessions[j].groupName} ${sessions[j].subject} ${sessions[j].time}`
              });
            }
          }
        }
      }
      if (conflicts.length > 0) {
        teacherConflicts.push({ teacher: tName, conflicts: conflicts });
      }
    });
    
    console.log(`   ❌ Teacher Conflicts: ${teacherConflicts.length}`);
    if (teacherConflicts.length > 0) {
      console.log("      First 5:");
      teacherConflicts.slice(0, 5).forEach(c => {
        console.log(`      - ${c.teacher}: ${c.conflicts.length} conflicts`);
      });
    }
    
    // 3. Room Conflicts
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
              conflicts.push({
                session1: `${sessions[i].groupName} ${sessions[i].subject} ${sessions[i].time}`,
                session2: `${sessions[j].groupName} ${sessions[j].subject} ${sessions[j].time}`
              });
            }
          }
        }
      }
      if (conflicts.length > 0) {
        roomConflicts.push({ room: room.name, conflicts: conflicts });
      }
    });
    
    console.log(`   ❌ Room Conflicts: ${roomConflicts.length}`);
    if (roomConflicts.length > 0) {
      console.log("      First 3:");
      roomConflicts.slice(0, 3).forEach(c => {
        console.log(`      - ${c.room}: ${c.conflicts.length} conflicts`);
      });
    }
    
    // 4. Section Collisions (multiple sessions for same section at same time)
    const sectionCollisions = [];
    sections.forEach(sec => {
      const sessions = schedule.filter(s => s.sectionId === sec.id);
      const conflicts = [];
      for (let i = 0; i < sessions.length; i++) {
        for (let j = i + 1; j < sessions.length; j++) {
          if (sessions[i].day === sessions[j].day) {
            const [s1, e1] = sessions[i].time.split('-').map(t => parseInt(t));
            const [s2, e2] = sessions[j].time.split('-').map(t => parseInt(t));
            if (s1 < e2 && s2 < e1) {
              conflicts.push({
                session1: `${sessions[i].subject} ${sessions[i].time}`,
                session2: `${sessions[j].subject} ${sessions[j].time}`
              });
            }
          }
        }
      }
      if (conflicts.length > 0) {
        sectionCollisions.push({
          section: `${sec.name} - ${sec.subject} (${sec.grade})`,
          conflicts: conflicts
        });
      }
    });
    
    console.log(`   ❌ Section Collisions: ${sectionCollisions.length}`);
    
    // ============================================================
    // UNPLACED SESSIONS
    // ============================================================
    console.log("\n📋 UNPLACED SESSIONS:");
    
    const expectedSessions = {};
    students.forEach(st => {
      (st.enrollments || []).forEach(e => {
        const key = `${e.className}#${e.lessonName}`;
        if (!expectedSessions[key]) {
          expectedSessions[key] = {
            className: e.className,
            lessonName: e.lessonName,
            sectionId: e.sectionId,
            expectedHours: 2,
            scheduledHours: 0,
            studentCount: 0
          };
        }
        expectedSessions[key].studentCount++;
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
    console.log(`   Total Unplaced/Incomplete: ${unplaced.length} / ${Object.keys(expectedSessions).length}`);
    if (unplaced.length > 0) {
      console.log("   First 10:");
      unplaced.slice(0, 10).forEach(u => {
        console.log(`   - ${u.className} ${u.lessonName}: ${u.scheduledHours}/${u.expectedHours}h (${u.studentCount} students)`);
      });
    }
    
    // ============================================================
    // GAP STATISTICS
    // ============================================================
    console.log("\n📊 STUDENT GAP STATISTICS:");
    
    const studentGaps = [];
    students.forEach(st => {
      const sessions = schedule.filter(s => 
        (st.enrollments || []).some(e => e.className === s.groupName && e.lessonName === s.subject)
      );
      let totalGaps = 0;
      let maxGap = 0;
      ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].forEach(day => {
        const daySessions = sessions.filter(s => s.day === day)
          .map(s => {
            const [start, end] = s.time.split('-').map(t => parseInt(t));
            return { start, end };
          })
          .sort((a, b) => a.start - b.start);
        for (let i = 0; i < daySessions.length - 1; i++) {
          const gap = daySessions[i + 1].start - daySessions[i].end;
          if (gap > 0) {
            totalGaps += gap;
            maxGap = Math.max(maxGap, gap);
          }
        }
      });
      studentGaps.push({
        student: `${st.studentCode} ${st.lastName} ${st.firstName}`,
        totalGaps: totalGaps,
        maxGap: maxGap,
        sessionCount: sessions.length
      });
    });
    
    const studentsWithZeroGaps = studentGaps.filter(s => s.totalGaps === 0).length;
    const avgStudentGap = studentGaps.length > 0 
      ? (studentGaps.reduce((sum, s) => sum + s.totalGaps, 0) / studentGaps.length).toFixed(2)
      : 0;
    const maxStudentGap = studentGaps.length > 0 
      ? Math.max(...studentGaps.map(s => s.totalGaps))
      : 0;
    
    console.log(`   Students with zero gaps: ${studentsWithZeroGaps} / ${students.length} (${(studentsWithZeroGaps/students.length*100).toFixed(1)}%)`);
    console.log(`   Average gap: ${avgStudentGap} hours`);
    console.log(`   Maximum gap: ${maxStudentGap} hours`);
    
    console.log("\n   📉 Top 10 Worst Student Schedules (by total gaps):");
    const worstStudents = [...studentGaps].sort((a, b) => b.totalGaps - a.totalGaps).slice(0, 10);
    worstStudents.forEach((s, idx) => {
      console.log(`   ${idx + 1}. ${s.student}: ${s.totalGaps}h total gaps, ${s.maxGap}h max gap (${s.sessionCount} sessions)`);
    });
    
    console.log("\n📊 TEACHER GAP STATISTICS:");
    
    const teacherGaps = [];
    teachers.forEach(t => {
      const tName = `${t.lastName} ${t.firstName}`;
      const sessions = schedule.filter(s => s.teacher === tName);
      let totalGaps = 0;
      let maxGap = 0;
      ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"].forEach(day => {
        const daySessions = sessions.filter(s => s.day === day)
          .map(s => {
            const [start, end] = s.time.split('-').map(t => parseInt(t));
            return { start, end };
          })
          .sort((a, b) => a.start - b.start);
        for (let i = 0; i < daySessions.length - 1; i++) {
          const gap = daySessions[i + 1].start - daySessions[i].end;
          if (gap > 0) {
            totalGaps += gap;
            maxGap = Math.max(maxGap, gap);
          }
        }
      });
      teacherGaps.push({
        teacher: tName,
        totalGaps: totalGaps,
        maxGap: maxGap,
        sessionCount: sessions.length
      });
    });
    
    const avgTeacherGap = teacherGaps.length > 0 
      ? (teacherGaps.reduce((sum, t) => sum + t.totalGaps, 0) / teacherGaps.length).toFixed(2)
      : 0;
    const maxTeacherGap = teacherGaps.length > 0 
      ? Math.max(...teacherGaps.map(t => t.totalGaps))
      : 0;
    
    console.log(`   Average gap: ${avgTeacherGap} hours`);
    console.log(`   Maximum gap: ${maxTeacherGap} hours`);
    
    console.log("\n   📉 Top 10 Worst Teacher Schedules (by total gaps):");
    const worstTeachers = [...teacherGaps].sort((a, b) => b.totalGaps - a.totalGaps).slice(0, 10);
    worstTeachers.forEach((t, idx) => {
      console.log(`   ${idx + 1}. ${t.teacher}: ${t.totalGaps}h total gaps, ${t.maxGap}h max gap (${t.sessionCount} sessions)`);
    });
    
    // ============================================================
    // BOTTLENECKS
    // ============================================================
    console.log("\n🔧 BOTTLENECKS DISCOVERED:");
    
    const bottlenecks = [];
    
    // Bottleneck 1: Oversubscribed sections
    const oversubscribed = [];
    sections.forEach(sec => {
      const enrolled = students.filter(st => 
        (st.enrollments || []).some(e => e.sectionId === sec.id)
      ).length;
      if (enrolled > sec.maxStudents) {
        oversubscribed.push({
          section: `${sec.name} - ${sec.subject} (${sec.grade})`,
          enrolled: enrolled,
          capacity: sec.maxStudents,
          overflow: enrolled - sec.maxStudents
        });
      }
    });
    if (oversubscribed.length > 0) {
      bottlenecks.push(`Oversubscribed sections: ${oversubscribed.length}`);
      console.log(`   ⚠️  Oversubscribed Sections: ${oversubscribed.length}`);
      oversubscribed.slice(0, 5).forEach(o => {
        console.log(`      - ${o.section}: ${o.enrolled}/${o.capacity} (+${o.overflow})`);
      });
    }
    
    // Bottleneck 2: Teacher overload
    const overloadedTeachers = teacherGaps.filter(t => t.sessionCount > 15);
    if (overloadedTeachers.length > 0) {
      bottlenecks.push(`Overloaded teachers: ${overloadedTeachers.length}`);
      console.log(`   ⚠️  Overloaded Teachers (>15 sessions): ${overloadedTeachers.length}`);
      overloadedTeachers.slice(0, 5).forEach(t => {
        console.log(`      - ${t.teacher}: ${t.sessionCount} sessions`);
      });
    }
    
    // Bottleneck 3: Limited availability overlap
    const limitedAvailability = students.filter(st => 
      (st.availability || []).length < 3
    ).length;
    if (limitedAvailability > 0) {
      bottlenecks.push(`Students with limited availability: ${limitedAvailability}`);
      console.log(`   ⚠️  Students with Limited Availability (<3 days): ${limitedAvailability}`);
    }
    
    if (bottlenecks.length === 0) {
      console.log("   ✅ No major bottlenecks detected");
    }
    
    // ============================================================
    // SUMMARY TABLE
    // ============================================================
    console.log("\n" + "=".repeat(70));
    console.log("📊 SUMMARY TABLE");
    console.log("=".repeat(70));
    
    const summary = {
      "Dataset": {
        "Students": students.length,
        "Teachers": teachers.length,
        "Sections": sections.length,
        "Rooms": rooms.length,
        "Lessons": lessons.length
      },
      "Performance": {
        "Runtime": `${duration}s`,
        "Memory": `${memoryUsed}MB`,
        "Sessions Scheduled": schedule.length
      },
      "Conflicts": {
        "Student Conflicts": studentConflicts.length,
        "Student Duplicates": studentDuplicates.length,
        "Teacher Conflicts": teacherConflicts.length,
        "Room Conflicts": roomConflicts.length,
        "Section Collisions": sectionCollisions.length
      },
      "Unplaced": {
        "Incomplete Sessions": unplaced.length,
        "Total Expected": Object.keys(expectedSessions).length,
        "Completion Rate": `${((1 - unplaced.length / Object.keys(expectedSessions).length) * 100).toFixed(1)}%`
      },
      "Student Gaps": {
        "Zero Gaps": `${studentsWithZeroGaps} (${(studentsWithZeroGaps/students.length*100).toFixed(1)}%)`,
        "Average": `${avgStudentGap}h`,
        "Maximum": `${maxStudentGap}h`
      },
      "Teacher Gaps": {
        "Average": `${avgTeacherGap}h`,
        "Maximum": `${maxTeacherGap}h`
      },
      "Bottlenecks": bottlenecks.length > 0 ? bottlenecks : ["None detected"]
    };
    
    console.table(summary);
    
    console.log("\n" + "=".repeat(70));
    console.log("✅ STRESS TEST COMPLETE");
    console.log("=".repeat(70));
    
    return {
      summary,
      worstStudents,
      worstTeachers,
      conflicts: {
        students: studentConflicts,
        teachers: teacherConflicts,
        rooms: roomConflicts,
        sections: sectionCollisions
      },
      unplaced,
      bottlenecks
    };
  };
  
  console.log("\n✅ Stress test setup complete!");
  console.log("📝 Next steps:");
  console.log("   1. Click 'Generate Schedule' in the UI");
  console.log("   2. Wait for completion");
  console.log("   3. Run: analyzeSchedulerResults()");
  
})();
