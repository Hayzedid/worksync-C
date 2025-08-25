import React, { useRef, useState } from 'react';
import { Button } from '../Button';

export function FileUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    onUpload(file);
  }

  return (
    <div className="border-2 border-dashed border-[#0CABA8] rounded p-6 flex flex-col items-center gap-4 bg-[#F6FFFE]">
      <label htmlFor="file-upload-input" className="sr-only">Select file to upload</label>
      <input
        id="file-upload-input"
        type="file"
        ref={inputRef}
        className="hidden"
        onChange={e => {
          if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
        }}
      />
      <Button className="bg-[#0FC2C0] text-white" onClick={() => inputRef.current?.click()}>Select File</Button>
      <div className="text-[#015958]">or drag and drop here</div>
      <div
        className="w-full h-32 flex items-center justify-center border border-[#0CABA8]/20 rounded bg-white"
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
        }}
      >
        {preview ? <img src={preview} alt="Preview" className="max-h-28 max-w-full object-contain" /> : <span className="text-[#0CABA8]">No file selected</span>}
      </div>
    </div>
  );
} 