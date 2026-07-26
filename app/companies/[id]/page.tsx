import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Company, Contact, JobTitle } from "@/types/db";
import { SectionCard, CompanyStatusStamp, ContactStatusStamp, ContactAvatar, Tag } from "@/components/ui";
import { createContact, deleteContact } from "@/lib/actions/contacts";
import { deleteCompany } from "@/lib/actions/companies";

const JOB_TITLES: JobTitle[] = [
  "Sales Manager",
  "Owner",
  "CEO",
  "Founder",
  "Acquisitions Manager",
  "Investor",
  "Partner",
  "Broker",
  "Other",
];

export default async function CompanyProfilePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { duplicate?: string };
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

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: true });

  const contactList = (contacts as Contact[]) ?? [];
  const deleteCompanyWithId = deleteCompany.bind(null, company.id);
  const createContactWithId = createContact.bind(null, company.id);

  return (
    <main className="max-w-5xl mx-auto py-12 px-6">
      {searchParams.duplicate && (
        <div className="border border-accent/50 bg-accent/5 rounded-sm p-3 mb-6 text-sm text-ink">
          This company already exists — you were brought here instead of
          creating a duplicate. Add a contact below.
        </div>
      )}

      {/* ---- Company Overview ---- */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-line">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
            Company
          </p>
          <h1 className="font-serif text-4xl text-ink mb-2">{company.company_name}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <CompanyStatusStamp value={company.company_status} />
            {company.industry && <Tag>{company.industry}</Tag>}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Link
            href={`/companies/${company.id}/edit`}
            className="border border-line font-mono text-[12px] uppercase tracking-[0.1em] text-ink px-4 py-2 rounded-sm hover:border-ink"
          >
            Edit
          </Link>
          <form action={deleteCompanyWithId}>
            <button
              type="submit"
              className="border border-red-200 text-red-700 font-mono text-[12px] uppercase tracking-[0.1em] px-4 py-2 rounded-sm hover:border-red-700"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* ---- Company Information ---- */}
          <SectionCard eyebrow="Company information">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Website" value={company.website} />
              <Field label="Industry" value={company.industry} />
            </dl>
          </SectionCard>

          {/* ---- Notes ---- */}
          <SectionCard eyebrow="Notes">
            {company.notes ? (
              <p className="whitespace-pre-wrap">{company.notes}</p>
            ) : (
              <p className="text-muted italic">No notes added.</p>
            )}
          </SectionCard>

          {/* ---- Contacts ---- */}
          <SectionCard eyebrow="Contacts" title={`${contactList.length} contact${contactList.length === 1 ? "" : "s"}`}>
            {contactList.length > 0 ? (
              <ul className="space-y-3">
                {contactList.map((c) => (
                  <li
                    key={c.id}
                    className="border-t border-line pt-3 first:border-0 first:pt-0 flex items-start gap-3"
                  >
                    <ContactAvatar name={c.full_name} />
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="font-medium text-ink">{c.full_name}</span>
                        <ContactStatusStamp value={c.contact_status} />
                      </div>
                      <p className="text-muted text-xs">{c.job_title ?? "Role not set"}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs">
                        {c.linkedin_url && (
                          <a href={c.linkedin_url} target="_blank" className="text-accent underline underline-offset-2">
                            LinkedIn
                          </a>
                        )}
                        {c.email && <span className="text-muted">{c.email}</span>}
                        {c.phone && <span className="text-muted">{c.phone}</span>}
                      </div>
                      {c.notes && <p className="text-xs text-ink/80 mt-1">{c.notes}</p>}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Link
                        href={`/companies/${company.id}/contacts/${c.id}/edit`}
                        className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted hover:text-ink"
                      >
                        Edit
                      </Link>
                      <form action={deleteContact.bind(null, company.id, c.id)}>
                        <button
                          type="submit"
                          className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted hover:text-red-700"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted italic">No contacts yet. Add the first one below.</p>
            )}
          </SectionCard>

          {/* ---- Add Contact ---- */}
          <SectionCard eyebrow="Add contact">
            <form action={createContactWithId} className="grid grid-cols-2 gap-3">
              <input
                name="full_name"
                placeholder="Full name *"
                required
                className="border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <select
                name="job_title"
                defaultValue=""
                className="border border-line bg-white/70 rounded-sm px-3 py-2 text-sm"
              >
                <option value="">Role…</option>
                {JOB_TITLES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                name="email"
                placeholder="Email"
                className="border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <input
                name="phone"
                placeholder="Phone"
                className="border border-line bg-white/70 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <input
                name="linkedin_url"
                placeholder="LinkedIn URL"
                className="border border-line bg-white/70 rounded-sm px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <select
                name="contact_status"
                defaultValue="active"
                className="border border-line bg-white/70 rounded-sm px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="follow_up">Follow up</option>
                <option value="unresponsive">Unresponsive</option>
                <option value="inactive">Inactive</option>
              </select>
              <textarea
                name="notes"
                placeholder="Notes"
                rows={2}
                className="border border-line bg-white/70 rounded-sm px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <button
                type="submit"
                className="col-span-2 bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.1em] px-4 py-2.5 rounded-sm hover:bg-ink/90"
              >
                + Add contact
              </button>
            </form>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard eyebrow="Quick stats">
            <dl className="space-y-2">
              <Field label="Total contacts" value={String(contactList.length)} />
              <Field
                label="Created"
                value={new Date(company.created_at).toLocaleDateString()}
              />
              <Field
                label="Last updated"
                value={new Date(company.updated_at).toLocaleDateString()}
              />
            </dl>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-0.5">
        {label}
      </dt>
      <dd className="text-ink">{value || <span className="text-muted italic">—</span>}</dd>
    </div>
  );
}
