import { ReactNode } from "react";

// ---- Section card: a single "index card" block on the profile page ----
export function SectionCard({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="border border-line bg-paper/60 rounded-sm p-5">
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-mono text-[11px] tracking-[0.15em] uppercase text-muted">
          {eyebrow}
        </span>
        {action}
      </div>
      {title && <h3 className="font-serif text-lg text-ink mb-2">{title}</h3>}
      <div className="text-sm text-ink/90 leading-relaxed">{children}</div>
    </div>
  );
}

// ---- Company status stamp ----
const COMPANY_STATUS_STYLES: Record<string, string> = {
  active: "text-emerald-700 border-emerald-700",
  prospect: "text-accent border-accent",
  customer: "text-emerald-700 border-emerald-700",
  inactive: "text-muted border-muted",
  lost: "text-muted border-muted line-through",
};

export function CompanyStatusStamp({ value }: { value: string }) {
  const style = COMPANY_STATUS_STYLES[value] ?? "text-muted border-muted";
  return (
    <span
      className={`inline-block font-mono text-[11px] tracking-[0.1em] uppercase border-2 px-2 py-0.5 -rotate-2 ${style}`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

// ---- Contact status stamp ----
const CONTACT_STATUS_STYLES: Record<string, string> = {
  active: "text-emerald-700 border-emerald-700",
  follow_up: "text-accent border-accent",
  unresponsive: "text-muted border-muted",
  inactive: "text-muted border-muted line-through",
};

export function ContactStatusStamp({ value }: { value: string }) {
  const style = CONTACT_STATUS_STYLES[value] ?? "text-muted border-muted";
  return (
    <span
      className={`inline-block font-mono text-[10px] tracking-[0.1em] uppercase border px-1.5 py-0.5 ${style}`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-mono uppercase tracking-wide border border-line text-muted px-1.5 py-0.5 rounded-sm">
      {children}
    </span>
  );
}

// ---- Small avatar-style initials circle for a contact ----
export function ContactAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      title={name}
      className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ink text-paper text-[11px] font-mono border border-line"
    >
      {initials || "?"}
    </span>
  );
}
