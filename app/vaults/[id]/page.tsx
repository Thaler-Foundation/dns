"use client";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TokenIcon } from "@/components/token-icons";
import { Button } from "@/components/ui/button";
import { StockIcon, TokenizedStockBadge, VaultPairBadge } from "@/components/vaults/stock-icons";
import { VaultDepositModal } from "@/components/vaults/vault-deposit-modal";
import { getVaultById, hasTokenizedStock, isTokenizedStock } from "@/lib/vaults-data";
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
          <VaultPairBadge
            stock1={vault.stock1}
            stock2={vault.stock2}
            targetToken={vault.targetToken}
            size={32}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {vault.displayName}
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
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {vault.apy.toFixed(2)}%
            </span>
          </div> 
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-border/60">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your Position
          </span>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {vault.apy.toFixed(2)}% APY
          </span>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TokenIcon symbol={vault.targetToken} size={36} />
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">
                0.00 {vault.targetToken}
              </p>
              <p className="text-xs font-mono text-muted-foreground">$0.00 USD</p>
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
              disabled
              title="No active position to withdraw"
              className="h-9 px-4 font-sans font-medium tracking-wide disabled:opacity-40 disabled:pointer-events-none"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h2 className="text-sm font-semibold text-foreground tracking-tight">
              Dual Long & Short
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Simultaneous delta neutral positions on both equities eliminate directional exposure.
            </p>
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
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Long {vault.stock1}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">24% Allocation</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Short {vault.stock1}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">24% Allocation</span>
              </div>
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
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Long {vault.stock2}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">24% Allocation</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Short {vault.stock2}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">24% Allocation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Underlying Collateral:</span>
            <span className="font-medium text-foreground">96% USDC</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Liquidity Buffer:</span>
            <span className="font-medium text-foreground">4% USDC</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-sm border border-border bg-card p-3.5">
          <span className="text-[11px] text-muted-foreground block font-mono">TVL</span>
          <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
            ${vault.tvl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="rounded-sm border border-border bg-card p-3.5">
          <span className="text-[11px] text-muted-foreground block font-mono">Sharpe Ratio (30D)</span>
          <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
            2.48
          </span>
        </div>

        <div className="rounded-sm border border-border bg-card p-3.5">
          <span className="text-[11px] text-muted-foreground block font-mono">Rebalance</span>
          <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
            Epoch / 24h
          </span>
        </div>

        <div className="rounded-sm border border-border bg-card p-3.5">
          <span className="text-[11px] text-muted-foreground block font-mono">Service Fee</span>
          <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            11.00%
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
              Automated Rebalance
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Positions re-peg to 0.00 beta whenever spread divergence exceeds ±1.5%,
              harvesting volatility and funding rate spreads.
            </p>
          </div>

          <div className="p-3 rounded-sm border border-border/60 bg-muted/10 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              Principal Isolated
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              No borrow debt or liquidation thresholds exist. Principal is 100% held
              in {vault.targetToken} with zero lockup penalty on withdrawals.
            </p>
          </div>
        </div>
      </div>

      <VaultDepositModal
        vault={vault}
        open={isDepositOpen}
        onOpenChange={setIsDepositOpen}
      />
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
