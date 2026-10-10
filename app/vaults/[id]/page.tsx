"use client";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { StDnsTokenIcon, StockIcon, TokenizedStockBadge, VaultPairBadge } from "@/components/vaults/stock-icons";
import { VaultDepositModal } from "@/components/vaults/vault-deposit-modal";
import { VaultRedeemModal } from "@/components/vaults/vault-redeem-modal";
import { useDns } from "@/hooks/use-dns";
import { useDnsWallet } from "@/hooks/use-dns-wallet";
import { STDNS_DECIMALS, USDC_DECIMALS, assetsForShares, formatAtoms } from "@/lib/dns/math";
import { legFigures, type LegFigures } from "@/lib/dns/hedge";
import { deployedUsdc, formatUsdc, lastMirrorRead, vaultTvlUsdc } from "@/lib/dns/stats";
import type { DnsHedgeLeg, DnsVaultInfo } from "@/lib/dns/load";
import { getVaultById, hasTokenizedStock, isTokenizedStock } from "@/lib/vaults-data";

function LegLines({ stock, figures, leg }: { stock: string; figures: LegFigures | null; leg: DnsHedgeLeg | null }) {
  if (!figures || !leg) {
    return (
      <>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Long {stock}</span>
          <span className="font-semibold text-muted-foreground">no position yet</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Short {stock}</span>
          <span className="font-semibold text-muted-foreground">no position yet</span>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="flex items-center justify-between" data-leg-long={stock}>
        <span className="text-muted-foreground">Long {stock}</span>
        <span className="font-semibold text-foreground">{figures.longShares} sh ({formatAtoms(figures.longUsdc, USDC_DECIMALS, 2)} USDC)</span>
      </div>
      <div className="flex items-center justify-between" data-leg-short={stock}>
        <span className="text-muted-foreground">Short {stock}</span>
        <span className="font-semibold text-foreground">{figures.shortShares} sh ({formatAtoms(figures.shortUsdc, USDC_DECIMALS, 2)} USDC)</span>
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Mark {figures.markUsdc} USDC, margin {formatAtoms(leg.collateral, USDC_DECIMALS, 2)}</span>
        <span className={figures.unrealised < BigInt(0) ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
          {figures.unrealised < BigInt(0) ? "" : "+"}{formatAtoms(figures.unrealised, USDC_DECIMALS, 2)} unrealised, +{formatAtoms(leg.fundingReceived, USDC_DECIMALS, 2)} funding
        </span>
      </div>
    </>
  );
}

function hedgeFigures(info: DnsVaultInfo | undefined, side: "a" | "b"): { figures: LegFigures | null; leg: DnsHedgeLeg | null } {
  if (!info?.hedge) return { figures: null, leg: null };
  const leg = info.hedge.legs[side];
  const params =
    side === "a"
      ? { tickSize: info.params.tickSizeA, baseLotDecimals: info.params.baseLotDecimalsA, spotDecimals: info.params.spotDecimalsA }
      : { tickSize: info.params.tickSizeB, baseLotDecimals: info.params.baseLotDecimalsB, spotDecimals: info.params.spotDecimalsB };
  return { figures: legFigures(leg, info.hedge.marks[side], params), leg };
}
import {
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { Suspense, use, useState } from "react";

function VaultDetailContent({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const vault = getVaultById(id);

  const [isDepositOpen, setIsDepositOpen] = useState(action === "deposit");
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const wallet = useDnsWallet();
  const dns = useDns();
  const info = vault ? dns.vaults[vault.id] : undefined;
  const mirrorRead = lastMirrorRead(info);
  const held = vault ? dns.positions.find((p) => p.vaultId === vault.id) : undefined;
  const position = wallet.connected && held ? held.atoms : BigInt(0);
  const positionUsdc = info ? assetsForShares(position, info.navUsdc, info.shareSupply) : BigInt(0);
  const refreshPosition = () => {
    void dns.refresh();
  };

  if (!vault) {
    return notFound();
  }

  const hasTokenized = hasTokenizedStock(vault);

  return (
    <div className="relative z-10 mx-auto w-full max-w-3xl space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/vaults"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          All Vaults
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <VaultPairBadge stock1={vault.stock1} stock2={vault.stock2} size={32} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {vault.pairName}
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-muted text-muted-foreground border border-border">
                {vault.category}
              </span>
              {hasTokenized && <TokenizedStockBadge text="Tokenized Stocks (xStocks)" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {vault.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto shrink-0">
          <div className="text-right sm:text-left">
            <span className="text-[11px] text-muted-foreground block font-mono">Net APY</span>
            {/* TODO: add net APY calculation */}
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              n/a
            </span>
          </div> 
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-border/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your Position
          </span>
          {/* TODO: add Position APY calculation */}
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            APY n/a
          </span>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StDnsTokenIcon stock1={vault.stock1} stock2={vault.stock2} size={36} />
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">
                {formatAtoms(position, STDNS_DECIMALS, 6)} stDNS
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {formatAtoms(positionUsdc, USDC_DECIMALS, 2)} USDC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="framed"
              onClick={() => setIsDepositOpen(true)}
              className="h-9 px-5 font-sans font-medium tracking-wide"
            >
              Deposit
            </Button>
            <Button
              variant="framed"
              disabled={position <= BigInt(0) || !info || !dns.mints}
              title={position <= BigInt(0) ? "No active position to withdraw" : undefined}
              onClick={() => setIsRedeemOpen(true)}
              className="h-9 px-4 font-sans font-medium tracking-wide disabled:opacity-40 disabled:pointer-events-none"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground tracking-tight">
              Dual Neutral Pair
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-sm border border-border/70 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StockIcon ticker={vault.stock1} size={20} />
                <span className="text-xs font-semibold text-foreground">
                  {vault.stock1} Position Pair
                </span>
              </div>
              {isTokenizedStock(vault.stock1) && <TokenizedStockBadge text="xStock" />}
            </div>
            <div className="space-y-1.5 pt-1 text-xs font-mono">
              <LegLines stock={vault.stock1} {...hedgeFigures(info, "a")} />
            </div>
          </div>

          <div className="p-3 rounded-sm border border-border/70 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StockIcon ticker={vault.stock2} size={20} />
                <span className="text-xs font-semibold text-foreground">
                  {vault.stock2} Position Pair
                </span>
              </div>
              {isTokenizedStock(vault.stock2) && <TokenizedStockBadge text="xStock" />}
            </div>
            <div className="space-y-1.5 pt-1 text-xs font-mono">
              <LegLines stock={vault.stock2} {...hedgeFigures(info, "b")} />
            </div>
          </div>
        </div>

        {info?.hedge && (
          <p className="text-[11px] font-mono text-muted-foreground" data-hedge-slot={info.hedge.mainnetSlot}>
            Hedge mirrored from mainnet Phoenix at the live mark plus the taker fee (mainnet slot {info.hedge.mainnetSlot.toLocaleString("en-US")}, read {new Date(info.hedge.capturedAtMs).toISOString().slice(11, 19)} UTC)
            {info.groupsInFlight > BigInt(0) ? "; a stake group is settling" : ""}
          </p>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Deployed to the hedge:</span>
            <span className="font-medium text-foreground">{formatUsdc(deployedUsdc(info))}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Pending stake:</span>
            <span className="font-medium text-foreground">{info ? formatUsdc(info.pendingStakeUsdc) : "n/a"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-sm border border-border bg-card p-3.5">
          <span className="text-[11px] text-muted-foreground block font-mono">TVL</span>
          <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
            {formatUsdc(vaultTvlUsdc(info))}
          </span>
        </div>

        <div className="rounded-sm border border-border bg-card p-3.5">
          <span className="text-[11px] text-muted-foreground block font-mono">Last mirror read</span>
          <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
            {mirrorRead ? new Date(mirrorRead.atMs).toISOString().slice(11, 19) + " UTC" : "n/a"}
          </span>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Strategy Mechanics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-sm border border-border/60 bg-muted/10 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              Dual-Market Neutral
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              By buying and shorting both {vault.stock1} and {vault.stock2} in equal balance,
              directional equity risk is neutralized on both assets.
            </p>
          </div>

          <div className="p-3 rounded-sm border border-border/60 bg-muted/10 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              Share-Matched Hedge
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Each short is sized to the number of shares the vault holds and is resized when a
              dividend changes that count. Income comes from funding paid to shorts and from dividends.
            </p>
          </div>

          <div className="p-3 rounded-sm border border-border/60 bg-muted/10 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              Fully Margined Shorts
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Each short is backed by USDC margin equal to its full size, so positions start at 1x
              with no borrowing. Phoenix can still liquidate a short if its margin runs out.
            </p>
          </div>
        </div>
      </div>

      <VaultDepositModal
        vault={vault}
        open={isDepositOpen}
        onOpenChange={setIsDepositOpen}
        onDeposited={refreshPosition}
      />
      {info && dns.mints && (
        <VaultRedeemModal
          vault={vault}
          info={info}
          mints={dns.mints}
          balance={position}
          open={isRedeemOpen}
          onOpenChange={setIsRedeemOpen}
          onRedeemed={refreshPosition}
        />
      )}
    </div>
  );
}

export default function VaultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="relative flex min-h-dvh flex-col bg-background selection:bg-primary/20">
      <SiteHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative flex-1 px-4 py-8 sm:py-10"
      >
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center text-xs text-muted-foreground">
              Loading vault details...
            </div>
          }
        >
          <VaultDetailContent id={id} />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
