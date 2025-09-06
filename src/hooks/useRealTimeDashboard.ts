import { useState, useEffect, useCallback } from "react";
import { socket } from "../socket";
import { api } from "../api";

export interface DashboardData {
  tasks: {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    byPriority: { high: number; medium: number; low: number };
    byStatus: Record<string, number>;
    upcomingDeadlines: any[];
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
    byWorkspace: Record<string, number>;
  };
  events: {
    total: number;
    upcoming: any[];
    today: any[];
  };
  notifications: {
    total: number;
    unread: number;
    recent: any[];
  };
  activities: {
    recent: any[];
  };
  analytics: {
    productivity: {
      score: number;
      trend: 'up' | 'down' | 'stable';
      weeklyCompletion: number[];
    };
    workload: {
      currentCapacity: number;
      utilizationRate: number;
      burndownData: { date: string; remaining: number }[];
    };
  };
  lastUpdated: Date;
}

export function useRealTimeDashboard(workspaceId?: number) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');

  // Fetch initial dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [tasksRes, projectsRes, eventsRes, notificationsRes, activitiesRes] = await Promise.allSettled([
        api.get('/tasks', { params: workspaceId ? { workspace_id: workspaceId } : {} }),
        api.get('/projects', { params: workspaceId ? { workspace_id: workspaceId } : {} }),
        api.get('/events', { params: workspaceId ? { workspace_id: workspaceId } : {} }),
        api.get('/notifications'),
        api.get('/activity', { params: workspaceId ? { workspace_id: workspaceId } : {} })
      ]);

      // Process tasks data
      let tasksData = { total: 0, pending: 0, completed: 0, overdue: 0, byPriority: { high: 0, medium: 0, low: 0 }, byStatus: {}, upcomingDeadlines: [] as any[] };
      if (tasksRes.status === 'fulfilled') {
        const tasks = tasksRes.value?.tasks || tasksRes.value || [];
        tasksData = processTasksData(tasks);
      }

      // Process projects data
      let projectsData = { total: 0, active: 0, completed: 0, onHold: 0, byWorkspace: {} };
      if (projectsRes.status === 'fulfilled') {
        const projects = projectsRes.value?.projects || projectsRes.value || [];
        projectsData = processProjectsData(projects);
      }

      // Process events data
      let eventsData = { total: 0, upcoming: [] as any[], today: [] as any[] };
      if (eventsRes.status === 'fulfilled') {
        const events = eventsRes.value?.events || eventsRes.value || [];
        eventsData = processEventsData(events);
      }

      // Process notifications data
      let notificationsData = { total: 0, unread: 0, recent: [] as any[] };
      if (notificationsRes.status === 'fulfilled') {
        const notifications = notificationsRes.value?.notifications || notificationsRes.value || [];
        notificationsData = processNotificationsData(notifications);
      }

      // Process activities data
      let activitiesData = { recent: [] as any[] };
      if (activitiesRes.status === 'fulfilled') {
        const activities = activitiesRes.value?.activities || activitiesRes.value || [];
        activitiesData = { recent: activities.slice(0, 10) };
      }

      // Calculate analytics
      const analytics = calculateAnalytics(tasksData, projectsData);

      setData({
        tasks: tasksData,
        projects: projectsData,
        events: eventsData,
        notifications: notificationsData,
        activities: activitiesData,
        analytics,
        lastUpdated: new Date()
      });

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  // Real-time event handlers
  useEffect(() => {
    const handleConnect = () => {
      console.log('Dashboard: Socket connected');
      setConnectionStatus('connected');
    };

    const handleDisconnect = () => {
      console.log('Dashboard: Socket disconnected');
      setConnectionStatus('disconnected');
    };

    const handleReconnect = () => {
      console.log('Dashboard: Socket reconnecting');
      setConnectionStatus('reconnecting');
      fetchDashboardData(); // Refresh data on reconnection
    };

    // Task-related updates
    const handleTaskUpdate = (taskData: any) => {
      console.log('Dashboard: Task updated', taskData);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: recalculateTasksData(prev.tasks, taskData),
          analytics: calculateAnalytics(recalculateTasksData(prev.tasks, taskData), prev.projects),
          lastUpdated: new Date()
        };
      });
    };

    const handleProjectUpdate = (projectData: any) => {
      console.log('Dashboard: Project updated', projectData);
      setData(prev => {
        if (!prev) return prev;
        const newProjectsData = recalculateProjectsData(prev.projects, projectData);
        return {
          ...prev,
          projects: newProjectsData,
          analytics: calculateAnalytics(prev.tasks, newProjectsData),
          lastUpdated: new Date()
        };
      });
    };

    const handleEventUpdate = (eventData: any) => {
      console.log('Dashboard: Event updated', eventData);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          events: recalculateEventsData(prev.events, eventData),
          lastUpdated: new Date()
        };
      });
    };

    const handleNotificationUpdate = (notificationData: any) => {
      console.log('Dashboard: Notification updated', notificationData);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: recalculateNotificationsData(prev.notifications, notificationData),
          lastUpdated: new Date()
        };
      });
    };

    const handleActivityUpdate = (activityData: any) => {
      console.log('Dashboard: Activity updated', activityData);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          activities: {
            recent: [activityData, ...prev.activities.recent].slice(0, 10)
          },
          lastUpdated: new Date()
        };
      });
    };

    // Join workspace room for real-time updates
    if (workspaceId) {
      socket.emit('dashboard:join', { workspaceId });
    }

    // Socket event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    
    // Real-time data updates
    socket.on('task:created', handleTaskUpdate);
    socket.on('task:updated', handleTaskUpdate);
    socket.on('task:deleted', handleTaskUpdate);
    
    socket.on('project:created', handleProjectUpdate);
    socket.on('project:updated', handleProjectUpdate);
    socket.on('project:deleted', handleProjectUpdate);
    
    socket.on('event:created', handleEventUpdate);
    socket.on('event:updated', handleEventUpdate);
    socket.on('event:deleted', handleEventUpdate);
    
    socket.on('notification:created', handleNotificationUpdate);
    socket.on('notification:updated', handleNotificationUpdate);
    
    socket.on('activity:created', handleActivityUpdate);

    // Periodic refresh (fallback)
    const intervalId = setInterval(() => {
      if (connectionStatus === 'connected') {
        fetchDashboardData();
      }
    }, 300000); // 5 minutes

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      
      socket.off('task:created', handleTaskUpdate);
      socket.off('task:updated', handleTaskUpdate);
      socket.off('task:deleted', handleTaskUpdate);
      
      socket.off('project:created', handleProjectUpdate);
      socket.off('project:updated', handleProjectUpdate);
      socket.off('project:deleted', handleProjectUpdate);
      
      socket.off('event:created', handleEventUpdate);
      socket.off('event:updated', handleEventUpdate);
      socket.off('event:deleted', handleEventUpdate);
      
      socket.off('notification:created', handleNotificationUpdate);
      socket.off('notification:updated', handleNotificationUpdate);
      
      socket.off('activity:created', handleActivityUpdate);

      clearInterval(intervalId);

      if (workspaceId) {
        socket.emit('dashboard:leave', { workspaceId });
      }
    };
  }, [workspaceId, connectionStatus, fetchDashboardData]);

  // Load initial data
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    connectionStatus,
    refresh: fetchDashboardData
  };
}

// Helper functions for data processing
function processTasksData(tasks: any[]) {
  const now = new Date();
  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const tasksByPriority = tasks.reduce((acc, task) => {
    const priority = (task.priority || 'medium').toLowerCase();
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, { high: 0, medium: 0, low: 0 });

  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < now && task.status !== 'completed'
  );

  const upcomingDeadlines = tasks
    .filter(task => task.due_date && new Date(task.due_date) >= now)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  return {
    total: tasks.length,
    pending: tasksByStatus.todo || 0,
    completed: tasksByStatus.completed || 0,
    overdue: overdueTasks.length,
    byPriority: tasksByPriority,
    byStatus: tasksByStatus,
    upcomingDeadlines
  };
}

function processProjectsData(projects: any[]) {
  const projectsByStatus = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {});

  const projectsByWorkspace = projects.reduce((acc, project) => {
    const wsId = project.workspace_id || 'general';
    acc[wsId] = (acc[wsId] || 0) + 1;
    return acc;
  }, {});

  return {
    total: projects.length,
    active: projectsByStatus.active || 0,
    completed: projectsByStatus.completed || 0,
    onHold: projectsByStatus.on_hold || projectsByStatus.paused || 0,
    byWorkspace: projectsByWorkspace
  };
}

function processEventsData(events: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const upcomingEvents = events
    .filter(event => new Date(event.start_date) >= now)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 5);

  const todayEvents = events
    .filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate >= today && eventDate < tomorrow;
    });

  return {
    total: events.length,
    upcoming: upcomingEvents,
    today: todayEvents
  };
}

function processNotificationsData(notifications: any[]) {
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const recentNotifications = notifications
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    total: notifications.length,
    unread: unreadNotifications.length,
    recent: recentNotifications
  };
}

function calculateAnalytics(tasks: any, projects: any) {
  const completionRate = tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0;
  const productivityScore = Math.min(100, Math.max(0, completionRate - (tasks.overdue * 10)));
  
  // Generate mock weekly completion data (in real app, this would come from historical data)
  const weeklyCompletion = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
  
  // Ensure trend is one of the allowed literal types
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (productivityScore > 70) trend = 'up';
  else if (productivityScore <= 40) trend = 'down';
  
  return {
    productivity: {
      score: Math.round(productivityScore),
      trend,
      weeklyCompletion
    },
    workload: {
      currentCapacity: Math.round((tasks.pending / (tasks.total || 1)) * 100),
      utilizationRate: Math.round((projects.active / (projects.total || 1)) * 100),
      burndownData: [] as { date: string; remaining: number }[] // Properly typed empty array
    }
  };
}

function recalculateTasksData(prevTasks: any, taskUpdate: any): any {
  // This would involve updating the tasks data based on the real-time update
  // For now, we'll trigger a full refresh
  return prevTasks;
}

function recalculateProjectsData(prevProjects: any, projectUpdate: any): any {
  // This would involve updating the projects data based on the real-time update
  return prevProjects;
}

function recalculateEventsData(prevEvents: any, eventUpdate: any): any {
  // This would involve updating the events data based on the real-time update
  return prevEvents;
}

function recalculateNotificationsData(prevNotifications: any, notificationUpdate: any): any {
  // This would involve updating the notifications data based on the real-time update
  return prevNotifications;
}
