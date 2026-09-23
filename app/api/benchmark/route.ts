import { runBenchmark, type BenchmarkProgress } from "../../corpus/run-benchmark";

export const dynamic = "force-dynamic";

// Single shared in-flight run: hitting POST again while a benchmark streams
// returns 409 instead of doubling upstream API load.
let inflight: Promise<void> | null = null;

const SSELog = (chunk: string) => `data: ${chunk}\n\n`;

export async function POST() {
  if (inflight) return Response.json({ error: "benchmark already running" }, { status: 409 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let last: BenchmarkProgress | null = null;
      const push = (p: BenchmarkProgress) => {
        last = p;
        try {
          controller.enqueue(encoder.encode(SSELog(JSON.stringify(p))));
        } catch {
          // client disconnected; keep computing so the shared run finishes
        }
      };
      inflight = runBenchmark(Number.MAX_SAFE_INTEGER, push)
        .then(() => controller.enqueue(encoder.encode(SSELog(JSON.stringify({ finished: true, ...last })))))
        .catch(() => controller.enqueue(encoder.encode(SSELog(JSON.stringify({ error: "benchmark failed" })))))
        .finally(() => {
          inflight = null;
          controller.close();
        });
      await inflight;
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
