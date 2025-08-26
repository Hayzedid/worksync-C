import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "./SocketProvider";

export function NoteChat({ noteId, userId, userName }: { noteId: string; userId: string; userName: string }) {
  const socket = useSocket();
  const [messages, setMessages] = useState<{ userName: string; text: string; time: string }[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket || !noteId) return;
    // Join chat room
    socket.emit("note:join", { noteId, userId, userName });
    // Listen for chat messages
    socket.on("note:chat", (msg: any) => {
      if (msg.noteId === noteId) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => {
      socket.off("note:chat");
    };
  }, [socket, noteId, userId, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    const msg = {
      noteId,
      userName,
      text: input,
      time: new Date().toLocaleTimeString(),
    };
    socket.emit("note:chat", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  }

  return (
    <div className="border rounded p-3 mb-4 bg-white">
      <div className="font-semibold mb-2 text-[#0FC2C0]">Note Chat</div>
      <div className="max-h-40 overflow-y-auto mb-2 text-sm">
        {messages.map((m, i) => (
          <div key={i} className="mb-1">
            <span className="font-bold" style={{ color: m.userName === userName ? '#0FC2C0' : '#015958' }}>{m.userName}</span>
            <span className="ml-2 text-gray-400">{m.time}</span>
            <div>{m.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 border rounded p-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-[#0FC2C0] text-white px-3 py-1 rounded">Send</button>
      </form>
    </div>
  );
}
