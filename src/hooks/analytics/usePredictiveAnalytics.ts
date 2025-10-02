import { useState, useEffect, useCallback } from 'react';
import { useSocketConnection } from '../useSocket';

// Predictive Analytics Interfaces
export interface PredictiveModel {
  id: string;
  name: string;
  description: string;
  type: 'regression' | 'classification' | 'time-series' | 'clustering' | 'anomaly-detection';
  algorithm: ModelAlgorithm;
  status: 'draft' | 'training' | 'trained' | 'deployed' | 'archived' | 'failed';
  accuracy: number;
  trainingData: TrainingDataset;
  features: ModelFeature[];
  hyperparameters: HyperparameterConfig;
  performance: ModelPerformance;
  deployment: ModelDeployment;
  version: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastTrainedAt?: Date;
  lastDeployedAt?: Date;
}

export interface ModelAlgorithm {
  name: string;
  type: 'linear-regression' | 'random-forest' | 'neural-network' | 'svm' | 'gradient-boosting' | 'lstm' | 'arima' | 'kmeans' | 'isolation-forest';
  framework: 'scikit-learn' | 'tensorflow' | 'pytorch' | 'xgboost' | 'lightgbm' | 'prophet' | 'custom';
  version: string;
  configuration: AlgorithmConfiguration;
}

export interface AlgorithmConfiguration {
  parameters: AlgorithmParameter[];
  preprocessing: PreprocessingStep[];
  validation: ValidationStrategy;
  optimization: OptimizationStrategy;
}

export interface AlgorithmParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array' | 'object';
  value: any;
  description: string;
  tunable: boolean;
  range?: ParameterRange;
}

export interface ParameterRange {
  min?: number;
  max?: number;
  step?: number;
  options?: any[];
  distribution?: 'uniform' | 'normal' | 'log-uniform';
}

export interface PreprocessingStep {
  name: string;
  type: 'scaling' | 'normalization' | 'encoding' | 'imputation' | 'feature-selection' | 'dimensionality-reduction';
  configuration: StepConfiguration;
  order: number;
  enabled: boolean;
}

export interface StepConfiguration {
  method?: string;
  parameters?: Record<string, any>;
  columns?: string[];
  strategy?: string;
}

export interface ValidationStrategy {
  type: 'train-test-split' | 'cross-validation' | 'time-series-split' | 'stratified-split';
  configuration: ValidationConfiguration;
  metrics: ValidationMetric[];
}

export interface ValidationConfiguration {
  testSize?: number;
  folds?: number;
  shuffle?: boolean;
  randomState?: number;
  stratify?: boolean;
  timeGap?: number;
}

export interface ValidationMetric {
  name: string;
  type: 'accuracy' | 'precision' | 'recall' | 'f1' | 'auc' | 'rmse' | 'mae' | 'r2' | 'mape' | 'custom';
  threshold?: number;
  weight?: number;
}

export interface OptimizationStrategy {
  type: 'grid-search' | 'random-search' | 'bayesian' | 'evolutionary' | 'none';
  configuration: OptimizationConfiguration;
  budget: OptimizationBudget;
}

export interface OptimizationConfiguration {
  searchSpace?: Record<string, any>;
  objective?: string;
  direction?: 'minimize' | 'maximize';
  nTrials?: number;
  timeout?: number;
  parallelJobs?: number;
}

export interface OptimizationBudget {
  maxIterations?: number;
  maxTime?: number;
  maxCost?: number;
  earlyStoppingRounds?: number;
}

export interface TrainingDataset {
  id: string;
  name: string;
  source: DataSource;
  size: number;
  features: DatasetFeature[];
  target: TargetVariable;
  splits: DatasetSplit[];
  quality: DataQuality;
  lastUpdated: Date;
}

export interface DataSource {
  type: 'database' | 'file' | 'api' | 'stream';
  connection: ConnectionConfig;
  query?: string;
  filters?: DataFilter[];
  refreshSchedule?: RefreshSchedule;
}

export interface ConnectionConfig {
  host?: string;
  database?: string;
  table?: string;
  filePath?: string;
  url?: string;
  credentials?: CredentialConfig;
  options?: Record<string, any>;
}

export interface CredentialConfig {
  type: 'none' | 'basic' | 'token' | 'certificate';
  username?: string;
  password?: string;
  token?: string;
  certificatePath?: string;
}

export interface DataFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  logic: 'AND' | 'OR';
}

export interface RefreshSchedule {
  type: 'manual' | 'schedule' | 'event';
  cron?: string;
  interval?: number;
  events?: string[];
}

export interface DatasetFeature {
  name: string;
  type: 'numeric' | 'categorical' | 'text' | 'datetime' | 'binary' | 'ordinal';
  description?: string;
  nullable: boolean;
  unique: boolean;
  statistics: FeatureStatistics;
  transformations: FeatureTransformation[];
}

export interface FeatureStatistics {
  count: number;
  missing: number;
  unique: number;
  mean?: number;
  std?: number;
  min?: any;
  max?: any;
  percentiles?: Record<string, number>;
  distribution?: DistributionInfo;
}

export interface DistributionInfo {
  type: 'normal' | 'uniform' | 'exponential' | 'skewed' | 'bimodal' | 'unknown';
  skewness?: number;
  kurtosis?: number;
  outliers?: OutlierInfo;
}

export interface OutlierInfo {
  count: number;
  percentage: number;
  method: 'iqr' | 'zscore' | 'isolation-forest';
  threshold: number;
}

export interface FeatureTransformation {
  type: 'log' | 'sqrt' | 'box-cox' | 'yeo-johnson' | 'polynomial' | 'interaction';
  parameters?: Record<string, any>;
  enabled: boolean;
}

export interface TargetVariable {
  name: string;
  type: 'numeric' | 'categorical' | 'binary' | 'ordinal';
  distribution: DistributionInfo;
  balance?: ClassBalance;
  transformations: FeatureTransformation[];
}

export interface ClassBalance {
  classes: ClassInfo[];
  imbalanceRatio: number;
  strategy?: 'none' | 'oversample' | 'undersample' | 'smote' | 'weighted';
}

export interface ClassInfo {
  value: any;
  count: number;
  percentage: number;
}

export interface DatasetSplit {
  name: string;
  type: 'train' | 'validation' | 'test';
  size: number;
  percentage: number;
  startDate?: Date;
  endDate?: Date;
}

export interface DataQuality {
  score: number;
  issues: DataQualityIssue[];
  recommendations: QualityRecommendation[];
  lastAssessed: Date;
}

export interface DataQualityIssue {
  type: 'missing-values' | 'duplicates' | 'outliers' | 'inconsistency' | 'correlation' | 'leakage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedFeatures: string[];
  count: number;
  impact: ImpactAssessment;
}

export interface ImpactAssessment {
  performance: number;
  reliability: number;
  interpretability: number;
  fairness: number;
}

export interface QualityRecommendation {
  type: 'data-collection' | 'preprocessing' | 'feature-engineering' | 'algorithm-selection';
  priority: 'low' | 'medium' | 'high';
  description: string;
  estimatedImpact: number;
  effort: 'low' | 'medium' | 'high';
}

export interface ModelFeature {
  name: string;
  type: 'input' | 'derived' | 'target';
  importance: number;
  correlation: number;
  transformation?: string;
  encoding?: string;
  statistics: FeatureStatistics;
}

export interface HyperparameterConfig {
  current: Record<string, any>;
  optimal: Record<string, any>;
  searchSpace: Record<string, ParameterRange>;
  history: HyperparameterTrial[];
}

export interface HyperparameterTrial {
  id: string;
  parameters: Record<string, any>;
  performance: Record<string, number>;
  duration: number;
  status: 'completed' | 'failed' | 'running';
  timestamp: Date;
}

export interface ModelPerformance {
  training: PerformanceMetrics;
  validation: PerformanceMetrics;
  testing?: PerformanceMetrics;
  crossValidation?: CrossValidationResults;
  benchmark?: BenchmarkResults;
}

export interface PerformanceMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
  mape?: number;
  logLoss?: number;
  confusionMatrix?: number[][];
  rocCurve?: ROCPoint[];
  precisionRecallCurve?: PRPoint[];
  featureImportance?: FeatureImportance[];
  residuals?: number[];
  predictions?: PredictionResult[];
}

export interface ROCPoint {
  fpr: number;
  tpr: number;
  threshold: number;
}

export interface PRPoint {
  precision: number;
  recall: number;
  threshold: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
  category?: string;
}

export interface PredictionResult {
  actual: any;
  predicted: any;
  probability?: number;
  confidence?: number;
  error?: number;
}

export interface CrossValidationResults {
  folds: number;
  scores: Record<string, number[]>;
  mean: Record<string, number>;
  std: Record<string, number>;
  best: number;
  worst: number;
}

export interface BenchmarkResults {
  baseline: Record<string, number>;
  improvement: Record<string, number>;
  significance: StatisticalTest[];
}

export interface StatisticalTest {
  test: string;
  statistic: number;
  pValue: number;
  significant: boolean;
  confidenceLevel: number;
}

export interface ModelDeployment {
  id?: string;
  status: 'not-deployed' | 'deploying' | 'deployed' | 'failed' | 'retired';
  environment: 'development' | 'staging' | 'production';
  endpoint?: EndpointConfig;
  monitoring: MonitoringConfig;
  rollback?: RollbackConfig;
  lastDeployed?: Date;
  deployedBy?: string;
}

export interface EndpointConfig {
  url: string;
  method: 'POST' | 'GET';
  authentication: AuthenticationConfig;
  rateLimit: RateLimitConfig;
  caching: CachingConfig;
  timeout: number;
}

export interface AuthenticationConfig {
  type: 'none' | 'api-key' | 'jwt' | 'oauth';
  configuration: Record<string, any>;
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerMinute: number;
  burstLimit: number;
  quotaType: 'user' | 'ip' | 'api-key';
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  strategy: 'fifo' | 'lru' | 'lfu';
  size: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: MonitoringMetric[];
  alerts: AlertConfig[];
  logging: LoggingConfig;
  dashboard?: string;
}

export interface MonitoringMetric {
  name: string;
  type: 'latency' | 'throughput' | 'error-rate' | 'accuracy' | 'drift' | 'resource';
  threshold?: number;
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'p50' | 'p95' | 'p99';
  window: string;
}

export interface AlertConfig {
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  channels: NotificationChannel[];
  cooldown: number;
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  configuration: Record<string, any>;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warning' | 'error';
  format: 'json' | 'text';
  destinations: LogDestination[];
  retention: number;
}

export interface LogDestination {
  type: 'file' | 'database' | 'cloud' | 'stream';
  configuration: Record<string, any>;
}

export interface RollbackConfig {
  enabled: boolean;
  automatic: boolean;
  conditions: RollbackCondition[];
  timeout: number;
}

export interface RollbackCondition {
  metric: string;
  threshold: number;
  duration: number;
}

export interface Prediction {
  id: string;
  modelId: string;
  input: Record<string, any>;
  output: PredictionOutput;
  confidence: number;
  timestamp: Date;
  latency: number;
  metadata?: Record<string, any>;
}

export interface PredictionOutput {
  value: any;
  probability?: number;
  confidence?: number;
  explanation?: PredictionExplanation;
  alternatives?: AlternativePrediction[];
}

export interface PredictionExplanation {
  method: 'shap' | 'lime' | 'feature-importance' | 'counterfactual';
  features: FeatureContribution[];
  globalImportance?: FeatureImportance[];
  visualizations?: ExplanationVisualization[];
}

export interface FeatureContribution {
  feature: string;
  value: any;
  contribution: number;
  direction: 'positive' | 'negative';
  description?: string;
}

export interface ExplanationVisualization {
  type: 'bar' | 'waterfall' | 'force' | 'partial-dependence';
  data: any;
  config: any;
}

export interface AlternativePrediction {
  value: any;
  probability: number;
  rank: number;
}

export interface ModelExperiment {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  models: PredictiveModel[];
  baseline: PredictiveModel;
  configuration: ExperimentConfiguration;
  results: ExperimentResults;
  artifacts: ExperimentArtifact[];
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ExperimentConfiguration {
  objective: string;
  metrics: string[];
  budget: ExperimentBudget;
  parallelism: number;
  randomSeed?: number;
  tags: string[];
}

export interface ExperimentBudget {
  maxModels?: number;
  maxTime?: number;
  maxCost?: number;
}

export interface ExperimentResults {
  bestModel: string;
  champion: ModelComparison;
  summary: ExperimentSummary;
  recommendations: ModelRecommendation[];
}

export interface ModelComparison {
  modelId: string;
  metrics: Record<string, number>;
  rank: number;
  improvement: number;
  significance: number;
}

export interface ExperimentSummary {
  totalModels: number;
  successfulModels: number;
  failedModels: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalDuration: number;
  resourceUsage: ExperimentResourceUsage;
}

export interface ExperimentResourceUsage {
  cpu: number;
  memory: number;
  storage: number;
  cost: number;
}

export interface ModelRecommendation {
  type: 'algorithm' | 'feature' | 'hyperparameter' | 'data';
  priority: 'low' | 'medium' | 'high';
  description: string;
  expectedImprovement: number;
  effort: string;
}

export interface ExperimentArtifact {
  id: string;
  name: string;
  type: 'model' | 'dataset' | 'report' | 'visualization' | 'log';
  path: string;
  size: number;
  createdAt: Date;
}

// State management interface
export interface PredictiveAnalyticsState {
  models: PredictiveModel[];
  experiments: ModelExperiment[];
  predictions: Prediction[];
  activeModel?: PredictiveModel;
  activeExperiment?: ModelExperiment;
  isLoading: boolean;
  error?: string;
  searchQuery: string;
  filters: {
    status?: string;
    type?: string;
    algorithm?: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const usePredictiveAnalytics = (workspaceId?: string) => {
  const [state, setState] = useState<PredictiveAnalyticsState>({
    models: [],
    experiments: [],
    predictions: [],
    isLoading: false,
    searchQuery: '',
    filters: {},
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const socket = useSocketConnection();

  // Load models
  const loadModels = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/models`);
      
      if (!response.ok) {
        throw new Error('Failed to load predictive models');
      }

      const models: PredictiveModel[] = await response.json();
      
      setState(prev => ({
        ...prev,
        models,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load models',
        isLoading: false,
      }));
    }
  }, [workspaceId]);

  // Create model
  const createModel = useCallback(async (model: Omit<PredictiveModel, 'id' | 'createdAt' | 'updatedAt' | 'performance'>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(model),
      });

      if (!response.ok) {
        throw new Error('Failed to create predictive model');
      }

      const newModel: PredictiveModel = await response.json();
      
      setState(prev => ({
        ...prev,
        models: [newModel, ...prev.models],
        isLoading: false,
      }));

      socket?.emit('model:created', { workspaceId, model: newModel });
      
      return newModel;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create model',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Train model
  const trainModel = useCallback(async (modelId: string, config?: Partial<TrainingDataset>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/models/${modelId}/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to start model training');
      }

      const trainingJob = await response.json();
      
      setState(prev => ({
        ...prev,
        models: prev.models.map(m => 
          m.id === modelId 
            ? { ...m, status: 'training', lastTrainedAt: new Date() }
            : m
        ),
        isLoading: false,
      }));

      socket?.emit('model:training:started', { workspaceId, modelId, job: trainingJob });
      
      return trainingJob;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to train model',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Deploy model
  const deployModel = useCallback(async (modelId: string, deployment: Partial<ModelDeployment>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/models/${modelId}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deployment),
      });

      if (!response.ok) {
        throw new Error('Failed to deploy model');
      }

      const deploymentResult = await response.json();
      
      setState(prev => ({
        ...prev,
        models: prev.models.map(m => 
          m.id === modelId 
            ? { ...m, deployment: { ...m.deployment, ...deploymentResult }, lastDeployedAt: new Date() }
            : m
        ),
        isLoading: false,
      }));

      socket?.emit('model:deployed', { workspaceId, modelId, deployment: deploymentResult });
      
      return deploymentResult;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to deploy model',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Make prediction
  const makePrediction = useCallback(async (modelId: string, input: Record<string, any>, options?: any) => {
    try {
      const response = await fetch(`/api/v1/models/${modelId}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input, options }),
      });

      if (!response.ok) {
        throw new Error('Failed to make prediction');
      }

      const prediction: Prediction = await response.json();
      
      setState(prev => ({
        ...prev,
        predictions: [prediction, ...prev.predictions.slice(0, 99)], // Keep last 100 predictions
      }));

      socket?.emit('prediction:made', { workspaceId, prediction });
      
      return prediction;
    } catch (error) {
      console.error('Failed to make prediction:', error);
      throw error;
    }
  }, [workspaceId, socket]);

  // Create experiment
  const createExperiment = useCallback(async (experiment: Omit<ModelExperiment, 'id' | 'createdAt' | 'results' | 'artifacts'>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/experiments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(experiment),
      });

      if (!response.ok) {
        throw new Error('Failed to create experiment');
      }

      const newExperiment: ModelExperiment = await response.json();
      
      setState(prev => ({
        ...prev,
        experiments: [newExperiment, ...prev.experiments],
        isLoading: false,
      }));

      socket?.emit('experiment:created', { workspaceId, experiment: newExperiment });
      
      return newExperiment;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create experiment',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Get model performance
  const getModelPerformance = useCallback(async (modelId: string, datasetId?: string) => {
    try {
      const params = new URLSearchParams();
      if (datasetId) params.set('dataset', datasetId);

      const response = await fetch(`/api/v1/models/${modelId}/performance?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to get model performance');
      }

      const performance: ModelPerformance = await response.json();
      return performance;
    } catch (error) {
      console.error('Failed to get model performance:', error);
      throw error;
    }
  }, []);

  // Get prediction explanation
  const getPredictionExplanation = useCallback(async (predictionId: string, method?: string) => {
    try {
      const params = new URLSearchParams();
      if (method) params.set('method', method);

      const response = await fetch(`/api/v1/predictions/${predictionId}/explain?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to get prediction explanation');
      }

      const explanation: PredictionExplanation = await response.json();
      return explanation;
    } catch (error) {
      console.error('Failed to get prediction explanation:', error);
      throw error;
    }
  }, []);

  // Monitor model drift
  const monitorModelDrift = useCallback(async (modelId: string, referenceDatasetId: string) => {
    try {
      const response = await fetch(`/api/v1/models/${modelId}/drift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ referenceDatasetId }),
      });

      if (!response.ok) {
        throw new Error('Failed to monitor model drift');
      }

      const driftReport = await response.json();
      return driftReport;
    } catch (error) {
      console.error('Failed to monitor model drift:', error);
      throw error;
    }
  }, []);

  // Set active model
  const setActiveModel = useCallback((modelId: string | undefined) => {
    setState(prev => ({
      ...prev,
      activeModel: modelId ? prev.models.find(m => m.id === modelId) : undefined,
    }));
  }, []);

  // Search models
  const searchModels = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // Set filters
  const setFilters = useCallback((filters: any) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...filters } }));
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !workspaceId) return;

    const handleModelCreated = (data: { model: PredictiveModel }) => {
      setState(prev => ({
        ...prev,
        models: [data.model, ...prev.models],
      }));
    };

    const handleModelUpdated = (data: { model: PredictiveModel }) => {
      setState(prev => ({
        ...prev,
        models: prev.models.map(m => m.id === data.model.id ? data.model : m),
        activeModel: prev.activeModel?.id === data.model.id ? data.model : prev.activeModel,
      }));
    };

    const handlePredictionMade = (data: { prediction: Prediction }) => {
      setState(prev => ({
        ...prev,
        predictions: [data.prediction, ...prev.predictions.slice(0, 99)],
      }));
    };

    socket.on('model:created', handleModelCreated);
    socket.on('model:updated', handleModelUpdated);
    socket.on('prediction:made', handlePredictionMade);

    return () => {
      socket.off('model:created', handleModelCreated);
      socket.off('model:updated', handleModelUpdated);
      socket.off('prediction:made', handlePredictionMade);
    };
  }, [socket, workspaceId]);

  // Load initial data
  useEffect(() => {
    if (workspaceId) {
      loadModels();
    }
  }, [workspaceId, loadModels]);

  return {
    ...state,
    actions: {
      loadModels,
      createModel,
      trainModel,
      deployModel,
      makePrediction,
      createExperiment,
      getModelPerformance,
      getPredictionExplanation,
      monitorModelDrift,
      setActiveModel,
      searchModels,
      setFilters,
    },
  };
};
