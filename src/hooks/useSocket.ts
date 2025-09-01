import { useEffect } from 'react';
import { socket } from '../socket';

export function useSocket(event: string, handler: (...args: unknown[]) => void) {
  useEffect(() => {
    // wrap handler so we control arguments and avoid spreading any
    const wrapped = (...args: unknown[]) => handler(...args);
    socket.on(event, wrapped as (...args: unknown[]) => void);
    return () => { socket.off(event, wrapped as (...args: unknown[]) => void); };
  }, [event, handler]);
}