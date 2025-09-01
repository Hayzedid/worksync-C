"use client";
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import hotToast, { Toaster } from 'react-hot-toast';

export type ToastVariant = "success" | "error" | "info";
export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (t: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const ctr = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((t: Omit<Toast, "id">) => {
    const id = `${Date.now()}_${ctr.current++}`;
    
    // Use react-hot-toast for better UX
    if (t.variant === 'success') {
      hotToast.success(t.title || t.description || 'Success');
    } else if (t.variant === 'error') {
      hotToast.error(t.title || t.description || 'Error');
    } else {
      hotToast(t.title || t.description || 'Info');
    }
    const toast: Toast = { id, duration: 3000, variant: "info", ...t };
    setToasts(prev => [...prev, toast]);
    const dur = toast.duration ?? 3000;
    if (dur > 0) setTimeout(() => removeToast(id), dur);
  }, [removeToast]);

  const value = useMemo(() => ({ toasts, addToast, removeToast }), [toasts, addToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastHost() {
  return <Toaster position="bottom-right" />;
}
