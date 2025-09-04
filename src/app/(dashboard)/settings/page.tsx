"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from '../../../components/Button';
import { User, Bell, Building2 } from 'lucide-react';
import ConfirmDialog from "../../../components/ConfirmDialog";

const tabs = [
  { name: "Profile", icon: User },
  { name: "Notifications", icon: Bell },
  { name: "Workspace", icon: Building2 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [deleteWorkspaceConfirm, setDeleteWorkspaceConfirm] = useState(false);

  function handleDeleteWorkspace() {
    // Implementation would go here
    console.log("Workspace deleted");
    setDeleteWorkspaceConfirm(false);
  }

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
                <label htmlFor="profile-name" className="block text-[#015958] font-semibold mb-1">Name</label>
                <input id="profile-name" title="Profile name" placeholder="Demo User" className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" value="Demo User" readOnly />
              </div>
              <div>
                <label htmlFor="profile-email" className="block text-[#015958] font-semibold mb-1">Email</label>
                <input id="profile-email" title="Profile email" placeholder="demo@worksync.com" className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" value="demo@worksync.com" readOnly />
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
            <div className="flex flex-col gap-6">
              <div>
                <label htmlFor="workspace-name" className="block text-[#015958] font-semibold mb-1">Workspace Name</label>
                <input id="workspace-name" title="Workspace name" placeholder="Acme Corp" className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" value="Acme Corp" readOnly />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="workspace-theme" className="block text-[#015958] font-semibold mb-1">Theme</label>
                  <select id="workspace-theme" title="Workspace theme" className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]">
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button className="bg-[#008F8C] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0FC2C0]">Save Changes</Button>
                </div>
              </div>

              {/* Member Management */}
              <div className="border-t border-[#0CABA8]/20 pt-4">
                <div className="text-[#015958] font-semibold mb-2">Members</div>
                <div className="text-sm text-[#0CABA8] mb-3">Manage who has access to this workspace.</div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/workspace/members" className="px-4 py-2 rounded border border-[#0CABA8]/40 text-[#015958] bg-white hover:bg-[#F6FFFE]">View Members</Link>
                  <Link href="/workspace/invite" className="px-4 py-2 rounded bg-[#0FC2C0] text-white hover:bg-[#0CABA8]">Invite Member</Link>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-[#0CABA8]/20 pt-4">
                <div className="text-[#015958] font-semibold mb-2">Danger Zone</div>
                <div className="text-sm text-[#0CABA8] mb-3">Deleting a workspace is permanent and will remove all projects, tasks, and notes in it.</div>
                <button 
                  onClick={() => setDeleteWorkspaceConfirm(true)}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                >
                  Delete Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ConfirmDialog
        open={deleteWorkspaceConfirm}
        title="Delete Workspace"
        description="This action will permanently delete the workspace and all its projects, tasks, and notes. This cannot be undone."
        confirmLabel="Delete Workspace"
        cancelLabel="Cancel"
        onConfirm={handleDeleteWorkspace}
        onCancel={() => setDeleteWorkspaceConfirm(false)}
      />
    </div>
  );
}