"use client";
import Link from "next/link";
import { Users, UserPlus } from "lucide-react";

// TODO: Replace with API call when backend is wired up
const mockMembers = [
  { id: 1, name: "Alice Johnson", role: "Admin" },
  { id: 2, name: "Bob Smith", role: "Member" },
  { id: 3, name: "Carol Lee", role: "Member" },
];

export default function WorkspaceMembersPage() {
  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0FC2C0] flex items-center gap-2">
            <Users className="h-5 w-5" /> Members ({mockMembers.length})
          </h1>
          <Link href="/workspace/invite" className="inline-flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors">
            <UserPlus className="h-4 w-4" /> Invite Member
          </Link>
        </div>
        <ul className="divide-y divide-[#0CABA8]/20">
          {mockMembers.map((m) => (
            <li key={m.id} className="py-3 flex items-center gap-3 text-[#015958]">
              <span className="rounded-full bg-[#0FC2C0]/20 w-9 h-9 flex items-center justify-center font-bold text-[#0FC2C0]">
                {m.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div className="flex-1">
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-[#0CABA8]">{m.role}</div>
              </div>
              {/* Placeholder actions */}
              <button className="px-3 py-1 text-xs rounded border border-[#0CABA8]/40 text-[#015958] bg-white hover:bg-[#F6FFFE]">Remove</button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[#0CABA8]">
          Note: These are mock members. Hook this page to your backend to fetch the actual workspace members and enable actions.
        </p>
      </div>
    </div>
  );
}
