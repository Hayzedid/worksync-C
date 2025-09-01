import React from 'react';

type ReactionsMap = Record<string, { count: number; reacted?: boolean }>; // e.g. { '👍': {count:2, reacted:true} }

export default function Reactions({ reactions, onToggle }: { reactions?: ReactionsMap; onToggle: (emoji: string) => void }) {
  const defaultEmojis = ['👍', '❤️', '🎉', '😄', '👀'];
  const keys = reactions ? Array.from(new Set([...defaultEmojis, ...Object.keys(reactions)])) : defaultEmojis;
  return (
    <div className="flex gap-2 mt-1">
      {keys.map(k => {
        const meta = reactions?.[k];
        return (
          <button key={k} onClick={() => onToggle(k)} className={`px-2 py-1 rounded text-sm ${meta?.reacted ? 'bg-gray-100' : 'bg-white'}`}>
            <span className="mr-1">{k}</span>
            <span className="text-xs text-gray-600">{meta?.count ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
