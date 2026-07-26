import { ChatPanel } from "@/components/ChatPanel";

export default function ChatPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
        Ask the database
      </p>
      <h1 className="font-serif text-3xl text-ink mb-6">Chat</h1>
      <ChatPanel />
    </main>
  );
}
