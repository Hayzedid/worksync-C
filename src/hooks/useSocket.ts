import { useEffect } from 'react';
import { socket } from '../socket';

export function useSocket(event: string, handler: (...args: any[]) => void) {
  useEffect(() => {
    socket.on(event, handler);
    return () => { socket.off(event, handler); };
  }, [event, handler]);
} 