import { callClaudeJSON } from "./claude";
import { FetchedSource } from "@/lib/research/fetchSource";

export interface ExtractedContact {
  full_name: string;
  job_title: string | null;
  linkedin_url: string | null;
  public_email: string | null;
  phone: string | null;
  source_url: string;
  confidence_level: "high" | "medium" | "low";
  relationship_to_company: string | null;
}

const SYSTEM_PROMPT = `You are a research analyst identifying named individuals associated with a
company from public source text. Only extract people who are explicitly named
alongside a role or title (e.g. "Jane Doe, Sales Manager", a LinkedIn "About"
line, a website team page).

Confidence levels:
- "high": the person's name and role/title are both explicitly stated together
  on the source (e.g. a team page, a LinkedIn title, a bio).
- "medium": the name is stated and a role is reasonably inferable from context
  (e.g. listed under a "Leadership" heading with no explicit title).
- "low": the person is only loosely associated with the company (e.g.
  mentioned once, unclear role).

Never invent a person. If no named individuals are found, return an empty array.
Each contact must include the exact source_url it was found on.

Respond with ONLY a JSON object of this shape, no preamble, no markdown fences:

{
  "contacts": [
    {
      "full_name": string,
      "job_title": string | null,
      "linkedin_url": string | null,
      "public_email": string | null,
      "phone": string | null,
      "source_url": string,
      "confidence_level": "high" | "medium" | "low",
      "relationship_to_company": string | null
    }
  ]
}`;

export async function extractContacts(params: {
  companyName: string;
  sources: FetchedSource[];
}): Promise<ExtractedContact[]> {
  const { companyName, sources } = params;

  const sourceBlocks = sources
    .filter((s) => !s.fetchError)
    .map(
      (s) =>
        `SOURCE (${s.type}): ${s.url}\nTITLE: ${s.title ?? "n/a"}\nCONTENT:\n${s.text}`
    )
    .join("\n\n---\n\n");

  const userMessage = `Company name: ${companyName}

Sources:

${sourceBlocks || "(no fetchable source content)"}`;

  const result = await callClaudeJSON<{ contacts: ExtractedContact[] }>({
    system: SYSTEM_PROMPT,
    user: userMessage,
  });

  return result.contacts ?? [];
}
