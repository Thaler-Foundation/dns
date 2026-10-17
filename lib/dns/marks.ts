// The DNS service's xStock marks (GET /public/dns/marks) for the vault cards: USDC atoms per share by ticker, polled every 8 s, shown only while at most 30 s old, each price move flashing for 0.95 s.
export const MARKS_POLL_MS = 8_000;
export const MARKS_MAX_AGE_MS = 30_000;
export const MARKS_FLASH_MS = 950;

export type StockMove = "up" | "down";
export type StockMarksSnapshot = { prices: Record<string, bigint>; ageMs: number; receivedAtMs: number };
export type StockMarksView = { snapshot: StockMarksSnapshot | null; nowMs: number; flashes: Record<string, StockMove> };

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

export function priceMoves(last: Record<string, bigint>, prices: Record<string, bigint>): Record<string, StockMove> {
  const moves: Record<string, StockMove> = {};
  for (const [ticker, price] of Object.entries(prices)) {
    const before = last[ticker];
    if (before !== undefined && price !== before) moves[ticker] = price > before ? "up" : "down";
  }
  return moves;
}

export function startStockMarksPolling(deps: {
  apiUrl: string;
  fetchJson: (url: string) => Promise<unknown>;
  now: () => number;
  onUpdate: (view: StockMarksView) => void;
  every: (fn: () => void, ms: number) => () => void;
  later: (fn: () => void, ms: number) => () => void;
}): () => void {
  let snapshot: StockMarksSnapshot | null = null;
  let last: Record<string, bigint> = {};
  let flashes: Record<string, StockMove> = {};
  const flashOf: Record<string, number> = {};
  const pending = new Set<() => void>();
  let flashCount = 0;
  let active = true;
  const publish = () => deps.onUpdate({ snapshot, nowMs: deps.now(), flashes });
  const flash = (moves: Record<string, StockMove>) => {
    const id = ++flashCount;
    for (const ticker of Object.keys(moves)) flashOf[ticker] = id;
    flashes = { ...flashes, ...moves };
    const cancel = deps.later(() => {
      pending.delete(cancel);
      if (!active) return;
      flashes = Object.fromEntries(Object.entries(flashes).filter(([ticker]) => flashOf[ticker] !== id));
      publish();
    }, MARKS_FLASH_MS);
    pending.add(cancel);
  };
  const tick = () => {
    publish();
    deps.fetchJson(`${deps.apiUrl}/public/dns/marks`).then(
      (body) => {
        const next = parseStockMarks(body, deps.now());
        if (!active || !next) return;
        const moves = priceMoves(last, next.prices);
        last = { ...last, ...next.prices };
        snapshot = next;
        if (Object.keys(moves).length > 0) flash(moves);
        publish();
      },
      () => undefined,
    );
  };
  tick();
  const stop = deps.every(tick, MARKS_POLL_MS);
  return () => {
    active = false;
    stop();
    for (const cancel of pending) cancel();
    pending.clear();
  };
}
