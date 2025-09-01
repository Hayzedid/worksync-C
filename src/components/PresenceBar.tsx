import React from 'react';
import Image from 'next/image';
import { PresenceUser } from '../hooks/usePresence';

interface PresenceBarProps {
  users: PresenceUser[];
}

export const PresenceBar: React.FC<PresenceBarProps> = ({ users }) => (
  <div className="flex items-center gap-3 mb-2">
    {users.map(u => (
      <div key={u.clientId} className="flex items-center gap-1">
        {u.avatar ? (
          <span className="relative w-6 h-6 inline-block">
            <Image src={u.avatar} alt={u.name} width={24} height={24} className="w-6 h-6 rounded-full border-2" style={{ borderColor: u.color }} />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white" style={{ background: u.color }} />
          </span>
        ) : (
          <span className="w-3 h-3 rounded-full inline-block border-2 border-white" style={{ background: u.color }} />
        )}
        <span className="text-xs font-medium" style={{ color: u.color }}>{u.name}</span>
      </div>
    ))}
    {users.length === 0 && <span className="text-xs text-[#0CABA8]">No one online</span>}
  </div>
);
