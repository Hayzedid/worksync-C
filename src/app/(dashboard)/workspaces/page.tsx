"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Plus, Loader2 } from "lucide-react";
import { api } from "../../../api";

type Workspace = { id: number; name: string; description?: string | null };

export default function WorkspacesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Workspace[]>([]);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Load on mount if authenticated
  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("access_token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get("/workspaces");
        const list: unknown[] = Array.isArray(data)
          ? (data as unknown[])
          : (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)['workspaces']))
          ? ((data as Record<string, unknown>)['workspaces'] as unknown[])
          : [];
        const mapped = list
          .map((w: unknown) => {
            const ww = w as Record<string, unknown> | null;
            const id = ww?.id ?? ww?.workspaceId ?? ww?.workspace_id;
            const name = ww?.name ?? (id != null ? `Workspace #${id}` : undefined);
            const description = ww?.description ?? null;
            return { id, name, description };
          })
          .filter((w) => (w.id != null));
        if (mounted) setItems(mapped.map(m => ({ id: Number(m.id), name: String(m.name ?? `Workspace #${m.id}`), description: m.description ?? null })) as Workspace[]);
      } catch (e: unknown) {
        const maybeMsg = (e as Record<string, unknown>)?.message;
        const msg = typeof maybeMsg === 'string' ? maybeMsg : "Failed to load workspaces";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      // Clean payload: convert undefined to null for all fields
      const rawPayload: Record<string, unknown> = { name: newName.trim() };
      if (newDesc.trim()) rawPayload.description = newDesc.trim();
      const payload = Object.fromEntries(
        Object.entries(rawPayload).map(([k, v]) => [k, v === undefined ? null : v])
      );
      const created = await api.post("/workspaces", payload);
      const wsId = (created as Record<string, unknown>)?.['id'] ?? (created as Record<string, unknown>)?.['workspaceId'] ?? (created as Record<string, unknown>)?.['workspace_id'] ?? ((created as Record<string, unknown>)?.['workspace'] as Record<string, unknown> | undefined)?.['id'];
      // Refresh list
      const data = await api.get("/workspaces");
      const list: unknown[] = Array.isArray(data)
        ? (data as unknown[])
        : (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)['workspaces']))
        ? ((data as Record<string, unknown>)['workspaces'] as unknown[])
        : [];
      const mapped = list
        .map((w: unknown) => {
          const ww = w as Record<string, unknown> | null;
          return { id: ww?.['id'] ?? ww?.['workspaceId'] ?? ww?.['workspace_id'], name: ww?.['name'] ?? `Workspace #${ww?.['id']}`, description: ww?.['description'] ?? null };
        })
        .filter((w) => w.id != null) as Workspace[];
      setItems(mapped);
      setNewName("");
      setNewDesc("");
      if (wsId != null) {
        if (typeof window !== "undefined") sessionStorage.setItem("current_workspace_id", String(wsId));
        router.push(`/workspace?ws=${wsId}`);
      }
    } catch (e: unknown) {
      const maybe = (e as Record<string, unknown>)?.message;
      const msg = typeof maybe === 'string' ? maybe : "Failed to create workspace";
      setError(msg);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#015958] mb-4">Workspaces</h1>

      <div className="bg-white rounded-xl border border-[#0CABA8]/30 p-4 mb-6">
        <div className="flex gap-2">
          <input
            aria-label="Workspace name"
            className="flex-1 px-3 py-2 rounded border border-[#0CABA8]/40 text-[#015958]"
            placeholder="Create a new workspace"
            name="workspace_name"
            id="workspace-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          />
          <input
            aria-label="Workspace description"
            className="flex-1 px-3 py-2 rounded border border-[#0CABA8]/40 text-[#015958]"
            placeholder="Description (optional)"
            name="workspace_description"
            id="workspace-description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-[#0FC2C0] text-white hover:bg-[#0CABA8] disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>Create</span>
          </button>
        </div>
        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
      </div>

      <div className="bg-white rounded-xl border border-[#0CABA8]/30">
        <div className="p-4 border-b border-[#0CABA8]/20 flex items-center justify-between">
          <div className="text-[#015958] font-semibold">Your Workspaces</div>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-[#0FC2C0]" />}
        </div>
        <div>
          {items.length === 0 && !loading ? (
            <div className="p-6 text-[#0CABA8]">No workspaces yet. Create one above.</div>
          ) : (
            <ul className="divide-y divide-[#0CABA8]/20">
              {items.map((w) => (
                <li key={w.id} className="p-0">
                  <Link
                    href={`/workspace?ws=${w.id}`}
                    onClick={() => {
                      if (typeof window !== "undefined") sessionStorage.setItem("current_workspace_id", String(w.id));
                    }}
                    className="block p-4 hover:bg-[#F6FFFE]"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-[#0FC2C0]" />
                      <div>
                        <div className="text-[#015958] font-medium">{w.name}</div>
                        {w.description ? (
                          <div className="text-sm text-[#0CABA8]">{w.description}</div>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
