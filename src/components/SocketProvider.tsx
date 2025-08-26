import React, { createContext, useContext, useEffect, useRef } from "react";
import { socket } from "../socket";

const SocketContext = createContext<typeof socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef(socket);

  useEffect(() => {
    // Connect on mount, disconnect on unmount
    if (!socketRef.current.connected) {
      socketRef.current.connect();
    }
    return () => {
      socketRef.current.disconnect();
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
