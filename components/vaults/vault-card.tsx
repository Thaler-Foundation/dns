"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VaultPairBadge, TokenizedStockBadge } from "@/components/vaults/stock-icons";
import { type VaultStrategy, hasTokenizedStock } from "@/lib/vaults-data";

interface VaultCardProps {
  vault: VaultStrategy;
}

export function VaultCard({ vault }: VaultCardProps) {
  const router = useRouter();
  const hasTokenized = hasTokenizedStock(vault);

  const handleDepositClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/vaults/${vault.id}?action=deposit`);
  };

  return (
    <div
      onClick={() => router.push(`/vaults/${vault.id}`)}
      className="group relative flex flex-col justify-between rounded-sm border border-border bg-card p-4.5 transition-all hover:border-zinc-700 cursor-pointer shadow-none"
    >
      <div>
        <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-border/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <VaultPairBadge
              stock1={vault.stock1}
              stock2={vault.stock2}
              targetToken={vault.targetToken}
              size={22}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-sm tracking-tight text-foreground truncate">
                  {vault.displayName}
                </h3>
                {hasTokenized && <TokenizedStockBadge />}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Dual Long & Short · {vault.stock1} & {vault.stock2}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3.5 border-b border-border/60">
          <div>
            <span className="text-[11px] text-muted-foreground block">Total Value Locked</span>
            <p className="text-sm font-bold font-mono text-foreground mt-0.5">
              ${vault.tvl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">Strategy Collateral</span>
            <p className="text-sm font-semibold font-mono text-foreground mt-0.5">
              100% {vault.targetToken}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3.5">
        <div>
          <span className="text-[11px] text-muted-foreground block">Net APY</span>
          <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {vault.apy.toFixed(2)}%
          </span>
        </div>

        <Button
          variant="framed"
          size="sm"
          onClick={handleDepositClick}
          className="h-8.5 px-4 text-xs font-sans tracking-wide"
        >
          Deposit
        </Button>
      </div>
    </div>
  );
}
