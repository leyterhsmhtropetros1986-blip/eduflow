import { WorkspaceShell } from "../../components/WorkspaceShell";

export default function Home() {
  const stats = [
    { title: "Μαθητές", value: 245, icon: "👨‍🎓" },
    { title: "Καθηγητές", value: 18, icon: "👨‍🏫" },
    { title: "Μαθήματα", value: 32, icon: "📚" },
    { title: "Αίθουσες", value: 6, icon: "🏫" },
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

  return (
    <WorkspaceShell
      title="Κεντρικός Πίνακας"
      description="Σύνοψη του φροντιστηρίου, της προόδου των μαθητών και του επόμενου προγράμματος."
    >
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl bg-white p-6 shadow-sm"
          >
            <div className="text-3xl mb-2">{item.icon}</div>

            <div className="text-slate-500 text-sm">
              {item.title}
            </div>

            <div className="text-3xl font-bold mt-2">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">
            Μαθητές σε εξέλιξη
          </h3>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Όνομα</th>
                <th className="text-left py-2">Τάξη</th>
                <th className="text-left py-2">Μάθημα</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b">
                  <td className="py-2">{student.name}</td>
                  <td className="py-2">{student.className}</td>
                  <td className="py-2">{student.course}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">
            Επόμενα μαθήματα
          </h3>

          {schedule.map((item, index) => (
            <div
              key={index}
              className="border-b py-3"
            >
              <div className="font-semibold">
                {item.course}
              </div>

              <div className="text-sm text-slate-500">
                {item.day} • {item.time}
              </div>

              <div className="text-sm">
                Καθηγητής: {item.teacher}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold mb-4">
          Έξυπνη δημιουργία προγράμματος
        </h3>

        <p className="text-slate-500 mb-4">
          Αυτόματη δημιουργία προγράμματος βάσει
          μαθημάτων, καθηγητών και αιθουσών.
        </p>

        <button className="rounded-xl bg-slate-950 px-6 py-3 text-white hover:bg-slate-800">
          Δημιουργία Προγράμματος
        </button>
      </div>
    </WorkspaceShell>
  );
}