export type Student = {
  id: string;
  fullName: string;
  grade: string;
  course: string;
  parentName: string;
  status: "active" | "inactive";
  email: string;
  phone: string;
};

export type Teacher = {
  id: string;
  fullName: string;
  subject: string;
  availability: string;
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
  status: "Present" | "Absent" | "Late";
};

export type PaymentRecord = {
  id: string;
  student: string;
  amount: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
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
  { title: "Students", value: "245" },
  { title: "Teachers", value: "18" },
  { title: "Active Courses", value: "32" },
  { title: "Monthly Revenue", value: "€12,450" },
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
    availability: "Tue, Thu, Sat",
    email: "eleni@example.com",
    phone: "+30 210 123 4567",
  },
  {
    id: "tea_2",
    fullName: "Κωνσταντίνος Βασιλείου",
    subject: "Φυσική",
    availability: "Mon, Wed, Fri",
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
    duration: "12 weeks",
    seats: 10,
  },
  {
    id: "course_2",
    title: "Προχωρημένη Φυσική",
    subject: "Φυσική",
    teacher: "Κωνσταντίνος Βασιλείου",
    duration: "10 weeks",
    seats: 8,
  },
];

export const sampleAttendance: AttendanceRecord[] = [
  {
    id: "att_1",
    student: "Γιάννης Παπαδόπουλος",
    course: "Μαθηματικά",
    date: "2026-06-06",
    status: "Present",
  },
  {
    id: "att_2",
    student: "Μαρία Κωνσταντίνου",
    course: "Φυσική",
    date: "2026-06-06",
    status: "Absent",
  },
  {
    id: "att_3",
    student: "Νίκος Γεωργίου",
    course: "Έκθεση",
    date: "2026-06-06",
    status: "Late",
  },
];

export const samplePayments: PaymentRecord[] = [
  {
    id: "pay_1",
    student: "Γιάννης Παπαδόπουλος",
    amount: "€140",
    dueDate: "2026-06-14",
    status: "Pending",
  },
  {
    id: "pay_2",
    student: "Μαρία Κωνσταντίνου",
    amount: "€160",
    dueDate: "2026-06-10",
    status: "Paid",
  },
  {
    id: "pay_3",
    student: "Νίκος Γεωργίου",
    amount: "€130",
    dueDate: "2026-06-12",
    status: "Overdue",
  },
];

export const sampleParents: ParentContact[] = [
  {
    id: "parent_1",
    parentName: "Ανδρέας Παπαδόπουλος",
    student: "Γιάννης Παπαδόπουλος",
    relationship: "Father",
    email: "andreas@example.com",
    phone: "+30 694 123 4568",
  },
  {
    id: "parent_2",
    parentName: "Ελένη Κωνσταντίνου",
    student: "Μαρία Κωνσταντίνου",
    relationship: "Mother",
    email: "eleni.parent@example.com",
    phone: "+30 697 234 5679",
  },
];

export const sampleSchedule: ScheduleSlot[] = [
  {
    id: "slot_1",
    day: "Monday",
    time: "09:00",
    course: "Εφαρμοσμένα Μαθηματικά",
    teacher: "Ελένη Παπαδοπούλου",
    room: "Room A",
  },
  {
    id: "slot_2",
    day: "Wednesday",
    time: "11:00",
    course: "Προχωρημένη Φυσική",
    teacher: "Κωνσταντίνος Βασιλείου",
    room: "Room B",
  },
];

export const sampleTeacherAvailability: TeacherAvailability[] = [
  {
    id: "avail_1",
    teacherId: "tea_1",
    teacherName: "Ελένη Παπαδοπούλου",
    day: "Monday",
    time: "09:00",
  },
  {
    id: "avail_2",
    teacherId: "tea_1",
    teacherName: "Ελένη Παπαδοπούλου",
    day: "Wednesday",
    time: "11:00",
  },
  {
    id: "avail_3",
    teacherId: "tea_2",
    teacherName: "Κωνσταντίνος Βασιλείου",
    day: "Tuesday",
    time: "10:00",
  },
  {
    id: "avail_4",
    teacherId: "tea_2",
    teacherName: "Κωνσταντίνος Βασιλείου",
    day: "Thursday",
    time: "15:00",
  },
];

export const sampleClassrooms: Classroom[] = [
  { id: "room_1", name: "Room A", capacity: 16 },
  { id: "room_2", name: "Room B", capacity: 12 },
  { id: "room_3", name: "Room C", capacity: 10 },
];
