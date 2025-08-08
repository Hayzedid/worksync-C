"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderPlus, CheckSquare, FileText, Calendar, Users, BarChart2 } from 'lucide-react';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderPlus },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Workspace', href: '/workspace', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-[#015958] border-r border-[#0CABA8]/40 fixed">
      <div className="flex items-center h-16 px-4 text-xl font-bold text-[#0FC2C0]">WorkSync</div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navLinks.map(link => (
          <Link key={link.name} href={link.href} className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${pathname.startsWith(link.href) ? 'bg-[#0FC2C0] text-white' : 'text-[#0FC2C0] hover:bg-[#008F8C] hover:text-white'}`}>
            <link.icon className="mr-3 h-5 w-5" /> {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
} 