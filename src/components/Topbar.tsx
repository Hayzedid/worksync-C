"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Users, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Topbar() {
  const { user } = useAuth() || {};
  const [wsOpen, setWsOpen] = useState(false);
  // Dummy workspaces for switcher
  const workspaces = [
    { id: 1, name: 'Acme Corp' },
    { id: 2, name: 'Globex' },
  ];
  const [selectedWs, setSelectedWs] = useState(workspaces[0]);
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-[#0CABA8]/40 bg-[#0FC2C0] px-4 shadow-sm lg:pl-64">
      {/* Workspace Switcher */}
      <div className="relative">
        <button className="flex items-center gap-2 px-3 py-2 rounded bg-[#0CABA8] text-white font-semibold hover:bg-[#008F8C]" onClick={() => setWsOpen(v => !v)}>
          <Users className="h-5 w-5" />
          <span>{selectedWs.name}</span>
        </button>
        {wsOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white rounded shadow-lg border border-[#0CABA8]/20 z-50">
            {workspaces.map(ws => (
              <button key={ws.id} className="w-full flex items-center gap-2 px-4 py-2 text-[#015958] hover:bg-[#F6FFFE]" onClick={() => { setSelectedWs(ws); setWsOpen(false); }}>
                <Users className="h-4 w-4" /> <span>{ws.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Notification Bell */}
      <button className="ml-auto p-2 text-white hover:text-[#0CABA8] relative">
        <Bell className="h-6 w-6" />
        {/* Notification badge (if needed) */}
        {/* <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full px-1">3</span> */}
      </button>
      {/* User Profile */}
      <Link href="/profile" className="ml-4 flex items-center gap-2 text-white font-semibold hover:text-[#0CABA8]">
        <User className="h-5 w-5" />
        <span>{user?.name || 'Profile'}</span>
      </Link>
      <button className="ml-2 p-2 text-white hover:text-[#0CABA8]">
        <LogOut className="h-5 w-5" />
      </button>
    </header>
  );
} 