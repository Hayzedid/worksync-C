import React from 'react';
import { X } from 'lucide-react';

export type Tag = { id: number; label: string };

type TagListProps = {
  tags: Tag[];
  onAdd: (label: string) => void;
  onRemove: (id: number) => void;
};

export function TagList({ tags, onAdd, onRemove }: TagListProps) {
  return (
    <div>
      <h3 className="text-lg font-bold text-[#0FC2C0] mb-2">Tags</h3>
      <form
        onSubmit={e => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const input = form.elements.namedItem('tag') as HTMLInputElement;
          if (input.value.trim()) {
            onAdd(input.value);
            input.value = '';
          }
        }}
        className="flex gap-2 mb-2"
      >
  <label htmlFor="tag-input" className="sr-only">Add a tag</label>
  <input id="tag-input" name="tag" aria-label="Add a tag" className="flex-1 px-3 py-2 rounded border border-[#0CABA8]/30 focus:outline-none focus:ring-2 focus:ring-[#0FC2C0] text-[#015958] bg-[#F6FFFE]" placeholder="Add a tag..." />
        <button type="submit" className="bg-[#0FC2C0] text-white px-3 py-2 rounded">Add</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full bg-[#0CABA8] text-white text-sm">
            {tag.label}
            <button className="ml-2" title="Remove tag" aria-label="Remove tag" onClick={() => onRemove(tag.id)}><X className="h-4 w-4" /></button>
          </span>
        ))}
      </div>
    </div>
  );
} 