// Exact integer mirror of the program's unit rules: tDNS = 100 USDC (TDNS_PEG_USDC), stDNS at 11 decimals, and programs/dns/src/shares.rs share math on the published nav_usdc.
export const USDC_DECIMALS = 6;
export const TDNS_DECIMALS = 6;
export const STDNS_DECIMALS = 11;
export const TDNS_PEG_USDC = BigInt(100);
export const VIRTUAL_SHARES = BigInt(1000);
export const VIRTUAL_ASSETS = BigInt(1);

const U64_MAX = (BigInt(1) << BigInt(64)) - BigInt(1);

export function parseAtoms(text: string, decimals: number): bigint | null {
  const clean = text.trim();
  if (!/^\d*\.?\d*$/.test(clean) || clean === "" || clean === ".") return null;
  const [whole = "", frac = ""] = clean.split(".");
  if (frac.length > decimals) return null;
  const atoms = BigInt((whole || "0") + frac.padEnd(decimals, "0"));
  return atoms <= U64_MAX ? atoms : null;
}

export function formatAtoms(atoms: bigint, decimals: number, maxFraction = decimals): string {
  const negative = atoms < BigInt(0);
  const abs = negative ? -atoms : atoms;
  const base = BigInt(10) ** BigInt(decimals);
  const whole = abs / base;
  let frac = (abs % base).toString().padStart(decimals, "0").slice(0, maxFraction);
  frac = frac.replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole.toString()}${frac ? `.${frac}` : ""}`;
}

export function tdnsToUsdcAtoms(tdnsAtoms: bigint): bigint {
  return tdnsAtoms * TDNS_PEG_USDC;
}

export function usdcToTdnsAtoms(usdcAtoms: bigint): bigint {
  return usdcAtoms / TDNS_PEG_USDC;
}

export function sharesForAssets(assets: bigint, navUsdc: bigint, shareSupply: bigint): bigint {
  return (assets * (shareSupply + VIRTUAL_SHARES)) / (navUsdc + VIRTUAL_ASSETS);
}

export function assetsForShares(shares: bigint, navUsdc: bigint, shareSupply: bigint): bigint {
  return (shares * (navUsdc + VIRTUAL_ASSETS)) / (shareSupply + VIRTUAL_SHARES);
}
