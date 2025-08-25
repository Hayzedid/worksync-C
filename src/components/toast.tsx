"use client";
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

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
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed z-[1000] bottom-4 right-4 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`min-w-[260px] max-w-[380px] rounded-md border px-4 py-3 shadow bg-white ${
            t.variant === "success" ? "border-green-300" : t.variant === "error" ? "border-red-300" : "border-[#0CABA8]/40"
          }`}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {t.title && <div className="text-sm font-semibold text-[#015958]">{t.title}</div>}
              {t.description && <div className="text-xs text-[#0CABA8] mt-0.5">{t.description}</div>}
            </div>
            <button
              className="text-xs text-[#0CABA8] hover:underline"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
