"use client";

import { useState, useEffect } from "react";
import { Save, Mail, MessageSquare, Bell } from "lucide-react";

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    notifyParents: true,
    notifyStudents: false,
    resendApiKey: "",
    twilioSid: "",
    twilioToken: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("eduflow_notification_settings");

    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem(
      "eduflow_notification_settings",
      JSON.stringify(settings)
    );

    alert("Οι ρυθμίσεις αποθηκεύτηκαν!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Channels */}

      <div className="bg-[#1e2330] rounded-3xl border border-slate-800 p-6">

        <h2 className="text-white font-bold text-lg mb-6">
          Κανάλια Ειδοποιήσεων
        </h2>

        <div className="space-y-4">

          <Toggle
            icon={<Mail size={18} />}
            title="Email Notifications"
            checked={settings.emailEnabled}
            onChange={() =>
              setSettings({
                ...settings,
                emailEnabled: !settings.emailEnabled,
              })
            }
          />

          <Toggle
            icon={<MessageSquare size={18} />}
            title="SMS Notifications"
            checked={settings.smsEnabled}
            onChange={() =>
              setSettings({
                ...settings,
                smsEnabled: !settings.smsEnabled,
              })
            }
          />

          <Toggle
            icon={<Bell size={18} />}
            title="Push Notifications"
            checked={settings.pushEnabled}
            onChange={() =>
              setSettings({
                ...settings,
                pushEnabled: !settings.pushEnabled,
              })
            }
          />
        </div>
      </div>

      {/* Recipients */}

      <div className="bg-[#1e2330] rounded-3xl border border-slate-800 p-6">

        <h2 className="text-white font-bold text-lg mb-6">
          Παραλήπτες
        </h2>

        <div className="space-y-4">

          <Toggle
            title="Ενημέρωση Γονέων"
            checked={settings.notifyParents}
            onChange={() =>
              setSettings({
                ...settings,
                notifyParents: !settings.notifyParents,
              })
            }
          />

          <Toggle
            title="Ενημέρωση Μαθητών"
            checked={settings.notifyStudents}
            onChange={() =>
              setSettings({
                ...settings,
                notifyStudents: !settings.notifyStudents,
              })
            }
          />

        </div>
      </div>

      {/* API */}

      <div className="bg-[#1e2330] rounded-3xl border border-slate-800 p-6">

        <h2 className="text-white font-bold text-lg mb-6">
          API Keys
        </h2>

        <div className="space-y-4">

          <input
            placeholder="Resend API Key"
            value={settings.resendApiKey}
            onChange={(e) =>
              setSettings({
                ...settings,
                resendApiKey: e.target.value,
              })
            }
            className="w-full bg-[#0b0e14] border border-slate-700 rounded-xl px-4 py-3 text-white"
          />

          <input
            placeholder="Twilio SID"
            value={settings.twilioSid}
            onChange={(e) =>
              setSettings({
                ...settings,
                twilioSid: e.target.value,
              })
            }
            className="w-full bg-[#0b0e14] border border-slate-700 rounded-xl px-4 py-3 text-white"
          />

          <input
            placeholder="Twilio Token"
            value={settings.twilioToken}
            onChange={(e) =>
              setSettings({
                ...settings,
                twilioToken: e.target.value,
              })
            }
            className="w-full bg-[#0b0e14] border border-slate-700 rounded-xl px-4 py-3 text-white"
          />

        </div>
      </div>

      {/* Save */}

      <button
        onClick={saveSettings}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-bold"
      >
        <Save size={18} />
        Αποθήκευση Ρυθμίσεων
      </button>

    </div>
  );
}

function Toggle({
  title,
  checked,
  onChange,
  icon,
}: any) {
  return (
    <div className="flex items-center justify-between bg-[#0b0e14] border border-slate-800 rounded-2xl p-4">

      <div className="flex items-center gap-3 text-white font-medium">
        {icon}
        {title}
      </div>

      <button
        onClick={onChange}
        className={`w-14 h-8 rounded-full transition ${
          checked ? "bg-emerald-500" : "bg-slate-700"
        }`}
      >
        <div
          className={`w-6 h-6 bg-white rounded-full mt-1 transition ${
            checked ? "ml-7" : "ml-1"
          }`}
        />
      </button>

    </div>
  );
}