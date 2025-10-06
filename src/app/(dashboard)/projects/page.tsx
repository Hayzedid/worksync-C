"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api";
import { normalizeStatus, statusToRank } from '../../../lib/status';
import { FolderPlus, Folder, Trash2 } from "lucide-react";
import { useToast } from "../../../components/toast";
import React, { useEffect, useState } from "react";
import ConfirmDialog from "../../../components/ConfirmDialog";
import { useSearchParams } from "next/navigation";

export default function ProjectsPage() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  const searchParams = useSearchParams();

  // Determine current workspace context from URL or sessionStorage
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
    } else {
      // Clear current workspace when navigating to general projects page
      setCurrentWsId(null);
    }
  }, [wsIdFromUrl]);
  
  // Only use workspace filter if explicitly specified in URL
  const effectiveWsId = wsIdFromUrl;

  // Fetch projects (all projects when no workspace specified, workspace projects when specified)
  const { data, isLoading, isError } = useQuery<unknown>({
    queryKey: ["projects", { workspace_id: effectiveWsId }],
    queryFn: () => api.get("/projects", { params: effectiveWsId != null ? { workspace_id: effectiveWsId } : undefined }),
  });
  const projects: unknown[] = Array.isArray(data)
    ? (data as unknown[])
    : (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)['projects']))
    ? ((data as Record<string, unknown>)['projects'] as unknown[])
    : [];

  // Helpers to read workspace info from various shapes
  const toWsId = (p: unknown): number | null => {
    const pp = p as Record<string, unknown> | null;
    if (!pp) return null;
    const ws = pp.workspace as Record<string, unknown> | undefined;
    const raw = ws?.id ?? pp.workspaceId ?? pp.workspace_id ?? pp.ws_id;
    const num = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return typeof num === 'number' && Number.isFinite(num) ? (num as number) : null;
  };
  const toWsName = (p: unknown): string | null => {
    const pp = p as Record<string, unknown> | null;
    if (!pp) return null;
    const ws = pp.workspace as Record<string, unknown> | undefined;
    if (ws && typeof ws.name === 'string') return ws.name;
    if (typeof pp.workspace_name === 'string') return pp.workspace_name;
    return null;
  };

  // Grouping and sorting
  // Status precedence: active -> pending -> completed -> archived
  const statusRank: Record<string, number> = {
    active: 0,
    pending: 1,
    completed: 2,
    archived: 3,
  };

  function rankStatus(p: unknown) {
    const pp = p as Record<string, unknown> | null;
    if (!pp) return statusToRank('active');
    const s = normalizeStatus(pp.status ?? pp.project_status ?? pp.status_code ?? pp['state']);
    return statusToRank(s);
  }

  function recencyValue(p: unknown) {
    const pp = p as Record<string, unknown> | null;
    if (!pp) return 0;
    const d = (pp.updatedAt ?? pp.updated_at ?? pp.createdAt ?? pp.created_at) as string | undefined;
    const t = d ? Date.parse(String(d)) : 0;
    return Number.isFinite(t) ? t : 0;
  }

  function sortByStatusThenRecency(arr: unknown[]) {
    return arr.slice().sort((a, b) => {
      const sa = rankStatus(a);
      const sb = rankStatus(b);
      if (sa !== sb) return sa - sb; // lower rank first (pending -> ...)
      // For same status, show most recent first
      return recencyValue(b) - recencyValue(a);
    });
  }

  // Group projects by workspace id (null for general)
  const groups = new Map<string, unknown[]>();
  for (const p of projects) {
    const wsId = toWsId(p);
    const key = wsId == null ? '::general::' : String(wsId);
    const arr = groups.get(key) ?? [];
    arr.push(p);
    groups.set(key, arr);
  }

  // Extract general projects first and split archived vs non-archived so archived show last overall
  const generalKey = '::general::';
  const generalAll = sortByStatusThenRecency((groups.get(generalKey) ?? []) as unknown[]);
  const generalNonArchived = generalAll.filter((p) => normalizeStatus((p as Record<string, unknown>)?.status ?? (p as Record<string, unknown>)?.project_status ?? (p as Record<string, unknown>)?.['state']) !== 'archived');
  const generalArchived = generalAll.filter((p) => normalizeStatus((p as Record<string, unknown>)?.status ?? (p as Record<string, unknown>)?.project_status ?? (p as Record<string, unknown>)?.['state']) === 'archived');

  // Workspace groups (exclude general). We'll split each workspace into non-archived and archived lists
  const workspaceGroupsRaw: Array<{ id: string; projects: unknown[]; name: string | null; mostRecentNonArchived: number; mostRecentArchived: number; hasNonArchived: boolean }> = [];
  for (const [key, arr] of groups.entries()) {
    if (key === generalKey) continue;
    const sorted = sortByStatusThenRecency(arr as unknown[]);
    const name = (() => {
      for (const p of sorted) {
        const n = toWsName(p);
        if (n) return n;
      }
      return null;
    })();
    const nonArchived = sorted.filter((p) => normalizeStatus((p as Record<string, unknown>)?.status ?? (p as Record<string, unknown>)?.project_status ?? (p as Record<string, unknown>)?.['state']) !== 'archived');
    const archived = sorted.filter((p) => normalizeStatus((p as Record<string, unknown>)?.status ?? (p as Record<string, unknown>)?.project_status ?? (p as Record<string, unknown>)?.['state']) === 'archived');
    const mostRecentNonArchived = nonArchived.length ? recencyValue(nonArchived[0]) : 0;
    const mostRecentArchived = archived.length ? recencyValue(archived[0]) : 0;
    workspaceGroupsRaw.push({ id: key, projects: sorted, name, mostRecentNonArchived, mostRecentArchived, hasNonArchived: nonArchived.length > 0 });
  }

  // Build two lists: workspaces with non-archived projects (sorted by mostRecentNonArchived desc, effective workspace first)
  const workspaceGroups = workspaceGroupsRaw
    .filter(w => w.hasNonArchived)
    .sort((a, b) => {
      if (effectiveWsId != null) {
        if (a.id === String(effectiveWsId)) return -1;
        if (b.id === String(effectiveWsId)) return 1;
      }
      return b.mostRecentNonArchived - a.mostRecentNonArchived;
    })
    .map(w => ({ id: w.id, projects: (w.projects.filter(p => normalizeStatus((p as Record<string, unknown>)?.status ?? (p as Record<string, unknown>)?.project_status ?? (p as Record<string, unknown>)?.['state']) !== 'archived')), name: w.name }));

  // Workspace groups containing only archived items (sorted by archived recency desc)
  const archivedWorkspaceGroups = workspaceGroupsRaw
    .filter(w => !w.hasNonArchived && w.mostRecentArchived > 0)
    .sort((a, b) => b.mostRecentArchived - a.mostRecentArchived)
    .map(w => ({ id: w.id, projects: (w.projects.filter(p => normalizeStatus((p as Record<string, unknown>)?.status ?? (p as Record<string, unknown>)?.project_status ?? (p as Record<string, unknown>)?.['state']) === 'archived')), name: w.name }));

  async function handleDeleteProject(id: number | undefined | null) {
    if (id === undefined || id === null || Number.isNaN(id)) {
      addToast({ title: "Failed to delete project", description: "Invalid project ID", variant: "error" });
      return;
    }
  try {
      const response = await api.delete(`/projects/${id}`);
      const data = response as any;
      
      if (data.success !== false) { // Assume success if no explicit failure
        await qc.invalidateQueries({ queryKey: ["projects"] });
        await qc.refetchQueries({ queryKey: ["projects"] });
        addToast({ title: "Project deleted", variant: "success" });
      } else {
        throw new Error(data.message || 'Delete failed');
      }
    } catch (err: unknown) {
      const maybe = (err as Record<string, unknown>)?.message;
      const msg = typeof maybe === 'string' ? maybe : "Failed to delete project";
      addToast({ title: "Failed to delete project", description: msg, variant: "error" });
    }
  }

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetProject, setTargetProject] = useState<{ id: number | null; name?: string } | null>(null);

  function openDeleteConfirm(id: number | null, name?: string) {
    setTargetProject({ id, name });
    setConfirmOpen(true);
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0FC2C0]">Projects</h1>
          <Link href={effectiveWsId != null ? `/projects/new?ws=${effectiveWsId}` : "/projects/new"} className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold"><FolderPlus className="h-4 w-4" /> New Project</Link>
        </div>
        {isLoading && <div className="text-[#015958]">Loading...</div>}
        {isError && <div className="text-red-500">Failed to load projects</div>}

        {/* General projects (not in any workspace) - non-archived first */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#0FC2C0] mb-3">General projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generalNonArchived.map(p => {
              const pp = p as Record<string, unknown>;
              const href = `/projects/${String(pp.id)}`;
              return (
                <div key={String(pp.id)} className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Folder className="h-8 w-8 text-[#0FC2C0]" />
                      <div>
                        <Link href={href} className="text-lg font-bold text-[#0FC2C0] hover:underline">{String(pp.name ?? `Project #${pp.id}`)}</Link>
                        <div className="text-xs text-[#0CABA8]">{(normalizeStatus(pp.status ?? pp.project_status ?? pp['state']) || String(pp.status ?? '')).toString()}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => openDeleteConfirm(pp.id as number | null, String(pp.name ?? ''))}
                      className="text-red-600 hover:text-red-700"
                      type="button"
                      aria-label="Delete project"
                      title="Delete project"
                    >
                      <Trash2 className="icon-delete" />
                    </button>
                  </div>
                </div>
              );
            })}
            {!isLoading && !isError && generalNonArchived.length === 0 && (
              <div className="text-[#0CABA8] col-span-full">No general projects.</div>
            )}
          </div>
        </div>

        {/* Workspace-by-workspace sections (non-archived groups first) */}
        {workspaceGroups.map(ws => (
          <div key={ws.id} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-[#0FC2C0]">Projects in workspace{ws.name ? `: ${ws.name}` : ` (${ws.id})`}</h2>
              <div className="flex items-center gap-2">
                {effectiveWsId != null && String(effectiveWsId) === ws.id && (
                  <Link
                    href={`/projects/new?ws=${effectiveWsId}`}
                    className="inline-flex items-center justify-center h-7 w-7 rounded bg-[#0FC2C0] text-white hover:bg-[#0CABA8]"
                    title="Add project to this workspace"
                    aria-label="Add project to this workspace"
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ws.projects.map(p => {
                const pp = p as Record<string, unknown>;
                const href = `/projects/${String(pp.id)}?ws=${ws.id}`;
                return (
                  <div key={String(pp.id)} className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Folder className="h-8 w-8 text-[#0FC2C0]" />
                        <div>
                          <Link href={href} className="text-lg font-bold text-[#0FC2C0] hover:underline">{String(pp.name ?? `Project #${pp.id}`)}</Link>
                          <div className="text-xs text-[#0CABA8]">{(normalizeStatus(pp.status ?? pp.project_status ?? pp['state']) || String(pp.status ?? '')).toString()}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => openDeleteConfirm(pp.id as number | null, String(pp.name ?? ''))}
                        className="text-red-600 hover:text-red-700"
                        type="button"
                        aria-label="Delete project"
                        title="Delete project"
                      >
                        <Trash2 className="icon-delete" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {!isLoading && !isError && ws.projects.length === 0 && (
                <div className="text-[#0CABA8] col-span-full">No projects in this workspace.</div>
              )}
            </div>
          </div>
        ))}

        {/* Archived: general first then workspace archived groups */}
        {generalArchived.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#0CABA8] mb-3">Archived — General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generalArchived.map(p => {
                const pp = p as Record<string, unknown>;
                const href = `/projects/${String(pp.id)}`;
                return (
                  <div key={String(pp.id)} className="bg-white/60 rounded-xl p-6 border border-[#0CABA8]/10">
                    <div className="flex items-center gap-4">
                      <Folder className="h-8 w-8 text-gray-400" />
                      <div>
                        <Link href={href} className="text-lg font-bold text-gray-600">{String(pp.name ?? `Project #${pp.id}`)}</Link>
                        <div className="text-xs text-gray-500">{(normalizeStatus(pp.status ?? pp.project_status ?? pp['state']) || String(pp.status ?? '')).toString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {archivedWorkspaceGroups.map(ws => (
          <div key={`arch-${ws.id}`} className="mb-6">
            <h3 className="text-md font-semibold text-[#0CABA8] mb-2">Archived — {ws.name ?? `Workspace ${ws.id}`}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ws.projects.map(p => {
                const pp = p as Record<string, unknown>;
                const href = `/projects/${String(pp.id)}?ws=${ws.id}`;
                return (
                  <div key={String(pp.id)} className="bg-white/60 rounded-xl p-4 border border-[#0CABA8]/10">
                    <div className="flex items-center gap-3">
                      <Folder className="h-6 w-6 text-gray-400" />
                      <div>
                        <Link href={href} className="text-sm font-medium text-gray-600">{String(pp.name ?? `Project #${pp.id}`)}</Link>
                        <div className="text-xs text-gray-500">{(normalizeStatus(pp.status ?? pp.project_status ?? pp['state']) || String(pp.status ?? '')).toString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <ConfirmDialog
          open={confirmOpen}
          title={`Delete project${targetProject?.name ? ` '${targetProject.name}'` : ''}`}
          description="This action will permanently remove the project and its data. This cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={async () => {
            setConfirmOpen(false);
            if (targetProject?.id != null) await handleDeleteProject(targetProject.id);
            setTargetProject(null);
          }}
          onCancel={() => {
            setConfirmOpen(false);
            setTargetProject(null);
          }}
        />
      </div>
    </div>
  );
}