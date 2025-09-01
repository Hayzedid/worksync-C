'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UniversalComment, useUniversalComments } from '@/hooks/collaboration/useUniversalComments';
import { GlobalPresenceUser } from '@/hooks/collaboration/useGlobalPresence';
import './UniversalComments.css';

interface UniversalCommentsProps {
  itemType: 'task' | 'project' | 'note' | 'event' | 'workspace';
  itemId: string;
  currentUserId: string;
  currentUserName: string;
  users: GlobalPresenceUser[];
  className?: string;
}

export const UniversalComments: React.FC<UniversalCommentsProps> = ({
  itemType,
  itemId,
  currentUserId,
  currentUserName,
  users,
  className = ''
}) => {
  const {
    comments,
    threadedComments,
    addComment,
    updateComment,
    deleteComment,
    toggleReaction,
    setTypingIndicator,
    loading,
    typing
  } = useUniversalComments(itemType, itemId, currentUserId, currentUserName);

  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
    }
  }, [newComment]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      addComment(newComment, replyToId || undefined);
      setNewComment('');
      setReplyToId(null);
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      updateComment(commentId, editText);
      setEditingCommentId(null);
      setEditText('');
    } catch (err) {
      console.error('Failed to edit comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
      } catch (err) {
        console.error('Failed to delete comment:', err);
      }
    }
  };

  const startEdit = (comment: UniversalComment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.content);
  };

  const startReply = (commentId: string) => {
    setReplyToId(commentId);
    textareaRef.current?.focus();
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId) || {
      id: userId,
      name: 'Unknown User',
      avatar: undefined,
      color: '#gray'
    };
  };

  const renderComment = (comment: UniversalComment, depth = 0) => {
    const user = getUserById(comment.userId);
    const isEditing = editingCommentId === comment.id;
    const canEdit = comment.userId === currentUserId;
    const replies = comments.filter(c => c.parentId === comment.id);

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
          <div className="flex items-start gap-3">
            {/* User Avatar */}
            <div
              className="user-avatar w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              data-user-color={user.color}
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

            <div className="flex-1 min-w-0">
              {/* Comment Header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-900">{user.name}</span>
                <span className="text-sm text-gray-500">
                  {formatTimestamp(comment.createdAt)}
                  {comment.updatedAt && comment.isEdited && ' (edited)'}
                </span>
              </div>

              {/* Comment Content */}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md resize-none"
                    rows={3}
                    placeholder="Edit your comment..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditText('');
                      }}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-900 whitespace-pre-wrap">{comment.content}</p>
                </div>
              )}

              {/* Reactions */}
              {comment.reactions && Object.keys(comment.reactions).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(comment.reactions).map(([emoji, reactionData]) => (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(comment.id, emoji)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm border ${
                        reactionData.users.includes(currentUserId)
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{reactionData.count}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Comment Actions */}
              {!isEditing && (
                <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                  <button
                    onClick={() => startReply(comment.id)}
                    className="hover:text-blue-600"
                  >
                    Reply
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleReaction(comment.id, '👍')}
                      className="hover:text-blue-600"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => toggleReaction(comment.id, '❤️')}
                      className="hover:text-red-600"
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => toggleReaction(comment.id, '😄')}
                      className="hover:text-yellow-600"
                    >
                      😄
                    </button>
                  </div>

                  {canEdit && (
                    <>
                      <button
                        onClick={() => startEdit(comment)}
                        className="hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="hover:text-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="space-y-3">
            {replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const topLevelComments = comments.filter(comment => !comment.parentId);

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        {replyToId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                Replying to comment
              </span>
              <button
                type="button"
                onClick={() => setReplyToId(null)}
                className="text-blue-700 hover:text-blue-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <div
            className="user-avatar w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
            data-user-color={getUserById(currentUserId).color}
          >
            {getUserById(currentUserId).avatar ? (
              <img
                src={getUserById(currentUserId).avatar}
                alt={getUserById(currentUserId).name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{getUserById(currentUserId).name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                adjustTextareaHeight(e.target);
              }}
              placeholder={replyToId ? "Write a reply..." : "Add a comment..."}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
            />
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                Use @ to mention users
              </span>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {replyToId ? 'Reply' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          topLevelComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};
