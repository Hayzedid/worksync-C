"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api";
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  Calendar, 
  Settings, 
  Bell, 
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  FolderPlus,
  BarChart2
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderPlus },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Workspace', href: '/workspace', icon: Building2 },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const initialWorkspaces = [
  { name: 'Acme Corp', logo: '' },
  { name: 'Globex', logo: '' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const [workspaces] = useState(initialWorkspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0]);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  // Redirect unauthenticated users
  if (auth && !auth.loading && !auth.user) {
    router.replace('/login');
    return null;
  }

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch {}
    auth?.refresh();
    router.replace('/login');
  }

  return (
      <div className="min-h-screen bg-[#F6FFFE]">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-[#015958] bg-opacity-80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-[#015958]">
            <div className="flex h-16 items-center justify-between px-4">
              <h1 className="text-xl font-bold text-[#0FC2C0]">WorkSync</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-[#0FC2C0] hover:text-[#0CABA8]"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-[#0FC2C0] text-white'
                        : 'text-[#0FC2C0] hover:bg-[#008F8C] hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-200 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
          <div className="flex flex-col flex-grow bg-[#015958] border-r border-[#0CABA8]/40 h-full">
            <div className={`flex h-16 items-center ${sidebarCollapsed ? 'justify-center' : 'px-4'}`}>
              {!sidebarCollapsed && <h1 className="text-xl font-bold text-[#0FC2C0]">WorkSync</h1>}
            </div>
            <nav className={`flex-1 space-y-1 py-4 ${sidebarCollapsed ? 'px-1' : 'px-2'}`}> 
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center ${sidebarCollapsed ? 'justify-center' : ''} px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-[#0FC2C0] text-white'
                        : 'text-[#0FC2C0] hover:bg-[#008F8C] hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {!sidebarCollapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
            <button
              className={`flex items-center justify-center w-full py-2 border-t border-[#0CABA8]/20 text-[#0FC2C0] hover:text-[#0CABA8] transition-colors duration-200 ${sidebarCollapsed ? '' : 'mt-auto'}`}
              onClick={() => setSidebarCollapsed(v => !v)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[#0CABA8]/40 bg-[#0FC2C0] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Workspace Switcher */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded bg-[#0CABA8] text-white font-semibold hover:bg-[#008F8C] focus:outline-none"
                onClick={() => setSwitcherOpen((v) => !v)}
              >
                <span>{selectedWorkspace.logo ? <img src={selectedWorkspace.logo} alt={selectedWorkspace.name} className="w-6 h-6 rounded-full object-cover" /> : <Building2 className="h-5 w-5" />}</span>
                <span>{selectedWorkspace.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {switcherOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded shadow-lg border border-[#0CABA8]/20 z-50">
                  {workspaces.map((ws, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-2 px-4 py-2 text-[#015958] hover:bg-[#F6FFFE]"
                      onClick={() => { setSelectedWorkspace(ws); setSwitcherOpen(false); }}
                    >
                      {ws.logo ? <img src={ws.logo} alt={ws.name} className="w-5 h-5 rounded-full object-cover" /> : <Building2 className="h-4 w-4" />}
                      <span>{ws.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="-m-2.5 p-2.5 text-white lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search */}
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="relative flex flex-1">
                <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-[#0CABA8]" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-[#015958] placeholder:text-[#0CABA8] focus:ring-0 sm:text-sm bg-transparent"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button className="-m-2.5 p-2.5 text-[#008F8C] hover:text-[#0FC2C0]">
                <Bell className="h-6 w-6" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button className="flex items-center gap-x-3 text-sm font-medium text-white">
                  <div className="h-8 w-8 rounded-full bg-[#0FC2C0] flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="hidden lg:block">{auth?.user?.name ?? 'Profile'}</span>
                </button>
              </div>
              <button onClick={handleLogout} className="-m-2.5 p-2.5 text-white" aria-label="Logout">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Page content */}
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
  );
} 