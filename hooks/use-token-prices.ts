"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJupiterPrices, type JupiterPriceResponse } from "@/lib/jupiter";
import { TOKENS, type TokenSymbol } from "@/lib/tokens";

export interface TokenPriceInfo {
  usdPrice: number;
  priceChange24h: number;
}

const DEFAULT_PRICES: Record<TokenSymbol, TokenPriceInfo> = {
  SOL: { usdPrice: 101.47, priceChange24h: 3.73 },
  USDC: { usdPrice: 0.9996, priceChange24h: -0.01 },
  tDNS: { usdPrice: 1.0, priceChange24h: 0.0 },
};

function formatPrices(
  prev: Record<TokenSymbol, TokenPriceInfo>,
  res: JupiterPriceResponse
): Record<TokenSymbol, TokenPriceInfo> {
  const next = { ...prev };

  const solData = res[TOKENS.SOL.priceMint];
  if (solData?.usdPrice) {
    next.SOL = {
      usdPrice: solData.usdPrice,
      priceChange24h: solData.priceChange24h ?? 0,
    };
  }

  const usdcData = res[TOKENS.USDC.priceMint];
  if (usdcData?.usdPrice) {
    next.USDC = {
      usdPrice: usdcData.usdPrice,
      priceChange24h: usdcData.priceChange24h ?? 0,
    };
  }

  const tDnsData = res[TOKENS.tDNS.priceMint];
  if (tDnsData?.usdPrice) {
    next.tDNS = {
      usdPrice: tDnsData.usdPrice,
      priceChange24h: tDnsData.priceChange24h ?? 0,
    };
  } else {
    next.tDNS = {
      usdPrice: next.USDC.usdPrice,
      priceChange24h: 0,
    };
  }

  return next;
}

export function useTokenPrices(pollIntervalMs = 20_000) {
  const [prices, setPrices] =
    useState<Record<TokenSymbol, TokenPriceInfo>>(DEFAULT_PRICES);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshPrices = useCallback(async () => {
    try {
      const queryMints = [TOKENS.SOL.priceMint, TOKENS.USDC.priceMint];
      if (
        TOKENS.tDNS.priceMint &&
        TOKENS.tDNS.priceMint !== TOKENS.tDNS.devnetMint
      ) {
        queryMints.push(TOKENS.tDNS.priceMint);
      }

      const res = await fetchJupiterPrices(queryMints);
      setPrices((prev) => formatPrices(prev, res));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error refreshing token prices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const queryMints = [TOKENS.SOL.priceMint, TOKENS.USDC.priceMint];
        if (
          TOKENS.tDNS.priceMint &&
          TOKENS.tDNS.priceMint !== TOKENS.tDNS.devnetMint
        ) {
          queryMints.push(TOKENS.tDNS.priceMint);
        }

        const res = await fetchJupiterPrices(queryMints);
        if (!cancelled) {
          setPrices((prev) => formatPrices(prev, res));
          setLastUpdated(new Date());
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading token prices:", err);
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    const interval = setInterval(load, pollIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  const getExchangeRate = useCallback(
    (from: TokenSymbol, to: TokenSymbol): number => {
      if (from === to) return 1;
      const fromUsd = prices[from]?.usdPrice ?? 1;
      const toUsd = prices[to]?.usdPrice ?? 1;
      if (toUsd === 0) return 0;
      return fromUsd / toUsd;
    },
    [prices]
  );

  return {
    prices,
    loading,
    lastUpdated,
    refreshPrices,
    getExchangeRate,
  };
}
