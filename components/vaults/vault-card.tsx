"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VaultPairBadge, TokenizedStockBadge } from "@/components/vaults/stock-icons";
import { useDns } from "@/hooks/use-dns";
import { formatApy, formatRate, formatUsdcCents, formatUsdcExact, stdnsRateUsdc, vaultApy, vaultTvlUsdc } from "@/lib/dns/stats";
import { stockMarkUsdc, type StockMarksView } from "@/lib/dns/marks";
import { type VaultStrategy, hasTokenizedStock } from "@/lib/vaults-data";

interface VaultCardProps {
  vault: VaultStrategy;
  marks: StockMarksView;
}

function markLine(marks: StockMarksView, ticker: string): string {
  const atoms = stockMarkUsdc(marks, ticker);
  return `${ticker} ${atoms === null ? "n/a" : formatUsdcCents(atoms)}`;
}

export function VaultCard({ vault, marks }: VaultCardProps) {
  const router = useRouter();
  const hasTokenized = hasTokenizedStock(vault);
  const dns = useDns();
  const tvl = formatUsdcExact(vaultTvlUsdc(dns.vaults[vault.id]));
  const rate = formatRate(stdnsRateUsdc(dns.vaults[vault.id]));
  const apy = formatApy(vaultApy(dns.vaults[vault.id]));

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
            <VaultPairBadge stock1={vault.stock1} stock2={vault.stock2} size={22} />
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-semibold text-base leading-[22px] tracking-tight text-foreground truncate">
                {vault.pairName}
              </h3>
              {hasTokenized && <TokenizedStockBadge />}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 py-3.5 border-b border-border/60">
          <div className="min-w-0">
            <div>
              <span className="text-[11px] text-muted-foreground block">Total Value Locked</span>
              <p className="text-sm font-bold font-mono text-foreground mt-0.5">
                {tvl}
              </p>
            </div>
            <div className="mt-2">
              <span className="text-[11px] text-muted-foreground block">stDNS Rate</span>
              <p className="text-xs font-mono text-foreground mt-0.5">
                {rate}
              </p>
            </div>
          </div>
          <div data-stock-marks="true" className="shrink-0 text-right font-semibold text-base leading-[22px] tracking-tight text-foreground">
            <p>{markLine(marks, vault.stock1)}</p>
            <p>{markLine(marks, vault.stock2)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3.5">
        <div>
          <span className="text-[11px] text-muted-foreground block">Net APY</span>
          <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {apy}
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
