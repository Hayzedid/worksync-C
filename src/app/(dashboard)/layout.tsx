"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from "../../hooks/useAuth";
import { useGlobalPresence } from "../../hooks/collaboration/useGlobalPresence";
import { GlobalPresenceIndicator } from "../../components/collaboration";
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
  ChevronLeft,
  ChevronRight,
  FolderPlus,
  BarChart2,
  Users
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderPlus },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Notes', href: '/notes', icon: FileText },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Workspace', href: '/workspaces', icon: LayoutDashboard },
  { name: 'Collaboration', href: '/collaboration', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
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

  // Get current page for presence
  const currentPage = pathname?.split('/').filter(Boolean)[0] || 'dashboard';

  // Initialize global presence tracking
  const { presence, getUsersOnPage } = useGlobalPresence(
    auth?.user?.id?.toString() || '',
    auth?.user?.name || 'Guest',
    currentPage
  );

  // Get users on current page for display
  const pageUsers = getUsersOnPage(currentPage);
  // Workspace selection moved to dedicated page

  // Redirect unauthenticated users (side-effect, not during render)
  // If there is a token but no user yet, attempt a single refresh instead of redirecting.
  const [didAttemptRefresh, setDidAttemptRefresh] = useState(false);
  useEffect(() => {
    if (!auth) return;
    if (auth.loading) return;
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
    if (!auth.user) {
      if (token && !didAttemptRefresh) {
        setDidAttemptRefresh(true);
        auth.refresh();
      } else if (!token) {
        router.replace('/login');
      }
    }
  }, [auth, didAttemptRefresh, router]);

  // Workspace create/list handled on /workspaces page

  // Optionally block rendering until auth state known to avoid flicker
  if (!auth || auth.loading) {
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
            <div className="flex h-16 items-center px-4">
              <h1 className="text-xl font-bold text-[#0FC2C0] flex-1">WorkSync</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-[#0FC2C0] hover:text-[#0CABA8] ml-auto"
                aria-label="Close sidebar"
                title="Close sidebar"
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
          {/* Top bar (removed dummy workspace switcher) */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[#0CABA8]/40 bg-[#0FC2C0] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            {/* Removed workspace switcher; selection happens from sidebar "Workspace" */}

            <div className="relative group lg:hidden">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-white"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 rounded bg-[#015958] px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Open sidebar</span>
            </div>

            {/* Search */}
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="relative flex flex-1">
                <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-[#0CABA8]" />
                <input
                  aria-label="Search"
                  type="search"
                  placeholder="Search..."
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-[#015958] placeholder:text-[#0CABA8] focus:ring-0 focus:border-[#0CABA8] focus:outline-none focus:border-2 rounded-full sm:text-sm bg-transparent"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Global Presence Indicator */}
              {auth?.user?.id && (
                <GlobalPresenceIndicator
                  users={presence.users}
                  currentUserId={auth.user.id.toString()}
                  maxVisible={4}
                  showActivity={true}
                  className="mr-2"
                />
              )}

              {/* Notifications */}
              <div className="relative group">
                <button 
                  className="-m-2.5 p-2.5 text-white/90 hover:text-[#015958]"
                  aria-label="View notifications"
                >
                  <Bell className="h-6 w-6" />
                </button>
                <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 rounded bg-[#015958] px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">View notifications</span>
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <div className="relative group">
                  <button aria-label="Open profile menu" className="flex items-center gap-x-3 text-sm font-medium text-white hover:text-[#015958]">
                    <div className="h-8 w-8 rounded-full bg-[#0FC2C0] flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </button>
                  <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 rounded bg-[#015958] px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Profile</span>
                </div>
              </div>
              <div className="relative group">
                <button onClick={handleLogout} className="-m-2.5 p-2.5 text-white hover:text-[#015958]" aria-label="Logout">
                  <LogOut className="h-5 w-5" />
                </button>
                <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 rounded bg-[#015958] px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">Logout</span>
              </div>
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