"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useRef, useState } from 'react';
import { useSocket } from './SocketProvider';
import { NotificationList } from './notifications/NotificationList';
import { useNotifications } from './notifications/NotificationProvider';
import ConfirmDialog from './ConfirmDialog';

export default function Topbar() {
  const { user } = useAuth() || {};
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const socket = useSocket();
  const { notifications, addNotification, markRead, deleteNotif } = useNotifications();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Listen for real-time notifications from socket
  useEffect(() => {
    if (!socket) return;
    function handleNotification(payload: { message: string; type?: string; createdAt?: string }) {
      addNotification({ message: payload.message, createdAt: payload.createdAt });
    }
    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, addNotification]);

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
  setShowLogoutConfirm(true);
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
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center text-[10px] leading-none h-4 min-w-4 px-1 rounded-full bg-red-500 text-white">
              {Math.min(notifications.filter(n => !n.read).length, 9)}
            </span>
          )}
        </button>
        {showNotif && (
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] z-50">
            <NotificationList
              notifications={notifications}
              onMarkRead={markRead}
              onDelete={deleteNotif}
            />
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
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out"
        description="Are you sure you want to log out?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        onConfirm={() => {
          try {
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('access_token');
              sessionStorage.removeItem('current_workspace_id');
            }
          } finally {
            setShowLogoutConfirm(false);
            router.replace('/login');
          }
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </header>
  );
}