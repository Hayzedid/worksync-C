import { useEffect } from 'react';
import { useSocket as useSocketFromProvider } from '../components/SocketProvider';

export function useSocket(event: string, handler: (...args: unknown[]) => void) {
  const socket = useSocketFromProvider();
  
  useEffect(() => {
    if (!socket) return; // No socket available (user not authenticated)
    
    // wrap handler so we control arguments and avoid spreading any
    const wrapped = (...args: unknown[]) => handler(...args);
    socket.on(event, wrapped as (...args: unknown[]) => void);
    return () => { socket.off(event, wrapped as (...args: unknown[]) => void); };
  }, [socket, event, handler]);
}