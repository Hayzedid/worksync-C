import React, { createContext, useContext, useEffect, useRef } from "react";
import { socket } from "../socket";

const SocketContext = createContext<typeof socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef(socket);

  useEffect(() => {
    // Connect on mount, disconnect on unmount
    const currentSocket = socketRef.current;
    if (!currentSocket.connected) {
      currentSocket.connect();
    }
    return () => {
      currentSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
