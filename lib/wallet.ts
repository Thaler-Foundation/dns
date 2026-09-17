import {
  Transaction,
  VersionedTransaction,
  type PublicKey,
} from "@solana/web3.js";

export type DnsTx = Transaction | VersionedTransaction;

export type DnsSigner = {
  publicKey: PublicKey;
  signTransaction: <T extends DnsTx>(tx: T) => Promise<T>;
  signAllTransactions: <T extends DnsTx>(txs: T[]) => Promise<T[]>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
};

export type DnsWallet = {
  ready: boolean;
  connected: boolean;
  connecting: boolean;
  authenticated: boolean;
  publicKey: PublicKey | null;
  address: string | null;
  walletId: string | null;
  agentEnabled: boolean;
  agentAvailable: boolean;
  login: () => void;
  logout: () => Promise<void>;
  enableAgent: () => Promise<void>;
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
  return wallet.ready && !wallet.connected && !wallet.authenticated;
}

export function isVersionedTx(tx: DnsTx): tx is VersionedTransaction {
  return "version" in tx;
}

export function serializeUnsigned(tx: DnsTx): Uint8Array {
  if (isVersionedTx(tx)) {
    return tx.serialize();
  }
  return tx.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });
}

export function restoreSigned<T extends DnsTx>(
  original: T,
  signed: Uint8Array
): T {
  if (isVersionedTx(original)) {
    return VersionedTransaction.deserialize(signed) as T;
  }
  return Transaction.from(signed) as T;
}
