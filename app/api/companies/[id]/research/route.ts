import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runResearch } from "@/lib/research/runResearch";

// Research runs fetch multiple URLs and make several sequential Claude calls,
// which can take well past the default 10-60s serverless timeout. On Vercel,
// maxDuration above 60s requires a Pro/Enterprise plan (see Known limitations
// in README.md) — this is a synchronous pipeline, not a background job yet.
export const maxDuration = 120;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runResearch(params.id, user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Research failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
