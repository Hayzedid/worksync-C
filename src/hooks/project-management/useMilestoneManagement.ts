import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../useSocket';

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
  category: 'development' | 'design' | 'marketing' | 'research' | 'general';
  deliverableTemplates: Array<{
    name: string;
    description: string;
    type: string;
    estimatedDays: number;
  }>;
  estimatedDays: number;
  isPublic: boolean;
}

export interface MilestoneAnalytics {
  totalMilestones: number;
  completedMilestones: number;
  overdueMilestones: number;
  avgCompletionTime: number; // days
  onTimeDeliveryRate: number; // percentage
  budgetVariance: number; // percentage
  upcomingDeadlines: Milestone[];
  riskFactors: Array<{
    type: 'deadline' | 'budget' | 'dependencies' | 'resources';
    severity: 'low' | 'medium' | 'high';
    message: string;
    milestoneId: string;
  }>;
}

export interface MilestoneManagementHook {
  // Milestones state
  milestones: Milestone[];
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
  uploadFile: (milestoneId: string, deliverableId: string, file: File) => Promise<void>;
  
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
  
  // Resource management
  getResourceAllocation: (projectId: string) => Array<{
    userId: string;
    userName: string;
    allocatedMilestones: number;
    workload: number; // percentage
    availability: 'available' | 'busy' | 'overloaded';
  }>;
}

export function useMilestoneManagement(workspaceId: string): MilestoneManagementHook {
  const socket = useSocket();
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [milestoneTemplates, setMilestoneTemplates] = useState<MilestoneTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize milestone data
  useEffect(() => {
    const loadMilestones = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock milestone data
        const mockMilestones: Milestone[] = [
          {
            id: 'milestone-1',
            name: 'MVP Release',
            description: 'Complete minimum viable product with core features',
            projectId: 'project-1',
            dueDate: '2025-09-15T23:59:59Z',
            status: 'in-progress',
            progress: 65,
            priority: 'critical',
            color: '#ef4444',
            deliverables: [
              {
                id: 'del-1',
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
                    size: 1024576,
                    type: 'application/pdf'
                  }
                ]
              },
              {
                id: 'del-2',
                name: 'Dashboard Interface',
                description: 'Main dashboard with key metrics and navigation',
                type: 'feature',
                status: 'in-progress',
                assigneeId: 'user-2',
                dueDate: '2025-09-10T17:00:00Z',
                files: []
              },
              {
                id: 'del-3',
                name: 'API Documentation',
                description: 'Complete API documentation with examples',
                type: 'document',
                status: 'pending',
                dueDate: '2025-09-12T17:00:00Z',
                files: []
              }
            ],
            dependencies: [],
            assigneeId: 'user-1',
            assignee: {
              id: 'user-1',
              name: 'John Doe',
              avatar: '/avatars/john.jpg'
            },
            tags: ['mvp', 'critical', 'release'],
            budget: 50000,
            actualCost: 32500,
            createdAt: '2025-07-01T10:00:00Z',
            updatedAt: '2025-08-26T14:20:00Z'
          },
          {
            id: 'milestone-2',
            name: 'Beta Testing Phase',
            description: 'Comprehensive testing with beta users',
            projectId: 'project-1',
            dueDate: '2025-10-01T23:59:59Z',
            status: 'upcoming',
            progress: 15,
            priority: 'high',
            color: '#f59e0b',
            deliverables: [
              {
                id: 'del-4',
                name: 'Beta Testing Plan',
                description: 'Detailed plan for beta testing phase',
                type: 'document',
                status: 'pending',
                dueDate: '2025-09-20T17:00:00Z',
                files: []
              },
              {
                id: 'del-5',
                name: 'User Feedback System',
                description: 'System to collect and analyze user feedback',
                type: 'feature',
                status: 'pending',
                dueDate: '2025-09-25T17:00:00Z',
                files: []
              }
            ],
            dependencies: ['milestone-1'],
            tags: ['testing', 'beta', 'feedback'],
            budget: 25000,
            createdAt: '2025-07-01T10:00:00Z',
            updatedAt: '2025-08-20T09:15:00Z'
          }
        ];

        // Mock milestone templates
        const mockTemplates: MilestoneTemplate[] = [
          {
            id: 'template-1',
            name: 'Software Release Milestone',
            description: 'Standard milestone template for software releases',
            category: 'development',
            deliverableTemplates: [
              {
                name: 'Technical Specification',
                description: 'Detailed technical requirements and architecture',
                type: 'document',
                estimatedDays: 5
              },
              {
                name: 'Core Features Implementation',
                description: 'Development of main features',
                type: 'feature',
                estimatedDays: 15
              },
              {
                name: 'Testing and QA',
                description: 'Comprehensive testing of all features',
                type: 'other',
                estimatedDays: 7
              }
            ],
            estimatedDays: 30,
            isPublic: true
          }
        ];

        setMilestones(mockMilestones);
        setMilestoneTemplates(mockTemplates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load milestones');
      } finally {
        setIsLoading(false);
      }
    };

    loadMilestones();
  }, [workspaceId]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleMilestoneUpdate = (data: { milestoneId: string; updates: Partial<Milestone> }) => {
      setMilestones(prev => prev.map(milestone =>
        milestone.id === data.milestoneId
          ? { ...milestone, ...data.updates, updatedAt: new Date().toISOString() }
          : milestone
      ));
    };

    const handleMilestoneAdded = (milestone: Milestone) => {
      setMilestones(prev => [...prev, milestone]);
    };

    const handleMilestoneDeleted = (data: { milestoneId: string }) => {
      setMilestones(prev => prev.filter(m => m.id !== data.milestoneId));
    };

    const handleDeliverableUpdate = (data: {
      milestoneId: string;
      deliverableId: string;
      updates: Partial<Deliverable>;
    }) => {
      setMilestones(prev => prev.map(milestone =>
        milestone.id === data.milestoneId
          ? {
              ...milestone,
              deliverables: milestone.deliverables.map(del =>
                del.id === data.deliverableId ? { ...del, ...data.updates } : del
              ),
              updatedAt: new Date().toISOString()
            }
          : milestone
      ));
    };

    socket.on('milestone:updated', handleMilestoneUpdate);
    socket.on('milestone:added', handleMilestoneAdded);
    socket.on('milestone:deleted', handleMilestoneDeleted);
    socket.on('milestone:deliverable-updated', handleDeliverableUpdate);

    return () => {
      socket.off('milestone:updated', handleMilestoneUpdate);
      socket.off('milestone:added', handleMilestoneAdded);
      socket.off('milestone:deleted', handleMilestoneDeleted);
      socket.off('milestone:deliverable-updated', handleDeliverableUpdate);
    };
  }, [socket]);

  // Milestone operations
  const createMilestone = useCallback(async (milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!socket) throw new Error('Socket not connected');

    const newMilestone: Milestone = {
      ...milestone,
      id: `milestone-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    socket.emit('milestone:create', newMilestone);
    setMilestones(prev => [...prev, newMilestone]);
  }, [socket]);

  const updateMilestone = useCallback(async (milestoneId: string, updates: Partial<Milestone>) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('milestone:update', { milestoneId, updates });
    setMilestones(prev => prev.map(milestone =>
      milestone.id === milestoneId
        ? { ...milestone, ...updates, updatedAt: new Date().toISOString() }
        : milestone
    ));
  }, [socket]);

  const deleteMilestone = useCallback(async (milestoneId: string) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('milestone:delete', { milestoneId });
    setMilestones(prev => prev.filter(m => m.id !== milestoneId));
  }, [socket]);

  const completeMilestone = useCallback(async (milestoneId: string) => {
    const completedAt = new Date().toISOString();
    await updateMilestone(milestoneId, {
      status: 'completed',
      progress: 100,
      completedAt
    });
  }, [updateMilestone]);

  // Deliverable operations
  const addDeliverable = useCallback(async (milestoneId: string, deliverable: Omit<Deliverable, 'id'>) => {
    if (!socket) throw new Error('Socket not connected');

    const newDeliverable: Deliverable = {
      ...deliverable,
      id: `del-${Date.now()}`
    };

    socket.emit('milestone:add-deliverable', { milestoneId, deliverable: newDeliverable });
    
    setMilestones(prev => prev.map(milestone =>
      milestone.id === milestoneId
        ? {
            ...milestone,
            deliverables: [...milestone.deliverables, newDeliverable],
            updatedAt: new Date().toISOString()
          }
        : milestone
    ));
  }, [socket]);

  const updateDeliverable = useCallback(async (
    milestoneId: string,
    deliverableId: string,
    updates: Partial<Deliverable>
  ) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('milestone:update-deliverable', { milestoneId, deliverableId, updates });
    
    setMilestones(prev => prev.map(milestone =>
      milestone.id === milestoneId
        ? {
            ...milestone,
            deliverables: milestone.deliverables.map(del =>
              del.id === deliverableId ? { ...del, ...updates } : del
            ),
            updatedAt: new Date().toISOString()
          }
        : milestone
    ));
  }, [socket]);

  const deleteDeliverable = useCallback(async (milestoneId: string, deliverableId: string) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('milestone:delete-deliverable', { milestoneId, deliverableId });
    
    setMilestones(prev => prev.map(milestone =>
      milestone.id === milestoneId
        ? {
            ...milestone,
            deliverables: milestone.deliverables.filter(del => del.id !== deliverableId),
            updatedAt: new Date().toISOString()
          }
        : milestone
    ));
  }, [socket]);

  const uploadFile = useCallback(async (milestoneId: string, deliverableId: string, file: File) => {
    if (!socket) throw new Error('Socket not connected');

    // Mock file upload
    const mockFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      url: `/files/${file.name}`,
      size: file.size,
      type: file.type
    };

    await updateDeliverable(milestoneId, deliverableId, {
      files: [...(milestones.find(m => m.id === milestoneId)?.deliverables.find(d => d.id === deliverableId)?.files || []), mockFile]
    });
  }, [socket, milestones, updateDeliverable]);

  // Template operations
  const createFromTemplate = useCallback(async (templateId: string, projectId: string, customizations?: any) => {
    const template = milestoneTemplates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    const milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'> = {
      name: template.name,
      description: template.description,
      projectId,
      dueDate: new Date(Date.now() + template.estimatedDays * 24 * 60 * 60 * 1000).toISOString(),
      status: 'upcoming',
      progress: 0,
      priority: 'medium',
      color: '#3b82f6',
      deliverables: template.deliverableTemplates.map(delTemplate => ({
        id: `del-${Date.now()}-${Math.random()}`,
        name: delTemplate.name,
        description: delTemplate.description,
        type: delTemplate.type as any,
        status: 'pending' as const,
        files: []
      })),
      dependencies: [],
      tags: [template.category]
    };

    await createMilestone(milestone);
  }, [milestoneTemplates, createMilestone]);

  // Analytics and reporting
  const getProjectAnalytics = useCallback((projectId: string): MilestoneAnalytics => {
    const projectMilestones = milestones.filter(m => m.projectId === projectId);
    
    const totalMilestones = projectMilestones.length;
    const completedMilestones = projectMilestones.filter(m => m.status === 'completed').length;
    const overdueMilestones = projectMilestones.filter(m => 
      m.status !== 'completed' && new Date(m.dueDate) < new Date()
    ).length;

    const completedWithTimes = projectMilestones.filter(m => m.completedAt);
    const avgCompletionTime = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, m) => {
          const created = new Date(m.createdAt).getTime();
          const completed = new Date(m.completedAt!).getTime();
          return sum + ((completed - created) / (1000 * 60 * 60 * 24));
        }, 0) / completedWithTimes.length
      : 0;

    const onTimeDeliveryRate = totalMilestones > 0
      ? (completedMilestones / totalMilestones) * 100
      : 0;

    const budgetVariance = projectMilestones.reduce((sum, m) => {
      if (m.budget && m.actualCost) {
        return sum + ((m.actualCost - m.budget) / m.budget) * 100;
      }
      return sum;
    }, 0) / projectMilestones.filter(m => m.budget).length || 0;

    const upcomingDeadlines = projectMilestones
      .filter(m => m.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);

    return {
      totalMilestones,
      completedMilestones,
      overdueMilestones,
      avgCompletionTime,
      onTimeDeliveryRate,
      budgetVariance,
      upcomingDeadlines,
      riskFactors: [] // Mock implementation
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

    const deliverableProgress = milestone.deliverables.length > 0
      ? (milestone.deliverables.filter(d => d.status === 'completed').length / milestone.deliverables.length) * 100
      : 0;

    const now = Date.now();
    const created = new Date(milestone.createdAt).getTime();
    const due = new Date(milestone.dueDate).getTime();
    const timeProgress = Math.min(((now - created) / (due - created)) * 100, 100);

    const budgetProgress = milestone.budget && milestone.actualCost
      ? (milestone.actualCost / milestone.budget) * 100
      : 0;

    return {
      overallProgress: milestone.progress,
      deliverableProgress,
      timeProgress,
      budgetProgress
    };
  }, [milestones]);

  // Other utility functions
  const projectMilestones = useCallback((projectId: string) => {
    return milestones.filter(m => m.projectId === projectId);
  }, [milestones]);

  const upcomingMilestones = milestones.filter(m => 
    m.status === 'upcoming' || m.status === 'in-progress'
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const overdueMilestones = milestones.filter(m =>
    m.status !== 'completed' && new Date(m.dueDate) < new Date()
  );

  // More utility functions would be implemented here...
  const getMilestoneTimeline = useCallback((projectId: string) => {
    // Mock implementation
    return [];
  }, []);

  const updateDependencies = useCallback(async (milestoneId: string, dependencies: string[]) => {
    await updateMilestone(milestoneId, { dependencies });
  }, [updateMilestone]);

  const setReminder = useCallback(async (milestoneId: string, reminderDate: string, message: string) => {
    if (!socket) throw new Error('Socket not connected');
    socket.emit('milestone:set-reminder', { milestoneId, reminderDate, message });
  }, [socket]);

  const getUpcomingDeadlines = useCallback((days: number) => {
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return milestones.filter(m => 
      m.status !== 'completed' && 
      new Date(m.dueDate) <= futureDate
    );
  }, [milestones]);

  const getResourceAllocation = useCallback((projectId: string) => {
    // Mock implementation
    return [];
  }, []);

  return {
    milestones,
    projectMilestones,
    upcomingMilestones,
    overdueMilestones,
    isLoading,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    completeMilestone,
    addDeliverable,
    updateDeliverable,
    deleteDeliverable,
    uploadFile,
    milestoneTemplates,
    createFromTemplate,
    getProjectAnalytics,
    getMilestoneProgress,
    getMilestoneTimeline,
    updateDependencies,
    setReminder,
    getUpcomingDeadlines,
    getResourceAllocation
  };
}
