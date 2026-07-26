import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Company } from "@/types/db";
import { updateCompany } from "@/lib/actions/companies";

function Field({
  label,
  name,
  defaultValue,
  textarea,
  edited,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  textarea?: boolean;
  edited?: boolean;
}) {
  const inputClass =
    "w-full border border-line bg-white/70 rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent";
  return (
    <label className="block mb-4">
      <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-1">
        {label}
        {edited && (
          <span className="text-accent normal-case tracking-normal">
            · manually edited, protected from research overwrite
          </span>
        )}
      </span>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue ?? ""} rows={3} className={inputClass} />
      ) : (
        <input name={name} defaultValue={defaultValue ?? ""} className={inputClass} />
      )}
    </label>
  );
}

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
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

  const edited = new Set(company.manually_edited_fields ?? []);
  const updateWithId = updateCompany.bind(null, company.id);

  return (
    <main className="max-w-xl mx-auto py-12 px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
        Edit case file
      </p>
      <h1 className="font-serif text-3xl text-ink mb-6">{company.name}</h1>

      <form action={updateWithId}>
        <Field label="Company name" name="name" defaultValue={company.name} edited={edited.has("name")} />
        <Field label="Industry" name="industry" defaultValue={company.industry} edited={edited.has("industry")} />
        <Field label="Business type" name="business_type" defaultValue={company.business_type} edited={edited.has("business_type")} />
        <Field label="Company size" name="company_size" defaultValue={company.company_size} edited={edited.has("company_size")} />
        <Field label="Description" name="description" defaultValue={company.description} textarea edited={edited.has("description")} />
        <Field label="City" name="location_city" defaultValue={company.location_city} edited={edited.has("location_city")} />
        <Field label="State" name="location_state" defaultValue={company.location_state} edited={edited.has("location_state")} />
        <Field label="Business model" name="business_model" defaultValue={company.business_model} edited={edited.has("business_model")} />
        <Field label="Website" name="website_url" defaultValue={company.website_url} edited={edited.has("website_url")} />
        <Field label="Google Maps URL" name="google_maps_url" defaultValue={company.google_maps_url} edited={edited.has("google_maps_url")} />
        <Field label="LinkedIn URL" name="linkedin_url" defaultValue={company.linkedin_url} edited={edited.has("linkedin_url")} />
        <Field label="Instagram URL" name="instagram_url" defaultValue={company.instagram_url} edited={edited.has("instagram_url")} />
        <Field label="Facebook URL" name="facebook_url" defaultValue={company.facebook_url} edited={edited.has("facebook_url")} />
        <Field label="Notes" name="notes" defaultValue={company.notes} textarea edited={edited.has("notes")} />

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
