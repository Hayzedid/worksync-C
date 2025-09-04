"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { ActivityFeed } from "../../../components/activity/ActivityFeed";
import { Calendar, AlertCircle, Clock, FolderIcon, CheckCircleIcon, BellIcon } from "lucide-react";
import { api } from "../../../api";

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
  workspace_id: number;
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
  // Dynamic header message templates that include a {name} placeholder
  const dynamicHeaderMessages = [
    'What are we working on today, {name}?',
    'Ready to make your work process easier, {name}?',
    'A fresh look at your tasks and projects for you, {name}.',
    'New day, new goals — let\'s prioritize them, {name}.',
    'Quick snapshot of your work and activity, {name}.'
  ];
  const [dynamicHeader, setDynamicHeader] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  // Pick a random header template and replace {name} with the authenticated user's first name
  const displayName = (user && user.firstName) ? user.firstName : 'User';
  const template = dynamicHeaderMessages[Math.floor(Math.random() * dynamicHeaderMessages.length)];
  setDynamicHeader(template.replace('{name}', displayName));

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [
          tasksResponse, 
          projectsResponse, 
          eventsResponse, 
          notificationsResponse,
          activitiesResponse
        ] = await Promise.allSettled([
          api.get('/tasks'),
          api.get('/projects'),
          api.get('/events'),
          api.get('/notifications'),
          api.get('/activity')
        ]);

        // Process tasks
        if (tasksResponse.status === 'fulfilled') {
          const data = tasksResponse.value as any;
          setTasks(data.success ? (data.data || []) : []);
        }

        // Process projects
        if (projectsResponse.status === 'fulfilled') {
          const data = projectsResponse.value as any;
          setProjects(data.success ? (data.data || []) : []);
        }

        // Process events
        if (eventsResponse.status === 'fulfilled') {
          const data = eventsResponse.value as any;
          setEvents(data.success ? (data.data || []) : []);
        }

        // Process notifications
        if (notificationsResponse.status === 'fulfilled') {
          const data = notificationsResponse.value as any;
          setNotifications(data.success ? (data.data || []) : []);
        }

        // Process activities
        if (activitiesResponse.status === 'fulfilled') {
          const data = activitiesResponse.value as any;
          setActivities(data.success ? (data.data || []) : []);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Filter upcoming deadlines (next 7 days)
  const upcomingDeadlines = tasks.filter(task => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= now && dueDate <= weekFromNow;
  });

  // Filter upcoming events (next 7 days)
  const upcomingEvents = events.filter(event => {
    if (!event.start_date) return false;
    const eventDate = new Date(event.start_date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= now && eventDate <= weekFromNow;
  });

  // Filter recent activities (last 5)
  const recentActivities = activities.slice(0, 5);

  // Filter unread notifications
  const unreadNotifications = notifications.filter(notif => !notif.is_read);

  const stats = [
    {
      name: 'Total Projects',
      value: projects.length,
      icon: FolderIcon,
      color: 'text-[#0FC2C0]',
      bg: 'bg-[#0FC2C0]/10'
    },
    {
      name: 'Active Tasks',
      value: tasks.filter(t => t.status !== 'done').length,
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
      value: unreadNotifications.length,
      icon: BellIcon,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#015958]">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
  <p className="text-[#0CABA8]">{dynamicHeader || "Here's what's happening with your work today."}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                {upcomingDeadlines.slice(0, 5).map((task) => (
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
                {upcomingEvents.slice(0, 5).map((event) => (
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
                {recentActivities.map((activity) => (
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
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
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
  );
} 