"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { CollaborativeRichTextEditor } from "../../../../components/CollaborativeRichTextEditor";
import Y, { Y as Yns } from '../../../../lib/singleYjs';
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
  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
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

    // Create UndoManager for this Y.Text so undo/redo works across collaborators
    const um = new Y.UndoManager(ytext);
    undoManagerRef.current = um;
    const updateStacks = () => {
      const um = undoManagerRef.current;
      if (!um) return;
      // Access UndoManager properties safely
      const undoStack = (um as unknown as Record<string, unknown>)['undoStack'];
      const redoStack = (um as unknown as Record<string, unknown>)['redoStack'];
      setCanUndo(Boolean(undoStack && Array.isArray(undoStack) && undoStack.length > 0));
      setCanRedo(Boolean(redoStack && Array.isArray(redoStack) && redoStack.length > 0));
    };
    um.on('stack-item-added', updateStacks);
    um.on('stack-item-popped', updateStacks);
    um.on('stack-cleared', updateStacks);
    // initial check
    updateStacks();

    // Sync initial content from backend only if empty (extract to allow retry)
    const fetchNote = async () => {
      try {
        const data = await api.get(`/notes/${id}`);
        setTitle(data.title);
        if (ytext.length === 0 && data.content) {
          ytext.insert(0, data.content);
        }
        setHistory([{ title: data.title, content: data.content, user: 'Initial', time: new Date().toLocaleTimeString() }]);
        setHistoryIndex(0);
        setLoadError(null);
      } catch (err: unknown) {
        const maybe = (err as Record<string, unknown>)?.message ?? String(err);
        setLoadError(String(maybe));
        console.error("Failed to load note:", err);
        addToast({ title: "Failed to load note", description: String(maybe), variant: "error" });
      }
    };
    void fetchNote();

    // Listen for Yjs content changes
    const updateContent = () => setContent(ytext.toString());
    ytext.observe(updateContent);
    setContent(ytext.toString());

    return () => {
      ytext.unobserve(updateContent);
  um.off('stack-item-added', updateStacks);
  um.off('stack-item-popped', updateStacks);
  um.off('stack-cleared', updateStacks);
  undoManagerRef.current = null;
  provider.destroy();
  ydoc.destroy();
    };
  }, [id, addToast]);

  // Join note room and set up socket listeners
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("note:join", { noteId: id, userId: localUserId, userName: localUserName });
    socket.on("note:update", (payload: unknown) => {
      const p = payload as Record<string, unknown>;
      if (p.noteId === id) {
        setTitle(String(p.title ?? ''));
        setContent(String(p.content ?? ''));
        setHistory(prev => ([...prev, { 
          title: String(p.title ?? ''), 
          content: String(p.content ?? ''), 
          user: String(p.userName ?? 'Remote'), 
          time: new Date().toLocaleTimeString() 
        }]));
        setHistoryIndex(prev => prev + 1);
      }
    });
    socket.on("note:presence", (payload: unknown) => {
      const p = payload as Record<string, unknown>;
      setPresence(Array.isArray(p.users) ? p.users : []);
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
    const um = undoManagerRef.current;
    if (um) um.undo();
  }
  function handleRedo() {
    const um = undoManagerRef.current;
    if (um) um.redo();
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
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/notes"
          className="inline-flex items-center gap-2 px-3 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0CABA8]"
        >
          ← Back to Notes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Collaborative Note</h1>
      </div>
      {loadError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          <div className="font-semibold">Failed to load note</div>
          <div className="text-sm mt-1 break-words">{loadError}</div>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => { setLoadError(null); /* re-run the effect by reloading the page */ window.location.reload(); }} className="px-3 py-1 rounded bg-[#015958] text-white hover:bg-[#0CABA8] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0CABA8]">Retry</button>
            {/* If the error indicates the note is missing, offer a safe back link */}
            {String(loadError).toLowerCase().includes('not found') && (
              <Link href="/notes" className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0CABA8]">Back to notes</Link>
            )}
            {/* If unauthorized, offer sign-in */}
            {String(loadError).toLowerCase().includes('unauthorized') && (
              <Link href="/login" className="px-3 py-1 rounded bg-white border border-[#015958] text-[#015958] hover:bg-[#0CABA8] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0CABA8]">Sign in</Link>
            )}
          </div>
        </div>
      )}
      <div className="flex gap-4 mb-4">
  <button onClick={handleUndo} disabled={!canUndo} className="px-2 py-1 rounded bg-[#015958] text-white disabled:opacity-50 hover:bg-[#0CABA8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0CABA8]">Undo</button>
  <button onClick={handleRedo} disabled={!canRedo} className="px-2 py-1 rounded bg-[#015958] text-white disabled:opacity-50 hover:bg-[#0CABA8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0CABA8]">Redo</button>
  <button onClick={() => setShowHistory(h => !h)} className="px-2 py-1 rounded bg-[#015958] text-white hover:bg-[#0CABA8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0CABA8]">History</button>
      </div>
      <LiveCursors
        noteId={String(id)}
        localUserId={localUserId}
        localUserName={localUserName}
        textareaRef={contentRef}
        cursors={cursors}
      />
      <div className="mb-2 text-sm flex flex-wrap gap-2 bg-white p-1 rounded">
        {presence.map((u, i) => (
          <span key={i} className={u.color === '#015958' ? 'text-[#015958]' : (u.color === '#0CABA8' || u.color === '#0FC2C0' || u.color === '#008F8C') ? 'text-[#0CABA8]' : u.color === '#F95738' ? 'text-[#F95738]' : 'text-gray-900'}>
            {u.userName} {u.typing ? <em>is typing…</em> : "is viewing"}
          </span>
        ))}
      </div>
      <NoteChat noteId={String(id)} userId={localUserId} userName={localUserName} />
      <input
        className="w-full border border-gray-300 rounded p-2 mb-4 bg-white text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0CABA8]"
        value={title}
        onChange={e => handleEdit("title", e.target.value)}
        placeholder="Note title"
      />
      <div className="border border-gray-300 rounded p-2 bg-white">
      <CollaborativeRichTextEditor
      docId={String(id)}
      userName={localUserName}
      userColor="#0CABA8"
  externalYdoc={ydocRef.current ?? undefined}
  externalProvider={yProviderRef.current ?? undefined}
  externalUndoManager={undoManagerRef.current ?? undefined}
    />
      </div>
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
                }} className="text-[#015958] underline text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0CABA8]">Restore</button>
                <hr className="my-1" />
              </li>
            ))}
          </ul>
          <button onClick={() => setShowHistory(false)} className="mt-2 px-2 py-1 rounded bg-[#015958] text-white hover:bg-[#0CABA8] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0CABA8]">Close</button>
        </div>
      )}
    </div>
  );
}
