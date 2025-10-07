"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from '../../../../components/Button';
import { 
  Building2, 
  Palette, 
  Globe, 
  Save,
  UserPlus,
  Users,
  Trash2,
  Eye,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import Link from "next/link";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import { useAuth } from "../../../../hooks/useAuth";
import { api } from "../../../../api";
import { useToast } from "../../../../components/toast";

export default function WorkspaceSettingsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [deleteWorkspaceConfirm, setDeleteWorkspaceConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<any>(null);
  const [wsId, setWsId] = useState<number | null>(null);
  
  // Workspace form state
  const [workspaceForm, setWorkspaceForm] = useState({
    name: "",
    description: ""
  });
  
  const [theme, setTheme] = useState("Light");

  // Get workspace ID from URL params or sessionStorage
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
    // No workspace context, redirect to workspaces list
    router.replace('/workspaces');
  }, [searchParams, router]);

  // Load current workspace data
  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!wsId) return;
      try {
        const workspace = await api.get(`/workspaces/${wsId}`);
        setCurrentWorkspace(workspace);
        setWorkspaceForm({
          name: workspace.name || "",
          description: workspace.description || ""
        });
      } catch (error) {
        console.error('Failed to fetch workspace:', error);
        addToast({
          title: "Error",
          description: "Failed to load workspace settings.",
          variant: "error"
        });
      }
    };
    fetchWorkspace();
  }, [wsId, addToast]);

  const handleDeleteWorkspace = async () => {
    if (!wsId) return;
    setLoading(true);
    try {
      await api.delete(`/workspaces/${wsId}`);
      addToast({
        title: "Workspace Deleted",
        description: "The workspace has been permanently deleted.",
        variant: "success"
      });
      router.replace('/workspaces');
    } catch (error: any) {
      addToast({
        title: "Delete Failed",
        description: error?.response?.data?.message || "Failed to delete workspace.",
        variant: "error"
      });
    } finally {
      setLoading(false);
      setDeleteWorkspaceConfirm(false);
    }
  };

  const handleSaveWorkspace = async () => {
    if (!wsId) return;
    setLoading(true);
    try {
      await api.patch(`/workspaces/${wsId}`, {
        name: workspaceForm.name,
        description: workspaceForm.description
      });
      
      // Update current workspace state
      setCurrentWorkspace((prev: any) => ({
        ...prev,
        name: workspaceForm.name,
        description: workspaceForm.description
      }));
      
      addToast({
        title: "Workspace Updated",
        description: "Workspace settings have been saved.",
        variant: "success"
      });
    } catch (error: any) {
      addToast({
        title: "Update Failed",
        description: error?.response?.data?.message || "Failed to update workspace settings.",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const workspaceHref = wsId != null ? `/workspace?ws=${wsId}` : "/workspace";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6FFFE] to-[#E8FFFE] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href={workspaceHref}
              className="flex items-center gap-2 text-[#0CABA8] hover:text-[#015958] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Workspace
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-[#015958] mb-2">Workspace Settings</h1>
          <p className="text-[#0CABA8] text-lg">
            Manage settings for {currentWorkspace?.name || 'this workspace'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-[#0CABA8]/10 overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#0CABA8]/10 bg-gradient-to-r from-[#F6FFFE] to-white p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0FC2C0]/10 rounded-lg">
                <Building2 className="h-6 w-6 text-[#0FC2C0]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#015958]">Workspace Configuration</h2>
                <p className="text-[#0CABA8] text-sm">
                  Update workspace details and manage team access
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="workspace-name" className="flex items-center gap-2 text-[#015958] font-semibold mb-2">
                    <Building2 className="h-4 w-4" />
                    Workspace Name
                  </label>
                  <input 
                    id="workspace-name" 
                    type="text"
                    placeholder="Enter workspace name" 
                    className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-[#015958] bg-[#F6FFFE] transition-all duration-200" 
                    value={workspaceForm.name}
                    onChange={(e) => setWorkspaceForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="workspace-description" className="flex items-center gap-2 text-[#015958] font-semibold mb-2">
                    <Globe className="h-4 w-4" />
                    Description
                  </label>
                  <textarea 
                    id="workspace-description" 
                    placeholder="Describe your workspace" 
                    className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-[#015958] bg-[#F6FFFE] transition-all duration-200" 
                    rows={3}
                    value={workspaceForm.description}
                    onChange={(e) => setWorkspaceForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="workspace-theme" className="flex items-center gap-2 text-[#015958] font-semibold mb-2">
                    <Palette className="h-4 w-4" />
                    Theme Preference
                  </label>
                  <select 
                    id="workspace-theme" 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-[#015958] bg-white transition-all duration-200"
                  >
                    <option>Light</option>
                    <option>Dark</option>
                    <option>Auto</option>
                  </select>
                </div>
              </div>

              {/* Member Management Section */}
              <div className="border-t border-[#0CABA8]/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#015958] flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Members
                    </h3>
                    <p className="text-[#0CABA8] text-sm">Manage workspace access and permissions</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link 
                    href={`/workspace/members${wsId ? `?ws=${wsId}` : ''}`}
                    className="flex items-center gap-3 p-4 bg-[#F6FFFE] rounded-lg border border-[#0CABA8]/10 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="p-2 bg-[#0FC2C0]/10 rounded-lg group-hover:bg-[#0FC2C0]/20 transition-colors">
                      <Eye className="h-4 w-4 text-[#0FC2C0]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#015958]">View Members</div>
                      <div className="text-sm text-[#0CABA8]">See all workspace members</div>
                    </div>
                  </Link>
                  <Link 
                    href={`/workspace/invite${wsId ? `?ws=${wsId}` : ''}`}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#0FC2C0]/5 to-[#0CABA8]/5 rounded-lg border border-[#0FC2C0]/20 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="p-2 bg-[#0FC2C0]/10 rounded-lg group-hover:bg-[#0FC2C0]/20 transition-colors">
                      <UserPlus className="h-4 w-4 text-[#0FC2C0]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#015958]">Invite Member</div>
                      <div className="text-sm text-[#0CABA8]">Add new team members</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Save Changes */}
              <div className="flex justify-end border-t border-[#0CABA8]/10 pt-6">
                <Button 
                  onClick={handleSaveWorkspace}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#0FC2C0] to-[#0CABA8] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-red-200 pt-6">
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h3>
                      <p className="text-red-700 text-sm mb-4">
                        Deleting a workspace is permanent and will remove all projects, tasks, notes, and member access. This action cannot be undone.
                      </p>
                      <button 
                        onClick={() => setDeleteWorkspaceConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Workspace
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmDialog
        open={deleteWorkspaceConfirm}
        title="Delete Workspace"
        description="This action will permanently delete the workspace and all its projects, tasks, and notes. This cannot be undone."
        confirmLabel="Delete Workspace"
        cancelLabel="Cancel"
        onConfirm={handleDeleteWorkspace}
        onCancel={() => setDeleteWorkspaceConfirm(false)}
      />
    </div>
  );
}
