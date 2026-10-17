// The DNS service's xStock marks (GET /public/dns/marks) for the vault cards: USDC atoms per share by ticker, polled every 8 s and shown only while at most 30 s old.
export const MARKS_POLL_MS = 8_000;
export const MARKS_MAX_AGE_MS = 30_000;

export type StockMarksSnapshot = { prices: Record<string, bigint>; ageMs: number; receivedAtMs: number };
export type StockMarksView = { snapshot: StockMarksSnapshot | null; nowMs: number };

export function parseStockMarks(body: unknown, receivedAtMs: number): StockMarksSnapshot | null {
  if (!body || typeof body !== "object") return null;
  const b = body as { available?: unknown; ageMs?: unknown; prices?: unknown };
  if (b.available !== true || typeof b.ageMs !== "number" || b.ageMs < 0 || !b.prices || typeof b.prices !== "object") return null;
  const prices: Record<string, bigint> = {};
  for (const [ticker, raw] of Object.entries(b.prices as Record<string, unknown>)) {
    if (typeof raw === "string" && /^\d+$/.test(raw)) prices[ticker] = BigInt(raw);
  }
  return { prices, ageMs: b.ageMs, receivedAtMs };
}

export function stockMarkUsdc(view: StockMarksView, ticker: string): bigint | null {
  const s = view.snapshot;
  if (!s || s.ageMs + (view.nowMs - s.receivedAtMs) > MARKS_MAX_AGE_MS) return null;
  return s.prices[ticker] ?? null;
}

export function startStockMarksPolling(deps: {
  apiUrl: string;
  fetchJson: (url: string) => Promise<unknown>;
  now: () => number;
  onUpdate: (view: StockMarksView) => void;
  every: (fn: () => void, ms: number) => () => void;
}): () => void {
  let snapshot: StockMarksSnapshot | null = null;
  let active = true;
  const tick = () => {
    deps.onUpdate({ snapshot, nowMs: deps.now() });
    deps.fetchJson(`${deps.apiUrl}/public/dns/marks`).then(
      (body) => {
        const next = parseStockMarks(body, deps.now());
        if (!active || !next) return;
        snapshot = next;
        deps.onUpdate({ snapshot, nowMs: deps.now() });
      },
      () => undefined,
    );
  };
  tick();
  const stop = deps.every(tick, MARKS_POLL_MS);
  return () => {
    active = false;
    stop();
  };
}
