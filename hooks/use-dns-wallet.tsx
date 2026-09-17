"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { DnsWallet } from "@/lib/wallet";

const empty: DnsWallet = {
  ready: true,
  connected: false,
  connecting: false,
  authenticated: false,
  publicKey: null,
  address: null,
  walletId: null,
  agentEnabled: false,
  agentAvailable: false,
  login: () => {},
  logout: async () => {},
  enableAgent: async () => {},
  signTransaction: async (tx) => tx,
  signAllTransactions: async (txs) => txs,
  signMessage: async () => new Uint8Array(),
};

const DnsWalletContext = createContext<DnsWallet>(empty);

export function DnsWalletProvider({ children }: { children: ReactNode }) {
  return (
    <DnsWalletContext.Provider value={empty}>
      {children}
    </DnsWalletContext.Provider>
  );
}

export function useDnsWallet(): DnsWallet {
  return useContext(DnsWalletContext);
}

