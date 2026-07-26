import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Company, Contact, ResearchRun } from "@/types/db";
import { SectionCard, StatusStamp, ConfidenceTag, Tag } from "@/components/ui";
import { ResearchButton } from "@/components/ResearchButton";

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
    .order("confidence_level", { ascending: true });

  const { data: runs } = await supabase
    .from("research_runs")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const { data: tagRows } = await supabase
    .from("company_tags")
    .select("tags(name, category)")
    .eq("company_id", company.id);

  const tags = (tagRows ?? []).map((t: any) => t.tags).filter(Boolean);

  return (
    <main className="max-w-5xl mx-auto py-12 px-6">
      {searchParams.duplicate && (
        <div className="border border-accent/50 bg-accent/5 rounded-sm p-3 mb-6 text-sm text-ink">
          This company already exists — you were brought here instead of
          creating a duplicate.
        </div>
      )}

      {/* ---- 1. Company Overview ---- */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-line">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted mb-1">
            Case file · {company.research_status.replace(/_/g, " ")}
          </p>
          <h1 className="font-serif text-4xl text-ink mb-2">{company.name}</h1>
          <div className="flex flex-wrap gap-2 items-center">
            <StatusStamp value={company.lead_status} />
            <StatusStamp value={company.decision_maker_status} />
            {company.industry && <Tag>{company.industry}</Tag>}
            {company.location_state && <Tag>{company.location_state}</Tag>}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Link
            href={`/companies/${company.id}/edit`}
            className="border border-line font-mono text-[12px] uppercase tracking-[0.1em] text-ink px-4 py-2 rounded-sm hover:border-ink"
          >
            Edit
          </Link>
          <ResearchButton companyId={company.id} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* ---- 2. AI Summary ---- */}
          <SectionCard eyebrow="AI summary">
            {company.ai_summary ? (
              <p>{company.ai_summary}</p>
            ) : (
              <p className="text-muted italic">
                Not yet researched. Click "Research company" to generate a
                summary.
              </p>
            )}
          </SectionCard>

          {/* ---- 3. Company Information ---- */}
          <SectionCard eyebrow="Company information" title="Overview">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field label="Business type" value={company.business_type} />
              <Field label="Company size" value={company.company_size} />
              <Field label="Business model" value={company.business_model} />
              <Field label="Description" value={company.description} span />
            </dl>
          </SectionCard>

          {/* ---- 4. Locations and Markets ---- */}
          <SectionCard eyebrow="Locations & markets">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
              <Field
                label="Location"
                value={[company.location_city, company.location_state].filter(Boolean).join(", ")}
              />
              <Field label="Markets served" value={company.markets_served?.join(", ")} />
            </dl>
          </SectionCard>

          {/* ---- 5. Services ---- */}
          <SectionCard eyebrow="Services offered">
            {company.services_offered?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {company.services_offered.map((s) => (
                  <Tag key={s}>{s}</Tag>
                ))}
              </div>
            ) : (
              <p className="text-muted italic">None identified yet.</p>
            )}
          </SectionCard>

          {/* ---- 6. Contacts ---- */}
          <SectionCard eyebrow="Contacts" title={`${contacts?.length ?? 0} identified`}>
            {contacts && contacts.length > 0 ? (
              <ul className="space-y-3">
                {(contacts as Contact[]).map((c) => (
                  <li key={c.id} className="border-t border-line pt-3 first:border-0 first:pt-0">
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium text-ink">{c.full_name}</span>
                      <ConfidenceTag level={c.confidence_level} />
                    </div>
                    <p className="text-muted text-xs">
                      {c.job_title ?? c.relationship_to_company ?? "Role unknown"}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs">
                      {c.linkedin_url && (
                        <a href={c.linkedin_url} className="text-accent underline underline-offset-2">
                          LinkedIn
                        </a>
                      )}
                      {c.public_email && <span className="text-muted">{c.public_email}</span>}
                      {c.phone && <span className="text-muted">{c.phone}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted italic">No contacts identified yet.</p>
            )}
          </SectionCard>

          {/* ---- 9. Notes ---- */}
          <SectionCard eyebrow="Notes">
            {company.notes ? (
              <p className="whitespace-pre-wrap">{company.notes}</p>
            ) : (
              <p className="text-muted italic">No notes added.</p>
            )}
          </SectionCard>

          {/* ---- 8. Research History ---- */}
          <SectionCard eyebrow="Research history">
            {runs && runs.length > 0 ? (
              <ul className="space-y-2">
                {(runs as ResearchRun[]).map((r) => (
                  <li key={r.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                    <StatusStamp value={r.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted italic">No research runs yet.</p>
            )}
          </SectionCard>
        </div>

        <div className="space-y-5">
          {/* ---- 11. Potential Opportunity / 12. Recommended Next Action ---- */}
          <SectionCard eyebrow="Potential need">
            <p>{company.potential_need ?? <span className="text-muted italic">Unknown</span>}</p>
          </SectionCard>

          <SectionCard eyebrow="Best available contact">
            <p>{company.best_available_contact ?? <span className="text-muted italic">Not identified</span>}</p>
          </SectionCard>

          <SectionCard eyebrow="Recommended next action">
            <p>{company.recommended_action ?? <span className="text-muted italic">Research the company to get a recommendation.</span>}</p>
          </SectionCard>

          {/* ---- 10. Lead Classification (tags) ---- */}
          <SectionCard eyebrow="Tags & classification">
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t: any, i: number) => (
                  <Tag key={i}>{t.name}</Tag>
                ))}
              </div>
            ) : (
              <p className="text-muted italic">No tags yet.</p>
            )}
          </SectionCard>

          {/* ---- 7. Social Media and Website Links ---- */}
          <SectionCard eyebrow="Links">
            <ul className="space-y-1.5">
              <LinkRow label="Website" url={company.website_url} />
              <LinkRow label="Google Maps" url={company.google_maps_url} />
              <LinkRow label="LinkedIn" url={company.linkedin_url} />
              <LinkRow label="Instagram" url={company.instagram_url} />
              <LinkRow label="Facebook" url={company.facebook_url} />
              {(company.other_urls ?? []).map((u, i) => (
                <LinkRow key={i} label="Other" url={u.url} />
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  span,
}: {
  label: string;
  value?: string | null;
  span?: boolean;
}) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-0.5">
        {label}
      </dt>
      <dd className="text-ink">{value || <span className="text-muted italic">—</span>}</dd>
    </div>
  );
}

function LinkRow({ label, url }: { label: string; url?: string | null }) {
  if (!url) return null;
  return (
    <li className="text-sm">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mr-2">
        {label}
      </span>
      <a href={url} target="_blank" className="text-accent underline underline-offset-2 break-all">
        {url}
      </a>
    </li>
  );
}
