import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto py-24 px-6">
      <h1 className="font-serif text-3xl text-ink mb-2">Client Intelligence CRM</h1>
      <p className="text-muted mb-6">
        Research, classify, and understand potential client companies.
      </p>
      <Link
        href="/dashboard"
        className="bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-5 py-2.5 rounded-sm hover:bg-ink/90"
      >
        Go to dashboard →
      </Link>
    </main>
  );
}
