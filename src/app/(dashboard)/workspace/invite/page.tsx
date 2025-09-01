"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../api";
import { UserPlus } from "lucide-react";
import { useToast } from "../../../../components/toast";

export default function InviteMemberPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [wsId, setWsId] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    const fromUrl = searchParams?.get('ws');
    if (fromUrl) {
      const n = parseInt(fromUrl, 10);
      if (Number.isFinite(n)) {
        setWsId(n);
        if (typeof window !== 'undefined') sessionStorage.setItem('current_workspace_id', String(n));
        return;
      }
    }
    const ss = typeof window !== 'undefined' ? sessionStorage.getItem('current_workspace_id') : null;
    if (ss) setWsId(parseInt(ss, 10));
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!wsId) throw new Error("No workspace context");
      const normalized = email.trim().toLowerCase();
      // Clean payload: convert undefined to null for all fields
      const rawBody = { workspace_id: Number(wsId), email: normalized };
      const body = Object.fromEntries(
        Object.entries(rawBody).map(([k, v]) => [k, v === undefined ? null : v])
      );
      await api.post("/workspaces/invite", body);
      addToast({ title: "Invitation sent", description: normalized, variant: "success" });
      router.push(`/workspace?ws=${wsId}`);
    } catch (err: unknown) {
      const maybe = (err as Record<string, unknown>)?.message;
      const msg = typeof maybe === 'string' ? maybe : "Failed to send invite";
      setError(msg);
      addToast({ title: "Invite failed", description: typeof maybe === 'string' ? maybe : "", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0FC2C0] flex items-center gap-2"><UserPlus className="h-5 w-5" /> Invite Member</h1>
          <Link href={wsId != null ? `/workspace?ws=${wsId}` : "/workspace"} className="text-[#0CABA8] hover:underline">Back</Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-[#015958] font-semibold mb-1">Email</label>
            <input id="invite-email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" required />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <button disabled={loading} className="bg-[#0FC2C0] text-white px-4 py-2 rounded font-semibold hover:bg-[#0CABA8]">
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </form>
      </div>
    </div>
  );
}


