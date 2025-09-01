import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from './SocketProvider';

type PCMap = Record<string, RTCPeerConnection>;

export default function Huddle({ roomId, userId, userName }: { roomId: string; userId: string; userName: string }) {
  const socket = useSocket();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const pcsRef = useRef<PCMap>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const [inCall, setInCall] = useState(false);

  const createPeer = useCallback((remoteId: string) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcsRef.current[remoteId] = pc;
    // add local tracks
    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getTracks()) pc.addTrack(t, localStreamRef.current);
    }
    pc.onicecandidate = (e) => {
      if (e.candidate) socket?.emit('huddle:ice', { to: remoteId, from: userId, candidate: e.candidate, roomId });
    };
    pc.ontrack = (e) => {
      setRemoteStreams(s => ({ ...s, [remoteId]: e.streams[0] }));
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        pc.close(); delete pcsRef.current[remoteId]; setRemoteStreams(s => { const c = { ...s }; delete c[remoteId]; return c; });
      }
    };
    return pc;
  }, [socket, userId, roomId]);

  useEffect(() => {
    if (!socket) return;
    const onOffer = async (data: unknown) => {
      const d = data as Record<string, unknown>;
      const fromId = String(d['from'] ?? '');
      const rid = String(d['roomId'] ?? '');
      if (rid !== roomId || fromId === userId) return;
      // create pc if not exists
      let pc = pcsRef.current[fromId];
      if (!pc) pc = createPeer(fromId);
  await pc.setRemoteDescription(new RTCSessionDescription(d['offer'] as unknown as RTCSessionDescriptionInit));
      // create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('huddle:answer', { to: fromId, from: userId, roomId, answer });
    };

    const onAnswer = async (data: unknown) => {
      const d = data as Record<string, unknown>;
      if (String(d['roomId']) !== roomId || String(d['to']) !== userId) return;
      const pc = pcsRef.current[String(d['from'])];
      if (!pc) return;
  await pc.setRemoteDescription(new RTCSessionDescription(d['answer'] as unknown as RTCSessionDescriptionInit));
    };

    const onIce = (data: unknown) => {
      const d = data as Record<string, unknown>;
      if (String(d['roomId']) !== roomId || String(d['to']) !== userId) return;
      const pc = pcsRef.current[String(d['from'])];
      if (!pc) return;
  pc.addIceCandidate(new RTCIceCandidate(d['candidate'] as unknown as RTCIceCandidateInit)).catch(()=>{});
    };

    const onLeave = (data: unknown) => {
      const d = data as Record<string, unknown>;
      const uid = String(d['userId'] ?? '');
      const rid = String(d['roomId'] ?? '');
      if (rid !== roomId) return;
      const pc = pcsRef.current[uid];
      if (pc) {
        pc.close();
        delete pcsRef.current[uid];
      }
      setRemoteStreams(s => { const copy = { ...s }; delete copy[uid]; return copy; });
    };

    socket.on('huddle:offer', onOffer);
    socket.on('huddle:answer', onAnswer);
    socket.on('huddle:ice', onIce);
    socket.on('huddle:leave', onLeave);

    return () => {
      socket.off('huddle:offer', onOffer);
      socket.off('huddle:answer', onAnswer);
      socket.off('huddle:ice', onIce);
      socket.off('huddle:leave', onLeave);
    };
  }, [socket, roomId, userId, createPeer]);

  async function startCall() {
    if (!socket) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setInCall(true);
      socket.emit('huddle:join', { roomId, userId, userName });
      // ask others to connect by creating offers to them when we get a list
      socket.emit('huddle:requestPeers', { roomId });
      // listen for peer-list reply
      const onPeers = (data: unknown) => {
        const d = data as Record<string, unknown>;
        if (String(d['roomId']) !== roomId) return;
        const peers = (d['peers'] as unknown[]) ?? [];
        for (const p of peers) {
          const peerId = String(p);
          if (peerId === userId) continue;
          const pc = createPeer(peerId);
          // create offer
          pc.createOffer().then(o => pc.setLocalDescription(o).then(() => {
            socket.emit('huddle:offer', { to: peerId, from: userId, roomId, offer: o });
          }));
        }
      };
      socket.on('huddle:peers', onPeers);
      // cleanup handler removal when leaving
    } catch (e) {
      console.error('media error', e);
    }
  }

  function leaveCall() {
    socket?.emit('huddle:leave', { roomId, userId });
    for (const k of Object.keys(pcsRef.current)) {
      pcsRef.current[k].close(); delete pcsRef.current[k];
    }
    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getTracks()) t.stop();
      localStreamRef.current = null;
    }
    setRemoteStreams({});
    setInCall(false);
  }

  return (
    <div className="bg-white border rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-[#0FC2C0]">Huddle</div>
        <div className="flex gap-2">
          {!inCall ? (
            <button onClick={startCall} className="px-3 py-1 bg-green-100 text-green-700 rounded">Start</button>
          ) : (
            <button onClick={leaveCall} className="px-3 py-1 bg-red-100 text-red-700 rounded">Leave</button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="border rounded overflow-hidden">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-48 object-cover" />
        </div>
        {Object.entries(remoteStreams).map(([id, stream]) => (
          <div key={id} className="border rounded overflow-hidden">
            <video
              autoPlay
              playsInline
              className="w-full h-48 object-cover"
              ref={el => { if (el) el.srcObject = stream; }}
            />
            <div className="p-1 text-xs text-gray-600">{id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
