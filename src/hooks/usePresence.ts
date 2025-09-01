import { useEffect, useState } from 'react';

export interface PresenceUser {
  clientId: number;
  name: string;
  color: string;
  avatar?: string | null;
}

// Utility: generate a color from a string (user id or name)
function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${hash % 360}, 70%, 60%)`;
}

/**
 * usePresence - React hook for Yjs Awareness presence
 * @param awareness Yjs awareness instance
 * @param localName User's display name
 * @param avatarUrl Optional avatar URL
 * @returns Array of online users (with name, color, avatar)
 */
export function usePresence(awareness: unknown, localName: string, avatarUrl?: string) {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!awareness) return;
    // awareness has a dynamic runtime API; narrow to a minimal shape and guard calls
    const aw = awareness as unknown as {
      setLocalStateField?: (k: string, v: unknown) => void;
      getStates?: () => Map<number, unknown>;
      on?: (ev: string, cb: () => void) => void;
      off?: (ev: string, cb: () => void) => void;
    };
    aw.setLocalStateField?.('user', {
      name: localName,
      color: stringToColor(localName),
      avatar: avatarUrl || null,
    });
    // Listen for changes
    const onChange = () => {
      // getStates may return a Map of client states
  const states = aw.getStates?.() || new Map<number, unknown>();
  const statesArr = Array.from(states.values()) as unknown[];
      setUsers(statesArr.map((s: unknown, i: number) => {
        const sObj = s as Record<string, unknown>;
        const user = (sObj['user'] ?? {}) as Record<string, unknown>;
        const clientId = typeof sObj['clientId'] === 'number' ? (sObj['clientId'] as number) : i;
        return {
          clientId,
          name: String(user['name'] ?? 'Anonymous'),
          color: String(user['color'] ?? '#0FC2C0'),
          avatar: (user['avatar'] as string | null) ?? null,
        };
      }));
    };
    aw.on?.('change', onChange);
    onChange();
    return () => aw.off?.('change', onChange);
  }, [awareness, localName, avatarUrl]);

  return users;
}
