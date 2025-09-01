import React, { useEffect } from 'react';
import { Button } from '../Button';
import { Edit, Trash2 } from 'lucide-react';
import { useSocket } from '../SocketProvider';
import { useNotifications } from '../notifications/NotificationProvider';

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
  contextId?: string; // optional resource id (note/task/project)
  localUser?: { id?: string; name?: string };
};

export function CommentList({ comments, onAdd, onEdit, onDelete, contextId, localUser }: CommentListProps) {
  const socket = useSocket();
  const { addNotification } = useNotifications();

  // listen for remote comments
  useEffect(() => {
    if (!socket) return;
    function handleRemote(payload: unknown) {
      const p = payload as Record<string, unknown> | null;
      const comment = p?.['comment'] as Record<string, unknown> | undefined;
      if (comment && typeof comment['content'] === 'string') {
        onAdd(comment['content']);
      }
    }
    socket.on('comment:added', handleRemote);
    return () => { socket.off('comment:added', handleRemote); };
  }, [socket, onAdd]);
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-[#0FC2C0] mb-2">Comments</h3>
      <form
        onSubmit={e => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const input = form.elements.namedItem('comment') as HTMLInputElement;
          if (input.value.trim()) {
            const content = input.value.trim();
            onAdd(content);
            // emit socket event for remote clients
            if (socket) socket.emit('comment:add', { contextId: contextId ?? undefined, content });
            // parse mentions and emit notifications
            const re = /@([a-zA-Z0-9_\-.]+)/g;
            let m;
            const mentions: string[] = [];
            while ((m = re.exec(content)) !== null) mentions.push(m[1]);
            for (const name of mentions) {
              // emit notification via socket
              socket?.emit('notification', { toUserName: name, message: `${localUser?.name || 'Someone'} mentioned you in a comment`, type: 'mention' });
              // also show local notification
              addNotification({ message: `${localUser?.name || 'Someone'} mentioned ${name} in a comment` });
            }
            input.value = '';
          }
        }}
        className="flex gap-2 mb-4"
      >
  <label htmlFor="comment-input" className="sr-only">Add a comment</label>
  <input id="comment-input" name="comment" aria-label="Add a comment" className="flex-1 px-3 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="Add a comment..." />
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