import { supabase, supabaseKey, supabaseUrl } from "./supabase";
import {
  Classroom,
  Course,
  ParentContact,
  ScheduleSlot,
  Student,
  Teacher,
  TeacherAvailability,
  AttendanceRecord,
  sampleAttendance,
  sampleClassrooms,
  sampleCourses,
  sampleParents,
  samplePayments,
  sampleSchedule,
  sampleStudents,
  sampleTeachers,
  sampleTeacherAvailability,
} from "./data";

const hasSupabase = Boolean(supabaseUrl && supabaseKey);
let localStudents = [...sampleStudents];
let localTeachers = [...sampleTeachers];
let localCourses = [...sampleCourses];
let localSchedule = [...sampleSchedule];
let localClassrooms = [...sampleClassrooms];
let localTeacherAvailability = [...sampleTeacherAvailability];

export async function initDatabase() {
  if (!hasSupabase) {
    return false;
  }

  try {
    const response = await fetch("/api/db/init", { method: "POST" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchStudents(): Promise<Student[]> {
  if (!hasSupabase) {
    return [...localStudents];
  }

  const { data, error } = await supabase.from("students").select("*").order("fullName");
  return error || !data ? [...localStudents] : data;
}

export async function searchStudents(term: string): Promise<Student[]> {
  if (!hasSupabase) {
    const normalized = term.trim().toLowerCase();
    return localStudents.filter((student) =>
      student.fullName.toLowerCase().includes(normalized) ||
      student.course.toLowerCase().includes(normalized) ||
      student.parentName.toLowerCase().includes(normalized)
    );
  }

  const { data, error } = await supabase
    .from<Student>("students")
    .select("*")
    .or(`fullName.ilike.%${term}%,course.ilike.%${term}%,parentName.ilike.%${term}%`);

  return error || !data ? [...localStudents] : data;
}

export async function createStudent(student: Student): Promise<Student> {
  if (!hasSupabase) {
    localStudents.unshift(student);
    return student;
  }

  const { data, error } = await supabase.from("students").insert(student).select().single();
  return error || !data ? student : data;
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
  if (!hasSupabase) {
    const index = localStudents.findIndex((student) => student.id === id);
    if (index < 0) {
      return null;
    }

    localStudents[index] = { ...localStudents[index], ...updates };
    return localStudents[index];
  }

  const { data, error } = await supabase.from("students").update(updates).eq("id", id).select().single();
  return error || !data ? null : data;
}

export async function deleteStudent(id: string): Promise<boolean> {
  if (!hasSupabase) {
    localStudents = localStudents.filter((student) => student.id !== id);
    return true;
  }

  const { error } = await supabase.from("students").delete().eq("id", id);
  return !error;
}

export async function fetchTeachers(): Promise<Teacher[]> {
  if (!hasSupabase) {
    return [...localTeachers];
  }

  const { data, error } = await supabase.from("teachers").select("*").order("fullName");
  return error || !data ? [...localTeachers] : data;
}

export async function createTeacher(teacher: Teacher): Promise<Teacher> {
  if (!hasSupabase) {
    localTeachers.unshift(teacher);
    return teacher;
  }

  const { data, error } = await supabase.from("teachers").insert(teacher).select().single();
  return error || !data ? teacher : data;
}

export async function updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | null> {
  if (!hasSupabase) {
    const index = localTeachers.findIndex((teacher) => teacher.id === id);
    if (index < 0) {
      return null;
    }

    localTeachers[index] = { ...localTeachers[index], ...updates };
    return localTeachers[index];
  }

  const { data, error } = await supabase.from("teachers").update(updates).eq("id", id).select().single();
  return error || !data ? null : data;
}

export async function deleteTeacher(id: string): Promise<boolean> {
  if (!hasSupabase) {
    localTeachers = localTeachers.filter((teacher) => teacher.id !== id);
    return true;
  }

  const { error } = await supabase.from("teachers").delete().eq("id", id);
  return !error;
}

export async function fetchCourses(): Promise<Course[]> {
  if (!hasSupabase) {
    return [...localCourses];
  }

  const { data, error } = await supabase.from("courses").select("*").order("title");
  return error || !data ? [...localCourses] : data;
}

export async function createCourse(course: Course): Promise<Course> {
  if (!hasSupabase) {
    localCourses.unshift(course);
    return course;
  }

  const { data, error } = await supabase.from("courses").insert(course).select().single();
  return error || !data ? course : data;
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
  if (!hasSupabase) {
    const index = localCourses.findIndex((course) => course.id === id);
    if (index < 0) {
      return null;
    }

    localCourses[index] = { ...localCourses[index], ...updates };
    return localCourses[index];
  }

  const { data, error } = await supabase.from("courses").update(updates).eq("id", id).select().single();
  return error || !data ? null : data;
}

export async function deleteCourse(id: string): Promise<boolean> {
  if (!hasSupabase) {
    localCourses = localCourses.filter((course) => course.id !== id);
    return true;
  }

  const { error } = await supabase.from("courses").delete().eq("id", id);
  return !error;
}

export async function assignTeacherToCourse(courseId: string, teacher: string): Promise<Course | null> {
  return updateCourse(courseId, { teacher });
}

export async function fetchClassrooms(): Promise<Classroom[]> {
  if (!hasSupabase) {
    return [...localClassrooms];
  }

  const { data, error } = await supabase.from("classrooms").select("*").order("name");
  return error || !data ? [...localClassrooms] : data;
}

export async function fetchTeacherAvailability(): Promise<TeacherAvailability[]> {
  if (!hasSupabase) {
    return [...localTeacherAvailability];
  }

  const { data, error } = await supabase
    .from<TeacherAvailability>("teachers_availability")
    .select("*")
    .order("teacherName")
    .order("day")
    .order("time");
  return error || !data ? [...localTeacherAvailability] : data;
}

export async function fetchSchedule(): Promise<ScheduleSlot[]> {
  if (!hasSupabase) {
    return [...localSchedule];
  }

  const { data, error } = await supabase
    .from<ScheduleSlot>("schedules")
    .select("*")
    .order("day")
    .order("time");
  return error || !data ? [...localSchedule] : data;
}

export async function saveSchedule(slots: ScheduleSlot[]): Promise<ScheduleSlot[]> {
  if (!hasSupabase) {
    localSchedule = slots.map((slot) => ({ ...slot }));
    return [...localSchedule];
  }

  const { error: deleteError } = await supabase.from("schedules").delete().neq("id", "");
  if (deleteError) {
    throw deleteError;
  }

  const { data, error } = await supabase.from("schedules").insert(slots).select();
  if (error || !data) {
    throw error ?? new Error("Unable to save generated schedule");
  }

  return data;
}
export async function fetchAttendance() {
  return [...sampleAttendance];
}

export async function updateAttendance(id: string, status: string) {
  return sampleAttendance.find((r) => r.id === id) ?? null;
}

export async function fetchPayments() {
  return [...samplePayments];
}

export async function createPayment(payment: PaymentRecord) {
  return payment;
}

export async function fetchParents() {
  return [...sampleParents];
}
