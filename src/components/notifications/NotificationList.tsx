import React from 'react';
import { Bell, X } from 'lucide-react';

export type Notification = {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
};

type NotificationListProps = {
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
};

export function NotificationList({ notifications, onMarkRead, onDelete }: NotificationListProps) {
  return (
    <div className="w-80 bg-white rounded shadow-lg p-4 border border-[#0CABA8]/20">
      <h3 className="text-lg font-bold text-[#0FC2C0] mb-2 flex items-center gap-2"><Bell className="h-5 w-5" /> Notifications</h3>
      {notifications.length === 0 && <div className="text-[#015958]">No notifications.</div>}
      <ul className="divide-y divide-[#0CABA8]/10">
        {notifications.map(n => (
          <li key={n.id} className={`py-2 flex items-center gap-2 ${n.read ? 'opacity-60' : ''}`}>
            <span className="flex-1 text-[#015958]">{n.message}</span>
            <span className="text-xs text-[#0CABA8]">{new Date(n.createdAt).toLocaleString()}</span>
            {!n.read && <button className="text-[#0FC2C0]" onClick={() => onMarkRead(n.id)}>Mark as read</button>}
            <button className="text-[#008F8C]" title="Delete notification" aria-label="Delete notification" onClick={() => onDelete(n.id)}><X className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
} 