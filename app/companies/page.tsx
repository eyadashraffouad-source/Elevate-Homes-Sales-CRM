import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResearchDot, StatusStamp } from "@/components/ui";
import { Company } from "@/types/db";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: { state?: string; lead_status?: string; research_status?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let companies: Company[] = [];
  let fetchError: string | null = null;

  if (user) {
    let query = supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (searchParams.state) query = query.ilike("location_state", `%${searchParams.state}%`);
    if (searchParams.lead_status) query = query.eq("lead_status", searchParams.lead_status);
    if (searchParams.research_status) query = query.eq("research_status", searchParams.research_status);

    const { data, error } = await query;
    if (error) fetchError = error.message;
    companies = (data as Company[]) ?? [];
  }

  return (
    <main className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
            Case index
          </p>
          <h1 className="font-serif text-3xl text-ink">Companies</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/companies/import"
            className="border border-line font-mono text-[12px] uppercase tracking-[0.1em] text-ink px-4 py-2 rounded-sm hover:border-ink"
          >
            Import CSV
          </Link>
          <Link
            href="/companies/new"
            className="bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-4 py-2 rounded-sm hover:bg-ink/90"
          >
            + Add company
          </Link>
        </div>
      </div>

      <FilterBar current={searchParams} />

      {!user && (
        <p className="text-sm text-muted border border-line rounded-sm p-4">
          Sign in to see your companies.
        </p>
      )}

      {fetchError && (
        <p className="text-sm text-red-700 border border-red-200 rounded-sm p-4">
          {fetchError}
        </p>
      )}

      {user && !fetchError && companies.length === 0 && (
        <div className="border border-dashed border-line rounded-sm p-10 text-center">
          <p className="font-serif text-lg text-ink mb-1">No companies yet</p>
          <p className="text-sm text-muted mb-4">
            Add the first one — a name and a single URL is enough to start.
          </p>
          <Link
            href="/companies/new"
            className="font-mono text-[12px] uppercase tracking-[0.1em] text-accent underline underline-offset-4"
          >
            Add a company
          </Link>
        </div>
      )}

      {companies.length > 0 && (
        <div className="border border-line rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-white/50 text-left font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                <th className="py-2.5 px-4 font-normal">Company</th>
                <th className="py-2.5 px-4 font-normal">Location</th>
                <th className="py-2.5 px-4 font-normal">Industry</th>
                <th className="py-2.5 px-4 font-normal">Lead status</th>
                <th className="py-2.5 px-4 font-normal">Decision maker</th>
                <th className="py-2.5 px-4 font-normal text-center">Research</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-line last:border-0 hover:bg-white/60"
                >
                  <td className="py-3 px-4">
                    <Link
                      href={`/companies/${c.id}`}
                      className="font-medium text-ink hover:text-accent"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-muted">
                    {[c.location_city, c.location_state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="py-3 px-4 text-muted">{c.industry ?? "—"}</td>
                  <td className="py-3 px-4">
                    <StatusStamp value={c.lead_status} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusStamp value={c.decision_maker_status} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <ResearchDot status={c.research_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function FilterBar({
  current,
}: {
  current: { state?: string; lead_status?: string; research_status?: string };
}) {
  const leadStatuses = ["potential_prospect", "contacted", "qualified", "disqualified"];
  const researchStatuses = ["not_researched", "researched", "needs_update", "failed"];

  return (
    <form className="flex flex-wrap items-center gap-3 mb-6" method="get">
      <input
        name="state"
        defaultValue={current.state}
        placeholder="State"
        className="border border-line bg-white/70 rounded-sm px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <select
        name="lead_status"
        defaultValue={current.lead_status ?? ""}
        className="border border-line bg-white/70 rounded-sm px-3 py-1.5 text-sm"
      >
        <option value="">Any lead status</option>
        {leadStatuses.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <select
        name="research_status"
        defaultValue={current.research_status ?? ""}
        className="border border-line bg-white/70 rounded-sm px-3 py-1.5 text-sm"
      >
        <option value="">Any research status</option>
        {researchStatuses.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted border border-line rounded-sm px-3 py-1.5 hover:text-ink hover:border-ink"
      >
        Filter
      </button>
    </form>
  );
}
