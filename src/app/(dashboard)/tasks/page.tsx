"use client";
import { CheckSquare, Plus } from "lucide-react";

const mockTasks = [
  { id: 1, title: "Design login page", status: "In Progress" },
  { id: 2, title: "Write API docs", status: "Completed" },
  { id: 3, title: "Test notifications", status: "Pending" },
];

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0FC2C0]">Tasks</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold"><Plus className="h-4 w-4" /> New Task</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockTasks.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex items-center gap-4">
              <CheckSquare className="h-8 w-8 text-[#0FC2C0]" />
              <div className="flex-1">
                <div className="text-lg font-bold text-[#0FC2C0]">{t.title}</div>
                <div className="text-xs text-[#0CABA8]">{t.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 