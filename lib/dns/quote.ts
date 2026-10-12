// Deposit quote as the program prices a legs_required stake: both legs filled at the vault's marks with the taker fee (mirror_execute_leg.rs fill and record_fill), valued at those marks (nav.rs leg_value_quote_lots) plus the 4 % buffer part (price_group.rs), then shares_for_assets on the vault's own NAV and supply (settle_group.rs).
import type { LegParams } from "@/lib/dns/hedge";
import type { DnsVaultInfo } from "@/lib/dns/load";
import { TDNS_PEG_USDC, sharesForAssets } from "@/lib/dns/math";

export const LEG_USDC_PERCENT = BigInt(48);
export const BUFFER_USDC_PERCENT = BigInt(4);
export const MIRROR_TAKER_FEE = BigInt(35);
export const FEE_SCALE = BigInt(100_000);
export const MULTIPLIER_SCALE = BigInt(1_000_000);

export type LegFill = { raw: bigint; lots: bigint; proceeds: bigint; fee: bigint; buyFee: bigint; collateral: bigint };

const pow10 = (n: number) => BigInt(10) ** BigInt(n);
const ceilDiv = (a: bigint, b: bigint) => (a + b - BigInt(1)) / b;

export function scaledAmount(raw: bigint, multiplierMicros: bigint): bigint {
  return (raw * multiplierMicros) / MULTIPLIER_SCALE;
}

export function spotBaseLots(atoms: bigint, p: LegParams): bigint {
  return (atoms * pow10(p.baseLotDecimals)) / pow10(p.spotDecimals);
}

export function spotValueQuoteLots(atoms: bigint, p: LegParams, markTicks: bigint): bigint {
  if (atoms === BigInt(0)) return BigInt(0);
  return (atoms * markTicks * p.tickSize * pow10(p.baseLotDecimals)) / pow10(p.spotDecimals);
}

export function fillLeg(usdc: bigint, markTicks: bigint, p: LegParams, multiplierMicros: bigint): LegFill {
  const price = markTicks * p.tickSize * pow10(p.baseLotDecimals);
  const raw = (usdc * pow10(p.spotDecimals) * MULTIPLIER_SCALE * FEE_SCALE) / (price * (FEE_SCALE + MIRROR_TAKER_FEE) * multiplierMicros);
  const lots = spotBaseLots(scaledAmount(raw, multiplierMicros), p);
  const proceeds = lots * markTicks * p.tickSize;
  const fee = ceilDiv(proceeds * MIRROR_TAKER_FEE, FEE_SCALE);
  const notional = (usdc * FEE_SCALE) / (FEE_SCALE + MIRROR_TAKER_FEE);
  return { raw, lots, proceeds, fee, buyFee: usdc - notional, collateral: usdc - fee };
}

// nav.rs leg_value_quote_lots: spot at the mark plus collateral plus the short's unrealised term.
export function legValue(raw: bigint, multiplierMicros: bigint, p: LegParams, markTicks: bigint, collateral: bigint, virtualQuote: bigint, shortLots: bigint): bigint {
  return spotValueQuoteLots(scaledAmount(raw, multiplierMicros), p, markTicks) + collateral + virtualQuote - shortLots * markTicks * p.tickSize;
}

// A leg valued at the mark it was filled at, where the short's unrealised term is zero.
export function legValueAtMark(raw: bigint, multiplierMicros: bigint, p: LegParams, markTicks: bigint, collateral: bigint): bigint {
  return spotValueQuoteLots(scaledAmount(raw, multiplierMicros), p, markTicks) + collateral;
}

export type StakeGroupFills = {
  total_usdc: bigint;
  leg_a_done: number;
  leg_a_spot_raw: bigint;
  leg_a_collateral: bigint;
  leg_a_short_lots: bigint;
  leg_a_virtual_quote: bigint;
  leg_b_done: number;
  leg_b_spot_raw: bigint;
  leg_b_collateral: bigint;
  leg_b_short_lots: bigint;
  leg_b_virtual_quote: bigint;
};

// price_group.rs for an executing group: the USDC its done legs have not spent plus those legs valued at the current marks.
export function groupValueFromFills(g: StakeGroupFills, v: DnsVaultInfo): bigint | null {
  if (!v.hedge) return null;
  const legsDone = BigInt(g.leg_a_done) + BigInt(g.leg_b_done);
  let value = g.total_usdc - (g.total_usdc / TDNS_PEG_USDC) * LEG_USDC_PERCENT * legsDone;
  if (g.leg_a_done === 1) value += legValue(g.leg_a_spot_raw, v.hedge.multipliers.a, legParams(v, "A"), v.hedge.marks.a, g.leg_a_collateral, g.leg_a_virtual_quote, g.leg_a_short_lots);
  if (g.leg_b_done === 1) value += legValue(g.leg_b_spot_raw, v.hedge.multipliers.b, legParams(v, "B"), v.hedge.marks.b, g.leg_b_collateral, g.leg_b_virtual_quote, g.leg_b_short_lots);
  return value;
}

function legParams(v: DnsVaultInfo, leg: "A" | "B"): LegParams {
  return { tickSize: v.params[`tickSize${leg}`], baseLotDecimals: v.params[`baseLotDecimals${leg}`], spotDecimals: v.params[`spotDecimals${leg}`] };
}

// null when the vault has no mirrored marks yet or a leg would sell no lots (the program refuses that fill).
export function groupValueForStake(totalUsdc: bigint, v: DnsVaultInfo): bigint | null {
  if (!v.hedge) return null;
  const perSide = (totalUsdc / TDNS_PEG_USDC) * (LEG_USDC_PERCENT / BigInt(2));
  const buffer = (totalUsdc / TDNS_PEG_USDC) * BUFFER_USDC_PERCENT;
  let value = buffer;
  for (const [leg, mark, mult] of [["A", v.hedge.marks.a, v.hedge.multipliers.a], ["B", v.hedge.marks.b, v.hedge.multipliers.b]] as const) {
    const p = legParams(v, leg);
    const f = fillLeg(perSide, mark, p, mult);
    if (f.lots === BigInt(0)) return null;
    value += legValueAtMark(f.raw, mult, p, mark, f.collateral);
  }
  return value;
}

export function quoteStakeShares(totalUsdc: bigint, v: DnsVaultInfo, legsRequired: number): bigint | null {
  if (legsRequired !== 1) return sharesForAssets(totalUsdc, v.navUsdc, v.shareSupply);
  const value = groupValueForStake(totalUsdc, v);
  return value === null ? null : sharesForAssets(value, v.navUsdc, v.shareSupply);
}
