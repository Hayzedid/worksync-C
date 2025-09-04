import React, { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  User, 
  Tag, 
  Calendar,
  Target,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2
} from 'lucide-react';
import { useKanbanBoard, KanbanCard, KanbanColumn } from '../../hooks/kanban/useKanbanBoard';
import { useAuth } from '../../hooks/useAuth';
import './kanban.css';

interface KanbanBoardProps {
  boardId: string;
  workspaceId: string;
  className?: string;
}

interface DragState {
  isDragging: boolean;
  draggedCard: KanbanCard | null;
  draggedOver: string | null;
}

export function KanbanBoard({ boardId, workspaceId, className = '' }: KanbanBoardProps) {
  const auth = useAuth();
  const {
    board,
    isLoading,
    error,
    addColumn,
    updateColumn,
    deleteColumn,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    activeUsers,
    getColumnMetrics
  } = useKanbanBoard(boardId, workspaceId);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCard: null,
    draggedOver: null
  });

  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);

  // Set CSS custom properties for dynamic styling
  React.useEffect(() => {
    if (!board) return;
    
    board.columns.forEach(column => {
      const columnElement = document.querySelector(`[data-column-color="${column.color}"]`) as HTMLElement;
      if (columnElement && column.color) {
        columnElement.style.setProperty('--column-color', column.color);
      }
    });

    board.cards.forEach(card => {
      if (card.actualHours && card.estimatedHours) {
        const progressElement = document.querySelector(`[data-progress="${Math.min((card.actualHours / card.estimatedHours) * 100, 100)}"]`) as HTMLElement;
        if (progressElement) {
          progressElement.style.setProperty('--progress', Math.min((card.actualHours / card.estimatedHours) * 100, 100).toString());
        }
      }
    });
  }, [board]);

  if (isLoading) {
    return (
      <div className={`kanban-board-loading ${className}`}>
        <div className="kanban-loading-spinner">
          <div className="spinner"></div>
          <p>Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`kanban-board-error ${className}`}>
        <AlertCircle className="error-icon" />
        <h3>Failed to load board</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className={`kanban-board-empty ${className}`}>
        <Target className="empty-icon" />
        <h3>No board found</h3>
        <p>The requested board could not be found.</p>
      </div>
    );
  }

  const handleDragStart = (card: KanbanCard) => {
    setDragState({
      isDragging: true,
      draggedCard: card,
      draggedOver: null
    });
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragState(prev => ({ ...prev, draggedOver: columnId }));
  };

  const handleDrop = async (e: React.DragEvent, columnId: string, index: number) => {
    e.preventDefault();
    
    if (!dragState.draggedCard) return;

    const result = {
      source: {
        droppableId: dragState.draggedCard.columnId,
        index: dragState.draggedCard.order
      },
      destination: {
        droppableId: columnId,
        index
      },
      draggableId: dragState.draggedCard.id
    };

    await moveCard(result);
    
    setDragState({
      isDragging: false,
      draggedCard: null,
      draggedOver: null
    });
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    
    await addColumn(newColumnTitle, '#f3f4f6');
    setNewColumnTitle('');
    setShowAddColumn(false);
  };

  const handleAddCard = async (columnId: string, title: string) => {
    const columnCards = board.cards.filter(card => card.columnId === columnId);
    
    await addCard({
      title,
      columnId,
      order: columnCards.length,
      priority: 'medium',
      tags: [],
      description: ''
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (columnId: string) => {
    switch (columnId) {
      case 'col-1': return <Clock className="column-icon" />;
      case 'col-2': return <Edit className="column-icon" />;
      case 'col-3': return <User className="column-icon" />;
      case 'col-4': return <CheckCircle2 className="column-icon" />;
      default: return <Target className="column-icon" />;
    }
  };

  return (
    <div className={`kanban-board ${className}`}>
      {/* Board Header */}
      <div className="kanban-header">
        <div className="board-info">
          <h1 className="board-title">{board.name}</h1>
          <div className="board-stats">
            <span className="stat">
              {board.columns.length} columns
            </span>
            <span className="stat">
              {board.cards.length} cards
            </span>
          </div>
        </div>
        
        {/* Active Users */}
        <div className="active-users">
          {activeUsers.map(user => (
            <div key={user.id} className="user-avatar" title={user.name}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="kanban-columns">
        {board.columns
          .sort((a, b) => a.order - b.order)
          .map(column => {
            const columnCards = board.cards
              .filter(card => card.columnId === column.id)
              .sort((a, b) => a.order - b.order);
            
            const metrics = getColumnMetrics(column.id);
            
            return (
              <div
                key={column.id}
                className={`kanban-column ${dragState.draggedOver === column.id ? 'drag-over' : ''}`}
                data-column-color={column.color || '#f3f4f6'}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id, columnCards.length)}
              >
                {/* Column Header */}
                <div className="column-header">
                  <div className="column-title-section">
                    {getStatusIcon(column.id)}
                    {editingColumn === column.id ? (
                      <input
                        aria-label={`Edit column ${column.title}`}
                        type="text"
                        defaultValue={column.title}
                        onBlur={async (e) => {
                          await updateColumn(column.id, { title: e.target.value });
                          setEditingColumn(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        autoFocus
                        className="column-title-input"
                      />
                    ) : (
                      <h3 
                        className="column-title"
                        onClick={() => setEditingColumn(column.id)}
                      >
                        {column.title}
                      </h3>
                    )}
                    <span className="card-count">
                      {columnCards.length}
                      {column.limit && (
                        <span className={`wip-limit ${metrics.wipLimitStatus}`}>
                          /{column.limit}
                        </span>
                      )}
                    </span>
                  </div>
                  
                  <div className="column-actions">
                    <button
                      onClick={() => handleAddCard(column.id, 'New Task')}
                      className="add-card-btn"
                      title="Add new card"
                      aria-label="Add new card"
                    >
                      <Plus size={16} />
                    </button>
                    <button 
                      className="column-menu-btn"
                      title="Column options"
                      aria-label="Column options"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>

                {/* Column Metrics */}
                {board.settings.allowWipLimits && column.limit && (
                  <div className={`column-metrics ${metrics.wipLimitStatus}`}>
                    <div className="metric">
                      <span className="metric-label">Cards:</span>
                      <span className="metric-value">{metrics.cardCount}/{column.limit}</span>
                    </div>
                    {metrics.wipLimitStatus !== 'ok' && (
                      <div className="wip-warning">
                        <AlertCircle size={14} />
                        {metrics.wipLimitStatus === 'exceeded' ? 'Limit exceeded!' : 'Near limit'}
                      </div>
                    )}
                  </div>
                )}

                {/* Cards */}
                <div className="column-cards">
                  {columnCards.map((card, index) => (
                    <KanbanCardComponent
                      key={card.id}
                      card={card}
                      index={index}
                      isDragging={dragState.draggedCard?.id === card.id}
                      onDragStart={() => handleDragStart(card)}
                      onEdit={() => setEditingCard(card.id)}
                      onDelete={() => deleteCard(card.id)}
                      onUpdate={(updates) => updateCard(card.id, updates)}
                      showCardNumbers={board.settings.showCardNumbers}
                    />
                  ))}
                  
                  {/* Drop Zone */}
                  <div
                    className="card-drop-zone"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, column.id, columnCards.length)}
                  >
                    {dragState.isDragging && dragState.draggedOver === column.id && (
                      <div className="drop-indicator">Drop here</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        {/* Add Column */}
        <div className="add-column">
          {showAddColumn ? (
            <div className="add-column-form">
              <input
                aria-label="New column title"
                type="text"
                placeholder="Column title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddColumn();
                  if (e.key === 'Escape') {
                    setShowAddColumn(false);
                    setNewColumnTitle('');
                  }
                }}
                autoFocus
                className="column-title-input"
              />
              <div className="form-actions">
                <button onClick={handleAddColumn} className="btn-primary">
                  Add Column
                </button>
                <button 
                  onClick={() => {
                    setShowAddColumn(false);
                    setNewColumnTitle('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddColumn(true)}
              className="add-column-btn"
            >
              <Plus size={20} />
              Add Column
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface KanbanCardProps {
  card: KanbanCard;
  index: number;
  isDragging: boolean;
  onDragStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<KanbanCard>) => void;
  showCardNumbers: boolean;
}

function KanbanCardComponent({
  card,
  index,
  isDragging,
  onDragStart,
  onEdit,
  onDelete,
  onUpdate,
  showCardNumbers
}: KanbanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const formatTimeEstimate = (hours?: number) => {
    if (!hours) return null;
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 8) return `${hours}h`;
    return `${Math.round(hours / 8)}d`;
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
  const isDueSoon = card.dueDate && 
    new Date(card.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <div
      className={`kanban-card ${isDragging ? 'dragging' : ''} ${isExpanded ? 'expanded' : ''}`}
      draggable
      onDragStart={onDragStart}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Card Header */}
      <div className="card-header">
        {showCardNumbers && (
          <span className="card-number">#{index + 1}</span>
        )}
        <div 
          className={`priority-indicator priority-${card.priority}`}
        />
        <div className="card-actions">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Edit card"
            aria-label="Edit card"
          >
            <Edit size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete card"
            aria-label="Delete card"
          >
            <Trash2 className="icon-delete" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <h4 className="card-title">{card.title}</h4>
        
        {card.description && isExpanded && (
          <p className="card-description">{card.description}</p>
        )}

        {/* Card Meta */}
        <div className="card-meta">
          {card.assignee && (
            <div className="assignee">
              {card.assignee.avatar ? (
                <img src={card.assignee.avatar} alt={card.assignee.name} />
              ) : (
                <div className="avatar-placeholder">
                  {card.assignee.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}

          {card.estimatedHours && (
            <div className="time-estimate">
              <Clock size={14} />
              <span>{formatTimeEstimate(card.estimatedHours)}</span>
            </div>
          )}

          {card.dueDate && (
            <div className={`due-date ${isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : ''}`}>
              <Calendar size={14} />
              <span>{new Date(card.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {card.tags.length > 0 && (
          <div className="card-tags">
            {card.tags.map(tag => (
              <span key={tag} className="tag">
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Progress Indicator */}
        {card.actualHours && card.estimatedHours && (
          <div className="progress-indicator">
            <div 
              className="progress-bar"
              data-progress={Math.min((card.actualHours / card.estimatedHours) * 100, 100)}
            />
            <span className="progress-text">
              {card.actualHours}h / {card.estimatedHours}h
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent': return '#ef4444';
    case 'high': return '#f59e0b';
    case 'medium': return '#3b82f6';
    case 'low': return '#10b981';
    default: return '#6b7280';
  }
}
