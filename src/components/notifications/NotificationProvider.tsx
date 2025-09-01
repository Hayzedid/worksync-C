import React, { createContext, useCallback, useContext, useState } from 'react';
import { Notification as NotificationType } from './NotificationList';

type Ctx = {
  notifications: NotificationType[];
  addNotification: (n: Omit<NotificationType, 'id' | 'read' | 'createdAt'> & { id?: number; createdAt?: string }) => void;
  markRead: (id: number) => void;
  deleteNotif: (id: number) => void;
};

const NotificationContext = createContext<Ctx | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const addNotification = useCallback((notif: Omit<NotificationType, 'id' | 'read' | 'createdAt'> & { id?: number; createdAt?: string }) => {
    setNotifications(prev => [
      { id: notif.id ?? Date.now(), message: notif.message, read: false, createdAt: notif.createdAt ?? new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const markRead = useCallback((id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);
  const deleteNotif = useCallback((id: number) => setNotifications(prev => prev.filter(n => n.id !== id)), []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markRead, deleteNotif }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
