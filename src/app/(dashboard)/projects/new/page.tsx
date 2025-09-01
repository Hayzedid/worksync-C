"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../api";
import { FolderPlus } from "lucide-react";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const wsParam = searchParams.get("ws");
  const wsIdFromUrl = (() => {
    if (!wsParam) return null;
    const n = parseInt(wsParam, 10);
    return Number.isFinite(n) ? n : null;
  })();
  const [currentWsId, setCurrentWsId] = useState<number | null>(null);
  useEffect(() => {
    if (wsIdFromUrl != null) {
      setCurrentWsId(wsIdFromUrl);
      if (typeof window !== "undefined") sessionStorage.setItem("current_workspace_id", String(wsIdFromUrl));
      return;
    }
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("current_workspace_id");
      if (stored) {
        const n = parseInt(stored, 10);
        if (Number.isFinite(n)) setCurrentWsId(n);
      }
    }
  }, [wsIdFromUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Clean payload: convert undefined to null for all fields
      const rawBody = { name, status: status?.toLowerCase() } as Record<string, unknown>;
      const body = Object.fromEntries(
        Object.entries(rawBody).map(([k, v]) => [k, v === undefined ? null : v])
      );
      const created = await api.post(
        "/projects",
        body,
        currentWsId != null
          ? { params: { ws: currentWsId } }
          : undefined
      );
      const id = created?.id || created?.project?.id || created?.data?.id;
      const wsId = created?.workspaceId || created?.workspace_id || created?.workspace?.id || currentWsId;
      // Prefer redirect to workspace-scoped list so it appears immediately
      if (wsId != null) {
        router.push(`/workspace/projects?ws=${wsId}`);
      } else if (id) {
        router.push(`/projects/${id}`);
      } else {
        router.push("/workspace/projects");
      }
    } catch (err: unknown) {
      const maybe = (err as Record<string, unknown>)?.message;
      setError(typeof maybe === 'string' ? maybe : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0FC2C0] flex items-center gap-2"><FolderPlus className="h-5 w-5" /> New Project</h1>
          <Link href="/projects" className="text-[#0CABA8] hover:underline">Back</Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#015958] font-semibold mb-1">Name</label>
            <input aria-label="Project name" placeholder="e.g., Website Redesign" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" required />
          </div>
          <div>
            <label className="block text-[#015958] font-semibold mb-1">Status</label>
            <select aria-label="Project status" value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]">
              <option>Active</option>
              <option>Planning</option>
              <option>Completed</option>
              <option>Archived</option>
            </select>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button disabled={loading} className="bg-[#0FC2C0] text-white px-4 py-2 rounded font-semibold hover:bg-[#0CABA8]">
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}


