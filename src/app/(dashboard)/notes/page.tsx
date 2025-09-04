"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api";
import { Plus, Trash2, MessageCircle } from "lucide-react";
import { useToast } from "../../../components/toast";
import { useAuth } from "../../../hooks/useAuth";
import ConfirmDialog from "../../../components/ConfirmDialog";
import {
  ItemPresenceIndicator,
  UniversalComments,
  RealtimeReactions
} from "../../../components/collaboration";
import { useGlobalPresence } from "../../../hooks/collaboration/useGlobalPresence";

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
  const auth = useAuth();

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

  // presence and comment expansion for notes (match tasks page behavior)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetNote, setTargetNote] = useState<{ id: number; title?: string } | null>(null);
  const { presence, setActivityStatus } = useGlobalPresence(
    auth?.user?.id?.toString() || '',
    auth?.user?.name || 'Guest',
    'notes'
  );

  // Keep URL in sync with effective workspace id
  useEffect(() => {
    if (effectiveWsId == null) return;
    const current = searchParams.get("ws");
    const currentNum = current ? parseInt(current, 10) : null;
    if (!(typeof currentNum === 'number' && Number.isFinite(currentNum)) || currentNum !== effectiveWsId) {
      const usp = new URLSearchParams(searchParams.toString());
      usp.set("ws", String(effectiveWsId));
      router.replace(`?${usp.toString()}`);
    }
  }, [effectiveWsId, searchParams, router]);

  const { data, isLoading, isError, error } = useQuery<unknown>({
    queryKey: ["notes", { workspace_id: effectiveWsId }],
    queryFn: () => api.get("/notes", { params: effectiveWsId != null ? { workspace_id: effectiveWsId } : undefined }),
    // Allow notes to load even when no workspace is selected; server may return all or general notes
    enabled: true,
  });
  // Fetch projects to resolve names when notes only provide projectId (scoped to workspace)
  const { data: projectsData } = useQuery<unknown>({
    queryKey: ["projects", { workspace_id: effectiveWsId }],
    queryFn: () => api.get("/projects", { params: { workspace_id: effectiveWsId } }),
    enabled: effectiveWsId != null,
  });
  const notes: Note[] = Array.isArray(data)
    ? (data as Note[])
    : (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)['notes']))
    ? ((data as Record<string, unknown>)['notes'] as Note[])
    : [];

  // Helpers similar to Tasks page
  const toPid = (n: unknown): number | null => {
    const nn = n as Record<string, unknown> | null;
    if (!nn) return null;
    const project = nn.project as Record<string, unknown> | undefined;
    const raw = project?.id ?? nn.projectId ?? nn.project_id ?? nn.projectID;
    const num = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return typeof num === 'number' && Number.isFinite(num) ? (num as number) : null;
  };
  const projectList: unknown[] = Array.isArray(projectsData)
    ? (projectsData as unknown[])
    : (projectsData && typeof projectsData === 'object' && Array.isArray((projectsData as Record<string, unknown>)['projects']))
    ? ((projectsData as Record<string, unknown>)['projects'] as unknown[])
    : [];
  const projectNameById: Record<string, string> = projectList.reduce<Record<string, string>>((acc, p: unknown) => {
    const pp = p as Record<string, unknown>;
    const id = pp?.id ?? pp?.projectId ?? pp?.project_id;
    const name = pp?.name ?? pp?.project_name;
    if (id != null && name) acc[String(id)] = String(name);
    return acc;
  }, {} as Record<string, string>);
  const toPname = (n: unknown, pid: number | null): string => {
    const nn = n as Record<string, unknown> | null;
    const project = nn?.project as Record<string, unknown> | undefined;
    if (project && typeof project.name === 'string') return project.name;
    if (nn && typeof nn.project_name === 'string') return nn.project_name;
    if (pid != null) return projectNameById[String(pid)] ?? "Untitled Project";
    return "General";
  };
  const toWsId = (n: unknown): number | null => {
    const nn = n as Record<string, unknown> | null;
    if (!nn) return null;
    const project = nn.project as Record<string, unknown> | undefined;
    const workspace = (project?.workspace as Record<string, unknown> | undefined) ?? (nn.workspace as Record<string, unknown> | undefined);
    const raw = workspace?.id ?? workspace?.workspaceId ?? workspace?.workspace_id;
    const num = typeof raw === 'string' ? parseInt(raw, 10) : raw;
    return typeof num === 'number' && Number.isFinite(num) ? (num as number) : null;
  };
  const toWsName = (n: unknown): string | null => {
    const nn = n as Record<string, unknown> | null;
    const project = nn?.project as Record<string, unknown> | undefined;
    const pws = project?.workspace as Record<string, unknown> | undefined;
    if (pws && typeof pws.name === 'string') return pws.name;
    const ws = nn?.workspace as Record<string, unknown> | undefined;
    if (ws && typeof ws.name === 'string') return ws.name;
    return null;
  };

  const generalNotes = notes.filter(n => toPid(n) == null);
  const projectNotes = notes.filter(n => toPid(n) != null);
  const toContent = (n: unknown): string => {
    const nn = n as Record<string, unknown> | null;
    if (!nn) return "";
    return typeof (nn as any).content === 'string' ? (nn as any).content : '';
  };
  const toCreatedAt = (n: unknown): string | null => {
    const nn = n as Record<string, unknown> | null;
    if (!nn) return null;
    const raw = (nn as any).created_at ?? (nn as any).createdAt ?? (nn as any).created;
    return raw ? String(raw) : null;
  };
  const groupedByProject = projectNotes.reduce<Record<string, { projectName: string; projectId: number; items: Note[] }>>((acc, n) => {
    const pid = toPid(n)!;
    const pname = toPname(n, pid);
    const key = String(pid);
    if (!acc[key]) acc[key] = { projectName: pname, projectId: pid, items: [] };
    acc[key].items.push(n);
    return acc;
  }, {});

  // If no workspace is selected but notes were returned, try to infer and persist a workspace id
  useEffect(() => {
    if (effectiveWsId != null) return;
    if (!Array.isArray(notes) || notes.length === 0) return;
    // prefer any note that has a workspace id
    const candidate = notes.map(n => toWsId(n)).find(id => id != null) ?? null;
    if (candidate != null && typeof window !== 'undefined') {
      setCurrentWsId(candidate);
      sessionStorage.setItem('current_workspace_id', String(candidate));
    }
  }, [effectiveWsId, notes]);

  function openDeleteConfirm(id: number, title?: string) {
    setTargetNote({ id, title });
    setConfirmOpen(true);
  }

  async function handleDeleteNote(id: number) {
    try {
      await api.delete(`/notes/${id}`);
      await qc.invalidateQueries({ queryKey: ["notes"] });
      await qc.refetchQueries({ queryKey: ["notes"] });
      addToast({ title: "Note deleted", variant: "success" });
    } catch (err: unknown) {
      const maybe = (err as Record<string, unknown>)?.message;
      const msg = typeof maybe === 'string' ? maybe : "Failed to delete note";
      addToast({ title: "Failed to delete note", description: msg, variant: "error" });
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#0FC2C0]">Notes</h1>
          <Link href={effectiveWsId != null ? `/notes/new?ws=${effectiveWsId}` : "/notes/new"} className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors font-semibold"><Plus className="h-4 w-4" /> New Note</Link>
        </div>
        {isLoading && effectiveWsId != null && <div className="text-[#015958]">Loading...</div>}
        {isError && (
          <div className="text-red-500">Failed to load notes{error && (error as { message?: string }).message ? `: ${(error as { message?: string }).message}` : ''}</div>
        )}

        {/* General notes first */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#0FC2C0] mb-3">General Notes</h2>
          {generalNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generalNotes.map(n => (
                <div key={n.id} className="border border-[#0CABA8]/20 rounded-md p-4 relative bg-white">
                  <RealtimeReactions
                    itemType="note"
                    itemId={String(n.id)}
                    currentUserId={auth?.user?.id?.toString() || ''}
                    currentUserName={auth?.user?.name || 'Guest'}
                    className="absolute inset-0 rounded-md"
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <Link
                          href={`/notes/${n.id}`}
                          className="text-[#015958] font-medium cursor-pointer hover:text-[#0FC2C0] hover:underline"
                          onClick={() => setActivityStatus('note', String((n as any).id), 'viewing')}
                        >
                          {(n as any).title}
                        </Link>
                        <div className="text-sm text-gray-700 mt-1">{toContent(n).slice(0, 180)}{toContent(n).length > 180 ? '…' : ''}</div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs bg-white border border-[#0CABA8]/40 text-[#013937] px-2 py-1 rounded">{toPname(n, toPid(n))}</span>
                          {toWsName(n) && <span className="text-xs bg-white border border-[#0CABA8]/40 text-[#013937] px-2 py-1 rounded">Workspace: {toWsName(n)}</span>}
                          {toCreatedAt(n) && <span className="text-xs text-gray-500">{new Date(String(toCreatedAt(n))).toLocaleString()}</span>}
                        </div>
                        <div className="mt-2">
                          <ItemPresenceIndicator
                            users={presence.users}
                            currentUserId={auth?.user?.id?.toString() || ''}
                            itemType="note"
                            itemId={String((n as any).id)}
                            className="mb-2"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedComments);
                            if (newExpanded.has((n as any).id)) newExpanded.delete((n as any).id);
                            else newExpanded.add((n as any).id);
                            setExpandedComments(newExpanded);
                          }}
                          className="text-[#0FC2C0] hover:text-[#0CABA8]"
                          title="Toggle comments"
                        >
                          <MessageCircle className="icon-comment" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote((n as any).id)}
                          className="text-red-600 hover:text-red-700"
                          type="button"
                          aria-label="Delete note"
                          title="Delete note"
                        >
                          <Trash2 className="icon-delete" />
                        </button>
                      </div>
                    </div>
                    {expandedComments.has((n as any).id) && auth?.user && (
                      <div className="mt-4 border-t border-[#0CABA8]/20 pt-4">
                        <UniversalComments
                          itemType="note"
                          itemId={String((n as any).id)}
                          currentUserId={auth.user.id?.toString() || ''}
                          currentUserName={auth.user.name || 'User'}
                          users={presence.users}
                          className="max-h-60 overflow-y-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isLoading && !isError && (
              <div className="text-[#0CABA8]">No general notes.</div>
            )
          )}
        </div>

        {/* Notes in workspace projects */}
        <div className="space-y-6">
          {Object.values(groupedByProject).map(group => (
            <div key={group.projectId} className="bg-white rounded-xl shadow border border-[#0CABA8]/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <Link href={effectiveWsId != null ? `/projects/${group.projectId}?ws=${effectiveWsId}` : `/projects/${group.projectId}`} className="text-[#0FC2C0] font-semibold hover:underline">
                  Notes in project: {group.projectName}
                </Link>
                <div className="flex items-center gap-2">
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
                  <div key={n.id} className="border border-[#0CABA8]/20 rounded-md p-4 relative">
                    <RealtimeReactions
                      itemType="note"
                      itemId={String(n.id)}
                      currentUserId={auth?.user?.id?.toString() || ''}
                      currentUserName={auth?.user?.name || 'Guest'}
                      className="absolute inset-0 rounded-md"
                    />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <Link 
                            href={`/notes/${n.id}`}
                            className="text-gray-900 font-medium hover:text-[#0FC2C0] cursor-pointer"
                          >
                            {(n as any).title}
                          </Link>
                          <div className="text-sm text-gray-700 mt-1">{toContent(n).slice(0, 180)}{toContent(n).length > 180 ? '…' : ''}</div>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs bg-[#F6FFFE] border border-[#0CABA8]/40 text-[#015958] px-2 py-1 rounded">{toPname(n, toPid(n))}</span>
                            {toWsName(n) && <span className="text-xs bg-[#F6FFFE] border border-[#0CABA8]/40 text-[#015958] px-2 py-1 rounded">Workspace: {toWsName(n)}</span>}
                            {toCreatedAt(n) && <span className="text-xs text-gray-500">{new Date(String(toCreatedAt(n))).toLocaleString()}</span>}
                          </div>
                          <div className="mt-2">
                            <ItemPresenceIndicator
                              users={presence.users}
                              currentUserId={auth?.user?.id?.toString() || ''}
                              itemType="note"
                              itemId={String((n as any).id)}
                              className="mb-2"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedComments);
                              if (newExpanded.has((n as any).id)) newExpanded.delete((n as any).id);
                              else newExpanded.add((n as any).id);
                              setExpandedComments(newExpanded);
                            }}
                            className="text-[#0FC2C0] hover:text-[#0CABA8]"
                            title="Toggle comments"
                          >
                            <MessageCircle className="icon-comment" />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm((n as any).id, (n as any).title)}
                            className="text-red-600 hover:text-red-700"
                            type="button"
                            aria-label="Delete note"
                            title="Delete note"
                          >
                            <Trash2 className="icon-delete" />
                          </button>
                        </div>
                      </div>

                      {expandedComments.has((n as any).id) && auth?.user && (
                        <div className="mt-4 border-t border-[#0CABA8]/20 pt-4">
                          <UniversalComments
                            itemType="note"
                            itemId={String((n as any).id)}
                            currentUserId={auth.user.id?.toString() || ''}
                            currentUserName={auth.user.name || 'User'}
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
            <div className="text-[#0CABA8]">No project notes.</div>
          )}
        </div>

      </div>
      
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete note${targetNote?.title ? ` '${targetNote.title}'` : ''}`}
        description="This action will permanently remove the note. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          setConfirmOpen(false);
          if (targetNote?.id) await handleDeleteNote(targetNote.id);
          setTargetNote(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setTargetNote(null);
        }}
      />
    </div>
  );
}