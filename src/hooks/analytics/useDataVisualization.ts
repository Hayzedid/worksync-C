import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../useSocket';

// Data Visualization Interfaces
export interface VisualizationEngine {
  id: string;
  name: string;
  version: string;
  capabilities: EngineCapability[];
  chartTypes: ChartType[];
  themes: VisualizationTheme[];
  plugins: VisualizationPlugin[];
  isActive: boolean;
}

export interface EngineCapability {
  name: string;
  description: string;
  supported: boolean;
  version?: string;
}

export interface ChartType {
  id: string;
  name: string;
  category: 'basic' | 'statistical' | 'geographic' | 'specialized' | 'custom';
  description: string;
  icon: string;
  requirements: ChartRequirement[];
  defaultConfig: ChartConfig;
  examples: ChartExample[];
}

export interface ChartRequirement {
  type: 'data-structure' | 'data-type' | 'minimum-records' | 'maximum-records';
  constraint: string;
  value: any;
  description: string;
}

export interface ChartConfig {
  dimensions: DimensionConfig[];
  measures: MeasureConfig[];
  styling: ChartStyling;
  interactions: ChartInteraction[];
  animations: AnimationConfig;
  accessibility: AccessibilityConfig;
}

export interface DimensionConfig {
  id: string;
  field: string;
  name: string;
  type: 'categorical' | 'temporal' | 'ordinal' | 'geographical';
  format?: string;
  sorting: SortConfig;
  filtering: FilterConfig;
  grouping?: GroupingConfig;
}

export interface MeasureConfig {
  id: string;
  field: string;
  name: string;
  aggregation: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'median' | 'stddev' | 'custom';
  format: string;
  unit?: string;
  calculation?: CalculationConfig;
}

export interface SortConfig {
  enabled: boolean;
  direction: 'asc' | 'desc' | 'auto';
  by: 'value' | 'label' | 'custom';
  customOrder?: string[];
}

export interface FilterConfig {
  enabled: boolean;
  type: 'include' | 'exclude' | 'range' | 'top-n' | 'bottom-n';
  values?: any[];
  condition?: FilterCondition;
}

export interface FilterCondition {
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
  value: any;
  caseSensitive?: boolean;
}

export interface GroupingConfig {
  enabled: boolean;
  levels: number;
  separator: string;
  collapsible: boolean;
}

export interface CalculationConfig {
  type: 'running-total' | 'percent-of-total' | 'difference' | 'percent-change' | 'custom';
  formula?: string;
  scope?: 'table' | 'pane' | 'cell';
}

export interface ChartStyling {
  colors: ColorConfig;
  fonts: FontConfig;
  spacing: SpacingConfig;
  borders: BorderConfig;
  background: BackgroundConfig;
  customCss?: string;
}

export interface ColorConfig {
  scheme: 'categorical' | 'sequential' | 'diverging' | 'custom';
  palette: string[];
  opacity: number;
  gradient?: GradientConfig;
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  direction: number;
  stops: ColorStop[];
}

export interface ColorStop {
  offset: number;
  color: string;
  opacity?: number;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  style: 'normal' | 'italic' | 'oblique';
  color: string;
}

export interface SpacingConfig {
  padding: number;
  margin: number;
  gap: number;
}

export interface BorderConfig {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'none';
  color: string;
  radius: number;
}

export interface BackgroundConfig {
  color: string;
  image?: string;
  pattern?: PatternConfig;
}

export interface PatternConfig {
  type: 'stripes' | 'dots' | 'grid' | 'custom';
  density: number;
  color: string;
  opacity: number;
}

export interface ChartInteraction {
  type: 'hover' | 'click' | 'drag' | 'zoom' | 'pan' | 'select' | 'brush';
  enabled: boolean;
  config: InteractionConfig;
  handlers: InteractionHandler[];
}

export interface InteractionConfig {
  cursor?: string;
  highlight?: HighlightConfig;
  tooltip?: TooltipConfig;
  selection?: SelectionConfig;
}

export interface HighlightConfig {
  enabled: boolean;
  color?: string;
  opacity?: number;
  strokeWidth?: number;
}

export interface TooltipConfig {
  enabled: boolean;
  template?: string;
  position: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  offset: { x: number; y: number };
  styling: TooltipStyling;
}

export interface TooltipStyling {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  fontSize: number;
  padding: number;
  maxWidth?: number;
}

export interface SelectionConfig {
  mode: 'single' | 'multiple' | 'range';
  persistent: boolean;
  crossfilter: boolean;
}

export interface InteractionHandler {
  event: string;
  action: 'filter' | 'drill-down' | 'navigate' | 'export' | 'custom';
  target?: string;
  parameters?: Record<string, any>;
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  delay: number;
  stagger: number;
  enter?: AnimationEffect;
  exit?: AnimationEffect;
  update?: AnimationEffect;
}

export interface AnimationEffect {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'morph';
  direction?: 'up' | 'down' | 'left' | 'right';
  from?: number;
  to?: number;
}

export interface AccessibilityConfig {
  enabled: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  textAlternatives: TextAlternative[];
  ariaLabels: Record<string, string>;
}

export interface TextAlternative {
  element: string;
  description: string;
  format: 'short' | 'long' | 'sonified';
}

export interface ChartExample {
  name: string;
  description: string;
  sampleData: any[];
  config: Partial<ChartConfig>;
  preview: string;
}

export interface VisualizationTheme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
  animations: ThemeAnimations;
  accessibility: ThemeAccessibility;
}

export interface ThemeColors {
  primary: string[];
  secondary: string[];
  accent: string[];
  neutral: string[];
  semantic: SemanticColors;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeFonts {
  primary: FontConfig;
  secondary: FontConfig;
  mono: FontConfig;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeAnimations {
  fast: number;
  normal: number;
  slow: number;
  easing: string;
}

export interface ThemeAccessibility {
  contrastRatio: number;
  focusOutline: string;
  screenReaderText: string;
}

export interface VisualizationPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  chartTypes: string[];
  dependencies: string[];
  configuration: PluginConfiguration;
  isActive: boolean;
}

export interface PluginConfiguration {
  settings: PluginSetting[];
  customProperties: CustomProperty[];
  eventHandlers: EventHandler[];
}

export interface PluginSetting {
  key: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color';
  defaultValue: any;
  options?: SettingOption[];
  validation?: SettingValidation;
}

export interface SettingOption {
  label: string;
  value: any;
}

export interface SettingValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface CustomProperty {
  name: string;
  type: string;
  description: string;
}

export interface EventHandler {
  event: string;
  handler: string;
  description: string;
}

export interface VisualizationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'dashboard' | 'report' | 'analysis' | 'presentation';
  chartTypes: string[];
  layout: TemplateLayout;
  defaultData: any[];
  configuration: TemplateConfiguration;
  preview: string;
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
}

export interface TemplateLayout {
  type: 'grid' | 'flex' | 'absolute';
  containers: LayoutContainer[];
  responsive: boolean;
  breakpoints: LayoutBreakpoint[];
}

export interface LayoutContainer {
  id: string;
  type: 'chart' | 'text' | 'image' | 'spacer';
  position: ContainerPosition;
  styling: ContainerStyling;
  content?: ContainerContent;
}

export interface ContainerPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

export interface ContainerStyling {
  backgroundColor?: string;
  border?: BorderConfig;
  padding?: SpacingConfig;
  margin?: SpacingConfig;
  borderRadius?: number;
}

export interface ContainerContent {
  chartType?: string;
  chartConfig?: ChartConfig;
  text?: string;
  image?: string;
  data?: any[];
}

export interface LayoutBreakpoint {
  name: string;
  width: number;
  containers: LayoutContainer[];
}

export interface TemplateConfiguration {
  variables: TemplateVariable[];
  dataSources: TemplateDataSource[];
  filters: TemplateFilter[];
  exports: TemplateExport[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  defaultValue: any;
  description: string;
  required: boolean;
}

export interface TemplateDataSource {
  id: string;
  name: string;
  type: 'static' | 'api' | 'database' | 'file';
  configuration: DataSourceConfiguration;
  schema: DataSourceSchema;
}

export interface DataSourceConfiguration {
  url?: string;
  query?: string;
  parameters?: Record<string, any>;
  headers?: Record<string, string>;
  authentication?: AuthenticationConfig;
}

export interface AuthenticationConfig {
  type: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth';
  credentials?: Record<string, any>;
}

export interface DataSourceSchema {
  fields: SchemaField[];
  primaryKey?: string;
  relationships?: SchemaRelationship[];
}

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'object' | 'array';
  nullable: boolean;
  description?: string;
  format?: string;
  enum?: any[];
}

export interface SchemaRelationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  field: string;
  targetSource: string;
  targetField: string;
}

export interface TemplateFilter {
  id: string;
  name: string;
  type: 'text' | 'select' | 'date' | 'range' | 'multiselect';
  field: string;
  defaultValue?: any;
  options?: FilterOption[];
  required: boolean;
}

export interface FilterOption {
  label: string;
  value: any;
  group?: string;
}

export interface TemplateExport {
  format: 'png' | 'svg' | 'pdf' | 'excel' | 'csv' | 'json';
  quality?: number;
  dimensions?: { width: number; height: number };
  options?: Record<string, any>;
}

// State management interface
export interface DataVisualizationState {
  engines: VisualizationEngine[];
  themes: VisualizationTheme[];
  plugins: VisualizationPlugin[];
  templates: VisualizationTemplate[];
  activeEngine?: VisualizationEngine;
  activeTheme?: VisualizationTheme;
  isLoading: boolean;
  error?: string;
  searchQuery: string;
  filters: {
    category?: string;
    chartType?: string;
    theme?: string;
  };
}

export const useDataVisualization = (workspaceId?: string) => {
  const [state, setState] = useState<DataVisualizationState>({
    engines: [],
    themes: [],
    plugins: [],
    templates: [],
    isLoading: false,
    searchQuery: '',
    filters: {},
  });

  const socket = useSocket();

  // Load visualization engines
  const loadEngines = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch('/api/v1/visualization/engines');
      
      if (!response.ok) {
        throw new Error('Failed to load visualization engines');
      }

      const engines: VisualizationEngine[] = await response.json();
      
      setState(prev => ({
        ...prev,
        engines,
        activeEngine: engines.find(e => e.isActive) || engines[0],
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load engines',
        isLoading: false,
      }));
    }
  }, []);

  // Load visualization themes
  const loadThemes = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch('/api/v1/visualization/themes');
      
      if (!response.ok) {
        throw new Error('Failed to load visualization themes');
      }

      const themes: VisualizationTheme[] = await response.json();
      
      setState(prev => ({
        ...prev,
        themes,
        activeTheme: themes[0],
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load themes',
        isLoading: false,
      }));
    }
  }, []);

  // Load templates
  const loadTemplates = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/visualization/templates`);
      
      if (!response.ok) {
        throw new Error('Failed to load visualization templates');
      }

      const templates: VisualizationTemplate[] = await response.json();
      
      setState(prev => ({
        ...prev,
        templates,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load templates',
        isLoading: false,
      }));
    }
  }, [workspaceId]);

  // Create chart
  const createChart = useCallback(async (config: {
    type: string;
    data: any[];
    config: ChartConfig;
    container?: string;
  }) => {
    try {
      const response = await fetch('/api/v1/visualization/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to create chart');
      }

      const chart = await response.json();
      return chart;
    } catch (error) {
      console.error('Failed to create chart:', error);
      throw error;
    }
  }, []);

  // Update chart
  const updateChart = useCallback(async (chartId: string, updates: Partial<ChartConfig>) => {
    try {
      const response = await fetch(`/api/v1/visualization/charts/${chartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update chart');
      }

      const chart = await response.json();
      return chart;
    } catch (error) {
      console.error('Failed to update chart:', error);
      throw error;
    }
  }, []);

  // Export chart
  const exportChart = useCallback(async (chartId: string, format: 'png' | 'svg' | 'pdf', options?: any) => {
    try {
      const response = await fetch(`/api/v1/visualization/charts/${chartId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format, options }),
      });

      if (!response.ok) {
        throw new Error('Failed to export chart');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `chart.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      return url;
    } catch (error) {
      console.error('Failed to export chart:', error);
      throw error;
    }
  }, []);

  // Create template
  const createTemplate = useCallback(async (template: Omit<VisualizationTemplate, 'id' | 'createdAt' | 'usageCount'>) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch(`/api/v1/workspaces/${workspaceId}/visualization/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const newTemplate: VisualizationTemplate = await response.json();
      
      setState(prev => ({
        ...prev,
        templates: [newTemplate, ...prev.templates],
        isLoading: false,
      }));

      socket?.emit('visualization:template:created', { workspaceId, template: newTemplate });
      
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

  // Apply template
  const applyTemplate = useCallback(async (templateId: string, data: any[], variables?: Record<string, any>) => {
    try {
      const response = await fetch(`/api/v1/visualization/templates/${templateId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, variables }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply template');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to apply template:', error);
      throw error;
    }
  }, []);

  // Install plugin
  const installPlugin = useCallback(async (pluginUrl: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      const response = await fetch('/api/v1/visualization/plugins/install', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: pluginUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to install plugin');
      }

      const plugin: VisualizationPlugin = await response.json();
      
      setState(prev => ({
        ...prev,
        plugins: [plugin, ...prev.plugins],
        isLoading: false,
      }));

      socket?.emit('visualization:plugin:installed', { plugin });
      
      return plugin;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to install plugin',
        isLoading: false,
      }));
      throw error;
    }
  }, [socket]);

  // Set active engine
  const setActiveEngine = useCallback((engineId: string) => {
    setState(prev => ({
      ...prev,
      activeEngine: prev.engines.find(e => e.id === engineId),
    }));
  }, []);

  // Set active theme
  const setActiveTheme = useCallback((themeId: string) => {
    setState(prev => ({
      ...prev,
      activeTheme: prev.themes.find(t => t.id === themeId),
    }));
  }, []);

  // Search templates
  const searchTemplates = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // Set filters
  const setFilters = useCallback((filters: any) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...filters } }));
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !workspaceId) return;

    const handleTemplateCreated = (data: { template: VisualizationTemplate }) => {
      setState(prev => ({
        ...prev,
        templates: [data.template, ...prev.templates],
      }));
    };

    const handlePluginInstalled = (data: { plugin: VisualizationPlugin }) => {
      setState(prev => ({
        ...prev,
        plugins: [data.plugin, ...prev.plugins],
      }));
    };

    socket.on('visualization:template:created', handleTemplateCreated);
    socket.on('visualization:plugin:installed', handlePluginInstalled);

    return () => {
      socket.off('visualization:template:created', handleTemplateCreated);
      socket.off('visualization:plugin:installed', handlePluginInstalled);
    };
  }, [socket, workspaceId]);

  // Load initial data
  useEffect(() => {
    loadEngines();
    loadThemes();
    if (workspaceId) {
      loadTemplates();
    }
  }, [workspaceId, loadEngines, loadThemes, loadTemplates]);

  return {
    ...state,
    actions: {
      loadEngines,
      loadThemes,
      loadTemplates,
      createChart,
      updateChart,
      exportChart,
      createTemplate,
      applyTemplate,
      installPlugin,
      setActiveEngine,
      setActiveTheme,
      searchTemplates,
      setFilters,
    },
  };
};
