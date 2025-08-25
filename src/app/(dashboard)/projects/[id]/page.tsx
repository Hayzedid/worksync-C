"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../api";
import { Folder, PlusCircle, FileText, Trash2 } from "lucide-react";
import { useToast } from "../../../../components/toast";

 type Task = { id: number; title: string; status?: string };
 type Note = { id: number; title: string; content?: string };
 type Project = { id: number; name: string; status?: string; tasks?: Task[]; notes?: Note[] };

 export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = id;
  const qc = useQueryClient();
  const router = useRouter();
  const { addToast } = useToast();

  const { data, isLoading, isError, refetch } = useQuery<any>({
    queryKey: ["project", projectId],
    queryFn: () => api.get(`/projects/${projectId}`),
  });

  const project: Project | null = data?.project || (data && !Array.isArray(data) ? data : null);

  // Fallback queries for project-scoped tasks and notes if backend doesn't embed them
  const { data: tasksData } = useQuery<any>({
    queryKey: ["projectTasks", projectId],
    queryFn: () => api.get(`/projects/${projectId}/tasks`),
    // still fetch; inexpensive and ensures resilience to varying API shapes
  });
  const { data: notesData } = useQuery<any>({
    queryKey: ["projectNotes", projectId],
    queryFn: () => api.get(`/projects/${projectId}/notes`),
  });

  const embeddedTasks: Task[] = Array.isArray(data?.tasks)
    ? data.tasks
    : Array.isArray(project?.tasks)
    ? (project!.tasks as Task[])
    : [];
  const embeddedNotes: Note[] = Array.isArray(data?.notes)
    ? data.notes
    : Array.isArray(project?.notes)
    ? (project!.notes as Note[])
    : [];

  const fallbackTasks: Task[] = Array.isArray(tasksData) ? tasksData : tasksData?.tasks ?? [];
  const fallbackNotes: Note[] = Array.isArray(notesData) ? notesData : notesData?.notes ?? [];

  const viewTasks: Task[] = embeddedTasks.length ? embeddedTasks : fallbackTasks;
  const viewNotes: Note[] = embeddedNotes.length ? embeddedNotes : fallbackNotes;

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("todo");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Project status editing
  const [projStatus, setProjStatus] = useState<string>("active");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusSuccess, setStatusSuccess] = useState("");

  useEffect(() => {
    if (project?.status) {
      setProjStatus(String(project.status).toLowerCase());
    }
  }, [project?.status]);

  async function handleDeleteTask(taskId: number) {
    try {
      await api.delete(`/tasks/${taskId}`);
      await qc.invalidateQueries({ queryKey: ["project", projectId] });
      await qc.refetchQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      addToast({ title: "Task deleted", variant: "success" });
    } catch (err) {
      addToast({ title: "Failed to delete task", variant: "error" });
    }
  }

  async function handleDeleteNote(noteId: number) {
    try {
      await api.delete(`/notes/${noteId}`);
      await qc.invalidateQueries({ queryKey: ["project", projectId] });
      await qc.refetchQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["notes"] });
      addToast({ title: "Note deleted", variant: "success" });
    } catch (err) {
      addToast({ title: "Failed to delete note", variant: "error" });
    }
  }

  async function handleUpdateProjectStatus(e: React.FormEvent) {
    e.preventDefault();
    setStatusError("");
    setStatusSuccess("");
    setUpdatingStatus(true);
    try {
      await api.put(`/projects/${projectId}`, { status: projStatus });
      await qc.invalidateQueries({ queryKey: ["project", projectId] });
      await qc.refetchQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      setStatusSuccess("Status updated");
      addToast({ title: "Project updated", description: `Status set to ${projStatus}`, variant: "success" });
      setTimeout(() => setStatusSuccess(""), 1500);
    } catch (err: any) {
      setStatusError(err?.message || "Failed to update status");
      addToast({ title: "Failed to update status", description: err?.message || "", variant: "error" });
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post(`/projects/${projectId}/tasks`, { title, status });
      setTitle("");
      setStatus("todo");
      await qc.invalidateQueries({ queryKey: ["project", projectId] });
      await qc.refetchQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      addToast({ title: "Task created", description: title, variant: "success" });
    } catch (err: any) {
      setError(err.message || "Failed to create task");
      addToast({ title: "Failed to create task", description: err?.message || "", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteError, setNoteError] = useState("");

  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault();
    setNoteError("");
    setNoteSubmitting(true);
    try {
      await api.post(`/projects/${projectId}/notes`, { title: noteTitle, content: noteContent });
      setNoteTitle("");
      setNoteContent("");
      await qc.invalidateQueries({ queryKey: ["project", projectId] });
      await qc.refetchQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["notes"] });
      addToast({ title: "Note created", description: noteTitle, variant: "success" });
    } catch (err: any) {
      setNoteError(err.message || "Failed to create note");
      addToast({ title: "Failed to create note", description: err?.message || "", variant: "error" });
    } finally {
      setNoteSubmitting(false);
    }
  }

  if (isLoading) return <div className="p-8 text-[#015958]">Loading...</div>;
  if (isError) return <div className="p-8 text-red-500">Failed to load project</div>;
  if (!project) return <div className="p-8 text-[#0CABA8]">Project not found.</div>;

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Folder className="h-7 w-7 text-[#0FC2C0]" />
            <div>
              <h1 className="text-3xl font-bold text-[#0FC2C0]">{project.name}</h1>
              {project.status && <div className="text-xs text-[#0CABA8]">{project.status}</div>}
            </div>
          </div>
          <Link href="/projects" className="text-[#0CABA8] hover:underline">Back to Projects</Link>
        </div>

        {/* Project status editor */}
        <div className="bg-white rounded-xl shadow border border-[#0CABA8]/20 p-4 mb-6">
          <form onSubmit={handleUpdateProjectStatus} className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-[#015958] font-semibold mb-1">Project status</label>
              <select
                value={projStatus}
                onChange={(e) => setProjStatus(e.target.value.toLowerCase())}
                className="px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]"
              >
                <option value="active">Active</option>
                <option value="planning">Planning</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <button
              disabled={updatingStatus}
              className="bg-[#0FC2C0] text-white px-4 py-2 rounded font-semibold hover:bg-[#0CABA8]"
            >
              {updatingStatus ? "Updating..." : "Update"}
            </button>
            {statusError && <div className="text-red-500 text-sm">{statusError}</div>}
            {statusSuccess && <div className="text-green-600 text-sm">{statusSuccess}</div>}
          </form>
        </div>

        {/* Two-column layout on desktop: Tasks (left) and Notes (right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Tasks list + Create task */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow border border-[#0CABA8]/20 p-6">
              <h2 className="text-xl font-semibold text-[#015958] mb-4">Tasks</h2>
              {viewTasks.length === 0 ? (
                <div className="text-[#0CABA8]">No tasks yet.</div>
              ) : (
                <ul className="space-y-3">
                  {viewTasks.map(t => (
                    <li key={t.id} className="flex items-center justify-between border border-[#0CABA8]/20 rounded-md px-4 py-2">
                      <span className="text-[#015958]">{t.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#0CABA8]">{t.status ?? "todo"}</span>
                        <button
                          onClick={() => handleDeleteTask(t.id)}
                          className="text-red-600 hover:text-red-700"
                          type="button"
                          aria-label="Delete task"
                          title="Delete task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white rounded-xl shadow border border-[#0CABA8]/20 p-6">
              <h2 className="text-xl font-semibold text-[#015958] mb-4 flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> New Task
              </h2>
              <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-[#015958] font-semibold mb-1">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]"
                    placeholder="e.g., Setup repository"
                  />
                </div>
                <div>
                  <label className="block text-[#015958] font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]"
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                {error && <div className="text-red-500 md:col-span-3">{error}</div>}
                <button
                  disabled={submitting}
                  className="bg-[#0FC2C0] text-white px-4 py-2 rounded font-semibold hover:bg-[#0CABA8] md:col-span-3 md:w-max"
                >
                  {submitting ? "Creating..." : "Create Task"}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Notes list + Create note */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow border border-[#0CABA8]/20 p-6">
              <h2 className="text-xl font-semibold text-[#015958] mb-4">Notes</h2>
              {viewNotes.length === 0 ? (
                <div className="text-[#0CABA8]">No notes yet.</div>
              ) : (
                <ul className="space-y-3">
                  {viewNotes.map(n => (
                    <li key={n.id} className="flex items-center justify-between border border-[#0CABA8]/20 rounded-md px-4 py-2">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-[#0FC2C0]" />
                        <span className="text-[#015958] font-medium">{n.title}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-red-600 hover:text-red-700"
                        type="button"
                        aria-label="Delete note"
                        title="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="bg-white rounded-xl shadow border border-[#0CABA8]/20 p-6">
              <h2 className="text-xl font-semibold text-[#015958] mb-4 flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> New Note
              </h2>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div>
                  <label className="block text-[#015958] font-semibold mb-1">Title</label>
                  <input
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]"
                    placeholder="e.g., Kickoff agenda"
                  />
                </div>
                <div>
                  <label className="block text-[#015958] font-semibold mb-1">Content</label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]"
                    placeholder="Write your note..."
                  />
                </div>
                {noteError && <div className="text-red-500">{noteError}</div>}
                <button
                  disabled={noteSubmitting}
                  className="bg-[#0FC2C0] text-white px-4 py-2 rounded font-semibold hover:bg-[#0CABA8]"
                >
                  {noteSubmitting ? "Creating..." : "Create Note"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
 }
