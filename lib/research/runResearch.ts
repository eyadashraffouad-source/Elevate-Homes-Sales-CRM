import { createClient } from "@/lib/supabase/server";
import { fetchAllSources, FetchedSource } from "./fetchSource";
import { extractCompanyData } from "@/lib/ai/extractCompany";
import { extractContacts } from "@/lib/ai/extractContacts";
import { classifyCompany } from "@/lib/ai/classify";
import { summarizeCompany } from "@/lib/ai/summarize";
import { Company } from "@/types/db";

/**
 * Runs the full research pipeline for a single company:
 *   1. fetch each provided source URL
 *   2. extract structured company fields (Claude)
 *   3. extract named contacts (Claude)
 *   4. classify + tag (Claude)
 *   5. write a narrative summary (Claude)
 *   6. persist everything + log the run in research_runs
 *
 * This is intentionally synchronous/sequential for the MVP — see the
 * "what to add later" notes for moving this behind a real job queue.
 */
export async function runResearch(companyId: string, userId: string) {
  const supabase = createClient();

  const { data: company, error: companyErr } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .eq("user_id", userId)
    .single<Company>();

  if (companyErr || !company) {
    throw new Error("Company not found");
  }

  // Create the run record up front so failures are still logged
  const { data: run, error: runErr } = await supabase
    .from("research_runs")
    .insert({
      company_id: companyId,
      user_id: userId,
      status: "running",
      sources_used: [],
    })
    .select()
    .single();

  if (runErr || !run) throw new Error("Could not create research run");

  await supabase
    .from("companies")
    .update({ research_status: "researching" })
    .eq("id", companyId);

  try {
    // ---- 1. Gather sources ----
    const urlsToFetch: { url: string; type: FetchedSource["type"] }[] = [];
    if (company.website_url) urlsToFetch.push({ url: company.website_url, type: "website" });
    if (company.google_maps_url) urlsToFetch.push({ url: company.google_maps_url, type: "google_maps" });
    if (company.linkedin_url) urlsToFetch.push({ url: company.linkedin_url, type: "linkedin" });
    if (company.instagram_url) urlsToFetch.push({ url: company.instagram_url, type: "instagram" });
    if (company.facebook_url) urlsToFetch.push({ url: company.facebook_url, type: "facebook" });
    for (const other of company.other_urls ?? []) {
      urlsToFetch.push({ url: other.url, type: "other" });
    }

    if (urlsToFetch.length === 0) {
      throw new Error("No source URLs available to research. Add at least one URL.");
    }

    const sources = await fetchAllSources(urlsToFetch);

    // ---- 2. Extract company fields ----
    const companyData = await extractCompanyData({
      companyName: company.name,
      sources,
      notes: company.notes,
    });

    // ---- 3. Extract contacts ----
    const contacts = await extractContacts({
      companyName: company.name,
      sources,
    });

    // ---- 4. Classify ----
    const classification = await classifyCompany({
      companyName: company.name,
      companyData,
      contacts,
    });

    // ---- 5. Summarize ----
    const aiSummary = await summarizeCompany({
      companyName: company.name,
      companyData,
      contacts,
      classification,
    });

    // ---- 6. Persist (skip fields the user has manually edited) ----
    const protectedFields = new Set(company.manually_edited_fields ?? []);
    const researchedFields: Record<string, unknown> = {
      ...companyData,
      potential_need: classification.potential_need,
      potential_services: classification.potential_services,
      lead_status: classification.lead_status,
      decision_maker_status: classification.decision_maker_status,
      best_available_contact: classification.best_available_contact,
      recommended_action: classification.recommended_action,
      ai_summary: aiSummary,
    };
    for (const field of protectedFields) {
      delete researchedFields[field];
    }

    await supabase
      .from("companies")
      .update({
        ...researchedFields,
        research_status: "researched",
        last_researched_at: new Date().toISOString(),
      })
      .eq("id", companyId);

    // Insert contacts (simple approach for MVP: skip exact-name duplicates)
    for (const c of contacts) {
      const { data: existing } = await supabase
        .from("contacts")
        .select("id")
        .eq("company_id", companyId)
        .eq("full_name", c.full_name)
        .maybeSingle();

      if (!existing) {
        await supabase.from("contacts").insert({
          company_id: companyId,
          user_id: userId,
          full_name: c.full_name,
          job_title: c.job_title,
          linkedin_url: c.linkedin_url,
          public_email: c.public_email,
          phone: c.phone,
          source_url: c.source_url,
          confidence_level: c.confidence_level,
          relationship_to_company: c.relationship_to_company,
        });
      }
    }

    // Upsert tags + company_tags
    for (const tag of classification.tags) {
      const { data: tagRow } = await supabase
        .from("tags")
        .upsert(
          { user_id: userId, name: tag.name, category: tag.category },
          { onConflict: "user_id,name,category" }
        )
        .select()
        .single();

      if (tagRow) {
        await supabase
          .from("company_tags")
          .upsert({ company_id: companyId, tag_id: tagRow.id });
      }
    }

    // Mark run complete
    await supabase
      .from("research_runs")
      .update({
        status: "done",
        sources_used: urlsToFetch,
        raw_extracted_data: { companyData, contacts, classification, aiSummary },
        completed_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    await supabase
      .from("research_runs")
      .update({ status: "failed", error_message: message, completed_at: new Date().toISOString() })
      .eq("id", run.id);

    await supabase
      .from("companies")
      .update({ research_status: "failed" })
      .eq("id", companyId);

    throw err;
  }
}
