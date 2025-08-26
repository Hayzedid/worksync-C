"use client";
import { useEffect, useState, useRef } from "react";
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams } from "next/navigation";
import { api } from "../../../../api";
import { useSocket } from "../../../../components/SocketProvider";
import { useToast } from "../../../../components/toast";


import { LiveCursors, useLiveCursors } from "../../../../components/LiveCursors";
import { NoteChat } from "../../../../components/NoteChat";

export default function NoteCollaborativePage() {
  // Yjs CRDT setup
  const ydocRef = useRef<Y.Doc | null>(null);
  const yProviderRef = useRef<WebsocketProvider | null>(null);
  const yTextRef = useRef<Y.Text | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  // Undo/Redo & Version History
  const [history, setHistory] = useState<{ title: string; content: string; user: string; time: string }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // For demo: use a placeholder user (replace with real user info in production)
  const localUserId = typeof window !== 'undefined' ? (window.localStorage.getItem('user_id') || 'user-' + Math.floor(Math.random() * 10000)) : 'user-demo';
  const localUserName = typeof window !== 'undefined' ? (window.localStorage.getItem('user_name') || 'Anonymous') : 'Anonymous';
  // Save random user id/name for demo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user_id', localUserId);
      window.localStorage.setItem('user_name', localUserName);
    }
  }, [localUserId, localUserName]);
  const { id } = useParams();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const cursors = useLiveCursors({ noteId: String(id), localUserId, localUserName, textareaRef: contentRef });
  const { addToast } = useToast();
  const socket = useSocket();
  const [note, setNote] = useState<any>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [presence, setPresence] = useState<{ userName: string; typing: boolean; color: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Yjs: Setup CRDT doc and provider for this note
  useEffect(() => {
    if (!id) return;
    // Create Yjs doc and provider
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider('wss://demos.yjs.dev', `note-${id}`, ydoc);
    const ytext = ydoc.getText('content');
    ydocRef.current = ydoc;
    yProviderRef.current = provider;
    yTextRef.current = ytext;

    // Sync initial content from backend only if empty
    api.get(`/notes/${id}`)
      .then((data) => {
        setNote(data);
        setTitle(data.title);
        if (ytext.length === 0 && data.content) {
          ytext.insert(0, data.content);
        }
        setHistory([{ title: data.title, content: data.content, user: 'Initial', time: new Date().toLocaleTimeString() }]);
        setHistoryIndex(0);
      })
      .catch(() => addToast({ title: "Failed to load note", variant: "error" }));

    // Listen for Yjs content changes
    const updateContent = () => setContent(ytext.toString());
    ytext.observe(updateContent);
    setContent(ytext.toString());

    return () => {
      ytext.unobserve(updateContent);
      provider.destroy();
      ydoc.destroy();
    };
  }, [id, addToast]);

  // Join note room and set up socket listeners
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("note:join", { noteId: id, userId: localUserId, userName: localUserName });
    socket.on("note:update", (payload: any) => {
      if (payload.noteId === id) {
        setTitle(payload.title);
        setContent(payload.content);
        setHistory(prev => ([...prev, { title: payload.title, content: payload.content, user: payload.userName || 'Remote', time: new Date().toLocaleTimeString() }]));
        setHistoryIndex(prev => prev + 1);
      }
    });
    socket.on("note:presence", (payload: any) => {
      setPresence(payload.users || []);
    });
    return () => {
      socket.emit("note:leave", { noteId: id });
      socket.off("note:update");
      socket.off("note:presence");
    };
  }, [socket, id, localUserId, localUserName]);

  // Typing indicator logic
  useEffect(() => {
    if (!socket || !id) return;
    if (isTyping) {
      socket.emit("note:typing", { noteId: id, userId: localUserId, isTyping: true });
      const timeout = setTimeout(() => {
        setIsTyping(false);
        socket.emit("note:typing", { noteId: id, userId: localUserId, isTyping: false });
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      socket.emit("note:typing", { noteId: id, userId: localUserId, isTyping: false });
    }
  }, [isTyping, socket, id, localUserId]);

  // Broadcast edits
  function handleEdit(field: "title" | "content", value: string) {
    if (!id) return;
    if (field === "title") setTitle(value);
    if (field === "content") {
      // Update Yjs text (CRDT)
      if (yTextRef.current) {
        // Replace all content (for simplicity, can be optimized)
        yTextRef.current.delete(0, yTextRef.current.length);
        yTextRef.current.insert(0, value);
      }
    }
    setIsTyping(true);
    // Save to history for undo/redo
    setHistory(prev => ([...prev.slice(0, historyIndex + 1), { title: field === 'title' ? value : title, content: field === 'content' ? value : content, user: localUserName, time: new Date().toLocaleTimeString() }]));
    setHistoryIndex(idx => idx + 1);
    if (socket) {
      socket.emit("note:edit", { noteId: id, field, value, userName: localUserName });
    }
  }

  function handleUndo() {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setTitle(prev.title);
      setContent(prev.content);
      setHistoryIndex(historyIndex - 1);
      if (socket) {
        socket.emit("note:edit", { noteId: id, field: "title", value: prev.title, userName: localUserName });
        socket.emit("note:edit", { noteId: id, field: "content", value: prev.content, userName: localUserName });
      }
    }
  }
  function handleRedo() {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setTitle(next.title);
      setContent(next.content);
      setHistoryIndex(historyIndex + 1);
      if (socket) {
        socket.emit("note:edit", { noteId: id, field: "title", value: next.title, userName: localUserName });
        socket.emit("note:edit", { noteId: id, field: "content", value: next.content, userName: localUserName });
      }
    }
  }

  // Live notifications for notes (must be after all variable declarations and useEffects)
  useEffect(() => {
    if (!socket) return;
    function handleNotification(payload: { message: string; type?: string }) {
      addToast({ title: payload.type || "Notification", description: payload.message, variant: "info" });
    }
    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, addToast]);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Collaborative Note</h1>
      <div className="flex gap-4 mb-4">
        <button onClick={handleUndo} disabled={historyIndex <= 0} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">Undo</button>
        <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50">Redo</button>
  <button onClick={() => setShowHistory(h => !h)} className="px-2 py-1 rounded bg-gray-200">History</button>
      </div>
      <LiveCursors
        noteId={String(id)}
        localUserId={localUserId}
        localUserName={localUserName}
        textareaRef={contentRef}
        cursors={cursors}
      />
      <div className="mb-2 text-sm text-[#0FC2C0] flex flex-wrap gap-2">
        {presence.map((u, i) => (
          <span key={i} className={u.color === '#0FC2C0' ? 'text-[#0FC2C0]' : u.color === '#0CABA8' ? 'text-[#0CABA8]' : u.color === '#008F8C' ? 'text-[#008F8C]' : u.color === '#015958' ? 'text-[#015958]' : u.color === '#F95738' ? 'text-[#F95738]' : ''}>
            {u.userName} {u.typing ? <em>is typing…</em> : "is viewing"}
          </span>
        ))}
      </div>
      <NoteChat noteId={String(id)} userId={localUserId} userName={localUserName} />
      <input
        className="w-full border rounded p-2 mb-4"
        value={title}
        onChange={e => handleEdit("title", e.target.value)}
        placeholder="Note title"
      />
      <textarea
        ref={contentRef}
        className="w-full border rounded p-2 min-h-[200px]"
        value={content}
        onChange={e => handleEdit("content", e.target.value)}
        placeholder="Start writing..."
        spellCheck={false}
        autoCorrect="off"
      />
      {/* Version History Sidebar */}
      {showHistory && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white border-l border-gray-200 shadow-lg p-4 overflow-y-auto z-50">
          <div className="font-bold mb-2">Version History</div>
          <ul className="text-xs">
            {history.map((h, i) => (
              <li key={i} className={i === historyIndex ? 'bg-[#F6FFFE] font-bold' : ''}>
                <div>By: {h.user} at {h.time}</div>
                <div>Title: {h.title}</div>
                <div>Content: {h.content}</div>
                <button onClick={() => {
                  setTitle(h.title);
                  setContent(h.content);
                  setHistoryIndex(i);
                  if (socket) {
                    socket.emit("note:edit", { noteId: id, field: "title", value: h.title, userName: localUserName });
                    socket.emit("note:edit", { noteId: id, field: "content", value: h.content, userName: localUserName });
                  }
                }} className="text-[#0FC2C0] underline text-xs">Restore</button>
                <hr className="my-1" />
              </li>
            ))}
          </ul>
          <button onClick={() => setShowHistory(false)} className="mt-2 px-2 py-1 rounded bg-gray-200">Close</button>
        </div>
      )}
    </div>
  );
}
