"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../../api";
import { useToast } from "../../../../../components/toast";
import { Save, ArrowLeft, Trash2 } from "lucide-react";

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function EditNotePage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load note data
  useEffect(() => {
    if (!id) return;
    
    const fetchNote = async () => {
      try {
        const data = await api.get(`/notes/${id}`);
        setNote(data.note);
        setTitle(data.note.title || "");
        setContent(data.note.content || "");
        setError(null);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load note";
        setError(errorMessage);
        addToast({ 
          title: "Error", 
          description: errorMessage, 
          variant: "error" 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, addToast]);

  // Save note
  const handleSave = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      await api.put(`/notes/${id}`, {
        title: title.trim(),
        content: content.trim()
      });
      
      addToast({ 
        title: "Success", 
        description: "Note saved successfully", 
        variant: "success" 
      });
      
      // Update local state
      if (note) {
        setNote({
          ...note,
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save note";
      addToast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "error" 
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete note
  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this note?")) return;
    
    try {
      await api.delete(`/notes/${id}`);
      addToast({ 
        title: "Success", 
        description: "Note deleted successfully", 
        variant: "success" 
      });
      router.push("/notes");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete note";
      addToast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "error" 
      });
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!note || loading) return;
    
    const timeoutId = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        handleSave();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [title, content, note, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6FFFE] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-[#015958]">Loading note...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="min-h-screen bg-[#F6FFFE] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Note</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link 
              href="/notes" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FFFE] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/notes" 
              className="flex items-center gap-2 px-3 py-2 text-[#015958] hover:bg-white rounded transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Notes
            </Link>
            <h1 className="text-2xl font-bold text-[#015958]">Edit Note</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </button>
            
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow p-6">
          {/* Title Input */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-[#015958] mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent text-lg text-gray-900 bg-white placeholder-gray-500"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>

          {/* Content Textarea */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-[#015958] mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here..."
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] focus:border-transparent resize-none font-mono text-gray-900 bg-white placeholder-gray-500"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>

          {/* Meta Information */}
          {note && (
            <div className="text-sm text-gray-600 border-t pt-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <strong>Created:</strong> {new Date(note.created_at).toLocaleString()}
                </div>
                <div>
                  <strong>Last Updated:</strong> {new Date(note.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Auto-save indicator */}
        {saving && (
          <div className="fixed bottom-4 right-4 bg-[#0FC2C0] text-white px-4 py-2 rounded-lg shadow">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
}
