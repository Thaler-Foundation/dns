"use client";

import { SwapCard } from "@/components/swap-card";
import { TokenTickerCards } from "@/components/token-ticker-cards";
import { useTokenPrices } from "@/hooks/use-token-prices";

export function SwapView() {
  const { prices } = useTokenPrices();

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full max-w-[640px]">
        <SwapCard />
      </div>
      <div className="w-full max-w-[640px]">
        <TokenTickerCards prices={prices} />
      </div>
    </div>
  );
}
