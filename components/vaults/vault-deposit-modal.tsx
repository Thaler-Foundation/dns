"use client";

import { TokenIcon } from "@/components/token-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StockIcon, TokenizedStockBadge } from "@/components/vaults/stock-icons";
import { useTokenPrices } from "@/hooks/use-token-prices";
import {
  STOCKS,
  type VaultStrategy,
  hasTokenizedStock,
  getStockColor,
} from "@/lib/vaults-data";
import { Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface VaultDepositModalProps {
  vault: VaultStrategy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userBalance?: number;
}

export function VaultDepositModal({
  vault,
  open,
  onOpenChange,
  userBalance = 12450.0,
}: VaultDepositModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { prices } = useTokenPrices();
  const hasTokenized = hasTokenizedStock(vault);

  const tdnsUsd = prices.tDNS?.usdPrice ?? 100;
  const usdcEquivalent = (numericAmount: number) =>
    numericAmount * (prices.USDC?.usdPrice ? tdnsUsd / prices.USDC.usdPrice : 100);

  const stock1Color = getStockColor(vault.stock1, "#333333");
  const stock2Color = getStockColor(vault.stock2, "#EF0027");

  const numericAmount = parseFloat(amount) || 0;

  const handleSetPercent = (pct: number) => {
    const calculated = (userBalance * pct).toFixed(2);
    setAmount(calculated);
  };

  const handleDeposit = () => {
    if (numericAmount <= 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onOpenChange(false);
      setAmount("");
      toast.success(
        `Successfully deposited ${numericAmount.toLocaleString()} tDNS into ${vault.displayName}`
      );
    }, 900);
  };

  const totalUsdc = usdcEquivalent(numericAmount || 0);
  const legAmount = (totalUsdc * 0.24).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const bufferAmount = (totalUsdc * 0.04).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const principalUsdc = totalUsdc.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border p-0 gap-0 overflow-hidden shadow-none">
        <DialogHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-base font-semibold">Deposit</DialogTitle>
            <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-sm">
              {vault.pairName}
            </span>
            {hasTokenized && <TokenizedStockBadge />}
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          <div className="rounded-sm border border-border bg-background/50 p-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Token Balance</p>
              <p className="text-sm font-semibold font-mono text-foreground mt-0.5">
                {userBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                tDNS
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                ${(userBalance * tdnsUsd).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Strategy APY</p>
              <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {vault.apy.toFixed(2)}%
              </p>
              <p className="text-[11px] text-muted-foreground">Auto-compounding</p>
            </div>
          </div>

          <div className="rounded-sm border border-border bg-background/50 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Deposit Amount</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <Wallet className="size-3" />
                  {userBalance.toLocaleString()} tDNS
                </span>
                <button
                  type="button"
                  onClick={() => handleSetPercent(0.5)}
                  className="px-1.5 py-0.5 rounded-sm border border-border text-[10px] font-mono hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  HALF
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPercent(1)}
                  className="px-1.5 py-0.5 rounded-sm border border-border text-[10px] font-mono hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm border border-border bg-muted/40 shrink-0">
                <TokenIcon symbol="tDNS" size={20} />
                <span className="font-semibold text-xs tracking-tight">tDNS</span>
              </div>

              <div className="flex-1 text-right">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-right font-mono text-xl font-bold text-foreground placeholder:text-muted-foreground/40 outline-none"
                />
                <p className="text-[11px] font-mono text-muted-foreground">
                  ~{usdcEquivalent(numericAmount || 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} USDC
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-sm border border-border bg-background/50 p-3.5">
            <span className="text-muted-foreground text-xs">You Receive</span>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm border border-border bg-muted/40 shrink-0">
                <TokenIcon
                  symbol="tDNS"
                  size={20}
                  colors={`${stock1Color}-${stock2Color}`}
                />
                <span className="font-semibold text-xs tracking-tight">
                  stDNS-{vault.stock1}{vault.stock2}
                </span>
              </div>

              <div className="flex-1 text-right">
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-right font-mono text-xl font-bold text-foreground placeholder:text-muted-foreground/40 outline-none"
                />
                <p className="text-[11px] font-mono text-muted-foreground">
                  ~{principalUsdc} USDC
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="h-1.5 w-full flex gap-1 items-center">
              <div
                className="h-full transition-all border border-border/40"
                style={{ width: "48%", backgroundColor: stock1Color }}
                title={`${vault.stock1} Allocation (48%)`}
              />
              <div
                className="h-full transition-all border border-border/40 bg-muted-foreground/50"
                style={{ width: "4%" }}
                title="Liquidity Buffer (4%)"
              />
              <div
                className="h-full transition-all border border-border/40"
                style={{ width: "48%", backgroundColor: stock2Color }}
                title={`${vault.stock2} Allocation (48%)`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span
                  className="size-1.5 shrink-0 border border-border/40"
                  style={{ backgroundColor: stock1Color }}
                />
                Long & Short {vault.stock1} (48%)
              </span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/80">
                <span className="size-1.5 shrink-0 border border-border/40 bg-muted-foreground/50" />
                4% Buffer
              </span>
              <span className="flex items-center gap-1.5">
                Long & Short {vault.stock2} (48%)
                <span
                  className="size-1.5 shrink-0 border border-border/40"
                  style={{ backgroundColor: stock2Color }}
                />
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="framed"
            size="lg"
            onClick={handleDeposit}
            disabled={numericAmount <= 0 || numericAmount > userBalance || isSubmitting}
            className="w-full h-11 font-sans font-medium text-sm tracking-wide disabled:opacity-40"
          >
            {isSubmitting ? "Depositing..." : "Deposit tDNS"}
          </Button>

          <div className="rounded-sm border border-border bg-background/50 p-3 space-y-2.5 text-xs">
            <div>
              <p className="font-semibold text-foreground tracking-tight">Projected 4-Leg Position</p>
            </div>

            <div className="space-y-2 pt-1 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Principal Collateral</span>
                </div>
                <div className="text-right font-mono">
                  <p className="text-foreground">
                    {(Number(principalUsdc) - Number(bufferAmount)).toFixed(2)} USDC
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Liquidity Buffer (4%)</span>
                </div>
                <div className="text-right font-mono">
                  <p className="text-foreground">
                    {bufferAmount} USDC
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div
                  className="p-2 rounded-sm border border-border/60 bg-muted/20 space-y-1"
                  style={{ borderLeftColor: stock1Color, borderLeftWidth: "2px" }}
                >
                  <div className="flex items-center gap-1.5">
                    <StockIcon ticker={vault.stock1} size={16} />
                    <span className="text-[11px] font-medium text-foreground">{vault.stock1}</span>
                    <span className="text-[10px] font-mono text-muted-foreground ml-auto">48%</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Long Spot (24%)</span>
                    <span className="text-foreground">${legAmount}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Short Perp (24%)</span>
                    <span className="text-foreground">${legAmount}</span>
                  </div>
                </div>

                <div
                  className="p-2 rounded-sm border border-border/60 bg-muted/20 space-y-1"
                  style={{ borderLeftColor: stock2Color, borderLeftWidth: "2px" }}
                >
                  <div className="flex items-center gap-1.5">
                    <StockIcon ticker={vault.stock2} size={16} />
                    <span className="text-[11px] font-medium text-foreground">{vault.stock2}</span>
                    <span className="text-[10px] font-mono text-muted-foreground ml-auto">48%</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Long Spot (24%)</span>
                    <span className="text-foreground">${legAmount}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Short Perp (24%)</span>
                    <span className="text-foreground">${legAmount}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px]">
                <span className="text-muted-foreground">Protocol Service Fee</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">11.00%</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
