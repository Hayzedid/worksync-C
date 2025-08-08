import React from 'react';
import { User, CheckSquare, FileText, Calendar, FolderPlus } from 'lucide-react';

export type Activity = {
  id: number;
  type: 'task' | 'note' | 'event' | 'project' | 'comment';
  user: { name: string };
  message: string;
  createdAt: string;
};

type ActivityFeedProps = {
  activities: Activity[];
};

const icons = {
  task: CheckSquare,
  note: FileText,
  event: Calendar,
  project: FolderPlus,
  comment: User,
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[#0FC2C0] mb-2">Activity Feed</h3>
      {activities.length === 0 && <div className="text-[#015958]">No recent activity.</div>}
      <ul className="divide-y divide-[#0CABA8]/10">
        {activities.map(a => {
          const Icon = icons[a.type];
          return (
            <li key={a.id} className="py-2 flex items-center gap-3">
              <span className={`rounded-full p-2 bg-[#0CABA8] text-white`}><Icon className="h-4 w-4" /></span>
              <div className="flex-1">
                <span className="font-semibold text-[#015958]">{a.user.name}</span>
                <span className="text-[#015958] ml-2">{a.message}</span>
              </div>
              <span className="text-xs text-[#0CABA8]">{new Date(a.createdAt).toLocaleString()}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 