"use client";
import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../hooks/useAuth";
import { ToastProvider, ToastHost } from "./toast";
import { SocketProvider } from "./SocketProvider";
import { NotificationProvider } from './notifications/NotificationProvider';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
            <ToastHost />
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}


