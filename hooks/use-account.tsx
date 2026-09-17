"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useDnsWallet } from "@/hooks/use-dns-wallet";
import type { DnsSigner } from "@/lib/wallet";

export const LAMPORTS_PER_SOL = 1_000_000_000;

function asSigner(
  wallet: ReturnType<typeof useDnsWallet>
): DnsSigner | null {
  if (!wallet.address || !wallet.publicKey || !wallet.connected) {
    return null;
  }
  return {
    address: wallet.address,
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

export function solAmount(lamports: number | bigint | null): number | null {
  if (lamports == null) {
    return null;
  }
  return Number(lamports) / LAMPORTS_PER_SOL;
}
