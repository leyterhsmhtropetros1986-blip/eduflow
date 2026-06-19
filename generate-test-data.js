#!/usr/bin/env node

/**
 * EduFlow Test Data Generator
 * Generates realistic tutoring center data for business logic validation
 */

const fs = require('fs');

// Greek first names
const firstNames = [
  "Γιώργος", "Μαρία", "Δημήτρης", "Ελένη", "Νίκος", "Κατερίνα", "Κώστας", "Σοφία",
  "Παναγιώτης", "Αννα", "Ιωάννης", "Χριστίνα", "Αντώνης", "Βασιλική", "Μιχάλης", "Δέσποινα",
  "Θανάσης", "Ειρήνη", "Σπύρος", "Μαρίνα", "Γιάννης", "Αλεξάνδρα", "Πέτρος", "Φωτεινή",
  
  "Στέλιος", "Ευαγγελία", "Χρήστος", "Παρασκευή", "Βασίλης", "Ολυμπία"
];

const lastNames = [
  "Παπαδόπουλος", "Γεωργίου", "Δημητρίου", "Νικολάου", "Κωνσταντίνου", "Ιωάννου",
  "Παναγιώτου", "Χριστοδούλου", "Αντωνίου", "Μιχαήλ", "Θεοδώρου", "Αθανασίου",
  "Σπυρίδου", "Πέτρου", "Στυλιανού", "Χαραλάμπους", "Βασιλείου", "Ανδρέου",
  "Σάββα", "Κυριάκου", "Ευαγγέλου", "Αποστόλου", "Μάρκου", "Λουκά"
];

// Subjects for Greek tutoring center
const subjects = [
  { name: "Μαθηματικά", weeklyHours: 4, distribution: [2, 2] },
  { name: "Φυσική", weeklyHours: 3, distribution: [2, 1] },
  { name: "Χημεία", weeklyHours: 3, distribution: [2, 1] },
  { name: "Βιολογία", weeklyHours: 2, distribution: [2] },
  { name: "Αρχαία Ελληνικά", weeklyHours: 3, distribution: [2, 1] },
  { name: "Νέα Ελληνικά", weeklyHours: 2, distribution: [2] },
  { name: "Ιστορία", weeklyHours: 2, distribution: [2] },
  { name: "Αγγλικά", weeklyHours: 2, distribution: [2] }
];

// Grades
const grades = ["Α Γυμνασίου", "Β Γυμνασίου", "Γ Γυμνασίου", "Α Λυκείου", "Β Λυκείου", "Γ Λυκείου"];

// Classrooms
const rooms = [
  { id: "room-1", name: "Αίθουσα 1", capacity: 20 },
  { id: "room-2", name: "Αίθουσα 2", capacity: 20 },
  { id: "room-3", name: "Αίθουσα 3", capacity: 15 },
  { id: "room-4", name: "Αίθουσα 4", capacity: 15 },
  { id: "room-5", name: "Εργαστήριο Φυσικής", capacity: 12 },
  { id: "room-6", name: "Εργαστήριο Χημείας", capacity: 12 },
  { id: "room-7", name: "Αίθουσα Πληροφορικής", capacity: 18 }
];

// Generate random name
function randomName() {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { firstName: first, lastName: last };
}

// Generate phone number
function randomPhone() {
  return `69${Math.floor(10000000 + Math.random() * 90000000)}`;
}

// Generate email
function generateEmail(firstName, lastName) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.gr`;
}

// Generate 18 teachers (3 per main subject, 2 for others)
function generateTeachers() {
  const teachers = [];
  const subjectTeacherCount = {
    "Μαθηματικά": 3,
    "Φυσική": 3,
    "Χημεία": 2,
    "Βιολογία": 2,
    "Αρχαία Ελληνικά": 2,
    "Νέα Ελληνικά": 2,
    "Ιστορία": 2,
    "Αγγλικά": 2
  };

  let id = 1;
  for (const [subject, count] of Object.entries(subjectTeacherCount)) {
    for (let i = 0; i < count; i++) {
      const { firstName, lastName } = randomName();
      teachers.push({
        id: `teacher-${id}`,
        firstName,
        lastName,
        subject,
        subjects: [subject],
        phone: randomPhone(),
        email: generateEmail(firstName, lastName),
        availability: [
          { day: "Δευτέρα", slots: ["15:00-17:00", "17:00-19:00", "19:00-21:00"] },
          { day: "Τρίτη", slots: ["15:00-17:00", "17:00-19:00", "19:00-21:00"] },
          { day: "Τετάρτη", slots: ["15:00-17:00", "17:00-19:00", "19:00-21:00"] },
          { day: "Πέμπτη", slots: ["15:00-17:00", "17:00-19:00", "19:00-21:00"] },
          { day: "Παρασκευή", slots: ["15:00-17:00", "17:00-19:00", "19:00-21:00"] }
        ],
        preferredSections: []
      });
      id++;
    }
  }

  return teachers;
}

// Generate 40 sections (classes)
// Distribution: 6-7 sections per grade, 5-6 students per section per subject
function generateSections() {
  const sections = [];
  const sectionNames = ["Α1", "Α2", "Β1", "Β2", "Γ1", "Γ2", "Γ3"];
  
  let id = 1;
  for (const grade of grades) {
    const numSections = grade.includes("Γ Λυκείου") ? 7 : 6;
    for (let i = 0; i < numSections; i++) {
      sections.push({
        id: `class-${id}`,
        name: sectionNames[i],
        className: sectionNames[i],
        grade: grade,
        maxStudents: 6,
        capacity: 6,
        subject: null // Will be assigned per subject
      });
      id++;
    }
  }

  return sections;
}

// Generate 120 students
// 20 students per grade, distributed across sections
function generateStudents(sections) {
  const students = [];
  const studentsPerGrade = 20;
  
  let id = 1;
  for (const grade of grades) {
    const gradeSections = sections.filter(s => s.grade === grade);
    
    for (let i = 0; i < studentsPerGrade; i++) {
      const { firstName, lastName } = randomName();
      const parentName = randomName();
      
      // Assign to sections for each subject
      const enrollments = [];
      for (const subject of subjects) {
        // Distribute students evenly across sections
        const sectionIndex = i % gradeSections.length;
        const section = gradeSections[sectionIndex];
        
        enrollments.push({
          lessonName: subject.name,
          className: section.name,
          weeklyHours: subject.weeklyHours
        });
      }
      
      students.push({
        id: `student-${id}`,
        firstName,
        lastName,
        grade,
        parentName: `${parentName.firstName} ${parentName.lastName}`,
        parentEmail: generateEmail(parentName.firstName, parentName.lastName),
        phone: randomPhone(),
        email: generateEmail(firstName, lastName),
        enrollments,
        attendanceDays: ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή"]
      });
      id++;
    }
  }

  return students;
}

// Generate complete dataset
function generateDataset() {
  console.log("🎓 Generating EduFlow Test Dataset...\n");
  
  const teachers = generateTeachers();
  const sections = generateSections();
  const students = generateStudents(sections);
  
  const dataset = {
    teachers,
    classes: sections,
    students,
    lessons: subjects,
    rooms,
    schools: ["Φροντιστήριο Επιτυχία"],
    metadata: {
      generated: new Date().toISOString(),
      totalTeachers: teachers.length,
      totalStudents: students.length,
      totalSections: sections.length,
      totalRooms: rooms.length,
      totalSubjects: subjects.length
    }
  };
  
  // Statistics
  console.log("📊 Dataset Statistics:");
  console.log(`   Teachers: ${teachers.length}`);
  console.log(`   Students: ${students.length}`);
  console.log(`   Sections: ${sections.length}`);
  console.log(`   Rooms: ${rooms.length}`);
  console.log(`   Subjects: ${subjects.length}`);
  console.log(`   Grades: ${grades.length}`);
  
  // Subject distribution
  console.log("\n📚 Teachers per Subject:");
  const teachersBySubject = {};
  teachers.forEach(t => {
    teachersBySubject[t.subject] = (teachersBySubject[t.subject] || 0) + 1;
  });
  Object.entries(teachersBySubject).forEach(([subject, count]) => {
    console.log(`   ${subject}: ${count} teachers`);
  });
  
  // Students per grade
  console.log("\n👥 Students per Grade:");
  const studentsByGrade = {};
  students.forEach(s => {
    studentsByGrade[s.grade] = (studentsByGrade[s.grade] || 0) + 1;
  });
  Object.entries(studentsByGrade).forEach(([grade, count]) => {
    console.log(`   ${grade}: ${count} students`);
  });
  
  // Total enrollments
  const totalEnrollments = students.reduce((sum, s) => sum + s.enrollments.length, 0);
  console.log(`\n📝 Total Enrollments: ${totalEnrollments}`);
  console.log(`   Average per student: ${(totalEnrollments / students.length).toFixed(1)}`);
  
  return dataset;
}

// Main execution
const dataset = generateDataset();

// Save to file
const outputPath = './test-dataset.json';
fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2));

console.log(`\n✅ Dataset saved to: ${outputPath}`);
console.log("\n📋 Next steps:");
console.log("   1. Import data into EduFlow");
console.log("   2. Run scheduler");
console.log("   3. Validate timetable");
console.log("   4. Check for conflicts\n");
