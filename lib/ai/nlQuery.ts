import { callClaudeJSON } from "./claude";

export interface CompanyQueryFilter {
  location_state?: string;
  location_city?: string;
  industry?: string;
  business_type?: string;
  lead_status?: string;
  decision_maker_status?: "confirmed" | "not_confirmed" | "unknown";
  research_status?: string;
  has_contact_role?: string; // e.g. "Sales Manager"
  missing_contact_role?: string; // e.g. "Owner" — companies WITHOUT this role
  keyword?: string; // free-text match against description/keywords
  explanation: string; // one-line explanation of how the question was interpreted
}

const SYSTEM_PROMPT = `You translate a user's natural language question about their company research
database into a structured filter object. You never write SQL yourself — you
only decide which of the following fields apply, based on the question.

Available filter fields (all optional, omit any that don't apply):
- location_state: string
- location_city: string
- industry: string
- business_type: string
- lead_status: "potential_prospect" | "contacted" | "qualified" | "disqualified"
- decision_maker_status: "confirmed" | "not_confirmed" | "unknown"
- research_status: "not_researched" | "researching" | "researched" | "failed" | "needs_update"
- has_contact_role: string (companies that HAVE a contact with roughly this role/title)
- missing_contact_role: string (companies that DO NOT have a contact with roughly this role/title)
- keyword: string (free-text term to match against description, industry, or keywords)

Always include "explanation": a one-sentence plain-English restatement of how
you interpreted the question, so the user can confirm you understood
correctly.

Respond with ONLY a JSON object, no preamble, no markdown fences.`;

export async function translateQuestionToFilter(
  question: string
): Promise<CompanyQueryFilter> {
  return callClaudeJSON<CompanyQueryFilter>({
    system: SYSTEM_PROMPT,
    user: question,
    maxTokens: 400,
  });
}
