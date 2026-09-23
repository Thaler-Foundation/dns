import Image from "next/image";
import { STOCKS, type StockTicker, getStockColor } from "@/lib/vaults-data";
import { TokenIcon } from "@/components/token-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StockIconProps {
  ticker: StockTicker;
  size?: number;
  className?: string;
}

export function StockIcon({ ticker, size = 28, className }: StockIconProps) {
  const stock = STOCKS[ticker];
  if (!stock) return null;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/80 bg-background",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={stock.iconPath}
        alt={`${ticker} logo`}
        width={size}
        height={size}
        className="size-full object-cover rounded-full"
        priority
        unoptimized
      />
    </span>
  );
}

export function StockPairBadge({
  stock1,
  stock2,
  size = 28,
  className,
}: {
  stock1: StockTicker;
  stock2: StockTicker;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <StockIcon ticker={stock1} size={size} className="relative z-10 ring-2 ring-background rounded-full" />
      <StockIcon
        ticker={stock2}
        size={size}
        className="relative -ml-2.5 z-0 ring-2 ring-background rounded-full"
      />
    </div>
  );
}

export function VaultPairBadge({
  stock1,
  stock2,
  targetToken = "tDNS",
  size = 28,
  className,
}: {
  stock1: StockTicker;
  stock2: StockTicker;
  targetToken?: "tDNS";
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <StockIcon
        ticker={stock1}
        size={size}
        className="relative z-20 ring-2 ring-background rounded-full"
      />
      <StockIcon
        ticker={stock2}
        size={size}
        className="relative -ml-2.5 z-10 ring-2 ring-background rounded-full"
      />
      <TokenIcon
        symbol={targetToken}
        size={size}
        className="relative ml-1 z-0 ring-2 ring-background rounded-full"
      />
    </div>
  );
}

export function TokenizedStockBadge({
  text = "xStock",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 cursor-help transition-colors hover:bg-emerald-500/15 hover:border-emerald-500/40",
            className
          )}
        >
          <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
          <span>{text}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-center text-xs leading-relaxed flex flex-col items-center">
          <p className="font-semibold">Tokenized Stock (xStock)</p>
          <p className="text-[11px] opacity-80 mt-0.5">
            Synthetic on-chain asset on Solana tracking real-time equity pricing 24/7. Not traditional stock held in a TradFi brokerage.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function StDnsTokenIcon({
  stock1,
  stock2,
  size = 20,
  className,
}: {
  stock1: StockTicker;
  stock2: StockTicker;
  size?: number;
  className?: string;
}) {
  const stock1Color = getStockColor(stock1, "#333333");
  const stock2Color = getStockColor(stock2, "#EF0027");

  return (
    <TokenIcon
      symbol="tDNS"
      size={size}
      className={className}
      colors={`${stock1Color}-${stock2Color}`}
    />
  );
}

export function StDnsBadge({
  stock1,
  stock2,
  className,
}: {
  stock1: StockTicker;
  stock2: StockTicker;
  className?: string;
}) {
  const stock1Color = getStockColor(stock1, "#333333");
  const stock2Color = getStockColor(stock2, "#EF0027");

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1.5 rounded-sm border border-border bg-muted/40 shrink-0",
        className
      )}
    >
      <TokenIcon
        symbol="tDNS"
        size={20}
        colors={`${stock1Color}-${stock2Color}`}
      />
      <span className="font-semibold text-xs tracking-tight">
        stDNS-{stock1}{stock2}
      </span>
    </div>
  );
}
