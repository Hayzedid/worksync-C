"use client";
import { useEffect, useState } from "react";
import { ActivityFeed } from "../../../components/activity/ActivityFeed";
import { Calendar, AlertCircle, Clock } from "lucide-react";

type Notification = {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
};
type Activity = {
  id: number;
  type: 'task' | 'note' | 'event' | 'project' | 'comment';
  user: { name: string };
  message: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  // Optionally, fetch analytics data from your backend
  // const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    // Mock notifications
    setNotifications([
      { id: 1, message: "Welcome to WorkSync!", read: false, createdAt: "2024-06-01T10:00:00Z" },
      { id: 2, message: "You have 3 new tasks assigned.", read: false, createdAt: "2024-06-01T11:00:00Z" },
    ]);
    // Mock activity
    setActivity([
      { id: 1, type: 'project', user: { name: "Demo User" }, message: "created a project", createdAt: "2024-06-01T10:00:00Z" },
      { id: 2, type: 'task', user: { name: "Demo User" }, message: "completed a task", createdAt: "2024-06-01T12:00:00Z" },
    ]);
    // Optionally, mock analytics as well
    // setAnalytics({ ... });
  }, []);

  // Add mock data for deadlines and events
  const mockDeadlines = [
    { id: 1, title: "Submit project report", due: "2024-06-05T17:00:00Z" },
    { id: 2, title: "Finish UI design", due: "2024-06-03T12:00:00Z" },
  ];
  const mockEvents = [
    { id: 1, title: "Team Standup", time: "2024-06-02T09:00:00Z" },
    { id: 2, title: "Client Meeting", time: "2024-06-04T15:00:00Z" },
  ];

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* New Alerts */}
        <div className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex flex-col">
          <h3 className="text-lg font-bold text-[#0FC2C0] mb-4 flex items-center gap-2"><AlertCircle className="h-5 w-5" /> New Alerts</h3>
          {notifications.length === 0 ? (
            <div className="text-[#015958]">No new alerts.</div>
          ) : (
            <ul className="space-y-2">
              {notifications.slice(0, 3).map(n => (
                <li key={n.id} className="text-[#015958] text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0FC2C0] inline-block" />
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Approaching Deadlines */}
        <div className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex flex-col">
          <h3 className="text-lg font-bold text-[#0FC2C0] mb-4 flex items-center gap-2"><Clock className="h-5 w-5" /> Approaching Deadlines</h3>
          {mockDeadlines.length === 0 ? (
            <div className="text-[#015958]">No upcoming deadlines.</div>
          ) : (
            <ul className="space-y-2">
              {mockDeadlines.map(d => (
                <li key={d.id} className="text-[#015958] text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0CABA8] inline-block" />
                  {d.title} <span className="ml-auto text-xs text-[#0CABA8]">{new Date(d.due).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex flex-col">
          <h3 className="text-lg font-bold text-[#0FC2C0] mb-4 flex items-center gap-2"><Calendar className="h-5 w-5" /> Upcoming Events</h3>
          {mockEvents.length === 0 ? (
            <div className="text-[#015958]">No upcoming events.</div>
          ) : (
            <ul className="space-y-2">
              {mockEvents.map(e => (
                <li key={e.id} className="text-[#015958] text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#008F8C] inline-block" />
                  {e.title} <span className="ml-auto text-xs text-[#0CABA8]">{new Date(e.time).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex flex-col col-span-1 md:col-span-2 lg:col-span-4">
          <ActivityFeed activities={activity} />
        </div>
      </div>
    </div>
  );
} 