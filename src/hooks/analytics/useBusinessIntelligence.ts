import { useState, useEffect, useCallback } from 'react';
import { useSocketConnection } from '../useSocket';

// Business Intelligence Interfaces
export interface BusinessMetric {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'strategic' | 'performance' | 'quality';
  type: 'kpi' | 'measure' | 'ratio' | 'trend' | 'benchmark';
  formula: string;
  unit: string;
  target?: number;
  threshold: {
    excellent: number;
    good: number;
    warning: number;
    critical: number;
  };
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dataSource: DataSource;
  dependencies: string[];
  tags: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSource {
  type: 'database' | 'api' | 'file' | 'manual' | 'calculated';
  connection: string;
  query?: string;
  refreshRate: number;
  lastUpdated?: Date;
  schema: DataSchema;
}

export interface DataSchema {
  fields: DataField[];
  primaryKey: string[];
  relationships: DataRelationship[];
}

export interface DataField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'json';
  nullable: boolean;
  description?: string;
  validation?: FieldValidation;
}

export interface DataRelationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  sourceField: string;
  targetTable: string;
  targetField: string;
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  enum?: string[];
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'operational' | 'analytical' | 'departmental' | 'project';
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: GlobalFilter[];
  refreshInterval: number;
  isPublic: boolean;
  permissions: DashboardPermissions;
  theme: DashboardTheme;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardLayout {
  type: 'grid' | 'free' | 'tabbed';
  columns: number;
  rowHeight: number;
  gap: number;
  responsive: boolean;
  breakpoints: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'text' | 'image' | 'embed' | 'filter';
  title: string;
  description?: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: WidgetConfig;
  dataBinding: DataBinding;
  interactions: WidgetInteraction[];
  isVisible: boolean;
  refreshOnChange: boolean;
}

export interface WidgetConfig {
  visualization?: VisualizationConfig;
  formatting?: FormattingConfig;
  behavior?: BehaviorConfig;
  styling?: StylingConfig;
}

export interface DataBinding {
  metricId?: string;
  query?: string;
  parameters?: Parameter[];
  transformations?: DataTransformation[];
  caching?: CachingConfig;
}

export interface Parameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'list';
  value: any;
  required: boolean;
  description?: string;
}

export interface DataTransformation {
  type: 'filter' | 'aggregate' | 'sort' | 'group' | 'calculate' | 'pivot';
  config: Record<string, any>;
  order: number;
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  key?: string;
  invalidateOn?: string[];
}

export interface WidgetInteraction {
  type: 'drill-down' | 'filter' | 'navigation' | 'export' | 'refresh';
  config: InteractionConfig;
}

export interface InteractionConfig {
  target?: string;
  parameters?: Record<string, any>;
  conditions?: InteractionCondition[];
}

export interface InteractionCondition {
  field: string;
  operator: string;
  value: any;
}

export interface GlobalFilter {
  id: string;
  name: string;
  type: 'date-range' | 'select' | 'multi-select' | 'text' | 'number-range';
  field: string;
  defaultValue?: any;
  options?: FilterOption[];
  isRequired: boolean;
  affectedWidgets: string[];
}

export interface FilterOption {
  label: string;
  value: any;
  group?: string;
}

export interface DashboardPermissions {
  viewers: string[];
  editors: string[];
  admins: string[];
  publicAccess: 'none' | 'view' | 'embed';
  exportAllowed: boolean;
}

export interface DashboardTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface AnalyticsEngine {
  id: string;
  name: string;
  type: 'statistical' | 'machine-learning' | 'predictive' | 'optimization';
  algorithms: Algorithm[];
  models: AnalyticsModel[];
  pipelines: DataPipeline[];
  isActive: boolean;
  performance: EnginePerformance;
}

export interface Algorithm {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'clustering' | 'anomaly-detection' | 'forecasting';
  implementation: string;
  parameters: AlgorithmParameter[];
  requirements: AlgorithmRequirement[];
}

export interface AlgorithmParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'array';
  defaultValue: any;
  validation?: ParameterValidation;
  description: string;
}

export interface ParameterValidation {
  min?: number;
  max?: number;
  options?: any[];
  required?: boolean;
}

export interface AlgorithmRequirement {
  type: 'data-size' | 'data-type' | 'feature-count' | 'computation';
  constraint: string;
  value: any;
}

export interface AnalyticsModel {
  id: string;
  name: string;
  algorithmId: string;
  version: string;
  status: 'training' | 'trained' | 'deployed' | 'deprecated' | 'failed';
  accuracy: number;
  trainingData: TrainingData;
  hyperparameters: Record<string, any>;
  metrics: ModelMetrics;
  createdAt: Date;
  trainedAt?: Date;
  deployedAt?: Date;
}

export interface TrainingData {
  source: string;
  size: number;
  features: string[];
  target: string;
  splitRatio: {
    train: number;
    validation: number;
    test: number;
  };
  preprocessing: PreprocessingStep[];
}

export interface PreprocessingStep {
  type: 'normalize' | 'standardize' | 'encode' | 'impute' | 'feature-select';
  config: Record<string, any>;
  order: number;
}

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
  confusionMatrix?: number[][];
  featureImportance?: FeatureImportance[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
}

export interface DataPipeline {
  id: string;
  name: string;
  description: string;
  steps: PipelineStep[];
  schedule: PipelineSchedule;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  lastRun?: Date;
  nextRun?: Date;
  metrics: PipelineMetrics;
}

export interface PipelineStep {
  id: string;
  name: string;
  type: 'extract' | 'transform' | 'load' | 'validate' | 'analyze';
  config: StepConfig;
  dependencies: string[];
  retryPolicy: RetryPolicy;
  timeout: number;
}

export interface StepConfig {
  source?: string;
  destination?: string;
  transformations?: DataTransformation[];
  validations?: DataValidation[];
  parameters?: Record<string, any>;
}

export interface DataValidation {
  type: 'schema' | 'range' | 'uniqueness' | 'completeness' | 'consistency';
  config: ValidationConfig;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationConfig {
  rules: ValidationRule[];
  threshold?: number;
  message?: string;
}

export interface ValidationRule {
  field: string;
  condition: string;
  value?: any;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelay: number;
  maxDelay: number;
}

export interface PipelineSchedule {
  type: 'cron' | 'interval' | 'event' | 'manual';
  expression?: string;
  interval?: number;
  events?: string[];
  timezone: string;
}

export interface PipelineMetrics {
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  dataQualityScore: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

export interface EnginePerformance {
  throughput: number;
  latency: number;
  accuracy: number;
  uptime: number;
  errorRate: number;
}

// Formatting and styling interfaces
export interface FormattingConfig {
  numberFormat?: string;
  dateFormat?: string;
  currencySymbol?: string;
  decimalPlaces?: number;
  thousandsSeparator?: string;
  colorRules?: ColorRule[];
}

export interface ColorRule {
  condition: string;
  color: string;
  backgroundColor?: string;
  fontWeight?: string;
}

export interface BehaviorConfig {
  autoRefresh?: boolean;
  refreshInterval?: number;
  lazy?: boolean;
  clickable?: boolean;
  resizable?: boolean;
  draggable?: boolean;
}

export interface TooltipConfig {
  enabled: boolean;
  format?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: number;
}

export interface LegendConfig {
  enabled: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  orientation?: 'horizontal' | 'vertical';
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
}

export interface ZoomConfig {
  enabled: boolean;
  type: 'x' | 'y' | 'xy';
  rangeMin?: number;
  rangeMax?: number;
}

export interface SelectionConfig {
  enabled: boolean;
  type: 'single' | 'multiple';
  mode: 'point' | 'area';
}

export interface AnnotationConfig {
  id: string;
  type: 'line' | 'area' | 'point' | 'text';
  value: any;
  label?: string;
  color?: string;
  style?: any;
}

export interface StylingConfig {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: string;
  margin?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  customCss?: string;
}

export interface VisualizationConfig {
  chartType?: string;
  axes?: AxisConfig[];
  series?: SeriesConfig[];
  colors?: string[];
  annotations?: AnnotationConfig[];
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  zoom?: ZoomConfig;
  selection?: SelectionConfig;
}

export interface AxisConfig {
  id: string;
  position: 'left' | 'right' | 'top' | 'bottom';
  scale: 'linear' | 'logarithmic' | 'time' | 'ordinal';
  min?: number;
  max?: number;
  format?: string;
  label?: string;
  grid?: boolean;
}

export interface SeriesConfig {
  id: string;
  name: string;
  type: 'line' | 'bar' | 'area' | 'scatter' | 'bubble';
  xField: string;
  yField: string;
  color?: string;
  visible: boolean;
  axis?: string;
  stack?: string;
  smooth?: boolean;
}

// State management interface
export interface BusinessIntelligenceState {
  metrics: BusinessMetric[];
  dashboards: Dashboard[];
  engines: AnalyticsEngine[];
  activeDashboard?: Dashboard;
  activeMetric?: BusinessMetric;
  isLoading: boolean;
  error?: string;
  searchQuery: string;
  filters: GlobalFilter[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const useBusinessIntelligence = (workspaceId?: string) => {
  const [state, setState] = useState<BusinessIntelligenceState>({
    metrics: [],
    dashboards: [],
    engines: [],
    isLoading: false,
    searchQuery: '',
    filters: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const socket = useSocketConnection();

  // Load business metrics
  const loadMetrics = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/metrics`);
      
      if (!response.ok) {
        throw new Error('Failed to load business metrics');
      }

      const metrics: BusinessMetric[] = await response.json();
      
      setState(prev => ({
        ...prev,
        metrics,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load metrics',
        isLoading: false,
      }));
    }
  }, [workspaceId]);

  // Load dashboards
  const loadDashboards = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/dashboards`);
      
      if (!response.ok) {
        throw new Error('Failed to load dashboards');
      }

      const dashboards: Dashboard[] = await response.json();
      
      setState(prev => ({
        ...prev,
        dashboards,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load dashboards',
        isLoading: false,
      }));
    }
  }, [workspaceId]);

  // Search metrics and dashboards
  const searchMetrics = useCallback(async (query: string) => {
    if (!query.trim()) {
      // Reset to show all metrics and dashboards
      loadMetrics();
      loadDashboards();
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const lowerQuery = query.toLowerCase();
      
      // Filter metrics
      const filteredMetrics = state.metrics.filter(metric =>
        metric.name.toLowerCase().includes(lowerQuery) ||
        metric.description.toLowerCase().includes(lowerQuery) ||
        metric.category.toLowerCase().includes(lowerQuery) ||
        metric.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );

      // Filter dashboards
      const filteredDashboards = state.dashboards.filter(dashboard =>
        dashboard.name.toLowerCase().includes(lowerQuery) ||
        dashboard.description.toLowerCase().includes(lowerQuery) ||
        dashboard.category.toLowerCase().includes(lowerQuery) ||
        dashboard.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
      
      setState(prev => ({
        ...prev,
        metrics: filteredMetrics,
        dashboards: filteredDashboards,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false,
      }));
    }
  }, [state.metrics, state.dashboards, loadMetrics, loadDashboards]);

  // Create business metric
  const createMetric = useCallback(async (metric: Omit<BusinessMetric, 'id' | 'createdAt' | 'updatedAt'>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });

      if (!response.ok) {
        throw new Error('Failed to create business metric');
      }

      const newMetric: BusinessMetric = await response.json();
      
      setState(prev => ({
        ...prev,
        metrics: [newMetric, ...prev.metrics],
        isLoading: false,
      }));

      socket?.emit('metric:created', { workspaceId, metric: newMetric });
      
      return newMetric;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create metric',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Create dashboard
  const createDashboard = useCallback(async (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/dashboards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dashboard),
      });

      if (!response.ok) {
        throw new Error('Failed to create dashboard');
      }

      const newDashboard: Dashboard = await response.json();
      
      setState(prev => ({
        ...prev,
        dashboards: [newDashboard, ...prev.dashboards],
        isLoading: false,
      }));

      socket?.emit('dashboard:created', { workspaceId, dashboard: newDashboard });
      
      return newDashboard;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create dashboard',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Update dashboard
  const updateDashboard = useCallback(async (dashboardId: string, updates: Partial<Dashboard>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update dashboard');
      }

      const updatedDashboard: Dashboard = await response.json();
      
      setState(prev => ({
        ...prev,
        dashboards: prev.dashboards.map(d => d.id === dashboardId ? updatedDashboard : d),
        activeDashboard: prev.activeDashboard?.id === dashboardId ? updatedDashboard : prev.activeDashboard,
        isLoading: false,
      }));

      socket?.emit('dashboard:updated', { workspaceId, dashboard: updatedDashboard });
      
      return updatedDashboard;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update dashboard',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Add widget to dashboard
  const addWidget = useCallback(async (dashboardId: string, widget: Omit<DashboardWidget, 'id'>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/dashboards/${dashboardId}/widgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(widget),
      });

      if (!response.ok) {
        throw new Error('Failed to add widget');
      }

      const newWidget: DashboardWidget = await response.json();
      
      setState(prev => ({
        ...prev,
        dashboards: prev.dashboards.map(d => 
          d.id === dashboardId 
            ? { ...d, widgets: [...d.widgets, newWidget] }
            : d
        ),
        activeDashboard: prev.activeDashboard?.id === dashboardId 
          ? { ...prev.activeDashboard, widgets: [...prev.activeDashboard.widgets, newWidget] }
          : prev.activeDashboard,
        isLoading: false,
      }));

      socket?.emit('dashboard:widget:added', { workspaceId, dashboardId, widget: newWidget });
      
      return newWidget;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add widget',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Update widget
  const updateWidget = useCallback(async (dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/dashboards/${dashboardId}/widgets/${widgetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update widget');
      }

      const updatedWidget: DashboardWidget = await response.json();
      
      setState(prev => ({
        ...prev,
        dashboards: prev.dashboards.map(d => 
          d.id === dashboardId 
            ? { ...d, widgets: d.widgets.map(w => w.id === widgetId ? updatedWidget : w) }
            : d
        ),
        activeDashboard: prev.activeDashboard?.id === dashboardId 
          ? { ...prev.activeDashboard, widgets: prev.activeDashboard.widgets.map(w => w.id === widgetId ? updatedWidget : w) }
          : prev.activeDashboard,
        isLoading: false,
      }));

      socket?.emit('dashboard:widget:updated', { workspaceId, dashboardId, widget: updatedWidget });
      
      return updatedWidget;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update widget',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Execute metric calculation
  const executeMetric = useCallback(async (metricId: string, parameters?: Record<string, any>) => {
    try {
      const response = await fetch(`/api/v1/metrics/${metricId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parameters }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute metric');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to execute metric:', error);
      throw error;
    }
  }, []);

  // Get widget data
  const getWidgetData = useCallback(async (dashboardId: string, widgetId: string, filters?: GlobalFilter[]) => {
    try {
      const response = await fetch(`/api/v1/dashboards/${dashboardId}/widgets/${widgetId}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters }),
      });

      if (!response.ok) {
        throw new Error('Failed to get widget data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get widget data:', error);
      throw error;
    }
  }, []);

  // Train analytics model
  const trainModel = useCallback(async (modelConfig: Partial<AnalyticsModel>) => {
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/models/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to train model');
      }

      const model: AnalyticsModel = await response.json();
      return model;
    } catch (error) {
      console.error('Failed to train model:', error);
      throw error;
    }
  }, [workspaceId]);

  // Set active dashboard
  const setActiveDashboard = useCallback((dashboardId: string | undefined) => {
    setState(prev => ({
      ...prev,
      activeDashboard: dashboardId ? prev.dashboards.find(d => d.id === dashboardId) : undefined,
    }));
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !workspaceId) return;

    const handleMetricCreated = (data: { metric: BusinessMetric }) => {
      setState(prev => ({
        ...prev,
        metrics: [data.metric, ...prev.metrics],
      }));
    };

    const handleDashboardCreated = (data: { dashboard: Dashboard }) => {
      setState(prev => ({
        ...prev,
        dashboards: [data.dashboard, ...prev.dashboards],
      }));
    };

    const handleDashboardUpdated = (data: { dashboard: Dashboard }) => {
      setState(prev => ({
        ...prev,
        dashboards: prev.dashboards.map(d => d.id === data.dashboard.id ? data.dashboard : d),
        activeDashboard: prev.activeDashboard?.id === data.dashboard.id ? data.dashboard : prev.activeDashboard,
      }));
    };

    socket.on('metric:created', handleMetricCreated);
    socket.on('dashboard:created', handleDashboardCreated);
    socket.on('dashboard:updated', handleDashboardUpdated);

    return () => {
      socket.off('metric:created', handleMetricCreated);
      socket.off('dashboard:created', handleDashboardCreated);
      socket.off('dashboard:updated', handleDashboardUpdated);
    };
  }, [socket, workspaceId]);

  // Load initial data
  useEffect(() => {
    if (workspaceId) {
      loadMetrics();
      loadDashboards();
    }
  }, [workspaceId, loadMetrics, loadDashboards]);

  return {
    ...state,
    actions: {
      loadMetrics,
      loadDashboards,
      searchMetrics,
      createMetric,
      createDashboard,
      updateDashboard,
      addWidget,
      updateWidget,
      executeMetric,
      getWidgetData,
      trainModel,
      setActiveDashboard,
    },
  };
};
