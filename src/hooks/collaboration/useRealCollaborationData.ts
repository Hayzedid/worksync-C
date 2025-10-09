import { useState, useEffect } from 'react';
import { api } from '../../api';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee_id?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CollaborationItem {
  id: string;
  title: string;
  type: 'task' | 'project';
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function useRealCollaborationData() {
  const [items, setItems] = useState<CollaborationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tasks and projects in parallel
      const [tasksResponse, projectsResponse] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);

      const tasks: Task[] = Array.isArray(tasksResponse) ? tasksResponse : [];
      const projects: Project[] = Array.isArray(projectsResponse) ? projectsResponse : [];

      // Transform and combine data
      const collaborationItems: CollaborationItem[] = [
        ...tasks.map(task => ({
          id: task.id,
          title: task.title,
          type: 'task' as const,
          status: task.status,
          description: task.description,
          created_at: task.created_at,
          updated_at: task.updated_at
        })),
        ...projects.map(project => ({
          id: project.id,
          title: project.name,
          type: 'project' as const,
          status: project.status,
          description: project.description,
          created_at: project.created_at,
          updated_at: project.updated_at
        }))
      ];

      // Sort by most recently updated
      collaborationItems.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setItems(collaborationItems);
    } catch (err: any) {
      console.error('Error fetching collaboration data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  const getItemsByType = (type: 'task' | 'project') => {
    return items.filter(item => item.type === type);
  };

  const getRecentItems = (limit: number = 5) => {
    return items.slice(0, limit);
  };

  return {
    items,
    loading,
    error,
    refreshData,
    getItemsByType,
    getRecentItems,
    tasks: getItemsByType('task'),
    projects: getItemsByType('project')
  };
}
