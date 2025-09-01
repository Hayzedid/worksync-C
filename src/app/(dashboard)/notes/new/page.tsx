"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../api";
import { FileText } from "lucide-react";
import { useToast } from "../../../../components/toast";

export default function NewNotePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const wsIdFromUrl = searchParams?.get('ws');
  const projectFromUrl = searchParams?.get('project');
  const projectId = projectFromUrl ? (Number.isFinite(parseInt(projectFromUrl, 10)) ? parseInt(projectFromUrl, 10) : null) : null;
  const [currentWsId, setCurrentWsId] = useState<string | null>(null);

  useEffect(() => {
    const ss = typeof window !== 'undefined' ? sessionStorage.getItem('current_workspace_id') : null;
    setCurrentWsId(wsIdFromUrl || ss);
  }, [wsIdFromUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Clean payload: convert undefined to null for all fields
      const rawBody = projectId != null ? { title, content, project_id: projectId } : { title, content };
      const body = Object.fromEntries(
        Object.entries(rawBody).map(([k, v]) => [k, v === undefined ? null : v])
      );
      await api.post(
        "/notes",
        body,
        currentWsId != null
          ? { params: { ws: currentWsId } }
          : undefined
      );
      addToast({ title: "Note created", description: title, variant: "success" });
      if (currentWsId != null) {
        router.push(`/notes?ws=${currentWsId}`);
      } else {
        router.push("/notes");
      }
    } catch (err: unknown) {
      const maybe = (err as Record<string, unknown>)?.message;
      const msg = typeof maybe === 'string' ? maybe : "Failed to create note";
      setError(msg);
      addToast({ title: "Failed to create note", description: typeof maybe === 'string' ? maybe : "", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0FC2C0] flex items-center gap-2"><FileText className="h-5 w-5" /> New Note</h1>
          <Link href="/notes" className="text-[#0CABA8] hover:underline">Back</Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="note-title" className="block text-[#015958] font-semibold mb-1">Title</label>
            <input id="note-title" name="title" autoComplete="off" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" required />
          </div>
          <div>
            <label htmlFor="note-content" className="block text-[#015958] font-semibold mb-1">Content</label>
            <textarea id="note-content" name="content" autoComplete="off" value={content} onChange={e => setContent(e.target.value)} rows={6} className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div className="flex items-center justify-end gap-3">
            <Link href="/notes" className="px-4 py-2 rounded border border-[#0CABA8]/40 text-[#015958] bg-white hover:bg-[#F6FFFE]">Cancel</Link>
            <button disabled={loading} className="bg-[#0FC2C0] text-white px-4 py-2 rounded font-semibold hover:bg-[#0CABA8] disabled:opacity-70">
              {loading ? "Creating..." : "Create Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

