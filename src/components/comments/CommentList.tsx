import React from 'react';
import { Button } from '../Button';
import { Edit, Trash2 } from 'lucide-react';

export type Comment = {
  id: number;
  user: { name: string };
  content: string;
  createdAt: string;
};

type CommentListProps = {
  comments: Comment[];
  onAdd: (content: string) => void;
  onEdit: (id: number, content: string) => void;
  onDelete: (id: number) => void;
};

export function CommentList({ comments, onAdd, onEdit, onDelete }: CommentListProps) {
  // Real-time updates would be handled via a useSocket hook
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[#0FC2C0] mb-2">Comments</h3>
      <form
        onSubmit={e => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const input = form.elements.namedItem('comment') as HTMLInputElement;
          if (input.value.trim()) {
            onAdd(input.value);
            input.value = '';
          }
        }}
        className="flex gap-2 mb-4"
      >
        <label htmlFor="comment-input" className="sr-only">Add a comment</label>
        <input id="comment-input" name="comment" className="flex-1 px-3 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="Add a comment..." />
        <Button type="submit" className="bg-[#0FC2C0] text-white">Post</Button>
      </form>
      {comments.length === 0 && <div className="text-[#015958]">No comments yet.</div>}
      {comments.map(c => (
        <div key={c.id} className="bg-white rounded shadow p-3 flex flex-col gap-1 border border-[#0CABA8]/20">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#015958]">{c.user.name}</span>
            <span className="text-xs text-[#0CABA8]">{new Date(c.createdAt).toLocaleString()}</span>
          </div>
          <div className="text-[#015958]">{c.content}</div>
          <div className="flex gap-2 mt-1">
            <Button className="bg-[#0CABA8] text-white" onClick={() => onEdit(c.id, c.content)}><Edit className="h-4 w-4" /></Button>
            <Button className="bg-[#008F8C] text-white" onClick={() => onDelete(c.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
} 