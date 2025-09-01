import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "./SocketProvider";
import { api } from "../api";
import { useToast } from "./toast";
import Reactions from "./Reactions";

export function NoteChat({ noteId, userId, userName }: { noteId: string; userId: string; userName: string }) {
  const socket = useSocket();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<{ id?: string; userName: string; text: string; time: string; reactions?: Record<string, { count: number; reacted?: boolean }> }[]>([]);
  const [input, setInput] = useState("");
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // try to fetch users for mention suggestions; fallback silently if endpoint missing
    api.get('/users').then((data: unknown) => {
      // narrow shapes defensively
      const list = Array.isArray(data) ? (data as unknown[]) : ((data as Record<string, unknown>)['users'] as unknown[] | undefined) ?? [];
      setUsers((list as unknown[]).map((u: unknown) => {
        const uo = u as Record<string, unknown>;
        return { id: String(uo['id'] ?? uo['userId'] ?? uo['name']), name: String(uo['name'] ?? uo['userName'] ?? uo['username']) };
      }));
    }).catch(() => {/* ignore */});
  }, []);

  useEffect(() => {
    if (!socket || !noteId) return;
    socket.emit("note:join", { noteId, userId, userName });
    socket.on("note:chat", (msg: unknown) => {
      const m = msg as Record<string, unknown> | null;
      if (!m) return;
      if (String(m['noteId']) === noteId) setMessages((prev) => [...prev, {
        id: String(m['id'] ?? m['messageId'] ?? `m-${Date.now()}`),
        userName: String(m['userName'] ?? m['user'] ?? 'Unknown'),
        text: String(m['text'] ?? ''),
        time: String(m['time'] ?? new Date().toLocaleTimeString()),
        reactions: (m['reactions'] as Record<string, { count: number; reacted?: boolean }> | undefined) ?? undefined,
      }]);
    });
    // reactions update
    socket.on('reaction:update', (payload: unknown) => {
      const p = payload as Record<string, unknown> | null;
      if (!p || String(p['noteId']) !== noteId) return;
      const messageId = String(p['messageId']);
      const reactions = p['reactions'] as Record<string, { count: number; reacted?: boolean }> | undefined;
      setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, reactions } : m)));
    });
    return () => {
      socket.off("note:chat");
      socket.off('reaction:update');
    };
  }, [socket, noteId, userId, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // mention parsing helper
  function extractMentions(text: string) {
    const re = /@([a-zA-Z0-9_\-.]+)/g;
    const found: string[] = [];
    let m;
    while ((m = re.exec(text)) !== null) {
      found.push(m[1]);
    }
    return found;
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    const msg = {
      noteId,
      userName,
      text: input,
      time: new Date().toLocaleTimeString(),
    };
    // emit chat
    socket.emit("note:chat", msg);
  // assign an id client-side for optimistic updates
  const clientId = `m-${Date.now()}-${Math.round(Math.random()*1000)}`;
  const msgWithId = { ...msg, id: clientId };
  setMessages((prev) => [...prev, msgWithId]);
  // let server respond with canonical id later if available

    // parse mentions and emit notifications for each
    const mentions = extractMentions(input);
    for (const m of mentions) {
      // emit a notification event the backend/other clients can handle
      socket.emit('notification', { toUserName: m, message: `${userName} mentioned you in a note`, type: 'mention', noteId });
    }

    // show local toast as quick feedback
    if (mentions.length > 0) addToast({ title: 'Mention sent', description: `Mentioned: ${mentions.join(', ')}`, variant: 'info' });

    setInput("");
    setShowSuggestions(false);
  }

  // suggestions: show when input has an '@' token
  function handleChange(v: string) {
    setInput(v);
    const atMatch = /@([a-zA-Z0-9_\-.]*)$/.exec(v);
    if (atMatch) {
      const q = atMatch[1].toLowerCase();
      const matches = users.filter(u => u.name.toLowerCase().includes(q)).slice(0, 6);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }

  function chooseSuggestion(name: string) {
    // replace the last @token with chosen name
    const newVal = input.replace(/@([a-zA-Z0-9_\-.]*)$/, `@${name} `);
    setInput(newVal);
    setShowSuggestions(false);
  }

  return (
    <div className="border rounded p-3 mb-4 bg-white">
      <div className="font-semibold mb-2 text-[#0FC2C0]">Note Chat</div>
      <div className="max-h-40 overflow-y-auto mb-2 text-sm">
        {messages.map((m, i) => (
            <div key={m.id ?? i} className="mb-1">
              <div className="flex items-center gap-2">
                <span className={`font-bold ${m.userName === userName ? 'text-teal-400' : 'text-teal-900'}`}>{m.userName}</span>
                <span className="ml-2 text-gray-400 text-xs">{m.time}</span>
              </div>
              <div className="mt-1">{m.text}</div>
              <Reactions reactions={m.reactions} onToggle={(emoji) => {
                // optimistic toggle locally
                setMessages(prev => prev.map(msg => {
                  if (msg.id !== m.id) return msg;
                  const r = { ...(msg.reactions || {}) };
                  if (!r[emoji]) r[emoji] = { count: 1, reacted: true };
                  else {
                    const reacted = r[emoji].reacted ? false : true;
                    r[emoji] = { count: Math.max(0, r[emoji].count + (reacted ? 1 : -1)), reacted };
                  }
                  return { ...msg, reactions: r };
                }));
                // emit to server
                socket?.emit('reaction:toggle', { noteId, messageId: m.id, emoji, userId });
              }} />
            </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="relative">
        <div className="flex gap-2">
          <input
            aria-label="Note chat message"
            className="flex-1 border rounded p-1"
            value={input}
            onChange={e => handleChange(e.target.value)}
            placeholder="Type a message... Use @ to mention someone"
          />
          <button type="submit" className="bg-[#0FC2C0] text-white px-3 py-1 rounded">Send</button>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 mt-1 bg-white border rounded shadow z-40 w-full max-w-md">
            {suggestions.map(s => (
              <li key={s.id} className="px-3 py-2 hover:bg-[#F6FFFE] cursor-pointer" onClick={() => chooseSuggestion(s.name)}>{s.name}</li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
}
