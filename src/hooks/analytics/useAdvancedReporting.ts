import { useState, useEffect, useCallback } from 'react';
import { useSocketConnection } from '../useSocket';

// Advanced Reporting Interfaces
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'project' | 'time' | 'resource' | 'milestone' | 'custom';
  type: 'chart' | 'table' | 'dashboard' | 'kpi' | 'heatmap';
  config: ReportConfig;
  filters: ReportFilter[];
  visualizations: Visualization[];
  schedule?: ReportSchedule;
  sharing: SharingSettings;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  usageCount: number;
}

export interface ReportConfig {
  dateRange: {
    type: 'fixed' | 'relative' | 'dynamic';
    start?: Date;
    end?: Date;
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    offset?: number;
  };
  groupBy: string[];
  metrics: ReportMetric[];
  dimensions: string[];
  aggregations: Aggregation[];
  calculations: CustomCalculation[];
  formatting: FormattingOptions;
}

export interface ReportMetric {
  id: string;
  name: string;
  field: string;
  type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'percentage' | 'ratio' | 'custom';
  format: 'number' | 'currency' | 'percentage' | 'duration' | 'date';
  formula?: string;
  conditions?: MetricCondition[];
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  logic: 'AND' | 'OR';
  isRequired: boolean;
  isUserEditable: boolean;
}

export interface Visualization {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'gauge' | 'table' | 'kpi' | 'funnel' | 'treemap';
  title: string;
  data: VisualizationData;
  config: VisualizationConfig;
  position: { x: number; y: number; w: number; h: number };
  dependencies: string[];
}

export interface VisualizationData {
  query: string;
  cacheKey: string;
  refreshInterval: number;
  lastUpdated: Date;
  isLoading: boolean;
  error?: string;
  result?: any[];
}

export interface VisualizationConfig {
  axes?: {
    x: AxisConfig;
    y: AxisConfig;
  };
  series?: SeriesConfig[];
  colors?: string[];
  labels?: LabelConfig;
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  interactive?: boolean;
  exportable?: boolean;
}

export interface AxisConfig {
  label: string;
  field: string;
  type: 'linear' | 'logarithmic' | 'category' | 'time';
  format?: string;
  min?: number;
  max?: number;
  grid?: boolean;
}

export interface SeriesConfig {
  name: string;
  field: string;
  type: 'line' | 'bar' | 'area';
  color?: string;
  visible: boolean;
  stack?: string;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  timezone: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'email';
  lastRun?: Date;
  nextRun?: Date;
}

export interface SharingSettings {
  isPublic: boolean;
  allowedUsers: string[];
  allowedRoles: string[];
  permissions: {
    view: boolean;
    edit: boolean;
    share: boolean;
    export: boolean;
  };
  embedUrl?: string;
  expiresAt?: Date;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  result?: ReportResult;
  executedBy: string;
  parameters: Record<string, any>;
}

export interface ReportResult {
  data: any[];
  summary: ResultSummary;
  metadata: ResultMetadata;
  exportUrls?: ExportUrls;
}

export interface ResultSummary {
  totalRows: number;
  aggregations: Record<string, number>;
  insights: AutoInsight[];
  trends: TrendAnalysis[];
}

export interface AutoInsight {
  type: 'anomaly' | 'trend' | 'correlation' | 'outlier' | 'pattern';
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
}

export interface TrendAnalysis {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  period: string;
  significance: number;
}

export interface ExportUrls {
  pdf?: string;
  excel?: string;
  csv?: string;
  json?: string;
}

// Custom calculation types
export interface CustomCalculation {
  id: string;
  name: string;
  formula: string;
  dependencies: string[];
  description: string;
}

export interface Aggregation {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'stddev' | 'variance';
  alias: string;
}

export interface MetricCondition {
  field: string;
  operator: string;
  value: any;
}

export interface FormattingOptions {
  numberFormat: string;
  dateFormat: string;
  currencySymbol: string;
  decimalPlaces: number;
  thousandsSeparator: string;
  colorScheme: string;
}

export interface LabelConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  format?: string;
  rotation?: number;
}

export interface LegendConfig {
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
}

export interface TooltipConfig {
  enabled: boolean;
  format?: string;
  showAll?: boolean;
}

export interface ResultMetadata {
  generatedAt: Date;
  executionTime: number;
  cacheHit: boolean;
  rowCount: number;
  columns: ColumnMetadata[];
}

export interface ColumnMetadata {
  name: string;
  type: string;
  nullable: boolean;
  distinct: number;
}

// Report state management
export interface ReportingState {
  templates: ReportTemplate[];
  executions: ReportExecution[];
  activeReport?: ReportTemplate;
  isLoading: boolean;
  error?: string;
  filters: ReportFilter[];
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const useAdvancedReporting = (workspaceId?: string) => {
  const [state, setState] = useState<ReportingState>({
    templates: [],
    executions: [],
    isLoading: false,
    filters: [],
    searchQuery: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
    },
  });

  const socket = useSocketConnection();

  // Load report templates
  const loadTemplates = useCallback(async (filters?: Partial<ReportFilter>[]) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/reports`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load report templates');
      }

      const templates: ReportTemplate[] = await response.json();
      
      setState(prev => ({
        ...prev,
        templates,
        isLoading: false,
        pagination: {
          ...prev.pagination,
          total: templates.length,
        },
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load templates',
        isLoading: false,
      }));
    }
  }, [workspaceId]);

  // Create report template
  const createTemplate = useCallback(async (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        throw new Error('Failed to create report template');
      }

      const newTemplate: ReportTemplate = await response.json();
      
      setState(prev => ({
        ...prev,
        templates: [newTemplate, ...prev.templates],
        isLoading: false,
      }));

      socket?.emit('report:template:created', { workspaceId, template: newTemplate });
      
      return newTemplate;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create template',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Update report template
  const updateTemplate = useCallback(async (templateId: string, updates: Partial<ReportTemplate>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/reports/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update report template');
      }

      const updatedTemplate: ReportTemplate = await response.json();
      
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t => t.id === templateId ? updatedTemplate : t),
        activeReport: prev.activeReport?.id === templateId ? updatedTemplate : prev.activeReport,
        isLoading: false,
      }));

      socket?.emit('report:template:updated', { workspaceId, template: updatedTemplate });
      
      return updatedTemplate;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update template',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Delete report template
  const deleteTemplate = useCallback(async (templateId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/reports/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete report template');
      }

      setState(prev => ({
        ...prev,
        templates: prev.templates.filter(t => t.id !== templateId),
        activeReport: prev.activeReport?.id === templateId ? undefined : prev.activeReport,
        isLoading: false,
      }));

      socket?.emit('report:template:deleted', { workspaceId, templateId });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete template',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Execute report
  const executeReport = useCallback(async (templateId: string, parameters?: Record<string, any>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/reports/${templateId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parameters }),
      });

      if (!response.ok) {
        throw new Error('Failed to execute report');
      }

      const execution: ReportExecution = await response.json();
      
      setState(prev => ({
        ...prev,
        executions: [execution, ...prev.executions],
        isLoading: false,
      }));

      socket?.emit('report:execution:started', { workspaceId, execution });
      
      return execution;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to execute report',
        isLoading: false,
      }));
      throw error;
    }
  }, [workspaceId, socket]);

  // Get execution status
  const getExecutionStatus = useCallback(async (executionId: string) => {
    try {
      const response = await fetch(`/api/v1/report-executions/${executionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get execution status');
      }

      const execution: ReportExecution = await response.json();
      
      setState(prev => ({
        ...prev,
        executions: prev.executions.map(e => e.id === executionId ? execution : e),
      }));
      
      return execution;
    } catch (error) {
      console.error('Failed to get execution status:', error);
      throw error;
    }
  }, []);

  // Export report
  const exportReport = useCallback(async (executionId: string, format: 'pdf' | 'excel' | 'csv') => {
    try {
      const response = await fetch(`/api/v1/report-executions/${executionId}/export/${format}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const { url } = await response.json();
      
      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `report.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return url;
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    }
  }, []);

  // Schedule report
  const scheduleReport = useCallback(async (templateId: string, schedule: ReportSchedule) => {
    try {
      const response = await fetch(`/api/v1/reports/${templateId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedule),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule report');
      }

      const updatedTemplate: ReportTemplate = await response.json();
      
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t => t.id === templateId ? updatedTemplate : t),
      }));

      socket?.emit('report:scheduled', { workspaceId, template: updatedTemplate });
      
      return updatedTemplate;
    } catch (error) {
      console.error('Failed to schedule report:', error);
      throw error;
    }
  }, [workspaceId, socket]);

  // Share report
  const shareReport = useCallback(async (templateId: string, sharing: SharingSettings) => {
    try {
      const response = await fetch(`/api/v1/reports/${templateId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sharing),
      });

      if (!response.ok) {
        throw new Error('Failed to share report');
      }

      const updatedTemplate: ReportTemplate = await response.json();
      
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t => t.id === templateId ? updatedTemplate : t),
      }));

      socket?.emit('report:shared', { workspaceId, template: updatedTemplate });
      
      return updatedTemplate;
    } catch (error) {
      console.error('Failed to share report:', error);
      throw error;
    }
  }, [workspaceId, socket]);

  // Get report insights
  const getReportInsights = useCallback(async (templateId: string, dateRange?: { start: Date; end: Date }) => {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.set('start', dateRange.start.toISOString());
        params.set('end', dateRange.end.toISOString());
      }

      const response = await fetch(`/api/v1/reports/${templateId}/insights?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to get report insights');
      }

      const insights: AutoInsight[] = await response.json();
      return insights;
    } catch (error) {
      console.error('Failed to get report insights:', error);
      throw error;
    }
  }, []);

  // Set active report
  const setActiveReport = useCallback((reportId: string | undefined) => {
    setState(prev => ({
      ...prev,
      activeReport: reportId ? prev.templates.find(t => t.id === reportId) : undefined,
    }));
  }, []);

  // Search templates
  const searchTemplates = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // Set filters
  const setFilters = useCallback((filters: ReportFilter[]) => {
    setState(prev => ({ ...prev, filters }));
  }, []);

  // Sort templates
  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortBy, sortOrder }));
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !workspaceId) return;

    const handleReportTemplateCreated = (data: { template: ReportTemplate }) => {
      setState(prev => ({
        ...prev,
        templates: [data.template, ...prev.templates],
      }));
    };

    const handleReportTemplateUpdated = (data: { template: ReportTemplate }) => {
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t => t.id === data.template.id ? data.template : t),
        activeReport: prev.activeReport?.id === data.template.id ? data.template : prev.activeReport,
      }));
    };

    const handleReportTemplateDeleted = (data: { templateId: string }) => {
      setState(prev => ({
        ...prev,
        templates: prev.templates.filter(t => t.id !== data.templateId),
        activeReport: prev.activeReport?.id === data.templateId ? undefined : prev.activeReport,
      }));
    };

    const handleReportExecutionUpdated = (data: { execution: ReportExecution }) => {
      setState(prev => ({
        ...prev,
        executions: prev.executions.map(e => e.id === data.execution.id ? data.execution : e),
      }));
    };

    socket.on('report:template:created', handleReportTemplateCreated);
    socket.on('report:template:updated', handleReportTemplateUpdated);
    socket.on('report:template:deleted', handleReportTemplateDeleted);
    socket.on('report:execution:updated', handleReportExecutionUpdated);

    return () => {
      socket.off('report:template:created', handleReportTemplateCreated);
      socket.off('report:template:updated', handleReportTemplateUpdated);
      socket.off('report:template:deleted', handleReportTemplateDeleted);
      socket.off('report:execution:updated', handleReportExecutionUpdated);
    };
  }, [socket, workspaceId]);

  // Load initial data
  useEffect(() => {
    if (workspaceId) {
      loadTemplates();
    }
  }, [workspaceId, loadTemplates]);

  return {
    ...state,
    actions: {
      loadTemplates,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      executeReport,
      getExecutionStatus,
      exportReport,
      scheduleReport,
      shareReport,
      getReportInsights,
      setActiveReport,
      searchTemplates,
      setFilters,
      setSorting,
    },
  };
};
