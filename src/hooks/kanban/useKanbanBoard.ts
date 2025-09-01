import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../useSocket';
import { useAuth } from '../useAuth';

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
  color?: string;
  limit?: number; // WIP limit
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanBoard {
  id: string;
  name: string;
  projectId?: string;
  workspaceId: string;
  columns: KanbanColumn[];
  cards: KanbanCard[];
  settings: {
    allowWipLimits: boolean;
    showCardNumbers: boolean;
    autoAssign: boolean;
    swimlanes: 'none' | 'assignee' | 'priority';
  };
}

interface DragResult {
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
  draggableId: string;
}

export interface KanbanBoardHook {
  // Board state
  board: KanbanBoard | null;
  isLoading: boolean;
  error: string | null;
  
  // Board operations
  createBoard: (name: string, projectId?: string) => Promise<void>;
  updateBoard: (boardId: string, updates: Partial<KanbanBoard>) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  
  // Column operations
  addColumn: (title: string, color?: string) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<KanbanColumn>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  reorderColumns: (columnIds: string[]) => Promise<void>;
  
  // Card operations
  addCard: (card: Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<KanbanCard>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (result: DragResult) => Promise<void>;
  
  // Real-time collaboration
  activeUsers: Array<{
    id: string;
    name: string;
    avatar?: string;
    cursor?: { x: number; y: number };
    selectedCard?: string;
  }>;
  
  // Filters and views
  filters: {
    assignee?: string;
    priority?: string[];
    tags?: string[];
    dueDate?: 'overdue' | 'today' | 'week' | 'month';
  };
  setFilters: (filters: any) => void;
  
  // Analytics
  getColumnMetrics: (columnId: string) => {
    cardCount: number;
    totalHours: number;
    averageAge: number;
    wipLimitStatus: 'ok' | 'warning' | 'exceeded';
  };
}

export function useKanbanBoard(
  boardId: string,
  workspaceId: string
): KanbanBoardHook {
  const socket = useSocket();
  const auth = useAuth();
  
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});

  // Initialize board and join collaboration room
  useEffect(() => {
    if (!socket || !boardId || !auth?.user?.id) return;

    const initializeBoard = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Join the board room for real-time updates
        socket.emit('kanban:join', {
          boardId,
          userId: auth.user.id,
          userName: auth.user.name,
          userAvatar: auth.user.avatar
        });

        // Load board data (this would typically come from API)
        const mockBoard: KanbanBoard = {
          id: boardId,
          name: 'Project Board',
          workspaceId,
          columns: [
            { id: 'col-1', title: 'To Do', order: 0, color: '#f3f4f6' },
            { id: 'col-2', title: 'In Progress', order: 1, color: '#fef3c7', limit: 3 },
            { id: 'col-3', title: 'Review', order: 2, color: '#dbeafe', limit: 2 },
            { id: 'col-4', title: 'Done', order: 3, color: '#d1fae5' }
          ],
          cards: [
            {
              id: 'card-1',
              title: 'Design user interface',
              description: 'Create wireframes and mockups for the new dashboard',
              columnId: 'col-1',
              order: 0,
              priority: 'high',
              tags: ['design', 'ui'],
              assigneeId: auth.user.id,
              assignee: {
                id: auth.user.id,
                name: auth.user.name,
                avatar: auth.user.avatar
              },
              dueDate: '2025-09-01',
              estimatedHours: 8,
              createdAt: '2025-08-20T10:00:00Z',
              updatedAt: '2025-08-20T10:00:00Z'
            },
            {
              id: 'card-2',
              title: 'Implement authentication',
              description: 'Set up JWT authentication with refresh tokens',
              columnId: 'col-2',
              order: 0,
              priority: 'urgent',
              tags: ['backend', 'security'],
              estimatedHours: 12,
              actualHours: 6,
              createdAt: '2025-08-19T14:00:00Z',
              updatedAt: '2025-08-26T16:30:00Z'
            }
          ],
          settings: {
            allowWipLimits: true,
            showCardNumbers: true,
            autoAssign: false,
            swimlanes: 'none'
          }
        };

        setBoard(mockBoard);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load board');
      } finally {
        setIsLoading(false);
      }
    };

    initializeBoard();

    return () => {
      socket.emit('kanban:leave', { boardId, userId: auth.user.id });
    };
  }, [socket, boardId, workspaceId, auth?.user?.id]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleBoardUpdate = (data: any) => {
      setBoard(prev => prev ? { ...prev, ...data } : null);
    };

    const handleColumnUpdate = (data: { columnId: string; updates: Partial<KanbanColumn> }) => {
      setBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          columns: prev.columns.map(col =>
            col.id === data.columnId ? { ...col, ...data.updates } : col
          )
        };
      });
    };

    const handleCardUpdate = (data: { cardId: string; updates: Partial<KanbanCard> }) => {
      setBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: prev.cards.map(card =>
            card.id === data.cardId ? { ...card, ...data.updates } : card
          )
        };
      });
    };

    const handleCardMove = (data: { cardId: string; fromColumn: string; toColumn: string; newOrder: number }) => {
      setBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: prev.cards.map(card =>
            card.id === data.cardId 
              ? { ...card, columnId: data.toColumn, order: data.newOrder }
              : card
          )
        };
      });
    };

    const handleUsersUpdate = (users: any[]) => {
      setActiveUsers(users);
    };

    socket.on('kanban:board-updated', handleBoardUpdate);
    socket.on('kanban:column-updated', handleColumnUpdate);
    socket.on('kanban:card-updated', handleCardUpdate);
    socket.on('kanban:card-moved', handleCardMove);
    socket.on('kanban:users-updated', handleUsersUpdate);

    return () => {
      socket.off('kanban:board-updated', handleBoardUpdate);
      socket.off('kanban:column-updated', handleColumnUpdate);
      socket.off('kanban:card-updated', handleCardUpdate);
      socket.off('kanban:card-moved', handleCardMove);
      socket.off('kanban:users-updated', handleUsersUpdate);
    };
  }, [socket]);

  // Board operations
  const createBoard = useCallback(async (name: string, projectId?: string) => {
    if (!socket) throw new Error('Socket not connected');
    
    socket.emit('kanban:create-board', {
      name,
      projectId,
      workspaceId,
      userId: auth?.user?.id
    });
  }, [socket, workspaceId, auth?.user?.id]);

  const updateBoard = useCallback(async (boardId: string, updates: Partial<KanbanBoard>) => {
    if (!socket) throw new Error('Socket not connected');
    
    socket.emit('kanban:update-board', { boardId, updates });
  }, [socket]);

  const deleteBoard = useCallback(async (boardId: string) => {
    if (!socket) throw new Error('Socket not connected');
    
    socket.emit('kanban:delete-board', { boardId });
  }, [socket]);

  // Column operations
  const addColumn = useCallback(async (title: string, color?: string) => {
    if (!socket || !board) throw new Error('Socket not connected or board not loaded');
    
    const newColumn: KanbanColumn = {
      id: `col-${Date.now()}`,
      title,
      order: board.columns.length,
      color
    };

    socket.emit('kanban:add-column', { boardId: board.id, column: newColumn });
  }, [socket, board]);

  const updateColumn = useCallback(async (columnId: string, updates: Partial<KanbanColumn>) => {
    if (!socket || !board) throw new Error('Socket not connected or board not loaded');
    
    socket.emit('kanban:update-column', { boardId: board.id, columnId, updates });
  }, [socket, board]);

  const deleteColumn = useCallback(async (columnId: string) => {
    if (!socket || !board) throw new Error('Socket not connected or board not loaded');
    
    socket.emit('kanban:delete-column', { boardId: board.id, columnId });
  }, [socket, board]);

  const reorderColumns = useCallback(async (columnIds: string[]) => {
    if (!socket || !board) throw new Error('Socket not connected or board not loaded');
    
    socket.emit('kanban:reorder-columns', { boardId: board.id, columnIds });
  }, [socket, board]);

  // Card operations
  const addCard = useCallback(async (card: Omit<KanbanCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!socket || !board) throw new Error('Socket not connected or board not loaded');
    
    const newCard: KanbanCard = {
      ...card,
      id: `card-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    socket.emit('kanban:add-card', { boardId: board.id, card: newCard });
  }, [socket, board]);

  const updateCard = useCallback(async (cardId: string, updates: Partial<KanbanCard>) => {
    if (!socket || !board) throw new Error('Socket not connected or board not loaded');
    
    socket.emit('kanban:update-card', { 
      boardId: board.id, 
      cardId, 
      updates: { ...updates, updatedAt: new Date().toISOString() }
    });
  }, [socket, board]);

  const deleteCard = useCallback(async (cardId: string) => {
    if (!socket || !board) throw new Error('Socket not connected or board not loaded');
    
    socket.emit('kanban:delete-card', { boardId: board.id, cardId });
  }, [socket, board]);

  const moveCard = useCallback(async (result: DragResult) => {
    if (!socket || !board || !result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    socket.emit('kanban:move-card', {
      boardId: board.id,
      cardId: draggableId,
      fromColumn: source.droppableId,
      toColumn: destination.droppableId,
      fromIndex: source.index,
      toIndex: destination.index
    });
  }, [socket, board]);

  // Analytics
  const getColumnMetrics = useCallback((columnId: string) => {
    if (!board) {
      return {
        cardCount: 0,
        totalHours: 0,
        averageAge: 0,
        wipLimitStatus: 'ok' as const
      };
    }

    const column = board.columns.find(col => col.id === columnId);
    const columnCards = board.cards.filter(card => card.columnId === columnId);
    
    const cardCount = columnCards.length;
    const totalHours = columnCards.reduce((sum, card) => sum + (card.estimatedHours || 0), 0);
    const averageAge = columnCards.length > 0 
      ? columnCards.reduce((sum, card) => {
          const age = (Date.now() - new Date(card.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return sum + age;
        }, 0) / columnCards.length
      : 0;
    
    let wipLimitStatus: 'ok' | 'warning' | 'exceeded' = 'ok';
    if (column?.limit) {
      if (cardCount >= column.limit) {
        wipLimitStatus = 'exceeded';
      } else if (cardCount >= column.limit * 0.8) {
        wipLimitStatus = 'warning';
      }
    }

    return {
      cardCount,
      totalHours,
      averageAge,
      wipLimitStatus
    };
  }, [board]);

  return {
    board,
    isLoading,
    error,
    createBoard,
    updateBoard,
    deleteBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    activeUsers,
    filters,
    setFilters,
    getColumnMetrics
  };
}
