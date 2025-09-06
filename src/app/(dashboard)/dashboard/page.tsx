"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useRealTimeDashboard } from "../../../hooks/useRealTimeDashboard";
import { ActivityFeed } from "../../../components/activity/ActivityFeed";
import { RealTimeAnalytics } from "../../../components/dashboard/RealTimeAnalytics";
import { Calendar, AlertCircle, Clock, FolderIcon, CheckCircleIcon, BellIcon, Wifi, WifiOff, RotateCw } from "lucide-react";

interface Task {
  id: number;
  title: string;
  due_date: string;
  priority: string;
  status: string;
  project_id?: number;
}

interface Project {
  id: number;
  name: string;
  status: string;
  workspace_id?: number;
}

interface Event {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  all_day: boolean;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface Activity {
  id: number;
  content: string;
  commentable_type: string;
  commentable_id: number;
  created_at: string;
  user_id: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<number | undefined>();
  
  // Dynamic header message templates that include a {name} placeholder
  const dynamicHeaderMessages = [
    'What are we working on today, {name}?',
    'Ready to make your work process easier, {name}?',
    'A fresh look at your tasks and projects for you, {name}.',
    'New day, new goals — let\'s prioritize them, {name}.',
    'Quick snapshot of your work and activity, {name}.'
  ];
  const [dynamicHeader, setDynamicHeader] = useState<string>('');

  // Use real-time dashboard hook
  const { data, loading, error, connectionStatus, refresh } = useRealTimeDashboard(currentWorkspaceId);

  // Get workspace ID from sessionStorage or URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('current_workspace_id');
      if (stored) {
        const wsId = parseInt(stored, 10);
        if (Number.isFinite(wsId)) {
          setCurrentWorkspaceId(wsId);
        }
      }
    }
  }, []);

  useEffect(() => {
    // Pick a random header template and replace {name} with the authenticated user's first name
    const displayName = (user && user.firstName) ? user.firstName : 'User';
    const template = dynamicHeaderMessages[Math.floor(Math.random() * dynamicHeaderMessages.length)];
    const personalizedHeader = template.replace('{name}', displayName);
    setDynamicHeader(personalizedHeader);
  }, [user, dynamicHeaderMessages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <RotateCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
            <button 
              onClick={refresh}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { tasks, projects, events, notifications, activities } = data || {
    tasks: { total: 0, pending: 0, completed: 0, overdue: 0, byPriority: { high: 0, medium: 0, low: 0 }, byStatus: {}, upcomingDeadlines: [] },
    projects: { total: 0, active: 0, completed: 0, onHold: 0, byWorkspace: {} },
    events: { total: 0, upcoming: [], today: [] },
    notifications: { total: 0, unread: 0, recent: [] },
    activities: { recent: [] }
  };

  // Extract arrays from the structured data
  const upcomingDeadlines = tasks.upcomingDeadlines || [];
  const upcomingEvents = events.upcoming || [];
  const recentActivities = activities.recent || [];
  const recentNotifications = notifications.recent || [];

  const stats = [
    {
      name: 'Total Projects',
      value: projects.total,
      icon: FolderIcon,
      color: 'text-[#0FC2C0]',
      bg: 'bg-[#0FC2C0]/10'
    },
    {
      name: 'Active Tasks',
      value: tasks.pending,
      icon: CheckCircleIcon,
      color: 'text-[#0CABA8]',
      bg: 'bg-[#0CABA8]/10'
    },
    {
      name: 'Upcoming Events',
      value: upcomingEvents.length,
      icon: Calendar,
      color: 'text-[#015958]',
      bg: 'bg-[#015958]/10'
    },
    {
      name: 'Notifications',
      value: notifications.unread,
      icon: BellIcon,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Connection Status Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#015958]">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-[#0CABA8]">{dynamicHeader || "Here's what's happening with your work today."}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-600">Live updates active</span>
              </>
            ) : connectionStatus === 'disconnected' ? (
              <>
                <WifiOff className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-600">Offline - trying to reconnect</span>
              </>
            ) : (
              <>
                <RotateCw className="h-5 w-5 animate-spin text-yellow-600" />
                <span className="text-sm text-yellow-600">Connecting...</span>
              </>
            )}
            <button
              onClick={refresh}
              className="ml-2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh dashboard"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-[#015958]">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Real-Time Analytics Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#015958]">Real-Time Analytics</h2>
            <span className="text-sm text-gray-500">Updates automatically</span>
          </div>
          <RealTimeAnalytics workspaceId={currentWorkspaceId} />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                <h2 className="text-lg font-semibold text-[#015958]">Upcoming Deadlines</h2>
              </div>
            </div>
            <div className="p-6">
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {upcomingDeadlines.slice(0, 5).map((task: Task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#015958]">{task.title}</p>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-[#0FC2C0] mr-2" />
              <h2 className="text-lg font-semibold text-[#015958]">Upcoming Events</h2>
            </div>
          </div>
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event: Event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-[#015958]">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.start_date).toLocaleDateString()} at{' '}
                        {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {event.all_day && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        All Day
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-[#0CABA8] mr-2" />
              <h2 className="text-lg font-semibold text-[#015958]">Recent Activity</h2>
            </div>
          </div>
          <div className="p-6">
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity: Activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-[#015958]">{activity.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <BellIcon className="h-5 w-5 text-orange-500 mr-2" />
              <h2 className="text-lg font-semibold text-[#015958]">Recent Notifications</h2>
            </div>
          </div>
          <div className="p-6">
            {recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.slice(0, 5).map((notification: Notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg ${
                    notification.is_read ? 'bg-gray-50' : 'bg-yellow-50'
                  }`}>
                    <p className="font-medium text-[#015958]">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No notifications</p>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
} 