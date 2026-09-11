"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useDnsWallet } from "@/hooks/use-dns-wallet";
import type { DnsSigner } from "@/lib/wallet";

function asSigner(
  wallet: ReturnType<typeof useDnsWallet>
): DnsSigner | null {
  if (!wallet.publicKey || !wallet.connected) {
    return null;
  }
  return {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
    signMessage: wallet.signMessage,
  };
}

type AccountValue = {
  signer: DnsSigner | null;
};

const AccountContext = createContext<AccountValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const wallet = useDnsWallet();
  const signer = useMemo(() => asSigner(wallet), [wallet]);
  const signerId = signer?.publicKey.toBase58() ?? "";

  useEffect(() => {
    if (!signerId) {
      return;
    }
  }, [signerId]);

  useEffect(() => {
    if (!signer) {
      return;
    }
  }, [signer]);

  const value = useMemo<AccountValue>(
    () => ({
      signer,
    }),
    [signer]
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount(): AccountValue {
  const ctx = useContext(AccountContext);
  if (!ctx) {
    throw new Error("useAccount must be used in AccountProvider");
  }
  return ctx;
}

export function solAmount(lamports: number | null): number | null {
  if (lamports == null) {
    return null;
  }
  return lamports / LAMPORTS_PER_SOL;
}
