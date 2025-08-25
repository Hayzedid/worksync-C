"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';

export default function Topbar() {
  const { user } = useAuth() || {};
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const notifications = [
    { id: 1, title: 'Mention', body: 'Alice mentioned you in a task', time: '2m ago' },
    { id: 2, title: 'Project update', body: 'Project Alpha status changed to In Progress', time: '1h ago' },
    { id: 3, title: 'Note comment', body: 'Bob commented on Design Notes', time: '3h ago' },
  ];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!notifRef.current) return;
      if (e.target instanceof Node && notifRef.current.contains(e.target)) return;
      setShowNotif(false);
    }
    if (showNotif) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showNotif]);

  function handleLogout() {
    const ok = window.confirm('Are you sure you want to log out?');
    if (!ok) return;
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('current_workspace_id');
      }
    } finally {
      router.replace('/login');
    }
  }
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-[#0CABA8]/40 bg-[#0FC2C0] px-4 shadow-sm lg:pl-64">
      {/* Notification Bell */}
      <div className="ml-auto relative" ref={notifRef}>
        <button
          className="p-2 text-white hover:text-[#0CABA8] relative"
          onClick={() => setShowNotif(v => !v)}
          aria-haspopup="dialog"
          aria-expanded={showNotif ? "true" : "false"}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-6 w-6" />
          {notifications.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center text-[10px] leading-none h-4 min-w-4 px-1 rounded-full bg-red-500 text-white">
              {Math.min(notifications.length, 9)}
            </span>
          )}
        </button>
        {showNotif && (
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white text-[#015958] border border-[#0CABA8]/30 rounded-lg shadow-lg overflow-hidden z-50">
            <div className="px-4 py-2 border-b border-[#0CABA8]/20 font-semibold text-[#0FC2C0]">Recent notifications</div>
            <ul className="max-h-80 overflow-auto divide-y divide-[#0CABA8]/10">
              {notifications.map(n => (
                <li key={n.id} className="px-4 py-3 hover:bg-[#F6FFFE]">
                  <div className="text-sm font-semibold">{n.title} <span className="ml-2 text-xs text-[#0CABA8]">{n.time}</span></div>
                  <div className="text-sm">{n.body}</div>
                </li>
              ))}
              {notifications.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-[#0CABA8]">No notifications</li>
              )}
            </ul>
            <div className="px-4 py-2 bg-[#F6FFFE] text-right">
              <button
                className="text-[#0FC2C0] hover:underline text-sm"
                onClick={() => setShowNotif(false)}
              >Close</button>
            </div>
          </div>
        )}
      </div>
      {/* User Profile */}
      <Link href="/profile" className="ml-4 flex items-center gap-2 text-white font-semibold hover:text-[#0CABA8]">
        <User className="h-5 w-5" />
        <span>{user?.name || 'Profile'}</span>
      </Link>
      <button
        className="ml-2 p-2 text-white hover:text-[#0CABA8]"
        onClick={handleLogout}
        aria-label="Log out"
        title="Log out"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </header>
  );
}