import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../../components/SocketProvider';

export interface GlobalPresenceUser {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  currentPage: string;
  currentItem?: {
    type: 'task' | 'project' | 'note' | 'event';
    id: string;
    action: 'viewing' | 'editing' | 'commenting';
  };
  status: 'active' | 'idle' | 'away';
  lastSeen: Date;
}

export interface GlobalPresenceState {
  users: GlobalPresenceUser[];
  currentUser: GlobalPresenceUser | null;
}

export function useGlobalPresence(
  userId: string,
  userName: string,
  currentPage: string,
  currentItem?: {
    type: 'task' | 'project' | 'note' | 'event';
    id: string;
    action: 'viewing' | 'editing' | 'commenting';
  }
) {
  const socket = useSocket();
  const [presence, setPresence] = useState<GlobalPresenceState>({
    users: [],
    currentUser: null,
  });

  // Generate consistent color for user
  const getUserColor = useCallback((id: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, []);

  // Update presence when context changes
  const updatePresence = useCallback(() => {
    if (!socket || !userId) return;

    const presenceData: Partial<GlobalPresenceUser> = {
      id: userId,
      name: userName,
      color: getUserColor(userId),
      currentPage,
      currentItem,
      status: 'active',
      lastSeen: new Date(),
    };

    socket.emit('presence:update', presenceData);
  }, [socket, userId, userName, currentPage, currentItem, getUserColor]);

  // Initialize presence tracking
  useEffect(() => {
    if (!socket) return;

    updatePresence();

    // Listen for presence updates
    const handlePresenceUpdate = (users: GlobalPresenceUser[]) => {
      setPresence(prev => ({
        ...prev,
        users: users.filter(u => u.id !== userId),
        currentUser: users.find(u => u.id === userId) || prev.currentUser,
      }));
    };

    const handleUserJoined = (user: GlobalPresenceUser) => {
      if (user.id === userId) return;
      setPresence(prev => ({
        ...prev,
        users: [...prev.users.filter(u => u.id !== user.id), user],
      }));
    };

    const handleUserLeft = (user: { id: string }) => {
      setPresence(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== user.id),
      }));
    };

    socket.on('presence:users', handlePresenceUpdate);
    socket.on('presence:user-joined', handleUserJoined);
    socket.on('presence:user-left', handleUserLeft);

    // Send periodic heartbeat
    const heartbeatInterval = setInterval(() => {
      socket.emit('presence:heartbeat', { userId, status: 'active' });
    }, 30000);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      const status = document.hidden ? 'away' : 'active';
      socket.emit('presence:status', { userId, status });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      socket.off('presence:users', handlePresenceUpdate);
      socket.off('presence:user-joined', handleUserJoined);
      socket.off('presence:user-left', handleUserLeft);
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      socket.emit('presence:leave', { userId });
    };
  }, [socket, userId, updatePresence]);

  // Update presence when dependencies change
  useEffect(() => {
    updatePresence();
  }, [updatePresence]);

  // Set activity status
  const setActivityStatus = useCallback((
    itemType: 'task' | 'project' | 'note' | 'event',
    itemId: string,
    action: 'viewing' | 'editing' | 'commenting'
  ) => {
    if (!socket) return;

    const activityData = {
      userId,
      currentItem: { type: itemType, id: itemId, action },
      timestamp: new Date(),
    };

    socket.emit('presence:activity', activityData);
  }, [socket, userId]);

  // Get users working on specific item
  const getUsersOnItem = useCallback((itemType: string, itemId: string) => {
    return presence.users.filter(
      user => user.currentItem?.type === itemType && 
               user.currentItem?.id === itemId
    );
  }, [presence.users]);

  // Get users on current page
  const getUsersOnPage = useCallback((page: string) => {
    return presence.users.filter(user => user.currentPage === page);
  }, [presence.users]);

  return {
    presence,
    setActivityStatus,
    getUsersOnItem,
    getUsersOnPage,
    updatePresence,
  };
}
