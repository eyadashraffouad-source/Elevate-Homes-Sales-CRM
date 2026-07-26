"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusStamp } from "@/components/ui";

interface ChatCompanyResult {
  id: string;
  name: string;
  location_city: string | null;
  location_state: string | null;
  industry: string | null;
  lead_status: string;
  decision_maker_status: string;
}

interface ChatTurn {
  question: string;
  explanation?: string;
  results?: ChatCompanyResult[];
  error?: string;
}

const EXAMPLES = [
  "Show me all real estate wholesalers in Texas",
  "Which companies have not been researched yet?",
  "Companies with a Sales Manager but no confirmed owner contact",
  "Show me all potential clients in Dallas",
];

export function ChatPanel() {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [pending, setPending] = useState(false);

  async function ask(q: string) {
    if (!q.trim() || pending) return;
    setPending(true);
    setQuestion("");

    try {
      const res = await fetch("/api/chat/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Query failed");

      setTurns((t) => [
        ...t,
        { question: q, explanation: body.filter?.explanation, results: body.companies },
      ]);
    } catch (err) {
      setTurns((t) => [
        ...t,
        { question: q, error: err instanceof Error ? err.message : "Query failed" },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      {turns.length === 0 && (
        <div className="border border-dashed border-line rounded-sm p-6 mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-3">
            Try asking
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => ask(ex)}
                className="text-left text-sm border border-line rounded-sm px-3 py-1.5 hover:border-accent hover:text-accent"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6 mb-6">
        {turns.map((turn, i) => (
          <div key={i}>
            <p className="font-serif text-lg text-ink mb-1">{turn.question}</p>
            {turn.error && <p className="text-sm text-red-700">{turn.error}</p>}
            {turn.explanation && (
              <p className="text-xs text-muted italic mb-3">{turn.explanation}</p>
            )}
            {turn.results && turn.results.length === 0 && (
              <p className="text-sm text-muted">No matching companies.</p>
            )}
            {turn.results && turn.results.length > 0 && (
              <div className="border border-line rounded-sm overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {turn.results.map((c) => (
                      <tr key={c.id} className="border-b border-line last:border-0">
                        <td className="py-2.5 px-4">
                          <Link
                            href={`/companies/${c.id}`}
                            className="font-medium text-ink hover:text-accent"
                          >
                            {c.name}
                          </Link>
                        </td>
                        <td className="py-2.5 px-4 text-muted">
                          {[c.location_city, c.location_state].filter(Boolean).join(", ") || "—"}
                        </td>
                        <td className="py-2.5 px-4 text-muted">{c.industry ?? "—"}</td>
                        <td className="py-2.5 px-4">
                          <StatusStamp value={c.lead_status} />
                        </td>
                        <td className="py-2.5 px-4">
                          <StatusStamp value={c.decision_maker_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about your companies…"
          className="flex-1 border border-line bg-white/70 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-5 py-2.5 rounded-sm hover:bg-ink/90 disabled:opacity-60"
        >
          {pending ? "Searching…" : "Ask"}
        </button>
      </form>
    </div>
  );
}
