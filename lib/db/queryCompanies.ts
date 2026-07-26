import { createClient } from "@/lib/supabase/server";
import { CompanyQueryFilter } from "@/lib/ai/nlQuery";
import { Company } from "@/types/db";

export async function queryCompanies(
  userId: string,
  filter: CompanyQueryFilter
): Promise<Company[]> {
  const supabase = createClient();
  let query = supabase.from("companies").select("*, contacts(*)").eq("user_id", userId);

  if (filter.location_state) query = query.ilike("location_state", `%${filter.location_state}%`);
  if (filter.location_city) query = query.ilike("location_city", `%${filter.location_city}%`);
  if (filter.industry) query = query.ilike("industry", `%${filter.industry}%`);
  if (filter.business_type) query = query.ilike("business_type", `%${filter.business_type}%`);
  if (filter.lead_status) query = query.eq("lead_status", filter.lead_status);
  if (filter.decision_maker_status) query = query.eq("decision_maker_status", filter.decision_maker_status);
  if (filter.research_status) query = query.eq("research_status", filter.research_status);
  if (filter.keyword) {
    query = query.or(
      `description.ilike.%${filter.keyword}%,industry.ilike.%${filter.keyword}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  let results = (data as unknown as Company[]) ?? [];

  // has_contact_role / missing_contact_role need post-filtering since they
  // depend on the joined contacts array rather than a plain column.
  if (filter.has_contact_role) {
    const role = filter.has_contact_role.toLowerCase();
    results = results.filter((c: any) =>
      c.contacts?.some((ct: any) =>
        ct.relationship_to_company?.toLowerCase().includes(role) ||
        ct.job_title?.toLowerCase().includes(role)
      )
    );
  }

  if (filter.missing_contact_role) {
    const role = filter.missing_contact_role.toLowerCase();
    results = results.filter(
      (c: any) =>
        !c.contacts?.some(
          (ct: any) =>
            ct.relationship_to_company?.toLowerCase().includes(role) ||
            ct.job_title?.toLowerCase().includes(role)
        )
    );
  }

  return results;
}
