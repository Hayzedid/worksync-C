import React from 'react';
import { useYjsDoc } from '../hooks/useYjsDoc';
import { usePresence } from '../hooks/usePresence';
import { PresenceBar } from './PresenceBar';

interface CollaborativeTaskEditorProps {
  taskId: string;
  initialTitle?: string;
  initialDescription?: string;
  userName: string;
  avatarUrl?: string;
}

export const CollaborativeTaskEditor: React.FC<CollaborativeTaskEditorProps> = ({
  taskId,
  initialTitle = '',
  initialDescription = '',
  userName,
  avatarUrl,
}) => {
  const { ymap, awareness } = useYjsDoc(`task-${taskId}`);
  const users = usePresence(awareness, userName, avatarUrl);
  const [title, setTitle] = React.useState(initialTitle);
  const [description, setDescription] = React.useState(initialDescription);

  React.useEffect(() => {
    if (!ymap) return;
    if (!ymap.get('title')) ymap.set('title', initialTitle);
    if (!ymap.get('description')) ymap.set('description', initialDescription);
    const t = ymap.get('title');
    const d = ymap.get('description');
    setTitle(typeof t === 'string' ? t : String(t ?? initialTitle));
    setDescription(typeof d === 'string' ? d : String(d ?? initialDescription));
    const observer = () => {
      const t2 = ymap.get('title');
      const d2 = ymap.get('description');
      setTitle(typeof t2 === 'string' ? t2 : String(t2 ?? initialTitle));
      setDescription(typeof d2 === 'string' ? d2 : String(d2 ?? initialDescription));
    };
    ymap.observe(observer);
    return () => ymap.unobserve(observer);
  }, [ymap, initialTitle, initialDescription]);

  const handleChange = (field: 'title' | 'description', value: string) => {
    if (!ymap) return;
    ymap.set(field, value);
  };

  return (
    <div className="space-y-4 p-4 border rounded bg-white/80 shadow">
      <PresenceBar users={users} />
      <input
        aria-label="Task title"
        className="w-full border rounded p-2 text-lg font-semibold"
        value={title}
        onChange={e => handleChange('title', e.target.value)}
        placeholder="Task title"
      />
      <textarea
        aria-label="Task description"
        className="w-full border rounded p-2 min-h-[100px]"
        value={description}
        onChange={e => handleChange('description', e.target.value)}
        placeholder="Task description"
      />
      <div className="text-xs text-[#0CABA8]">All changes and presence are synced in real time.</div>
    </div>
  );
};
