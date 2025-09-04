
import { useEffect, useRef } from 'react';
import Y, { Y as Yns } from '../lib/singleYjs';
import { WebsocketProvider } from 'y-websocket';

/**
 * useYjsDoc - React hook for Yjs CRDT document and provider lifecycle management.
 * @param docName Unique name for the shared document (e.g., 'task-123')
 * @param wsUrl WebSocket server URL (default: public Yjs demo)
 * @returns { ydoc, provider, ymap, ready }
 */
export function useYjsDoc(docName: string, wsUrl = 'wss://demos.yjs.dev') {
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const ymapRef = useRef<Y.Map<unknown> | null>(null);
  const awarenessRef = useRef<unknown>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(wsUrl, docName, ydoc);
  const ymap = ydoc.getMap('data');
    ydocRef.current = ydoc;
    providerRef.current = provider;
    ymapRef.current = ymap;
  // provider.awareness is a dynamic object from y-websocket; keep as unknown
  awarenessRef.current = provider.awareness as unknown;
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [docName, wsUrl]);

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    ymap: ymapRef.current,
    awareness: awarenessRef.current,
  };
}
