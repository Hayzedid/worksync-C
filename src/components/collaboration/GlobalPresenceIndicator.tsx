'use client';

import React, { useRef, useEffect } from 'react';
import { GlobalPresenceUser } from '@/hooks/collaboration/useGlobalPresence';
import './GlobalPresenceIndicator.css';

interface GlobalPresenceIndicatorProps {
  users: GlobalPresenceUser[];
  currentUserId: string;
  maxVisible?: number;
  showActivity?: boolean;
  className?: string;
}

export const GlobalPresenceIndicator: React.FC<GlobalPresenceIndicatorProps> = ({
  users,
  currentUserId,
  maxVisible = 5,
  showActivity = true,
  className = ''
}) => {
  const presenceUsers = users.filter(user => user.id !== currentUserId);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'editing':
        return '✏️';
      case 'viewing':
        return '👁️';
      case 'commenting':
        return '💬';
      default:
        return '•';
    }
  };

  const getActivityText = (user: GlobalPresenceUser) => {
    if (!user.currentItem) return 'Online';
    const { type, action } = user.currentItem;
    const actionText = action === 'viewing' ? 'viewing' :
                     action === 'editing' ? 'editing' : 'commenting on';
    return `${actionText} ${type}`;
  };

  if (presenceUsers.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-2">
        {presenceUsers.slice(0, maxVisible).map((user) => {
          const avatarRef = useRef<HTMLDivElement>(null);
          const activityRef = useRef<HTMLDivElement>(null);

          useEffect(() => {
            if (avatarRef.current) {
              avatarRef.current.style.backgroundColor = user.color;
            }
            if (activityRef.current) {
              activityRef.current.style.backgroundColor = user.color;
            }
          }, [user.color]);

          return (
            <div
              key={user.id}
              className="relative group"
              title={`${user.name} - ${getActivityText(user)}`}
            >
              {/* User Avatar */}
              <div
                ref={avatarRef}
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold shadow-sm"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Activity Indicator */}
              {showActivity && user.currentItem && (
                <div
                  ref={activityRef}
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center text-[10px]"
                >
                  {getActivityIcon(user.currentItem.action)}
                </div>
              )}

              {/* Status Indicator */}
              <div
                className={`absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  user.status === 'active' ? 'bg-green-500' :
                  user.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
              />

              {/* Hover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                <div className="font-semibold">{user.name}</div>
                <div className="text-gray-300">{getActivityText(user)}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          );
        })}

        {/* Additional Users Indicator */}
        {presenceUsers.length > maxVisible && (
          <div
            className="w-8 h-8 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm"
            title={`${presenceUsers.length - maxVisible} more users online`}
          >
            +{presenceUsers.length - maxVisible}
          </div>
        )}
      </div>
    </div>
  );
};

interface ItemPresenceIndicatorProps {
  users: GlobalPresenceUser[];
  currentUserId: string;
  itemType: string;
  itemId: string;
  className?: string;
}

export const ItemPresenceIndicator: React.FC<ItemPresenceIndicatorProps> = ({
  users,
  currentUserId,
  itemType,
  itemId,
  className = ''
}) => {
  const relevantUsers = users.filter(
    user => user.id !== currentUserId &&
             user.currentItem?.type === itemType &&
             user.currentItem?.id === itemId
  );

  if (relevantUsers.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex -space-x-1">
        {relevantUsers.map((user) => {
          const avatarRef = useRef<HTMLDivElement>(null);

          useEffect(() => {
            if (avatarRef.current) {
              avatarRef.current.style.backgroundColor = user.color;
            }
          }, [user.color]);

          return (
            <div
              key={user.id}
              className="relative group"
              title={`${user.name} is ${user.currentItem?.action}ing this ${itemType}`}
            >
              <div
                ref={avatarRef}
                className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-white text-xs font-semibold shadow-sm"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <span className="text-xs text-gray-600 ml-1">
        {relevantUsers.length === 1 
          ? `${relevantUsers[0].name} is here`
          : `${relevantUsers.length} users here`
        }
      </span>
    </div>
  );
};

interface TypingIndicatorProps {
  typingUsers: string[];
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  className = ''
}) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
      return `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce typing-dot-1" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce typing-dot-2" />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce typing-dot-3" />
      </div>
      <span className="text-sm text-gray-600 italic">
        {getTypingText()}
      </span>
    </div>
  );
};
