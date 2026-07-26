import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusStamp } from "@/components/ui";

async function count(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  filters: Record<string, string>
) {
  let query = supabase
    .from("companies")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }

  const { count } = await query;
  return count ?? 0;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto py-12 px-6">
        <p className="text-sm text-muted">Sign in to see your dashboard.</p>
      </main>
    );
  }

  const [
    totalCompanies,
    notResearched,
    researched,
    noDecisionMaker,
    potentialProspects,
    failedRuns,
  ] = await Promise.all([
    count(supabase, user.id, {}),
    count(supabase, user.id, { research_status: "not_researched" }),
    count(supabase, user.id, { research_status: "researched" }),
    count(supabase, user.id, { decision_maker_status: "unknown" }),
    count(supabase, user.id, { lead_status: "potential_prospect" }),
    count(supabase, user.id, { research_status: "failed" }),
  ]);

  const { data: recentRuns } = await supabase
    .from("research_runs")
    .select("id, status, created_at, companies(id, name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
        Overview
      </p>
      <h1 className="font-serif text-3xl text-ink mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <StatCard label="Total companies" value={totalCompanies} href="/companies" />
        <StatCard
          label="Not yet researched"
          value={notResearched}
          href="/companies?research_status=not_researched"
          flagged={notResearched > 0}
        />
        <StatCard
          label="Researched"
          value={researched}
          href="/companies?research_status=researched"
        />
        <StatCard
          label="No decision-maker identified"
          value={noDecisionMaker}
          href="/companies"
          flagged={noDecisionMaker > 0}
        />
        <StatCard
          label="Potential prospects"
          value={potentialProspects}
          href="/companies?lead_status=potential_prospect"
        />
        <StatCard
          label="Failed research runs"
          value={failedRuns}
          href="/companies?research_status=failed"
          flagged={failedRuns > 0}
        />
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-3">
        Recent research activity
      </p>
      <div className="border border-line rounded-sm overflow-hidden">
        {recentRuns && recentRuns.length > 0 ? (
          <table className="w-full text-sm">
            <tbody>
              {(recentRuns as any[]).map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="py-2.5 px-4">
                    <Link
                      href={`/companies/${r.companies?.id}`}
                      className="font-medium text-ink hover:text-accent"
                    >
                      {r.companies?.name ?? "Unknown"}
                    </Link>
                  </td>
                  <td className="py-2.5 px-4 text-muted">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4">
                    <StatusStamp value={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted p-4">No research runs yet.</p>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  href,
  flagged,
}: {
  label: string;
  value: number;
  href: string;
  flagged?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block border rounded-sm p-4 hover:border-ink transition-colors ${
        flagged && value > 0 ? "border-accent/60 bg-accent/5" : "border-line bg-white/50"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-1">
        {label}
      </p>
      <p className="font-serif text-3xl text-ink">{value}</p>
    </Link>
  );
}
