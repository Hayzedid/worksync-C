"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

type Props = {
  itemType: 'task' | 'note';
  itemId: string;
};

export default function AttachmentsPanel({ itemType, itemId }: Props) {
  const queryKey = ["attachments", { type: itemType, id: Number(itemId) }];
  const fetcher = async () => {
    const path = itemType === 'task' ? `/attachments/task/${itemId}` : `/attachments/note/${itemId}`;
    const res = await api.get(path);
    // backend returns { success: true, attachments: [...] }
    return (res as any)?.attachments ?? [];
  };

  const { data: attachments = [], isLoading, isError } = useQuery<any[]>({ queryKey, queryFn: fetcher });

  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      // Get token for Bearer auth
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('access_token') || localStorage.getItem('access_token') 
        : null;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/attachments/files/${fileId}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  return (
    <div className="attachments-panel">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-[#0FC2C0]">Attachments</h3>
        <button
          className="text-sm text-[#0FC2C0] hover:text-[#0CABA8]"
          onClick={() => document.getElementById(`${itemType}-file-input-${itemId}`)?.click()}
          aria-label="Upload file"
        >
          Upload
        </button>
      </div>

      {isLoading && <div className="text-[#015958]">Loading attachments...</div>}
      {isError && <div className="text-red-500">Failed to load attachments</div>}

      {(attachments as any[]).length === 0 ? (
        <div className="text-[#015958]">No attachments</div>
      ) : (
        <ul className="space-y-2">
          {(attachments as any[]).map((a: any) => (
            <li key={a.id} className="flex items-center justify-between bg-white/80 p-2 rounded border border-[#0CABA8]/10">
              <div className="flex-1">
                <div className="text-sm font-medium text-[#015958]">{a.file_name}</div>
                <div className="text-xs text-gray-500">Uploaded by {a.uploaded_by} • {a.created_at ? new Date(a.created_at).toLocaleString() : ''}</div>
              </div>
              <div>
                <button 
                  onClick={() => downloadFile(a.id, a.file_name)}
                  className="text-sm text-[#0FC2C0] hover:underline"
                >
                  Download
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
