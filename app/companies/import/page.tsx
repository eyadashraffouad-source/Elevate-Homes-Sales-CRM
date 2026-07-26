"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { importCompaniesFromCsv, ImportSummary } from "@/lib/actions/companies";

const initialState: ImportSummary = { created: 0, skippedDuplicates: [], errors: [] };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-5 py-2.5 rounded-sm hover:bg-ink/90 disabled:opacity-60"
    >
      {pending ? "Importing…" : "Import"}
    </button>
  );
}

export default function ImportCompaniesPage() {
  const [summary, formAction] = useFormState(importCompaniesFromCsv, initialState);

  return (
    <main className="max-w-2xl mx-auto py-12 px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
        Bulk import
      </p>
      <h1 className="font-serif text-3xl text-ink mb-2">Import companies from CSV</h1>
      <p className="text-sm text-muted mb-6">
        Header row required. Recognized columns (any subset, case-insensitive):{" "}
        <code className="font-mono text-xs bg-white/60 px-1 py-0.5 rounded-sm">
          name, website_url, google_maps_url, linkedin_url, instagram_url,
          facebook_url, notes
        </code>
        . Rows matching an existing company by name or domain are skipped, not
        duplicated.
      </p>

      <form action={formAction} className="mb-8">
        <input
          type="file"
          name="file"
          accept=".csv"
          required
          className="block w-full text-sm border border-line bg-white/70 rounded-sm px-3 py-2 mb-4 file:mr-3 file:border-0 file:bg-ink file:text-paper file:font-mono file:text-[11px] file:uppercase file:tracking-[0.1em] file:px-3 file:py-1.5 file:rounded-sm"
        />
        <SubmitButton />
      </form>

      {(summary.created > 0 ||
        summary.skippedDuplicates.length > 0 ||
        summary.errors.length > 0) && (
        <div className="border border-line rounded-sm p-5 space-y-4">
          <p className="font-serif text-lg text-ink">
            {summary.created} company{summary.created === 1 ? "" : "ies"} added
          </p>

          {summary.skippedDuplicates.length > 0 && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-2">
                Skipped as duplicates ({summary.skippedDuplicates.length})
              </p>
              <ul className="text-sm space-y-1">
                {summary.skippedDuplicates.map((d) => (
                  <li key={d.row} className="text-muted">
                    Row {d.row}: {d.name} — already exists as{" "}
                    <Link
                      href={`/companies/${d.existingId}`}
                      className="text-accent underline underline-offset-2"
                    >
                      this company
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.errors.length > 0 && (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-red-700 mb-2">
                Errors ({summary.errors.length})
              </p>
              <ul className="text-sm space-y-1">
                {summary.errors.map((e, i) => (
                  <li key={i} className="text-red-700">
                    Row {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href="/companies"
            className="inline-block font-mono text-[12px] uppercase tracking-[0.1em] text-accent underline underline-offset-4"
          >
            View companies →
          </Link>
        </div>
      )}
    </main>
  );
}
