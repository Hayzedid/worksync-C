import React, { useEffect, useRef } from "react";
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
  // Render colored carets and selection highlights for each remote user
  // (For MVP, just show a list of users and their cursor positions)
  return (
    <div className="mb-2 flex flex-wrap gap-2 text-xs">
      {cursors.filter(c => c.userId !== localUserId).map(c => (
        <span key={c.userId} style={{ color: c.color }}>
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
      socket.emit("note:cursor", {
        noteId,
        userId: localUserId,
        userName: localUserName,
        position: el.selectionStart,
        selectionStart: el.selectionStart,
        selectionEnd: el.selectionEnd,
      });
    }
    textareaRef.current.addEventListener("select", sendCursor);
    textareaRef.current.addEventListener("keyup", sendCursor);
    textareaRef.current.addEventListener("mouseup", sendCursor);
    return () => {
      textareaRef.current?.removeEventListener("select", sendCursor);
      textareaRef.current?.removeEventListener("keyup", sendCursor);
      textareaRef.current?.removeEventListener("mouseup", sendCursor);
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
