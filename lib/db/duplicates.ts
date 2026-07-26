import { createClient } from "@/lib/supabase/server";
import { Company } from "@/types/db";

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Looks for an existing company that likely represents the same business:
 * an exact normalized-name match, or a matching website/LinkedIn domain.
 * Returns the first match found, or null.
 */
export async function findDuplicateCompany(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  candidate: {
    name: string;
    website_url?: string | null;
    linkedin_url?: string | null;
  }
): Promise<Company | null> {
  const { data: existing } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId);

  if (!existing) return null;

  const candidateName = normalizeName(candidate.name);
  const candidateSite = normalizeUrl(candidate.website_url);
  const candidateLinkedin = normalizeUrl(candidate.linkedin_url);

  for (const row of existing as Company[]) {
    if (normalizeName(row.name) === candidateName) return row;
    if (candidateSite && normalizeUrl(row.website_url) === candidateSite) return row;
    if (candidateLinkedin && normalizeUrl(row.linkedin_url) === candidateLinkedin) return row;
  }

  return null;
}
