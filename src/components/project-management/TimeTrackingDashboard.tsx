import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  Target,
  TrendingUp,
  User,
  BarChart3,
  Download,
  Settings,
  Timer,
  PlayCircle,
  StopCircle
} from 'lucide-react';
import { useTimeTracking, TimeEntry } from '../../hooks/project-management/useTimeTracking';
import { useAuth } from '../../hooks/useAuth';
import './time-tracking.css';

interface TimeTrackingDashboardProps {
  workspaceId: string;
  className?: string;
}

export function TimeTrackingDashboard({ workspaceId, className = '' }: TimeTrackingDashboardProps) {
  const auth = useAuth();
  const {
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
    settings,
    updateSettings,
    getTotalHoursToday,
    getTotalHoursWeek,
    getAverageHoursPerDay,
    getProductivityScore
  } = useTimeTracking();

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const handleStartTimer = async (description?: string) => {
    await startTimer(undefined, undefined, description || 'Working on task');
  };

  const handleStopTimer = async () => {
    await stopTimer();
  };

  if (isLoading) {
    return (
      <div className={`time-tracking-loading ${className}`}>
        <div className="loading-spinner">
          <Clock className="spinner-icon" />
          <p>Loading time tracking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`time-tracking-error ${className}`}>
        <Target className="error-icon" />
        <h3>Failed to load time tracking</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`time-tracking-dashboard ${className}`}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h1 className="dashboard-title">Time Tracking</h1>
          <p className="dashboard-subtitle">
            Track your time and boost productivity
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="settings-btn"
            onClick={() => setShowSettings(true)}
            title="Time tracking settings"
            aria-label="Time tracking settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Timer Section */}
      <div className="timer-section">
        <div className="active-timer">
          <div className="timer-display">
            <div className="timer-icon">
              <Timer size={24} />
            </div>
            <div className="timer-info">
              <div className="timer-time">
                {activeTimer ? formatTime(activeTimer.elapsed) : '00:00:00'}
              </div>
              <div className="timer-description">
                {activeTimer?.description || 'No active timer'}
              </div>
            </div>
          </div>
          
          <div className="timer-controls">
            {!isTimerRunning ? (
              <button 
                className="timer-btn start"
                onClick={() => handleStartTimer()}
              >
                <PlayCircle size={20} />
                Start
              </button>
            ) : (
              <>
                <button 
                  className="timer-btn pause"
                  onClick={pauseTimer}
                >
                  <Pause size={20} />
                  Pause
                </button>
                <button 
                  className="timer-btn stop"
                  onClick={handleStopTimer}
                >
                  <StopCircle size={20} />
                  Stop
                </button>
              </>
            )}
            
            {activeTimer && !isTimerRunning && (
              <button 
                className="timer-btn resume"
                onClick={resumeTimer}
              >
                <Play size={20} />
                Resume
              </button>
            )}
          </div>
        </div>

        {/* Quick Start Options */}
        <div className="quick-start">
          <h3>Quick Start</h3>
          <div className="quick-options">
            <button 
              className="quick-option"
              onClick={() => handleStartTimer('Development work')}
            >
              <Target size={16} />
              Development
            </button>
            <button 
              className="quick-option"
              onClick={() => handleStartTimer('Meeting')}
            >
              <User size={16} />
              Meeting
            </button>
            <button 
              className="quick-option"
              onClick={() => handleStartTimer('Research')}
            >
              <BarChart3 size={16} />
              Research
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon today">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatDuration(getTotalHoursToday())}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon week">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatDuration(getTotalHoursWeek())}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon average">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatDuration(getAverageHoursPerDay())}</div>
            <div className="stat-label">Daily Average</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon productivity">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{getProductivityScore()}%</div>
            <div className="stat-label">Productivity</div>
          </div>
        </div>
      </div>

      {/* Time Entries */}
      <div className="time-entries-section">
        <div className="section-header">
          <h2>Recent Entries</h2>
          <div className="section-actions">
            <div className="period-selector">
              <button 
                className={`period-btn ${selectedPeriod === 'today' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('today')}
              >
                Today
              </button>
              <button 
                className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('week')}
              >
                Week
              </button>
              <button 
                className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </button>
            </div>
            
            <button 
              className="add-entry-btn"
              onClick={() => setShowManualEntry(true)}
            >
              <Clock size={16} />
              Add Entry
            </button>
          </div>
        </div>

        <div className="time-entries-list">
          {(selectedPeriod === 'today' ? todayEntries : 
            selectedPeriod === 'week' ? weekEntries : 
            timeEntries).map(entry => (
            <TimeEntryCard
              key={entry.id}
              entry={entry}
              onUpdate={(updates) => updateTimeEntry(entry.id, updates)}
              onDelete={() => deleteTimeEntry(entry.id)}
            />
          ))}
        </div>

        {(selectedPeriod === 'today' ? todayEntries : 
          selectedPeriod === 'week' ? weekEntries : 
          timeEntries).length === 0 && (
          <div className="empty-entries">
            <Clock className="empty-icon" />
            <h3>No time entries</h3>
            <p>Start tracking your time to see entries here</p>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualTimeEntryModal
          onClose={() => setShowManualEntry(false)}
          onSubmit={addTimeEntry}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <TimeTrackingSettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onUpdate={updateSettings}
        />
      )}
    </div>
  );
}

interface TimeEntryCardProps {
  entry: TimeEntry;
  onUpdate: (updates: Partial<TimeEntry>) => void;
  onDelete: () => void;
}

function TimeEntryCard({ entry, onUpdate, onDelete }: TimeEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const formatTime = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="time-entry-card">
      <div className="entry-main">
        <div className="entry-info">
          <h4 className="entry-description">{entry.description}</h4>
          <div className="entry-meta">
            <span className="entry-date">{formatDate(entry.startTime)}</span>
            {entry.tags.length > 0 && (
              <div className="entry-tags">
                {entry.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="entry-duration">
          <span className="duration-text">{formatTime(entry.duration)}</span>
          {entry.billable && <span className="billable-indicator">$</span>}
        </div>
      </div>

      <div className="entry-actions">
        <button 
          className="action-btn edit"
          onClick={() => setIsEditing(true)}
          title="Edit entry"
          aria-label="Edit entry"
        >
          <Clock size={14} />
        </button>
        <button 
          className="action-btn delete"
          onClick={onDelete}
          title="Delete entry"
          aria-label="Delete entry"
        >
          <Target size={14} />
        </button>
      </div>
    </div>
  );
}

interface ManualTimeEntryModalProps {
  onClose: () => void;
  onSubmit: (entry: any) => Promise<void>;
}

function ManualTimeEntryModal({ onClose, onSubmit }: ManualTimeEntryModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    duration: '',
    startTime: new Date().toISOString().slice(0, 16),
    billable: true,
    tags: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const durationSeconds = parseFloat(formData.duration) * 3600; // Convert hours to seconds
    const startTime = new Date(formData.startTime).toISOString();
    const endTime = new Date(new Date(formData.startTime).getTime() + durationSeconds * 1000).toISOString();

    await onSubmit({
      ...formData,
      startTime,
      endTime,
      duration: durationSeconds,
      isRunning: false,
      workspaceId: 'current-workspace'
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="manual-entry-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Time Entry</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              aria-label="Time entry description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What did you work on?"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                id="startTime"
                type="datetime-local"
                aria-label="Start time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (hours)</label>
              <input
                id="duration"
                type="number"
                aria-label="Duration in hours"
                step="0.25"
                min="0.25"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="2.5"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                aria-label="Billable time"
                checked={formData.billable}
                onChange={(e) => setFormData(prev => ({ ...prev, billable: e.target.checked }))}
              />
              <span className="checkmark"></span>
              Billable time
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Clock size={16} />
              Add Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TimeTrackingSettingsModalProps {
  settings: any;
  onClose: () => void;
  onUpdate: (newSettings: any) => Promise<void>;
}

function TimeTrackingSettingsModal({ settings, onClose, onUpdate }: TimeTrackingSettingsModalProps) {
  const [formData, setFormData] = useState(settings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Time Tracking Settings</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="hourlyRate">Default Hourly Rate ($)</label>
            <input
              id="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.defaultHourlyRate}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultHourlyRate: parseFloat(e.target.value) }))}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.autoStopTimer}
                onChange={(e) => setFormData(prev => ({ ...prev, autoStopTimer: e.target.checked }))}
              />
              <span className="checkmark"></span>
              Auto-stop timer after long periods
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.requireDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, requireDescription: e.target.checked }))}
              />
              <span className="checkmark"></span>
              Require description for time entries
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Settings size={16} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
