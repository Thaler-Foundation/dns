// Loads the devnet DNS state: the MixerPool from chain (the program's own USDC, tDNS and pool addresses, cross-checked against config) and the watcher's /public/dns/vaults rows matched to UI vault ids by asset pair and re-derived vault PDA.
import { address, type Address } from "@solana/kit";
import { ThalerDnsClient, findMixerAddress, findVaultAddress } from "@/lib/dns/client";
import type { DnsConfig } from "@/lib/dns/config";
import type { DnsMints } from "@/lib/dns/tx";
import type { VaultStrategy } from "@/lib/vaults-data";

export type DnsVaultInfo = {
  vault: Address;
  stdnsMint: Address;
  shareSupply: bigint;
  navUsdc: bigint;
  published: boolean;
  slotsBehind: number | null;
};

export type DnsSnapshot = {
  mints: DnsMints | null;
  vaults: Record<string, DnsVaultInfo>;
  problems: string[];
};

type VaultRow = {
  vaultAddress: string;
  assetA: string;
  assetB: string;
  stdnsMint: string;
  shareSupply: string;
  rate: { published: boolean; navUsdc: string; slotsBehind: number | null };
};

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
  try {
    const data = await readAccount(mixer);
    if (!data) {
      problems.push("the DNS mixer is not deployed on this cluster");
    } else {
      const m = client.decodeMixerPool(data);
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
        };
      }
    } catch (err) {
      problems.push(`vault list failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { mints, vaults, problems };
}
