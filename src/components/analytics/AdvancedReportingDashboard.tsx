import React, { useState, useEffect, useMemo } from 'react';
import { useAdvancedReporting } from '../../hooks/analytics/useAdvancedReporting';

interface AdvancedReportingDashboardProps {
  workspaceId: string;
}

const AdvancedReportingDashboard: React.FC<AdvancedReportingDashboardProps> = ({
  workspaceId,
}) => {
  const {
    templates,
    executions,
    activeReport,
    isLoading,
    error,
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    pagination,
    actions,
  } = useAdvancedReporting(workspaceId);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterPanel, setFilterPanel] = useState(false);

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filters.length > 0) {
      filtered = filtered.filter(template => {
        return filters.every(filter => {
          // Apply filter logic based on filter configuration
          return true; // Simplified for demo
        });
      });
    }

    // Sort templates
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] ?? '';
      const bValue = b[sortBy as keyof typeof b] ?? '';
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [templates, searchQuery, filters, sortBy, sortOrder]);

  const handleCreateTemplate = async () => {
    setShowCreateModal(true);
  };

  const handleExecuteReport = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowExecuteModal(true);
  };

  const handleExportReport = async (executionId: string, format: 'pdf' | 'excel' | 'csv') => {
    try {
      await actions.exportReport(executionId, format);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--status-success)';
      case 'running': return 'var(--status-warning)';
      case 'failed': return 'var(--status-error)';
      case 'pending': return 'var(--status-info)';
      default: return 'var(--text-secondary)';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project': return 'var(--category-project)';
      case 'time': return 'var(--category-time)';
      case 'resource': return 'var(--category-resource)';
      case 'milestone': return 'var(--category-milestone)';
      case 'custom': return 'var(--category-custom)';
      default: return 'var(--accent-color)';
    }
  };

  if (isLoading) {
    return (
      <div className="reporting-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading reporting dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reporting-dashboard error">
        <div className="error-message">
          <h3>Error Loading Reports</h3>
          <p>{error}</p>
          <button onClick={() => actions.loadTemplates()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reporting-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Advanced Reporting</h1>
          <p>Create, execute, and manage comprehensive reports and analytics</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateTemplate}
          >
            <span className="icon">📊</span>
            Create Report
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="dashboard-controls">
        <div className="search-section">
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              aria-label="Search reports"
              title="Search reports by name, description, or tags"
              placeholder="Search reports by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => actions.searchTemplates(e.target.value)}
            />
          </div>
          <button
            className={`filter-toggle ${filterPanel ? 'active' : ''}`}
            onClick={() => setFilterPanel(!filterPanel)}
          >
            <span className="icon">🔧</span>
            Filters
          </button>
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <span className="icon">⊞</span>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <span className="icon">☰</span>
            </button>
          </div>
        </div>

        {filterPanel && (
          <div className="filter-panel">
            <div className="filter-section">
              <label>Category</label>
              <select aria-label="Filter by category" title="Filter by category" onChange={(e) => actions.setFilters([{ 
                id: 'category', 
                field: 'category', 
                operator: 'equals', 
                value: e.target.value,
                logic: 'AND',
                isRequired: false,
                isUserEditable: true
              }])}>
                <option value="">All Categories</option>
                <option value="project">Project Reports</option>
                <option value="time">Time Tracking</option>
                <option value="resource">Resource Allocation</option>
                <option value="milestone">Milestones</option>
                <option value="custom">Custom Reports</option>
              </select>
            </div>
            <div className="filter-section">
              <label>Type</label>
              <select aria-label="Filter by type" title="Filter by report type">
                <option value="">All Types</option>
                <option value="chart">Charts</option>
                <option value="table">Tables</option>
                <option value="dashboard">Dashboards</option>
                <option value="kpi">KPI Reports</option>
              </select>
            </div>
            <div className="filter-section">
              <label>Sort By</label>
              <select 
                  aria-label="Sort reports by"
                  title="Sort reports by"
                  value={sortBy}
                  onChange={(e) => actions.setSorting(e.target.value, sortOrder)}
                >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="usageCount">Usage Count</option>
                <option value="updatedAt">Last Modified</option>
              </select>
              <button
                className="sort-order"
                onClick={() => actions.setSorting(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reports Grid/List */}
      <div className={`reports-container ${viewMode}`}>
        {viewMode === 'grid' ? (
          <div className="reports-grid">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="report-card">
                <div className="card-header">
                  <div className="report-category" style={{ ['--category-color' as any]: getCategoryColor(template.category) } as React.CSSProperties}>
                    {template.category}
                  </div>
                  <div className="card-actions">
                    <button
                      className="action-btn"
                      onClick={() => handleExecuteReport(template.id)}
                      title="Execute Report"
                    >
                      ▶️
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => actions.setActiveReport(template.id)}
                      title="Edit Report"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                  
                  <div className="report-info">
                    <div className="info-item">
                      <span className="label">Type:</span>
                      <span className="value">{template.type}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Visualizations:</span>
                      <span className="value">{template.visualizations.length}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Usage:</span>
                      <span className="value">{template.usageCount} times</span>
                    </div>
                  </div>

                  {template.tags.length > 0 && (
                    <div className="report-tags">
                      {template.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {template.schedule?.enabled && (
                    <div className="schedule-indicator">
                      <span className="icon">⏰</span>
                      <span>Scheduled: {template.schedule.frequency}</span>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <div className="report-meta">
                    <span className="created-by">
                      Created by {template.createdBy}
                    </span>
                    <span className="created-date">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="sharing-status">
                    {template.sharing.isPublic ? (
                      <span className="public-badge">🌐 Public</span>
                    ) : (
                      <span className="private-badge">🔒 Private</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="reports-list">
            <div className="list-header">
              <div className="header-cell">Name</div>
              <div className="header-cell">Category</div>
              <div className="header-cell">Type</div>
              <div className="header-cell">Usage</div>
              <div className="header-cell">Last Modified</div>
              <div className="header-cell">Actions</div>
            </div>
            {filteredTemplates.map((template) => (
              <div key={template.id} className="list-row">
                <div className="cell name-cell">
                  <div className="report-name">
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                  </div>
                </div>
                <div className="cell category-cell">
                  <span 
                    className="category-badge"
                    style={{ ['--category-color' as any]: getCategoryColor(template.category) } as React.CSSProperties}
                  >
                    {template.category}
                  </span>
                </div>
                <div className="cell type-cell">
                  {template.type}
                </div>
                <div className="cell usage-cell">
                  <span className="usage-count">{template.usageCount}</span>
                  <span className="usage-label">executions</span>
                </div>
                <div className="cell date-cell">
                  {new Date(template.updatedAt).toLocaleDateString()}
                </div>
                <div className="cell actions-cell">
                  <button
                    className="action-btn execute"
                    onClick={() => handleExecuteReport(template.id)}
                    title="Execute Report"
                  >
                    ▶️
                  </button>
                  <button
                    className="action-btn edit"
                    onClick={() => actions.setActiveReport(template.id)}
                    title="Edit Report"
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn share"
                    title="Share Report"
                  >
                    📤
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => actions.deleteTemplate(template.id)}
                    title="Delete Report"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Executions */}
      <div className="recent-executions">
        <div className="section-header">
          <h2>Recent Executions</h2>
          <span className="execution-count">
            {executions.length} executions
          </span>
        </div>
        
        <div className="executions-list">
          {executions.slice(0, 10).map((execution) => (
            <div key={execution.id} className="execution-item">
              <div className="execution-info">
                <div className="execution-header">
                  <h4>{templates.find(t => t.id === execution.reportId)?.name}</h4>
                  <span 
                    className="status-badge"
                    style={{ ['--status-color' as any]: getStatusColor(execution.status) } as React.CSSProperties}
                  >
                    {execution.status}
                  </span>
                </div>
                <div className="execution-meta">
                  <span className="started-at">
                    Started: {new Date(execution.startedAt).toLocaleString()}
                  </span>
                  {execution.duration && (
                    <span className="duration">
                      Duration: {Math.round(execution.duration / 1000)}s
                    </span>
                  )}
                  <span className="executed-by">
                    By: {execution.executedBy}
                  </span>
                </div>
              </div>
              
              <div className="execution-actions">
                {execution.status === 'completed' && execution.result && (
                  <>
                    <button
                      className="export-btn"
                      onClick={() => handleExportReport(execution.id, 'pdf')}
                      title="Export as PDF"
                    >
                      📄
                    </button>
                    <button
                      className="export-btn"
                      onClick={() => handleExportReport(execution.id, 'excel')}
                      title="Export as Excel"
                    >
                      📊
                    </button>
                    <button
                      className="export-btn"
                      onClick={() => handleExportReport(execution.id, 'csv')}
                      title="Export as CSV"
                    >
                      📋
                    </button>
                  </>
                )}
                {execution.status === 'running' && (
                  <div className="progress-indicator">
                    <div className="progress-spinner"></div>
                    <span>Running...</span>
                  </div>
                )}
                {execution.status === 'failed' && (
                  <span className="error-indicator" title={execution.error}>
                    ❌ Failed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => actions.setSorting(sortBy, sortOrder)} // Trigger pagination change
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            onClick={() => actions.setSorting(sortBy, sortOrder)} // Trigger pagination change
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <ReportTemplateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={actions.createTemplate}
        />
      )}

      {showExecuteModal && selectedTemplate && (
        <ReportExecutionModal
          isOpen={showExecuteModal}
          templateId={selectedTemplate}
          template={templates.find(t => t.id === selectedTemplate)}
          onClose={() => {
            setShowExecuteModal(false);
            setSelectedTemplate(null);
          }}
          onExecute={actions.executeReport}
        />
      )}
    </div>
  );
};

// Report Template Creation Modal Component
interface ReportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: any) => Promise<any>;
  template?: any;
}

const ReportTemplateModal: React.FC<ReportTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  template,
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'project',
    type: template?.type || 'chart',
    tags: template?.tags?.join(', ') || '',
    isPublic: template?.isPublic || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData = {
      ...formData,
  tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      config: {
        dateRange: { type: 'relative', period: 'month', offset: 0 },
        groupBy: [],
        metrics: [],
        dimensions: [],
        aggregations: [],
        calculations: [],
        formatting: {
          numberFormat: 'number',
          dateFormat: 'yyyy-MM-dd',
          currencySymbol: '$',
          decimalPlaces: 2,
          thousandsSeparator: ',',
          colorScheme: 'default',
        },
      },
      filters: [],
      visualizations: [],
      sharing: {
        isPublic: formData.isPublic,
        allowedUsers: [],
        allowedRoles: [],
        permissions: {
          view: true,
          edit: false,
          share: false,
          export: true,
        },
      },
      createdBy: 'current-user-id', // This should come from auth context
    };

    try {
      await onSave(templateData);
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content report-template-modal">
        <div className="modal-header">
          <h2>{template ? 'Edit Report Template' : 'Create Report Template'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="template-form">
          <div className="form-group">
            <label htmlFor="name">Report Name</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="project">Project Reports</option>
                <option value="time">Time Tracking</option>
                <option value="resource">Resource Allocation</option>
                <option value="milestone">Milestones</option>
                <option value="custom">Custom Reports</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Report Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="chart">Chart</option>
                <option value="table">Table</option>
                <option value="dashboard">Dashboard</option>
                <option value="kpi">KPI Report</option>
                <option value="heatmap">Heatmap</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="analytics, performance, weekly"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              />
              Make this report template public
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Report Execution Modal Component
interface ReportExecutionModalProps {
  isOpen: boolean;
  templateId: string;
  template?: any;
  onClose: () => void;
  onExecute: (templateId: string, parameters?: Record<string, any>) => Promise<any>;
}

const ReportExecutionModal: React.FC<ReportExecutionModalProps> = ({
  isOpen,
  templateId,
  template,
  onClose,
  onExecute,
}) => {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      await onExecute(templateId, parameters);
      onClose();
    } catch (error) {
      console.error('Failed to execute report:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content report-execution-modal">
        <div className="modal-header">
          <h2>Execute Report: {template?.name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="execution-form">
          <div className="report-summary">
            <p><strong>Description:</strong> {template?.description}</p>
            <p><strong>Type:</strong> {template?.type}</p>
            <p><strong>Category:</strong> {template?.category}</p>
          </div>

          <div className="parameter-section">
            <h3>Parameters</h3>
            <div className="form-group">
              <label>Date Range</label>
              <select
                aria-label="Date range"
                title="Date range"
                value={parameters.dateRange || 'last-30-days'}
                onChange={(e) => setParameters({ ...parameters, dateRange: e.target.value })}
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {parameters.dateRange === 'custom' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    aria-label="Start date"
                    title="Start date"
                    placeholder="Start date"
                    value={parameters.startDate || ''}
                    onChange={(e) => setParameters({ ...parameters, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    aria-label="End date"
                    title="End date"
                    placeholder="End date"
                    value={parameters.endDate || ''}
                    onChange={(e) => setParameters({ ...parameters, endDate: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Format</label>
              <select
                aria-label="Output format"
                title="Output format"
                value={parameters.format || 'html'}
                onChange={(e) => setParameters({ ...parameters, format: e.target.value })}
              >
                <option value="html">Interactive HTML</option>
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV Data</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isExecuting}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleExecute}
              disabled={isExecuting}
            >
              {isExecuting ? 'Executing...' : 'Execute Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReportingDashboard;
