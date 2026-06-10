export type Student = {
  id: string;
  fullName: string;
  grade: string;
  course: string;
  parentName: string;
  status: string;
  email: string;
  phone: string;
};


export type Teacher = {
  id: string;
  fullName: string;
  subject: string;
  availability: string;
  maxHoursPerDay: number;
  email: string;
  phone: string;
};
export type Course = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  duration: string;
  seats: number;
};

export type AttendanceRecord = {
  id: string;
  student: string;
  course: string;
  date: string;
  status: "Παρών" | "Απών" | "Αργοπορημένος";
};

export type PaymentRecord = {
  id: string;
  student: string;
  amount: string;
  dueDate: string;
  status: "Εξοφλημένο" | "Εκκρεμεί" | "Καθυστερημένο";
};

export type ParentContact = {
  id: string;
  parentName: string;
  student: string;
  relationship: string;
  email: string;
  phone: string;
};

export type ScheduleSlot = {
  id: string;
  day: string;
  time: string;
  course: string;
  teacher: string;
  room: string;
};

export type TeacherAvailability = {
  id: string;
  teacherId: string;
  teacherName: string;
  day: string;
  time: string;
};

export type Classroom = {
  id: string;
  name: string;
  capacity: number;
};

export const dashboardStats = [
  { title: "Μαθητές", value: "245" },
  { title: "Καθηγητές", value: "18" },
  { title: "Ενεργά Μαθήματα", value: "32" },
  { title: "Μηνιαία Έσοδα", value: "€12,450" },
];

export const sampleStudents: Student[] = [
  {
    id: "stu_1",
    fullName: "Γιάννης Παπαδόπουλος",
    grade: "Γ Λυκείου",
    course: "Μαθηματικά",
    parentName: "Ανδρέας Παπαδόπουλος",
    status: "active",
    email: "giannis@example.com",
    phone: "+30 694 123 4567",
  },
  {
    id: "stu_2",
    fullName: "Μαρία Κωνσταντίνου",
    grade: "Β Λυκείου",
    course: "Φυσική",
    parentName: "Ελένη Κωνσταντίνου",
    status: "active",
    email: "maria@example.com",
    phone: "+30 697 234 5678",
  },
  {
    id: "stu_3",
    fullName: "Νίκος Γεωργίου",
    grade: "Α Λυκείου",
    course: "Έκθεση",
    parentName: "Χρήστος Γεωργίου",
    status: "active",
    email: "nikos@example.com",
    phone: "+30 698 345 6789",
  },
];

export const sampleTeachers: Teacher[] = [
  {
    id: "tea_1",
    fullName: "Ελένη Παπαδοπούλου",
    subject: "Μαθηματικά",
    availability: "Τρίτη, Πέμπτη, Σάββατο",
      maxHoursPerDay: 5,
    email: "eleni@example.com",
    phone: "+30 210 123 4567",
  },
  {
    id: "tea_2",
    fullName: "Κωνσταντίνος Βασιλείου",
    subject: "Φυσική",
    availability: "Δευτέρα, Τετάρτη, Παρασκευή",
      maxHoursPerDay: 5,
    email: "konstantinos@example.com",
    phone: "+30 210 234 5678",
  },
];

export const sampleCourses: Course[] = [
  {
    id: "course_1",
    title: "Εφαρμοσμένα Μαθηματικά",
    subject: "Μαθηματικά",
    teacher: "Ελένη Παπαδοπούλου",
    duration: "12 εβδομάδες",
    seats: 10,
  },
  {
    id: "course_2",
    title: "Προχωρημένη Φυσική",
    subject: "Φυσική",
    teacher: "Κωνσταντίνος Βασιλείου",
    duration: "10 εβδομάδες",
    seats: 8,
  },
  {
    id: "course_3",
    title: "Αρχαία Ελληνικά",
    subject: "Φιλολογικά",
    teacher: "Μαρία Δημητρίου",
    duration: "9 εβδομάδες",
    seats: 12,
  },
  {
    id: "course_4",
    title: "Νεοελληνική Γλώσσα",
    subject: "Έκθεση",
    teacher: "Γιώργος Παπαδάκης",
    duration: "12 εβδομάδες",
    seats: 15,
  },
  {
    id: "course_5",
    title: "Χημεία Γ' Λυκείου",
    subject: "Χημεία",
    teacher: "Άννα Σταθοπούλου",
    duration: "11 εβδομάδες",
    seats: 10,
  },
  {
    id: "course_6",
    title: "Βιολογία",
    subject: "Βιολογία",
    teacher: "Δημήτρης Καραγιάννης",
    duration: "10 εβδομάδες",
    seats: 14,
  },
  {
    id: "course_7",
    title: "Πληροφορική ΑΕΠΠ",
    subject: "Πληροφορική",
    teacher: "Νίκος Γεωργίου",
    duration: "14 εβδομάδες",
    seats: 16,
  },
  {
    id: "course_8",
    title: "Οικονομία",
    subject: "ΑΟΘ",
    teacher: "Σοφία Παπαδοπούλου",
    duration: "10 εβδομάδες",
    seats: 10,
  },
];

export const sampleAttendance: AttendanceRecord[] = [
  {
    id: "att_1",
    student: "Γιάννης Παπαδόπουλος",
    course: "Μαθηματικά",
    date: "2026-06-06",
    status: "Παρών",
  },
  {
    id: "att_2",
    student: "Μαρία Κωνσταντίνου",
    course: "Φυσική",
    date: "2026-06-06",
    status: "Απών",
  },
  {
    id: "att_3",
    student: "Νίκος Γεωργίου",
    course: "Έκθεση",
    date: "2026-06-06",
    status: "Αργοπορημένος",
  },
];

export const samplePayments: PaymentRecord[] = [
  {
    id: "pay_1",
    student: "Γιάννης Παπαδόπουλος",
    amount: "€140",
    dueDate: "2026-06-14",
    status: "Εκκρεμεί",
  },
  {
    id: "pay_2",
    student: "Μαρία Κωνσταντίνου",
    amount: "€160",
    dueDate: "2026-06-10",
    status: "Εξοφλημένο",
  },
  {
    id: "pay_3",
    student: "Νίκος Γεωργίου",
    amount: "€130",
    dueDate: "2026-06-12",
    status: "Καθυστερημένο",
  },
];

export const sampleParents: ParentContact[] = [
  {
    id: "parent_1",
    parentName: "Ανδρέας Παπαδόπουλος",
    student: "Γιάννης Παπαδόπουλος",
    relationship: "Πατέρας",
    email: "andreas@example.com",
    phone: "+30 694 123 4568",
  },
  {
    id: "parent_2",
    parentName: "Ελένη Κωνσταντίνου",
    student: "Μαρία Κωνσταντίνου",
    relationship: "Μητέρα",
    email: "eleni.parent@example.com",
    phone: "+30 697 234 5679",
  },
];

export const sampleSchedule: ScheduleSlot[] = [
  {
    id: "slot_1",
    day: "Δευτέρα",
    time: "09:00",
    course: "Εφαρμοσμένα Μαθηματικά",
    teacher: "Ελένη Παπαδοπούλου",
    room: "Αίθουσα Α",
  },
  {
    id: "slot_2",
    day: "Τετάρτη",
    time: "11:00",
    course: "Προχωρημένη Φυσική",
    teacher: "Κωνσταντίνος Βασιλείου",
    room: "Αίθουσα Β",
  },
];

export const sampleTeacherAvailability: TeacherAvailability[] = [
  {
    id: "avail_1",
    teacherId: "tea_1",
    teacherName: "Ελένη Παπαδοπούλου",
    day: "Δευτέρα",
    time: "09:00",
  },
  {
    id: "avail_2",
    teacherId: "tea_1",
    teacherName: "Ελένη Παπαδοπούλου",
    day: "Τετάρτη",
    time: "11:00",
  },
  {
    id: "avail_3",
    teacherId: "tea_2",
    teacherName: "Κωνσταντίνος Βασιλείου",
    day: "Τρίτη",
    time: "10:00",
  },
  {
    id: "avail_4",
    teacherId: "tea_2",
    teacherName: "Κωνσταντίνος Βασιλείου",
    day: "Πέμπτη",
    time: "15:00",
  },
];

export const sampleClassrooms: Classroom[] = [
  { id: "room_1", name: "Αίθουσα Α", capacity: 16 },
  { id: "room_2", name: "Αίθουσα Β", capacity: 12 },
  { id: "room_3", name: "Αίθουσα Γ", capacity: 10 },
];
