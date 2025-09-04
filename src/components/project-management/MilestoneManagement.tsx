import React, { useState, useEffect } from 'react';
import {
  Target,
  Calendar,
  CheckCircle,
  Clock,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useMilestoneManagement, Milestone, Deliverable } from '../../hooks/project-management/useMilestoneManagement';
import { useAuth } from '../../hooks/useAuth';
import './milestone-management.css';

interface MilestoneManagementProps {
  projectId: string;
  className?: string;
}

export function MilestoneManagement({ projectId, className = '' }: MilestoneManagementProps) {
  const auth = useAuth();
  const {
    milestones,
    deliverables,
    milestoneTemplates,
    isLoading,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    addDeliverable,
    updateDeliverable,
    removeDeliverable,
    getProjectProgress,
    getCriticalPath,
    generateMilestoneReport,
    createFromTemplate
  } = useMilestoneManagement();

  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed' | 'overdue'>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'kanban' | 'list'>('timeline');

  const projectMilestones = milestones.filter(m => m.projectId === projectId);
  const filteredMilestones = projectMilestones.filter(milestone => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'overdue') {
      return milestone.status !== 'completed' && new Date(milestone.dueDate) < new Date();
    }
    return milestone.status === filterStatus;
  });

  const projectProgress = getProjectProgress(projectId);
  const criticalPath = getCriticalPath(projectId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'pending': return '#6b7280';
      default: return '#ef4444';
    }
  };

  const isOverdue = (milestone: Milestone) => {
    return milestone.status !== 'completed' && new Date(milestone.dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className={`milestone-loading ${className}`}>
        <div className="loading-spinner">
          <Target className="spinner-icon" />
          <p>Loading milestones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`milestone-error ${className}`}>
        <AlertTriangle className="error-icon" />
        <h3>Failed to load milestones</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`milestone-management ${className}`}>
      {/* Header */}
      <div className="milestone-header">
        <div className="header-info">
          <h1 className="milestone-title">Project Milestones</h1>
          <p className="milestone-subtitle">
            Track progress and manage project deliverables
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            className="template-btn"
            onClick={() => setShowTemplateModal(true)}
            title="Create from template"
            aria-label="Create from template"
          >
            <FileText size={20} />
            Templates
          </button>
          <button 
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            Add Milestone
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-card">
          <div className="progress-info">
            <h3>Project Progress</h3>
            <div className="progress-stats">
              <span className="progress-percentage">{Math.round(projectProgress.percentage)}%</span>
              <span className="progress-details">
                {projectProgress.completed} of {projectProgress.total} milestones
              </span>
            </div>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar"
              style={{ width: `${projectProgress.percentage}%` }}
            />
          </div>
        </div>

        <div className="milestone-stats">
          <div className="stat-item">
            <div className="stat-icon pending">
              <Clock size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{projectMilestones.filter(m => m.status === 'pending').length}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon in-progress">
              <TrendingUp size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{projectMilestones.filter(m => m.status === 'in-progress').length}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon completed">
              <CheckCircle size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{projectMilestones.filter(m => m.status === 'completed').length}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon overdue">
              <AlertTriangle size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{projectMilestones.filter(m => isOverdue(m)).length}</span>
              <span className="stat-label">Overdue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="milestone-controls">
        <div className="view-controls">
          <div className="view-mode-selector">
            <button 
              className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </button>
            <button 
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <Filter size={16} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        <div className="action-controls">
          <button 
            className="export-btn"
            onClick={() => generateMilestoneReport(projectId)}
            title="Export milestone report"
            aria-label="Export milestone report"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Milestone Views */}
      <div className="milestone-content">
        {viewMode === 'timeline' && (
          <MilestoneTimeline
            milestones={filteredMilestones}
            criticalPath={criticalPath}
            onMilestoneSelect={setSelectedMilestone}
            onMilestoneUpdate={updateMilestone}
            onMilestoneDelete={deleteMilestone}
          />
        )}
        
        {viewMode === 'kanban' && (
          <MilestoneKanban
            milestones={filteredMilestones}
            onMilestoneSelect={setSelectedMilestone}
            onMilestoneUpdate={updateMilestone}
            onMilestoneDelete={deleteMilestone}
          />
        )}
        
        {viewMode === 'list' && (
          <MilestoneList
            milestones={filteredMilestones}
            onMilestoneSelect={setSelectedMilestone}
            onMilestoneUpdate={updateMilestone}
            onMilestoneDelete={deleteMilestone}
          />
        )}
      </div>

      {/* Milestone Detail Sidebar */}
      {selectedMilestone && (
        <MilestoneDetailSidebar
          milestoneId={selectedMilestone}
          milestone={milestones.find(m => m.id === selectedMilestone)}
          deliverables={deliverables.filter(d => d.milestoneId === selectedMilestone)}
          onClose={() => setSelectedMilestone(null)}
          onUpdate={updateMilestone}
          onAddDeliverable={addDeliverable}
          onUpdateDeliverable={updateDeliverable}
          onRemoveDeliverable={removeDeliverable}
        />
      )}

      {/* Create Milestone Modal */}
      {showCreateModal && (
        <CreateMilestoneModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createMilestone}
        />
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <MilestoneTemplateModal
          projectId={projectId}
          templates={milestoneTemplates}
          onClose={() => setShowTemplateModal(false)}
          onCreateFromTemplate={createFromTemplate}
        />
      )}
    </div>
  );
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  criticalPath: string[];
  onMilestoneSelect: (id: string) => void;
  onMilestoneUpdate: (id: string, updates: Partial<Milestone>) => Promise<void>;
  onMilestoneDelete: (id: string) => Promise<void>;
}

function MilestoneTimeline({ 
  milestones, 
  criticalPath, 
  onMilestoneSelect, 
  onMilestoneUpdate, 
  onMilestoneDelete 
}: MilestoneTimelineProps) {
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (milestone: Milestone) => {
    return milestone.status !== 'completed' && new Date(milestone.dueDate) < new Date();
  };

  return (
    <div className="milestone-timeline">
      <div className="timeline-container">
        <div className="timeline-line" />
        {sortedMilestones.map((milestone, index) => (
          <div 
            key={milestone.id}
            className={`timeline-item ${milestone.status} ${isOverdue(milestone) ? 'overdue' : ''} ${criticalPath.includes(milestone.id) ? 'critical' : ''}`}
            onClick={() => onMilestoneSelect(milestone.id)}
          >
            <div className="timeline-marker">
              {milestone.status === 'completed' ? (
                <CheckCircle size={16} />
              ) : (
                <Target size={16} />
              )}
            </div>
            
            <div className="timeline-content">
              <div className="milestone-card">
                <div className="milestone-header">
                  <h3 className="milestone-name">{milestone.title}</h3>
                  <div className="milestone-badges">
                    {criticalPath.includes(milestone.id) && (
                      <span className="critical-badge">Critical</span>
                    )}
                    {isOverdue(milestone) && (
                      <span className="overdue-badge">Overdue</span>
                    )}
                  </div>
                </div>
                
                <p className="milestone-description">{milestone.description}</p>
                
                <div className="milestone-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{formatDate(milestone.dueDate)}</span>
                  </div>
                  <div className="meta-item">
                    <Users size={14} />
                    <span>{milestone.assignedTo.length} assignees</span>
                  </div>
                  <div className="meta-item">
                    <FileText size={14} />
                    <span>{milestone.deliverables?.length || 0} deliverables</span>
                  </div>
                </div>
                
                <div className="milestone-progress">
                  <div className="progress-bar-small">
                    <div 
                      className="progress-fill"
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">{milestone.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MilestoneKanbanProps {
  milestones: Milestone[];
  onMilestoneSelect: (id: string) => void;
  onMilestoneUpdate: (id: string, updates: Partial<Milestone>) => Promise<void>;
  onMilestoneDelete: (id: string) => Promise<void>;
}

function MilestoneKanban({ milestones, onMilestoneSelect, onMilestoneUpdate, onMilestoneDelete }: MilestoneKanbanProps) {
  const columns = [
    { id: 'pending', title: 'Pending', status: 'pending' },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress' },
    { id: 'completed', title: 'Completed', status: 'completed' }
  ];

  const handleDragStart = (e: React.DragEvent, milestoneId: string) => {
    e.dataTransfer.setData('text/plain', milestoneId);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const milestoneId = e.dataTransfer.getData('text/plain');
    await onMilestoneUpdate(milestoneId, { status: newStatus as any });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="milestone-kanban">
      {columns.map(column => (
        <div 
          key={column.id}
          className="kanban-column"
          onDrop={(e) => handleDrop(e, column.status)}
          onDragOver={handleDragOver}
        >
          <div className="column-header">
            <h3>{column.title}</h3>
            <span className="column-count">
              {milestones.filter(m => m.status === column.status).length}
            </span>
          </div>
          
          <div className="column-content">
            {milestones
              .filter(milestone => milestone.status === column.status)
              .map(milestone => (
                <div
                  key={milestone.id}
                  className="kanban-milestone-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, milestone.id)}
                  onClick={() => onMilestoneSelect(milestone.id)}
                >
                  <div className="card-header">
                    <h4>{milestone.title}</h4>
                    <div className="card-actions">
                      <button 
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMilestoneDelete(milestone.id);
                        }}
                        title="Delete milestone"
                        aria-label="Delete milestone"
                      >
                        <Trash2 className="icon-delete" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="card-description">{milestone.description}</p>
                  
                  <div className="card-meta">
                    <div className="meta-item">
                      <Calendar size={12} />
                      <span>{formatDate(milestone.dueDate)}</span>
                    </div>
                    <div className="meta-item">
                      <Users size={12} />
                      <span>{milestone.assignedTo.length}</span>
                    </div>
                  </div>
                  
                  <div className="card-progress">
                    <div className="progress-bar-small">
                      <div 
                        className="progress-fill"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                    <span className="progress-text">{milestone.progress}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface MilestoneListProps {
  milestones: Milestone[];
  onMilestoneSelect: (id: string) => void;
  onMilestoneUpdate: (id: string, updates: Partial<Milestone>) => Promise<void>;
  onMilestoneDelete: (id: string) => Promise<void>;
}

function MilestoneList({ milestones, onMilestoneSelect, onMilestoneUpdate, onMilestoneDelete }: MilestoneListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (milestone: Milestone) => {
    return milestone.status !== 'completed' && new Date(milestone.dueDate) < new Date();
  };

  return (
    <div className="milestone-list">
      <div className="list-header">
        <div className="header-cell">Milestone</div>
        <div className="header-cell">Status</div>
        <div className="header-cell">Due Date</div>
        <div className="header-cell">Progress</div>
        <div className="header-cell">Assignees</div>
        <div className="header-cell">Actions</div>
      </div>
      
      <div className="list-body">
        {milestones.map(milestone => (
          <div 
            key={milestone.id}
            className={`list-row ${isOverdue(milestone) ? 'overdue' : ''}`}
            onClick={() => onMilestoneSelect(milestone.id)}
          >
            <div className="list-cell milestone-info">
              <div className="milestone-title">{milestone.title}</div>
              <div className="milestone-desc">{milestone.description}</div>
            </div>
            
            <div className="list-cell">
              <span className={`status-badge ${milestone.status}`}>
                {milestone.status.replace('-', ' ')}
              </span>
            </div>
            
            <div className="list-cell">
              <div className="date-info">
                <span className="date-text">{formatDate(milestone.dueDate)}</span>
                {isOverdue(milestone) && (
                  <AlertTriangle size={14} className="overdue-icon" />
                )}
              </div>
            </div>
            
            <div className="list-cell">
              <div className="progress-container">
                <div className="progress-bar-small">
                  <div 
                    className="progress-fill"
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
                <span className="progress-text">{milestone.progress}%</span>
              </div>
            </div>
            
            <div className="list-cell">
              <div className="assignee-avatars">
                {milestone.assignedTo.slice(0, 3).map((userId, index) => (
                  <div key={userId} className="assignee-avatar">
                    <Users size={16} />
                  </div>
                ))}
                {milestone.assignedTo.length > 3 && (
                  <span className="assignee-count">+{milestone.assignedTo.length - 3}</span>
                )}
              </div>
            </div>
            
            <div className="list-cell actions">
              <button 
                className="action-btn edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onMilestoneSelect(milestone.id);
                }}
                title="Edit milestone"
                aria-label="Edit milestone"
              >
                <Edit3 size={14} />
              </button>
              <button 
                className="action-btn delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onMilestoneDelete(milestone.id);
                }}
                title="Delete milestone"
                aria-label="Delete milestone"
              >
                <Trash2 className="icon-delete" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MilestoneDetailSidebarProps {
  milestoneId: string;
  milestone?: Milestone;
  deliverables: Deliverable[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Milestone>) => Promise<void>;
  onAddDeliverable: (deliverable: Omit<Deliverable, 'id'>) => Promise<void>;
  onUpdateDeliverable: (id: string, updates: Partial<Deliverable>) => Promise<void>;
  onRemoveDeliverable: (id: string) => Promise<void>;
}

function MilestoneDetailSidebar({ 
  milestone, 
  deliverables, 
  onClose, 
  onUpdate, 
  onAddDeliverable, 
  onUpdateDeliverable, 
  onRemoveDeliverable 
}: MilestoneDetailSidebarProps) {
  const [showAddDeliverable, setShowAddDeliverable] = useState(false);

  if (!milestone) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="milestone-sidebar">
      <div className="sidebar-header">
        <h2>{milestone.title}</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close sidebar">
          ×
        </button>
      </div>

      <div className="sidebar-content">
        <div className="milestone-details">
          <div className="detail-section">
            <h3>Description</h3>
            <p>{milestone.description}</p>
          </div>

          <div className="detail-section">
            <h3>Timeline</h3>
            <div className="timeline-info">
              <div className="timeline-item">
                <span className="timeline-label">Due Date:</span>
                <span className="timeline-value">{formatDate(milestone.dueDate)}</span>
              </div>
              <div className="timeline-item">
                <span className="timeline-label">Status:</span>
                <span className={`status-badge ${milestone.status}`}>
                  {milestone.status.replace('-', ' ')}
                </span>
              </div>
              <div className="timeline-item">
                <span className="timeline-label">Progress:</span>
                <div className="progress-info">
                  <div className="progress-bar-small">
                    <div 
                      className="progress-fill"
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">{milestone.progress}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <h3>Deliverables ({deliverables.length})</h3>
              <button 
                className="add-btn"
                onClick={() => setShowAddDeliverable(true)}
              >
                <Plus size={14} />
                Add
              </button>
            </div>
            
            <div className="deliverables-list">
              {deliverables.map(deliverable => (
                <div key={deliverable.id} className="deliverable-item">
                  <div className="deliverable-header">
                    <div className="deliverable-info">
                      <h4>{deliverable.title}</h4>
                      <span className={`deliverable-status ${deliverable.status}`}>
                        {deliverable.status}
                      </span>
                    </div>
                    <div className="deliverable-actions">
                      <button 
                        className="action-btn"
                        onClick={() => onRemoveDeliverable(deliverable.id)}
                        title="Remove deliverable"
                        aria-label="Remove deliverable"
                      >
                        <Trash2 className="icon-delete" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="deliverable-description">{deliverable.description}</p>
                  
                  {deliverable.files.length > 0 && (
                    <div className="deliverable-files">
                      <h5>Files ({deliverable.files.length})</h5>
                      {deliverable.files.map(file => (
                        <div key={file.id} className="file-item">
                          <FileText size={14} />
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {deliverables.length === 0 && (
              <div className="empty-deliverables">
                <FileText className="empty-icon" />
                <p>No deliverables yet</p>
                <button 
                  className="add-first-btn"
                  onClick={() => setShowAddDeliverable(true)}
                >
                  Add First Deliverable
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddDeliverable && (
        <AddDeliverableModal
          milestoneId={milestone.id}
          onClose={() => setShowAddDeliverable(false)}
          onSubmit={onAddDeliverable}
        />
      )}
    </div>
  );
}

interface CreateMilestoneModalProps {
  projectId: string;
  onClose: () => void;
  onSubmit: (milestone: Omit<Milestone, 'id'>) => Promise<void>;
}

function CreateMilestoneModal({ projectId, onClose, onSubmit }: CreateMilestoneModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      ...formData,
      projectId,
      status: 'pending',
      progress: 0,
      dependencies: [],
      deliverables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="create-milestone-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-milestone-title"
      >
        <div className="modal-header">
          <h2 id="create-milestone-title">Create Milestone</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="milestone-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              aria-label="Milestone title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Milestone title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              aria-label="Milestone description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the milestone objectives"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                aria-label="Milestone due date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                aria-label="Milestone priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Target size={16} />
              Create Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface MilestoneTemplateModalProps {
  projectId: string;
  templates: any[];
  onClose: () => void;
  onCreateFromTemplate: (templateId: string, projectId: string) => Promise<void>;
}

function MilestoneTemplateModal({ projectId, templates, onClose, onCreateFromTemplate }: MilestoneTemplateModalProps) {
  const handleUseTemplate = async (templateId: string) => {
    await onCreateFromTemplate(templateId, projectId);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="template-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-template-title"
      >
        <h2 id="milestone-template-title" className="sr-only">
          Milestone Templates
        </h2>
        <div className="modal-header">
          <h2>Milestone Templates</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="template-grid">
          {templates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <h3>{template.name}</h3>
                <span className="template-category">{template.category}</span>
              </div>
              
              <p className="template-description">{template.description}</p>
              
              <div className="template-stats">
                <span>{template.milestones?.length || 0} milestones</span>
                <span>{template.deliverables?.length || 0} deliverables</span>
              </div>
              
              <button 
                className="use-template-btn"
                onClick={() => handleUseTemplate(template.id)}
              >
                <Plus size={14} />
                Use Template
              </button>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="empty-templates">
            <FileText className="empty-icon" />
            <h3>No templates available</h3>
            <p>Create custom milestone templates to speed up project setup</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface AddDeliverableModalProps {
  milestoneId: string;
  onClose: () => void;
  onSubmit: (deliverable: Omit<Deliverable, 'id'>) => Promise<void>;
}

function AddDeliverableModal({ milestoneId, onClose, onSubmit }: AddDeliverableModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document' as 'document' | 'code' | 'design' | 'review' | 'other',
    status: 'pending' as 'pending' | 'in-progress' | 'completed'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      ...formData,
      milestoneId,
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-deliverable-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Deliverable</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="deliverable-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Deliverable title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what needs to be delivered"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <option value="document">Document</option>
                <option value="code">Code</option>
                <option value="design">Design</option>
                <option value="review">Review</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <FileText size={16} />
              Add Deliverable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
