'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCollaborativeTask, CollaborativeTask } from '@/hooks/collaboration/useCollaborativeTask';
import { GlobalPresenceUser } from '@/hooks/collaboration/useGlobalPresence';
import { GlobalPresenceIndicator, ItemPresenceIndicator, TypingIndicator } from './GlobalPresenceIndicator';

interface CollaborativeTaskEditorProps {
  taskId: string;
  currentUserId: string;
  currentUserName: string;
  users: GlobalPresenceUser[];
  className?: string;
}

export const CollaborativeTaskEditor: React.FC<CollaborativeTaskEditorProps> = ({
  taskId,
  currentUserId,
  currentUserName,
  users,
  className = ''
}) => {
  const {
    task,
    activity,
    loading,
    error,
    collaborators,
    updateTask,
    assignUser,
    completeTask,
    setEditingField
  } = useCollaborativeTask(taskId, currentUserId, currentUserName);

  const [localTitle, setLocalTitle] = useState('');
  const [localDescription, setLocalDescription] = useState('');
  const [localPriority, setLocalPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [localStatus, setLocalStatus] = useState('todo');
  const [localDueDate, setLocalDueDate] = useState('');

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when task changes
  useEffect(() => {
    if (task) {
      setLocalTitle(task.title || '');
      setLocalDescription(task.description || '');
      setLocalPriority(task.priority || 'medium');
      setLocalStatus(task.status || 'todo');
      setLocalDueDate(task.dueDate ? task.dueDate.toISOString().slice(0, 16) : '');
    }
  }, [task]);

  // Auto-resize description textarea
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    if (descriptionRef.current) {
      adjustTextareaHeight(descriptionRef.current);
    }
  }, [localDescription]);

  // Handle typing indicators
  const handleTyping = (field: string) => {
    setEditingField(field);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setEditingField(null);
    }, 2000);
  };

  // Field update handlers with debouncing
  const updateFieldDebounced = (field: string, value: any) => {
    const timeoutId = setTimeout(() => {
      updateTask(field as keyof CollaborativeTask, value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalTitle(value);
    handleTyping('title');
    updateFieldDebounced('title', value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalDescription(value);
    adjustTextareaHeight(e.target);
    handleTyping('description');
    updateFieldDebounced('description', value);
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    setLocalPriority(priority);
    updateTask('priority', priority);
  };

  const handleStatusChange = (status: string) => {
    setLocalStatus(status);
    updateTask('status', status);
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalDueDate(value);
    updateTask('dueDate', value ? new Date(value) : undefined);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600">Loading collaborative task...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="text-red-400">⚠️</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header with presence indicators */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Task Editor</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <ItemPresenceIndicator
              users={users}
              currentUserId={currentUserId}
              itemType="task"
              itemId={taskId}
            />
            <GlobalPresenceIndicator
              users={users}
              currentUserId={currentUserId}
              maxVisible={3}
            />
          </div>
        </div>
      </div>

      {/* Task Form */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            ref={titleRef}
            type="text"
            value={localTitle}
            onChange={handleTitleChange}
            placeholder="Enter task title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="flex gap-2">
        {(['todo', 'in_progress', 'review', 'done', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    localStatus === status
                      ? getStatusColor(status)
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
          {status === 'in_progress' ? 'In Progress' : status === 'todo' ? 'To do' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityChange(priority)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    localPriority === priority
                      ? getPriorityColor(priority)
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="datetime-local"
            value={localDueDate}
            onChange={handleDueDateChange}
            title="Due date and time for the task"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            ref={descriptionRef}
            value={localDescription}
            onChange={handleDescriptionChange}
            placeholder="Enter task description..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Collaborators */}
        {collaborators.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Active Collaborators</h3>
            <div className="flex flex-wrap gap-2">
              {collaborators.map((collaboratorName, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                    {collaboratorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-blue-800">{collaboratorName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
