import { useState, useEffect, useCallback } from 'react';
import { useSocketConnection } from '../useSocket';

export interface ResourceAllocation {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    department: string;
  };
  projectId: string;
  project: {
    id: string;
    name: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  allocation: number; // percentage (0-100)
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  skills: string[];
  hourlyRate?: number;
  estimatedHours: number;
  actualHours: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'project-manager' | 'developer' | 'designer' | 'qa' | 'analyst' | 'other';
  department: string;
  skills: string[];
  capacity: number; // hours per week
  hourlyRate?: number;
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    availableHours: number; // per week
    overallocation: number; // percentage over capacity
  };
  workload: ResourceAllocation[];
  performance: {
    completionRate: number; // percentage
    qualityScore: number; // 1-10
    collaborationScore: number; // 1-10
  };
}

export interface ResourceConflict {
  id: string;
  type: 'overallocation' | 'skill-gap' | 'timeline-conflict' | 'priority-conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: string[];
  affectedProjects: string[];
  description: string;
  suggestedActions: string[];
  resolvedAt?: string;
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

export interface ResourceManagementHook {
  // Team members and allocations
  teamMembers: TeamMember[];
  resourceAllocations: ResourceAllocation[];
  isLoading: boolean;
  error: string | null;
  
  // Resource allocation operations
  allocateResource: (allocation: Omit<ResourceAllocation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAllocation: (allocationId: string, updates: Partial<ResourceAllocation>) => Promise<void>;
  removeAllocation: (allocationId: string) => Promise<void>;
  bulkAllocate: (allocations: Omit<ResourceAllocation, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
  
  // Team member management
  addTeamMember: (member: Omit<TeamMember, 'id' | 'workload' | 'availability' | 'performance'>) => Promise<void>;
  updateTeamMember: (memberId: string, updates: Partial<TeamMember>) => Promise<void>;
  removeTeamMember: (memberId: string) => Promise<void>;
  updateCapacity: (memberId: string, capacity: number) => Promise<void>;
  
  // Availability and workload
  getUserAvailability: (userId: string, startDate: string, endDate: string) => {
    totalCapacity: number;
    allocatedHours: number;
    availableHours: number;
    utilizationRate: number;
    overallocation: number;
  };
  getProjectResources: (projectId: string) => ResourceAllocation[];
  getResourcesBySkill: (skill: string) => TeamMember[];
  
  // Conflict detection and resolution
  conflicts: ResourceConflict[];
  detectConflicts: () => Promise<ResourceConflict[]>;
  resolveConflict: (conflictId: string, resolution: string) => Promise<void>;
  getOverallocatedUsers: () => TeamMember[];
  
  // Forecasting and planning
  generateForecast: (period: string, startDate: string) => Promise<ResourceForecast>;
  optimizeAllocations: (projectId: string) => Promise<{
    currentUtilization: number;
    optimizedUtilization: number;
    recommendations: Array<{
      type: 'reallocation' | 'hiring' | 'timeline-adjustment';
      description: string;
      impact: string;
    }>;
  }>;
  
  // Reporting and analytics
  getUtilizationReport: (startDate: string, endDate: string) => Promise<{
    averageUtilization: number;
    departmentUtilization: Array<{
      department: string;
      utilization: number;
    }>;
    trends: Array<{
      week: string;
      utilization: number;
    }>;
  }>;
  getSkillsMatrix: () => Array<{
    skill: string;
    users: Array<{
      userId: string;
      userName: string;
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>;
    demand: number;
    supply: number;
  }>;
  
  // Search and filtering
  searchMembers: (query: string) => TeamMember[];
  filterByAvailability: (minHours: number) => TeamMember[];
  filterBySkills: (requiredSkills: string[]) => TeamMember[];
}

export function useResourceAllocation(workspaceId: string): ResourceManagementHook {
  const socket = useSocketConnection();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[]>([]);
  const [conflicts, setConflicts] = useState<ResourceConflict[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize resource management data
  useEffect(() => {
    const loadResourceData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock team members data
        const mockTeamMembers: TeamMember[] = [
          {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@company.com',
            avatar: '/avatars/john.jpg',
            role: 'developer',
            department: 'Engineering',
            skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
            capacity: 40, // hours per week
            hourlyRate: 75,
            availability: {
              status: 'busy',
              availableHours: 8,
              overallocation: 20
            },
            workload: [],
            performance: {
              completionRate: 95,
              qualityScore: 9,
              collaborationScore: 8
            }
          },
          {
            id: 'user-2',
            name: 'Sarah Smith',
            email: 'sarah@company.com',
            avatar: '/avatars/sarah.jpg',
            role: 'designer',
            department: 'Design',
            skills: ['UI/UX', 'Figma', 'Prototyping', 'User Research'],
            capacity: 40,
            hourlyRate: 65,
            availability: {
              status: 'available',
              availableHours: 15,
              overallocation: 0
            },
            workload: [],
            performance: {
              completionRate: 98,
              qualityScore: 9,
              collaborationScore: 9
            }
          },
          {
            id: 'user-3',
            name: 'Mike Johnson',
            email: 'mike@company.com',
            avatar: '/avatars/mike.jpg',
            role: 'project-manager',
            department: 'Management',
            skills: ['Project Management', 'Agile', 'Risk Management', 'Stakeholder Management'],
            capacity: 40,
            hourlyRate: 85,
            availability: {
              status: 'busy',
              availableHours: 5,
              overallocation: 10
            },
            workload: [],
            performance: {
              completionRate: 92,
              qualityScore: 8,
              collaborationScore: 10
            }
          }
        ];

        // Mock resource allocations
        const mockAllocations: ResourceAllocation[] = [
          {
            id: 'alloc-1',
            userId: 'user-1',
            user: {
              id: 'user-1',
              name: 'John Doe',
              email: 'john@company.com',
              avatar: '/avatars/john.jpg',
              role: 'Senior Developer',
              department: 'Engineering'
            },
            projectId: 'project-1',
            project: {
              id: 'project-1',
              name: 'E-commerce Platform',
              priority: 'high'
            },
            allocation: 80, // 80% allocation
            startDate: '2025-08-15T00:00:00Z',
            endDate: '2025-10-15T00:00:00Z',
            status: 'active',
            skills: ['React', 'Node.js'],
            hourlyRate: 75,
            estimatedHours: 320,
            actualHours: 125,
            notes: 'Lead developer for frontend and API development',
            createdAt: '2025-08-10T10:00:00Z',
            updatedAt: '2025-08-26T14:30:00Z'
          },
          {
            id: 'alloc-2',
            userId: 'user-2',
            user: {
              id: 'user-2',
              name: 'Sarah Smith',
              email: 'sarah@company.com',
              avatar: '/avatars/sarah.jpg',
              role: 'UX Designer',
              department: 'Design'
            },
            projectId: 'project-1',
            project: {
              id: 'project-1',
              name: 'E-commerce Platform',
              priority: 'high'
            },
            allocation: 60,
            startDate: '2025-08-01T00:00:00Z',
            endDate: '2025-09-30T00:00:00Z',
            status: 'active',
            skills: ['UI/UX', 'Prototyping'],
            hourlyRate: 65,
            estimatedHours: 160,
            actualHours: 95,
            notes: 'Responsible for user experience design and prototyping',
            createdAt: '2025-07-25T09:00:00Z',
            updatedAt: '2025-08-25T11:15:00Z'
          },
          {
            id: 'alloc-3',
            userId: 'user-3',
            user: {
              id: 'user-3',
              name: 'Mike Johnson',
              email: 'mike@company.com',
              avatar: '/avatars/mike.jpg',
              role: 'Project Manager',
              department: 'Management'
            },
            projectId: 'project-1',
            project: {
              id: 'project-1',
              name: 'E-commerce Platform',
              priority: 'high'
            },
            allocation: 50,
            startDate: '2025-08-01T00:00:00Z',
            endDate: '2025-11-01T00:00:00Z',
            status: 'active',
            skills: ['Project Management', 'Agile'],
            hourlyRate: 85,
            estimatedHours: 240,
            actualHours: 85,
            notes: 'Project oversight and stakeholder management',
            createdAt: '2025-07-20T08:00:00Z',
            updatedAt: '2025-08-24T16:45:00Z'
          }
        ];

        // Mock conflicts
        const mockConflicts: ResourceConflict[] = [
          {
            id: 'conflict-1',
            type: 'overallocation',
            severity: 'medium',
            affectedUsers: ['user-1'],
            affectedProjects: ['project-1', 'project-2'],
            description: 'John Doe is allocated 120% across multiple projects',
            suggestedActions: [
              'Reduce allocation on Project 2',
              'Extend timeline for non-critical tasks',
              'Assign additional developer to Project 1'
            ]
          }
        ];

        setTeamMembers(mockTeamMembers);
        setResourceAllocations(mockAllocations);
        setConflicts(mockConflicts);

        // Update workload for team members
        const updatedMembers = mockTeamMembers.map(member => ({
          ...member,
          workload: mockAllocations.filter(alloc => alloc.userId === member.id)
        }));
        setTeamMembers(updatedMembers);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resource data');
      } finally {
        setIsLoading(false);
      }
    };

    loadResourceData();
  }, [workspaceId]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleAllocationUpdate = (data: { allocationId: string; updates: Partial<ResourceAllocation> }) => {
      setResourceAllocations(prev => prev.map(alloc =>
        alloc.id === data.allocationId
          ? { ...alloc, ...data.updates, updatedAt: new Date().toISOString() }
          : alloc
      ));
    };

    const handleAllocationAdded = (allocation: ResourceAllocation) => {
      setResourceAllocations(prev => [...prev, allocation]);
    };

    const handleAllocationRemoved = (data: { allocationId: string }) => {
      setResourceAllocations(prev => prev.filter(a => a.id !== data.allocationId));
    };

    const handleTeamMemberUpdate = (data: { memberId: string; updates: Partial<TeamMember> }) => {
      setTeamMembers(prev => prev.map(member =>
        member.id === data.memberId ? { ...member, ...data.updates } : member
      ));
    };

    const handleConflictDetected = (conflict: ResourceConflict) => {
      setConflicts(prev => [...prev, conflict]);
    };

    socket.on('resource:allocation-updated', handleAllocationUpdate);
    socket.on('resource:allocation-added', handleAllocationAdded);
    socket.on('resource:allocation-removed', handleAllocationRemoved);
    socket.on('resource:member-updated', handleTeamMemberUpdate);
    socket.on('resource:conflict-detected', handleConflictDetected);

    return () => {
      socket.off('resource:allocation-updated', handleAllocationUpdate);
      socket.off('resource:allocation-added', handleAllocationAdded);
      socket.off('resource:allocation-removed', handleAllocationRemoved);
      socket.off('resource:member-updated', handleTeamMemberUpdate);
      socket.off('resource:conflict-detected', handleConflictDetected);
    };
  }, [socket]);

  // Resource allocation operations
  const allocateResource = useCallback(async (allocation: Omit<ResourceAllocation, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!socket) throw new Error('Socket not connected');

    const newAllocation: ResourceAllocation = {
      ...allocation,
      id: `alloc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    socket.emit('resource:allocate', newAllocation);
    setResourceAllocations(prev => [...prev, newAllocation]);
  }, [socket]);

  const updateAllocation = useCallback(async (allocationId: string, updates: Partial<ResourceAllocation>) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('resource:update-allocation', { allocationId, updates });
    setResourceAllocations(prev => prev.map(alloc =>
      alloc.id === allocationId
        ? { ...alloc, ...updates, updatedAt: new Date().toISOString() }
        : alloc
    ));
  }, [socket]);

  const removeAllocation = useCallback(async (allocationId: string) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('resource:remove-allocation', { allocationId });
    setResourceAllocations(prev => prev.filter(a => a.id !== allocationId));
  }, [socket]);

  const bulkAllocate = useCallback(async (allocations: Omit<ResourceAllocation, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    if (!socket) throw new Error('Socket not connected');

    const newAllocations = allocations.map(alloc => ({
      ...alloc,
      id: `alloc-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    socket.emit('resource:bulk-allocate', newAllocations);
    setResourceAllocations(prev => [...prev, ...newAllocations]);
  }, [socket]);

  // Team member management
  const addTeamMember = useCallback(async (member: Omit<TeamMember, 'id' | 'workload' | 'availability' | 'performance'>) => {
    if (!socket) throw new Error('Socket not connected');

    const newMember: TeamMember = {
      ...member,
      id: `user-${Date.now()}`,
      workload: [],
      availability: {
        status: 'available',
        availableHours: member.capacity,
        overallocation: 0
      },
      performance: {
        completionRate: 0,
        qualityScore: 5,
        collaborationScore: 5
      }
    };

    socket.emit('resource:add-member', newMember);
    setTeamMembers(prev => [...prev, newMember]);
  }, [socket]);

  const updateTeamMember = useCallback(async (memberId: string, updates: Partial<TeamMember>) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('resource:update-member', { memberId, updates });
    setTeamMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, ...updates } : member
    ));
  }, [socket]);

  const removeTeamMember = useCallback(async (memberId: string) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('resource:remove-member', { memberId });
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    setResourceAllocations(prev => prev.filter(a => a.userId !== memberId));
  }, [socket]);

  const updateCapacity = useCallback(async (memberId: string, capacity: number) => {
    await updateTeamMember(memberId, { capacity });
  }, [updateTeamMember]);

  // Availability and workload calculations
  const getUserAvailability = useCallback((userId: string, startDate: string, endDate: string) => {
    const member = teamMembers.find(m => m.id === userId);
    if (!member) {
      return {
        totalCapacity: 0,
        allocatedHours: 0,
        availableHours: 0,
        utilizationRate: 0,
        overallocation: 0
      };
    }

    const userAllocations = resourceAllocations.filter(alloc => 
      alloc.userId === userId &&
      alloc.status === 'active' &&
      new Date(alloc.startDate) <= new Date(endDate) &&
      new Date(alloc.endDate) >= new Date(startDate)
    );

    const weeks = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const totalCapacity = member.capacity * weeks;
    const allocatedHours = userAllocations.reduce((sum, alloc) => sum + alloc.estimatedHours, 0);
    const utilizationRate = totalCapacity > 0 ? (allocatedHours / totalCapacity) * 100 : 0;

    return {
      totalCapacity,
      allocatedHours,
      availableHours: Math.max(0, totalCapacity - allocatedHours),
      utilizationRate,
      overallocation: Math.max(0, utilizationRate - 100)
    };
  }, [teamMembers, resourceAllocations]);

  const getProjectResources = useCallback((projectId: string) => {
    return resourceAllocations.filter(alloc => alloc.projectId === projectId);
  }, [resourceAllocations]);

  const getResourcesBySkill = useCallback((skill: string) => {
    return teamMembers.filter(member => 
      member.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
  }, [teamMembers]);

  // Conflict detection
  const detectConflicts = useCallback(async (): Promise<ResourceConflict[]> => {
    const detectedConflicts: ResourceConflict[] = [];

    // Check for overallocations
    teamMembers.forEach(member => {
      const availability = getUserAvailability(member.id, 
        new Date().toISOString(), 
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      );

      if (availability.overallocation > 0) {
        detectedConflicts.push({
          id: `conflict-${Date.now()}-${member.id}`,
          type: 'overallocation',
          severity: availability.overallocation > 50 ? 'critical' : 
                   availability.overallocation > 25 ? 'high' : 'medium',
          affectedUsers: [member.id],
          affectedProjects: resourceAllocations
            .filter(a => a.userId === member.id)
            .map(a => a.projectId),
          description: `${member.name} is overallocated by ${availability.overallocation.toFixed(1)}%`,
          suggestedActions: [
            'Redistribute workload to other team members',
            'Extend project timelines',
            'Hire additional resources'
          ]
        });
      }
    });

    setConflicts(detectedConflicts);
    return detectedConflicts;
  }, [teamMembers, getUserAvailability, resourceAllocations]);

  const resolveConflict = useCallback(async (conflictId: string, resolution: string) => {
    if (!socket) throw new Error('Socket not connected');

    socket.emit('resource:resolve-conflict', { conflictId, resolution });
    setConflicts(prev => prev.map(conflict =>
      conflict.id === conflictId
        ? { ...conflict, resolvedAt: new Date().toISOString() }
        : conflict
    ));
  }, [socket]);

  const getOverallocatedUsers = useCallback(() => {
    return teamMembers.filter(member => {
      const availability = getUserAvailability(member.id,
        new Date().toISOString(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      );
      return availability.overallocation > 0;
    });
  }, [teamMembers, getUserAvailability]);

  // Forecasting and planning
  const generateForecast = useCallback(async (period: string, startDate: string): Promise<ResourceForecast> => {
    // Mock implementation
    const endDate = new Date(new Date(startDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    return {
      period: period as any,
      startDate,
      endDate,
      totalCapacity: 1600, // 40 users * 40 hours
      allocatedHours: 1200,
      availableHours: 400,
      utilizationRate: 75,
      breakdown: {
        byDepartment: [
          { department: 'Engineering', capacity: 800, allocated: 650, utilization: 81.25 },
          { department: 'Design', capacity: 400, allocated: 300, utilization: 75 },
          { department: 'Management', capacity: 400, allocated: 250, utilization: 62.5 }
        ],
        bySkill: [
          { skill: 'React', demand: 200, supply: 180, gap: 20 },
          { skill: 'Node.js', demand: 150, supply: 120, gap: 30 }
        ],
        byProject: [
          { 
            projectId: 'project-1', 
            projectName: 'E-commerce Platform', 
            requiredHours: 800, 
            allocatedHours: 720, 
            status: 'understaffed' 
          }
        ]
      }
    };
  }, []);

  const optimizeAllocations = useCallback(async (projectId: string) => {
    // Mock optimization algorithm
    return {
      currentUtilization: 75,
      optimizedUtilization: 85,
      recommendations: [
        {
          type: 'reallocation' as const,
          description: 'Move Sarah Smith from Project 2 to Project 1',
          impact: 'Reduces Project 1 timeline by 2 weeks'
        },
        {
          type: 'timeline-adjustment' as const,
          description: 'Extend Project 2 deadline by 1 week',
          impact: 'Allows for better resource distribution'
        }
      ]
    };
  }, []);

  // Reporting and analytics
  const getUtilizationReport = useCallback(async (startDate: string, endDate: string) => {
    // Mock implementation
    return {
      averageUtilization: 78,
      departmentUtilization: [
        { department: 'Engineering', utilization: 82 },
        { department: 'Design', utilization: 75 },
        { department: 'Management', utilization: 68 }
      ],
      trends: [
        { week: '2025-08-01', utilization: 75 },
        { week: '2025-08-08', utilization: 78 },
        { week: '2025-08-15', utilization: 80 },
        { week: '2025-08-22', utilization: 82 }
      ]
    };
  }, []);

  const getSkillsMatrix = useCallback(() => {
    const skillsMap = new Map<string, any>();
    
    teamMembers.forEach(member => {
      member.skills.forEach(skill => {
        if (!skillsMap.has(skill)) {
          skillsMap.set(skill, {
            skill,
            users: [],
            demand: 0,
            supply: 0
          });
        }
        
        skillsMap.get(skill).users.push({
          userId: member.id,
          userName: member.name,
          proficiency: 'intermediate' // Mock proficiency
        });
      });
    });

    return Array.from(skillsMap.values());
  }, [teamMembers]);

  // Search and filtering
  const searchMembers = useCallback((query: string) => {
    return teamMembers.filter(member =>
      member.name.toLowerCase().includes(query.toLowerCase()) ||
      member.email.toLowerCase().includes(query.toLowerCase()) ||
      member.skills.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
    );
  }, [teamMembers]);

  const filterByAvailability = useCallback((minHours: number) => {
    return teamMembers.filter(member => member.availability.availableHours >= minHours);
  }, [teamMembers]);

  const filterBySkills = useCallback((requiredSkills: string[]) => {
    return teamMembers.filter(member =>
      requiredSkills.every(skill =>
        member.skills.some(memberSkill =>
          memberSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  }, [teamMembers]);

  return {
    teamMembers,
    resourceAllocations,
    conflicts,
    isLoading,
    error,
    allocateResource,
    updateAllocation,
    removeAllocation,
    bulkAllocate,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    updateCapacity,
    getUserAvailability,
    getProjectResources,
    getResourcesBySkill,
    detectConflicts,
    resolveConflict,
    getOverallocatedUsers,
    generateForecast,
    optimizeAllocations,
    getUtilizationReport,
    getSkillsMatrix,
    searchMembers,
    filterByAvailability,
    filterBySkills
  };
}
