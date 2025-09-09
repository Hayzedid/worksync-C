"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../../api";
import { useToast } from "../../../../components/toast";
import { Edit, ArrowLeft, Calendar } from "lucide-react";

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function ViewNotePage() {
  const { id } = useParams();
  const { addToast } = useToast();
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load note data
  useEffect(() => {
    if (!id) return;
    
    const fetchNote = async () => {
      try {
        const data = await api.get(`/notes/${id}`);
        setNote(data.note);
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

  if (error || !note) {
    return (
      <div className="min-h-screen bg-[#F6FFFE] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Note</h2>
            <p className="text-red-600 mb-4">{error || "Note not found"}</p>
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
          </div>
          
          <Link 
            href={`/notes/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-[#0FC2C0] text-white rounded hover:bg-[#0CABA8] transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Note
          </Link>
        </div>

        {/* Note Content */}
        <div className="bg-white rounded-xl shadow p-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-[#015958] mb-6">
            {note.title || "Untitled Note"}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-8 pb-4 border-b">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created: {new Date(note.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Updated: {new Date(note.updated_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {note.content ? (
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {note.content}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                This note is empty. Click "Edit Note" to add content.
              </div>
            )}
          </div>
        </div>

        {/* Quick Edit Button (Fixed Position) */}
        <Link 
          href={`/notes/${id}/edit`}
          className="fixed bottom-8 right-8 flex items-center gap-2 px-6 py-3 bg-[#0FC2C0] text-white rounded-full shadow-lg hover:bg-[#0CABA8] transition-colors"
        >
          <Edit className="h-5 w-5" />
          Edit
        </Link>
      </div>
    </div>
  );
}
