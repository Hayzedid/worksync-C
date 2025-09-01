"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api";
import { FolderPlus, Folder, Trash2 } from "lucide-react";
import { useToast } from "../../../components/toast";
import React, { useEffect, useState } from "react";
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
    }
  }, [wsIdFromUrl]);
  const effectiveWsId = wsIdFromUrl ?? currentWsId;

  // Fetch all projects (server may include workspace association fields)
  const { data, isLoading, isError } = useQuery<unknown>({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects"),
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
  function isArchived(p: unknown): boolean {
    const pp = p as Record<string, unknown>;
    return (pp.status?.toString().toLowerCase() === 'archived');
  }
  // Sort: non-archived first, then archived
  function sortArchivedLast(arr: unknown[]) {
    return [
      ...arr.filter(p => !isArchived(p)),
      ...arr.filter(p => isArchived(p)),
    ];
  }
  const inCurrentWorkspace = sortArchivedLast(projects.filter(p => effectiveWsId != null && toWsId(p) === effectiveWsId) as unknown[]);
  const generalProjects = sortArchivedLast(projects.filter(p => toWsId(p) == null) as unknown[]);
  const workspaceName: string | null = (() => {
    for (const p of inCurrentWorkspace) {
      const n = toWsName(p);
      if (n) return n;
    }
    return null;
  })();

  async function handleDeleteProject(id: number | undefined | null) {
    if (id === undefined || id === null || Number.isNaN(id)) {
      addToast({ title: "Failed to delete project", description: "Invalid project ID", variant: "error" });
      return;
    }
    
    if (!confirm('Are you sure you want to delete this project?')) {
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

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0FC2C0]">Projects</h1>
          <Link href={effectiveWsId != null ? `/projects/new?ws=${effectiveWsId}` : "/projects/new"} className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold"><FolderPlus className="h-4 w-4" /> New Project</Link>
        </div>
        {isLoading && <div className="text-[#015958]">Loading...</div>}
        {isError && <div className="text-red-500">Failed to load projects</div>}

        {/* General projects (not in any workspace) */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#0FC2C0] mb-3">General projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generalProjects.map(p => {
              const pp = p as Record<string, unknown>;
              const href = `/projects/${String(pp.id)}`;
              return (
                <div key={String(pp.id)} className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Folder className="h-8 w-8 text-[#0FC2C0]" />
                      <div>
                        <Link href={href} className="text-lg font-bold text-[#0FC2C0] hover:underline">{String(pp.name ?? `Project #${pp.id}`)}</Link>
                        <div className="text-xs text-[#0CABA8]">{String(pp.status ?? '')}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProject(pp.id as number | undefined | null)}
                      className="text-red-600 hover:text-red-700"
                      type="button"
                      aria-label="Delete project"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {!isLoading && !isError && generalProjects.length === 0 && (
              <div className="text-[#0CABA8] col-span-full">No general projects.</div>
            )}
          </div>
        </div>

        {/* Projects in current workspace */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-[#0FC2C0]">
              Projects in workspace{workspaceName ? `: ${workspaceName}` : ''}
            </h2>
            <div className="flex items-center gap-2">
              {effectiveWsId != null && (
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
            {inCurrentWorkspace.map(p => {
              const pp = p as Record<string, unknown>;
              const href = effectiveWsId != null ? `/projects/${String(pp.id)}?ws=${effectiveWsId}` : `/projects/${String(pp.id)}`;
              return (
                <div key={String(pp.id)} className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Folder className="h-8 w-8 text-[#0FC2C0]" />
                      <div>
                        <Link href={href} className="text-lg font-bold text-[#0FC2C0] hover:underline">{String(pp.name ?? `Project #${pp.id}`)}</Link>
                        <div className="text-xs text-[#0CABA8]">{String(pp.status ?? '')}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProject(Number(pp.id))}
                      className="text-red-600 hover:text-red-700"
                      type="button"
                      aria-label="Delete project"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {!isLoading && !isError && inCurrentWorkspace.length === 0 && (
              <div className="text-[#0CABA8] col-span-full">No projects in this workspace.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}