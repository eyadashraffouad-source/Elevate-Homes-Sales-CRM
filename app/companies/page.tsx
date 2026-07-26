import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CompanyStatusStamp, ContactAvatar } from "@/components/ui";
import { Company, Contact } from "@/types/db";

type CompanyRow = Company & { contacts: Contact[] };

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; industry?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let companies: CompanyRow[] = [];
  let fetchError: string | null = null;

  if (user) {
    let query = supabase
      .from("companies")
      .select("*, contacts(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (searchParams.q) query = query.ilike("company_name", `%${searchParams.q}%`);
    if (searchParams.status) query = query.eq("company_status", searchParams.status);
    if (searchParams.industry) query = query.ilike("industry", `%${searchParams.industry}%`);

    const { data, error } = await query;
    if (error) fetchError = error.message;
    companies = (data as unknown as CompanyRow[]) ?? [];
  }

  return (
    <main className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
            Workspace
          </p>
          <h1 className="font-serif text-3xl text-ink">Companies</h1>
        </div>
        <Link
          href="/companies/new"
          className="bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-4 py-2 rounded-sm hover:bg-ink/90"
        >
          + Add company
        </Link>
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
            Add the first one — name it, then start adding contacts.
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
                <th className="py-2.5 px-4 font-normal">Website</th>
                <th className="py-2.5 px-4 font-normal">Industry</th>
                <th className="py-2.5 px-4 font-normal">Status</th>
                <th className="py-2.5 px-4 font-normal">Contacts</th>
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
                      {c.company_name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-muted truncate max-w-[160px]">
                    {c.website ?? "—"}
                  </td>
                  <td className="py-3 px-4 text-muted">{c.industry ?? "—"}</td>
                  <td className="py-3 px-4">
                    <CompanyStatusStamp value={c.company_status} />
                  </td>
                  <td className="py-3 px-4">
                    {c.contacts && c.contacts.length > 0 ? (
                      <div className="flex items-center gap-1">
                        {c.contacts.slice(0, 4).map((ct) => (
                          <ContactAvatar key={ct.id} name={ct.full_name} />
                        ))}
                        {c.contacts.length > 4 && (
                          <span className="text-muted text-xs ml-1">
                            +{c.contacts.length - 4}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted italic text-xs">None yet</span>
                    )}
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
  current: { q?: string; status?: string; industry?: string };
}) {
  const statuses = ["active", "prospect", "customer", "inactive", "lost"];

  return (
    <form className="flex flex-wrap items-center gap-3 mb-6" method="get">
      <input
        name="q"
        defaultValue={current.q}
        placeholder="Search company name"
        className="border border-line bg-white/70 rounded-sm px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <input
        name="industry"
        defaultValue={current.industry}
        placeholder="Industry"
        className="border border-line bg-white/70 rounded-sm px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <select
        name="status"
        defaultValue={current.status ?? ""}
        className="border border-line bg-white/70 rounded-sm px-3 py-1.5 text-sm"
      >
        <option value="">Any status</option>
        {statuses.map((s) => (
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
