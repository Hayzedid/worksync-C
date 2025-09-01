'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useGlobalPresence } from '../../../hooks/collaboration/useGlobalPresence';
import {
  GlobalPresenceIndicator,
  ItemPresenceIndicator,
  TypingIndicator,
  UniversalComments,
  CollaborativeTaskEditor,
  RealtimeReactions
} from '../../../components/collaboration';
import { Users, MessageSquare, Edit3, Zap, Eye, Settings } from 'lucide-react';

export default function CollaborationDemoPage() {
  const auth = useAuth();
  const [activeDemo, setActiveDemo] = useState<string>('overview');
  const [mockTaskId] = useState('demo-task-1');

  // Initialize presence tracking
  const { presence, setActivityStatus } = useGlobalPresence(
    auth?.user?.id?.toString() || 'demo-user',
    auth?.user?.name || 'Demo User',
    'collaboration-demo'
  );

  const demoSections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Eye,
      description: 'Global presence and activity tracking'
    },
    {
      id: 'presence',
      title: 'Presence Indicators',
      icon: Users,
      description: 'See who\'s online and what they\'re working on'
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Phase 2: Enhanced Real-Time Collaboration
              </h3>
              <p className="text-gray-700 mb-4">
                Experience the next level of team collaboration with our comprehensive real-time features:
              </p>
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

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Item-Specific Presence</h3>
              <p className="text-gray-600 mb-4">
                Track who's currently viewing or working on specific items.
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Demo Task #1</span>
                    <button
                      onClick={() => setActivityStatus('task', mockTaskId, 'viewing')}
                      className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      Join
                    </button>
                  </div>
                  <ItemPresenceIndicator
                    users={presence.users}
                    currentUserId={auth?.user?.id?.toString() || 'demo-user'}
                    itemType="task"
                    itemId={mockTaskId}
                  />
                </div>
              </div>
            </div>

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

      case 'comments':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Universal Comments</h3>
              <p className="text-gray-600 mb-6">
                A complete commenting system that works across all item types with threading, mentions, and reactions.
              </p>
              
              {auth?.user && (
                <UniversalComments
                  itemType="task"
                  itemId={mockTaskId}
                  currentUserId={auth.user.id.toString()}
                  currentUserName={auth.user.name}
                  users={presence.users}
                />
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
              
              {auth?.user && (
                <CollaborativeTaskEditor
                  taskId={mockTaskId}
                  currentUserId={auth.user.id.toString()}
                  currentUserName={auth.user.name}
                  users={presence.users}
                />
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
              
              <div className="relative">
                <RealtimeReactions
                  itemType="task"
                  itemId={mockTaskId}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Real-Time Collaboration Demo
          </h1>
          <p className="text-gray-600">
            Experience the power of real-time collaboration features in WorkSync
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-8">
              <h2 className="font-semibold text-gray-900 mb-4">Demo Sections</h2>
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
