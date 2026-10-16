// Live figures for the vault pages, derived from the keeper API rows (NAV, hedge, pending stake); unknown values are null and render as n/a.
import type { DnsVaultInfo } from "@/lib/dns/load";
import { STDNS_DECIMALS, assetsForShares } from "@/lib/dns/math";

const USDC_ATOMS = 1_000_000;
const USDC_ATOMS_BIG = BigInt(USDC_ATOMS);
const ONE_STDNS = BigInt(10) ** BigInt(STDNS_DECIMALS);

export function vaultTvlUsdc(info: DnsVaultInfo | undefined): bigint | null {
  if (!info) return null;
  if (info.published) return info.navUsdc;
  return info.shareSupply === BigInt(0) ? BigInt(0) : null;
}

export function totalTvlUsdc(infos: (DnsVaultInfo | undefined)[]): bigint | null {
  let total: bigint | null = null;
  for (const info of infos) {
    const tvl = vaultTvlUsdc(info);
    if (tvl !== null) total = (total ?? BigInt(0)) + tvl;
  }
  return total;
}

export function formatUsdc(atoms: bigint | null): string {
  if (atoms === null) return "$0";
  const amount = Number(atoms) / USDC_ATOMS;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
}

export function formatUsdcExact(atoms: bigint | null): string {
  if (atoms === null) return "n/a";
  const negative = atoms < BigInt(0);
  const cents = ((negative ? -atoms : atoms) + BigInt(5_000)) / BigInt(10_000);
  const cent = (cents % BigInt(100)).toString().padStart(2, "0");
  return `${negative ? "-" : ""}$${(cents / BigInt(100)).toLocaleString("en-US")}.${cent}`;
}

export function deployedUsdc(info: DnsVaultInfo | undefined): bigint | null {
  if (!info?.hedge) return null;
  return info.hedge.legs.a.deployedUsdc + info.hedge.legs.b.deployedUsdc;
}

export function lastMirrorRead(info: DnsVaultInfo | undefined): { atMs: number; mainnetSlot: number } | null {
  if (!info?.hedge) return null;
  return { atMs: info.hedge.capturedAtMs, mainnetSlot: info.hedge.mainnetSlot };
}

export function hedgedVaultCount(infos: (DnsVaultInfo | undefined)[]): number {
  return infos.filter((info) => info !== undefined && info.venuesLive > 0).length;
}

// USDC atoms one whole stDNS redeems for at the vault's own published NAV (shares.rs assets_for_shares); null while unpublished.
export function stdnsRateUsdc(info: DnsVaultInfo | undefined): bigint | null {
  if (!info?.published) return null;
  return assetsForShares(ONE_STDNS, info.navUsdc, info.shareSupply);
}

export function formatRateUsdc(atoms: bigint | null): string {
  if (atoms === null) return "n/a";
  return `${atoms / USDC_ATOMS_BIG}.${(atoms % USDC_ATOMS_BIG).toString().padStart(6, "0")}`;
}

export function formatRate(atoms: bigint | null): string {
  return atoms === null ? "n/a" : `1 stDNS = ${formatRateUsdc(atoms)} USDC`;
}

export function vaultApy(info: DnsVaultInfo | undefined): number | null {
  const now = stdnsRateUsdc(info);
  if (now === null || !info?.rate7d) return null;
  const base = assetsForShares(ONE_STDNS, info.rate7d.navUsdc, info.rate7d.shareSupply);
  if (base === BigInt(0)) return null;
  return (Number(now) / Number(base)) ** (365 / 7) - 1;
}

export function formatApy(apy: number | null): string {
  if (apy === null || !Number.isFinite(apy)) return "n/a";
  const pct = (apy * 100).toFixed(2);
  return `${pct === "-0.00" ? "0.00" : pct}%`;
}

export function formatSignedUsdc(atoms: bigint): string {
  const sign = atoms < BigInt(0) ? "-" : "+";
  const abs = atoms < BigInt(0) ? -atoms : atoms;
  return `${sign}$${(Number(abs) / USDC_ATOMS).toFixed(2)}`;
}

export function cushionPercent(pressureBps: number | null): string {
  if (pressureBps === null) return "n/a";
  const bps = 1000 + Math.floor((2300 * pressureBps) / 10000);
  return `${(bps / 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}
