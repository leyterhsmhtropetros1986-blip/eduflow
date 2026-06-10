"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceShell } from "../components/WorkspaceShell";
import {
  createTeacher,
  deleteTeacher,
  fetchTeachers,
  updateTeacher,
} from "../lib/api";
import type { Teacher } from "../lib/data";

const initialTeacherState: Omit<Teacher, "id"> = {
  fullName: "",
  subject: "",
  availability: "",
  maxHoursPerDay: 5,
  email: "",
  phone: "",
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [formValues, setFormValues] = useState<Omit<Teacher, "id">>(initialTeacherState);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTeachers().then(setTeachers);
  }, []);

  const displayedTeachers = useMemo(() => {
    if (!searchTerm.trim()) {
      return teachers;
    }

    const lower = searchTerm.toLowerCase();
    return teachers.filter(
      (teacher) =>
        teacher.fullName.toLowerCase().includes(lower) ||
        teacher.subject.toLowerCase().includes(lower) ||
        teacher.availability.toLowerCase().includes(lower)
    );
  }, [searchTerm, teachers]);

  function resetForm() {
    setSelectedTeacher(null);
    setFormValues(initialTeacherState);
  }

  async function saveTeacher() {
    const trimmedName = formValues.fullName.trim();
    if (!trimmedName) {
      return;
    }

    const record: Teacher = {
      id: selectedTeacher?.id ?? `tea_${Date.now()}`,
      fullName: trimmedName,
      subject: formValues.subject,
      availability: formValues.availability,
      maxHoursPerDay: 5,
      email: formValues.email || `${trimmedName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: formValues.phone || "+30 210 000 0000",
    };

    const savedTeacher = selectedTeacher
      ? await updateTeacher(record.id, record)
      : await createTeacher(record);

    if (!savedTeacher) {
      return;
    }

    setTeachers((current) => {
      const updated = current.filter((teacher) => teacher.id !== savedTeacher.id);
      return [savedTeacher, ...updated];
    });

    resetForm();
  }

  async function handleDelete(id: string) {
    const deleted = await deleteTeacher(id);
    if (!deleted) {
      return;
    }

    setTeachers((current) => current.filter((teacher) => teacher.id !== id));
    if (selectedTeacher?.id === id) {
      resetForm();
    }
  }

  function handleEdit(teacher: Teacher) {
    setSelectedTeacher(teacher);
    setFormValues({
      fullName: teacher.fullName,
      subject: teacher.subject,
      availability: teacher.availability,
      maxHoursPerDay: teacher.maxHoursPerDay,
      email: teacher.email,
      phone: teacher.phone,
    });
  }

  return (
    <WorkspaceShell
      title="Καθηγητές"
      description="Παρακολούθηση διαθεσιμότητας, ειδικοτήτων και ανάθεσης τάξεων στο εκπαιδευτικό προσωπικό."
    >
      <div className="grid gap-6 lg:grid-cols-[1.75fr_1fr]">
        <section className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Κατάλογος καθηγητών</h2>
              <p className="mt-1 text-sm text-slate-500">Επισκόπηση του εκπαιδευτικού προσωπικού και ανάθεση των επόμενων μαθημάτων.</p>
            </div>
            <div className="w-full md:w-80">
              <label className="block text-sm font-medium text-slate-700">Αναζήτηση καθηγητών</label>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                placeholder="Αναζήτηση με όνομα, ειδικότητα ή διαθεσιμότητα"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Όνομα</th>
                  <th className="px-4 py-3 text-left font-semibold">Ειδικότητα</th>
                  <th className="px-4 py-3 text-left font-semibold">Διαθεσιμότητα</th>
                  <th className="px-4 py-3 text-left font-semibold">Επικοινωνία</th>
                  <th className="px-4 py-3 text-left font-semibold">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {displayedTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-900">{teacher.fullName}</td>
                    <td className="px-4 py-4 text-slate-600">{teacher.subject}</td>
                    <td className="px-4 py-4 text-slate-600">{teacher.availability}</td>
                    <td className="px-4 py-4 text-slate-600">{teacher.email}</td>
                    <td className="px-4 py-4 space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(teacher)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Επεξεργασία
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(teacher.id)}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Διαγραφή
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">{selectedTeacher ? "Επεξεργασία καθηγητή" : "Προσθήκη καθηγητή"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedTeacher
                ? "Ενημερώστε τη διαθεσιμότητα και τα στοιχεία επικοινωνίας του καθηγητή."
                : "Καταχωρίστε νέους καθηγητές και το ωράριο διαθεσιμότητάς τους."}
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Ονοματεπώνυμο</label>
            <input
              value={formValues.fullName}
              onChange={(event) => setFormValues({ ...formValues, fullName: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="Κωνσταντίνος Βασιλείου"
            />

            <label className="block text-sm font-medium text-slate-700">Ειδικότητα</label>
            <select
              value={formValues.subject}
              onChange={(event) => setFormValues({ ...formValues, subject: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="">Επιλογή Ειδικότητας</option>
              <option value="Μαθηματικός">Μαθηματικός</option>
              <option value="Φυσικός">Φυσικός</option>
              <option value="Χημικός">Χημικός</option>
              <option value="Φιλόλογος">Φιλόλογος</option>
              <option value="Βιολόγος">Βιολόγος</option>
              <option value="Πληροφορικής">Πληροφορικής</option>
              <option value="Οικονομολόγος">Οικονομολόγος</option>
              <option value="Αγγλικών">Αγγλικών</option>
            </select>

            <label className="block text-sm font-medium text-slate-700">Διαθεσιμότητα</label>
            <select
              value={formValues.availability}
              onChange={(event) => setFormValues({ ...formValues, availability: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
            >
              <option value="">Επιλογή Διαθεσιμότητας</option>
              <option value="Καθημερινά">Καθημερινά</option>
              <option value="Δευτέρα - Παρασκευή">Δευτέρα - Παρασκευή</option>
              <option value="Δευτέρα - Τετάρτη - Παρασκευή">Δευτέρα - Τετάρτη - Παρασκευή</option>
              <option value="Τρίτη - Πέμπτη">Τρίτη - Πέμπτη</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={saveTeacher}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {selectedTeacher ? "Ενημέρωση καθηγητή" : "Αποθήκευση καθηγητή"}
            </button>
            {selectedTeacher ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Ακύρωση
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
