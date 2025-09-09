import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { initializeSocket, getSocket, disconnectSocket } from "../socket";
import type { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const initializationRef = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initializationRef.current) return;
    
    // Check if user is authenticated (has token)
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
    
    if (token) {
      console.log('User authenticated, initializing socket connection');
      const newSocket = initializeSocket();
      setSocket(newSocket);
      initializationRef.current = true;
    } else {
      console.log('User not authenticated, socket not initialized');
    }

    return () => {
      disconnectSocket();
      setSocket(null);
      initializationRef.current = false;
    };
  }, []);

  // Re-initialize socket when authentication changes
  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
      const currentSocket = getSocket();
      
      if (token && !currentSocket?.connected) {
        console.log('Auth token available, initializing socket');
        const newSocket = initializeSocket();
        setSocket(newSocket);
        initializationRef.current = true;
      } else if (!token && currentSocket?.connected) {
        console.log('Auth token removed, disconnecting socket');
        disconnectSocket();
        setSocket(null);
        initializationRef.current = false;
      }
    };

    // Listen for auth changes
    window.addEventListener('auth-change', checkAuth);

    // Check auth status periodically as backup
    const interval = setInterval(checkAuth, 5000);
    
    return () => {
      window.removeEventListener('auth-change', checkAuth);
      clearInterval(interval);
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
