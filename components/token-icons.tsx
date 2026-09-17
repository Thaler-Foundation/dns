import Image from "next/image";
import type { TokenSymbol } from "@/lib/tokens";
import { cn } from "@/lib/utils";

interface TokenIconProps {
  symbol: TokenSymbol;
  size?: number;
  className?: string;
}

const TOKEN_ICON_PATHS: Record<TokenSymbol, string> = {
  SOL: "/tokens/sol.svg",
  USDC: "/tokens/usdc.svg",
  tDNS: "/tokens/tdns.svg",
};

export function TokenIcon({ symbol, size = 24, className }: TokenIconProps) {
  const src = TOKEN_ICON_PATHS[symbol];
  if (!src) return null;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={`${symbol} token`}
        width={size}
        height={size}
        className="size-full object-contain"
        priority
        unoptimized
      />
    </span>
  );
}
