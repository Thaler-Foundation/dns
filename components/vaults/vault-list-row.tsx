"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VaultPairBadge, TokenizedStockBadge } from "@/components/vaults/stock-icons";
import { type VaultStrategy, formatCurrency, hasTokenizedStock } from "@/lib/vaults-data";
import { ChevronRight } from "lucide-react";

interface VaultListRowProps {
  vault: VaultStrategy;
}

export function VaultListRow({ vault }: VaultListRowProps) {
  const router = useRouter();
  const hasTokenized = hasTokenizedStock(vault);

  const handleDepositClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/vaults/${vault.id}?action=deposit`);
  };

  return (
    <tr
      onClick={() => router.push(`/vaults/${vault.id}`)}
      className="group border-b border-border/60 hover:bg-muted/30 transition-colors cursor-pointer"
    >
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <VaultPairBadge
            stock1={vault.stock1}
            stock2={vault.stock2}
            targetToken={vault.targetToken}
            size={22}
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                {vault.displayName}
              </span>
              {hasTokenized && <TokenizedStockBadge />}
            </div>
            <span className="block text-[11px] text-muted-foreground">
              {vault.category}
            </span>
          </div>
        </div>
      </td>

      <td className="py-3 px-3 text-xs text-muted-foreground hidden sm:table-cell">
        <div className="font-mono text-foreground text-[11px]">
          {vault.stock1} · {vault.stock2}
        </div>
        <div className="text-[10px] text-muted-foreground">
          Dual Long & Short
        </div>
      </td>

      <td className="py-3 px-3 text-right">
        <span className="text-sm font-bold font-mono text-foreground">
          {formatCurrency(vault.tvl)}
        </span>
      </td>

      <td className="py-3 px-3 text-center hidden md:table-cell">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-foreground bg-muted/60 border border-border px-2 py-0.5 rounded-sm">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          0.00 β
        </span>
      </td>

      <td className="py-3 px-3 text-right">
        <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
          {vault.apy.toFixed(2)}%
        </span>
      </td>

      <td className="py-3 pl-3 pr-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="framed"
            size="sm"
            onClick={handleDepositClick}
            className="h-7.5 px-3 text-xs font-sans tracking-wide"
          >
            Deposit
          </Button>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </td>
    </tr>
  );
}
