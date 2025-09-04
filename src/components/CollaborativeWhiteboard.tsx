import React, { useCallback, useEffect, useRef, useState } from 'react';
import Y, { Y as Yns } from '../lib/singleYjs';
import { useYjsDoc } from '../hooks/useYjsDoc';

type Point = { x: number; y: number };
type Stroke = { points: Point[]; color?: string; width?: number; userId?: string };

export default function CollaborativeWhiteboard({ docName, wsUrl }: { docName: string; wsUrl?: string }) {
  const { ydoc, ymap } = useYjsDoc(docName, wsUrl);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const yStrokesRef = useRef<Y.Array<unknown> | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  // initialize Y.Array for strokes and subscribe to changes
  useEffect(() => {
    if (!ymap || !ydoc) return;
  let yarr = ymap.get('strokes') as Y.Array<unknown> | undefined;
    if (!yarr) {
      yarr = new Y.Array();
      ymap.set('strokes', yarr);
    }
    yStrokesRef.current = yarr;

  const update = () => {
      try {
    const arr = yarr!.toArray() as unknown[];
        setStrokes(arr as Stroke[]);
      } catch {
        // noop
      }
    };

    update();
    const observer = () => update();
    yarr.observe(observer);
    return () => {
      yarr.unobserve(observer);
      yStrokesRef.current = null;
    };
  }, [ymap, ydoc]);

  // redraw canvas when strokes change
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw all strokes
    for (const s of strokes) {
      if (!s.points || s.points.length === 0) continue;
      ctx.strokeStyle = s.color || '#0FC2C0';
      ctx.lineWidth = s.width ?? 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
      ctx.stroke();
    }
  }, [strokes]);

  useEffect(() => {
    redraw();
  }, [strokes, redraw]);

  // helpers to convert client coords to canvas coords
  function getCanvasPoint(e: React.MouseEvent | React.TouchEvent): Point | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e && e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      clientX = t.clientX; clientY = t.clientY;
    } else {
      const ev = e as React.MouseEvent;
      clientX = ev.clientX; clientY = ev.clientY;
    }
    // account for devicePixelRatio scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const pt = getCanvasPoint(e);
    if (!pt) return;
    drawingRef.current = true;
    currentStrokeRef.current = { points: [pt], color: '#0FC2C0', width: 2 };
  }

  function moveDraw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawingRef.current || !currentStrokeRef.current) return;
    if ('preventDefault' in e && typeof e.preventDefault === 'function') e.preventDefault();
    const pt = getCanvasPoint(e as React.MouseEvent | React.TouchEvent);
    if (!pt) return;
    currentStrokeRef.current.points.push(pt);
    // optimistic local draw
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = currentStrokeRef.current;
    ctx.strokeStyle = s.color || '#0FC2C0';
    ctx.lineWidth = s.width ?? 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const pts = s.points;
    if (pts.length >= 2) {
      const a = pts[pts.length - 2];
      const b = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  function endDraw() {
    if (!drawingRef.current || !currentStrokeRef.current) return;
    const stroke = currentStrokeRef.current;
    drawingRef.current = false;
    currentStrokeRef.current = null;
    // push to Yjs
    const yarr = yStrokesRef.current;
    if (!yarr) return;
    try {
      yarr.push([stroke]);
    } catch {
      // fallback: transact
      ydoc?.transact(() => {
        yarr.push([stroke]);
      });
    }
  }

  // clear board
  function clearBoard() {
    const yarr = yStrokesRef.current;
    if (!yarr) return;
    ydoc?.transact(() => {
      yarr.delete(0, yarr.length);
    });
  }

  // setup canvas sizing for high-DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(300, Math.floor(rect.width * dpr));
      canvas.height = Math.max(150, Math.floor(rect.height * dpr));
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      redraw();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [redraw]);

  return (
    <div className="bg-white border rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-[#0FC2C0]">Collaborative Whiteboard</div>
        <div className="flex gap-2">
          <button onClick={clearBoard} className="px-3 py-1 bg-red-100 text-red-700 rounded">Clear</button>
          <div className="text-xs text-gray-500">Collaborating via Yjs</div>
        </div>
      </div>
      <div className="w-full h-64 border rounded overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onMouseDown={(e) => startDraw(e)}
          onMouseMove={(e) => moveDraw(e)}
          onMouseUp={() => endDraw()}
          onMouseLeave={() => endDraw()}
          onTouchStart={(e) => startDraw(e as unknown as React.TouchEvent)}
          onTouchMove={(e) => moveDraw(e as unknown as React.TouchEvent)}
          onTouchEnd={() => endDraw()}
        />
      </div>
    </div>
  );
}
