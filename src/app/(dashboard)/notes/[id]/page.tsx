"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function NoteRedirectPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      // Redirect to the edit page by default
      router.replace(`/notes/${id}/edit`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-[#F6FFFE] flex items-center justify-center">
      <div className="text-[#015958]">Redirecting to note editor...</div>
    </div>
  );
}
