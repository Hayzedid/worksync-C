"use client";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api";
import { FolderPlus, Folder, Trash2 } from "lucide-react";
import { useToast } from "../../../components/toast";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Project = { id: number; name: string; status: string };

export default function ProjectsPage() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  const router = useRouter();
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
  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["projects"],
    queryFn: () => api.get("/projects"),
  });
  const projects: any[] = Array.isArray(data)
    ? data
    : data?.projects && Array.isArray(data.projects)
    ? data.projects
    : [];

  // Helpers to read workspace info from various shapes
  const toWsId = (p: any): number | null => {
    const raw = p?.workspace?.id ?? p?.workspaceId ?? p?.workspace_id ?? p?.ws_id;
    const num = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return Number.isFinite(num) ? (num as number) : null;
  };
  const toWsName = (p: any): string | null => {
    return p?.workspace?.name ?? p?.workspace_name ?? null;
  };

  // Grouping
  const inCurrentWorkspace = projects.filter(p => effectiveWsId != null && toWsId(p) === effectiveWsId);
  const generalProjects = projects.filter(p => toWsId(p) == null);
  const workspaceName: string | null = (() => {
    for (const p of inCurrentWorkspace) {
      const n = toWsName(p);
      if (n) return n;
    }
    return null;
  })();

  async function handleDeleteProject(id: number) {
    try {
      await api.delete(`/projects/${id}`);
      await qc.invalidateQueries({ queryKey: ["projects"] });
      await qc.refetchQueries({ queryKey: ["projects"] });
      addToast({ title: "Project deleted", variant: "success" });
    } catch (e) {
      // optionally surface error
      addToast({ title: "Failed to delete project", variant: "error" });
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
              const href = `/projects/${p.id}`;
              return (
                <div key={p.id} className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Folder className="h-8 w-8 text-[#0FC2C0]" />
                      <div>
                        <Link href={href} className="text-lg font-bold text-[#0FC2C0] hover:underline">{p.name}</Link>
                        <div className="text-xs text-[#0CABA8]">{p.status}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProject(p.id)}
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
              const href = effectiveWsId != null ? `/projects/${p.id}?ws=${effectiveWsId}` : `/projects/${p.id}`;
              return (
                <div key={p.id} className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Folder className="h-8 w-8 text-[#0FC2C0]" />
                      <div>
                        <Link href={href} className="text-lg font-bold text-[#0FC2C0] hover:underline">{p.name}</Link>
                        <div className="text-xs text-[#0CABA8]">{p.status}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProject(p.id)}
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