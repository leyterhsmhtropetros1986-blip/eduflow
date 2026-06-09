"use client";
<div className="grid md:grid-cols-4 gap-4 mb-6">
  <div className="rounded-xl bg-blue-50 p-4">
    <div className="text-sm">Leads</div>
    <div className="text-2xl font-bold">12</div>
  </div>

  <div className="rounded-xl bg-yellow-50 p-4">
    <div className="text-sm">Contacted</div>
    <div className="text-2xl font-bold">7</div>
  </div>

  <div className="rounded-xl bg-green-50 p-4">
    <div className="text-sm">Active</div>
    <div className="text-2xl font-bold">18</div>
  </div>

  <div className="rounded-xl bg-red-50 p-4">
    <div className="text-sm">Lost</div>
    <div className="text-2xl font-bold">3</div>
  </div>
</div>
import { WorkspaceShell } from "../components/WorkspaceShell";

const leads = [
  {
    id: 1,
    name: "Γιώργος Παπαδόπουλος",
    phone: "6970000000",
    email: "test@test.gr",
    grade: "Β Λυκείου",
    interest: "Μαθηματικά",
    status: "Lead",
  },
  {
    id: 2,
    name: "Μαρία Κωνσταντίνου",
    phone: "6981111111",
    email: "maria@test.gr",
    grade: "Γ Λυκείου",
    interest: "Φυσική",
    status: "Contacted",
  },
  {
    id: 3,
    name: "Νίκος Γεωργίου",
    phone: "6992222222",
    email: "nikos@test.gr",
    grade: "Α Λυκείου",
    interest: "Έκθεση",
    status: "Trial",
  },
];

export default function CRMPage() {
  return (
    <WorkspaceShell
      title="🏢 CRM"
      description="Διαχείριση υποψήφιων μαθητών"
    >
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <table className="w-full">
          <thead>
            <tr>
              <th>Όνομα</th>
              <th>Τηλέφωνο</th>
              <th>Email</th>
              <th>Τάξη</th>
              <th>Ενδιαφέρον</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.phone}</td>
                <td>{lead.email}</td>
                <td>{lead.grade}</td>
                <td>{lead.interest}</td>
                <td>{lead.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WorkspaceShell>
  );
}