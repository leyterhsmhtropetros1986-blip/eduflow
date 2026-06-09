import Link from "next/link";

export default function Home() {
const stats = [
{ title: "Students", value: 245 },
{ title: "Teachers", value: 18 },
{ title: "Courses", value: 32 },
{ title: "Revenue", value: "€12,450" },
];

const students = [
{
id: 1,
name: "Γιάννης Παπαδόπουλος",
className: "Γ Λυκείου",
course: "Μαθηματικά",
},
{
id: 2,
name: "Μαρία Κωνσταντίνου",
className: "Β Λυκείου",
course: "Φυσική",
},
{
id: 3,
name: "Νίκος Γεωργίου",
className: "Α Λυκείου",
course: "Έκθεση",
},
];

const schedule = [
{
day: "Δευτέρα",
time: "18:00",
course: "Μαθηματικά Γ3",
teacher: "Παπαδόπουλος",
},
{
day: "Τρίτη",
time: "19:00",
course: "Φυσική Β2",
teacher: "Κωνσταντίνου",
},
];

return ( <div className="min-h-screen flex bg-gray-100"> <aside className="w-64 bg-gray-900 text-white p-6"> <h1 className="text-3xl font-bold mb-10">
EduFlow </h1>

```
    <nav className="space-y-4 flex flex-col">
      <Link href="/" className="hover:text-blue-300">
        📊 Dashboard
      </Link>

      <Link href="/students" className="hover:text-blue-300">
        👨‍🎓 Students
      </Link>

      <Link href="/teachers" className="hover:text-blue-300">
        👨‍🏫 Teachers
      </Link>

      <Link href="/courses" className="hover:text-blue-300">
        📚 Courses
      </Link>

      <Link href="/schedule" className="hover:text-blue-300">
        📅 Schedule
      </Link>

      <Link href="/attendance" className="hover:text-blue-300">
        ✅ Attendance
      </Link>

      <Link href="/payments" className="hover:text-blue-300">
        💰 Payments
      </Link>
    </nav>
  </aside>

  <main className="flex-1 p-8">
    <h2 className="text-4xl font-bold mb-2">
      EduFlow Dashboard
    </h2>

    <p className="text-gray-500 mb-8">
      Tutoring Management Platform
    </p>

    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {stats.map((item) => (
        <div
          key={item.title}
          className="bg-white rounded-xl shadow p-6"
        >
          <div className="text-gray-500">
            {item.title}
          </div>

          <div className="text-3xl font-bold mt-2">
            {item.value}
          </div>
        </div>
      ))}
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-bold mb-4">
          Students
        </h3>

        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Name</th>
              <th className="text-left">Class</th>
              <th className="text-left">Course</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.className}</td>
                <td>{student.course}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-bold mb-4">
          Auto Generated Schedule
        </h3>

        {schedule.map((item, index) => (
          <div
            key={index}
            className="border-b py-3"
          >
            <div className="font-semibold">
              {item.course}
            </div>

            <div className="text-sm text-gray-500">
              {item.day} - {item.time}
            </div>

            <div className="text-sm">
              {item.teacher}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-8 bg-white rounded-xl shadow p-6">
      <h3 className="text-xl font-bold mb-4">
        Smart Schedule Generator
      </h3>

      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
        Generate Schedule
      </button>
    </div>
  </main>
</div>
```

);
}
