// Reads a wallet's stDNS position in every live vault from its Token-2022 associated accounts (the accounts redeem spends), checking each account's mint and owner, and values it with assets_for_shares on the published NAV.
import { getAddressEncoder, type Address } from "@solana/kit";
import { findAta, TOKEN_2022_PROGRAM } from "@/lib/dns/tx";
import { assetsForShares } from "@/lib/dns/math";
import type { DnsVaultInfo } from "@/lib/dns/load";

export type DnsPosition = {
  vaultId: string;
  vault: Address;
  stdnsMint: Address;
  account: Address;
  atoms: bigint;
  usdcValue: bigint;
};

const TOKEN_ACCOUNT_MIN_LEN = 165;
const MAX_ACCOUNTS_PER_CALL = 100;

function sameBytes(a: Uint8Array, b: ArrayLike<number>): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function decodeTokenAmount(data: Uint8Array, mint: Address, owner: Address): bigint | null {
  if (data.length < TOKEN_ACCOUNT_MIN_LEN) return null;
  const enc = getAddressEncoder();
  if (!sameBytes(data.subarray(0, 32), enc.encode(mint))) return null;
  if (!sameBytes(data.subarray(32, 64), enc.encode(owner))) return null;
  return new DataView(data.buffer, data.byteOffset + 64, 8).getBigUint64(0, true);
}

export async function loadPositions(
  owner: Address,
  vaults: Record<string, DnsVaultInfo>,
  getMultiple: (addresses: Address[]) => Promise<(Uint8Array | null)[]>,
): Promise<DnsPosition[]> {
  const entries = Object.entries(vaults);
  const accounts = await Promise.all(entries.map(([, v]) => findAta(owner, v.stdnsMint, TOKEN_2022_PROGRAM)));
  const data: (Uint8Array | null)[] = [];
  for (let i = 0; i < accounts.length; i += MAX_ACCOUNTS_PER_CALL) {
    data.push(...(await getMultiple(accounts.slice(i, i + MAX_ACCOUNTS_PER_CALL))));
  }
  const positions: DnsPosition[] = [];
  entries.forEach(([vaultId, v], i) => {
    const raw = data[i];
    if (!raw) return;
    const atoms = decodeTokenAmount(raw, v.stdnsMint, owner);
    if (atoms === null || atoms === BigInt(0)) return;
    positions.push({
      vaultId,
      vault: v.vault,
      stdnsMint: v.stdnsMint,
      account: accounts[i]!,
      atoms,
      usdcValue: assetsForShares(atoms, v.navUsdc, v.shareSupply),
    });
  });
  return positions.sort((a, b) => (b.usdcValue > a.usdcValue ? 1 : b.usdcValue < a.usdcValue ? -1 : 0));
}
