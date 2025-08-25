"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Settings, Folder, UserPlus, CheckSquare, FileText, Activity as ActivityIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api";
import { useToast } from "../../../components/toast";

// Project count is fetched from API; Activity now uses real notifications where available

export default function WorkspacePage() {
  const [wsId, setWsId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fromUrl = searchParams?.get('ws');
    if (fromUrl) {
      const n = parseInt(fromUrl, 10);
      if (Number.isFinite(n)) {
        setWsId(n);
        sessionStorage.setItem('current_workspace_id', String(n));
        return;
      }
    }
    const stored = sessionStorage.getItem('current_workspace_id');
    if (stored) {
      const n = parseInt(stored, 10);
      if (Number.isFinite(n)) {
        setWsId(n);
        return;
      }
    }
    // No workspace context, send user to workspaces list
    router.replace('/workspaces');
  }, [searchParams, router]);

  const projectsHref = wsId != null ? `/workspace/projects?ws=${wsId}` : "/workspace/projects";
  const newProjectHref = wsId != null ? `/projects/new?ws=${wsId}` : "/projects/new";
  const membersHref = wsId != null ? `/workspace/members?ws=${wsId}` : "/workspace/members";
  const inviteHref = wsId != null ? `/workspace/invite?ws=${wsId}` : "/workspace/invite";
  const settingsHref = wsId != null ? `/settings?ws=${wsId}` : "/settings";

  // Fetch project count for the current workspace
  const { data: projectsData } = useQuery({
    queryKey: ["projects-count", wsId],
    queryFn: async () => {
      if (wsId == null) return null;
      const res = await api.get("/projects", { params: { workspace_id: wsId } });
      return res;
    },
    enabled: wsId != null,
  });

  // Fetch notifications/activity for the current workspace
  const { data: notifications } = useQuery({
    queryKey: ["notifications", wsId],
    queryFn: async () => {
      if (wsId == null) return [] as any[];
      try {
        const res = await api.get("/notifications", { params: { workspace_id: wsId } });
        const list: any[] = Array.isArray(res) ? res : Array.isArray((res as any)?.notifications) ? (res as any).notifications : [];
        return list;
      } catch {
        return [] as any[];
      }
    },
    enabled: wsId != null,
  });

  const projectsCount = useMemo(() => {
    if (!projectsData) return 0;
    if (Array.isArray(projectsData)) return projectsData.length;
    if (Array.isArray((projectsData as any).projects)) return (projectsData as any).projects.length;
    return 0;
  }, [projectsData]);

  // Fetch lists scoped to workspace (compact previews)
  const { data: projectsList } = useQuery({
    queryKey: ["projects", wsId],
    queryFn: async () => {
      if (wsId == null) return [] as any[];
      const res = await api.get("/projects", { params: { workspace_id: wsId } });
      const list: any[] = Array.isArray(res) ? res : Array.isArray((res as any)?.projects) ? (res as any).projects : [];
      return list;
    },
    enabled: wsId != null,
  });

  const { data: tasksList } = useQuery({
    queryKey: ["tasks", wsId],
    queryFn: async () => {
      if (wsId == null) return [] as any[];
      try {
        const res = await api.get("/tasks", { params: { workspace_id: wsId } });
        const list: any[] = Array.isArray(res) ? res : Array.isArray((res as any)?.tasks) ? (res as any).tasks : [];
        return list;
      } catch {
        return [] as any[];
      }
    },
    enabled: wsId != null,
  });

  const { data: notesList } = useQuery({
    queryKey: ["notes", wsId],
    queryFn: async () => {
      if (wsId == null) return [] as any[];
      try {
        const res = await api.get("/notes", { params: { workspace_id: wsId } });
        const list: any[] = Array.isArray(res) ? res : Array.isArray((res as any)?.notes) ? (res as any).notes : [];
        return list;
      } catch {
        return [] as any[];
      }
    },
    enabled: wsId != null,
  });

  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Top CTAs */}
      <div className="md:col-span-2 bg-white rounded-xl shadow p-4 border border-[#0CABA8]/20 flex items-center gap-3">
        <div className="flex items-center gap-3">
          <Link href={newProjectHref} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#0FC2C0] text-white hover:bg-[#0CABA8]">
            <Folder className="h-4 w-4" /> Create Project
          </Link>
          <Link href={inviteHref} className="inline-flex items-center gap-2 px-4 py-2 rounded border border-[#0CABA8]/40 text-[#015958] hover:bg-[#F6FFFE]">
            <UserPlus className="h-4 w-4" /> Add Members
          </Link>
        </div>
        <Link
          href={settingsHref}
          aria-label="Workspace Settings"
          className="ml-auto inline-flex items-center justify-center size-9 rounded-full border border-[#0CABA8]/40 text-[#015958] hover:bg-[#F6FFFE]"
          title="Workspace Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>
      {/* Invite form moved to /workspace/invite */}
      {/* Removed large icon tiles to avoid duplication; top CTAs already provide icon actions */}

      {/* Activity (real notifications if available) */}
      <div className="md:col-span-2 bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20 flex flex-col">
        <h2 className="text-lg font-bold text-[#0FC2C0] mb-4 flex items-center gap-2"><ActivityIcon className="h-5 w-5" /> Activity</h2>
        {(!notifications || notifications.length === 0) ? (
          <div className="text-[#0CABA8] text-sm">No recent activity.</div>
        ) : (
          <ul className="space-y-2 w-full">
            {notifications.slice(0,8).map((n: any, idx: number) => {
              const title = n?.title || n?.subject || n?.type || "Notification";
              const body = n?.body || n?.message || n?.description || "";
              const timeRaw = n?.created_at || n?.createdAt || n?.time || n?.timestamp;
              const timeStr = timeRaw ? new Date(timeRaw).toLocaleString() : "";
              return (
                <li key={n?.id ?? idx} className="text-[#015958] text-sm flex items-center gap-2">
                  <span className="font-semibold text-[#0FC2C0]">{title}</span>
                  {body && <span className="truncate">{body}</span>}
                  {timeStr && <span className="ml-auto text-xs text-[#0CABA8]">{timeStr}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Compact lists: Projects and Tasks/Notes */}
      <div className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
        <h2 className="text-lg font-bold text-[#0FC2C0] mb-3 flex items-center gap-2"><Folder className="h-5 w-5" /> Projects in this workspace</h2>
        {(!projectsList || projectsList.length === 0) ? (
          <div className="text-[#0CABA8] text-sm">No projects yet.</div>
        ) : (
          <ul className="space-y-2">
            {projectsList.slice(0,5).map((p: any) => {
              const href = wsId != null ? `/projects/${p.id}?ws=${wsId}` : `/projects/${p.id}`;
              return (
                <li key={p.id}>
                  <Link href={href} className="text-[#015958] text-sm flex items-center gap-2 hover:underline">
                    <span className="font-medium">{p.name || `Project #${p.id}`}</span>
                    {p.status && <span className="ml-auto text-xs text-[#0CABA8] capitalize">{p.status}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-3">
          <Link href={projectsHref} className="text-[#0FC2C0] hover:underline text-sm">View all projects</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
        <h2 className="text-lg font-bold text-[#0FC2C0] mb-3 flex items-center gap-2"><CheckSquare className="h-5 w-5" /> Tasks and <FileText className="h-5 w-5" /> Notes</h2>
        <div>
          <div className="text-[#015958] font-semibold mb-2">Tasks</div>
          {(!tasksList || tasksList.length === 0) ? (
            <div className="text-[#0CABA8] text-sm mb-3">No tasks yet.</div>
          ) : (
            <ul className="space-y-2 mb-3">
              {tasksList.slice(0,5).map((t: any) => {
                const href = wsId != null ? `/tasks/${t.id}?ws=${wsId}` : `/tasks/${t.id}`;
                return (
                  <li key={t.id}>
                    <Link href={href} className="text-[#015958] text-sm flex items-center gap-2 hover:underline">
                      <span className="font-medium">{t.title || t.name || `Task #${t.id}`}</span>
                      {t.status && <span className="ml-auto text-xs text-[#0CABA8] capitalize">{t.status}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div>
            <Link href={wsId != null ? `/tasks?ws=${wsId}` : "/tasks"} className="text-[#0FC2C0] hover:underline text-sm">View all tasks</Link>
          </div>
        </div>
        <div>
          <div className="text-[#015958] font-semibold mb-2">Notes</div>
          {(!notesList || notesList.length === 0) ? (
            <div className="text-[#0CABA8] text-sm">No notes yet.</div>
          ) : (
            <ul className="space-y-2">
              {notesList.slice(0,5).map((n: any) => {
                const href = wsId != null ? `/notes/${n.id}?ws=${wsId}` : `/notes/${n.id}`;
                return (
                  <li key={n.id}>
                    <Link href={href} className="text-[#015958] text-sm flex items-center gap-2 hover:underline">
                      <span className="font-medium">{n.title || `Note #${n.id}`}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3">
            <Link href={wsId != null ? `/notes?ws=${wsId}` : "/notes"} className="text-[#0FC2C0] hover:underline text-sm">View all notes</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 