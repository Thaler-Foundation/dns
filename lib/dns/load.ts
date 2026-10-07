// Loads the devnet DNS state: the MixerPool from chain (the program's own USDC, tDNS and pool addresses, cross-checked against config) and the watcher's /public/dns/vaults rows matched to UI vault ids by asset pair and re-derived vault PDA.
import { address, type Address } from "@solana/kit";
import { ThalerDnsClient, findMixerAddress, findVaultAddress } from "@/lib/dns/client";
import type { DnsConfig } from "@/lib/dns/config";
import type { DnsMints } from "@/lib/dns/tx";
import type { VaultStrategy } from "@/lib/vaults-data";

export type DnsHedgeLeg = {
  spotScaled: bigint;
  shortLots: bigint;
  virtualQuote: bigint;
  collateral: bigint;
  unsettledFunding: bigint;
  feesPaid: bigint;
  fundingReceived: bigint;
  deployedUsdc: bigint;
};

export type DnsHedge = {
  mainnetSlot: number;
  capturedAtMs: number;
  marks: { a: bigint; b: bigint };
  legs: { a: DnsHedgeLeg; b: DnsHedgeLeg };
};

export type DnsVaultInfo = {
  vault: Address;
  stdnsMint: Address;
  shareSupply: bigint;
  navUsdc: bigint;
  published: boolean;
  slotsBehind: number | null;
  pendingStakeUsdc: bigint;
  venuesLive: number;
  groupsInFlight: bigint;
  redeemEscrowShares: bigint;
  hedge: DnsHedge | null;
  params: DnsVaultParams;
};

export type DnsVaultParams = {
  tickSizeA: bigint;
  tickSizeB: bigint;
  baseLotDecimalsA: number;
  baseLotDecimalsB: number;
  spotDecimalsA: number;
  spotDecimalsB: number;
};

export type DnsMixerLimits = { minStakeTdns: bigint; vaultCapUsdc: bigint; redeemCooldownSlots: bigint };

export type DnsSnapshot = {
  mints: DnsMints | null;
  mixer: DnsMixerLimits | null;
  vaults: Record<string, DnsVaultInfo>;
  problems: string[];
};

type HedgeLegRow = Record<keyof DnsHedgeLeg | "spotRaw", string>;

type VaultRow = {
  vaultAddress: string;
  assetA: string;
  assetB: string;
  stdnsMint: string;
  shareSupply: string;
  rate: { published: boolean; navUsdc: string; slotsBehind: number | null };
  pendingStakeUsdc: string;
  venuesLive: number;
  groupsInFlight: string;
  redeemEscrowShares: string;
  params: { tickSizeA: string; tickSizeB: string; baseLotDecimalsA: number; baseLotDecimalsB: number; spotDecimalsA: number; spotDecimalsB: number };
  hedge: {
    mainnetSlot: number;
    capturedAtMs: number;
    marks: { a: string; b: string };
    legs: { a: HedgeLegRow; b: HedgeLegRow };
  } | null;
};

function hedgeLeg(row: HedgeLegRow): DnsHedgeLeg {
  return {
    spotScaled: BigInt(row.spotScaled),
    shortLots: BigInt(row.shortLots),
    virtualQuote: BigInt(row.virtualQuote),
    collateral: BigInt(row.collateral),
    unsettledFunding: BigInt(row.unsettledFunding),
    feesPaid: BigInt(row.feesPaid),
    fundingReceived: BigInt(row.fundingReceived),
    deployedUsdc: BigInt(row.deployedUsdc),
  };
}

const client = new ThalerDnsClient();

export async function loadDns(
  config: DnsConfig,
  strategies: VaultStrategy[],
  readAccount: (a: Address) => Promise<Uint8Array | null>,
  fetchJson: (url: string) => Promise<unknown>,
): Promise<DnsSnapshot> {
  const problems: string[] = [...config.problems];
  const mixer = await findMixerAddress();
  let mints: DnsMints | null = null;
  let limits: DnsMixerLimits | null = null;
  try {
    const data = await readAccount(mixer);
    if (!data) {
      problems.push("the DNS mixer is not deployed on this cluster");
    } else {
      const m = client.decodeMixerPool(data);
      limits = { minStakeTdns: m.min_stake_tdns, vaultCapUsdc: m.vault_cap_usdc, redeemCooldownSlots: m.redeem_cooldown_slots };
      if (config.usdcMint && m.usdc_mint !== config.usdcMint) {
        problems.push(`USDC mint ${config.usdcMint} is not the program's ${m.usdc_mint}`);
      } else if (config.tdnsMint && m.tdns_mint !== config.tdnsMint) {
        problems.push(`tDNS mint ${config.tdnsMint} is not the program's ${m.tdns_mint}`);
      } else {
        mints = { usdcMint: m.usdc_mint, tdnsMint: m.tdns_mint, poolUsdc: m.pool_usdc };
      }
    }
  } catch (err) {
    problems.push(`mixer read failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  const vaults: Record<string, DnsVaultInfo> = {};
  if (config.apiUrl) {
    try {
      const body = (await fetchJson(`${config.apiUrl}/public/dns/vaults`)) as { vaults: VaultRow[] };
      for (const v of strategies) {
        const a = config.stockMints[v.stock1];
        const b = config.stockMints[v.stock2];
        if (!a || !b) continue;
        const row = body.vaults.find((r) => r.assetA === a && r.assetB === b);
        if (!row) continue;
        const expected = await findVaultAddress(mixer, a, b);
        if (row.vaultAddress !== expected) {
          problems.push(`${v.id}: API vault ${row.vaultAddress} is not the PDA ${expected}`);
          continue;
        }
        vaults[v.id] = {
          vault: expected,
          stdnsMint: address(row.stdnsMint),
          shareSupply: BigInt(row.shareSupply),
          navUsdc: BigInt(row.rate.navUsdc),
          published: row.rate.published,
          slotsBehind: row.rate.slotsBehind,
          pendingStakeUsdc: BigInt(row.pendingStakeUsdc),
          venuesLive: row.venuesLive,
          groupsInFlight: BigInt(row.groupsInFlight),
          redeemEscrowShares: BigInt(row.redeemEscrowShares),
          params: {
            tickSizeA: BigInt(row.params.tickSizeA),
            tickSizeB: BigInt(row.params.tickSizeB),
            baseLotDecimalsA: row.params.baseLotDecimalsA,
            baseLotDecimalsB: row.params.baseLotDecimalsB,
            spotDecimalsA: row.params.spotDecimalsA,
            spotDecimalsB: row.params.spotDecimalsB,
          },
          hedge: row.hedge
            ? {
                mainnetSlot: row.hedge.mainnetSlot,
                capturedAtMs: row.hedge.capturedAtMs,
                marks: { a: BigInt(row.hedge.marks.a), b: BigInt(row.hedge.marks.b) },
                legs: { a: hedgeLeg(row.hedge.legs.a), b: hedgeLeg(row.hedge.legs.b) },
              }
            : null,
        };
      }
    } catch (err) {
      problems.push(`vault list failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { mints, mixer: limits, vaults, problems };
}
