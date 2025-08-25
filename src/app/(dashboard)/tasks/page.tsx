"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../../components/toast";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Task = {
  id: number;
  title: string;
  status: string;
  projectId?: number;
  project?: { id: number; name: string; workspaceId?: number; workspace?: { id: number; name: string } };
  workspaceId?: number;
  workspace?: { id: number; name: string };
};

export default function TasksPage() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const wsParam = searchParams.get("ws");
  const wsIdFromUrl = (() => {
    if (!wsParam) return null;
    const n = parseInt(wsParam, 10);
    return Number.isFinite(n) ? n : null;
  })();
  const [currentWsId, setCurrentWsId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
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
    }
  }, [wsIdFromUrl]);
  const effectiveWsId = wsIdFromUrl ?? currentWsId;
  const { data, isLoading, isError, error } = useQuery<any>({
    queryKey: ["tasks"],
    queryFn: () => api.get("/tasks"),
  });
  // Also fetch projects to resolve names when tasks only provide projectId
  const { data: projectsData } = useQuery<any>({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects"),
  });
  const tasks: Task[] = Array.isArray(data)
    ? data
    : data?.tasks && Array.isArray(data.tasks)
    ? data.tasks
    : [];

  // Helpers to robustly detect project association regardless of API shape
  const toPid = (t: any): number | null => {
    const raw = t?.project?.id ?? t?.projectId ?? t?.project_id ?? t?.projectID;
    const n = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return Number.isFinite(n) ? (n as number) : null;
  };
  // Build a lookup for project names from projectsData
  const projectList: any[] = Array.isArray(projectsData)
    ? projectsData
    : projectsData?.projects && Array.isArray(projectsData.projects)
    ? projectsData.projects
    : [];
  const projectNameById: Record<string, string> = projectList.reduce((acc, p: any) => {
    const id = p?.id ?? p?.projectId ?? p?.project_id;
    const name = p?.name ?? p?.project_name;
    if (id != null && name) acc[String(id)] = String(name);
    return acc;
  }, {} as Record<string, string>);

  const toPname = (t: any, pid: number | null): string => {
    if (t?.project?.name) return t.project.name;
    if (t?.project_name) return t.project_name;
    if (pid != null) {
      const fromMap = projectNameById[String(pid)];
      if (fromMap) return fromMap;
      return `Project #${pid}`;
    }
    return "General";
  };

  // Helpers for workspace association (direct or via project)
  const toWsId = (t: any): number | null => {
    const raw =
      t?.project?.workspace?.id ??
      t?.project?.workspaceId ??
      t?.project?.workspace_id ??
      t?.workspace?.id ??
      t?.workspaceId ??
      t?.workspace_id;
    const n = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return Number.isFinite(n) ? (n as number) : null;
  };
  const toWsName = (t: any): string | null => {
    return (
      t?.project?.workspace?.name ||
      t?.workspace?.name ||
      null
    );
  };

  const generalTasks = tasks.filter(t => toPid(t) == null);
  const projectTasks = tasks.filter(t => toPid(t) != null);
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
    } catch (e) {
      // optionally surface error
      addToast({ title: "Failed to delete task", variant: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0FC2C0]">Tasks</h1>
          <Link href={effectiveWsId != null ? `/tasks/new?ws=${effectiveWsId}` : "/tasks/new"} className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold"><Plus className="h-4 w-4" /> New Task</Link>
        </div>
        {isLoading && <div className="text-[#015958]">Loading...</div>}
        {isError && (
          <div className="text-red-500">
            Failed to load tasks{(error as any)?.message ? `: ${(error as any).message}` : ''}
          </div>
        )}
        {/* General tasks grouped (by workspace) */}
        {(() => {
          const grouped = generalTasks.reduce<Record<string, { wsName: string | null; wsId: number | null; items: Task[] }>>((acc, t) => {
            const wsName = toWsName(t);
            const wsId = toWsId(t);
            const key = wsName ? `name:${wsName}` : wsId != null ? `id:${wsId}` : 'none';
            if (!acc[key]) acc[key] = { wsName: wsName ?? null, wsId: wsId ?? null, items: [] };
            acc[key].items.push(t);
            return acc;
          }, {});
          const groups = Object.values(grouped);
          return groups.length ? (
            <div className="space-y-6 mb-8">
              {groups.map((group, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow border border-[#0CABA8]/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[#0FC2C0] font-semibold">General</div>
                    {(group.wsName || group.wsId != null) && (
                      <span className="text-xs bg-[#F6FFFE] border border-[#0CABA8]/40 text-[#015958] px-2 py-1 rounded">
                        Workspace: {group.wsName ?? `#${group.wsId}`}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.items.map(t => (
                      <div key={t.id} className="border border-[#0CABA8]/20 rounded-md p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[#015958] font-medium">{t.title}</div>
                            <div className="text-xs text-[#0CABA8] mt-1">{t.status}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="text-red-600 hover:text-red-700"
                            type="button"
                            aria-label="Delete task"
                            title="Delete task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isLoading && !isError ? (
              <div className="text-[#0CABA8] mb-8">No general tasks.</div>
            ) : null
          );
        })()}

        {/* Tasks under projects */}
        <div className="space-y-6">
          {Object.values(groupedByProject).map(group => (
            <div key={group.projectId} className="bg-white rounded-xl shadow border border-[#0CABA8]/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <Link href={effectiveWsId != null ? `/projects/${group.projectId}?ws=${effectiveWsId}` : `/projects/${group.projectId}`} className="text-[#0FC2C0] font-semibold hover:underline">
                  {group.projectName}
                </Link>
                <div className="flex items-center gap-2">
                  {/* Workspace badge from first task if available */}
                  {(() => {
                    const sample = group.items[0];
                    const wsName = toWsName(sample);
                    const wsId = toWsId(sample);
                    return wsName || wsId != null ? (
                      <span className="text-xs bg-[#F6FFFE] border border-[#0CABA8]/40 text-[#015958] px-2 py-1 rounded">
                        Workspace: {wsName ?? `#${wsId}`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map(t => (
                  <div key={t.id} className="border border-[#0CABA8]/20 rounded-md p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[#015958] font-medium">{t.title}</div>
                        <div className="text-xs text-[#0CABA8] mt-1">{t.status}</div>
                        {(toWsName(t) || toWsId(t) != null) && (
                          <div className="mt-2">
                            <span className="inline-block text-[10px] bg-[#F6FFFE] border border-[#0CABA8]/40 text-[#015958] px-2 py-0.5 rounded">
                              Workspace: {toWsName(t) ?? `#${toWsId(t)}`}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="text-red-600 hover:text-red-700"
                        type="button"
                        aria-label="Delete task"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
    </div>
  );
}