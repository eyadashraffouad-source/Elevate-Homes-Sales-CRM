import { ReactNode } from "react";

// ---- Section card: a single "index card" block on the profile page ----
export function SectionCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-line bg-paper/60 rounded-sm p-5">
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-muted">
          {eyebrow}
        </span>
      </div>
      {title && (
        <h3 className="font-serif text-lg text-ink mb-2">{title}</h3>
      )}
      <div className="text-sm text-ink/90 leading-relaxed">{children}</div>
    </div>
  );
}

// ---- Status stamp: the signature element. Rotated, bordered, ink-stamped ----
const STATUS_STYLES: Record<string, string> = {
  potential_prospect: "text-accent border-accent",
  contacted: "text-ink border-ink",
  qualified: "text-emerald-700 border-emerald-700",
  disqualified: "text-muted border-muted line-through",
  confirmed: "text-emerald-700 border-emerald-700",
  not_confirmed: "text-accent border-accent",
  unknown: "text-muted border-muted",
};

export function StatusStamp({ value }: { value: string }) {
  const style = STATUS_STYLES[value] ?? "text-muted border-muted";
  const label = value.replace(/_/g, " ");
  return (
    <span
      className={`inline-block font-mono text-[11px] tracking-[0.1em] uppercase border-2 px-2 py-0.5 -rotate-2 ${style}`}
    >
      {label}
    </span>
  );
}

// ---- Confidence tag: small inline marker on each contact ----
const CONFIDENCE_STYLES: Record<string, string> = {
  high: "bg-emerald-700",
  medium: "bg-accent",
  low: "bg-muted",
};

export function ConfidenceTag({ level }: { level: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-muted">
      <span
        className={`w-1.5 h-1.5 rounded-full ${CONFIDENCE_STYLES[level] ?? "bg-muted"}`}
      />
      {level} confidence
    </span>
  );
}

// ---- Research status ledger marker for the company list rows ----
const RESEARCH_DOT: Record<string, string> = {
  not_researched: "bg-line",
  researching: "bg-accent animate-pulse",
  researched: "bg-emerald-700",
  failed: "bg-red-700",
  needs_update: "bg-accent",
};

export function ResearchDot({ status }: { status: string }) {
  return (
    <span
      title={status.replace(/_/g, " ")}
      className={`inline-block w-2 h-2 rounded-full ${RESEARCH_DOT[status] ?? "bg-line"}`}
    />
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-mono uppercase tracking-wide border border-line text-muted px-1.5 py-0.5 rounded-sm">
      {children}
    </span>
  );
}
