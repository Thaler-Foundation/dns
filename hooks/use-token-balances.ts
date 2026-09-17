"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { TOKENS, type TokenSymbol } from "@/lib/tokens";

export type TokenBalances = Record<TokenSymbol, number>;

const DEFAULT_BALANCES: TokenBalances = {
  SOL: 0,
  USDC: 0,
  tDNS: 0,
};

export function useTokenBalances() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balances, setBalances] = useState<TokenBalances>(DEFAULT_BALANCES);
  const [loading, setLoading] = useState(false);

  const refreshBalances = useCallback(async () => {
    if (!connected || !publicKey) {
      setBalances(DEFAULT_BALANCES);
      return;
    }

    setLoading(true);
    const newBalances: TokenBalances = { ...DEFAULT_BALANCES };

    try {
      const lamports = await connection.getBalance(publicKey, "confirmed");
      newBalances.SOL = lamports / 1e9;
    } catch (err) {
      console.warn("Failed to fetch SOL balance:", err);
    }

    const splTokens: TokenSymbol[] = ["USDC", "tDNS"];
    await Promise.all(
      splTokens.map(async (sym) => {
        const config = TOKENS[sym];
        try {
          const mintPubkey = new PublicKey(config.devnetMint);
          const response = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            { mint: mintPubkey },
            "confirmed"
          );

          let total = 0;
          for (const item of response.value) {
            const amount =
              item.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
            if (typeof amount === "number") {
              total += amount;
            }
          }
          newBalances[sym] = total;
        } catch {
          newBalances[sym] = 0;
        }
      })
    );

    setBalances(newBalances);
    setLoading(false);
  }, [connected, publicKey, connection]);

  useEffect(() => {
    let cancelled = false;

    if (!connected || !publicKey) {
      return;
    }

    async function load() {
      const newBalances: TokenBalances = { ...DEFAULT_BALANCES };
      try {
        if (!publicKey) return;
        const lamports = await connection.getBalance(publicKey, "confirmed");
        newBalances.SOL = lamports / 1e9;
      } catch (err) {
        console.warn("Failed to fetch SOL balance:", err);
      }

      const splTokens: TokenSymbol[] = ["USDC", "tDNS"];
      await Promise.all(
        splTokens.map(async (sym) => {
          const config = TOKENS[sym];
          try {
            if (!publicKey) return;
            const mintPubkey = new PublicKey(config.devnetMint);
            const response = await connection.getParsedTokenAccountsByOwner(
              publicKey,
              { mint: mintPubkey },
              "confirmed"
            );

            let total = 0;
            for (const item of response.value) {
              const amount =
                item.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
              if (typeof amount === "number") {
                total += amount;
              }
            }
            newBalances[sym] = total;
          } catch {
            newBalances[sym] = 0;
          }
        })
      );

      if (!cancelled) {
        setBalances(newBalances);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, connection]);

  const activeBalances =
    connected && publicKey ? balances : DEFAULT_BALANCES;

  return {
    balances: activeBalances,
    loading,
    refreshBalances,
  };
}
