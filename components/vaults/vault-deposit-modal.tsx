"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TokenIcon } from "@/components/token-icons";
import { StockIcon } from "@/components/vaults/stock-icons";
import { type VaultStrategy } from "@/lib/vaults-data";
import { ShieldCheck, Wallet } from "lucide-react";
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

  const quarterAmount = (numericAmount * 0.25).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border p-0 gap-0 overflow-hidden shadow-none">
        <DialogHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-semibold">Deposit</DialogTitle>
            <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-sm">
              {vault.pairName}
            </span>
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
                ${userBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                  className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-sm border border-border bg-muted/50 hover:bg-muted hover:text-foreground text-muted-foreground transition-colors"
                >
                  HALF
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPercent(1)}
                  className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-sm border border-border bg-muted/50 hover:bg-muted hover:text-foreground text-muted-foreground transition-colors"
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
                  ~${(numericAmount || 0).toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5 text-foreground">
                <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Dual-Hedge Market Neutrality
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                0.00 β (Optimal)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full w-full bg-emerald-500 rounded-full" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Long & Short {vault.stock1}</span>
              <span>Long & Short {vault.stock2}</span>
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
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground tracking-tight">Projected 4-Leg Position</p>
              <span className="text-[11px] font-mono text-muted-foreground">0.00 Net Delta</span>
            </div>

            <div className="space-y-2 pt-1 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TokenIcon symbol="tDNS" size={18} />
                  <span className="text-muted-foreground">Principal Collateral</span>
                </div>
                <div className="text-right font-mono">
                  <p className="text-foreground">
                    +{(numericAmount || 0).toLocaleString()} tDNS
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-sm border border-border/60 bg-muted/20 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <StockIcon ticker={vault.stock1} size={16} />
                    <span className="text-[11px] font-medium text-foreground">{vault.stock1}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Long (25%)</span>
                    <span className="text-foreground">${quarterAmount}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Short (25%)</span>
                    <span className="text-foreground">${quarterAmount}</span>
                  </div>
                </div>

                <div className="p-2 rounded-sm border border-border/60 bg-muted/20 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <StockIcon ticker={vault.stock2} size={16} />
                    <span className="text-[11px] font-medium text-foreground">{vault.stock2}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Long (25%)</span>
                    <span className="text-foreground">${quarterAmount}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">Short (25%)</span>
                    <span className="text-foreground">${quarterAmount}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px]">
                <span className="text-muted-foreground">Protocol Deposit Fee</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">0.00%</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
