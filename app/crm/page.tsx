"use client";

import { useState, useEffect } from "react";
import { WorkspaceShell } from "../../components/WorkspaceShell";
import { UserPlus, Phone, Mail, CheckCircle, Clock, Trash2 } from "lucide-react";

export default function CRMPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [newLead, setNewLead] = useState({ name: "", phone: "", email: "", status: "Ενδιαφέρον" });

  useEffect(() => {
    const savedLeads = JSON.parse(localStorage.getItem("eduflow_crm_leads") || "[]");
    setLeads(savedLeads);
  }, []);

  const addLead = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...leads, { ...newLead, id: Date.now() }];
    setLeads(updated);
    localStorage.setItem("eduflow_crm_leads", JSON.stringify(updated));
    setNewLead({ name: "", phone: "", email: "", status: "Ενδιαφέρον" });
  };

  const deleteLead = (id: number) => {
    const updated = leads.filter(l => l.id !== id);
    setLeads(updated);
    localStorage.setItem("eduflow_crm_leads", JSON.stringify(updated));
  };

  return (
    <WorkspaceShell title="CRM - Διαχείριση Υποψήφιων" description="Καταγραφή και παρακολούθηση νέων ενδιαφερόμενων.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Φόρμα Εγγραφής Lead */}
        <div className="bg-[#1e2330] p-6 rounded-3xl border border-slate-800 h-fit">
          <h3 className="text-indigo-400 font-bold mb-4 flex items-center gap-2"> <UserPlus size={18}/> Νέος Υποψήφιος</h3>
          <form onSubmit={addLead} className="space-y-4">
            <input required placeholder="Ονοματεπώνυμο" className="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-white text-sm" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} />
            <input required type="tel" placeholder="Τηλέφωνο" className="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-white text-sm" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
            <input required type="email" placeholder="Email" className="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-white text-sm" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />
            <select className="w-full bg-[#0b0e14] border border-slate-700 p-3 rounded-xl text-white text-sm" value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})}>
              <option>Ενδιαφέρον</option>
              <option>Επικοινωνία</option>
              <option>Έκλεισε ραντεβού</option>
            </select>
            <button className="w-full bg-indigo-600 p-3 rounded-xl text-white font-bold text-sm hover:bg-indigo-500">Προσθήκη στη λίστα</button>
          </form>
        </div>

        {/* Λίστα Leads */}
        <div className="lg:col-span-2 space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-[#1e2330] p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-white font-bold">{lead.name}</p>
                <div className="flex gap-4 mt-1 text-slate-400 text-xs">
                  <span className="flex items-center gap-1"><Phone size={12}/> {lead.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={12}/> {lead.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${lead.status === 'Ενδιαφέρον' ? 'bg-amber-900 text-amber-300' : 'bg-emerald-900 text-emerald-300'}`}>
                  {lead.status}
                </span>
                <button onClick={() => deleteLead(lead.id)} className="text-slate-600 hover:text-rose-500"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          {leads.length === 0 && <p className="text-slate-500 text-center py-10">Δεν υπάρχουν υποψήφιοι μαθητές.</p>}
        </div>
      </div>
    </WorkspaceShell>
  );
}