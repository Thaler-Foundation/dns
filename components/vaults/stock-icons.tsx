import Image from "next/image";
import { STOCKS, type StockTicker } from "@/lib/vaults-data";
import { TokenIcon } from "@/components/token-icons";
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
