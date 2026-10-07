// Stake requests as programs/dns records them: the vault account read at deposit time gives the open group id and pinned USDC account request_stake needs; the wallet's live StakeRequest accounts (user at byte 35) with their groups give each pending request's status and stDNS: its pro-rata share of the group's escrow shares (settle_stake's member_share), exact once the group is PRICED or SETTLED, an estimate at the published NAV while OPEN or EXECUTING (its legs running); zero means a refund, except in a PRICED group whose legs ran, which the program never refunds.
import { getAddressEncoder, type Address } from "@solana/kit";
import { ThalerDnsClient } from "@/lib/dns/client";
import { sharesForAssets } from "@/lib/dns/math";
import type { DnsVaultInfo } from "@/lib/dns/load";

export const STAKE_REQUEST_DISCRIMINATOR = 5;
export const STAKE_REQUEST_USER_OFFSET = 35;
export const GROUP_OPEN = 0;
export const GROUP_PRICED = 1;
export const GROUP_ABORTED = 2;
export const GROUP_SETTLED = 3;
export const GROUP_EXECUTING = 4;

const MAX_ACCOUNTS_PER_CALL = 100;
const client = new ThalerDnsClient();

export type VaultStakeTarget = { openGroup: bigint; vaultUsdc: Address; stdnsMint: Address };

export async function readStakeTarget(
  vault: Address,
  readAccount: (a: Address) => Promise<Uint8Array | null>,
): Promise<VaultStakeTarget> {
  const data = await readAccount(vault);
  if (!data) throw new Error(`vault ${vault} is not on chain`);
  const v = client.decodeVault(data);
  return { openGroup: v.open_group, vaultUsdc: v.vault_usdc, stdnsMint: v.stdns_mint };
}

export type DnsPendingStatus = "waiting" | "settling" | "refunding";

export type DnsPendingRequest = {
  vaultId: string;
  vault: Address;
  request: Address;
  group: Address;
  groupId: bigint;
  status: DnsPendingStatus;
  tdnsAtoms: bigint;
  usdcAtoms: bigint;
  shares: bigint;
  sharesExact: boolean;
};

export function userFilterBytes(owner: Address): Uint8Array {
  return new Uint8Array(getAddressEncoder().encode(owner));
}

export async function loadPendingRequests(
  owner: Address,
  vaults: Record<string, DnsVaultInfo>,
  findRequests: (owner: Address) => Promise<{ address: Address; data: Uint8Array }[]>,
  getMultiple: (addresses: Address[]) => Promise<(Uint8Array | null)[]>,
): Promise<DnsPendingRequest[]> {
  const requests = (await findRequests(owner))
    .map((r) => ({ address: r.address, state: client.decodeStakeRequest(r.data) }))
    .filter((r) => r.state.user === owner);
  const groupAddresses = [...new Set(requests.map((r) => r.state.group))];
  const groupData: (Uint8Array | null)[] = [];
  for (let i = 0; i < groupAddresses.length; i += MAX_ACCOUNTS_PER_CALL) {
    groupData.push(...(await getMultiple(groupAddresses.slice(i, i + MAX_ACCOUNTS_PER_CALL))));
  }
  const groups = new Map(
    groupAddresses.flatMap((a, i) => {
      const d = groupData[i];
      return d ? [[a, client.decodeStakeGroup(d)] as const] : [];
    }),
  );
  const byVault = new Map(Object.entries(vaults).map(([id, v]) => [v.vault, { id, v }]));
  const pending: DnsPendingRequest[] = [];
  for (const r of requests) {
    const g = groups.get(r.state.group);
    if (!g) continue;
    const entry = byVault.get(g.vault);
    if (!entry) continue;
    let status: DnsPendingStatus;
    let shares: bigint;
    let sharesExact: boolean;
    if (g.status === GROUP_PRICED || g.status === GROUP_SETTLED) {
      const groupShares =
        g.status === GROUP_SETTLED ? g.shares_total : sharesForAssets(g.group_value, g.snapshot_nav, g.snapshot_supply);
      shares = g.total_usdc > BigInt(0) ? (r.state.usdc * groupShares) / g.total_usdc : BigInt(0);
      sharesExact = true;
      const legsRan = g.leg_a_done + g.leg_b_done > 0;
      status = shares > BigInt(0) || (g.status === GROUP_PRICED && legsRan) ? "settling" : "refunding";
    } else if (g.status === GROUP_EXECUTING) {
      shares = sharesForAssets(r.state.usdc, entry.v.navUsdc, entry.v.shareSupply);
      sharesExact = false;
      status = "settling";
    } else if (g.status === GROUP_OPEN) {
      shares = sharesForAssets(r.state.usdc, entry.v.navUsdc, entry.v.shareSupply);
      sharesExact = false;
      status = "waiting";
    } else if (g.status === GROUP_ABORTED) {
      shares = BigInt(0);
      sharesExact = true;
      status = "refunding";
    } else {
      continue;
    }
    pending.push({
      vaultId: entry.id,
      vault: g.vault,
      request: r.address,
      group: r.state.group,
      groupId: g.id,
      status,
      tdnsAtoms: r.state.tdns_amount,
      usdcAtoms: r.state.usdc,
      shares,
      sharesExact,
    });
  }
  return pending;
}
