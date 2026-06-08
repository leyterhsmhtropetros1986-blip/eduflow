import { NextResponse } from "next/server";
import { Client } from "pg";

const databaseUrl = process.env.SUPABASE_DATABASE_URL;

async function createPostgresClient() {
  if (!databaseUrl) {
    throw new Error("Missing SUPABASE_DATABASE_URL environment variable.");
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  return client;
}

async function createTables(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS students (
      id text PRIMARY KEY,
      "fullName" text NOT NULL,
      grade text,
      course text,
      "parentName" text,
      status text,
      email text,
      phone text
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id text PRIMARY KEY,
      "fullName" text NOT NULL,
      subject text,
      availability text,
      email text,
      phone text
    );

    CREATE TABLE IF NOT EXISTS courses (
      id text PRIMARY KEY,
      title text NOT NULL,
      subject text,
      teacher text,
      duration text,
      seats integer
    );

    CREATE TABLE IF NOT EXISTS teachers_availability (
      id text PRIMARY KEY,
      "teacherId" text,
      "teacherName" text,
      day text,
      time text
    );

    CREATE TABLE IF NOT EXISTS classrooms (
      id text PRIMARY KEY,
      name text NOT NULL,
      capacity integer
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id text PRIMARY KEY,
      day text,
      time text,
      course text,
      teacher text,
      room text,
      "createdAt" timestamptz DEFAULT now()
    );
  `);
}

async function seedSampleData(client: Client) {
  await client.query(`
    INSERT INTO teachers (id, "fullName", subject, availability, email, phone)
    SELECT 'tea_1', 'Ελένη Παπαδοπούλου', 'Μαθηματικά', 'Tue, Thu, Sat', 'eleni@example.com', '+30 210 123 4567'
    WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE id = 'tea_1');

    INSERT INTO teachers (id, "fullName", subject, availability, email, phone)
    SELECT 'tea_2', 'Κωνσταντίνος Βασιλείου', 'Φυσική', 'Mon, Wed, Fri', 'konstantinos@example.com', '+30 210 234 5678'
    WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE id = 'tea_2');

    INSERT INTO courses (id, title, subject, teacher, duration, seats)
    SELECT 'course_1', 'Εφαρμοσμένα Μαθηματικά', 'Μαθηματικά', 'Ελένη Παπαδοπούλου', '12 weeks', 10
    WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'course_1');

    INSERT INTO courses (id, title, subject, teacher, duration, seats)
    SELECT 'course_2', 'Προχωρημένη Φυσική', 'Φυσική', 'Κωνσταντίνος Βασιλείου', '10 weeks', 8
    WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'course_2');

    INSERT INTO students (id, "fullName", grade, course, "parentName", status, email, phone)
    SELECT 'stu_1', 'Γιάννης Παπαδόπουλος', 'Γ Λυκείου', 'Μαθηματικά', 'Ανδρέας Παπαδόπουλος', 'active', 'giannis@example.com', '+30 694 123 4567'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE id = 'stu_1');

    INSERT INTO students (id, "fullName", grade, course, "parentName", status, email, phone)
    SELECT 'stu_2', 'Μαρία Κωνσταντίνου', 'Β Λυκείου', 'Φυσική', 'Ελένη Κωνσταντίνου', 'active', 'maria@example.com', '+30 697 234 5678'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE id = 'stu_2');

    INSERT INTO students (id, "fullName", grade, course, "parentName", status, email, phone)
    SELECT 'stu_3', 'Νίκος Γεωργίου', 'Α Λυκείου', 'Έκθεση', 'Χρήστος Γεωργίου', 'active', 'nikos@example.com', '+30 698 345 6789'
    WHERE NOT EXISTS (SELECT 1 FROM students WHERE id = 'stu_3');

    INSERT INTO teachers_availability (id, "teacherId", "teacherName", day, time)
    SELECT 'avail_1', 'tea_1', 'Ελένη Παπαδοπούλου', 'Monday', '09:00'
    WHERE NOT EXISTS (SELECT 1 FROM teachers_availability WHERE id = 'avail_1');

    INSERT INTO teachers_availability (id, "teacherId", "teacherName", day, time)
    SELECT 'avail_2', 'tea_1', 'Ελένη Παπαδοπούλου', 'Wednesday', '11:00'
    WHERE NOT EXISTS (SELECT 1 FROM teachers_availability WHERE id = 'avail_2');

    INSERT INTO teachers_availability (id, "teacherId", "teacherName", day, time)
    SELECT 'avail_3', 'tea_2', 'Κωνσταντίνος Βασιλείου', 'Tuesday', '10:00'
    WHERE NOT EXISTS (SELECT 1 FROM teachers_availability WHERE id = 'avail_3');

    INSERT INTO teachers_availability (id, "teacherId", "teacherName", day, time)
    SELECT 'avail_4', 'tea_2', 'Κωνσταντίνος Βασιλείου', 'Thursday', '15:00'
    WHERE NOT EXISTS (SELECT 1 FROM teachers_availability WHERE id = 'avail_4');

    INSERT INTO classrooms (id, name, capacity)
    SELECT 'room_1', 'Room A', 16
    WHERE NOT EXISTS (SELECT 1 FROM classrooms WHERE id = 'room_1');

    INSERT INTO classrooms (id, name, capacity)
    SELECT 'room_2', 'Room B', 12
    WHERE NOT EXISTS (SELECT 1 FROM classrooms WHERE id = 'room_2');

    INSERT INTO classrooms (id, name, capacity)
    SELECT 'room_3', 'Room C', 10
    WHERE NOT EXISTS (SELECT 1 FROM classrooms WHERE id = 'room_3');
  `);
}

export async function POST() {
  let client: Client | null = null;

  try {
    client = await createPostgresClient();
    await createTables(client);
    await seedSampleData(client);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Initialization failed" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.end();
    }
  }
}
