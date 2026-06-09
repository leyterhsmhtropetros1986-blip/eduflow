"use client";

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