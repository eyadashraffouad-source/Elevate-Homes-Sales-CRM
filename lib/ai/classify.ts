import { callClaudeJSON } from "./claude";
import { ExtractedCompanyData } from "./extractCompany";
import { ExtractedContact } from "./extractContacts";

export interface ClassificationResult {
  potential_need: string | null;
  potential_services: string[];
  lead_status: "potential_prospect" | "contacted" | "qualified" | "disqualified";
  decision_maker_status: "confirmed" | "not_confirmed" | "unknown";
  best_available_contact: string | null; // e.g. "Sales Manager" or a contact's full name
  recommended_action: string | null;
  tags: { name: string; category: string }[];
}

const SYSTEM_PROMPT = `You are a business development analyst. Given structured company data and a
list of identified contacts, classify this company as a potential client lead
for the user's own services (the user provides marketing / lead generation /
growth services to businesses — treat that as the lens for "potential need").

Rules:
- decision_maker_status is "confirmed" only if a contact with an owner/founder/
  CEO/president-level title was identified. Otherwise "not_confirmed" if some
  contact exists but no top-level decision maker, or "unknown" if no contacts
  at all.
- best_available_contact should name the strongest available contact's role
  (or name, if only one strong option exists).
- recommended_action should be one concrete, specific next step — not generic
  advice.
- tags should be short, reusable labels across these categories: "industry",
  "state", "city", "market", "service", "need", "role", "decision_maker".
  Only include tags that are actually supported by the data given.

Respond with ONLY a JSON object of this exact shape, no preamble, no fences:

{
  "potential_need": string | null,
  "potential_services": string[],
  "lead_status": "potential_prospect" | "contacted" | "qualified" | "disqualified",
  "decision_maker_status": "confirmed" | "not_confirmed" | "unknown",
  "best_available_contact": string | null,
  "recommended_action": string | null,
  "tags": [{ "name": string, "category": string }]
}`;

export async function classifyCompany(params: {
  companyName: string;
  companyData: ExtractedCompanyData;
  contacts: ExtractedContact[];
}): Promise<ClassificationResult> {
  const { companyName, companyData, contacts } = params;

  const userMessage = `Company name: ${companyName}

Company data:
${JSON.stringify(companyData, null, 2)}

Identified contacts:
${JSON.stringify(contacts, null, 2)}`;

  return callClaudeJSON<ClassificationResult>({
    system: SYSTEM_PROMPT,
    user: userMessage,
    maxTokens: 1200,
  });
}
