"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { findDuplicateCompany } from "@/lib/db/duplicates";
import Papa from "papaparse";

const EDITABLE_FIELDS = [
  "name",
  "industry",
  "business_type",
  "company_size",
  "description",
  "location_city",
  "location_state",
  "business_model",
  "notes",
  "website_url",
  "google_maps_url",
  "linkedin_url",
  "instagram_url",
  "facebook_url",
] as const;

export async function createCompany(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Company name is required");

  const website_url = String(formData.get("website_url") ?? "").trim() || null;
  const linkedin_url = String(formData.get("linkedin_url") ?? "").trim() || null;

  // Duplicate check before insert — same normalized name or matching domain
  // sends the user to the existing record instead of creating a copy.
  const duplicate = await findDuplicateCompany(supabase, user.id, {
    name,
    website_url,
    linkedin_url,
  });
  if (duplicate) {
    redirect(`/companies/${duplicate.id}?duplicate=1`);
  }

  const other_urls_raw = String(formData.get("other_urls") ?? "").trim();
  const other_urls = other_urls_raw
    ? other_urls_raw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((url) => ({ label: "other", url }))
    : [];

  const { data, error } = await supabase
    .from("companies")
    .insert({
      user_id: user.id,
      name,
      website_url,
      google_maps_url: String(formData.get("google_maps_url") ?? "").trim() || null,
      linkedin_url,
      instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
      facebook_url: String(formData.get("facebook_url") ?? "").trim() || null,
      other_urls,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not create company");

  revalidatePath("/companies");
  redirect(`/companies/${data.id}`);
}

/**
 * Updates a company from the manual edit form. Any field that differs from
 * its current stored value is added to manually_edited_fields, so a future
 * research run will not overwrite the user's correction.
 */
export async function updateCompany(companyId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: current } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .eq("user_id", user.id)
    .single();

  if (!current) throw new Error("Company not found");

  const updates: Record<string, unknown> = {};
  const newlyEdited = new Set<string>(current.manually_edited_fields ?? []);

  for (const field of EDITABLE_FIELDS) {
    const raw = formData.get(field);
    if (raw === null) continue;
    const value = String(raw).trim() || null;
    if (value !== (current as any)[field]) {
      updates[field] = value;
      newlyEdited.add(field);
    }
  }

  if (Object.keys(updates).length === 0) {
    redirect(`/companies/${companyId}`);
  }

  updates.manually_edited_fields = Array.from(newlyEdited);

  const { error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}

export async function triggerResearch(companyId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { runResearch } = await import("@/lib/research/runResearch");
  await runResearch(companyId, user.id);
  revalidatePath(`/companies/${companyId}`);
}

export interface ImportSummary {
  created: number;
  skippedDuplicates: { row: number; name: string; existingId: string }[];
  errors: { row: number; message: string }[];
}

/**
 * Bulk CSV import. Expected columns (header row, case-insensitive, any
 * subset): name, website_url, google_maps_url, linkedin_url, instagram_url,
 * facebook_url, notes. Rows matching an existing company (by name or
 * website/LinkedIn domain) are skipped rather than duplicated.
 */
export async function importCompaniesFromCsv(
  _prevState: ImportSummary | null,
  formData: FormData
): Promise<ImportSummary> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const file = formData.get("file");
  if (!file || !(file instanceof File)) throw new Error("No CSV file provided");

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  const summary: ImportSummary = { created: 0, skippedDuplicates: [], errors: [] };

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    const rowNum = i + 2; // +1 for header, +1 for 1-indexing

    const name = (row.name ?? row.company_name ?? "").trim();
    if (!name) {
      summary.errors.push({ row: rowNum, message: "Missing company name" });
      continue;
    }

    const website_url = (row.website_url ?? row.website ?? "").trim() || null;
    const linkedin_url = (row.linkedin_url ?? row.linkedin ?? "").trim() || null;

    const duplicate = await findDuplicateCompany(supabase, user.id, {
      name,
      website_url,
      linkedin_url,
    });
    if (duplicate) {
      summary.skippedDuplicates.push({ row: rowNum, name, existingId: duplicate.id });
      continue;
    }

    const { error } = await supabase.from("companies").insert({
      user_id: user.id,
      name,
      website_url,
      google_maps_url: (row.google_maps_url ?? row.google_maps ?? "").trim() || null,
      linkedin_url,
      instagram_url: (row.instagram_url ?? row.instagram ?? "").trim() || null,
      facebook_url: (row.facebook_url ?? row.facebook ?? "").trim() || null,
      notes: (row.notes ?? "").trim() || null,
    });

    if (error) {
      summary.errors.push({ row: rowNum, message: error.message });
    } else {
      summary.created++;
    }
  }

  revalidatePath("/companies");
  return summary;
}
