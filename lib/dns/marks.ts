// The DNS service's xStock marks (GET /public/dns/marks) for the vault cards: USDC atoms per share by ticker and each stock's mark from 24 h ago, polled every 8 s, shown only while at most 30 s old, with each price's last move.
export const MARKS_POLL_MS = 8_000;
export const MARKS_MAX_AGE_MS = 30_000;

export type StockMove = "up" | "down";
export type StockMarksSnapshot = { prices: Record<string, bigint>; prevDay: Record<string, bigint>; ageMs: number; receivedAtMs: number };
export type StockMarksView = { snapshot: StockMarksSnapshot | null; nowMs: number; moves: Record<string, StockMove> };

function atomsByTicker(raw: unknown): Record<string, bigint> {
  const atoms: Record<string, bigint> = {};
  if (!raw || typeof raw !== "object") return atoms;
  for (const [ticker, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string" && /^\d+$/.test(value)) atoms[ticker] = BigInt(value);
  }
  return atoms;
}

export function parseStockMarks(body: unknown, receivedAtMs: number): StockMarksSnapshot | null {
  if (!body || typeof body !== "object") return null;
  const b = body as { available?: unknown; ageMs?: unknown; prices?: unknown; prevDayPrices?: unknown };
  if (b.available !== true || typeof b.ageMs !== "number" || b.ageMs < 0 || !b.prices || typeof b.prices !== "object") return null;
  return { prices: atomsByTicker(b.prices), prevDay: atomsByTicker(b.prevDayPrices), ageMs: b.ageMs, receivedAtMs };
}

function freshSnapshot(view: StockMarksView): StockMarksSnapshot | null {
  const s = view.snapshot;
  return s && s.ageMs + (view.nowMs - s.receivedAtMs) <= MARKS_MAX_AGE_MS ? s : null;
}

export function stockMarkUsdc(view: StockMarksView, ticker: string): bigint | null {
  return freshSnapshot(view)?.prices[ticker] ?? null;
}

export function stockPrevDayUsdc(view: StockMarksView, ticker: string): bigint | null {
  return freshSnapshot(view)?.prevDay[ticker] ?? null;
}

export function formatChange24h(price: bigint, prevDay: bigint | null): string {
  if (prevDay === null || prevDay <= BigInt(0)) return "(n/a)";
  const pct = (Number(price) / Number(prevDay) - 1) * 100;
  const abs = Math.abs(pct).toFixed(2);
  return `(${pct < 0 && abs !== "0.00" ? "-" : "+"}${abs}%/24H)`;
}

export function nextMoves(moves: Record<string, StockMove>, last: Record<string, bigint>, prices: Record<string, bigint>): Record<string, StockMove> {
  const next = { ...moves };
  for (const [ticker, price] of Object.entries(prices)) {
    const before = last[ticker];
    if (before !== undefined && price !== before) next[ticker] = price > before ? "up" : "down";
  }
  return next;
}

export function startStockMarksPolling(deps: {
  apiUrl: string;
  fetchJson: (url: string) => Promise<unknown>;
  now: () => number;
  onUpdate: (view: StockMarksView) => void;
  every: (fn: () => void, ms: number) => () => void;
}): () => void {
  let snapshot: StockMarksSnapshot | null = null;
  let moves: Record<string, StockMove> = {};
  let last: Record<string, bigint> = {};
  let active = true;
  const tick = () => {
    deps.onUpdate({ snapshot, nowMs: deps.now(), moves });
    deps.fetchJson(`${deps.apiUrl}/public/dns/marks`).then(
      (body) => {
        const next = parseStockMarks(body, deps.now());
        if (!active || !next) return;
        moves = nextMoves(moves, last, next.prices);
        last = { ...last, ...next.prices };
        snapshot = next;
        deps.onUpdate({ snapshot, nowMs: deps.now(), moves });
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
