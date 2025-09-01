import React, { useEffect, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface CollaborativeRichTextEditorProps {
  docId: string;
  userName: string;
  userColor?: string;
  // optional external yjs doc/provider and undo manager
  externalYdoc?: Y.Doc;
  externalProvider?: WebsocketProvider;
  externalUndoManager?: Y.UndoManager;
}

export const CollaborativeRichTextEditor: React.FC<CollaborativeRichTextEditorProps> = ({ docId, userName, userColor, externalYdoc, externalProvider, externalUndoManager }) => {
  // Yjs setup - allow external injection from parent page so undo/redo and provider are shared
  const ydoc = useMemo(() => externalYdoc ?? new Y.Doc(), [externalYdoc]);
  const provider = useMemo(() => externalProvider ?? new WebsocketProvider('wss://demos.yjs.dev', `note-${docId}`, ydoc), [docId, ydoc, externalProvider]);

  // Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: userName,
          color: userColor || '#0FC2C0',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg w-full min-h-[200px] border rounded p-2 bg-white',
      },
      // Handle clipboard operations gracefully
      handlePaste: (view, event) => {
        try {
          // Let TipTap handle the paste normally
          return false;
        } catch (error) {
          console.warn('Paste operation failed:', error);
          return true; // Prevent default handling
        }
      },
      handleDrop: (view, event) => {
        try {
          // Let TipTap handle the drop normally
          return false;
        } catch (error) {
          console.warn('Drop operation failed:', error);
          return true; // Prevent default handling
        }
      },
    },
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // If parent provided ydoc/provider we should not destroy them here.
    return () => {
      if (!externalProvider) provider.destroy();
      if (!externalYdoc) ydoc.destroy();
    };
  }, [provider, ydoc, externalProvider, externalYdoc]);

  // Integrate with external UndoManager if provided: map editor undo to Y.UndoManager
  useEffect(() => {
    if (!editor) return;
    const target = containerRef.current;
    if (externalUndoManager && target) {
      const handler = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
          event.preventDefault();
          externalUndoManager.undo();
        }
        if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
          event.preventDefault();
          externalUndoManager.redo();
        }
      };
      // Attach to the editor container so handlers only fire when editor is focused
      target.addEventListener('keydown', handler as EventListener);
      return () => target.removeEventListener('keydown', handler as EventListener);
    }
  }, [editor, externalUndoManager]);

  return (
    <div ref={containerRef}>
      <EditorContent editor={editor} />
      <div className="text-xs text-[#0CABA8] mt-2">All changes, cursors, and presence are synced in real time.</div>
    </div>
  );
};
