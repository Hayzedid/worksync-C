"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api";
import { Plus, Trash2, MessageCircle, ChevronDown, Upload } from "lucide-react";
import { uploadFileToServer } from '../../../lib/upload';
import AttachmentsPanel from "../../../components/files/AttachmentsPanel";
import { useToast } from "../../../components/toast";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import ConfirmDialog from "../../../components/ConfirmDialog";
import StatusSelect from "../../../components/StatusSelect";
import { 
  ItemPresenceIndicator,
  UniversalComments,
  RealtimeReactions
} from "../../../components/collaboration";
import { useGlobalPresence } from "../../../hooks/collaboration/useGlobalPresence";

type Task = {
  id: number;
  title: string;
  status: string;
  projectId?: number;
  project?: { id: number; name: string; workspaceId?: number; workspace?: { id: number; name: string } };
  workspaceId?: number;
  workspace?: { id: number; name: string };
};

function TaskStatusDropdown({ task, onStatusChange }: { task: Task; onStatusChange: (taskId: number, newStatus: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string; color: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Load dynamic status options based on whether task is in a project
  useEffect(() => {
    async function fetchStatusOptions() {
      try {
        const params = new URLSearchParams();
        params.append('task_id', task.id.toString());
        
        const response = await api.get(`/tasks/status-options?${params.toString()}`);
        const data = response as { statusOptions: Array<{ value: string; label: string; description?: string }>; taskType: 'general' | 'project' };
        
        // Color mapping for status options
        const statusColors: Record<string, string> = {
          'todo': 'bg-gray-100 text-gray-800',
          'in_progress': 'bg-blue-100 text-blue-800',
          'review': 'bg-yellow-100 text-yellow-800',
          'done': 'bg-green-100 text-green-800',
          'cancelled': 'bg-red-100 text-red-800',
          'archived': 'bg-gray-300 text-gray-600'
        };
        
        // Convert to the format expected by this component
        const formattedOptions = data.statusOptions.map(option => ({
          value: option.value,
          label: option.label,
          color: statusColors[option.value] || 'bg-gray-100 text-gray-800'
        }));
        
        setStatusOptions(formattedOptions);
      } catch (error) {
        console.error('Failed to fetch status options:', error);
        // Fallback to basic options for general tasks
        setStatusOptions([
          { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
          { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
          { value: 'done', label: 'Done', color: 'bg-green-100 text-green-800' }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchStatusOptions();
  }, [task.id, task.projectId]);

  const currentStatus = statusOptions.find(s => s.value === task.status) || statusOptions[0];

  const handleStatusSelect = async (newStatus: string) => {
    setIsOpen(false);
    await onStatusChange(task.id, newStatus);
  };

  if (loading) {
    return (
      <span className="text-[#015958] font-medium">
        {task.title}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-[#015958] font-medium cursor-pointer hover:text-[#0FC2C0] flex items-center gap-1"
        title={`Click to change status from ${currentStatus?.label || task.status}`}
      >
        {task.title}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-[#0CABA8]/30 rounded-lg shadow-lg z-50 min-w-[150px]">
          <div className="py-1">
            {statusOptions.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusSelect(status.value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                  task.status === status.value ? 'bg-blue-50' : ''
                }`}
              >
                <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                  {status.label}
                </span>
                {task.status === status.value && <span className="text-blue-600">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function resolveField(obj: unknown, ...keys: string[]) {
  const o = obj as Record<string, unknown> | null;
  if (!o) return undefined;
  for (const k of keys) {
    if (k in o) return o[k];
  }
  return undefined;
}

export default function TasksPage() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  const auth = useAuth();
  const searchParams = useSearchParams();
  const wsParam = searchParams.get("ws");
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [expandedAttachments, setExpandedAttachments] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetTask, setTargetTask] = useState<{ id: number; title?: string } | null>(null);
  
  // Initialize presence tracking for tasks page
  const { presence, setActivityStatus } = useGlobalPresence(
    auth?.user?.id?.toString() || '',
    auth?.user?.name || 'Guest',
    'tasks'
  );
  
  const wsIdFromUrl = (() => {
    if (!wsParam) return null;
    const n = parseInt(wsParam, 10);
    return Number.isFinite(n) ? n : null;
  })();
  
  const [currentWsId, setCurrentWsId] = useState<number | null>(() => {
    // Only use stored workspace ID if there's a ws parameter in URL
    if (typeof window !== "undefined" && wsParam) {
      const stored = sessionStorage.getItem("current_workspace_id");
      if (stored) {
        const n = parseInt(stored, 10);
        if (Number.isFinite(n)) return n;
      }
    }
    return null;
  });
  
  useEffect(() => {
    if (wsIdFromUrl != null) {
      setCurrentWsId(wsIdFromUrl);
      if (typeof window !== "undefined") sessionStorage.setItem("current_workspace_id", String(wsIdFromUrl));
    } else {
      // Clear current workspace when navigating to general tasks page
      setCurrentWsId(null);
    }
  }, [wsIdFromUrl]);
  
  // Only use workspace filter if explicitly specified in URL
  const effectiveWsId = wsIdFromUrl;
  
  const { data, isLoading, isError, error } = useQuery<unknown>({
    queryKey: ["tasks", { workspace_id: effectiveWsId }],
    queryFn: () => api.get("/tasks", { params: effectiveWsId != null ? { workspace_id: effectiveWsId } : undefined }),
    staleTime: 0,
  });
  
  // Also fetch projects to resolve names when tasks only provide projectId
  const { data: workspaceData } = useQuery<unknown>({
    queryKey: ['workspace', effectiveWsId],
    queryFn: () => effectiveWsId ? api.get(`/workspaces/${effectiveWsId}`) : null,
    enabled: effectiveWsId != null
  });

  const { data: projectsData } = useQuery<unknown>({
    queryKey: ["projects", { workspace_id: effectiveWsId }],
    queryFn: () => api.get("/projects", { params: effectiveWsId != null ? { workspace_id: effectiveWsId } : undefined }),
  });
  
  const tasks: Task[] = Array.isArray(data)
    ? (data as Task[])
    : (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)['tasks']))
    ? ((data as Record<string, unknown>)['tasks'] as Task[])
    : [];

  // Helpers to robustly detect project association regardless of API shape
  const toPid = (t: unknown): number | null => {
    const tt = t as Record<string, unknown> | null;
    if (!tt) return null;
    const project = tt.project as Record<string, unknown> | undefined;
    const raw = project?.id ?? tt.projectId ?? tt.project_id ?? tt.projectID;
    const n = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return typeof n === 'number' && Number.isFinite(n) ? (n as number) : null;
  };
  
  // Build a lookup for project names from projectsData
  const projectList: unknown[] = Array.isArray(projectsData)
    ? (projectsData as unknown[])
    : (projectsData && typeof projectsData === 'object' && Array.isArray((projectsData as Record<string, unknown>)['projects']))
    ? ((projectsData as Record<string, unknown>)['projects'] as unknown[])
    : [];
    
  const projectNameById: Record<string, string> = projectList.reduce<Record<string, string>>((acc, p: unknown) => {
    const pp = p as Record<string, unknown> | null;
    const id = pp?.['id'] ?? pp?.['projectId'] ?? pp?.['project_id'];
    const name = pp?.['name'] ?? pp?.['project_name'];
    if (id != null && name) acc[String(id)] = String(name);
    return acc;
  }, {});

  const toPname = (t: unknown, pid: number | null): string => {
    const tt = t as Record<string, unknown> | null;
    if (tt?.project && typeof (tt.project as Record<string, unknown>)?.name === 'string') return (tt.project as Record<string, unknown>).name as string;
    if (tt && typeof tt.project_name === 'string') return tt.project_name;
    if (pid != null) {
      const fromMap = projectNameById[String(pid)];
      if (fromMap) return fromMap;
      return "Untitled Project";
    }
    return "General";
  };

  // Helpers for workspace association (direct or via project)
  const toWsId = (t: unknown): number | null => {
    const tt = t as Record<string, unknown> | null;
    if (!tt) return null;
    const project = tt.project as Record<string, unknown> | undefined;
    const workspace = (project?.workspace as Record<string, unknown> | undefined) ?? (tt.workspace as Record<string, unknown> | undefined);
    const raw = resolveField(workspace, 'id') ?? resolveField(project, 'workspaceId') ?? resolveField(project, 'workspace_id') ?? resolveField(tt.workspace, 'id') ?? resolveField(tt, 'workspaceId') ?? resolveField(tt, 'workspace_id');
    const n = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return typeof n === 'number' && Number.isFinite(n) ? (n as number) : null;
  };
  
  const toWsName = (t: unknown): string | null => {
    const tt = t as Record<string, unknown> | null;
    const project = tt?.project as Record<string, unknown> | undefined;
    const workspace = project?.workspace as Record<string, unknown> | undefined ?? tt?.workspace as Record<string, unknown> | undefined;
    if (workspace && typeof workspace.name === 'string') return workspace.name;
    return null;
  };

  // Separate general tasks from project tasks
  const generalTasks = tasks.filter(t => toPid(t) == null);
  const projectTasks = tasks.filter(t => toPid(t) != null);
  
  // Group project tasks by project
  const groupedByProject = projectTasks.reduce<Record<string, { projectName: string; projectId: number; items: Task[] }>>((acc, t) => {
    const pid = toPid(t)!;
    const pname = toPname(t, pid);
    const key = String(pid);
    if (!acc[key]) acc[key] = { projectName: pname, projectId: pid, items: [] };
    acc[key].items.push(t);
    return acc;
  }, {});

  async function handleDeleteTask(id: number) {
    try {
      await api.delete(`/tasks/${id}`);
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      await qc.refetchQueries({ queryKey: ["tasks"] });
      addToast({ title: "Task deleted", variant: "success" });
    } catch (err: unknown) {
      const maybe = (err as Record<string, unknown>)?.message;
      const msg = typeof maybe === 'string' ? maybe : "Failed to delete task";
      addToast({ title: "Failed to delete task", description: msg, variant: "error" });
    }
  }

  function openDeleteConfirm(id: number, title?: string) {
    setTargetTask({ id, title });
    setConfirmOpen(true);
  }

  async function handleStatusChange(taskId: number, newStatus: string) {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      await qc.refetchQueries({ queryKey: ["tasks"] });
      addToast({ title: "Task status updated", variant: "success" });
    } catch (err: unknown) {
      const maybe = (err as Record<string, unknown>)?.message;
      const msg = typeof maybe === 'string' ? maybe : "Failed to update task status";
      addToast({ title: "Failed to update task", description: msg, variant: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0FC2C0]">Tasks</h1>
            {effectiveWsId != null && (
              <div className="text-sm text-[#0CABA8] mt-1">
                {((workspaceData as Record<string, unknown>)?.workspace as { name?: string })?.name || `Workspace ${effectiveWsId}`}
              </div>
            )}
          </div>
          <Link href={effectiveWsId != null ? `/tasks/new?ws=${effectiveWsId}` : "/tasks/new"} className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold">
            <Plus className="h-4 w-4" /> New Task
          </Link>
        </div>
        
        {isLoading && <div className="text-[#015958]">Loading...</div>}
        {isError && (
          <div className="text-red-500">
            Failed to load tasks{(error && typeof (error as unknown as Record<string, unknown>)['message'] === 'string') ? `: ${String((error as unknown as Record<string, unknown>)['message'])}` : ''}
          </div>
        )}

        {/* General tasks first */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#0FC2C0] mb-3">General Tasks</h2>
          {generalTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {generalTasks.map(t => (
                <div key={t.id} className="border border-[#0CABA8]/20 rounded-md p-4 relative bg-white">
                  <RealtimeReactions
                    itemType="task"
                    itemId={t.id.toString()}
                    currentUserId={auth?.user?.id?.toString() || ''}
                    currentUserName={auth?.user?.name || 'Guest'}
                    className="absolute inset-0 rounded-md"
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <TaskStatusDropdown 
                          task={t} 
                          onStatusChange={handleStatusChange}
                        />
                        <div className="text-xs text-[#0CABA8] mt-1">{t.status}</div>
                        
                        {/* Workspace badge if available */}
                        {toWsName(t) && (
                          <div className="mt-2">
                            <span className="text-xs bg-[#F6FFFE] border border-[#0CABA8]/40 text-[#015958] px-2 py-1 rounded">
                              Workspace: {toWsName(t)}
                            </span>
                          </div>
                        )}
                        
                        {/* Presence Indicator */}
                        <div className="mt-2">
                          <ItemPresenceIndicator
                            users={presence.users}
                            currentUserId={auth?.user?.id?.toString() || ''}
                            itemType="task"
                            itemId={t.id.toString()}
                            className="mb-2"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedComments);
                            if (newExpanded.has(t.id)) {
                              newExpanded.delete(t.id);
                            } else {
                              newExpanded.add(t.id);
                            }
                            setExpandedComments(newExpanded);
                          }}
                          className="text-[#0FC2C0] hover:text-[#0CABA8]"
                          title="Toggle comments"
                        >
                          <MessageCircle className="icon-comment" />
                        </button>
                        <>
                          <label htmlFor={`task-file-input-${t.id}`} className="sr-only">Attach file to task {t.id}</label>
                          <input id={`task-file-input-${t.id}`} type="file" className="hidden" onChange={async e => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            try {
                              const data = await uploadFileToServer(`/api/tasks/${t.id}/upload`, f);
                              addToast({ title: 'File uploaded', variant: 'success' });
                              // refresh attachments if attachments panel is open
                              if (expandedAttachments.has(t.id)) {
                                qc.invalidateQueries({ queryKey: ["attachments", { type: 'task', id: t.id }] });
                                qc.refetchQueries({ queryKey: ["attachments", { type: 'task', id: t.id }] });
                              }
                            } catch (err) {
                              addToast({ title: 'Upload failed', description: (err as any)?.message || String(err), variant: 'error' });
                            }
                            // reset input
                            if (e.target) e.target.value = '';
                          }} />
                          <button
                            onClick={() => document.getElementById(`task-file-input-${t.id}`)?.click()}
                            className="text-[#0FC2C0] hover:text-[#0CABA8]"
                            title="Attach file"
                            aria-label="Attach file"
                            type="button"
                          >
                            <Upload className="icon-upload" />
                          </button>
                        </>
                        <>
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedAttachments);
                              if (newExpanded.has(t.id)) newExpanded.delete(t.id);
                              else newExpanded.add(t.id);
                              setExpandedAttachments(newExpanded);
                            }}
                            className="text-[#0FC2C0] hover:text-[#0CABA8]"
                            title="Toggle attachments"
                            aria-label="Toggle attachments"
                          >
                            <svg className="w-4 h-4 text-[#0FC2C0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95L10.12 18.12a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l7.07-7.07" />
                            </svg>
                          </button>
                        </>
                        <button
                          onClick={() => openDeleteConfirm(t.id, t.title)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-md transition-all duration-200"
                          type="button"
                          aria-label="Delete task"
                          title="Delete task"
                        >
                          <Trash2 className="icon-delete" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Expanded Comments */}
                    {expandedComments.has(t.id) && auth?.user && (
                      <div className="mt-4 border-t border-[#0CABA8]/20 pt-4">
                        <UniversalComments
                          itemType="task"
                          itemId={t.id.toString()}
                          currentUserId={auth.user.id.toString()}
                          currentUserName={auth.user.name || `${auth.user.firstName} ${auth.user.lastName}` || 'User'}
                          users={presence.users}
                          className="max-h-60 overflow-y-auto"
                        />
                      </div>
                    )}

                    {/* Expanded Attachments */}
                    {expandedAttachments.has(t.id) && auth?.user && (
                      <div className="mt-4 border-t border-[#0CABA8]/20 pt-4">
                        <AttachmentsPanel itemType="task" itemId={String(t.id)} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isLoading && !isError && (
              <div className="text-[#0CABA8]">No general tasks.</div>
            )
          )}
        </div>

        {/* Tasks in workspace projects */}
        <div className="space-y-6">
          {Object.values(groupedByProject).map(group => (
            <div key={group.projectId} className="bg-white rounded-xl shadow border border-[#0CABA8]/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <Link href={effectiveWsId != null ? `/projects/${group.projectId}?ws=${effectiveWsId}` : `/projects/${group.projectId}`} className="text-[#0FC2C0] font-semibold hover:underline">
                  Tasks in project: {group.projectName}
                </Link>
                <div className="flex items-center gap-2">
                  {/* Workspace badge from first task if available */}
                  {(() => {
                    const sample = group.items[0];
                    const wsName = toWsName(sample);
                    return wsName ? (
                      <span className="text-xs bg-[#F6FFFE] border border-[#0CABA8]/40 text-[#015958] px-2 py-1 rounded">
                        Workspace: {wsName}
                      </span>
                    ) : null;
                  })()}
                  <Link
                    href={effectiveWsId != null ? `/tasks/new?ws=${effectiveWsId}&project=${group.projectId}` : `/tasks/new?project=${group.projectId}`}
                    className="inline-flex items-center justify-center h-7 w-7 rounded bg-[#0FC2C0] text-white hover:bg-[#0CABA8]"
                    title="Add task to this project"
                    aria-label="Add task to this project"
                  >
                    <Plus className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {group.items.map(t => (
                  <div key={t.id} className="border border-[#0CABA8]/20 rounded-md p-4 relative">
                    <RealtimeReactions
                      itemType="task"
                      itemId={t.id.toString()}
                      currentUserId={auth?.user?.id?.toString() || ''}
                      currentUserName={auth?.user?.name || 'Guest'}
                      className="absolute inset-0 rounded-md"
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <TaskStatusDropdown 
                            task={t} 
                            onStatusChange={handleStatusChange}
                          />
                          <div className="text-xs text-[#0CABA8] mt-1">{t.status}</div>
                          
                          {/* Presence Indicator */}
                          <div className="mt-2">
                            <ItemPresenceIndicator
                              users={presence.users}
                              currentUserId={auth?.user?.id?.toString() || ''}
                              itemType="task"
                              itemId={t.id.toString()}
                              className="mb-2"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedComments);
                              if (newExpanded.has(t.id)) {
                                newExpanded.delete(t.id);
                              } else {
                                newExpanded.add(t.id);
                              }
                              setExpandedComments(newExpanded);
                            }}
                            className="text-[#0FC2C0] hover:text-[#0CABA8]"
                            title="Toggle comments"
                          >
                            <MessageCircle className="icon-comment" />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(t.id, t.title)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-md transition-all duration-200"
                            type="button"
                            aria-label="Delete task"
                            title="Delete task"
                          >
                            <Trash2 className="icon-delete" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Expanded Comments */}
                      {expandedComments.has(t.id) && auth?.user && (
                        <div className="mt-4 border-t border-[#0CABA8]/20 pt-4">
                          <UniversalComments
                            itemType="task"
                            itemId={t.id.toString()}
                            currentUserId={auth.user.id.toString()}
                            currentUserName={auth.user.name || `${auth.user.firstName} ${auth.user.lastName}` || 'User'}
                            users={presence.users}
                            className="max-h-60 overflow-y-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!isLoading && !isError && Object.keys(groupedByProject).length === 0 && (
            <div className="text-[#0CABA8]">No project tasks.</div>
          )}
        </div>
      </div>
      
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete task${targetTask?.title ? ` '${targetTask.title}'` : ''}`}
        description="This action will permanently remove the task. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          setConfirmOpen(false);
          if (targetTask?.id) await handleDeleteTask(targetTask.id);
          setTargetTask(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setTargetTask(null);
        }}
      />
    </div>
  );
}