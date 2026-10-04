// Values one mirrored leg the way the program prices it (spec 11.14/11.19): one share = mark_ticks x tick_size x 10^base_lot_decimals quote atoms, the long = scaled spot at that price, the short = lots at that price, unrealised = virtual quote minus the short at the mark.
import type { DnsHedgeLeg } from "@/lib/dns/load";
import { formatAtoms, USDC_DECIMALS } from "@/lib/dns/math";

export type LegParams = { tickSize: bigint; baseLotDecimals: number; spotDecimals: number };

export type LegFigures = {
  longUsdc: bigint;
  shortUsdc: bigint;
  unrealised: bigint;
  longShares: string;
  shortShares: string;
  markUsdc: string;
};

export function markUsdcAtoms(markTicks: bigint, p: LegParams): bigint {
  return markTicks * p.tickSize * BigInt(10) ** BigInt(p.baseLotDecimals);
}

function twoDecimals(atoms: bigint): string {
  const base = BigInt(10) ** BigInt(USDC_DECIMALS);
  const whole = atoms / base;
  const cents = (atoms % base) / BigInt(10) ** BigInt(USDC_DECIMALS - 2);
  return `${whole.toString()}.${cents.toString().padStart(2, "0")}`;
}

export function legFigures(leg: DnsHedgeLeg, markTicks: bigint, p: LegParams): LegFigures {
  const perShare = markUsdcAtoms(markTicks, p);
  const shortUsdc = leg.shortLots * markTicks * p.tickSize;
  return {
    longUsdc: (leg.spotScaled * perShare) / BigInt(10) ** BigInt(p.spotDecimals),
    shortUsdc,
    unrealised: leg.virtualQuote - shortUsdc,
    longShares: formatAtoms(leg.spotScaled, p.spotDecimals),
    shortShares: formatAtoms(leg.shortLots, p.baseLotDecimals),
    markUsdc: twoDecimals(perShare),
  };
}
