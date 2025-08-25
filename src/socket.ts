import { io } from 'socket.io-client';

// If NEXT_PUBLIC_SOCKET_URL is set, use it; otherwise default to same-origin by passing no URL to io()
const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

// Read token client-side only (use sessionStorage access_token)
const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;

export const socket = envUrl && envUrl.trim().length > 0
  ? io(envUrl, {
      withCredentials: true,
      auth: token ? { token } : undefined,
    })
  : io({
      withCredentials: true,
      auth: token ? { token } : undefined,
    });