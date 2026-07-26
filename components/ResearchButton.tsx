"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResearchButton({ companyId }: { companyId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}/research`, {
        method: "POST",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Research failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={pending}
        className="bg-accent text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-4 py-2 rounded-sm hover:bg-accent/90 disabled:opacity-60 disabled:cursor-wait"
      >
        {pending ? "Researching…" : "Research company"}
      </button>
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
    </div>
  );
}
