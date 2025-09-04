import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../../components/SocketProvider';
import Y, { Y as Yns } from '../../lib/singleYjs';
import { WebsocketProvider } from 'y-websocket';

export interface CollaborativeTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string[];
  dueDate?: Date;
  tags: string[];
  projectId?: string;
  workspaceId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  action: 'created' | 'updated' | 'assigned' | 'completed' | 'commented' | 'status_changed';
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
  description: string;
}

export function useCollaborativeTask(
  taskId: string,
  userId: string,
  userName: string
) {
  const socket = useSocket();
  const [task, setTask] = useState<CollaborativeTask | null>(null);
  const [activity, setActivity] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  
  // Yjs document for real-time collaboration
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const awarenessRef = useRef<any>(null);

  // Initialize Yjs collaboration
  useEffect(() => {
    if (!taskId) return;

    const ydoc = new Y.Doc();
    const wsProvider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:4100',
      `task-${taskId}`,
      ydoc
    );

    const awareness = wsProvider.awareness;
    
    // Set user info for awareness
    awareness.setLocalStateField('user', {
      id: userId,
      name: userName,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    });

    ydocRef.current = ydoc;
    providerRef.current = wsProvider;
    awarenessRef.current = awareness;

    // Listen for awareness changes (who's editing)
    const handleAwarenessChange = () => {
      const states = Array.from(awareness.getStates().values());
      const activeUsers = states
        .map((state: any) => state.user?.name)
        .filter((name: string) => name && name !== userName);
      setCollaborators(activeUsers);
    };

    awareness.on('change', handleAwarenessChange);

    // Initialize shared task data
    const taskMap = ydoc.getMap('task');
    const activityArray = ydoc.getArray('activity');

    // Listen for task changes
    const handleTaskChange = () => {
      const taskData = taskMap.toJSON() as Partial<CollaborativeTask>;
      if (taskData.id) {
        setTask({
          ...taskData,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
          createdAt: new Date(taskData.createdAt || Date.now()),
          updatedAt: new Date(taskData.updatedAt || Date.now()),
          completedAt: taskData.completedAt ? new Date(taskData.completedAt) : undefined,
        } as CollaborativeTask);
      }
    };

    const handleActivityChange = () => {
      const activities = activityArray.toArray().map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      })) as TaskActivity[];
      setActivity(activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    };

    taskMap.observe(handleTaskChange);
    activityArray.observe(handleActivityChange);

    return () => {
      awareness.off('change', handleAwarenessChange);
      taskMap.unobserve(handleTaskChange);
      activityArray.unobserve(handleActivityChange);
      wsProvider.destroy();
    };
  }, [taskId, userId, userName]);

  // Load initial task data
  useEffect(() => {
    if (!socket || !taskId) return;

    setLoading(true);
    socket.emit('task:load', { taskId });

    const handleTaskLoaded = (taskData: CollaborativeTask) => {
      if (!ydocRef.current) return;
      
      const taskMap = ydocRef.current.getMap('task');
      
      // Update Yjs document with task data
      Object.entries(taskData).forEach(([key, value]) => {
        taskMap.set(key, value);
      });
      
      setLoading(false);
      setError(null);
    };

    const handleTaskError = (errorMsg: string) => {
      setError(errorMsg);
      setLoading(false);
    };

    const handleActivityLoaded = (activities: TaskActivity[]) => {
      if (!ydocRef.current) return;
      
      const activityArray = ydocRef.current.getArray('activity');
      activityArray.delete(0, activityArray.length); // Clear existing
      activities.forEach(activity => activityArray.push([activity]));
    };

    socket.on('task:loaded', handleTaskLoaded);
    socket.on('task:error', handleTaskError);
    socket.on('task:activity-loaded', handleActivityLoaded);

    return () => {
      socket.off('task:loaded', handleTaskLoaded);
      socket.off('task:error', handleTaskError);
      socket.off('task:activity-loaded', handleActivityLoaded);
    };
  }, [socket, taskId]);

  // Update task field
  const updateTask = useCallback((field: keyof CollaborativeTask, value: any) => {
    if (!ydocRef.current || !socket || !task) return;

    const taskMap = ydocRef.current.getMap('task');
    const oldValue = taskMap.get(field);
    
    // Update Yjs document (will sync to other users)
    taskMap.set(field, value);
    taskMap.set('updatedAt', new Date().toISOString());

    // Send activity to backend
    const activityData: Omit<TaskActivity, 'id' | 'timestamp'> = {
      taskId: task.id,
      userId,
      userName,
      action: 'updated',
      field: field as string,
      oldValue: oldValue ? String(oldValue) : undefined,
      newValue: String(value),
      description: `${userName} updated ${field} from "${oldValue}" to "${value}"`,
    };

    socket.emit('task:activity', activityData);

    // Also emit task update for backend persistence
    socket.emit('task:update', {
      taskId: task.id,
      field,
      value,
      userId,
    });
  }, [socket, task, userId, userName]);

  // Assign user to task
  const assignUser = useCallback((userIdToAssign: string, userNameToAssign: string) => {
    if (!task) return;

    const currentAssigned = task.assignedTo || [];
    const newAssigned = currentAssigned.includes(userIdToAssign)
      ? currentAssigned.filter(id => id !== userIdToAssign)
      : [...currentAssigned, userIdToAssign];

    updateTask('assignedTo', newAssigned);

    const activityData: Omit<TaskActivity, 'id' | 'timestamp'> = {
      taskId: task.id,
      userId,
      userName,
      action: 'assigned',
      description: newAssigned.includes(userIdToAssign)
        ? `${userName} assigned ${userNameToAssign} to this task`
        : `${userName} unassigned ${userNameToAssign} from this task`,
    };

    if (socket) {
      socket.emit('task:activity', activityData);
    }
  }, [task, updateTask, userId, userName, socket]);

  // Complete task
  const completeTask = useCallback(() => {
    if (!task) return;

    const isCompleting = task.status !== 'completed';
    updateTask('status', isCompleting ? 'completed' : 'in-progress');
    
    if (isCompleting) {
      updateTask('completedAt', new Date().toISOString());
    } else {
      updateTask('completedAt', null);
    }

    const activityData: Omit<TaskActivity, 'id' | 'timestamp'> = {
      taskId: task.id,
      userId,
      userName,
      action: 'completed',
      description: isCompleting
        ? `${userName} completed this task`
        : `${userName} reopened this task`,
    };

    if (socket) {
      socket.emit('task:activity', activityData);
    }
  }, [task, updateTask, userId, userName, socket]);

  // Set editing field (for presence indicators)
  const setEditingField = useCallback((field: string | null) => {
    if (!awarenessRef.current) return;

    awarenessRef.current.setLocalStateField('editing', {
      field,
      timestamp: Date.now(),
    });
  }, []);

  return {
    task,
    activity,
    loading,
    error,
    collaborators,
    updateTask,
    assignUser,
    completeTask,
    setEditingField,
  };
}
