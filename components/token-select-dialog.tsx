"use client";

import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { TokenIcon } from "@/components/token-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TOKEN_LIST, truncateAddress, type TokenSymbol } from "@/lib/tokens";
import type { TokenBalances } from "@/hooks/use-token-balances";
import type { TokenPriceInfo } from "@/hooks/use-token-prices";
import { cn } from "@/lib/utils";

interface TokenSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedToken: TokenSymbol;
  onSelectToken: (token: TokenSymbol) => void;
  balances: TokenBalances;
  prices: Record<TokenSymbol, TokenPriceInfo>;
}

export function TokenSelectDialog({
  open,
  onOpenChange,
  selectedToken,
  onSelectToken,
  balances,
  prices,
}: TokenSelectDialogProps) {
  const handleCopyCA = (e: React.MouseEvent, ca: string, name: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ca);
    toast.success(`${name} contract address copied!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-sm border border-border bg-card p-5 text-card-foreground">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-base font-semibold text-foreground">
            Select a token
          </DialogTitle>
        </DialogHeader>

        <div className="mt-3 flex flex-col gap-1.5">
          {TOKEN_LIST.map((token) => {
            const isSelected = token.symbol === selectedToken;
            const balance = balances[token.symbol] ?? 0;
            const priceInfo = prices[token.symbol];

            return (
              <button
                key={token.symbol}
                type="button"
                onClick={() => {
                  onSelectToken(token.symbol);
                  onOpenChange(false);
                }}
                className={cn(
                  "group flex w-full items-center justify-between rounded-sm p-2.5 text-left transition-colors",
                  isSelected
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-muted/70 text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <TokenIcon symbol={token.symbol} size={28} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {token.symbol}
                      </span>
                      {token.devnetMint && (
                        <button
                          type="button"
                          onClick={(e) =>
                            handleCopyCA(e, token.devnetMint, token.symbol)
                          }
                          title="Copy Contract Address"
                          className="inline-flex items-center gap-1 rounded-xs bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground font-mono"
                        >
                          <span>{truncateAddress(token.devnetMint, 3)}</span>
                          <Copy className="size-2.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{token.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="font-mono text-sm font-medium text-foreground">
                      {balance.toLocaleString(undefined, {
                        maximumFractionDigits: 4,
                      })}
                    </div>
                    {priceInfo && (
                      <div className="font-mono text-xs text-muted-foreground">
                        ${priceInfo.usdPrice < 0.01
                          ? priceInfo.usdPrice.toFixed(4)
                          : priceInfo.usdPrice.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="flex size-4 shrink-0 items-center justify-center text-primary">
                      <Check className="size-3.5" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
