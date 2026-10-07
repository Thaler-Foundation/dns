// The connected wallet's pending withdrawals (RedeemRequest accounts, discriminator 6, user at byte 35 like the stake requests) with the cooldown left in slots; the keeper settles them (spec 11.18), the user never sends settle_redeem.
import { type Address } from "@solana/kit";
import { ThalerDnsClient } from "@/lib/dns/client";
import type { DnsVaultInfo } from "@/lib/dns/load";

export const REDEEM_REQUEST_DISCRIMINATOR = 6;
export const REDEEM_REQUEST_USER_OFFSET = 35;

const client = new ThalerDnsClient();

export type DnsPendingRedeem = {
  vaultId: string;
  vault: Address;
  request: Address;
  shares: bigint;
  requestSlot: bigint;
  dueSlot: bigint;
  slotsLeft: bigint;
  status: "cooling" | "settling";
};

export function cooldownLeftSlots(requestSlot: bigint, cooldownSlots: bigint, slot: bigint): bigint {
  const due = requestSlot + cooldownSlots;
  return slot >= due ? BigInt(0) : due - slot;
}

export async function loadPendingRedeems(
  owner: Address,
  vaults: Record<string, DnsVaultInfo>,
  findRedeems: (owner: Address) => Promise<{ address: Address; data: Uint8Array }[]>,
  cooldownSlots: bigint,
  slot: bigint,
): Promise<DnsPendingRedeem[]> {
  const byVault = new Map(Object.entries(vaults).map(([id, v]) => [v.vault, id]));
  const out: DnsPendingRedeem[] = [];
  for (const r of await findRedeems(owner)) {
    const state = client.decodeRedeemRequest(r.data);
    if (state.user !== owner) continue;
    const vaultId = byVault.get(state.vault);
    if (vaultId === undefined) continue;
    const slotsLeft = cooldownLeftSlots(state.request_slot, cooldownSlots, slot);
    out.push({
      vaultId,
      vault: state.vault,
      request: r.address,
      shares: state.shares,
      requestSlot: state.request_slot,
      dueSlot: state.request_slot + cooldownSlots,
      slotsLeft,
      status: slotsLeft === BigInt(0) ? "settling" : "cooling",
    });
  }
  return out;
}
