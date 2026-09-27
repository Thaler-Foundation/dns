// My Positions: every vault where the connected wallet holds stDNS, with the amount and its USDC value at that vault's published NAV, and a link to manage it; then the wallet's pending stake requests with their status.
"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { StDnsTokenIcon } from "@/components/vaults/stock-icons";
import { useDns } from "@/hooks/use-dns";
import { useDnsWallet } from "@/hooks/use-dns-wallet";
import { STDNS_DECIMALS, TDNS_DECIMALS, USDC_DECIMALS, formatAtoms } from "@/lib/dns/math";
import type { DnsPendingStatus } from "@/lib/dns/stake";
import { VAULT_STRATEGIES } from "@/lib/vaults-data";

const PENDING_STATUS: Record<DnsPendingStatus, string> = {
  waiting: "Waiting for pricing",
  settling: "Priced, settling",
  refunding: "Refunding tDNS",
};

export default function PositionsPage() {
  const wallet = useDnsWallet();
  const dns = useDns();
  const byId = new Map(VAULT_STRATEGIES.map((v) => [v.id, v]));
  const rows = dns.positions
    .map((p) => ({ p, v: byId.get(p.vaultId) }))
    .filter((r): r is { p: (typeof dns.positions)[number]; v: NonNullable<typeof r.v> } => Boolean(r.v));
  const total = rows.reduce((acc, r) => acc + r.p.usdcValue, BigInt(0));
  const pending = dns.pending
    .map((q) => ({ q, v: byId.get(q.vaultId) }))
    .filter((r): r is { q: (typeof dns.pending)[number]; v: NonNullable<typeof r.v> } => Boolean(r.v));

  return (
    <div className="relative flex min-h-dvh flex-col bg-background selection:bg-primary/20">
      <SiteHeader />

      <main id="main-content" tabIndex={-1} className="relative flex-1 px-4 py-8 sm:py-10">
        <div className="relative z-10 mx-auto w-full max-w-3xl space-y-5">
          <div className="pb-5 border-b border-border">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
              My Positions
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Your stDNS vault shares, valued at each vault&apos;s published NAV.
            </p>
          </div>

          {!wallet.connected ? (
            <div className="rounded-sm border border-border bg-card p-6 flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-muted-foreground">Connect a wallet to see your vault positions.</p>
              <Button variant="framed" onClick={() => wallet.login()} className="h-9 px-5 font-sans font-medium tracking-wide">
                Connect Wallet
              </Button>
            </div>
          ) : !dns.positionsLoaded ? (
            <div className="rounded-sm border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Loading positions...
            </div>
          ) : rows.length === 0 && pending.length === 0 ? (
            <div className="rounded-sm border border-border bg-card p-6 flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-muted-foreground">You have no vault positions yet.</p>
              <Link href="/vaults" className="text-xs font-medium text-foreground underline underline-offset-4">
                Browse Smart Vaults
              </Link>
            </div>
          ) : (
            <>
              {rows.length > 0 && (
              <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-sm border border-border bg-card p-3.5">
                  <span className="text-[11px] text-muted-foreground block font-mono">Total Value</span>
                  <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                    {formatAtoms(total, USDC_DECIMALS, 2)} USDC
                  </span>
                </div>
                <div className="rounded-sm border border-border bg-card p-3.5">
                  <span className="text-[11px] text-muted-foreground block font-mono">Vaults</span>
                  <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">{rows.length}</span>
                </div>
              </div>

              <div className="rounded-sm border border-border bg-card divide-y divide-border">
                {rows.map(({ p, v }) => (
                  <div key={p.vaultId} data-position={v.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <StDnsTokenIcon stock1={v.stock1} stock2={v.stock2} size={32} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{v.displayName}</p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {formatAtoms(p.atoms, STDNS_DECIMALS, 6)} stDNS
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {formatAtoms(p.usdcValue, USDC_DECIMALS, 2)} USDC
                      </p>
                      <Link
                        href={`/vaults/${v.id}`}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              </>
              )}

              {pending.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-foreground">Pending stake requests</h2>
                  <div className="rounded-sm border border-border bg-card divide-y divide-border">
                    {pending.map(({ q, v }) => (
                      <div key={q.request} data-pending={v.id} className="flex items-center justify-between gap-4 p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <StDnsTokenIcon stock1={v.stock1} stock2={v.stock2} size={32} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{v.displayName}</p>
                            <p className="text-xs font-mono text-muted-foreground">
                              {formatAtoms(q.tdnsAtoms, TDNS_DECIMALS, 6)} tDNS ({formatAtoms(q.usdcAtoms, USDC_DECIMALS, 2)} USDC)
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-foreground" data-pending-status={q.status}>
                            {PENDING_STATUS[q.status]}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground">
                            {q.status === "refunding"
                              ? "tDNS returns to your wallet"
                              : `${q.sharesExact ? "" : "~"}${formatAtoms(q.shares, STDNS_DECIMALS, 6)} stDNS${q.sharesExact ? "" : " (estimate)"}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
