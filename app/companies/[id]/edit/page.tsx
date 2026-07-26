import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Company } from "@/types/db";
import { updateCompany } from "@/lib/actions/companies";

export default async function EditCompanyPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single<Company>();

  if (!company) notFound();

  const updateWithId = updateCompany.bind(null, company.id);

  return (
    <main className="max-w-xl mx-auto py-16 px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
        Edit company
      </p>
      <h1 className="font-serif text-3xl text-ink mb-8">{company.company_name}</h1>

      <form action={updateWithId}>
        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Company name *
          </span>
          <input
            name="company_name"
            defaultValue={company.company_name}
            required
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>

        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Website
          </span>
          <input
            name="website"
            defaultValue={company.website ?? ""}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>

        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Industry
          </span>
          <input
            name="industry"
            defaultValue={company.industry ?? ""}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>

        <label className="block mb-4">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Company status
          </span>
          <select
            name="company_status"
            defaultValue={company.company_status}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="prospect">Prospect</option>
            <option value="customer">Customer</option>
            <option value="inactive">Inactive</option>
            <option value="lost">Lost</option>
          </select>
        </label>

        <label className="block mb-8">
          <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
            Notes
          </span>
          <textarea
            name="notes"
            defaultValue={company.notes ?? ""}
            rows={4}
            className="w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>

        <button
          type="submit"
          className="bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-5 py-2.5 rounded-sm hover:bg-ink/90"
        >
          Save changes
        </button>
      </form>
    </main>
  );
}
