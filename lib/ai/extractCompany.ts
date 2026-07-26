import { callClaudeJSON } from "./claude";
import { FetchedSource } from "@/lib/research/fetchSource";

export interface ExtractedCompanyData {
  description: string | null;
  industry: string | null;
  business_type: string | null;
  company_size: string | null;
  location_city: string | null;
  location_state: string | null;
  markets_served: string[];
  services_offered: string[];
  business_model: string | null;
  public_contact_email: string | null;
  public_contact_phone: string | null;
  relevant_keywords: string[];
}

const SYSTEM_PROMPT = `You are a business research analyst. You will be given the raw text content
scraped from one or more public web sources about a single company, plus any
URLs that could not be fetched. Extract only what is explicitly stated or very
strongly implied by the source text. Never invent details.

If a field cannot be determined from the given sources, set it to null (or an
empty array for list fields). Do not guess a company's size or exact location
if it is not stated anywhere in the source text.

Respond with ONLY a single JSON object, no preamble, no markdown fences,
matching exactly this shape:

{
  "description": string | null,
  "industry": string | null,
  "business_type": string | null,
  "company_size": string | null,
  "location_city": string | null,
  "location_state": string | null,
  "markets_served": string[],
  "services_offered": string[],
  "business_model": string | null,
  "public_contact_email": string | null,
  "public_contact_phone": string | null,
  "relevant_keywords": string[]
}`;

export async function extractCompanyData(params: {
  companyName: string;
  sources: FetchedSource[];
  notes?: string | null;
}): Promise<ExtractedCompanyData> {
  const { companyName, sources, notes } = params;

  const sourceBlocks = sources
    .map((s) => {
      if (s.fetchError) {
        return `SOURCE (${s.type}): ${s.url}\n[Could not be fetched: ${s.fetchError}. Do not invent content for this source — treat it only as a signal of the company's presence on this platform.]`;
      }
      return `SOURCE (${s.type}): ${s.url}\nTITLE: ${s.title ?? "n/a"}\nCONTENT:\n${s.text}`;
    })
    .join("\n\n---\n\n");

  const userMessage = `Company name: ${companyName}
${notes ? `User notes: ${notes}\n` : ""}
Sources:

${sourceBlocks}`;

  return callClaudeJSON<ExtractedCompanyData>({
    system: SYSTEM_PROMPT,
    user: userMessage,
  });
}
