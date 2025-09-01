'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../components/SocketProvider';
import './RealtimeReactions.css';

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
  x: number;
  y: number;
}

interface RealtimeReactionsProps {
  itemType: 'task' | 'project' | 'note' | 'event' | 'workspace';
  itemId: string;
  currentUserId: string;
  currentUserName: string;
  className?: string;
}

export const RealtimeReactions: React.FC<RealtimeReactionsProps> = ({
  itemType,
  itemId,
  currentUserId,
  currentUserName,
  className = ''
}) => {
  const socket = useSocket();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const commonEmojis = ['👍', '❤️', '😄', '😮', '😢', '😡', '🎉', '👏', '🔥', '💯'];

  // Join reaction room
  useEffect(() => {
    if (!socket) return;

    socket.emit('reactions:join', { itemType, itemId });

    const handleNewReaction = (reaction: Reaction) => {
      setReactions(prev => [...prev, {
        ...reaction,
        timestamp: new Date(reaction.timestamp)
      }]);

      // Remove reaction after animation
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
    };

    socket.on('reactions:new', handleNewReaction);

    return () => {
      socket.emit('reactions:leave', { itemType, itemId });
      socket.off('reactions:new', handleNewReaction);
    };
  }, [socket, itemType, itemId]);

  const sendReaction = (emoji: string, event?: React.MouseEvent) => {
    if (!socket) return;

    let x = 50; // Default center
    let y = 50; // Default center

    // Get position from click event if available
    if (event && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      x = ((event.clientX - rect.left) / rect.width) * 100;
      y = ((event.clientY - rect.top) / rect.height) * 100;
    }

    const reaction = {
      emoji,
      userId: currentUserId,
      userName: currentUserName,
      x,
      y
    };

    socket.emit('reactions:send', reaction);
    setShowEmojiPicker(false);
  };

  const handleContainerClick = (event: React.MouseEvent) => {
    // If not clicking on emoji picker, show default reaction
    if (!showEmojiPicker) {
      sendReaction('👍', event);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden cursor-pointer ${className}`}
      onClick={handleContainerClick}
      onDoubleClick={(e) => {
        e.preventDefault();
        sendReaction('❤️', e);
      }}
    >
      {/* Animated Reactions */}
      {reactions.map((reaction) => {
        return (
          <div
            key={reaction.id}
            className="reaction-emoji animate-bounce-up-fade"
            ref={(el) => {
              if (el) {
                el.style.left = `${reaction.x}%`;
                el.style.top = `${reaction.y}%`;
              }
            }}
          >
            <div className="text-2xl filter drop-shadow-lg">
              {reaction.emoji}
            </div>
          </div>
        );
      })}

      {/* Emoji Picker Button */}
      <div className="absolute bottom-4 right-4">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEmojiPicker(!showEmojiPicker);
            }}
            className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-full flex items-center justify-center hover:bg-white/90 transition-colors shadow-lg"
            title="Add reaction"
          >
            😊
          </button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 p-2 bg-white border border-gray-300 rounded-lg shadow-lg backdrop-blur-sm">
              <div className="grid grid-cols-5 gap-1">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      sendReaction(emoji);
                    }}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-lg transition-colors"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          Click to react • Double-click for ❤️
        </div>
      </div>
    </div>
  );
};

// Add custom animation styles to your global CSS
export const RealtimeReactionsStyles = `
@keyframes bounce-up-fade {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -80%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -120%) scale(0.8);
    opacity: 0;
  }
}

.animate-bounce-up-fade {
  animation: bounce-up-fade 3s ease-out forwards;
}
`;
