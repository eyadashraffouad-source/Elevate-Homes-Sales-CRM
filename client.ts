"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ContactStatus, JobTitle } from "@/types/db";

const VALID_CONTACT_STATUSES: ContactStatus[] = [
  "active",
  "follow_up",
  "unresponsive",
  "inactive",
];

const VALID_JOB_TITLES: JobTitle[] = [
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

function readContactForm(formData: FormData) {
  const full_name = (formData.get("full_name") as string)?.trim();
  const jobTitleRaw = (formData.get("job_title") as string) || null;
  const job_title = VALID_JOB_TITLES.includes(jobTitleRaw as JobTitle)
    ? (jobTitleRaw as JobTitle)
    : null;
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const linkedin_url = (formData.get("linkedin_url") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const statusRaw = (formData.get("contact_status") as string) || "active";
  const contact_status: ContactStatus = VALID_CONTACT_STATUSES.includes(
    statusRaw as ContactStatus
  )
    ? (statusRaw as ContactStatus)
    : "active";

  return { full_name, job_title, email, phone, linkedin_url, notes, contact_status };
}

export async function createContact(companyId: string, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = readContactForm(formData);
  if (!parsed.full_name) throw new Error("Full name is required");

  const { error } = await supabase.from("contacts").insert({
    user_id: user.id,
    company_id: companyId,
    ...parsed,
  });

  if (error) throw error;

  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}

export async function updateContact(
  companyId: string,
  contactId: string,
  formData: FormData
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const parsed = readContactForm(formData);
  if (!parsed.full_name) throw new Error("Full name is required");

  const { error } = await supabase
    .from("contacts")
    .update(parsed)
    .eq("id", contactId)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}

export async function deleteContact(companyId: string, contactId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", contactId)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath(`/companies/${companyId}`);
  redirect(`/companies/${companyId}`);
}
