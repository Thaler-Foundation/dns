import type { Address } from "@solana/kit";

export type DnsAddress = Address;

export type DnsPublicKey = {
  toBase58(): string;
  toString(): string;
};

export type DnsSigner = {
  address: Address;
  publicKey: DnsPublicKey;
  signTransaction: <T>(tx: T) => Promise<T>;
  signAllTransactions: <T>(txs: T[]) => Promise<T[]>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
};

export type DnsWallet = {
  ready: boolean;
  connected: boolean;
  connecting: boolean;
  authenticated: boolean;
  publicKey: DnsPublicKey | null;
  address: Address | null;
  walletName: string | null;
  walletIcon: string | null;
  login: () => void;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  logout: () => Promise<void>;
  signTransaction: DnsSigner["signTransaction"];
  signAllTransactions: DnsSigner["signAllTransactions"];
  signMessage: DnsSigner["signMessage"];
};

// True while restoring a session. Do not render signed-out chrome.
export function isSessionPending(wallet: DnsWallet): boolean {
  return !wallet.ready || (wallet.authenticated && !wallet.connected);
}

// True only after auth has settled and there is no session.
export function isSignedOut(wallet: DnsWallet): boolean {
  return wallet.ready && !wallet.connected;
}
