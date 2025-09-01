import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../components/SocketProvider';

export interface UniversalComment {
  id: string;
  itemType: 'task' | 'project' | 'note' | 'event' | 'workspace';
  itemId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string; // For threaded comments
  mentions: string[];
  reactions: Record<string, { count: number; users: string[] }>;
  isEdited: boolean;
}

export interface CommentThread {
  id: string;
  comments: UniversalComment[];
  totalCount: number;
}

export function useUniversalComments(
  itemType: 'task' | 'project' | 'note' | 'event' | 'workspace',
  itemId: string,
  userId: string,
  userName: string
) {
  const socket = useSocket();
  const [comments, setComments] = useState<UniversalComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState<string[]>([]);

  // Load comments for item
  useEffect(() => {
    if (!socket || !itemId) return;

    setLoading(true);
    
    // Request comments for this item
    socket.emit('comments:load', { itemType, itemId });

    // Listen for comment updates
    const handleCommentsLoaded = (data: { comments: UniversalComment[] }) => {
      setComments(data.comments.map(comment => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
        updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : undefined,
      })));
      setLoading(false);
    };

    const handleNewComment = (comment: UniversalComment) => {
      if (comment.itemType === itemType && comment.itemId === itemId) {
        setComments(prev => [...prev, {
          ...comment,
          createdAt: new Date(comment.createdAt),
        }]);
      }
    };

    const handleCommentUpdated = (comment: UniversalComment) => {
      if (comment.itemType === itemType && comment.itemId === itemId) {
        setComments(prev => prev.map(c => 
          c.id === comment.id 
            ? { ...comment, updatedAt: new Date(comment.updatedAt || comment.createdAt) }
            : c
        ));
      }
    };

    const handleCommentDeleted = (data: { commentId: string }) => {
      setComments(prev => prev.filter(c => c.id !== data.commentId));
    };

    const handleTypingUpdate = (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (data.userId === userId) return; // Don't show own typing

      setTyping(prev => {
        if (data.isTyping) {
          return prev.includes(data.userName) ? prev : [...prev, data.userName];
        } else {
          return prev.filter(name => name !== data.userName);
        }
      });
    };

    socket.on('comments:loaded', handleCommentsLoaded);
    socket.on('comments:new', handleNewComment);
    socket.on('comments:updated', handleCommentUpdated);
    socket.on('comments:deleted', handleCommentDeleted);
    socket.on('comments:typing', handleTypingUpdate);

    return () => {
      socket.off('comments:loaded', handleCommentsLoaded);
      socket.off('comments:new', handleNewComment);
      socket.off('comments:updated', handleCommentUpdated);
      socket.off('comments:deleted', handleCommentDeleted);
      socket.off('comments:typing', handleTypingUpdate);
    };
  }, [socket, itemType, itemId, userId]);

  // Extract mentions from text
  const extractMentions = useCallback((text: string): string[] => {
    const mentionRegex = /@([a-zA-Z0-9_\-.]+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  }, []);

  // Add new comment
  const addComment = useCallback((content: string, parentId?: string) => {
    if (!socket || !content.trim()) return;

    const mentions = extractMentions(content);
    const comment: Omit<UniversalComment, 'id' | 'createdAt'> = {
      itemType,
      itemId,
      userId,
      userName,
      content: content.trim(),
      parentId,
      mentions,
      reactions: {},
      isEdited: false,
    };

    socket.emit('comments:add', comment);

    // Send mention notifications
    mentions.forEach(mentionedUser => {
      socket.emit('notification:mention', {
        toUserName: mentionedUser,
        fromUserId: userId,
        fromUserName: userName,
        itemType,
        itemId,
        message: `${userName} mentioned you in a comment`,
        content: content.substring(0, 100),
      });
    });
  }, [socket, itemType, itemId, userId, userName, extractMentions]);

  // Update comment
  const updateComment = useCallback((commentId: string, content: string) => {
    if (!socket || !content.trim()) return;

    const mentions = extractMentions(content);
    socket.emit('comments:update', {
      commentId,
      content: content.trim(),
      mentions,
      isEdited: true,
    });
  }, [socket, extractMentions]);

  // Delete comment
  const deleteComment = useCallback((commentId: string) => {
    if (!socket) return;
    socket.emit('comments:delete', { commentId });
  }, [socket]);

  // Toggle reaction
  const toggleReaction = useCallback((commentId: string, emoji: string) => {
    if (!socket) return;
    socket.emit('comments:reaction', {
      commentId,
      emoji,
      userId,
      userName,
    });
  }, [socket, userId, userName]);

  // Send typing indicator
  const setTypingIndicator = useCallback((isTyping: boolean) => {
    if (!socket) return;
    socket.emit('comments:typing', {
      itemType,
      itemId,
      userId,
      userName,
      isTyping,
    });
  }, [socket, itemType, itemId, userId, userName]);

  // Get threaded comments
  const getThreadedComments = useCallback(() => {
    const threadMap = new Map<string, UniversalComment[]>();
    const rootComments: UniversalComment[] = [];

    comments.forEach(comment => {
      if (comment.parentId) {
        if (!threadMap.has(comment.parentId)) {
          threadMap.set(comment.parentId, []);
        }
        threadMap.get(comment.parentId)!.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments.map(comment => ({
      ...comment,
      replies: threadMap.get(comment.id) || [],
    }));
  }, [comments]);

  return {
    comments,
    threadedComments: getThreadedComments(),
    loading,
    typing,
    addComment,
    updateComment,
    deleteComment,
    toggleReaction,
    setTypingIndicator,
    extractMentions,
  };
}
