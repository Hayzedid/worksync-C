"use client";
import Link from "next/link";
import { Users, Settings, Folder, Activity as ActivityIcon, UserPlus } from "lucide-react";

const mockMembers = [
  { id: 1, name: "Alice Johnson", role: "Admin" },
  { id: 2, name: "Bob Smith", role: "Member" },
  { id: 3, name: "Carol Lee", role: "Member" },
];
const mockProjects = [
  { id: 1, name: "Website Redesign", status: "Active" },
  { id: 2, name: "Mobile App", status: "Planning" },
];
const mockActivity = [
  { id: 1, user: "Alice Johnson", action: "added Bob Smith to the workspace", time: "2024-06-01T10:00:00Z" },
  { id: 2, user: "Carol Lee", action: "created project 'Mobile App'", time: "2024-06-02T14:00:00Z" },
];

export default function WorkspacePage() {
  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Members */}
      <div className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex flex-col">
        <h2 className="text-lg font-bold text-[#0FC2C0] mb-4 flex items-center gap-2"><Users className="h-5 w-5" /> Members</h2>
        <ul className="space-y-2">
          {mockMembers.map(m => (
            <li key={m.id} className="flex items-center gap-2 text-[#015958]">
              <span className="rounded-full bg-[#0FC2C0]/20 w-8 h-8 flex items-center justify-center font-bold text-[#0FC2C0]">{m.name.split(' ').map(n => n[0]).join('')}</span>
              <span>{m.name}</span>
              <span className="ml-auto text-xs text-[#0CABA8]">{m.role}</span>
            </li>
          ))}
        </ul>
        <Link href="/workspace/invite" className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors"><UserPlus className="h-4 w-4" /> Invite Member</Link>
      </div>
      {/* Workspace Settings */}
      <div className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex flex-col">
        <h2 className="text-lg font-bold text-[#0FC2C0] mb-4 flex items-center gap-2"><Settings className="h-5 w-5" /> Workspace Settings</h2>
        <div className="text-[#015958] mb-2">Name: <span className="font-semibold">Acme Corp</span></div>
        <div className="text-[#015958] mb-2">Members: {mockMembers.length}</div>
        <div className="text-[#015958] mb-2">Projects: {mockProjects.length}</div>
        <Link href="/settings" className="mt-4 inline-block px-4 py-2 bg-[#008F8C] text-white rounded hover:bg-[#0FC2C0] transition-colors">Edit Settings</Link>
      </div>
      {/* Projects */}
      <div className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex flex-col">
        <h2 className="text-lg font-bold text-[#0FC2C0] mb-4 flex items-center gap-2"><Folder className="h-5 w-5" /> Projects</h2>
        <ul className="space-y-2">
          {mockProjects.map(p => (
            <li key={p.id} className="flex items-center gap-2 text-[#015958]">
              <span className="rounded bg-[#0CABA8]/20 px-2 py-1 text-xs font-semibold text-[#0CABA8]">{p.status}</span>
              <span>{p.name}</span>
            </li>
          ))}
        </ul>
        <Link href="/projects/new" className="mt-4 inline-block px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors">New Project</Link>
      </div>
      {/* Activity */}
      <div className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex flex-col">
        <h2 className="text-lg font-bold text-[#0FC2C0] mb-4 flex items-center gap-2"><ActivityIcon className="h-5 w-5" /> Activity</h2>
        <ul className="space-y-2">
          {mockActivity.map(a => (
            <li key={a.id} className="text-[#015958] text-sm flex items-center gap-2">
              <span className="font-semibold text-[#0FC2C0]">{a.user}</span>
              <span>{a.action}</span>
              <span className="ml-auto text-xs text-[#0CABA8]">{new Date(a.time).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 