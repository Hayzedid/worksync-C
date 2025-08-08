"use client";
import { Calendar, Plus } from "lucide-react";

const mockEvents = [
  { id: 1, title: "Team Standup", date: "2025-07-18" },
  { id: 2, title: "Project Deadline", date: "2025-07-20" },
  { id: 3, title: "1:1 Meeting", date: "2025-07-22" },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0FC2C0]">Events</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold"><Plus className="h-4 w-4" /> New Event</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockEvents.map(e => (
            <div key={e.id} className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex items-center gap-4">
              <Calendar className="h-8 w-8 text-[#0FC2C0]" />
              <div className="flex-1">
                <div className="text-lg font-bold text-[#0FC2C0]">{e.title}</div>
                <div className="text-xs text-[#0CABA8]">{e.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 