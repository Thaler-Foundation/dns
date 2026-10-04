// What redeem can pay right now (ruling 98): the largest share amount whose assets_for_shares payout fits the vault's buffer claim, capped at the share supply (whose whole payout never exceeds NAV), and 0 when that payout rounds to 0 (redeem refuses it); read from the vault and its claim in one call.
import type { Address } from "@solana/kit";
import { ThalerDnsClient, findClaimAddress, findMixerAddress } from "@/lib/dns/client";
import { VIRTUAL_ASSETS, VIRTUAL_SHARES, assetsForShares } from "@/lib/dns/math";

const client = new ThalerDnsClient();

export function maxRedeemableShares(claim: bigint, navUsdc: bigint, shareSupply: bigint): bigint {
  const byPayout = ((claim + BigInt(1)) * (shareSupply + VIRTUAL_SHARES) - BigInt(1)) / (navUsdc + VIRTUAL_ASSETS);
  const capped = byPayout < shareSupply ? byPayout : shareSupply;
  return assetsForShares(capped, navUsdc, shareSupply) > BigInt(0) ? capped : BigInt(0);
}

export type Redeemable = {
  claim: bigint;
  navUsdc: bigint;
  shareSupply: bigint;
  maxShares: bigint;
  stdnsEscrow: Address;
  groupsInFlight: bigint;
};

export async function readRedeemable(
  vault: Address,
  getMultiple: (addresses: Address[]) => Promise<(Uint8Array | null)[]>,
): Promise<Redeemable> {
  const claimAddress = await findClaimAddress(await findMixerAddress(), vault);
  const [vaultData, claimData] = await getMultiple([vault, claimAddress]);
  if (!vaultData || !claimData) throw new Error(`vault ${vault} or its claim is not on chain`);
  const v = client.decodeVault(vaultData);
  const claim = client.decodeVaultClaim(claimData).amount;
  return {
    claim,
    navUsdc: v.nav_usdc,
    shareSupply: v.share_supply,
    maxShares: maxRedeemableShares(claim, v.nav_usdc, v.share_supply),
    stdnsEscrow: v.stdns_escrow,
    groupsInFlight: v.groups_in_flight,
  };
}
