"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Plus, Folder, Loader2 } from "lucide-react";
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
        const list: any[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.workspaces)
          ? (data as any).workspaces
          : [];
        const mapped = list
          .map((w: any) => ({ id: w?.id ?? w?.workspaceId ?? w?.workspace_id, name: w?.name ?? `Workspace #${w?.id}` , description: w?.description ?? null}))
          .filter((w: any) => w.id != null);
        if (mounted) setItems(mapped as Workspace[]);
      } catch (e: any) {
        const msg = e?.message || "Failed to load workspaces";
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
    try {
      const payload: any = { name: newName.trim() };
      if (newDesc.trim()) payload.description = newDesc.trim();
      const created = await api.post("/workspaces", payload);
      const wsId = created?.id ?? created?.workspaceId ?? created?.workspace_id ?? created?.workspace?.id;
      // Refresh list
      const data = await api.get("/workspaces");
      const list: any[] = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.workspaces)
        ? (data as any).workspaces
        : [];
      const mapped = list
        .map((w: any) => ({ id: w?.id ?? w?.workspaceId ?? w?.workspace_id, name: w?.name ?? `Workspace #${w?.id}` , description: w?.description ?? null}))
        .filter((w: any) => w.id != null) as Workspace[];
      setItems(mapped);
      setNewName("");
      setNewDesc("");
      if (wsId != null) {
        if (typeof window !== "undefined") sessionStorage.setItem("current_workspace_id", String(wsId));
        router.push(`/workspace?ws=${wsId}`);
      }
    } catch (e: any) {
      const msg = e?.message || "Failed to create workspace";
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
            className="flex-1 px-3 py-2 rounded border border-[#0CABA8]/40 text-[#015958]"
            placeholder="Create a new workspace"
            name="workspace_name"
            id="workspace-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          />
          <input
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
