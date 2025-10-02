"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../api";
import { Plus, Calendar, Clock, ChevronDown, ChevronUp, Mail } from "lucide-react";
import { useToast } from "../../../../components/toast";
import StatusSelect from "../../../../components/StatusSelect";

export default function NewTaskPage() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("todo");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState("medium");
  const [emailReminders, setEmailReminders] = useState(true);
  const [deadlineExpanded, setDeadlineExpanded] = useState(false);
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
      // Validate required fields
      if (!title.trim()) {
        throw new Error("Task title is required");
      }

      // Handle due date/time
      let dueDateISO = null;
      if (dueDate) {
        const timeValue = dueTime || "23:59"; // Default to end of day if no time specified
        const dateTimeString = `${dueDate}T${timeValue}`;
        const parsedDate = new Date(dateTimeString);
        
        if (isNaN(parsedDate.getTime())) {
          throw new Error("Invalid due date/time");
        }
        
        // Check if due date is in the past
        if (parsedDate < new Date()) {
          throw new Error("Due date cannot be in the past");
        }
        
        dueDateISO = parsedDate.toISOString();
      }

      // Build request payload
      const rawBody = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        due_date: dueDateISO,
        email_reminders: emailReminders,
        ...(projectId != null ? { project_id: projectId } : {}),
        ...(currentWsId != null ? { workspace_id: parseInt(currentWsId, 10) } : {})
      };

      // Clean payload: convert undefined to null for all fields
      const body = Object.fromEntries(
        Object.entries(rawBody).map(([k, v]) => [k, v === undefined ? null : v])
      );

      await api.post("/tasks", body);

      const successMessage = dueDate 
        ? `Task created with deadline: ${new Date(dueDateISO!).toLocaleDateString()}`
        : "Task created successfully";
        
      addToast({ 
        title: "Task created", 
        description: successMessage, 
        variant: "success" 
      });

      if (currentWsId != null) {
        router.push(`/tasks?ws=${currentWsId}`);
      } else {
        router.push("/tasks");
      }
    } catch (err: unknown) {
      const maybe = (err as Record<string, unknown>)?.message;
      const msg = typeof maybe === 'string' ? maybe : "Failed to create task";
      setError(msg);
      addToast({ title: "Failed to create task", description: typeof maybe === 'string' ? maybe : "", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-[#0CABA8]/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0FC2C0] flex items-center gap-2">
            <Plus className="h-6 w-6" /> New Task
          </h1>
          <Link href={currentWsId != null ? `/tasks?ws=${currentWsId}` : "/tasks"} 
                className="text-[#0CABA8] hover:underline transition-colors">
            Back to Tasks
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Task Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-[#015958] font-semibold mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input 
                aria-label="Task title" 
                placeholder="e.g., Setup repository for new project" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-[#015958] bg-[#F6FFFE] transition-all"
              />
            </div>

            <div>
              <label className="block text-[#015958] font-semibold mb-2">Description</label>
              <textarea 
                aria-label="Task description"
                placeholder="Add more details about this task..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-[#015958] bg-[#F6FFFE] resize-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#015958] font-semibold mb-2">Status</label>
                <StatusSelect 
                  value={status} 
                  onChange={setStatus}
                  projectId={projectId}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[#015958] font-semibold mb-2">Priority</label>
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  title="Select task priority level"
                  className="w-full px-4 py-3 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-[#015958] bg-[#F6FFFE] transition-all"
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="high">🟠 High Priority</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Collapsible Deadline Section */}
          <div className="border border-[#0CABA8]/20 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setDeadlineExpanded(!deadlineExpanded)}
              className="w-full px-4 py-3 bg-[#F6FFFE] hover:bg-[#0CABA8]/10 flex items-center justify-between text-[#015958] font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Deadline & Reminders
                {dueDate && (
                  <span className="text-sm text-[#0CABA8] font-normal">
                    (Due: {new Date(`${dueDate}T${dueTime || '23:59'}`).toLocaleDateString()})
                  </span>
                )}
              </div>
              {deadlineExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>

            {deadlineExpanded && (
              <div className="p-4 space-y-4 bg-white border-t border-[#0CABA8]/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#015958] font-medium mb-2">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Due Date
                    </label>
                    <input 
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      title="Select due date for this task"
                      placeholder="Select due date"
                      className="w-full px-3 py-2 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-[#015958] bg-[#F6FFFE] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[#015958] font-medium mb-2">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Due Time
                    </label>
                    <input 
                      type="time"
                      value={dueTime}
                      onChange={e => setDueTime(e.target.value)}
                      disabled={!dueDate}
                      title="Select due time for this task"
                      placeholder="Select time"
                      className="w-full px-3 py-2 rounded-lg border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-[#015958] bg-[#F6FFFE] disabled:opacity-50 disabled:bg-gray-100 transition-all"
                    />
                  </div>
                </div>

                {dueDate && (
                  <div className="bg-[#F6FFFE] p-3 rounded-lg border border-[#0CABA8]/20">
                    <label className="flex items-start gap-3">
                      <input 
                        type="checkbox"
                        checked={emailReminders}
                        onChange={e => setEmailReminders(e.target.checked)}
                        className="mt-1 h-4 w-4 text-[#0FC2C0] focus:ring-[#0FC2C0] border-[#0CABA8]/30 rounded transition-all"
                      />
                      <div>
                        <div className="text-[#015958] font-medium flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Email Reminders
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Get automatic email notifications 24 hours and 1 hour before the deadline.
                          This helps ensure you never miss important tasks!
                        </div>
                      </div>
                    </label>
                  </div>
                )}

                {dueDate && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <strong>💡 Smart Reminders:</strong> When enabled, you'll receive:
                    <ul className="mt-1 ml-4 list-disc">
                      <li>24-hour advance notice to help you plan</li>
                      <li>1-hour final reminder for last-minute preparation</li>
                      <li>Professional emails with direct links to your task</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-4">
            <Link 
              href={currentWsId != null ? `/tasks?ws=${currentWsId}` : "/tasks"} 
              className="px-6 py-3 rounded-lg border border-[#0CABA8]/40 text-[#015958] bg-white hover:bg-[#F6FFFE] transition-colors font-medium"
            >
              Cancel
            </Link>
            <button 
              disabled={loading} 
              className="bg-gradient-to-r from-[#0FC2C0] to-[#0CABA8] text-white px-8 py-3 rounded-lg font-semibold hover:from-[#0CABA8] hover:to-[#015958] disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


