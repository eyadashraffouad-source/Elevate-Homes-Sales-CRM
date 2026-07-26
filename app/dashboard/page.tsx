import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CompanyStatusStamp } from "@/components/ui";

async function countCompanies(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  filters: Record<string, string> = {}
) {
  let query = supabase
    .from("companies")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
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

  const [totalCompanies, prospects, customers, followUps] = await Promise.all([
    countCompanies(supabase, user.id),
    countCompanies(supabase, user.id, { company_status: "prospect" }),
    countCompanies(supabase, user.id, { company_status: "customer" }),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("contact_status", "follow_up")
      .then((r) => r.count ?? 0),
  ]);

  const { count: totalContacts } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: recentCompanies } = await supabase
    .from("companies")
    .select("id, company_name, company_status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
        Overview
      </p>
      <h1 className="font-serif text-3xl text-ink mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total companies" value={totalCompanies} href="/companies" />
        <StatCard label="Total contacts" value={totalContacts ?? 0} href="/companies" />
        <StatCard
          label="Prospects"
          value={prospects}
          href="/companies?status=prospect"
        />
        <StatCard
          label="Customers"
          value={customers}
          href="/companies?status=customer"
        />
        <StatCard
          label="Follow-ups due"
          value={followUps}
          href="/companies"
          flagged={followUps > 0}
        />
      </div>

      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-3">
        Recently added companies
      </p>
      <div className="border border-line rounded-sm overflow-hidden">
        {recentCompanies && recentCompanies.length > 0 ? (
          <table className="w-full text-sm">
            <tbody>
              {recentCompanies.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="py-2.5 px-4">
                    <Link
                      href={`/companies/${c.id}`}
                      className="font-medium text-ink hover:text-accent"
                    >
                      {c.company_name}
                    </Link>
                  </td>
                  <td className="py-2.5 px-4 text-muted">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-4">
                    <CompanyStatusStamp value={c.company_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted p-4">No companies yet.</p>
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
