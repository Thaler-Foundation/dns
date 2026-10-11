// Live figures for the vault pages, derived from the keeper API rows (NAV, hedge, pending stake); unknown values are null and render as n/a.
import type { DnsVaultInfo } from "@/lib/dns/load";

const USDC_ATOMS = 1_000_000;

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
