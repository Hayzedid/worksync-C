import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../useSocket';
import { useAuth } from '../useAuth';

export interface TimeEntry {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  taskId?: string;
  projectId?: string;
  workspaceId: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number; // seconds
  isRunning: boolean;
  tags: string[];
  billable: boolean;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeTrackingTimer {
  id?: string;
  taskId?: string;
  projectId?: string;
  description: string;
  startTime: string;
  isRunning: boolean;
  elapsed: number; // seconds
}

export interface TimeTrackingReport {
  period: 'today' | 'week' | 'month' | 'custom';
  startDate: string;
  endDate: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  entries: TimeEntry[];
  breakdown: {
    byProject: Array<{
      projectId: string;
      projectName: string;
      hours: number;
      billableHours: number;
    }>;
    byUser: Array<{
      userId: string;
      userName: string;
      hours: number;
      billableHours: number;
    }>;
    byDay: Array<{
      date: string;
      hours: number;
      billableHours: number;
    }>;
  };
}

export interface TimeTrackingSettings {
  defaultHourlyRate: number;
  autoStopTimer: boolean;
  autoStopDuration: number; // minutes
  reminderInterval: number; // minutes
  requireDescription: boolean;
  allowManualEntry: boolean;
  trackingMode: 'automatic' | 'manual' | 'hybrid';
  workingHours: {
    start: string; // HH:mm
    end: string; // HH:mm
    workDays: number[]; // 0-6 (Sunday-Saturday)
  };
}

export interface TimeTrackingHook {
  // Current timer state
  activeTimer: TimeTrackingTimer | null;
  isTimerRunning: boolean;
  
  // Time entries
  timeEntries: TimeEntry[];
  todayEntries: TimeEntry[];
  weekEntries: TimeEntry[];
  isLoading: boolean;
  error: string | null;
  
  // Timer operations
  startTimer: (taskId?: string, projectId?: string, description?: string) => Promise<void>;
  stopTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  resetTimer: () => void;
  
  // Manual time entry
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'userId' | 'user' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTimeEntry: (entryId: string, updates: Partial<TimeEntry>) => Promise<void>;
  deleteTimeEntry: (entryId: string) => Promise<void>;
  
  // Reporting
  generateReport: (period: string, startDate?: string, endDate?: string) => Promise<TimeTrackingReport>;
  exportReport: (format: 'csv' | 'pdf' | 'json', report: TimeTrackingReport) => Promise<void>;
  
  // Settings
  settings: TimeTrackingSettings;
  updateSettings: (newSettings: Partial<TimeTrackingSettings>) => Promise<void>;
  
  // Analytics
  getTotalHoursToday: () => number;
  getTotalHoursWeek: () => number;
  getAverageHoursPerDay: () => number;
  getProductivityScore: () => number;
  
  // Team tracking (for managers)
  getTeamTimeEntries: (workspaceId: string, startDate: string, endDate: string) => Promise<TimeEntry[]>;
  getTeamUtilization: (workspaceId: string) => Promise<Array<{
    userId: string;
    userName: string;
    hoursLogged: number;
    expectedHours: number;
    utilization: number;
  }>>;
}

export function useTimeTracking(): TimeTrackingHook {
  const socket = useSocket();
  const auth = useAuth();
  
  const [activeTimer, setActiveTimer] = useState<TimeTrackingTimer | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<TimeTrackingSettings>({
    defaultHourlyRate: 50,
    autoStopTimer: true,
    autoStopDuration: 480, // 8 hours
    reminderInterval: 30,
    requireDescription: false,
    allowManualEntry: true,
    trackingMode: 'hybrid',
    workingHours: {
      start: '09:00',
      end: '17:00',
      workDays: [1, 2, 3, 4, 5] // Monday to Friday
    }
  });

  // Initialize time tracking data
  useEffect(() => {
    if (!auth?.user?.id) return;

    const loadTimeTrackingData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load existing time entries (mock data)
        const mockEntries: TimeEntry[] = [
          {
            id: 'entry-1',
            userId: auth.user.id,
            user: {
              id: auth.user.id,
              name: auth.user.name,
              avatar: auth.user.avatar
            },
            taskId: 'task-1',
            projectId: 'project-1',
            workspaceId: 'workspace-1',
            description: 'Working on user authentication',
            startTime: '2025-08-27T09:00:00Z',
            endTime: '2025-08-27T11:30:00Z',
            duration: 9000, // 2.5 hours
            isRunning: false,
            tags: ['development', 'backend'],
            billable: true,
            hourlyRate: 75,
            createdAt: '2025-08-27T09:00:00Z',
            updatedAt: '2025-08-27T11:30:00Z'
          },
          {
            id: 'entry-2',
            userId: auth.user.id,
            user: {
              id: auth.user.id,
              name: auth.user.name,
              avatar: auth.user.avatar
            },
            projectId: 'project-1',
            workspaceId: 'workspace-1',
            description: 'Code review and testing',
            startTime: '2025-08-27T13:00:00Z',
            endTime: '2025-08-27T15:00:00Z',
            duration: 7200, // 2 hours
            isRunning: false,
            tags: ['review', 'testing'],
            billable: true,
            hourlyRate: 75,
            createdAt: '2025-08-27T13:00:00Z',
            updatedAt: '2025-08-27T15:00:00Z'
          }
        ];

        setTimeEntries(mockEntries);

        // Check for active timer
        const savedTimer = localStorage.getItem('activeTimer');
        if (savedTimer) {
          const timer = JSON.parse(savedTimer) as TimeTrackingTimer;
          if (timer.isRunning) {
            const elapsed = Math.floor((Date.now() - new Date(timer.startTime).getTime()) / 1000);
            setActiveTimer({ ...timer, elapsed });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load time tracking data');
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeTrackingData();
  }, [auth?.user?.id]);

  // Update timer elapsed time
  useEffect(() => {
    if (!activeTimer?.isRunning) return;

    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev || !prev.isRunning) return prev;
        const elapsed = Math.floor((Date.now() - new Date(prev.startTime).getTime()) / 1000);
        return { ...prev, elapsed };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleTimerUpdate = (data: any) => {
      setActiveTimer(data.timer);
    };

    const handleTimeEntryAdded = (entry: TimeEntry) => {
      setTimeEntries(prev => [entry, ...prev]);
    };

    const handleTimeEntryUpdated = (data: { entryId: string; updates: Partial<TimeEntry> }) => {
      setTimeEntries(prev => prev.map(entry =>
        entry.id === data.entryId ? { ...entry, ...data.updates } : entry
      ));
    };

    const handleTimeEntryDeleted = (data: { entryId: string }) => {
      setTimeEntries(prev => prev.filter(entry => entry.id !== data.entryId));
    };

    socket.on('time:timer-updated', handleTimerUpdate);
    socket.on('time:entry-added', handleTimeEntryAdded);
    socket.on('time:entry-updated', handleTimeEntryUpdated);
    socket.on('time:entry-deleted', handleTimeEntryDeleted);

    return () => {
      socket.off('time:timer-updated', handleTimerUpdate);
      socket.off('time:entry-added', handleTimeEntryAdded);
      socket.off('time:entry-updated', handleTimeEntryUpdated);
      socket.off('time:entry-deleted', handleTimeEntryDeleted);
    };
  }, [socket]);

  // Timer operations
  const startTimer = useCallback(async (taskId?: string, projectId?: string, description?: string) => {
    if (!socket || !auth?.user?.id) throw new Error('Socket not connected or user not authenticated');

    const timer: TimeTrackingTimer = {
      id: `timer-${Date.now()}`,
      taskId,
      projectId,
      description: description || '',
      startTime: new Date().toISOString(),
      isRunning: true,
      elapsed: 0
    };

    setActiveTimer(timer);
    localStorage.setItem('activeTimer', JSON.stringify(timer));
    
    socket.emit('time:start-timer', {
      userId: auth.user.id,
      timer
    });
  }, [socket, auth?.user?.id]);

  const stopTimer = useCallback(async () => {
    if (!socket || !activeTimer || !auth?.user?.id) return;

    const endTime = new Date().toISOString();
    const duration = activeTimer.elapsed;

    // Create time entry
    const timeEntry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: auth.user.id,
      user: {
        id: auth.user.id,
        name: auth.user.name,
        avatar: auth.user.avatar
      },
      taskId: activeTimer.taskId,
      projectId: activeTimer.projectId,
      workspaceId: 'current-workspace', // Get from context
      description: activeTimer.description,
      startTime: activeTimer.startTime,
      endTime,
      duration,
      isRunning: false,
      tags: [],
      billable: true,
      hourlyRate: settings.defaultHourlyRate
    };

    socket.emit('time:stop-timer', {
      userId: auth.user.id,
      timerId: activeTimer.id,
      timeEntry
    });

    setActiveTimer(null);
    localStorage.removeItem('activeTimer');
  }, [socket, activeTimer, auth?.user, settings.defaultHourlyRate]);

  const pauseTimer = useCallback(async () => {
    if (!activeTimer) return;

    setActiveTimer(prev => prev ? { ...prev, isRunning: false } : null);
    localStorage.setItem('activeTimer', JSON.stringify({ ...activeTimer, isRunning: false }));
  }, [activeTimer]);

  const resumeTimer = useCallback(async () => {
    if (!activeTimer) return;

    const resumedTimer = {
      ...activeTimer,
      isRunning: true,
      startTime: new Date(Date.now() - (activeTimer.elapsed * 1000)).toISOString()
    };

    setActiveTimer(resumedTimer);
    localStorage.setItem('activeTimer', JSON.stringify(resumedTimer));
  }, [activeTimer]);

  const resetTimer = useCallback(() => {
    setActiveTimer(null);
    localStorage.removeItem('activeTimer');
  }, []);

  // Manual time entry operations
  const addTimeEntry = useCallback(async (entry: Omit<TimeEntry, 'id' | 'userId' | 'user' | 'createdAt' | 'updatedAt'>) => {
    if (!socket || !auth?.user?.id) throw new Error('Socket not connected or user not authenticated');

    const newEntry: TimeEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      userId: auth.user.id,
      user: {
        id: auth.user.id,
        name: auth.user.name,
        avatar: auth.user.avatar
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    socket.emit('time:add-entry', newEntry);
  }, [socket, auth?.user]);

  const updateTimeEntry = useCallback(async (entryId: string, updates: Partial<TimeEntry>) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('time:update-entry', {
      entryId,
      updates: { ...updates, updatedAt: new Date().toISOString() }
    });
  }, [socket]);

  const deleteTimeEntry = useCallback(async (entryId: string) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('time:delete-entry', { entryId });
  }, [socket]);

  // Reporting
  const generateReport = useCallback(async (period: string, startDate?: string, endDate?: string): Promise<TimeTrackingReport> => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      default:
        start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = endDate ? new Date(endDate) : now;
    }

    const filteredEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return entryDate >= start && entryDate <= end;
    });

    const totalHours = filteredEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0);
    const billableHours = filteredEntries.filter(e => e.billable).reduce((sum, entry) => sum + (entry.duration / 3600), 0);

    return {
      period: period as any,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalHours,
      billableHours,
      nonBillableHours: totalHours - billableHours,
      entries: filteredEntries,
      breakdown: {
        byProject: [], // Mock implementation
        byUser: [], // Mock implementation
        byDay: [] // Mock implementation
      }
    };
  }, [timeEntries]);

  const exportReport = useCallback(async (format: 'csv' | 'pdf' | 'json', report: TimeTrackingReport) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('time:export-report', { format, report });
  }, [socket]);

  // Settings
  const updateSettings = useCallback(async (newSettings: Partial<TimeTrackingSettings>) => {
    if (!socket) throw new Error('Socket not connected');

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    socket.emit('time:update-settings', updatedSettings);
    localStorage.setItem('timeTrackingSettings', JSON.stringify(updatedSettings));
  }, [socket, settings]);

  // Analytics
  const getTotalHoursToday = useCallback(() => {
    const today = new Date().toDateString();
    return todayEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0);
  }, []);

  const getTotalHoursWeek = useCallback(() => {
    return weekEntries.reduce((sum, entry) => sum + (entry.duration / 3600), 0);
  }, []);

  const getAverageHoursPerDay = useCallback(() => {
    const weekHours = getTotalHoursWeek();
    return weekHours / 7;
  }, [getTotalHoursWeek]);

  const getProductivityScore = useCallback(() => {
    // Mock productivity calculation based on various factors
    const hoursToday = getTotalHoursToday();
    const targetHours = 8;
    const baseScore = Math.min(hoursToday / targetHours, 1) * 100;
    return Math.round(baseScore);
  }, [getTotalHoursToday]);

  // Team tracking
  const getTeamTimeEntries = useCallback(async (workspaceId: string, startDate: string, endDate: string): Promise<TimeEntry[]> => {
    if (!socket) throw new Error('Socket not connected');

    return new Promise((resolve) => {
      socket.emit('time:get-team-entries', { workspaceId, startDate, endDate });
      socket.once('time:team-entries-response', resolve);
    });
  }, [socket]);

  const getTeamUtilization = useCallback(async (workspaceId: string) => {
    if (!socket) throw new Error('Socket not connected');

    return new Promise((resolve) => {
      socket.emit('time:get-team-utilization', { workspaceId });
      socket.once('time:team-utilization-response', resolve);
    });
  }, [socket]);

  // Derived state
  const isTimerRunning = activeTimer?.isRunning || false;
  const todayEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime).toDateString();
    const today = new Date().toDateString();
    return entryDate === today;
  });
  const weekEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return entryDate >= weekAgo;
  });

  return {
    activeTimer,
    isTimerRunning,
    timeEntries,
    todayEntries,
    weekEntries,
    isLoading,
    error,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    generateReport,
    exportReport,
    settings,
    updateSettings,
    getTotalHoursToday,
    getTotalHoursWeek,
    getAverageHoursPerDay,
    getProductivityScore,
    getTeamTimeEntries,
    getTeamUtilization
  };
}
