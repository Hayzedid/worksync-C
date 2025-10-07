"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, UserPlus, Loader2, Settings } from "lucide-react";
import { api } from "../../../../api";

interface Member {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export default function WorkspaceMembersPage() {
  const [wsId, setWsId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

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
    router.replace('/workspaces');
  }, [searchParams, router]);

  const { data: members = [], isLoading, error } = useQuery<Member[]>({
    queryKey: ["workspace-members", wsId],
    queryFn: async () => {
      if (wsId == null) return [];
      try {
        const response = await api.get(`/workspaces/${wsId}/members`);
        return Array.isArray(response) ? response : response?.members || [];
      } catch (err) {
        console.error('Failed to fetch workspace members:', err);
        return [];
      }
    },
    enabled: wsId != null,
    staleTime: 30_000,
  });

  const inviteHref = wsId != null ? `/workspace/invite?ws=${wsId}` : "/workspace/invite";
  const workspaceHref = wsId != null ? `/workspace?ws=${wsId}` : "/workspace";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6FFFE] p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-[#0FC2C0]" />
            <span className="text-[#015958]">Loading members...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 border border-[#0CABA8]/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={workspaceHref} className="text-[#0CABA8] hover:underline">← Back to Workspace</Link>
            <h1 className="text-2xl font-bold text-[#0FC2C0] flex items-center gap-2">
              <Users className="h-5 w-5" /> Members ({members.length})
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href={wsId != null ? `/workspace/settings?ws=${wsId}` : "/workspace/settings"}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#0CABA8]/40 text-[#015958] rounded hover:bg-[#F6FFFE] hover:shadow-sm transition-all duration-200"
              title="Workspace Settings"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <Link href={inviteHref} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors">
              <UserPlus className="h-4 w-4" /> Invite Member
            </Link>
          </div>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load workspace members</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8]"
            >
              Try Again
            </button>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-[#0CABA8]/50 mx-auto mb-4" />
            <p className="text-[#015958] mb-4">No members found in this workspace</p>
            <Link href={inviteHref} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors">
              <UserPlus className="h-4 w-4" /> Invite First Member
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-[#0CABA8]/20">
            {members.map((member) => (
              <li key={member.id} className="py-4 flex items-center gap-3 text-[#015958]">
                <span className="rounded-full bg-[#0FC2C0]/20 w-10 h-10 flex items-center justify-center font-bold text-[#0FC2C0]">
                  {member.first_name?.[0]?.toUpperCase() || '?'}{member.last_name?.[0]?.toUpperCase() || ''}
                </span>
                <div className="flex-1">
                  <div className="font-semibold">{member.first_name} {member.last_name}</div>
                  <div className="text-sm text-[#0CABA8]">{member.email}</div>
                  <div className="text-xs text-[#0CABA8] flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                      member.role === 'owner' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${member.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>{member.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                {/* Admin actions placeholder */}
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs rounded border border-[#0CABA8]/40 text-[#015958] bg-white hover:bg-[#F6FFFE] transition-colors">
                    Edit Role
                  </button>
                  {member.role !== 'owner' && (
                    <button className="px-3 py-1 text-xs rounded border border-red-200 text-red-700 bg-white hover:bg-red-50 transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
