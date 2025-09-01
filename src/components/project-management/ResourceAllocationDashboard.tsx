import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Settings,
  Plus,
  Edit3,
  Trash2,
  User,
  CheckCircle
} from 'lucide-react';
import { useResourceAllocation, ResourceAllocation, TeamMember } from '../../hooks/project-management/useResourceAllocation';
import { useAuth } from '../../hooks/useAuth';
import './resource-allocation.css';

interface ResourceAllocationDashboardProps {
  workspaceId: string;
  className?: string;
}

export function ResourceAllocationDashboard({ workspaceId, className = '' }: ResourceAllocationDashboardProps) {
  const auth = useAuth();
  const {
    allocations,
    teamMembers,
    conflicts,
    utilizationMetrics,
    isLoading,
    error,
    createAllocation,
    updateAllocation,
    deleteAllocation,
    resolveConflict,
    getUtilizationReport,
    getCapacityForecast,
    optimizeAllocations,
    bulkUpdateAllocations
  } = useResourceAllocation();

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedView, setSelectedView] = useState<'calendar' | 'utilization' | 'conflicts'>('utilization');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const workspaceAllocations = allocations.filter(a => a.workspaceId === workspaceId);
  const workspaceConflicts = conflicts.filter(c => 
    workspaceAllocations.some(a => a.id === c.allocationId)
  );

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 70) return '#10b981'; // Green - under-utilized
    if (utilization <= 100) return '#3b82f6'; // Blue - optimal
    if (utilization <= 120) return '#f59e0b'; // Yellow - over-allocated
    return '#ef4444'; // Red - severely over-allocated
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  if (isLoading) {
    return (
      <div className={`resource-loading ${className}`}>
        <div className="loading-spinner">
          <Users className="spinner-icon" />
          <p>Loading resource allocation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`resource-error ${className}`}>
        <AlertTriangle className="error-icon" />
        <h3>Failed to load resource allocation</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`resource-allocation-dashboard ${className}`}>
      {/* Header */}
      <div className="resource-header">
        <div className="header-info">
          <h1 className="resource-title">Resource Allocation</h1>
          <p className="resource-subtitle">
            Manage team resources and optimize capacity utilization
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="optimize-btn"
            onClick={() => setShowOptimizationModal(true)}
            title="Optimize allocations"
            aria-label="Optimize allocations"
          >
            <Target size={20} />
            Optimize
          </button>
          <button 
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            Add Allocation
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-overview">
        <div className="metric-card">
          <div className="metric-icon utilization">
            <BarChart3 size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {formatPercentage(utilizationMetrics.averageUtilization)}
            </div>
            <div className="metric-label">Average Utilization</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon capacity">
            <Users size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {formatHours(utilizationMetrics.totalCapacity)}
            </div>
            <div className="metric-label">Total Capacity</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon allocated">
            <Clock size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {formatHours(utilizationMetrics.allocatedHours)}
            </div>
            <div className="metric-label">Allocated Hours</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon conflicts">
            <AlertTriangle size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-value">{workspaceConflicts.length}</div>
            <div className="metric-label">Active Conflicts</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="resource-controls">
        <div className="view-controls">
          <div className="period-selector">
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
            <button 
              className={`period-btn ${selectedPeriod === 'quarter' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('quarter')}
            >
              Quarter
            </button>
          </div>
          
          <div className="view-mode-selector">
            <button 
              className={`view-btn ${selectedView === 'utilization' ? 'active' : ''}`}
              onClick={() => setSelectedView('utilization')}
            >
              <BarChart3 size={16} />
              Utilization
            </button>
            <button 
              className={`view-btn ${selectedView === 'calendar' ? 'active' : ''}`}
              onClick={() => setSelectedView('calendar')}
            >
              <Calendar size={16} />
              Calendar
            </button>
            <button 
              className={`view-btn ${selectedView === 'conflicts' ? 'active' : ''}`}
              onClick={() => setSelectedView('conflicts')}
            >
              <AlertTriangle size={16} />
              Conflicts ({workspaceConflicts.length})
            </button>
          </div>
        </div>

        <div className="action-controls">
          <button 
            className="export-btn"
            onClick={() => getUtilizationReport(workspaceId, selectedPeriod)}
            title="Export utilization report"
            aria-label="Export utilization report"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Content Views */}
      <div className="resource-content">
        {selectedView === 'utilization' && (
          <UtilizationView
            teamMembers={teamMembers}
            allocations={workspaceAllocations}
            utilizationMetrics={utilizationMetrics}
            period={selectedPeriod}
            onMemberSelect={setSelectedMember}
          />
        )}
        
        {selectedView === 'calendar' && (
          <CalendarView
            allocations={workspaceAllocations}
            teamMembers={teamMembers}
            period={selectedPeriod}
            onAllocationUpdate={updateAllocation}
            onAllocationDelete={deleteAllocation}
          />
        )}
        
        {selectedView === 'conflicts' && (
          <ConflictsView
            conflicts={workspaceConflicts}
            allocations={workspaceAllocations}
            teamMembers={teamMembers}
            onResolveConflict={resolveConflict}
          />
        )}
      </div>

      {/* Member Detail Sidebar */}
      {selectedMember && (
        <MemberDetailSidebar
          memberId={selectedMember}
          member={teamMembers.find(m => m.id === selectedMember)}
          allocations={workspaceAllocations.filter(a => a.userId === selectedMember)}
          onClose={() => setSelectedMember(null)}
          onAllocationUpdate={updateAllocation}
        />
      )}

      {/* Create Allocation Modal */}
      {showCreateModal && (
        <CreateAllocationModal
          workspaceId={workspaceId}
          teamMembers={teamMembers}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createAllocation}
        />
      )}

      {/* Optimization Modal */}
      {showOptimizationModal && (
        <OptimizationModal
          workspaceId={workspaceId}
          allocations={workspaceAllocations}
          teamMembers={teamMembers}
          onClose={() => setShowOptimizationModal(false)}
          onOptimize={optimizeAllocations}
          onBulkUpdate={bulkUpdateAllocations}
        />
      )}
    </div>
  );
}

interface UtilizationViewProps {
  teamMembers: TeamMember[];
  allocations: ResourceAllocation[];
  utilizationMetrics: any;
  period: string;
  onMemberSelect: (memberId: string) => void;
}

function UtilizationView({ 
  teamMembers, 
  allocations, 
  utilizationMetrics, 
  period, 
  onMemberSelect 
}: UtilizationViewProps) {
  const getUtilizationColor = (utilization: number) => {
    if (utilization < 70) return '#10b981';
    if (utilization <= 100) return '#3b82f6';
    if (utilization <= 120) return '#f59e0b';
    return '#ef4444';
  };

  const getMemberUtilization = (memberId: string) => {
    const memberAllocations = allocations.filter(a => a.userId === memberId);
    const totalAllocated = memberAllocations.reduce((sum, a) => sum + a.hoursPerWeek, 0);
    const member = teamMembers.find(m => m.id === memberId);
    const capacity = member?.capacity || 40;
    return (totalAllocated / capacity) * 100;
  };

  const formatUtilization = (utilization: number) => {
    return `${Math.round(utilization)}%`;
  };

  return (
    <div className="utilization-view">
      <div className="utilization-header">
        <h2>Team Utilization</h2>
        <div className="utilization-legend">
          <div className="legend-item">
            <div className="legend-color under-utilized"></div>
            <span>Under-utilized (&lt;70%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color optimal"></div>
            <span>Optimal (70-100%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color over-allocated"></div>
            <span>Over-allocated (100-120%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color critical"></div>
            <span>Critical (&gt;120%)</span>
          </div>
        </div>
      </div>

      <div className="utilization-grid">
        {teamMembers.map(member => {
          const utilization = getMemberUtilization(member.id);
          const memberAllocations = allocations.filter(a => a.userId === member.id);
          const totalHours = memberAllocations.reduce((sum, a) => sum + a.hoursPerWeek, 0);

          return (
            <div 
              key={member.id}
              className="utilization-card"
              onClick={() => onMemberSelect(member.id)}
            >
              <div className="member-info">
                <div className="member-avatar">
                  <User size={20} />
                </div>
                <div className="member-details">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </div>

              <div className="utilization-chart">
                <div className="chart-container">
                  <div 
                    className="utilization-bar"
                    style={{ 
                      '--utilization-width': `${Math.min(utilization, 150)}%`,
                      '--utilization-color': getUtilizationColor(utilization)
                    } as React.CSSProperties}
                  />
                  <div className="capacity-line" />
                </div>
                <div className="chart-labels">
                  <span className="utilization-percentage">
                    {formatUtilization(utilization)}
                  </span>
                  <span className="hours-allocated">
                    {totalHours}h / {member.capacity}h
                  </span>
                </div>
              </div>

              <div className="allocation-summary">
                <div className="allocation-count">
                  {memberAllocations.length} allocation{memberAllocations.length !== 1 ? 's' : ''}
                </div>
                <div className="skills-preview">
                  {member.skills.slice(0, 2).map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                  {member.skills.length > 2 && (
                    <span className="skill-more">+{member.skills.length - 2}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CalendarViewProps {
  allocations: ResourceAllocation[];
  teamMembers: TeamMember[];
  period: string;
  onAllocationUpdate: (id: string, updates: Partial<ResourceAllocation>) => Promise<void>;
  onAllocationDelete: (id: string) => Promise<void>;
}

function CalendarView({ 
  allocations, 
  teamMembers, 
  period, 
  onAllocationUpdate, 
  onAllocationDelete 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysInPeriod = () => {
    const days = [];
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const getAllocationsForDay = (date: Date, memberId: string) => {
    return allocations.filter(allocation => {
      const startDate = new Date(allocation.startDate);
      const endDate = new Date(allocation.endDate);
      return allocation.userId === memberId && 
             date >= startDate && 
             date <= endDate;
    });
  };

  const days = getDaysInPeriod();

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button 
            className="nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            aria-label="Previous month"
          >
            ←
          </button>
          <h2>{formatDate(currentDate)}</h2>
          <button 
            className="nav-btn"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-sidebar">
          <div className="sidebar-header">Team Members</div>
          {teamMembers.map(member => (
            <div key={member.id} className="member-row">
              <div className="member-info">
                <div className="member-avatar">
                  <User size={16} />
                </div>
                <span className="member-name">{member.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="calendar-timeline">
          <div className="timeline-header">
            {days.slice(0, 7).map(day => (
              <div key={day.toISOString()} className="day-header">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
            ))}
          </div>
          
          {teamMembers.map(member => (
            <div key={member.id} className="member-timeline">
              {days.slice(0, 7).map(day => {
                const dayAllocations = getAllocationsForDay(day, member.id);
                return (
                  <div key={day.toISOString()} className="day-cell">
                    {dayAllocations.map(allocation => (
                      <div 
                        key={allocation.id}
                        className="allocation-block"
                        style={{ '--allocation-opacity': (allocation as any).hoursPerWeek / 40 } as React.CSSProperties}
                        title={`${allocation.projectName} - ${(allocation as any).hoursPerWeek}h/week`}
                      >
                        <span className="allocation-project">{allocation.projectName}</span>
                        <span className="allocation-hours">{allocation.hoursPerWeek}h</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ConflictsViewProps {
  conflicts: any[];
  allocations: ResourceAllocation[];
  teamMembers: TeamMember[];
  onResolveConflict: (conflictId: string, resolution: any) => Promise<void>;
}

function ConflictsView({ conflicts, allocations, teamMembers, onResolveConflict }: ConflictsViewProps) {
  const getConflictSeverity = (conflict: any) => {
    if (conflict.overallocation > 150) return 'critical';
    if (conflict.overallocation > 120) return 'high';
    if (conflict.overallocation > 100) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="conflicts-view">
      <div className="conflicts-header">
        <h2>Resource Conflicts</h2>
        <div className="conflicts-summary">
          <span className="total-conflicts">{conflicts.length} active conflicts</span>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <div className="no-conflicts">
          <CheckCircle className="no-conflicts-icon" />
          <h3>No Resource Conflicts</h3>
          <p>All team members are optimally allocated</p>
        </div>
      ) : (
        <div className="conflicts-list">
          {conflicts.map(conflict => {
            const member = teamMembers.find(m => m.id === conflict.userId);
            const severity = getConflictSeverity(conflict);
            
            return (
              <div key={conflict.id} className={`conflict-card ${severity}`}>
                <div className="conflict-header">
                  <div className="conflict-member">
                    <div className="member-avatar">
                      <User size={16} />
                    </div>
                    <div className="member-info">
                      <h4>{member?.name}</h4>
                      <span className="member-role">{member?.role}</span>
                    </div>
                  </div>
                  
                  <div className="conflict-severity">
                    <span 
                      className={`severity-badge ${severity}`}
                      style={{ '--severity-color': getSeverityColor(severity) } as React.CSSProperties}
                    >
                      {severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="conflict-details">
                  <div className="conflict-metric">
                    <span className="metric-label">Overallocation:</span>
                    <span className="metric-value">{Math.round(conflict.overallocation)}%</span>
                  </div>
                  <div className="conflict-metric">
                    <span className="metric-label">Period:</span>
                    <span className="metric-value">
                      {formatDate(conflict.startDate)} - {formatDate(conflict.endDate)}
                    </span>
                  </div>
                  <div className="conflict-metric">
                    <span className="metric-label">Conflicting Projects:</span>
                    <span className="metric-value">{conflict.conflictingAllocations.length}</span>
                  </div>
                </div>

                <div className="conflicting-allocations">
                  <h5>Conflicting Allocations:</h5>
                  {conflict.conflictingAllocations.map((allocationId: string) => {
                    const allocation = allocations.find(a => a.id === allocationId);
                    return (
                      <div key={allocationId} className="allocation-item">
                        <span className="allocation-project">{allocation?.projectName}</span>
                        <span className="allocation-hours">{allocation?.hoursPerWeek}h/week</span>
                      </div>
                    );
                  })}
                </div>

                <div className="conflict-actions">
                  <button 
                    className="resolve-btn"
                    onClick={() => onResolveConflict(conflict.id, { type: 'auto' })}
                  >
                    Auto Resolve
                  </button>
                  <button 
                    className="manual-resolve-btn"
                    onClick={() => onResolveConflict(conflict.id, { type: 'manual' })}
                  >
                    Manual Resolve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface MemberDetailSidebarProps {
  memberId: string;
  member?: TeamMember;
  allocations: ResourceAllocation[];
  onClose: () => void;
  onAllocationUpdate: (id: string, updates: Partial<ResourceAllocation>) => Promise<void>;
}

function MemberDetailSidebar({ 
  member, 
  allocations, 
  onClose, 
  onAllocationUpdate 
}: MemberDetailSidebarProps) {
  if (!member) return null;

  const totalAllocated = allocations.reduce((sum, a) => sum + a.hoursPerWeek, 0);
  const utilization = (totalAllocated / member.capacity) * 100;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="member-sidebar">
      <div className="sidebar-header">
        <div className="member-header-info">
          <div className="member-avatar large">
            <User size={24} />
          </div>
          <div className="member-details">
            <h2>{member.name}</h2>
            <p>{member.role}</p>
          </div>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
          ×
        </button>
      </div>

      <div className="sidebar-content">
        <div className="member-stats">
          <div className="stat-item">
            <span className="stat-label">Capacity:</span>
            <span className="stat-value">{member.capacity}h/week</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Allocated:</span>
            <span className="stat-value">{totalAllocated}h/week</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Utilization:</span>
            <span className={`stat-value ${utilization > 100 ? 'over-allocated' : 'normal'}`}>
              {Math.round(utilization)}%
            </span>
          </div>
        </div>

        <div className="skills-section">
          <h3>Skills</h3>
          <div className="skills-list">
            {member.skills.map(skill => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>

        <div className="allocations-section">
          <h3>Current Allocations ({allocations.length})</h3>
          <div className="allocations-list">
            {allocations.map(allocation => (
              <div key={allocation.id} className="allocation-card">
                <div className="allocation-header">
                  <h4>{allocation.projectName}</h4>
                  <span className="allocation-hours">{allocation.hoursPerWeek}h/week</span>
                </div>
                
                <div className="allocation-details">
                  <div className="allocation-period">
                    {formatDate(allocation.startDate)} - {formatDate(allocation.endDate)}
                  </div>
                  <div className="allocation-role">{allocation.role}</div>
                </div>

                <div className="allocation-actions">
                  <button 
                    className="edit-allocation-btn"
                    onClick={() => {/* Open edit modal */}}
                    title="Edit allocation"
                    aria-label="Edit allocation"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {allocations.length === 0 && (
            <div className="no-allocations">
              <Users className="no-allocations-icon" />
              <p>No current allocations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CreateAllocationModalProps {
  workspaceId: string;
  teamMembers: TeamMember[];
  onClose: () => void;
  onSubmit: (allocation: Omit<ResourceAllocation, 'id'>) => Promise<void>;
}

function CreateAllocationModal({ workspaceId, teamMembers, onClose, onSubmit }: CreateAllocationModalProps) {
  const [formData, setFormData] = useState({
    userId: '',
    projectId: '',
    projectName: '',
    role: '',
    hoursPerWeek: '',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      ...formData,
      workspaceId,
      hoursPerWeek: parseFloat(formData.hoursPerWeek),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-allocation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Resource Allocation</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="allocation-form">
          <div className="form-group">
            <label htmlFor="userId">Team Member</label>
            <select
              id="userId"
              aria-label="Select team member"
              value={formData.userId}
              onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
              required
            >
              <option value="">Select team member</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectName">Project</label>
              <input
                id="projectName"
                type="text"
                aria-label="Project name"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="Project name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <input
                id="role"
                type="text"
                aria-label="Role in project"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Role in project"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="hoursPerWeek">Hours per Week</label>
            <input
              id="hoursPerWeek"
              type="number"
              aria-label="Hours per week"
              min="1"
              max="40"
              step="0.5"
              value={formData.hoursPerWeek}
              onChange={(e) => setFormData(prev => ({ ...prev, hoursPerWeek: e.target.value }))}
              placeholder="20"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                type="date"
                aria-label="Allocation start date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="date"
                aria-label="Allocation end date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Users size={16} />
              Create Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface OptimizationModalProps {
  workspaceId: string;
  allocations: ResourceAllocation[];
  teamMembers: TeamMember[];
  onClose: () => void;
  onOptimize: (workspaceId: string, criteria: any) => Promise<any>;
  onBulkUpdate: (updates: any[]) => Promise<void>;
}

function OptimizationModal({ 
  workspaceId, 
  allocations, 
  teamMembers, 
  onClose, 
  onOptimize, 
  onBulkUpdate 
}: OptimizationModalProps) {
  const [optimizationCriteria, setOptimizationCriteria] = useState({
    balanceUtilization: true,
    skillMatching: true,
    minimizeConflicts: true,
    respectCapacity: true
  });
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const result = await onOptimize(workspaceId, optimizationCriteria);
      setOptimizationResult(result);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimization = async () => {
    if (optimizationResult?.recommendations) {
      await onBulkUpdate(optimizationResult.recommendations);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="optimization-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Optimize Resource Allocation</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="optimization-content">
          <div className="criteria-section">
            <h3>Optimization Criteria</h3>
            <div className="criteria-options">
              <label className="criteria-option">
                <input
                  type="checkbox"
                  aria-label="Balance team utilization"
                  checked={optimizationCriteria.balanceUtilization}
                  onChange={(e) => setOptimizationCriteria(prev => ({ 
                    ...prev, 
                    balanceUtilization: e.target.checked 
                  }))}
                />
                <span>Balance team utilization</span>
              </label>
              
              <label className="criteria-option">
                <input
                  type="checkbox"
                  aria-label="Match skills to requirements"
                  checked={optimizationCriteria.skillMatching}
                  onChange={(e) => setOptimizationCriteria(prev => ({ 
                    ...prev, 
                    skillMatching: e.target.checked 
                  }))}
                />
                <span>Match skills to requirements</span>
              </label>
              
              <label className="criteria-option">
                <input
                  type="checkbox"
                  aria-label="Minimize scheduling conflicts"
                  checked={optimizationCriteria.minimizeConflicts}
                  onChange={(e) => setOptimizationCriteria(prev => ({ 
                    ...prev, 
                    minimizeConflicts: e.target.checked 
                  }))}
                />
                <span>Minimize scheduling conflicts</span>
              </label>
              
              <label className="criteria-option">
                <input
                  type="checkbox"
                  aria-label="Respect capacity limits"
                  checked={optimizationCriteria.respectCapacity}
                  onChange={(e) => setOptimizationCriteria(prev => ({ 
                    ...prev, 
                    respectCapacity: e.target.checked 
                  }))}
                />
                <span>Respect capacity limits</span>
              </label>
            </div>
          </div>

          {optimizationResult && (
            <div className="optimization-results">
              <h3>Optimization Results</h3>
              <div className="results-summary">
                <div className="result-metric">
                  <span className="metric-label">Efficiency Gain:</span>
                  <span className="metric-value positive">
                    +{optimizationResult.efficiencyGain}%
                  </span>
                </div>
                <div className="result-metric">
                  <span className="metric-label">Conflicts Resolved:</span>
                  <span className="metric-value">{optimizationResult.conflictsResolved}</span>
                </div>
                <div className="result-metric">
                  <span className="metric-label">Recommendations:</span>
                  <span className="metric-value">{optimizationResult.recommendations?.length || 0}</span>
                </div>
              </div>
            </div>
          )}

          <div className="optimization-actions">
            {!optimizationResult ? (
              <button 
                className="optimize-btn"
                onClick={handleOptimize}
                disabled={isOptimizing}
              >
                {isOptimizing ? (
                  <>
                    <div className="spinner" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Target size={16} />
                    Run Optimization
                  </>
                )}
              </button>
            ) : (
              <div className="result-actions">
                <button className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleApplyOptimization}>
                  <CheckCircle size={16} />
                  Apply Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
