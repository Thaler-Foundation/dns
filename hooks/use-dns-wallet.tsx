"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { isAddress, type Address } from "@solana/kit";
import { toast } from "sonner";
import { WalletConnectModal } from "@/components/wallet-connect-modal";
import { getAllowedConfig } from "@/lib/solana-wallets";
import type { DnsWallet, DnsPublicKey } from "@/lib/wallet";

const empty: DnsWallet = {
  ready: true,
  connected: false,
  connecting: false,
  authenticated: false,
  publicKey: null,
  address: null,
  walletName: null,
  walletIcon: null,
  login: () => {},
  openWalletModal: () => {},
  closeWalletModal: () => {},
  logout: async () => {},
  signTransaction: async (tx) => tx,
  signAllTransactions: async (txs) => txs,
  signMessage: async () => new Uint8Array(),
};

const DnsWalletContext = createContext<DnsWallet>(empty);

export function DnsWalletProvider({ children }: { children: ReactNode }) {
  const {
    connected,
    connecting,
    wallet,
    publicKey: adapterPublicKey,
    disconnect,
    signTransaction,
    signAllTransactions,
    signMessage,
  } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const rawAddress = adapterPublicKey ? adapterPublicKey.toBase58() : null;
  const address = useMemo<Address | null>(() => {
    if (!rawAddress) return null;
    return isAddress(rawAddress) ? (rawAddress as Address) : null;
  }, [rawAddress]);

  const publicKey = useMemo<DnsPublicKey | null>(() => {
    if (!address) return null;
    return {
      toBase58: () => address,
      toString: () => address,
    };
  }, [address]);

  const login = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await disconnect();
      toast.success("Wallet disconnected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to disconnect");
    }
  }, [disconnect]);

  const signTx = useCallback(
    async <T,>(tx: T): Promise<T> => {
      if (!signTransaction) {
        throw new Error("Connected wallet does not support transaction signing");
      }
      return (await (signTransaction as unknown as (t: T) => Promise<T>)(tx));
    },
    [signTransaction]
  );

  const signAllTx = useCallback(
    async <T,>(txs: T[]): Promise<T[]> => {
      if (!signAllTransactions) {
        throw new Error("Connected wallet does not support multiple transaction signing");
      }
      return (await (signAllTransactions as unknown as (t: T[]) => Promise<T[]>)(txs));
    },
    [signAllTransactions]
  );

  const signMsg = useCallback(
    async (message: Uint8Array): Promise<Uint8Array> => {
      if (!signMessage) {
        throw new Error("Connected wallet does not support message signing");
      }
      return await signMessage(message);
    },
    [signMessage]
  );

  const value = useMemo<DnsWallet>(() => {
    const allowedConfig = wallet?.adapter.name
      ? getAllowedConfig(wallet.adapter.name)
      : undefined;

    return {
      ready: true,
      connected: Boolean(connected && address),
      connecting,
      authenticated: Boolean(connected && address),
      publicKey,
      address,
      walletName: wallet?.adapter.name ?? null,
      walletIcon: allowedConfig?.iconUrl ?? wallet?.adapter.icon ?? null,
      login,
      openWalletModal: () => setIsModalOpen(true),
      closeWalletModal: () => setIsModalOpen(false),
      logout,
      signTransaction: signTx,
      signAllTransactions: signAllTx,
      signMessage: signMsg,
    };
  }, [
    connected,
    address,
    connecting,
    publicKey,
    wallet,
    login,
    logout,
    signTx,
    signAllTx,
    signMsg,
  ]);

  return (
    <DnsWalletContext.Provider value={value}>
      {children}
      <WalletConnectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </DnsWalletContext.Provider>
  );
}

export function useDnsWallet(): DnsWallet {
  return useContext(DnsWalletContext);
}
