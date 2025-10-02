import { useState, useEffect, useCallback } from 'react';
import { useSocketConnection } from '../useSocket';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  projectId: string;
  dueDate: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  progress: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
  color: string;
  deliverables: Deliverable[];
  dependencies: string[]; // milestone IDs
  assigneeId?: string;
  assignedTo?: string[]; // user IDs assigned to this milestone
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  budget?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Deliverable {
  id: string;
  milestoneId: string;
  name: string;
  description: string;
  type: 'document' | 'feature' | 'design' | 'report' | 'other';
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  assigneeId?: string;
  dueDate?: string;
  completedAt?: string;
  files: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}

export interface MilestoneTemplate {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'design' | 'marketing' | 'research' | 'deployment';
  estimatedDuration: number; // days
  deliverableTemplates: Array<{
    name: string;
    description: string;
    type: string;
    estimatedHours: number;
  }>;
  tags: string[];
}

export interface MilestoneAnalytics {
  projectId: string;
  totalMilestones: number;
  completedMilestones: number;
  overdueMilestones: number;
  averageCompletionTime: number; // days
  successRate: number; // percentage
  budgetVariance: number; // percentage
  timelineVariance: number; // percentage
  deliverableCompletionRate: number; // percentage
  riskScore: number; // 1-10
  recommendations: string[];
}

export interface ResourceForecast {
  period: 'week' | 'month' | 'quarter';
  startDate: string;
  endDate: string;
  totalCapacity: number; // hours
  allocatedHours: number;
  availableHours: number;
  utilizationRate: number; // percentage
  breakdown: {
    byDepartment: Array<{
      department: string;
      capacity: number;
      allocated: number;
      utilization: number;
    }>;
    bySkill: Array<{
      skill: string;
      demand: number;
      supply: number;
      gap: number;
    }>;
    byProject: Array<{
      projectId: string;
      projectName: string;
      requiredHours: number;
      allocatedHours: number;
      status: 'adequately-staffed' | 'understaffed' | 'overstaffed';
    }>;
  };
}

export interface MilestoneManagementHook {
  // Milestones state
  milestones: Milestone[];
  deliverables: Deliverable[];
  projectMilestones: (projectId: string) => Milestone[];
  upcomingMilestones: Milestone[];
  overdueMilestones: Milestone[];
  isLoading: boolean;
  error: string | null;

  // Milestone operations
  createMilestone: (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
  completeMilestone: (milestoneId: string) => Promise<void>;

  // Deliverable operations
  addDeliverable: (milestoneId: string, deliverable: Omit<Deliverable, 'id'>) => Promise<void>;
  updateDeliverable: (milestoneId: string, deliverableId: string, updates: Partial<Deliverable>) => Promise<void>;
  deleteDeliverable: (milestoneId: string, deliverableId: string) => Promise<void>;
  removeDeliverable: (milestoneId: string, deliverableId: string) => Promise<void>;
  uploadFile: (milestoneId: string, deliverableId: string, file: File) => Promise<void>;

  // Progress and reporting
  getProjectProgress: (projectId: string) => any;
  getCriticalPath: (projectId: string) => any;
  generateMilestoneReport: (projectId: string) => any;

  // Templates
  milestoneTemplates: MilestoneTemplate[];
  createFromTemplate: (templateId: string, projectId: string, customizations?: any) => Promise<void>;

  // Analytics and reporting
  getProjectAnalytics: (projectId: string) => MilestoneAnalytics;
  getMilestoneProgress: (milestoneId: string) => {
    overallProgress: number;
    deliverableProgress: number;
    timeProgress: number;
    budgetProgress: number;
  };

  // Timeline and dependencies
  getMilestoneTimeline: (projectId: string) => Array<{
    milestone: Milestone;
    startDate: string;
    endDate: string;
    dependencies: string[];
    criticalPath: boolean;
  }>;
  updateDependencies: (milestoneId: string, dependencies: string[]) => Promise<void>;

  // Notifications and reminders
  setReminder: (milestoneId: string, reminderDate: string, message: string) => Promise<void>;
  getUpcomingDeadlines: (days: number) => Milestone[];

  // Resource allocation
  getResourceAllocation: (projectId: string) => any[];
}

export function useMilestoneManagement(workspaceId: string): MilestoneManagementHook {
  // State
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'milestone-1',
      name: 'MVP Development',
      description: 'Complete minimum viable product features',
      projectId: 'project-1',
      dueDate: '2025-09-30T17:00:00Z',
      status: 'in-progress',
      progress: 65,
      priority: 'critical',
      color: '#ef4444',
      assignedTo: ['user-1', 'user-2', 'user-3'],
      deliverables: [
        {
          id: 'del-1',
          milestoneId: 'milestone-1',
          name: 'User Authentication System',
          description: 'Complete login, registration, and password reset functionality',
          type: 'feature',
          status: 'completed',
          assigneeId: 'user-1',
          dueDate: '2025-09-01T17:00:00Z',
          completedAt: '2025-08-25T16:30:00Z',
          files: [
            {
              id: 'file-1',
              name: 'auth-spec.pdf',
              url: '/files/auth-spec.pdf',
              size: 245760,
              type: 'application/pdf'
            }
          ]
        },
        {
          id: 'del-2',
          milestoneId: 'milestone-1',
          name: 'Dashboard Interface',
          description: 'Main dashboard with key metrics and navigation',
          type: 'feature',
          status: 'in-progress',
          assigneeId: 'user-2',
          dueDate: '2025-09-15T17:00:00Z',
          files: []
        },
        {
          id: 'del-3',
          milestoneId: 'milestone-1',
          name: 'API Documentation',
          description: 'Complete API documentation with examples',
          type: 'document',
          status: 'pending',
          dueDate: '2025-09-20T17:00:00Z',
          files: []
        }
      ],
      dependencies: [],
      tags: ['core', 'mvp', 'critical'],
      budget: 50000,
      actualCost: 32500,
      createdAt: '2025-08-01T10:00:00Z',
      updatedAt: '2025-08-25T16:30:00Z'
    },
    {
      id: 'milestone-2',
      name: 'Beta Testing',
      description: 'Comprehensive testing with beta users',
      projectId: 'project-1',
      dueDate: '2025-11-15T17:00:00Z',
      status: 'upcoming',
      progress: 0,
      priority: 'high',
      color: '#f59e0b',
      assignedTo: ['user-3', 'user-4'],
      deliverables: [
        {
          id: 'del-4',
          milestoneId: 'milestone-2',
          name: 'Beta Testing Plan',
          description: 'Detailed plan for beta testing phase',
          type: 'document',
          status: 'pending',
          dueDate: '2025-10-15T17:00:00Z',
          files: []
        },
        {
          id: 'del-5',
          milestoneId: 'milestone-2',
          name: 'User Feedback System',
          description: 'System to collect and analyze user feedback',
          type: 'feature',
          status: 'pending',
          dueDate: '2025-10-30T17:00:00Z',
          files: []
        }
      ],
      dependencies: ['milestone-1'],
      tags: ['testing', 'beta', 'feedback'],
      budget: 25000,
      actualCost: 0,
      createdAt: '2025-08-01T10:00:00Z',
      updatedAt: '2025-08-01T10:00:00Z'
    }
  ]);

  const [milestoneTemplates] = useState<MilestoneTemplate[]>([
    {
      id: 'template-1',
      name: 'Development Sprint',
      description: 'Standard 2-week development sprint template',
      category: 'development',
      estimatedDuration: 14,
      deliverableTemplates: [
        {
          name: 'Sprint Planning',
          description: 'Define sprint goals and tasks',
          type: 'document',
          estimatedHours: 4
        },
        {
          name: 'Feature Implementation',
          description: 'Core feature development',
          type: 'feature',
          estimatedHours: 60
        },
        {
          name: 'Code Review',
          description: 'Review and approve code changes',
          type: 'review',
          estimatedHours: 8
        }
      ],
      tags: ['development', 'sprint', 'agile']
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketConnection = useSocketConnection();

  // Derived state
  const projectMilestones = useCallback((projectId: string): Milestone[] => {
    return milestones.filter(milestone => milestone.projectId === projectId);
  }, [milestones]);

  const upcomingMilestones = useCallback((): Milestone[] => {
    return milestones.filter(milestone =>
      milestone.status === 'upcoming' || milestone.status === 'in-progress'
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [milestones]);

  const overdueMilestones = useCallback((): Milestone[] => {
    const now = new Date();
    return milestones.filter(milestone =>
      milestone.status !== 'completed' && new Date(milestone.dueDate) < now
    );
  }, [milestones]);

  // Milestone operations
  const createMilestone = useCallback(async (milestoneData: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      const newMilestone: Milestone = {
        ...milestoneData,
        id: `milestone-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setMilestones(prev => [...prev, newMilestone]);

      // Emit socket event
      socketConnection?.emit('milestone:created', {
        workspaceId,
        milestone: newMilestone
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create milestone');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, socketConnection]);

  const updateMilestone = useCallback(async (milestoneId: string, updates: Partial<Milestone>) => {
    try {
      setIsLoading(true);
      setMilestones(prev => prev.map(milestone =>
        milestone.id === milestoneId
          ? { ...milestone, ...updates, updatedAt: new Date().toISOString() }
          : milestone
      ));

      socketConnection?.emit('milestone:updated', {
        workspaceId,
        milestoneId,
        updates
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update milestone');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, socketConnection]);

  const deleteMilestone = useCallback(async (milestoneId: string) => {
    try {
      setIsLoading(true);
      setMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId));

      socketConnection?.emit('milestone:deleted', {
        workspaceId,
        milestoneId
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete milestone');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, socketConnection]);

  const completeMilestone = useCallback(async (milestoneId: string) => {
    await updateMilestone(milestoneId, {
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    });
  }, [updateMilestone]);

  // Deliverable operations
  const addDeliverable = useCallback(async (milestoneId: string, deliverableData: Omit<Deliverable, 'id'>) => {
    try {
      setIsLoading(true);
      const newDeliverable: Deliverable = {
        ...deliverableData,
        id: `deliverable-${Date.now()}`,
        milestoneId
      };

      setMilestones(prev => prev.map(milestone =>
        milestone.id === milestoneId
          ? {
              ...milestone,
              deliverables: [...(milestone.deliverables || []), newDeliverable],
              updatedAt: new Date().toISOString()
            }
          : milestone
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add deliverable');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDeliverable = useCallback(async (milestoneId: string, deliverableId: string, updates: Partial<Deliverable>) => {
    try {
      setIsLoading(true);
      setMilestones(prev => prev.map(milestone =>
        milestone.id === milestoneId
          ? {
              ...milestone,
              deliverables: milestone.deliverables?.map(deliverable =>
                deliverable.id === deliverableId
                  ? { ...deliverable, ...updates }
                  : deliverable
              ) || [],
              updatedAt: new Date().toISOString()
            }
          : milestone
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deliverable');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDeliverable = useCallback(async (milestoneId: string, deliverableId: string) => {
    try {
      setIsLoading(true);
      setMilestones(prev => prev.map(milestone =>
        milestone.id === milestoneId
          ? {
              ...milestone,
              deliverables: milestone.deliverables?.filter(deliverable =>
                deliverable.id !== deliverableId
              ) || [],
              updatedAt: new Date().toISOString()
            }
          : milestone
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deliverable');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (milestoneId: string, deliverableId: string, file: File) => {
    // Mock file upload implementation
    const mockFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      url: `/files/${file.name}`,
      size: file.size,
      type: file.type
    };

    await updateDeliverable(milestoneId, deliverableId, {
      files: [...(milestones.find(m => m.id === milestoneId)?.deliverables?.find(d => d.id === deliverableId)?.files || []), mockFile]
    });
  }, [milestones, updateDeliverable]);

  // Template operations
  const createFromTemplate = useCallback(async (templateId: string, projectId: string, customizations?: any) => {
    const template = milestoneTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newMilestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'> = {
      name: customizations?.name || template.name,
      description: customizations?.description || template.description,
      projectId,
      dueDate: customizations?.dueDate || new Date(Date.now() + template.estimatedDuration * 24 * 60 * 60 * 1000).toISOString(),
      status: 'upcoming',
      progress: 0,
      priority: customizations?.priority || 'medium',
      color: customizations?.color || '#3b82f6',
      deliverables: template.deliverableTemplates.map(delTemplate => ({
        id: `deliverable-${Date.now()}-${Math.random()}`,
        milestoneId: '', // Will be set after milestone creation
        name: delTemplate.name,
        description: delTemplate.description,
        type: delTemplate.type as any,
        status: 'pending' as const,
        files: []
      })),
      dependencies: customizations?.dependencies || [],
      tags: [...template.tags, ...(customizations?.tags || [])],
      assignedTo: customizations?.assignedTo || []
    };

    await createMilestone(newMilestone);
  }, [milestoneTemplates, createMilestone]);

  // Analytics and reporting
  const getProjectAnalytics = useCallback((projectId: string): MilestoneAnalytics => {
    const projectMilestones = milestones.filter(m => m.projectId === projectId);
    const completed = projectMilestones.filter(m => m.status === 'completed');
    const overdue = projectMilestones.filter(m => m.status === 'overdue');

    return {
      projectId,
      totalMilestones: projectMilestones.length,
      completedMilestones: completed.length,
      overdueMilestones: overdue.length,
      averageCompletionTime: 14, // Mock data
      successRate: projectMilestones.length > 0 ? (completed.length / projectMilestones.length) * 100 : 0,
      budgetVariance: -5, // Mock data
      timelineVariance: 10, // Mock data
      deliverableCompletionRate: 85, // Mock data
      riskScore: 3, // Mock data
      recommendations: [
        'Consider extending timeline for remaining milestones',
        'Allocate additional resources to critical path items'
      ]
    };
  }, [milestones]);

  const getMilestoneProgress = useCallback((milestoneId: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      return {
        overallProgress: 0,
        deliverableProgress: 0,
        timeProgress: 0,
        budgetProgress: 0
      };
    }

    const deliverableProgress = milestone.deliverables?.length
      ? (milestone.deliverables.filter(d => d.status === 'completed').length / milestone.deliverables.length) * 100
      : 0;

    return {
      overallProgress: milestone.progress,
      deliverableProgress,
      timeProgress: 75, // Mock calculation
      budgetProgress: milestone.budget && milestone.actualCost
        ? (milestone.actualCost / milestone.budget) * 100
        : 0
    };
  }, [milestones]);

  const getMilestoneTimeline = useCallback((projectId: string) => {
    return milestones
      .filter(m => m.projectId === projectId)
      .map(milestone => ({
        milestone,
        startDate: new Date(new Date(milestone.dueDate).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: milestone.dueDate,
        dependencies: milestone.dependencies,
        criticalPath: milestone.priority === 'critical'
      }));
  }, [milestones]);

  const updateDependencies = useCallback(async (milestoneId: string, dependencies: string[]) => {
    await updateMilestone(milestoneId, { dependencies });
  }, [updateMilestone]);

  const setReminder = useCallback(async (milestoneId: string, reminderDate: string, message: string) => {
    // Mock implementation
    console.log('Setting reminder for milestone:', milestoneId, reminderDate, message);
  }, []);

  const getUpcomingDeadlines = useCallback((days: number): Milestone[] => {
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return milestones.filter(milestone =>
      milestone.status !== 'completed' &&
      new Date(milestone.dueDate) <= cutoffDate
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [milestones]);

  const getResourceAllocation = useCallback((projectId: string) => {
    // Mock implementation
    return [];
  }, []);

  return {
    milestones,
    deliverables: milestones.flatMap(m => m.deliverables || []),
    projectMilestones,
    upcomingMilestones: upcomingMilestones(),
    overdueMilestones: overdueMilestones(),
    isLoading,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    completeMilestone,
    addDeliverable,
    updateDeliverable,
    deleteDeliverable,
    removeDeliverable: deleteDeliverable,
    uploadFile,
    milestoneTemplates,
    createFromTemplate,
    getProjectAnalytics,
    getMilestoneProgress,
    getProjectProgress: (projectId: string) => ({
      overallProgress: 75,
      milestonesCompleted: 3,
      totalMilestones: 5,
      deliverablesCompleted: 12,
      totalDeliverables: 15
    }),
    getCriticalPath: (projectId: string) => milestones.filter(m => m.priority === 'critical'),
    generateMilestoneReport: (projectId: string) => ({
      summary: 'Project progress summary',
      completedMilestones: milestones.filter(m => m.status === 'completed'),
      upcomingMilestones: milestones.filter(m => m.status === 'upcoming'),
      overdueItems: []
    }),
    getMilestoneTimeline,
    updateDependencies,
    setReminder,
    getUpcomingDeadlines,
    getResourceAllocation
  };
}