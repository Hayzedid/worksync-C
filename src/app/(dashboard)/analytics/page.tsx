"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { RealTimeAnalytics } from "../../../components/dashboard/RealTimeAnalytics";
import { useRealTimeDashboard } from "../../../hooks/useRealTimeDashboard";
import { Wifi, WifiOff, RotateCw, TrendingUp, BarChart3, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<number | undefined>();
  const { data, loading, error, connectionStatus, refresh } = useRealTimeDashboard(currentWorkspaceId);

  // Get workspace ID from sessionStorage
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <RotateCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading analytics...</span>
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
            <h3 className="text-red-800 font-medium">Error Loading Analytics</h3>
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

  const chartBarStyle = (height: number) => ({ height: `${height}%` });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#015958] flex items-center">
              <BarChart3 className="h-8 w-8 mr-3" />
              Analytics Dashboard
            </h1>
            <p className="text-[#0CABA8] mt-2">
              Real-time insights into your productivity and project progress
            </p>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-600">Live updates active</span>
                </>
              ) : connectionStatus === 'disconnected' ? (
                <>
                  <WifiOff className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-600">Offline</span>
                </>
              ) : (
                <>
                  <RotateCw className="h-5 w-5 animate-spin text-yellow-600" />
                  <span className="text-sm text-yellow-600">Connecting...</span>
                </>
              )}
            </div>
            <button
              onClick={refresh}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
              title="Refresh analytics"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Last Updated Indicator */}
        {data?.lastUpdated && (
          <div className="mb-6 text-sm text-gray-600 flex items-center">
            <Activity className="h-4 w-4 mr-1" />
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </div>
        )}

        {/* Real-Time Analytics Grid */}
        <div className="mb-8">
          <RealTimeAnalytics workspaceId={currentWorkspaceId} />
        </div>

        {/* Additional Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Completion Trend */}
          {data?.analytics?.productivity?.weeklyCompletion && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-[#015958]">Weekly Completion Trend</h3>
              </div>
              <div className="h-40 flex items-end space-x-2">
                {data.analytics.productivity.weeklyCompletion.map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-gradient-to-t from-[#0FC2C0] to-[#0CABA8] rounded-t transition-all duration-500"
                      style={chartBarStyle(Math.max((value / Math.max(...data.analytics.productivity.weeklyCompletion)) * 100, 5))}
                    ></div>
                    <div className="text-xs text-gray-600 mt-1">
                      Day {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Burndown Chart */}
          {data?.analytics?.workload?.burndownData && data.analytics.workload.burndownData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-[#015958]">Burndown Chart</h3>
              </div>
              <div className="h-40 flex items-end space-x-1">
                {data.analytics.workload.burndownData.map((point, index) => {
                  const maxRemaining = Math.max(...data.analytics.workload.burndownData.map(p => p.remaining));
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-red-400 to-red-300 rounded-t transition-all duration-500"
                        style={chartBarStyle(Math.max((point.remaining / maxRemaining) * 100, 5))}
                      ></div>
                      <div className="text-xs text-gray-600 mt-1 transform -rotate-45 origin-bottom-left">
                        {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Workspace-specific info */}
        {currentWorkspaceId && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              📊 Analytics filtered for workspace ID: {currentWorkspaceId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


