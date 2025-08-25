"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useToast } from "../../../components/toast";

type Note = {
  id: number;
  title: string;
  projectId?: number;
  project?: { id: number; name: string; workspaceId?: number; workspace?: { id: number; name: string } };
  workspaceId?: number;
  workspace?: { id: number; name: string };
};

export default function NotesPage() {
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

  // Keep URL in sync with effective workspace id
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

  const { data, isLoading, isError, error } = useQuery<any>({
    queryKey: ["notes", { workspace_id: effectiveWsId }],
    queryFn: () => api.get("/notes", { params: { workspace_id: effectiveWsId } }),
    enabled: effectiveWsId != null,
  });
  // Fetch projects to resolve names when notes only provide projectId (scoped to workspace)
  const { data: projectsData } = useQuery<any>({
    queryKey: ["projects", { workspace_id: effectiveWsId }],
    queryFn: () => api.get("/projects", { params: { workspace_id: effectiveWsId } }),
    enabled: effectiveWsId != null,
  });
  const notes: Note[] = Array.isArray(data)
    ? data
    : data?.notes && Array.isArray(data.notes)
    ? data.notes
    : [];

  // Helpers similar to Tasks page
  const toPid = (n: any): number | null => {
    const raw = n?.project?.id ?? n?.projectId ?? n?.project_id ?? n?.projectID;
    const num = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return Number.isFinite(num) ? (num as number) : null;
  };
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
  const toPname = (n: any, pid: number | null): string => {
    if (n?.project?.name) return n.project.name;
    if (n?.project_name) return n.project_name;
    if (pid != null) return projectNameById[String(pid)] ?? `Project #${pid}`;
    return "General";
  };
  const toWsId = (n: any): number | null => {
    const raw =
      n?.project?.workspace?.id ??
      n?.project?.workspaceId ??
      n?.project?.workspace_id ??
      n?.workspace?.id ??
      n?.workspaceId ??
      n?.workspace_id;
    const num = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return Number.isFinite(num) ? (num as number) : null;
  };
  const toWsName = (n: any): string | null => {
    return n?.project?.workspace?.name || n?.workspace?.name || null;
  };

  const generalNotes = notes.filter(n => toPid(n) == null);
  const projectNotes = notes.filter(n => toPid(n) != null);
  const groupedByProject = projectNotes.reduce<Record<string, { projectName: string; projectId: number; items: Note[] }>>((acc, n) => {
    const pid = toPid(n)!;
    const pname = toPname(n, pid);
    const key = String(pid);
    if (!acc[key]) acc[key] = { projectName: pname, projectId: pid, items: [] };
    acc[key].items.push(n);
    return acc;
  }, {});

  async function handleDeleteNote(id: number) {
    try {
      await api.delete(`/notes/${id}`);
      await qc.invalidateQueries({ queryKey: ["notes"] });
      await qc.refetchQueries({ queryKey: ["notes"] });
      addToast({ title: "Note deleted", variant: "success" });
    } catch (e) {
      // optionally surface error
      addToast({ title: "Failed to delete note", variant: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0FC2C0]">Notes</h1>
          <Link href="/notes/new" className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold"><Plus className="h-4 w-4" /> New Note</Link>
        </div>
        {effectiveWsId == null && (
          <div className="text-[#015958] mb-4">Select a workspace first (open Workspace page to set it), or append ?ws=&lt;id&gt; to the URL.</div>
        )}
        {isLoading && effectiveWsId != null && <div className="text-[#015958]">Loading...</div>}
        {isError && (
          <div className="text-red-500">Failed to load notes{(error as any)?.message ? `: ${(error as any).message}` : ''}</div>
        )}

        {/* General notes grouped (by workspace) */}
        {(() => {
          const grouped = generalNotes.reduce<Record<string, { wsName: string | null; wsId: number | null; items: Note[] }>>((acc, n) => {
            const wsName = toWsName(n);
            const wsId = toWsId(n);
            const key = wsName ? `name:${wsName}` : wsId != null ? `id:${wsId}` : 'none';
            if (!acc[key]) acc[key] = { wsName: wsName ?? null, wsId: wsId ?? null, items: [] };
            acc[key].items.push(n);
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
                    {group.items.map(n => (
                      <div key={n.id} className="border border-[#0CABA8]/20 rounded-md p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-[#015958] font-medium">{n.title}</div>
                          <button
                            onClick={() => handleDeleteNote(n.id)}
                            className="text-red-600 hover:text-red-700"
                            type="button"
                            aria-label="Delete note"
                            title="Delete note"
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
              <div className="text-[#0CABA8] mb-8">No general notes.</div>
            ) : null
          );
        })()}

        {/* Notes under projects */}
        <div className="space-y-6">
          {Object.values(groupedByProject).map(group => (
            <div key={group.projectId} className="bg-white rounded-xl shadow border border-[#0CABA8]/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <Link href={effectiveWsId != null ? `/projects/${group.projectId}?ws=${effectiveWsId}` : `/projects/${group.projectId}`} className="text-[#0FC2C0] font-semibold hover:underline">
                  {group.projectName}
                </Link>
                <div className="flex items-center gap-2">
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
                    href={effectiveWsId != null ? `/notes/new?ws=${effectiveWsId}&project=${group.projectId}` : `/notes/new?project=${group.projectId}`}
                    className="inline-flex items-center justify-center h-7 w-7 rounded bg-[#0FC2C0] text-white hover:bg-[#0CABA8]"
                    title="Add note to this project"
                    aria-label="Add note to this project"
                  >
                    <Plus className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map(n => (
                  <div key={n.id} className="border border-[#0CABA8]/20 rounded-md p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-[#015958] font-medium">{n.title}</div>
                      {/* Workspace badge per note if available */}
                      {/* Keeping header badge only to reduce clutter; can enable per-note badge like Tasks if needed */}
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-red-600 hover:text-red-700"
                        type="button"
                        aria-label="Delete note"
                        title="Delete note"
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
            <div className="text-[#0CABA8]">No project notes.</div>
          )}
        </div>

      </div>
    </div>
  );
}