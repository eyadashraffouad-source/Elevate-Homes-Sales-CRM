"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { findDuplicateCompany } from "@/lib/db/duplicates";
import { CompanyStatus } from "@/types/db";

const VALID_STATUSES: CompanyStatus[] = [
  "active",
  "prospect",
  "customer",
  "inactive",
  "lost",
];

function readCompanyForm(formData: FormData) {
  const name = (formData.get("company_name") as string)?.trim();
  const website = (formData.get("website") as string)?.trim() || null;
  const industry = (formData.get("industry") as string)?.trim() || null;
  const statusRaw = (formData.get("company_status") as string) || "active";
  const notes = (formData.get("notes") as string)?.trim() || null;

  const company_status: CompanyStatus = VALID_STATUSES.includes(
    statusRaw as CompanyStatus
  )
    ? (statusRaw as CompanyStatus)
    : "active";

  return { name, website, industry, company_status, notes };
}

export async function createCompany(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { name, website, industry, company_status, notes } =
    readCompanyForm(formData);

  if (!name) throw new Error("Company name is required");

  // Guard against creating a duplicate company by name/website.
  const existing = await findDuplicateCompany(supabase, user.id, {
    company_name: name,
    website,
  });

  if (existing) {
    redirect(`/companies/${existing.id}?duplicate=1`);
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({
      user_id: user.id,
      company_name: name,
      website,
      industry,
      company_status,
      notes,
    })
    .select("id")
    .single();

  if (error) throw error;

  revalidatePath("/companies");
  redirect(`/companies/${data.id}`);
}

export async function updateCompany(companyId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { name, website, industry, company_status, notes } =
    readCompanyForm(formData);

  if (!name) throw new Error("Company name is required");

  const { error } = await supabase
    .from("companies")
    .update({
      company_name: name,
      website,
      industry,
      company_status,
      notes,
    })
    .eq("id", companyId)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/companies");
  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}

export async function deleteCompany(companyId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/companies");
  redirect("/companies");
}

/** Used by the "Add Company" search-first flow to check for an existing match. */
export async function searchCompaniesByName(query: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from("companies")
    .select("id, company_name, website, industry, company_status")
    .eq("user_id", user.id)
    .ilike("company_name", `%${query.trim()}%`)
    .order("company_name", { ascending: true })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}
