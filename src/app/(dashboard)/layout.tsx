"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth } from "../../hooks/useAuth";
import { useGlobalPresence } from "../../hooks/collaboration/useGlobalPresence";
import { GlobalPresenceIndicator } from "../../components/collaboration";
import { api } from "../../api";
import ConfirmDialog from "../../components/ConfirmDialog";
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications || showProfileMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.notifications-dropdown') && !target.closest('.profile-dropdown')) {
          setShowNotifications(false);
          setShowProfileMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfileMenu]);

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
    setShowLogoutConfirm(true);
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
            <div className="flex items-center gap-x-2">
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

              {/* Header Icons - Properly aligned */}
              <div className="flex items-center gap-x-1">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-white/90 hover:text-[#015958] transition-colors duration-200 rounded-full hover:bg-white/10"
                    aria-label="View notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {/* Notification badge */}
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      3
                    </span>
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="notifications-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm font-medium text-gray-900">New task assigned</p>
                          <p className="text-xs text-gray-500 mt-1">You have been assigned to "Update Dashboard UI"</p>
                          <p className="text-xs text-blue-600 mt-1">2 minutes ago</p>
                        </div>
                        <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm font-medium text-gray-900">Project updated</p>
                          <p className="text-xs text-gray-500 mt-1">WorkSync project status changed to "In Progress"</p>
                          <p className="text-xs text-blue-600 mt-1">1 hour ago</p>
                        </div>
                        <div className="p-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm font-medium text-gray-900">Deadline reminder</p>
                          <p className="text-xs text-gray-500 mt-1">Task "Fix login issues" is due tomorrow</p>
                          <p className="text-xs text-blue-600 mt-1">3 hours ago</p>
                        </div>
                      </div>
                      <div className="p-3 border-t border-gray-200">
                        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    aria-label="Open profile menu" 
                    className="p-2 text-white hover:text-[#015958] transition-colors duration-200 rounded-full hover:bg-white/10"
                  >
                    <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </button>
                  
                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="profile-dropdown absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{auth?.user?.firstName} {auth?.user?.lastName}</p>
                        <p className="text-xs text-gray-500">{auth?.user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/settings"
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogout();
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
        
        <ConfirmDialog
          open={showLogoutConfirm}
          title="Log out"
          description="Are you sure you want to log out?"
          confirmLabel="Log out"
          cancelLabel="Cancel"
          onConfirm={async () => {
            setShowLogoutConfirm(false);
            try {
              await api.post('/auth/logout');
            } catch {}
            auth?.refresh();
            router.replace('/login');
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      </div>
  );
} 