"use client";
import { FileText, Plus } from "lucide-react";

const mockNotes = [
  { id: 1, title: "Sprint Planning Notes" },
  { id: 2, title: "Meeting with Client" },
  { id: 3, title: "Ideas for Q3" },
];

export default function NotesPage() {
  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0FC2C0]">Notes</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold"><Plus className="h-4 w-4" /> New Note</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockNotes.map(n => (
            <div key={n.id} className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex items-center gap-4">
              <FileText className="h-8 w-8 text-[#0FC2C0]" />
              <div className="flex-1">
                <div className="text-lg font-bold text-[#0FC2C0]">{n.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 