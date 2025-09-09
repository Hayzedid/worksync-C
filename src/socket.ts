import { io, Socket } from 'socket.io-client';

// If NEXT_PUBLIC_SOCKET_URL is set, use it; otherwise default to same-origin by passing no URL to io()
const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: Socket | null = null;

export function initializeSocket(): Socket {
  // If socket already exists and is connected, return it
  if (socket && socket.connected) {
    return socket;
  }

  // Read token client-side only (use sessionStorage access_token)
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;

  console.log('Initializing socket with token:', token ? 'present' : 'missing');

  // Create new socket connection with auth token
  socket = envUrl && envUrl.trim().length > 0
    ? io(envUrl, {
        withCredentials: true,
        auth: token ? { token } : undefined,
      })
    : io({
        withCredentials: true,
        auth: token ? { token } : undefined,
      });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Initialize socket for backwards compatibility
export { initializeSocket as socket };