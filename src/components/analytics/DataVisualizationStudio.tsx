import React, { useState, useEffect, useMemo } from 'react';
import { useDataVisualization } from '../../hooks/analytics/useDataVisualization';
import './data-visualization.css';

interface DataVisualizationStudioProps {
  workspaceId: string;
}

const DataVisualizationStudio: React.FC<DataVisualizationStudioProps> = ({
  workspaceId,
}) => {
  const {
    charts,
    templates,
    themes,
    plugins,
    currentChart,
    isLoading,
    error,
    searchQuery,
    actions,
  } = useDataVisualization(workspaceId);

  const [activeTab, setActiveTab] = useState<'charts' | 'templates' | 'themes'>('charts');
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChartBuilder, setShowChartBuilder] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCharts = useMemo(() => {
    return charts.filter(chart =>
      chart.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chart.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [charts, searchQuery]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const handleCreateChart = () => {
    setShowChartBuilder(true);
  };

  const handleCreateTemplate = () => {
    setShowCreateModal(true);
  };

  const handleChartSelect = (chartId: string) => {
    setSelectedChart(chartId);
    actions.setActiveChart(chartId);
  };

  if (isLoading) {
    return (
      <div className="viz-studio loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Visualization Studio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="viz-studio error">
        <div className="error-message">
          <h3>Error Loading Visualization Studio</h3>
          <p>{error}</p>
          <button onClick={() => actions.loadCharts()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="viz-studio">
      {/* Header */}
      <div className="studio-header">
        <div className="header-title">
          <h1>Data Visualization Studio</h1>
          <p>Create powerful charts, graphs, and interactive visualizations</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleCreateTemplate}
          >
            <span className="icon">📋</span>
            New Template
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleCreateChart}
          >
            <span className="icon">📊</span>
            Create Chart
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="studio-nav">
        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            <span className="icon">📊</span>
            Charts ({charts.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <span className="icon">📋</span>
            Templates ({templates.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'themes' ? 'active' : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            <span className="icon">🎨</span>
            Themes ({themes.length})
          </button>
        </div>

        <div className="nav-controls">
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              aria-label="Search visualizations"
              placeholder="Search visualizations..."
              value={searchQuery}
              onChange={(e) => actions.searchCharts?.(e.target.value)}
            />
          </div>
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
      </div>

      {/* Main Content */}
      <div className="studio-content">
        {activeTab === 'charts' && (
          <div className="charts-section">
            {selectedChart ? (
              <ChartEditor
                chart={charts.find(c => c.id === selectedChart)}
                onBack={() => setSelectedChart(null)}
                actions={actions}
              />
            ) : (
              <div className={`charts-container ${viewMode}`}>
                {viewMode === 'grid' ? (
                  <div className="charts-grid">
                    {filteredCharts.map((chart) => (
                      <div key={chart.id} className="chart-card">
                        <div className="card-header">
                          <div className={`chart-type type-${chart.type}`}>
                            {chart.type}
                          </div>
                          <div className="card-actions">
                            <button
                              className="action-btn"
                              onClick={() => handleChartSelect(chart.id)}
                              title="Edit Chart"
                            >
                              ✏️
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => actions.duplicateChart(chart.id)}
                              title="Duplicate Chart"
                            >
                              📋
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => actions.shareChart(chart.id)}
                              title="Share Chart"
                            >
                              📤
                            </button>
                          </div>
                        </div>

                        <div className="chart-preview">
                          <ChartRenderer chart={chart} size="preview" />
                        </div>

                        <div className="card-content">
                          <h3>{chart.title}</h3>
                          <p>{chart.description}</p>

                          <div className="chart-stats">
                            <div className="stat-item">
                              <span className="stat-value">{chart.config.data?.length || 0}</span>
                              <span className="stat-label">Data Points</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-value">{chart.config.series?.length || 1}</span>
                              <span className="stat-label">Series</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-value">{chart.theme?.name || 'Default'}</span>
                              <span className="stat-label">Theme</span>
                            </div>
                          </div>

                          {chart.tags.length > 0 && (
                            <div className="chart-tags">
                              {chart.tags.map((tag, index) => (
                                <span key={index} className="tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="card-footer">
                          <div className="chart-meta">
                            <span className="created-by">
                              Created by {chart.createdBy}
                            </span>
                            <span className="created-date">
                              {new Date(chart.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="chart-status">
                            {chart.isPublic ? (
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
                  <div className="charts-list">
                    {/* List view implementation */}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="templates-section">
            <div className={`templates-container ${viewMode}`}>
              {viewMode === 'grid' ? (
                <div className="templates-grid">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="template-card">
                      <div className="card-header">
                        <div className={`template-category category-${template.category}`}>
                          {template.category}
                        </div>
                        <div className="card-actions">
                          <button
                            className="action-btn"
                            onClick={() => actions.useTemplate(template.id)}
                            title="Use Template"
                          >
                            ▶️
                          </button>
                          <button
                            className="action-btn"
                            title="Edit Template"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn"
                            title="Share Template"
                          >
                            📤
                          </button>
                        </div>
                      </div>

                      <div className="template-preview">
                        <div className="preview-placeholder">
                          <span className="preview-icon">📊</span>
                          <span className="preview-text">{template.name}</span>
                        </div>
                      </div>

                      <div className="card-content">
                        <h3>{template.name}</h3>
                        <p>{template.description}</p>

                        <div className="template-features">
                          {template.config.supportedChartTypes.slice(0, 3).map((type, index) => (
                            <div key={index} className="feature-item">
                              <span className="feature-icon">📈</span>
                              <span className="feature-text">{type}</span>
                            </div>
                          ))}
                          {template.config.supportedChartTypes.length > 3 && (
                            <div className="feature-item more">
                              +{template.config.supportedChartTypes.length - 3} more
                            </div>
                          )}
                        </div>

                        <div className="template-complexity">
                          <span className="complexity-label">Complexity:</span>
                          <div className="complexity-bar">
                            <div 
                              className="complexity-fill" 
                              data-level={template.complexity}
                            ></div>
                          </div>
                          <span className="complexity-text">{template.complexity}</span>
                        </div>
                      </div>

                      <div className="card-footer">
                        <div className="template-meta">
                          <span className="created-by">
                            By {template.createdBy}
                          </span>
                          <span className="usage-count">
                            Used {template.usageCount} times
                          </span>
                        </div>
                        <div className="template-rating">
                          <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star} 
                                className={`star ${star <= (template.rating || 0) ? 'filled' : ''}`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="rating-text">
                            {template.rating ? template.rating.toFixed(1) : 'No rating'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="templates-list">
                  {/* List view implementation */}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="themes-section">
            <div className="themes-grid">
              {themes.map((theme) => (
                <div key={theme.id} className="theme-card">
                  <div className="theme-preview">
                    <div className="color-palette">
                      {theme.colors.primary && (
                        <div 
                          className="color-swatch primary" 
                          data-color={theme.colors.primary}
                          title={`Primary: ${theme.colors.primary}`}
                        ></div>
                      )}
                      {theme.colors.secondary && (
                        <div 
                          className="color-swatch secondary" 
                          data-color={theme.colors.secondary}
                          title={`Secondary: ${theme.colors.secondary}`}
                        ></div>
                      )}
                      {theme.colors.accent && (
                        <div 
                          className="color-swatch accent" 
                          data-color={theme.colors.accent}
                          title={`Accent: ${theme.colors.accent}`}
                        ></div>
                      )}
                      {theme.colors.background && (
                        <div 
                          className="color-swatch background" 
                          data-color={theme.colors.background}
                          title={`Background: ${theme.colors.background}`}
                        ></div>
                      )}
                    </div>
                  </div>

                  <div className="theme-info">
                    <h4>{theme.name}</h4>
                    <p>{theme.description}</p>
                    
                    <div className="theme-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => actions.previewTheme(theme.id)}
                      >
                        Preview
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => actions.applyTheme(theme.id)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showChartBuilder && (
        <ChartBuilderModal
          isOpen={showChartBuilder}
          onClose={() => setShowChartBuilder(false)}
          onSave={actions.createChart}
          templates={templates}
        />
      )}

      {showCreateModal && (
        <TemplateCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={actions.createTemplate}
        />
      )}
    </div>
  );
};

// Chart Renderer Component
interface ChartRendererProps {
  chart: any;
  size?: 'preview' | 'full';
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ chart, size = 'full' }) => {
  return (
    <div className={`chart-renderer ${size}`}>
      <div className="chart-placeholder">
        <div className="chart-icon">📊</div>
        <div className="chart-info">
          <span className="chart-type">{chart.type}</span>
          <span className="data-points">{chart.config.data?.length || 0} points</span>
        </div>
      </div>
    </div>
  );
};

// Chart Editor Component
interface ChartEditorProps {
  chart?: any;
  onBack: () => void;
  actions: any;
}

const ChartEditor: React.FC<ChartEditorProps> = ({ chart, onBack, actions }) => {
  const [activePanel, setActivePanel] = useState<'data' | 'style' | 'interactions'>('data');

  if (!chart) return null;

  return (
    <div className="chart-editor">
      <div className="editor-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← Back to Charts
          </button>
          <div className="chart-title">
            <h2>{chart.title}</h2>
            <p>{chart.description}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn btn-secondary">
            📤 Export
          </button>
          <button className="btn btn-secondary">
            👁️ Preview
          </button>
          <button className="btn btn-primary">
            💾 Save Changes
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-sidebar">
          <div className="panel-tabs">
            <button
              className={`panel-tab ${activePanel === 'data' ? 'active' : ''}`}
              onClick={() => setActivePanel('data')}
            >
              📊 Data
            </button>
            <button
              className={`panel-tab ${activePanel === 'style' ? 'active' : ''}`}
              onClick={() => setActivePanel('style')}
            >
              🎨 Style
            </button>
            <button
              className={`panel-tab ${activePanel === 'interactions' ? 'active' : ''}`}
              onClick={() => setActivePanel('interactions')}
            >
              ⚡ Interactions
            </button>
          </div>

          <div className="panel-content">
            {activePanel === 'data' && (
              <DataPanel chart={chart} actions={actions} />
            )}
            {activePanel === 'style' && (
              <StylePanel chart={chart} actions={actions} />
            )}
            {activePanel === 'interactions' && (
              <InteractionsPanel chart={chart} actions={actions} />
            )}
          </div>
        </div>

        <div className="editor-canvas">
          <ChartRenderer chart={chart} size="full" />
        </div>
      </div>
    </div>
  );
};

// Data Panel Component
interface DataPanelProps {
  chart: any;
  actions: any;
}

const DataPanel: React.FC<DataPanelProps> = ({ chart }) => {
  return (
    <div className="data-panel">
      <h3>Data Configuration</h3>
      
      <div className="panel-section">
        <h4>Data Source</h4>
        <select className="form-control" title="Select data source">
          <option value="manual">Manual Entry</option>
          <option value="api">API Endpoint</option>
          <option value="file">File Upload</option>
          <option value="database">Database Query</option>
        </select>
      </div>

      <div className="panel-section">
        <h4>Chart Type</h4>
        <div className="chart-types">
          {['line', 'bar', 'pie', 'scatter', 'area'].map((type) => (
            <button
              key={type}
              className={`chart-type-btn ${chart.type === type ? 'active' : ''}`}
            >
              📊 {type}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h4>Data Mapping</h4>
        <div className="mapping-controls">
          <div className="mapping-item">
            <label>X-Axis</label>
            <select className="form-control" title="Select X-axis data">
              <option>Select field...</option>
            </select>
          </div>
          <div className="mapping-item">
            <label>Y-Axis</label>
            <select className="form-control" title="Select Y-axis data">
              <option>Select field...</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Style Panel Component
interface StylePanelProps {
  chart: any;
  actions: any;
}

const StylePanel: React.FC<StylePanelProps> = ({ chart }) => {
  return (
    <div className="style-panel">
      <h3>Style Configuration</h3>
      
      <div className="panel-section">
        <h4>Colors</h4>
        <div className="color-controls">
          <div className="color-item">
            <label>Primary Color</label>
            <input type="color" aria-label="Primary color" defaultValue={chart.theme?.colors?.primary || '#3b82f6'} />
          </div>
          <div className="color-item">
            <label>Secondary Color</label>
            <input type="color" aria-label="Secondary color" defaultValue={chart.theme?.colors?.secondary || '#64748b'} />
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h4>Typography</h4>
        <div className="typography-controls">
          <div className="control-item">
            <label>Font Family</label>
            <select className="form-control" title="Select font family">
              <option>Inter</option>
              <option>Roboto</option>
              <option>Arial</option>
            </select>
          </div>
          <div className="control-item">
            <label>Font Size</label>
            <input type="range" aria-label="Font size" min="10" max="24" defaultValue="14" title="Font size slider" />
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h4>Layout</h4>
        <div className="layout-controls">
          <div className="control-item">
            <label>
              <input type="checkbox" aria-label="Show legend" defaultChecked />
              Show Legend
            </label>
          </div>
          <div className="control-item">
            <label>
              <input type="checkbox" aria-label="Show grid" defaultChecked />
              Show Grid
            </label>
          </div>
          <div className="control-item">
            <label>
              <input type="checkbox" aria-label="Show axes labels" defaultChecked />
              Show Axes Labels
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactions Panel Component
interface InteractionsPanelProps {
  chart: any;
  actions: any;
}

const InteractionsPanel: React.FC<InteractionsPanelProps> = ({ chart }) => {
  return (
    <div className="interactions-panel">
      <h3>Interactions</h3>
      
      <div className="panel-section">
        <h4>Mouse Events</h4>
        <div className="interaction-controls">
          <div className="control-item">
            <label>
              <input type="checkbox" aria-label="Enable hover effects" defaultChecked />
              Enable Hover Effects
            </label>
          </div>
          <div className="control-item">
            <label>
              <input type="checkbox" aria-label="Enable click events" defaultChecked />
              Enable Click Events
            </label>
          </div>
          <div className="control-item">
            <label>
              <input type="checkbox" aria-label="Enable zoom" />
              Enable Zoom
            </label>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h4>Tooltips</h4>
        <div className="tooltip-controls">
          <div className="control-item">
            <label>
              <input type="checkbox" aria-label="Show tooltips" defaultChecked />
              Show Tooltips
            </label>
          </div>
          <div className="control-item">
            <label>Tooltip Format</label>
            <input 
              type="text" 
              aria-label="Tooltip format"
              className="form-control" 
              defaultValue="{label}: {value}"
              placeholder="Tooltip format"
              title="Tooltip format pattern"
            />
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h4>Animations</h4>
        <div className="animation-controls">
          <div className="control-item">
            <label>
              <input type="checkbox" aria-label="Enable animations" defaultChecked />
              Enable Animations
            </label>
          </div>
          <div className="control-item">
            <label>Duration (ms)</label>
            <input 
              type="number" 
              aria-label="Animation duration in milliseconds"
              title="Animation duration in milliseconds"
              placeholder="Duration (ms)"
              className="form-control" 
              defaultValue="500"
              min="0"
              max="2000"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Chart Builder Modal Component
interface ChartBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chart: any) => Promise<any>;
  templates: any[];
}

const ChartBuilderModal: React.FC<ChartBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  templates,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'line',
    templateId: '',
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const chartData = {
      ...formData,
      config: {
        data: [],
        series: [],
        axes: {
          x: { type: 'category', title: 'X-Axis' },
          y: { type: 'linear', title: 'Y-Axis' },
        },
        legend: { enabled: true, position: 'top' },
        tooltip: { enabled: true, format: '{label}: {value}' },
        animations: { enabled: true, duration: 500 },
      },
      theme: {
        name: 'default',
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          background: '#ffffff',
          text: '#1e293b',
        },
      },
      interactions: {
        hover: true,
        click: true,
        zoom: false,
      },
      tags: [],
      isPublic: false,
      createdBy: 'current-user-id',
    };

    try {
      await onSave(chartData);
      onClose();
    } catch (error) {
      console.error('Failed to create chart:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content chart-builder-modal">
        <div className="modal-header">
          <h2>Create New Chart</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="builder-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Basic Info</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Chart Type</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Template</span>
          </div>
        </div>

        <div className="builder-content">
          {step === 1 && (
            <div className="step-content">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label htmlFor="title">Chart Title</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h3>Select Chart Type</h3>
              <div className="chart-type-grid">
                {[
                  { type: 'line', icon: '📈', name: 'Line Chart' },
                  { type: 'bar', icon: '📊', name: 'Bar Chart' },
                  { type: 'pie', icon: '🥧', name: 'Pie Chart' },
                  { type: 'scatter', icon: '📍', name: 'Scatter Plot' },
                  { type: 'area', icon: '🏔️', name: 'Area Chart' },
                  { type: 'histogram', icon: '📶', name: 'Histogram' },
                ].map((chartType) => (
                  <button
                    key={chartType.type}
                    className={`chart-type-option ${formData.type === chartType.type ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, type: chartType.type })}
                  >
                    <span className="chart-icon">{chartType.icon}</span>
                    <span className="chart-name">{chartType.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h3>Choose Template (Optional)</h3>
              <div className="template-selection">
                <button
                  className={`template-option ${formData.templateId === '' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, templateId: '' })}
                >
                  <span className="template-icon">🆕</span>
                  <span className="template-name">Start from Scratch</span>
                </button>
                {templates.slice(0, 6).map((template) => (
                  <button
                    key={template.id}
                    className={`template-option ${formData.templateId === template.id ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, templateId: template.id })}
                  >
                    <span className="template-icon">📋</span>
                    <span className="template-name">{template.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          {step > 1 && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handlePrevious}
            >
              Previous
            </button>
          )}
          {step < 3 ? (
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleNext}
              disabled={step === 1 && !formData.title}
            >
              Next
            </button>
          ) : (
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSubmit}
            >
              Create Chart
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Template Creation Modal Component
interface TemplateCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: any) => Promise<any>;
}

const TemplateCreationModal: React.FC<TemplateCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'business',
    complexity: 'beginner',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData = {
      ...formData,
      config: {
        supportedChartTypes: ['line', 'bar', 'area'],
        defaultTheme: 'professional',
        requiredFields: ['x', 'y'],
        optionalFields: ['series', 'category'],
        styling: {
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
          fonts: ['Inter', 'Roboto'],
          sizes: { small: '12px', medium: '14px', large: '16px' },
        },
      },
      usageCount: 0,
      rating: 0,
      createdBy: 'current-user-id',
    };

    try {
      await onSave(templateData);
      onClose();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content template-creation-modal">
        <div className="modal-header">
          <h2>Create New Template</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="template-form">
          <div className="form-group">
            <label htmlFor="name">Template Name</label>
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
              <option value="business">Business</option>
              <option value="scientific">Scientific</option>
              <option value="marketing">Marketing</option>
              <option value="financial">Financial</option>
              <option value="educational">Educational</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="complexity">Complexity Level</label>
            <select
              id="complexity"
              value={formData.complexity}
              onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DataVisualizationStudio;
