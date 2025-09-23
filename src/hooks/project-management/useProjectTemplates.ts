import { useState, useEffect, useCallback } from 'react';
import { useSocketConnection } from '../useSocket';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'software' | 'marketing' | 'design' | 'research' | 'general';
  icon: string;
  color: string;
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  rating: number;
  tags: string[];
  structure: {
    phases: TemplatePhase[];
    taskTemplates: TaskTemplate[];
    kanbanColumns: KanbanColumnTemplate[];
    milestones: MilestoneTemplate[];
  };
  settings: {
    defaultAssignee?: 'creator' | 'team-lead' | 'none';
    autoCreateKanban: boolean;
    enableTimeTracking: boolean;
    requireApprovals: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TemplatePhase {
  id: string;
  name: string;
  description: string;
  order: number;
  duration: number; // days
  dependencies: string[]; // phase IDs
  color: string;
  taskTemplateIds: string[];
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  phaseId: string;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  dependencies: string[]; // task template IDs
  assigneeRole?: 'project-manager' | 'developer' | 'designer' | 'qa' | 'any';
  dueOffset: number; // days from project start
}

export interface KanbanColumnTemplate {
  id: string;
  title: string;
  order: number;
  color: string;
  limit?: number;
}

export interface MilestoneTemplate {
  id: string;
  name: string;
  description: string;
  dueOffset: number; // days from project start
  phaseId: string;
  deliverables: string[];
}

export interface ProjectFromTemplate {
  templateId: string;
  name: string;
  description?: string;
  workspaceId: string;
  startDate: string;
  teamMembers: Array<{
    userId: string;
    role: 'project-manager' | 'developer' | 'designer' | 'qa' | 'member';
  }>;
  customizations: {
    skipPhases?: string[];
    skipTasks?: string[];
    modifyDurations?: Array<{ phaseId: string; newDuration: number }>;
  };
}

export interface ProjectTemplateHook {
  // Templates state
  templates: ProjectTemplate[];
  featuredTemplates: ProjectTemplate[];
  myTemplates: ProjectTemplate[];
  isLoading: boolean;
  error: string | null;
  
  // Search and filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  filteredTemplates: ProjectTemplate[];
  
  // Template operations
  createTemplate: (template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating'>) => Promise<void>;
  updateTemplate: (templateId: string, updates: Partial<ProjectTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  duplicateTemplate: (templateId: string, newName: string) => Promise<void>;
  
  // Project creation from template
  createProjectFromTemplate: (params: ProjectFromTemplate) => Promise<string>; // returns project ID
  previewTemplate: (templateId: string) => ProjectTemplate | null;
  
  // Template management
  publishTemplate: (templateId: string) => Promise<void>;
  unpublishTemplate: (templateId: string) => Promise<void>;
  rateTemplate: (templateId: string, rating: number) => Promise<void>;
  favoriteTemplate: (templateId: string) => Promise<void>;
  unfavoriteTemplate: (templateId: string) => Promise<void>;
  
  // Analytics
  getTemplateAnalytics: (templateId: string) => {
    usageCount: number;
    averageRating: number;
    successRate: number;
    averageCompletionTime: number;
  };
}

export function useProjectTemplates(): ProjectTemplateHook {
  const socket = useSocketConnection();
  
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<ProjectTemplate[]>([]);
  const [myTemplates, setMyTemplates] = useState<ProjectTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Initialize templates data
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock templates data
        const mockTemplates: ProjectTemplate[] = [
          {
            id: 'template-1',
            name: 'Web Application Development',
            description: 'Complete template for building modern web applications',
            category: 'software',
            icon: '💻',
            color: '#3b82f6',
            isPublic: true,
            createdBy: 'system',
            usageCount: 245,
            rating: 4.8,
            tags: ['web', 'development', 'fullstack'],
            structure: {
              phases: [
                {
                  id: 'phase-1',
                  name: 'Planning & Design',
                  description: 'Project planning and UI/UX design',
                  order: 0,
                  duration: 14,
                  dependencies: [],
                  color: '#f59e0b',
                  taskTemplateIds: ['task-1', 'task-2', 'task-3']
                },
                {
                  id: 'phase-2',
                  name: 'Backend Development',
                  description: 'API and database implementation',
                  order: 1,
                  duration: 21,
                  dependencies: ['phase-1'],
                  color: '#10b981',
                  taskTemplateIds: ['task-4', 'task-5', 'task-6']
                },
                {
                  id: 'phase-3',
                  name: 'Frontend Development',
                  description: 'User interface implementation',
                  order: 2,
                  duration: 18,
                  dependencies: ['phase-1'],
                  color: '#8b5cf6',
                  taskTemplateIds: ['task-7', 'task-8', 'task-9']
                },
                {
                  id: 'phase-4',
                  name: 'Testing & Deployment',
                  description: 'Quality assurance and production deployment',
                  order: 3,
                  duration: 10,
                  dependencies: ['phase-2', 'phase-3'],
                  color: '#ef4444',
                  taskTemplateIds: ['task-10', 'task-11', 'task-12']
                }
              ],
              taskTemplates: [
                {
                  id: 'task-1',
                  title: 'Create project requirements document',
                  description: 'Define functional and non-functional requirements',
                  phaseId: 'phase-1',
                  estimatedHours: 16,
                  priority: 'high',
                  tags: ['planning', 'documentation'],
                  dependencies: [],
                  assigneeRole: 'project-manager',
                  dueOffset: 3
                },
                {
                  id: 'task-2',
                  title: 'Design system architecture',
                  description: 'Create technical architecture diagrams',
                  phaseId: 'phase-1',
                  estimatedHours: 12,
                  priority: 'high',
                  tags: ['architecture', 'design'],
                  dependencies: ['task-1'],
                  assigneeRole: 'developer',
                  dueOffset: 7
                },
                {
                  id: 'task-3',
                  title: 'Create UI wireframes',
                  description: 'Design user interface wireframes and mockups',
                  phaseId: 'phase-1',
                  estimatedHours: 20,
                  priority: 'medium',
                  tags: ['design', 'ui'],
                  dependencies: ['task-1'],
                  assigneeRole: 'designer',
                  dueOffset: 14
                }
              ],
              kanbanColumns: [
                { id: 'col-1', title: 'Backlog', order: 0, color: '#f3f4f6' },
                { id: 'col-2', title: 'In Progress', order: 1, color: '#fef3c7', limit: 3 },
                { id: 'col-3', title: 'Review', order: 2, color: '#dbeafe', limit: 2 },
                { id: 'col-4', title: 'Testing', order: 3, color: '#fce7f3' },
                { id: 'col-5', title: 'Done', order: 4, color: '#d1fae5' }
              ],
              milestones: [
                {
                  id: 'milestone-1',
                  name: 'Design Approval',
                  description: 'All designs approved by stakeholders',
                  dueOffset: 14,
                  phaseId: 'phase-1',
                  deliverables: ['Requirements Document', 'Architecture Diagram', 'UI Mockups']
                },
                {
                  id: 'milestone-2',
                  name: 'MVP Release',
                  description: 'Minimum viable product ready for testing',
                  dueOffset: 45,
                  phaseId: 'phase-3',
                  deliverables: ['Backend API', 'Frontend App', 'Documentation']
                }
              ]
            },
            settings: {
              defaultAssignee: 'team-lead',
              autoCreateKanban: true,
              enableTimeTracking: true,
              requireApprovals: true
            },
            createdAt: '2025-01-15T10:00:00Z',
            updatedAt: '2025-08-20T14:30:00Z'
          },
          {
            id: 'template-2',
            name: 'Marketing Campaign',
            description: 'Complete marketing campaign from planning to execution',
            category: 'marketing',
            icon: '📢',
            color: '#ec4899',
            isPublic: true,
            createdBy: 'system',
            usageCount: 182,
            rating: 4.6,
            tags: ['marketing', 'campaign', 'digital'],
            structure: {
              phases: [
                {
                  id: 'phase-1',
                  name: 'Strategy & Planning',
                  description: 'Campaign strategy and planning phase',
                  order: 0,
                  duration: 7,
                  dependencies: [],
                  color: '#f59e0b',
                  taskTemplateIds: ['task-1', 'task-2']
                },
                {
                  id: 'phase-2',
                  name: 'Content Creation',
                  description: 'Create marketing materials and content',
                  order: 1,
                  duration: 14,
                  dependencies: ['phase-1'],
                  color: '#8b5cf6',
                  taskTemplateIds: ['task-3', 'task-4']
                }
              ],
              taskTemplates: [
                {
                  id: 'task-1',
                  title: 'Define target audience',
                  description: 'Research and define target customer segments',
                  phaseId: 'phase-1',
                  estimatedHours: 8,
                  priority: 'high',
                  tags: ['research', 'audience'],
                  dependencies: [],
                  assigneeRole: 'any',
                  dueOffset: 3
                }
              ],
              kanbanColumns: [
                { id: 'col-1', title: 'Ideas', order: 0, color: '#f3f4f6' },
                { id: 'col-2', title: 'In Progress', order: 1, color: '#fef3c7' },
                { id: 'col-3', title: 'Review', order: 2, color: '#dbeafe' },
                { id: 'col-4', title: 'Published', order: 3, color: '#d1fae5' }
              ],
              milestones: [
                {
                  id: 'milestone-1',
                  name: 'Campaign Launch',
                  description: 'Campaign goes live across all channels',
                  dueOffset: 21,
                  phaseId: 'phase-2',
                  deliverables: ['Campaign Materials', 'Content Calendar', 'Analytics Setup']
                }
              ]
            },
            settings: {
              defaultAssignee: 'creator',
              autoCreateKanban: true,
              enableTimeTracking: false,
              requireApprovals: true
            },
            createdAt: '2025-02-10T09:00:00Z',
            updatedAt: '2025-08-18T11:15:00Z'
          }
        ];

        setTemplates(mockTemplates);
        setFeaturedTemplates(mockTemplates.filter(t => t.rating >= 4.5));
        setMyTemplates(mockTemplates.filter(t => t.createdBy === 'current-user')); // Mock
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Template operations
  const createTemplate = useCallback(async (template: Omit<ProjectTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating'>) => {
    if (!socket) throw new Error('Socket not connected');
    
    const newTemplate: ProjectTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      usageCount: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    socket.emit('template:create', newTemplate);
    setTemplates(prev => [...prev, newTemplate]);
  }, [socket]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<ProjectTemplate>) => {
    if (!socket) throw new Error('Socket not connected');
    
    socket.emit('template:update', { templateId, updates });
    setTemplates(prev => prev.map(t => 
      t.id === templateId 
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
    ));
  }, [socket]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    if (!socket) throw new Error('Socket not connected');
    
    socket.emit('template:delete', { templateId });
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  }, [socket]);

  const duplicateTemplate = useCallback(async (templateId: string, newName: string) => {
    const originalTemplate = templates.find(t => t.id === templateId);
    if (!originalTemplate) throw new Error('Template not found');

    const duplicatedTemplate: ProjectTemplate = {
      ...originalTemplate,
      id: `template-${Date.now()}`,
      name: newName,
      isPublic: false,
      usageCount: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await createTemplate(duplicatedTemplate);
  }, [templates, createTemplate]);

  const createProjectFromTemplate = useCallback(async (params: ProjectFromTemplate): Promise<string> => {
    if (!socket) throw new Error('Socket not connected');
    
    const projectId = `project-${Date.now()}`;
    
    socket.emit('template:create-project', { ...params, projectId });
    
    // Update template usage count
    setTemplates(prev => prev.map(t =>
      t.id === params.templateId
        ? { ...t, usageCount: t.usageCount + 1 }
        : t
    ));

    return projectId;
  }, [socket]);

  const previewTemplate = useCallback((templateId: string) => {
    return templates.find(t => t.id === templateId) || null;
  }, [templates]);

  const publishTemplate = useCallback(async (templateId: string) => {
    await updateTemplate(templateId, { isPublic: true });
  }, [updateTemplate]);

  const unpublishTemplate = useCallback(async (templateId: string) => {
    await updateTemplate(templateId, { isPublic: false });
  }, [updateTemplate]);

  const rateTemplate = useCallback(async (templateId: string, rating: number) => {
    if (!socket) throw new Error('Socket not connected');
    
    socket.emit('template:rate', { templateId, rating });
  }, [socket]);

  const favoriteTemplate = useCallback(async (templateId: string) => {
    if (!socket) throw new Error('Socket not connected');
    
    socket.emit('template:favorite', { templateId });
  }, [socket]);

  const unfavoriteTemplate = useCallback(async (templateId: string) => {
    if (!socket) throw new Error('Socket not connected');
    
    socket.emit('template:unfavorite', { templateId });
  }, [socket]);

  const getTemplateAnalytics = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      return {
        usageCount: 0,
        averageRating: 0,
        successRate: 0,
        averageCompletionTime: 0
      };
    }

    // Mock analytics data
    return {
      usageCount: template.usageCount,
      averageRating: template.rating,
      successRate: 0.85, // 85% of projects completed successfully
      averageCompletionTime: 45 // days
    };
  }, [templates]);

  return {
    templates,
    featuredTemplates,
    myTemplates,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    createProjectFromTemplate,
    previewTemplate,
    publishTemplate,
    unpublishTemplate,
    rateTemplate,
    favoriteTemplate,
    unfavoriteTemplate,
    getTemplateAnalytics
  };
}
