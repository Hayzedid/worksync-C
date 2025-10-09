'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useGlobalPresence } from '../../../hooks/collaboration/useGlobalPresence';
import { useRealCollaborationData } from '../../../hooks/collaboration/useRealCollaborationData';
import {
  GlobalPresenceIndicator,
  ItemPresenceIndicator,
  TypingIndicator,
  UniversalComments,
  CollaborativeTaskEditor,
  RealtimeReactions
} from '../../../components/collaboration';
import { Users, MessageSquare, Edit3, Zap, Eye, Settings, RefreshCw, Folder, CheckSquare } from 'lucide-react';

export default function CollaborationPage() {
  const auth = useAuth();
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedItemType, setSelectedItemType] = useState<'task' | 'project'>('task');
  
  // Fetch real data
  const { 
    items, 
    loading, 
    error, 
    refreshData, 
    getRecentItems, 
    tasks, 
    projects 
  } = useRealCollaborationData();

  // Initialize presence tracking
  const { presence, setActivityStatus } = useGlobalPresence(
    auth?.user?.id?.toString() || 'demo-user',
    auth?.user?.name || 'Demo User',
    'collaboration-demo'
  );

  // Auto-select first available item if none selected
  React.useEffect(() => {
    if (!selectedItemId && items.length > 0) {
      setSelectedItemId(items[0].id);
      setSelectedItemType(items[0].type);
    }
  }, [items, selectedItemId]);

  const demoSections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Eye,
      description: 'Real-time collaboration dashboard'
    },
    {
      id: 'presence',
      title: 'Presence Indicators',
      icon: Users,
      description: 'See who\'s online and what they\'re working on'
    },
    {
      id: 'items',
      title: 'Active Items',
      icon: CheckSquare,
      description: 'Your tasks and projects for collaboration'
    },
    {
      id: 'comments',
      title: 'Universal Comments',
      icon: MessageSquare,
      description: 'Comment system with threading and reactions'
    },
    {
      id: 'collaborative-editing',
      title: 'Collaborative Editing',
      icon: Edit3,
      description: 'Real-time task editing with Yjs'
    },
    {
      id: 'reactions',
      title: 'Real-time Reactions',
      icon: Zap,
      description: 'Interactive emoji reactions'
    }
  ];

  const renderDemoContent = () => {
    switch (activeDemo) {
      case 'overview':
        return (
          <div className="space-y-6">
            {loading && (
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-blue-800">Loading collaboration data...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={refreshData}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Real-Time Collaboration Dashboard
                </h3>
                <button
                  onClick={refreshData}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
              <p className="text-gray-700 mb-4">
                Collaborate in real-time on your actual tasks and projects:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Tasks</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Projects</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{projects.length}</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Active Users</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{presence.users.length}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Global presence tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Universal commenting system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Collaborative task editing</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Real-time reactions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Typing indicators</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-sm">Activity notifications</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Current Session</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <GlobalPresenceIndicator
                    users={presence.users}
                    currentUserId={auth?.user?.id?.toString() || 'demo-user'}
                    maxVisible={5}
                    showActivity={true}
                    className="mt-2"
                  />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Your Status</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'presence':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Presence</h3>
              <p className="text-gray-600 mb-4">
                See all users currently active in the application with their current activities.
              </p>
              <GlobalPresenceIndicator
                users={presence.users}
                currentUserId={auth?.user?.id?.toString() || 'demo-user'}
                maxVisible={8}
                showActivity={true}
              />
            </div>

            {selectedItemId && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Item-Specific Presence</h3>
                <p className="text-gray-600 mb-4">
                  Track who's currently viewing or working on specific items.
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {items.find(item => item.id === selectedItemId)?.title || 'Selected Item'}
                      </span>
                      <button
                        onClick={() => setActivityStatus(selectedItemType, selectedItemId, 'viewing')}
                        className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        Join
                      </button>
                    </div>
                    <ItemPresenceIndicator
                      users={presence.users}
                      currentUserId={auth?.user?.id?.toString() || 'demo-user'}
                      itemType={selectedItemType}
                      itemId={selectedItemId}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Typing Indicators</h3>
              <p className="text-gray-600 mb-4">
                Real-time typing indicators show when team members are composing messages.
              </p>
              <TypingIndicator
                typingUsers={['Alice', 'Bob']}
                className="p-4 bg-gray-50 rounded-lg"
              />
            </div>
          </div>
        );

      case 'items':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Active Items</h3>
                <button
                  onClick={refreshData}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-gray-600">Loading items...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">No items found</p>
                  <p className="text-sm text-gray-500">Create some tasks or projects to start collaborating!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getRecentItems(10).map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedItemId === item.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setSelectedItemType(item.type);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.type === 'task' ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Folder className="h-5 w-5 text-purple-600" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-600 capitalize">{item.type} • {item.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            Updated {new Date(item.updated_at).toLocaleDateString()}
                          </div>
                          {selectedItemId === item.id && (
                            <div className="text-xs text-blue-600 font-medium mt-1">Selected</div>
                          )}
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'comments':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Universal Comments</h3>
              <p className="text-gray-600 mb-6">
                A complete commenting system that works across all item types with threading, mentions, and reactions.
              </p>
              
              {!selectedItemId ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">No item selected</p>
                  <p className="text-sm text-gray-500">Go to "Active Items" tab to select a task or project to comment on.</p>
                </div>
              ) : auth?.user ? (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Commenting on:</strong> {items.find(item => item.id === selectedItemId)?.title || 'Selected Item'} 
                      <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded capitalize">
                        {selectedItemType}
                      </span>
                    </p>
                  </div>
                  <UniversalComments
                    itemType={selectedItemType}
                    itemId={selectedItemId}
                    currentUserId={auth.user.id.toString()}
                    currentUserName={auth.user.name || 'User'}
                    users={presence.users}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Please log in to use comments.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'collaborative-editing':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaborative Task Editor</h3>
              <p className="text-gray-600 mb-6">
                Real-time collaborative editing powered by Yjs. Multiple users can edit the same task simultaneously without conflicts.
              </p>
              
              {!selectedItemId ? (
                <div className="text-center py-8">
                  <Edit3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">No item selected</p>
                  <p className="text-sm text-gray-500">Go to "Active Items" tab to select a task to edit collaboratively.</p>
                </div>
              ) : selectedItemType !== 'task' ? (
                <div className="text-center py-8">
                  <Edit3 className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                  <p className="text-gray-600 mb-2">Collaborative editing is only available for tasks</p>
                  <p className="text-sm text-gray-500">Please select a task from the "Active Items" tab.</p>
                </div>
              ) : auth?.user ? (
                <div>
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Editing:</strong> {items.find(item => item.id === selectedItemId)?.title || 'Selected Task'}
                    </p>
                  </div>
                  <CollaborativeTaskEditor
                    taskId={selectedItemId}
                    currentUserId={auth.user.id.toString()}
                    currentUserName={auth.user.name || 'User'}
                    users={presence.users}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Please log in to use collaborative editing.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'reactions':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Reactions</h3>
              <p className="text-gray-600 mb-6">
                Add animated emoji reactions that appear in real-time for all users. Click anywhere on the demo area or use the emoji picker.
              </p>
              
              {!selectedItemId ? (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">No item selected</p>
                  <p className="text-sm text-gray-500">Go to "Active Items" tab to select an item to react to.</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Reacting to:</strong> {items.find(item => item.id === selectedItemId)?.title || 'Selected Item'}
                      <span className="ml-2 text-xs bg-purple-200 px-2 py-1 rounded capitalize">
                        {selectedItemType}
                      </span>
                    </p>
                  </div>
                  
                  <div className="relative">
                    <RealtimeReactions
                      itemType={selectedItemType}
                      itemId={selectedItemId}
                      currentUserId={auth?.user?.id?.toString() || 'demo-user'}
                      currentUserName={auth?.user?.name || 'Demo User'}
                      className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300"
                    />
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Click anywhere on the demo area to send a 👍 reaction</li>
                      <li>• Double-click to send a ❤️ reaction</li>
                      <li>• Use the emoji picker button for more reaction options</li>
                      <li>• Reactions appear in real-time for all connected users</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>Select a demo section</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Real-Time Collaboration
              </h1>
              <p className="text-gray-600">
                Collaborate in real-time on your actual tasks and projects
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${items.length} items available`}
              </div>
              {error && (
                <div className="text-xs text-red-600 mt-1">
                  Error loading data
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-8">
              <h2 className="font-semibold text-gray-900 mb-4">Collaboration Features</h2>
              <nav className="space-y-2">
                {demoSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveDemo(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        activeDemo === section.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <div className="font-medium text-sm">{section.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {section.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderDemoContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
