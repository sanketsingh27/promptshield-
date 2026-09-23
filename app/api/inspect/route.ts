import { screenText } from "../../screening";
import type { Screening } from "../../screening";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let state: string;
  try {
    const body = await req.json();
    if (typeof body?.prompt !== "string" || !body.prompt.trim()) {
      return Response.json({ error: "empty prompt" }, { status: 400 });
    }
    state = body.prompt.slice(0, 20_000); // demo-grade guard
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const started = Date.now();
  try {
    const answer: Screening = await screenText(state);
    return Response.json({
      noul: answer.noul,
      latency: Date.now() - started,
    });
  } catch (err) {
    console.error("openrouter screening failed", err);
    return Response.json({ error: "detection failed" }, { status: 502 });
  }
}
