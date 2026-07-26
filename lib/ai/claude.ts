import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Calls Claude with a system prompt + user content and expects a single
 * JSON object back. Strips code fences defensively and throws with the raw
 * text attached if parsing fails, so the caller can log it to research_runs.
 */
export async function callClaudeJSON<T>(params: {
  system: string;
  user: string;
  model?: string;
  maxTokens?: number;
}): Promise<T> {
  const { system, user, model = "claude-sonnet-4-6", maxTokens = 2000 } = params;

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";

  const cleaned = raw.replace(/```json\s*|```/g, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    throw new Error(
      `Claude did not return valid JSON. Raw response:\n${raw}`
    );
  }
}
