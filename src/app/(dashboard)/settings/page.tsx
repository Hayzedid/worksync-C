"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from '../../../components/Button';
import { Settings, User, Bell, Building2 } from 'lucide-react';

const tabs = [
  { name: "Profile", icon: User },
  { name: "Notifications", icon: Bell },
  { name: "Workspace", icon: Building2 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0FC2C0] mb-6">Settings</h1>
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.name}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors duration-200 ${activeTab === tab.name ? 'bg-white border-[#0FC2C0] text-[#0FC2C0]' : 'bg-[#F6FFFE] border-transparent text-[#015958] hover:bg-white/80'}`}
              onClick={() => setActiveTab(tab.name)}
            >
              <tab.icon className="h-5 w-5" /> {tab.name}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-b-xl shadow p-8 border border-[#0CABA8]/20">
          {activeTab === "Profile" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[#015958] font-semibold mb-1">Name</label>
                <input className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" value="Demo User" readOnly />
              </div>
              <div>
                <label className="block text-[#015958] font-semibold mb-1">Email</label>
                <input className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" value="demo@worksync.com" readOnly />
              </div>
              <Link href="/forgot-password" className="bg-[#0FC2C0] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0CABA8] text-center">Change Password</Link>
            </div>
          )}
          {activeTab === "Notifications" && (
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2 text-[#015958]">
                <input type="checkbox" checked readOnly className="accent-[#0FC2C0]" /> Email Notifications
              </label>
              <label className="flex items-center gap-2 text-[#015958]">
                <input type="checkbox" className="accent-[#0FC2C0]" /> Push Notifications
              </label>
              <label className="flex items-center gap-2 text-[#015958]">
                <input type="checkbox" checked readOnly className="accent-[#0FC2C0]" /> Weekly Summary
              </label>
            </div>
          )}
          {activeTab === "Workspace" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[#015958] font-semibold mb-1">Workspace Name</label>
                <input className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" value="Acme Corp" readOnly />
              </div>
              <div>
                <label className="block text-[#015958] font-semibold mb-1">Theme</label>
                <select className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]">
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
              <Button className="bg-[#008F8C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0FC2C0]">Edit Workspace</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 