import Anthropic from "@anthropic-ai/sdk";
import { ExtractedCompanyData } from "./extractCompany";
import { ExtractedContact } from "./extractContacts";
import { ClassificationResult } from "./classify";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `You write short, plain-English company intelligence summaries (2-4 sentences)
for a business development user. State what the company appears to be, where
it operates, whether it looks like a fit based on the classification given,
who the strongest contact is, and what the recommended next step is. Be
direct and factual — do not oversell the lead. If key facts are missing
(e.g. no decision maker identified), say so plainly rather than glossing
over it. Respond with plain text only, no JSON, no headers.`;

export async function summarizeCompany(params: {
  companyName: string;
  companyData: ExtractedCompanyData;
  contacts: ExtractedContact[];
  classification: ClassificationResult;
}): Promise<string> {
  const { companyName, companyData, contacts, classification } = params;

  const userMessage = `Company name: ${companyName}
Company data: ${JSON.stringify(companyData)}
Contacts: ${JSON.stringify(contacts)}
Classification: ${JSON.stringify(classification)}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content.find((b) => b.type === "text");
  return block && "text" in block ? block.text.trim() : "";
}
