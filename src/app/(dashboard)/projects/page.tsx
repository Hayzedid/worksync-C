"use client";
import { FolderPlus, Folder } from "lucide-react";

const mockProjects = [
  { id: 1, name: "Website Redesign", status: "Active" },
  { id: 2, name: "Mobile App", status: "Planning" },
  { id: 3, name: "Marketing Campaign", status: "Completed" },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0FC2C0]">Projects</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold"><FolderPlus className="h-4 w-4" /> New Project</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockProjects.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex items-center gap-4">
              <Folder className="h-8 w-8 text-[#0FC2C0]" />
              <div className="flex-1">
                <div className="text-lg font-bold text-[#0FC2C0]">{p.name}</div>
                <div className="text-xs text-[#0CABA8]">{p.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 