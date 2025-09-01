// Export all collaboration components
export { 
  GlobalPresenceIndicator, 
  ItemPresenceIndicator, 
  TypingIndicator 
} from './GlobalPresenceIndicator';

export { UniversalComments } from './UniversalComments';
export { CollaborativeTaskEditor } from './CollaborativeTaskEditor';
export { RealtimeReactions } from './RealtimeReactions';

// Export types
export type { 
  GlobalPresenceUser 
} from '../hooks/collaboration/useGlobalPresence';

export type { 
  UniversalComment 
} from '../hooks/collaboration/useUniversalComments';

export type { 
  CollaborativeTask,
  TaskActivity 
} from '../hooks/collaboration/useCollaborativeTask';
