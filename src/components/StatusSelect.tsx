"use client";
import { useEffect, useState } from "react";
import { api } from "../api";

interface StatusOption {
  value: string;
  label: string;
  description?: string;
}

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  projectId?: number | null;
  taskId?: number | null;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function StatusSelect({ 
  value, 
  onChange, 
  projectId = null, 
  taskId = null, 
  className = "",
  disabled = false,
  required = false 
}: StatusSelectProps) {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskType, setTaskType] = useState<'general' | 'project'>('general');

  useEffect(() => {
    async function fetchStatusOptions() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        
        if (taskId) {
          params.append('task_id', taskId.toString());
        } else if (projectId) {
          params.append('project_id', projectId.toString());
        }
        
        const response = await api.get(`/tasks/status-options?${params.toString()}`);
        const data = response as { statusOptions: StatusOption[]; taskType: 'general' | 'project' };
        
        setStatusOptions(data.statusOptions || []);
        setTaskType(data.taskType || 'general');
      } catch (error) {
        console.error('Failed to fetch status options:', error);
        // Fallback to basic options for general tasks
        const fallbackOptions: StatusOption[] = [
          { value: 'todo', label: 'To Do', description: 'Task is ready to be started' },
          { value: 'in_progress', label: 'In Progress', description: 'Task is currently being worked on' },
          { value: 'done', label: 'Done', description: 'Task is completed' }
        ];
        setStatusOptions(fallbackOptions);
        setTaskType('general');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatusOptions();
  }, [projectId, taskId]);

  const defaultClassName = "w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]";
  const finalClassName = className || defaultClassName;

  if (isLoading) {
    return (
      <select className={finalClassName} disabled title="Loading status options">
        <option>Loading...</option>
      </select>
    );
  }

  return (
    <div>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={finalClassName}
        disabled={disabled}
        required={required}
        title={`Available statuses for ${taskType} tasks`}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value} title={option.description}>
            {option.label}
          </option>
        ))}
      </select>
      {taskType === 'project' && (
        <p className="text-xs text-[#0CABA8] mt-1">
          Project tasks support additional workflow statuses
        </p>
      )}
      {taskType === 'general' && (
        <p className="text-xs text-[#0CABA8] mt-1">
          General tasks use basic workflow statuses
        </p>
      )}
    </div>
  );
}