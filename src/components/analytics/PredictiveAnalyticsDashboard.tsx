import React, { useState, useEffect, useMemo } from 'react';
import { usePredictiveAnalytics } from '../../hooks/analytics/usePredictiveAnalytics';
import './predictive-analytics.css';

interface PredictiveAnalyticsDashboardProps {
  workspaceId: string;
}

const PredictiveAnalyticsDashboard: React.FC<PredictiveAnalyticsDashboardProps> = ({
  workspaceId,
}) => {
  const {
    models,
    experiments,
    predictions,
    isLoading,
    error,
    searchQuery,
    filters,
    actions,
  } = usePredictiveAnalytics(workspaceId);

  const [activeTab, setActiveTab] = useState<'models' | 'experiments' | 'predictions'>('models');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const filteredModels = useMemo(() => {
    return models.filter(model =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [models, searchQuery]);

  const filteredExperiments = useMemo(() => {
    return experiments.filter(experiment =>
      experiment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      experiment.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [experiments, searchQuery]);

  const filteredPredictions = useMemo(() => {
    return predictions.filter(prediction =>
      prediction.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prediction.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [predictions, searchQuery]);

  const handleCreateModel = () => {
    setShowCreateModal(true);
  };

  const handleTrainModel = () => {
    setShowTrainingModal(true);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  if (isLoading) {
    return (
      <div className="predictive-dashboard loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Predictive Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="predictive-dashboard error">
        <div className="error-message">
          <h3>Error Loading Predictive Analytics</h3>
          <p>{error}</p>
          <button onClick={() => actions.loadModels()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="predictive-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Predictive Analytics</h1>
          <p>Machine learning models, experiments, and AI-powered predictions</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={handleTrainModel}
          >
            <span className="icon">🎯</span>
            Train Model
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleCreateModel}
          >
            <span className="icon">🤖</span>
            New Model
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <div className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'models' ? 'active' : ''}`}
            onClick={() => setActiveTab('models')}
          >
            <span className="icon">🤖</span>
            Models ({models.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'experiments' ? 'active' : ''}`}
            onClick={() => setActiveTab('experiments')}
          >
            <span className="icon">🧪</span>
            Experiments ({experiments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            <span className="icon">🔮</span>
            Predictions ({predictions.length})
          </button>
        </div>

        <div className="nav-controls">
          <div className="search-input">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              aria-label="Search predictive analytics"
              title="Search predictive analytics"
              placeholder="Search analytics..."
              value={searchQuery}
              onChange={(e) => { if ((actions as any).searchModels) (actions as any).searchModels(e.target.value); }}
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
        {activeTab === 'models' && (
          <div className="models-section">
            {selectedModel ? (
              <ModelDetailView
                model={models.find(m => m.id === selectedModel)}
                onBack={() => setSelectedModel(null)}
                actions={actions}
              />
            ) : (
              <div className={`models-container ${viewMode}`}>
                {viewMode === 'cards' ? (
                  <div className="models-grid">
                    {filteredModels.map((model) => (
                      <div key={model.id} className="model-card">
                        <div className="card-header">
                          <div className={`model-type type-${model.type}`}>
                            {model.type}
                          </div>
                          <div className={`model-status status-${model.status}`}>
                            {model.status}
                          </div>
                        </div>

                        <div className="card-content">
                          <h3>{model.name}</h3>
                          <p>{model.description}</p>

                          <div className="model-metrics">
                            <div className="metric-item">
                              <span className="metric-label">Accuracy</span>
                              <div className="metric-bar">
                                <div 
                                  className="metric-fill" 
                                  data-value={model.metrics.accuracy}
                                ></div>
                              </div>
                              <span className="metric-value">
                                {(model.metrics.accuracy * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">Precision</span>
                              <div className="metric-bar">
                                <div 
                                  className="metric-fill" 
                                  data-value={model.metrics.precision}
                                ></div>
                              </div>
                              <span className="metric-value">
                                {(model.metrics.precision * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">Recall</span>
                              <div className="metric-bar">
                                <div 
                                  className="metric-fill" 
                                  data-value={model.metrics.recall}
                                ></div>
                              </div>
                              <span className="metric-value">
                                {(model.metrics.recall * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          <div className="model-info">
                            <div className="info-item">
                              <span className="label">Algorithm:</span>
                              <span className="value">{model.algorithm}</span>
                            </div>
                            <div className="info-item">
                              <span className="label">Training Data:</span>
                              <span className="value">{model.trainingDataSize} samples</span>
                            </div>
                            <div className="info-item">
                              <span className="label">Last Trained:</span>
                              <span className="value">
                                {new Date(model.lastTrainedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {model.tags.length > 0 && (
                            <div className="model-tags">
                              {model.tags.map((tag, index) => (
                                <span key={index} className="tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="card-footer">
                          <div className="model-actions">
                            <button
                              className="action-btn"
                              onClick={() => handleModelSelect(model.id)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => actions.trainModel(model.id)}
                              title="Train Model"
                              disabled={model.status === 'training'}
                            >
                              🎯
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => actions.deployModel(model.id)}
                              title="Deploy Model"
                              disabled={model.status !== 'trained'}
                            >
                              🚀
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => actions.makePrediction(model.id)}
                              title="Make Prediction"
                              disabled={model.status !== 'deployed'}
                            >
                              🔮
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="models-list">
                    {/* List view implementation */}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'experiments' && (
          <div className="experiments-section">
            <div className={`experiments-container ${viewMode}`}>
              {viewMode === 'cards' ? (
                <div className="experiments-grid">
                  {filteredExperiments.map((experiment) => (
                    <div key={experiment.id} className="experiment-card">
                      <div className="card-header">
                        <div className={`experiment-status status-${experiment.status}`}>
                          {experiment.status}
                        </div>
                        <div className="experiment-duration">
                          {experiment.duration ? `${experiment.duration}min` : 'Pending'}
                        </div>
                      </div>

                      <div className="card-content">
                        <h3>{experiment.name}</h3>
                        <p>{experiment.description}</p>

                        <div className="experiment-config">
                          <div className="config-item">
                            <span className="label">Algorithm:</span>
                            <span className="value">{experiment.config.algorithm}</span>
                          </div>
                          <div className="config-item">
                            <span className="label">Parameters:</span>
                            <span className="value">{Object.keys(experiment.config.parameters).length} params</span>
                          </div>
                          <div className="config-item">
                            <span className="label">Cross Validation:</span>
                            <span className="value">{experiment.config.crossValidation.folds} folds</span>
                          </div>
                        </div>

                        {experiment.results && (
                          <div className="experiment-results">
                            <h4>Results</h4>
                            <div className="results-grid">
                              <div className="result-item">
                                <span className="result-label">Best Score</span>
                                <span className="result-value">
                                  {(experiment.results.bestScore * 100).toFixed(2)}%
                                </span>
                              </div>
                              <div className="result-item">
                                <span className="result-label">Mean Score</span>
                                <span className="result-value">
                                  {(experiment.results.meanScore * 100).toFixed(2)}%
                                </span>
                              </div>
                              <div className="result-item">
                                <span className="result-label">Std Dev</span>
                                <span className="result-value">
                                  {(experiment.results.stdScore * 100).toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="card-footer">
                        <div className="experiment-meta">
                          <span className="created-by">
                            Created by {experiment.createdBy}
                          </span>
                          <span className="created-date">
                            {new Date(experiment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="experiment-actions">
                          <button
                            className="action-btn"
                            onClick={() => actions.runExperiment(experiment.id)}
                            disabled={experiment.status === 'running'}
                            title="Run Experiment"
                          >
                            ▶️
                          </button>
                          <button
                            className="action-btn"
                            title="View Details"
                          >
                            📊
                          </button>
                          <button
                            className="action-btn"
                            title="Export Results"
                          >
                            📤
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="experiments-list">
                  {/* List view implementation */}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="predictions-section">
            <div className={`predictions-container ${viewMode}`}>
              {viewMode === 'cards' ? (
                <div className="predictions-grid">
                  {filteredPredictions.map((prediction) => (
                    <div key={prediction.id} className="prediction-card">
                      <div className="card-header">
                        <div className={`prediction-confidence confidence-${getConfidenceLevel(prediction.confidence)}`}>
                          {(prediction.confidence * 100).toFixed(1)}% confident
                        </div>
                        <div className="prediction-type">
                          {prediction.type}
                        </div>
                      </div>

                      <div className="prediction-result">
                        <div className="result-value">
                          {formatPredictionValue(prediction.result.value, prediction.type)}
                        </div>
                        <div className="result-unit">
                          {prediction.result.unit}
                        </div>
                      </div>

                      <div className="card-content">
                        <h3>{prediction.description}</h3>
                        
                        <div className="prediction-info">
                          <div className="info-item">
                            <span className="label">Model:</span>
                            <span className="value">{prediction.modelName}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Time Horizon:</span>
                            <span className="value">{prediction.timeHorizon}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Created:</span>
                            <span className="value">
                              {new Date(prediction.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {prediction.result.factors && (
                          <div className="prediction-factors">
                            <h4>Key Factors</h4>
                            <div className="factors-list">
                              {prediction.result.factors.slice(0, 3).map((factor, index) => (
                                <div key={index} className="factor-item">
                                  <span className="factor-name">{factor.name}</span>
                                  <div className="factor-impact">
                                    <div 
                                      className="impact-bar" 
                                      data-impact={factor.impact}
                                    ></div>
                                    <span className="impact-value">
                                      {(factor.impact * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="card-footer">
                        <div className="prediction-status">
                          <span className={`status-indicator status-${prediction.status}`}>
                            {prediction.status}
                          </span>
                        </div>
                        <div className="prediction-actions">
                          <button
                            className="action-btn"
                            title="View Details"
                          >
                            📊
                          </button>
                          <button
                            className="action-btn"
                            title="Export Prediction"
                          >
                            📤
                          </button>
                          <button
                            className="action-btn"
                            title="Update Prediction"
                          >
                            🔄
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="predictions-list">
                  {/* List view implementation */}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <ModelCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={actions.createModel}
        />
      )}

      {showTrainingModal && (
        <ModelTrainingModal
          isOpen={showTrainingModal}
          onClose={() => setShowTrainingModal(false)}
          onStart={actions.trainModel}
          models={models}
        />
      )}
    </div>
  );
};

// Helper Functions
const getConfidenceLevel = (confidence: number): string => {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.7) return 'medium';
  return 'low';
};

const formatPredictionValue = (value: number, type: string): string => {
  switch (type) {
    case 'revenue':
      return `$${(value / 1000).toFixed(1)}K`;
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    case 'count':
      return Math.round(value).toString();
    default:
      return value.toFixed(2);
  }
};

// Model Detail View Component
interface ModelDetailViewProps {
  model?: any;
  onBack: () => void;
  actions: any;
}

const ModelDetailView: React.FC<ModelDetailViewProps> = ({ model, onBack, actions }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'training' | 'performance'>('overview');

  if (!model) return null;

  return (
    <div className="model-detail-view">
      <div className="detail-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← Back to Models
          </button>
          <div className="model-title">
            <h2>{model.name}</h2>
            <p>{model.description}</p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn btn-secondary">
            📤 Export Model
          </button>
          <button className="btn btn-secondary">
            🔄 Retrain
          </button>
          <button className="btn btn-primary">
            🚀 Deploy
          </button>
        </div>
      </div>

      <div className="detail-nav">
        <button
          className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`nav-btn ${activeSection === 'training' ? 'active' : ''}`}
          onClick={() => setActiveSection('training')}
        >
          🎯 Training
        </button>
        <button
          className={`nav-btn ${activeSection === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveSection('performance')}
        >
          📈 Performance
        </button>
      </div>

      <div className="detail-content">
        {activeSection === 'overview' && (
          <ModelOverview model={model} />
        )}
        {activeSection === 'training' && (
          <ModelTraining model={model} />
        )}
        {activeSection === 'performance' && (
          <ModelPerformance model={model} />
        )}
      </div>
    </div>
  );
};

// Model Overview Component
interface ModelOverviewProps {
  model: any;
}

const ModelOverview: React.FC<ModelOverviewProps> = ({ model }) => {
  return (
    <div className="model-overview">
      <div className="overview-grid">
        <div className="overview-card">
          <h3>Model Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Type:</span>
              <span className="value">{model.type}</span>
            </div>
            <div className="info-item">
              <span className="label">Algorithm:</span>
              <span className="value">{model.algorithm}</span>
            </div>
            <div className="info-item">
              <span className="label">Status:</span>
              <span className={`value status-${model.status}`}>{model.status}</span>
            </div>
            <div className="info-item">
              <span className="label">Version:</span>
              <span className="value">{model.version}</span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>Performance Metrics</h3>
          <div className="metrics-display">
            <div className="metric-circle">
              <div className="circle-progress" data-value={model.metrics.accuracy}>
                <span className="metric-label">Accuracy</span>
                <span className="metric-value">{(model.metrics.accuracy * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="metric-bars">
              <div className="metric-bar-item">
                <span className="label">Precision</span>
                <div className="bar">
                  <div className="fill" data-value={model.metrics.precision}></div>
                </div>
                <span className="value">{(model.metrics.precision * 100).toFixed(1)}%</span>
              </div>
              <div className="metric-bar-item">
                <span className="label">Recall</span>
                <div className="bar">
                  <div className="fill" data-value={model.metrics.recall}></div>
                </div>
                <span className="value">{(model.metrics.recall * 100).toFixed(1)}%</span>
              </div>
              <div className="metric-bar-item">
                <span className="label">F1 Score</span>
                <div className="bar">
                  <div className="fill" data-value={model.metrics.f1Score}></div>
                </div>
                <span className="value">{(model.metrics.f1Score * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>Training Data</h3>
          <div className="data-info">
            <div className="data-item">
              <span className="data-value">{model.trainingDataSize}</span>
              <span className="data-label">Total Samples</span>
            </div>
            <div className="data-item">
              <span className="data-value">{model.features?.length || 0}</span>
              <span className="data-label">Features</span>
            </div>
            <div className="data-item">
              <span className="data-value">{model.targetClasses || 1}</span>
              <span className="data-label">Target Classes</span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>Deployment Info</h3>
          <div className="deployment-info">
            <div className="deployment-item">
              <span className="label">Environment:</span>
              <span className="value">{model.deployment?.environment || 'Not deployed'}</span>
            </div>
            <div className="deployment-item">
              <span className="label">Endpoint:</span>
              <span className="value">{model.deployment?.endpoint || 'N/A'}</span>
            </div>
            <div className="deployment-item">
              <span className="label">Predictions Made:</span>
              <span className="value">{model.deployment?.predictionsCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Model Training Component
interface ModelTrainingProps {
  model: any;
}

const ModelTraining: React.FC<ModelTrainingProps> = ({ model }) => {
  return (
    <div className="model-training">
      <div className="training-history">
        <h3>Training History</h3>
        <div className="training-timeline">
          {model.trainingHistory?.map((session: any, index: number) => (
            <div key={index} className="training-session">
              <div className="session-info">
                <span className="session-date">
                  {new Date(session.startedAt).toLocaleDateString()}
                </span>
                <span className="session-duration">{session.duration}min</span>
                <span className={`session-status status-${session.status}`}>
                  {session.status}
                </span>
              </div>
              <div className="session-metrics">
                <span>Accuracy: {(session.finalAccuracy * 100).toFixed(1)}%</span>
                <span>Loss: {session.finalLoss.toFixed(4)}</span>
              </div>
            </div>
          )) || <p>No training history available</p>}
        </div>
      </div>

      <div className="hyperparameters">
        <h3>Hyperparameters</h3>
        <div className="params-grid">
          {Object.entries(model.hyperparameters || {}).map(([key, value]) => (
            <div key={key} className="param-item">
              <span className="param-key">{key}:</span>
              <span className="param-value">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Model Performance Component
interface ModelPerformanceProps {
  model: any;
}

const ModelPerformance: React.FC<ModelPerformanceProps> = ({ model }) => {
  return (
    <div className="model-performance">
      <div className="performance-charts">
        <div className="chart-container">
          <h3>Training Progress</h3>
          <div className="chart-placeholder">
            <p>Training accuracy and loss curves would be displayed here</p>
          </div>
        </div>
        
        <div className="chart-container">
          <h3>Confusion Matrix</h3>
          <div className="chart-placeholder">
            <p>Confusion matrix visualization would be displayed here</p>
          </div>
        </div>
      </div>

      <div className="feature-importance">
        <h3>Feature Importance</h3>
        <div className="features-list">
          {model.featureImportance?.map((feature: any, index: number) => (
            <div key={index} className="feature-item">
              <span className="feature-name">{feature.name}</span>
              <div className="importance-bar">
                <div 
                  className="importance-fill" 
                  data-importance={feature.importance}
                ></div>
              </div>
              <span className="importance-value">
                {(feature.importance * 100).toFixed(1)}%
              </span>
            </div>
          )) || <p>Feature importance data not available</p>}
        </div>
      </div>
    </div>
  );
};

// Model Creation Modal Component
interface ModelCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (model: any) => Promise<any>;
}

const ModelCreationModal: React.FC<ModelCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'classification',
    algorithm: 'random_forest',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const modelData = {
      ...formData,
      status: 'created',
      version: '1.0.0',
      metrics: {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
      },
      hyperparameters: {},
      features: [],
      trainingDataSize: 0,
      createdBy: 'current-user-id',
    };

    try {
      await onSave(modelData);
      onClose();
    } catch (error) {
      console.error('Failed to create model:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content model-creation-modal">
        <div className="modal-header">
          <h2>Create New Model</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="model-form">
          <div className="form-group">
            <label htmlFor="name">Model Name</label>
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
            <label htmlFor="type">Model Type</label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="classification">Classification</option>
              <option value="regression">Regression</option>
              <option value="clustering">Clustering</option>
              <option value="time_series">Time Series</option>
              <option value="recommendation">Recommendation</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="algorithm">Algorithm</label>
            <select
              id="algorithm"
              value={formData.algorithm}
              onChange={(e) => setFormData({ ...formData, algorithm: e.target.value })}
            >
              <option value="random_forest">Random Forest</option>
              <option value="gradient_boosting">Gradient Boosting</option>
              <option value="neural_network">Neural Network</option>
              <option value="svm">Support Vector Machine</option>
              <option value="linear_regression">Linear Regression</option>
              <option value="logistic_regression">Logistic Regression</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Model
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Model Training Modal Component
interface ModelTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (modelId: string, config: any) => Promise<any>;
  models: any[];
}

const ModelTrainingModal: React.FC<ModelTrainingModalProps> = ({
  isOpen,
  onClose,
  onStart,
  models,
}) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [trainingConfig, setTrainingConfig] = useState({
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onStart(selectedModel, trainingConfig);
      onClose();
    } catch (error) {
      console.error('Failed to start training:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content training-modal">
        <div className="modal-header">
          <h2>Train Model</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="training-form">
          <div className="form-group">
            <label htmlFor="model">Select Model</label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              required
            >
              <option value="">Choose a model...</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.type})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="epochs">Epochs</label>
            <input
              id="epochs"
              type="number"
              value={trainingConfig.epochs}
              onChange={(e) => setTrainingConfig({ 
                ...trainingConfig, 
                epochs: parseInt(e.target.value) 
              })}
              min="1"
              max="1000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="batchSize">Batch Size</label>
            <input
              id="batchSize"
              type="number"
              value={trainingConfig.batchSize}
              onChange={(e) => setTrainingConfig({ 
                ...trainingConfig, 
                batchSize: parseInt(e.target.value) 
              })}
              min="1"
              max="512"
            />
          </div>

          <div className="form-group">
            <label htmlFor="learningRate">Learning Rate</label>
            <input
              id="learningRate"
              type="number"
              step="0.0001"
              value={trainingConfig.learningRate}
              onChange={(e) => setTrainingConfig({ 
                ...trainingConfig, 
                learningRate: parseFloat(e.target.value) 
              })}
              min="0.0001"
              max="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="validationSplit">Validation Split</label>
            <input
              id="validationSplit"
              type="number"
              step="0.1"
              value={trainingConfig.validationSplit}
              onChange={(e) => setTrainingConfig({ 
                ...trainingConfig, 
                validationSplit: parseFloat(e.target.value) 
              })}
              min="0.1"
              max="0.5"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Start Training
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;
