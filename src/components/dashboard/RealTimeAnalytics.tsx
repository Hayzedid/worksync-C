"use client";

import { useRealTimeDashboard } from "../../hooks/useRealTimeDashboard";
import { TrendingUp, TrendingDown, Minus, BarChart3, Target, Clock, CheckCircle } from "lucide-react";

interface RealTimeAnalyticsProps {
  workspaceId?: number;
}

export function RealTimeAnalytics({ workspaceId }: RealTimeAnalyticsProps) {
  const { data, loading, error } = useRealTimeDashboard(workspaceId);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Error loading analytics: {error}</p>
      </div>
    );
  }

  const { tasks, projects, analytics } = data || {
    tasks: { total: 0, pending: 0, completed: 0, overdue: 0, byPriority: { high: 0, medium: 0, low: 0 }, byStatus: {}, upcomingDeadlines: [] },
    projects: { total: 0, active: 0, completed: 0, onHold: 0, byWorkspace: {} },
    analytics: {
      productivity: { score: 0, trend: 'stable' as const, weeklyCompletion: [] },
      workload: { currentCapacity: 0, utilizationRate: 0, burndownData: [] }
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Productivity Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-[#015958]">Productivity Score</h3>
          </div>
          <div className={`flex items-center ${getTrendColor(analytics.productivity.trend)}`}>
            {getTrendIcon(analytics.productivity.trend)}
            <span className="text-sm ml-1 capitalize">{analytics.productivity.trend}</span>
          </div>
        </div>
        <div className="text-3xl font-bold text-[#015958] mb-2">
          {analytics.productivity.score}%
        </div>
        <p className="text-sm text-gray-600">
          Based on task completion rates and deadlines met
        </p>
      </div>

      {/* Current Workload */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-[#015958]">Current Workload</h3>
        </div>
        <div className="text-3xl font-bold text-[#015958] mb-2">
          {analytics.workload.utilizationRate}%
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-[#0FC2C0] to-[#0CABA8] h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(analytics.workload.utilizationRate, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          Capacity: {analytics.workload.currentCapacity} active tasks
        </p>
      </div>

      {/* Task Completion Rate */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-[#015958]">Completion Rate</h3>
        </div>
        <div className="text-3xl font-bold text-[#015958] mb-2">
          {tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0}%
        </div>
        <p className="text-sm text-gray-600">
          {tasks.completed} of {tasks.total} total tasks completed
        </p>
      </div>

      {/* Project Status Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-[#015958]">Project Status</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Active</span>
            <span className="font-semibold text-[#015958]">{projects.active}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="font-semibold text-green-600">{projects.completed}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">On Hold</span>
            <span className="font-semibold text-yellow-600">{projects.onHold}</span>
          </div>
        </div>
      </div>

      {/* Task Priority Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-orange-600 mr-2" />
          <h3 className="text-lg font-semibold text-[#015958]">Task Priority</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">High</span>
            </div>
            <span className="font-semibold text-[#015958]">{tasks.byPriority.high}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Medium</span>
            </div>
            <span className="font-semibold text-[#015958]">{tasks.byPriority.medium}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Low</span>
            </div>
            <span className="font-semibold text-[#015958]">{tasks.byPriority.low}</span>
          </div>
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      {tasks.overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Overdue Tasks</h3>
          </div>
          <div className="text-3xl font-bold text-red-600 mb-2">
            {tasks.overdue}
          </div>
          <p className="text-sm text-red-700">
            Tasks that need immediate attention
          </p>
        </div>
      )}
    </div>
  );
}
