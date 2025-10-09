'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useTimeTracking } from '../../../hooks/project-management/useTimeTracking';
import { TimeTrackingDashboard } from '../../../components/project-management/TimeTrackingDashboard';
import { Clock, Play, Pause, Square, BarChart3, ChevronDown, X } from 'lucide-react';
import { api } from '../../../api';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
}

export default function TimeTrackingPage() {
  const { user } = useAuth();
  const { 
    activeTimer, 
    startTimer, 
    stopTimer, 
    pauseTimer, 
    resumeTimer,
    isLoading: timeTrackingLoading,
    error: timeTrackingError
  } = useTimeTracking();

  // State management
  const [workspaceId, setWorkspaceId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get current workspace ID from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('current_workspace_id');
      if (stored) {
        setWorkspaceId(stored);
      }
    }
  }, []);

  // Load projects and tasks when workspace changes
  useEffect(() => {
    if (workspaceId) {
      loadProjectsAndTasks();
    }
  }, [workspaceId]);

  // Real-time timer update
  useEffect(() => {
    if (!activeTimer?.isRunning) return;

    const interval = setInterval(() => {
      // Timer updates are handled by the useTimeTracking hook
      // This effect just ensures the component re-renders every second
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning]);

  const loadProjectsAndTasks = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes] = await Promise.all([
        api.get('/projects', { params: { workspace_id: workspaceId } }),
        api.get('/tasks', { params: { workspace_id: workspaceId } })
      ]);

      setProjects(Array.isArray(projectsRes) ? projectsRes : []);
      setTasks(Array.isArray(tasksRes) ? tasksRes : []);
    } catch (error) {
      console.error('Failed to load projects and tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Timer action handlers
  const handleStartTimer = async () => {
    if (!description.trim()) {
      alert('Please enter a description for what you\'re working on');
      return;
    }

    try {
      await startTimer(selectedTask || undefined, selectedProject || undefined, description);
      setDescription('');
      setSelectedProject('');
      setSelectedTask('');
    } catch (error) {
      console.error('Failed to start timer:', error);
      alert('Failed to start timer. Please try again.');
    }
  };

  const handleStopTimer = async () => {
    try {
      await stopTimer();
    } catch (error) {
      console.error('Failed to stop timer:', error);
      alert('Failed to stop timer. Please try again.');
    }
  };

  const handlePauseTimer = async () => {
    try {
      if (activeTimer?.isRunning) {
        await pauseTimer();
      } else {
        await resumeTimer();
      }
    } catch (error) {
      console.error('Failed to pause/resume timer:', error);
      alert('Failed to pause/resume timer. Please try again.');
    }
  };

  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-8 w-8 text-[#0FC2C0]" />
                <h1 className="text-3xl font-bold text-[#015958]">Time Tracking</h1>
              </div>
              <p className="text-gray-600">
                Track your time, manage productivity, and generate detailed reports
              </p>
            </div>
            
            {/* Active Timer Display */}
            {activeTimer && (
              <div className="bg-white rounded-xl border border-[#0CABA8]/30 p-4 min-w-[200px]">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-[#015958] mb-1">
                    {formatElapsedTime(activeTimer.elapsed)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {activeTimer.description || 'No description'}
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    activeTimer.isRunning 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      activeTimer.isRunning ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    {activeTimer.isRunning ? 'Running' : 'Paused'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timer Setup Form */}
        {!activeTimer && (
          <div className="bg-white rounded-xl border border-[#0CABA8]/30 p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#015958] mb-4">Start New Timer</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Project Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project (Optional)
                </label>
                <button
                  onClick={() => setShowProjectSelector(!showProjectSelector)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex items-center justify-between hover:border-[#0FC2C0] focus:border-[#0FC2C0] focus:outline-none"
                >
                  <span className="text-gray-700">
                    {selectedProject 
                      ? projects.find(p => p.id === selectedProject)?.name || 'Select Project'
                      : 'Select Project'
                    }
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {showProjectSelector && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedProject('');
                        setShowProjectSelector(false);
                      }}
                    >
                      <span className="text-gray-500">No Project</span>
                    </div>
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedProject(project.id);
                          setShowProjectSelector(false);
                        }}
                      >
                        <div className="font-medium text-gray-900">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-gray-500">{project.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Task Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task (Optional)
                </label>
                <button
                  onClick={() => setShowTaskSelector(!showTaskSelector)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex items-center justify-between hover:border-[#0FC2C0] focus:border-[#0FC2C0] focus:outline-none"
                >
                  <span className="text-gray-700">
                    {selectedTask 
                      ? tasks.find(t => t.id === selectedTask)?.title || 'Select Task'
                      : 'Select Task'
                    }
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {showTaskSelector && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    <div
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedTask('');
                        setShowTaskSelector(false);
                      }}
                    >
                      <span className="text-gray-500">No Task</span>
                    </div>
                    {tasks
                      .filter(task => !selectedProject || task.project_id === selectedProject)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedTask(task.id);
                            setShowTaskSelector(false);
                          }}
                        >
                          <div className="font-medium text-gray-900">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-500">{task.description}</div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[#0FC2C0] focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleStartTimer}
              disabled={!description.trim() || loading}
              className="w-full md:w-auto px-6 py-2 bg-[#0FC2C0] text-white rounded-md hover:bg-[#0CABA8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Timer
            </button>
          </div>
        )}

        {/* Quick Actions - Only show when timer is active */}
        {activeTimer && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button 
              className={`bg-white rounded-xl border border-[#0CABA8]/30 p-4 transition-colors cursor-pointer ${
                activeTimer.isRunning 
                  ? 'hover:bg-yellow-50 hover:border-yellow-300' 
                  : 'hover:bg-green-50 hover:border-green-300'
              }`}
              onClick={handlePauseTimer}
              disabled={timeTrackingLoading}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  activeTimer.isRunning ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  {activeTimer.isRunning ? (
                    <Pause className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <Play className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[#015958]">
                    {activeTimer.isRunning ? 'Pause Timer' : 'Resume Timer'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activeTimer.isRunning ? 'Pause current session' : 'Continue timing'}
                  </p>
                </div>
              </div>
            </button>

            <button 
              className="bg-white rounded-xl border border-[#0CABA8]/30 p-4 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
              onClick={handleStopTimer}
              disabled={timeTrackingLoading}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Square className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#015958]">Stop Timer</h3>
                  <p className="text-sm text-gray-600">End current session</p>
                </div>
              </div>
            </button>

            <button 
              className="bg-white rounded-xl border border-[#0CABA8]/30 p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => {
                // Scroll to reports section
                const reportsSection = document.getElementById('reports-section');
                if (reportsSection) {
                  reportsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#015958]">View Reports</h3>
                  <p className="text-sm text-gray-600">Analyze time data</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Time Tracking Dashboard Component */}
        {workspaceId ? (
          <div id="reports-section">
            <TimeTrackingDashboard workspaceId={workspaceId} />
          </div>
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
