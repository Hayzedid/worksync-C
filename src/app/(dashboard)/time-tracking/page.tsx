'use client';

import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { TimeTrackingDashboard } from '../../../components/project-management/TimeTrackingDashboard';
import { Clock, Play, Pause, Square, BarChart3 } from 'lucide-react';

export default function TimeTrackingPage() {
  const { user } = useAuth();

  // Get current workspace ID from sessionStorage
  const [workspaceId, setWorkspaceId] = React.useState<string>('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('current_workspace_id');
      if (stored) {
        setWorkspaceId(stored);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-8 w-8 text-[#0FC2C0]" />
            <h1 className="text-3xl font-bold text-[#015958]">Time Tracking</h1>
          </div>
          <p className="text-gray-600">
            Track your time, manage productivity, and generate detailed reports
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-[#0CABA8]/30 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#015958]">Start Timer</h3>
                <p className="text-sm text-gray-600">Begin tracking time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#0CABA8]/30 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Pause className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#015958]">Pause Timer</h3>
                <p className="text-sm text-gray-600">Pause current session</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#0CABA8]/30 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Square className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#015958]">Stop Timer</h3>
                <p className="text-sm text-gray-600">End current session</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#0CABA8]/30 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-[#015958]">View Reports</h3>
                <p className="text-sm text-gray-600">Analyze time data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Tracking Dashboard Component */}
        {workspaceId ? (
          <TimeTrackingDashboard workspaceId={workspaceId} />
        ) : (
          <div className="bg-white rounded-xl border border-[#0CABA8]/30 p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Workspace Selected
            </h3>
            <p className="text-gray-600">
              Please select a workspace to start tracking time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
