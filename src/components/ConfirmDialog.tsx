"use client";
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;
    // Focus the cancel button by default (safer)
    setTimeout(() => cancelRef.current?.focus(), 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
      if (e.key === 'Tab') {
        // simple focus trap
        const focusable = overlayRef.current?.querySelectorAll<HTMLElement>('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])') ?? [];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      try { (previouslyFocused.current as HTMLElement | null)?.focus(); } catch {}
    };
  }, [open, onCancel]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-hidden={!open}>
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div ref={overlayRef} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-desc" className="relative z-50 max-w-lg w-full mx-4 bg-white rounded shadow-lg p-6">
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-[#015958]">{title}</h2>
        {description && <p id="confirm-dialog-desc" className="mt-2 text-sm text-[#0CABA8]">{description}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button ref={cancelRef} onClick={onCancel} className="px-3 py-1 rounded bg-gray-100 text-[#015958] hover:bg-gray-200">{cancelLabel}</button>
          <button ref={confirmRef} onClick={onConfirm} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">{confirmLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
