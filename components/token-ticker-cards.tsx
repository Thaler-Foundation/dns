"use client";

import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TokenIcon } from "@/components/token-icons";
import {
  TOKENS,
  getSolscanUrl,
  truncateAddress,
  type TokenSymbol,
} from "@/lib/tokens";
import type { TokenPriceInfo } from "@/hooks/use-token-prices";

interface TokenTickerCardsProps {
  prices: Record<TokenSymbol, TokenPriceInfo>;
}

export function TokenTickerCards({ prices }: TokenTickerCardsProps) {
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, address: string, symbol: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedSymbol(symbol);
    toast.success(`${symbol} contract address copied!`);
    setTimeout(() => setCopiedSymbol(null), 2000);
  };

  const tickerTokens: TokenSymbol[] = ["USDC", "SOL", "tDNS"];

  return (
    <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
      {tickerTokens.map((symbol) => {
        const token = TOKENS[symbol];
        const priceInfo = prices[symbol];
        const usdPrice = priceInfo?.usdPrice ?? 0;
        const isCopied = copiedSymbol === symbol;
        const displayMint = token.devnetMint;
        const solscanLink = getSolscanUrl(displayMint, true);

        return (
          <div
            key={symbol}
            className="group relative flex items-center justify-between rounded-sm border border-border bg-card p-3 sm:p-3.5 transition-colors hover:border-foreground/20"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <TokenIcon symbol={symbol} size={24} />
              <div className="flex min-w-0 flex-col">
                <a
                  href={solscanLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-xs text-card-foreground hover:text-primary transition-colors sm:text-sm"
                >
                  <span className="truncate">{symbol}</span>
                  <ExternalLink className="size-2.5 shrink-0 text-muted-foreground group-hover:text-primary sm:size-3" />
                </a>
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, displayMint, symbol)}
                  title="Copy contract address"
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground font-mono"
                >
                  <span>{truncateAddress(displayMint, 3)}</span>
                  {isCopied ? (
                    <Check className="size-2 text-emerald-500 shrink-0" />
                  ) : (
                    <Copy className="size-2 text-muted-foreground shrink-0 group-hover:text-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="shrink-0 text-right pl-2">
              <div className="font-mono font-semibold text-xs text-card-foreground tabular-nums sm:text-sm">
                ${usdPrice < 0.01
                  ? usdPrice.toFixed(4)
                  : usdPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
