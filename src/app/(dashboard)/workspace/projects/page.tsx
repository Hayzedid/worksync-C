"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../api";
import { Folder, FolderPlus } from "lucide-react";

// Helpers to normalize incoming project shape
function toWsId(p: any): number | null {
  const raw =
    p?.workspace?.id ??
    p?.workspaceId ??
    p?.workspace_id ??
    p?.project?.workspace?.id ??
    p?.project?.workspaceId ??
    p?.project?.workspace_id;
  const num = typeof raw === "string" ? parseInt(raw, 10) : raw;
  return Number.isFinite(num) ? (num as number) : null;
}
function toWsName(p: any): string | null {
  return p?.workspace?.name ?? p?.project?.workspace?.name ?? null;
}
function toPid(p: any): number | null {
  const raw = p?.id ?? p?.projectId ?? p?.project_id;
  const num = typeof raw === "string" ? parseInt(raw, 10) : raw;
  return Number.isFinite(num) ? (num as number) : null;
}
function toPname(p: any): string {
  return p?.name ?? p?.project_name ?? `Project #${toPid(p) ?? "?"}`;
}
function toPstatus(p: any): string {
  return p?.status ?? p?.project_status ?? "";
}

export default function WorkspaceProjectsPage() {
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

  // Seed from URL, then sessionStorage fallback
  useEffect(() => {
    if (wsIdFromUrl != null) {
      setCurrentWsId(wsIdFromUrl);
      if (typeof window !== "undefined") sessionStorage.setItem("current_workspace_id", String(wsIdFromUrl));
      return;
    }
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("current_workspace_id");
      if (stored) {
        const num = parseInt(stored, 10);
        if (Number.isFinite(num)) setCurrentWsId(num);
      }
    }
  }, [wsIdFromUrl]);

  const effectiveWsId = wsIdFromUrl ?? currentWsId;

  // When no workspace is selected, run a lightweight discovery fetch to derive available workspaces from projects data
  const { data: discoverData } = useQuery<any>({
    queryKey: ["projects-discover"],
    queryFn: () => api.get("/projects"),
    enabled: effectiveWsId == null,
    staleTime: 60_000,
  });

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ["projects", { workspace_id: effectiveWsId }],
    queryFn: () => api.get("/projects", { params: { workspace_id: effectiveWsId } }),
    enabled: effectiveWsId != null,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  const allProjects: any[] = Array.isArray(data)
    ? data
    : data?.projects && Array.isArray(data.projects)
    ? data.projects
    : [];

  const discoverProjects: any[] = Array.isArray(discoverData)
    ? discoverData
    : discoverData?.projects && Array.isArray(discoverData.projects)
    ? discoverData.projects
    : [];

  // Distill minimal info and compute workspaces set
  const normalized = useMemo(
    () =>
      allProjects.map((p: any) => ({
        id: toPid(p)!,
        name: toPname(p),
        status: toPstatus(p),
        wsId: toWsId(p),
        wsName: toWsName(p),
      })),
    [allProjects]
  );

  const normalizedDiscover = useMemo(
    () =>
      discoverProjects.map((p: any) => {
        const wsId =
          p?.workspace?.id ??
          p?.workspaceId ??
          p?.workspace_id ??
          p?.project?.workspace?.id ??
          p?.project?.workspaceId ??
          p?.project?.workspace_id ??
          null;
        const wsName =
          p?.workspace?.name ??
          p?.project?.workspace?.name ??
          null;
        return { wsId: Number.isFinite(wsId) ? (wsId as number) : (typeof wsId === 'string' && Number.isFinite(parseInt(wsId,10)) ? parseInt(wsId,10) : null), wsName };
      }),
    [discoverProjects]
  );

  const workspaces = useMemo(() => {
    const map: Record<string, { id: number | null; name: string | null; count: number }> = {};
    for (const p of normalized) {
      const key = p.wsId != null ? `id:${p.wsId}` : p.wsName ? `name:${p.wsName}` : "none";
      if (!map[key]) map[key] = { id: p.wsId ?? null, name: p.wsName ?? null, count: 0 };
      map[key].count += 1;
    }
    return Object.values(map);
  }, [normalized]);

  const discoveredWorkspaces = useMemo(() => {
    const map: Record<string, { id: number | null; name: string | null }> = {};
    for (const d of normalizedDiscover) {
      const key = d.wsId != null ? `id:${d.wsId}` : d.wsName ? `name:${d.wsName}` : "none";
      if (!map[key]) map[key] = { id: d.wsId ?? null, name: d.wsName ?? null };
    }
    return Object.values(map).filter(w => w.id != null) as { id: number; name: string | null }[];
  }, [normalizedDiscover]);

  // Keep local selection in sync with URL when present
  useEffect(() => {
    if (wsIdFromUrl != null) {
      setCurrentWsId(wsIdFromUrl);
      if (typeof window !== "undefined") sessionStorage.setItem("current_workspace_id", String(wsIdFromUrl));
    }
  }, [wsIdFromUrl]);

  // Keep URL in sync: if we have an effectiveWsId but URL lacks ws or differs, replace it
  useEffect(() => {
    if (effectiveWsId == null) return;
    const current = searchParams.get("ws");
    const currentNum = current ? parseInt(current, 10) : null;
    if (!Number.isFinite(currentNum as any) || currentNum !== effectiveWsId) {
      const usp = new URLSearchParams(searchParams as any);
      usp.set("ws", String(effectiveWsId));
      router.replace(`?${usp.toString()}`);
    }
  }, [effectiveWsId, searchParams, router]);

  const filtered = useMemo(() => {
    if (effectiveWsId == null) return [];
    return normalized.filter((p) => p.wsId === effectiveWsId);
  }, [normalized, effectiveWsId]);

  const headerLabel = useMemo(() => {
    if (effectiveWsId == null) return "All Workspaces";
    const ws = workspaces.find((w) => w.id === effectiveWsId);
    return ws?.name ? `${ws.name}` : `Workspace #${effectiveWsId}`;
  }, [effectiveWsId, workspaces]);

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0FC2C0]">Projects</h1>
            <div className="text-sm text-[#0CABA8]">{headerLabel}</div>
          </div>
          <Link
            href={effectiveWsId != null ? `/projects/new?ws=${effectiveWsId}` : "/projects/new"}
            className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold"
          >
            <FolderPlus className="h-4 w-4" /> New Project
          </Link>
        </div>

        {effectiveWsId == null && (
          <div className="mb-6 p-4 bg-white border border-[#0CABA8]/30 rounded">
            <div className="text-[#015958] mb-2">Select a workspace to view projects:</div>
            <div className="flex items-center gap-3">
              <select
                className="border border-[#0CABA8]/40 rounded px-3 py-2 text-[#015958]"
                value={""}
                onChange={(e) => {
                  const next = parseInt(e.target.value, 10);
                  if (Number.isFinite(next)) {
                    setCurrentWsId(next);
                    if (typeof window !== "undefined") sessionStorage.setItem("current_workspace_id", String(next));
                    const usp = new URLSearchParams(searchParams as any);
                    usp.set("ws", String(next));
                    router.replace(`?${usp.toString()}`);
                  }
                }}
              >
                <option value="" disabled>
                  Choose workspace
                </option>
                {discoveredWorkspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name ?? `Workspace #${w.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Workspace selector when multiple */}
        {workspaces.length > 1 && (
          <div className="mb-4">
            <label className="block text-[#015958] font-semibold mb-1">Workspace</label>
            <select
              className="w-full md:w-72 px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-white"
              value={currentWsId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                const num = v === "" ? null : parseInt(v, 10);
                setCurrentWsId(Number.isFinite(num as any) ? (num as any) : null);
                if (typeof window !== "undefined") {
                  if (num == null) sessionStorage.removeItem("current_workspace_id");
                  else sessionStorage.setItem("current_workspace_id", String(num));
                }
                // Keep URL in sync with selection
                const usp = new URLSearchParams(searchParams as any);
                if (num == null) usp.delete("ws");
                else usp.set("ws", String(num));
                router.replace(`?${usp.toString()}`);
              }}
            >
              <option value="">All Workspaces</option>
              {Array.from(new Set(normalized.map((p) => p.wsId).filter((x): x is number => x != null))).map((id) => (
                <option key={id} value={id}>
                  {workspaces.find((w) => w.id === id)?.name ?? `Workspace #${id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {isLoading && <div className="text-[#015958]">Loading...</div>}
        {isError && <div className="text-red-500">Failed to load projects</div>}

        {/* If multiple workspaces exist but none selected, prompt selection instead of showing all */}
        {workspaces.length > 1 && effectiveWsId == null ? (
          <div className="text-[#015958] mb-6">Select a workspace to view its projects.</div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(workspaces.length > 1 && effectiveWsId == null ? [] : filtered).map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Folder className="h-8 w-8 text-[#0FC2C0]" />
                  <div>
                    <Link href={`/projects/${p.id}`} className="text-lg font-bold text-[#0FC2C0] hover:underline">
                      {p.name}
                    </Link>
                    <div className="text-xs text-[#0CABA8]">{p.status}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!isLoading && !isError && (workspaces.length > 1 && effectiveWsId == null ? true : filtered.length === 0) && (
            <div className="text-[#0CABA8] col-span-full">No projects in this workspace.</div>
          )}
        </div>
      </div>
    </div>
  );
}
