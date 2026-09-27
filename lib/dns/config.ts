// Devnet DNS wiring read from build-time NEXT_PUBLIC_* env: the watcher API, the USDC mint lib/tokens resolves, the tDNS mint, and the ticker -> xStock mint map that identifies each vault's asset pair.
import { isAddress, type Address } from "@solana/kit";
import type { StockTicker } from "@/lib/vaults-data";
import { TOKENS } from "@/lib/tokens";

export type DnsConfig = {
  apiUrl: string | null;
  usdcMint: Address | null;
  tdnsMint: Address | null;
  stockMints: Partial<Record<StockTicker, Address>>;
  problems: string[];
};

export function parseStockMints(raw: string | undefined): {
  mints: Partial<Record<StockTicker, Address>>;
  problems: string[];
} {
  const mints: Partial<Record<StockTicker, Address>> = {};
  const problems: string[] = [];
  for (const entry of (raw ?? "").split(",").map((e) => e.trim()).filter(Boolean)) {
    const [ticker, mint] = entry.split("=").map((p) => p.trim());
    if (!ticker || !mint || !isAddress(mint)) {
      problems.push(`NEXT_PUBLIC_DNS_STOCK_MINTS entry "${entry}" is not TICKER=mint`);
      continue;
    }
    mints[ticker as StockTicker] = mint as Address;
  }
  return { mints, problems };
}

function optionalAddress(name: string, value: string | undefined, problems: string[]): Address | null {
  if (!value) {
    problems.push(`${name} is not set`);
    return null;
  }
  if (!isAddress(value)) {
    problems.push(`${name} is not a valid address`);
    return null;
  }
  return value as Address;
}

export function loadDnsConfig(): DnsConfig {
  const problems: string[] = [];
  const apiUrl = process.env.NEXT_PUBLIC_DNS_API_URL?.replace(/\/+$/, "") || null;
  if (!apiUrl) problems.push("NEXT_PUBLIC_DNS_API_URL is not set");
  const usdcMint = optionalAddress("USDC mint (NEXT_PUBLIC_USDC_MINT or the lib/tokens default)", TOKENS.USDC.devnetMint, problems);
  const tdnsMint = optionalAddress("NEXT_PUBLIC_TDNS_MINT", process.env.NEXT_PUBLIC_TDNS_MINT, problems);
  const parsed = parseStockMints(process.env.NEXT_PUBLIC_DNS_STOCK_MINTS);
  problems.push(...parsed.problems);
  return { apiUrl, usdcMint, tdnsMint, stockMints: parsed.mints, problems };
}

export const DNS_CONFIG = loadDnsConfig();
