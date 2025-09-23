import React, { useState, useEffect, useMemo } from 'react';
import { useBusinessIntelligence } from '../../hooks/analytics/useBusinessIntelligence';
import './business-intelligence.css';

interface BusinessIntelligenceDashboardProps {
  workspaceId: string;
}

const BusinessIntelligenceDashboard: React.FC<BusinessIntelligenceDashboardProps> = ({
  workspaceId,
}) => {
  const {
    metrics,
    dashboards,
    activeDashboard,
    isLoading,
    error,
    searchQuery,
    filters,
    actions,
  } = useBusinessIntelligence(workspaceId);

  const [activeTab, setActiveTab] = useState<'dashboards' | 'metrics' | 'models'>('dashboards');
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [editMode, setEditMode] = useState(false);

  const filteredDashboards = useMemo(() => {
    return dashboards.filter(dashboard =>
      dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dashboards, searchQuery]);

  const filteredMetrics = useMemo(() => {
    return metrics.filter(metric =>
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [metrics, searchQuery]);

  const handleCreateDashboard = async () => {
    setShowCreateModal(true);
  };

  const handleCreateMetric = async () => {
    // Implementation for metric creation
  };

  const handleDashboardSelect = (dashboardId: string) => {
    setSelectedDashboard(dashboardId);
    actions.setActiveDashboard(dashboardId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'executive': return 'var(--category-executive)';
      case 'operational': return 'var(--category-operational)';
      case 'analytical': return 'var(--category-analytical)';
      case 'departmental': return 'var(--category-departmental)';
      case 'project': return 'var(--category-project)';
      default: return 'var(--accent-color)';
    }
  };

  const getMetricTypeColor = (type: string) => {
    switch (type) {
      case 'kpi': return 'var(--metric-kpi)';
      case 'measure': return 'var(--metric-measure)';
      case 'ratio': return 'var(--metric-ratio)';
      case 'trend': return 'var(--metric-trend)';
      case 'benchmark': return 'var(--metric-benchmark)';
      default: return 'var(--accent-color)';
    }
  };

  const getThresholdStatus = (value: number, threshold: any) => {
    if (value >= threshold.excellent) return 'excellent';
    if (value >= threshold.good) return 'good';
    if (value >= threshold.warning) return 'warning';
    return 'critical';
  };

  if (isLoading) {
    return (
      <div className="bi-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Business Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bi-dashboard error">
        <div className="error-message">
          <h3>Error Loading BI Dashboard</h3>
          <p>{error}</p>
          <button onClick={() => actions.loadDashboards()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bi-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Business Intelligence</h1>
          <p>Advanced analytics, metrics, and data-driven insights</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleCreateMetric}
          >
            <span className="icon">📊</span>
            New Metric
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleCreateDashboard}
          >
            <span className="icon">📈</span>
            New Dashboard
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'dashboards' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboards')}
          >
            <span className="icon">📊</span>
            Dashboards ({dashboards.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <span className="icon">📈</span>
            Metrics ({metrics.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            <span className="icon">🤖</span>
            Models (0)
          </button>
        </div>

        <div className="nav-controls">
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              aria-label="Search dashboards and metrics"
              title="Search dashboards and metrics"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => actions.searchMetrics?.(e.target.value)}
            />
          </div>
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
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
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {activeTab === 'dashboards' && (
          <div className="dashboards-section">
            {selectedDashboard ? (
              <DashboardViewer
                dashboard={dashboards.find(d => d.id === selectedDashboard)}
                onBack={() => setSelectedDashboard(null)}
                onEdit={() => setEditMode(true)}
                editMode={editMode}
                onSaveEdit={() => setEditMode(false)}
                actions={actions}
              />
            ) : (
              <div className={`dashboards-container ${viewMode}`}>
                {viewMode === 'cards' ? (
                  <div className="dashboards-grid">
                    {filteredDashboards.map((dashboard) => (
                      <div key={dashboard.id} className="dashboard-card">
                        <div className="card-header">
                          <div 
                            className="dashboard-category"
                            style={{ ['--category-color' as any]: getCategoryColor(dashboard.category) } as React.CSSProperties}
                          >
                            {dashboard.category}
                          </div>
                          <div className="card-actions">
                            <button
                              className="action-btn"
                              onClick={() => handleDashboardSelect(dashboard.id)}
                              title="Open Dashboard"
                            >
                              👁️
                            </button>
                            <button
                              className="action-btn"
                              title="Edit Dashboard"
                            >
                              ✏️
                            </button>
                            <button
                              className="action-btn"
                              title="Share Dashboard"
                            >
                              📤
                            </button>
                          </div>
                        </div>

                        <div className="card-content">
                          <h3>{dashboard.name}</h3>
                          <p>{dashboard.description}</p>

                          <div className="dashboard-stats">
                            <div className="stat-item">
                              <span className="stat-value">{dashboard.widgets.length}</span>
                              <span className="stat-label">Widgets</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-value">{dashboard.filters.length}</span>
                              <span className="stat-label">Filters</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-value">{dashboard.refreshInterval}s</span>
                              <span className="stat-label">Refresh</span>
                            </div>
                          </div>

                          <div className="dashboard-widgets-preview">
                            {dashboard.widgets.slice(0, 3).map((widget) => (
                              <div key={widget.id} className="widget-preview">
                                <span className="widget-type">{widget.type}</span>
                                <span className="widget-title">{widget.title}</span>
                              </div>
                            ))}
                            {dashboard.widgets.length > 3 && (
                              <div className="widget-preview more">
                                +{dashboard.widgets.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="card-footer">
                          <div className="dashboard-meta">
                            <span className="created-by">
                              Created by {dashboard.createdBy}
                            </span>
                            <span className="created-date">
                              {new Date(dashboard.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="access-status">
                            {dashboard.isPublic ? (
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
                  <div className="dashboards-list">
                    {/* List view implementation */}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="metrics-section">
            <div className={`metrics-container ${viewMode}`}>
              {viewMode === 'cards' ? (
                <div className="metrics-grid">
                  {filteredMetrics.map((metric) => (
                    <div key={metric.id} className="metric-card">
                      <div className="card-header">
                        <div className={`metric-type type-${metric.type}`}>
                          {metric.type}
                        </div>
                        <div className="metric-category">
                          {metric.category}
                        </div>
                      </div>

                      <div className="card-content">
                        <h3>{metric.name}</h3>
                        <p>{metric.description}</p>

                        <div className="metric-value">
                          <span className="value">--</span>
                          <span className="unit">{metric.unit}</span>
                        </div>

                        <div className="metric-threshold">
                          <div className="threshold-bar">
                            <div className="threshold-critical"></div>
                            <div className="threshold-warning"></div>
                            <div className="threshold-good"></div>
                            <div className="threshold-excellent"></div>
                          </div>
                          <div className="threshold-labels">
                            <span>Critical</span>
                            <span>Warning</span>
                            <span>Good</span>
                            <span>Excellent</span>
                          </div>
                        </div>

                        <div className="metric-info">
                          <div className="info-item">
                            <span className="label">Frequency:</span>
                            <span className="value">{metric.frequency}</span>
                          </div>
                          {metric.target && (
                            <div className="info-item">
                              <span className="label">Target:</span>
                              <span className="value">{metric.target} {metric.unit}</span>
                            </div>
                          )}
                        </div>

                        {metric.tags.length > 0 && (
                          <div className="metric-tags">
                            {metric.tags.map((tag, index) => (
                              <span key={index} className="tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="card-footer">
                        <div className="metric-status">
                          <span className={`status-indicator ${metric.isActive ? 'active' : 'inactive'}`}>
                            {metric.isActive ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </div>
                        <div className="card-actions">
                          <button
                            className="action-btn"
                            onClick={() => actions.executeMetric(metric.id)}
                            title="Calculate Metric"
                          >
                            ▶️
                          </button>
                          <button
                            className="action-btn"
                            title="Edit Metric"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="metrics-list">
                  {/* List view implementation */}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="models-section">
            <div className="coming-soon">
              <div className="coming-soon-content">
                <h3>🤖 Analytics Models</h3>
                <p>Advanced machine learning models and predictive analytics coming soon!</p>
                <div className="features-preview">
                  <div className="feature-item">
                    <span className="icon">🔮</span>
                    <span>Predictive Analytics</span>
                  </div>
                  <div className="feature-item">
                    <span className="icon">🎯</span>
                    <span>Forecasting Models</span>
                  </div>
                  <div className="feature-item">
                    <span className="icon">🔍</span>
                    <span>Anomaly Detection</span>
                  </div>
                  <div className="feature-item">
                    <span className="icon">📊</span>
                    <span>Pattern Recognition</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <DashboardCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={actions.createDashboard}
        />
      )}
    </div>
  );
};

// Dashboard Viewer Component
interface DashboardViewerProps {
  dashboard?: any;
  onBack: () => void;
  onEdit: () => void;
  editMode: boolean;
  onSaveEdit: () => void;
  actions: any;
}

const DashboardViewer: React.FC<DashboardViewerProps> = ({
  dashboard,
  onBack,
  onEdit,
  editMode,
  onSaveEdit,
  actions,
}) => {
  if (!dashboard) return null;

  return (
    <div className="dashboard-viewer">
      <div className="viewer-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← Back to Dashboards
          </button>
          <div className="dashboard-title">
            <h2>{dashboard.name}</h2>
            <p>{dashboard.description}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn btn-secondary" onClick={() => {/* Export */}}>
            📤 Export
          </button>
          <button className="btn btn-secondary" onClick={() => {/* Share */}}>
            🔗 Share
          </button>
          {editMode ? (
            <button className="btn btn-primary" onClick={onSaveEdit}>
              💾 Save Changes
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onEdit}>
              ✏️ Edit Dashboard
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-filters">
        {dashboard.filters.map((filter: any) => (
          <div key={filter.id} className="filter-control">
            <label>{filter.name}</label>
            {filter.type === 'select' && (
              <select 
                defaultValue={filter.defaultValue}
                title={`Filter by ${filter.name}`}
              >
                {filter.options?.map((option: any) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {filter.type === 'date-range' && (
              <div className="date-range">
                <input 
                    type="date" 
                    aria-label="Start date"
                    title="Start date"
                    placeholder="Start date"
                  />
                <span>to</span>
                <input 
                  type="date" 
                  aria-label="End date"
                  title="End date"
                  placeholder="End date"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div 
        className="dashboard-grid"
        data-columns={dashboard.layout.columns}
        data-gap={dashboard.layout.gap}
      >
        {dashboard.widgets.map((widget: any) => (
          <div
            key={widget.id}
            className={`widget ${editMode ? 'editable' : ''}`}
            data-width={widget.position.w}
            data-height={widget.position.h}
          >
            <div className="widget-header">
              <h4>{widget.title}</h4>
              {editMode && (
                <div className="widget-controls">
                  <button className="widget-btn">⚙️</button>
                  <button className="widget-btn">🗑️</button>
                </div>
              )}
            </div>
            <div className="widget-content">
              <WidgetRenderer widget={widget} actions={actions} />
            </div>
          </div>
        ))}
        {editMode && (
          <div className="add-widget-btn">
            <button className="add-btn">
              ➕ Add Widget
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Widget Renderer Component
interface WidgetRendererProps {
  widget: any;
  actions: any;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, actions }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (widget.dataBinding.metricId) {
        try {
          const result = await actions.executeMetric(widget.dataBinding.metricId);
          setData(result);
        } catch (error) {
          console.error('Failed to fetch widget data:', error);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [widget.dataBinding.metricId, actions]);

  if (isLoading) {
    return (
      <div className="widget-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  switch (widget.type) {
    case 'metric':
      return (
        <div className="metric-widget">
          <div className="metric-value">
            <span className="value">{data?.value || '--'}</span>
            <span className="unit">{data?.unit || ''}</span>
          </div>
          <div className="metric-change">
            {data?.change && (
              <span className={`change ${data.change > 0 ? 'positive' : 'negative'}`}>
                {data.change > 0 ? '↗️' : '↘️'} {Math.abs(data.change)}%
              </span>
            )}
          </div>
        </div>
      );

    case 'chart':
      return (
        <div className="chart-widget">
          <div className="chart-placeholder">
            📊 Chart visualization would render here
          </div>
        </div>
      );

    case 'table':
      return (
        <div className="table-widget">
          <div className="table-placeholder">
            📋 Table data would render here
          </div>
        </div>
      );

    default:
      return (
        <div className="widget-placeholder">
          <p>Widget type: {widget.type}</p>
        </div>
      );
  }
};

// Dashboard Creation Modal Component
interface DashboardCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dashboard: any) => Promise<any>;
}

const DashboardCreationModal: React.FC<DashboardCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'operational',
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dashboardData = {
      ...formData,
      layout: {
        type: 'grid',
        columns: 12,
        rowHeight: 100,
        gap: 16,
        responsive: true,
        breakpoints: {
          lg: 1200,
          md: 996,
          sm: 768,
          xs: 480,
        },
      },
      widgets: [],
      filters: [],
      refreshInterval: 300,
      permissions: {
        viewers: [],
        editors: [],
        admins: [],
        publicAccess: formData.isPublic ? 'view' : 'none',
        exportAllowed: true,
      },
      theme: {
        name: 'default',
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1e293b',
          accent: '#3b82f6',
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: '400',
        },
        spacing: {
          small: '8px',
          medium: '16px',
          large: '24px',
        },
      },
      createdBy: 'current-user-id',
    };

    try {
      await onSave(dashboardData);
      onClose();
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content dashboard-creation-modal">
        <div className="modal-header">
          <h2>Create New Dashboard</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="dashboard-form">
          <div className="form-group">
            <label htmlFor="name">Dashboard Name</label>
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

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="executive">Executive</option>
              <option value="operational">Operational</option>
              <option value="analytical">Analytical</option>
              <option value="departmental">Departmental</option>
              <option value="project">Project</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              />
              Make this dashboard public
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessIntelligenceDashboard;
