import React, { useEffect } from "react";
import { useSocket } from "./SocketProvider";

export type CursorData = {
  userId: string;
  userName: string;
  color: string;
  position: number;
  selectionStart: number;
  selectionEnd: number;
};

export function LiveCursors({
  noteId,
  localUserId,
  localUserName,
  textareaRef,
  cursors,
}: {
  noteId: string;
  localUserId: string;
  localUserName: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  cursors: CursorData[];
}) {
  // keep unused vars to preserve public signature for callers
  void noteId;
  void localUserName;
  void textareaRef;
  // Render colored carets and selection highlights for each remote user
  // (For MVP, just show a list of users and their cursor positions)
  return (
    <div className="mb-2 flex flex-wrap gap-2 text-xs">
      {cursors.filter(c => c.userId !== localUserId).map(c => (
        <span key={c.userId} data-color={c.color} className="inline-flex items-center gap-1">
          {/* inline style for dynamic color (extraction to CSS is a separate task) */}
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
          {c.userName} at {c.position}
        </span>
      ))}
    </div>
  );
}

export function useLiveCursors({
  noteId,
  localUserId,
  localUserName,
  textareaRef,
}: {
  noteId: string;
  localUserId: string;
  localUserName: string;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const socket = useSocket();
  const [cursors, setCursors] = React.useState<CursorData[]>([]);

  // Broadcast local cursor/selection
  useEffect(() => {
    if (!socket || !noteId || !textareaRef.current) return;
    function sendCursor() {
      const el = textareaRef.current!;
      socket?.emit?.("note:cursor", {
        noteId,
        userId: localUserId,
        userName: localUserName,
        position: el.selectionStart,
        selectionStart: el.selectionStart,
        selectionEnd: el.selectionEnd,
      });
    }
    const el = textareaRef.current;
    if (el) {
      el.addEventListener("select", sendCursor);
      el.addEventListener("keyup", sendCursor);
      el.addEventListener("mouseup", sendCursor);
    }
    return () => {
      if (el) {
        el.removeEventListener("select", sendCursor);
        el.removeEventListener("keyup", sendCursor);
        el.removeEventListener("mouseup", sendCursor);
      }
    };
  }, [socket, noteId, localUserId, localUserName, textareaRef]);

  // Listen for remote cursors
  useEffect(() => {
    if (!socket || !noteId) return;
    function handleRemoteCursors(payload: { noteId: string; cursors: CursorData[] }) {
      if (payload.noteId === noteId) setCursors(payload.cursors);
    }
    socket.on("note:cursors", handleRemoteCursors);
    return () => {
      socket.off("note:cursors", handleRemoteCursors);
    };
  }, [socket, noteId]);

  return cursors;
}
