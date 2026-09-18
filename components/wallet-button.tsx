"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletDrawer } from "@/components/wallet-drawer";
import { useDnsWallet } from "@/hooks/use-dns-wallet";
import { isSessionPending } from "@/lib/wallet";

export function WalletButton() {
  const wallet = useDnsWallet();
  const { ready, connected, connecting, address, openWalletModal } = wallet;

  if (connected && address) {
    return <WalletDrawer />;
  }

  if (isSessionPending(wallet)) {
    return (
      <span
        className="inline-flex size-8 shrink-0 items-center justify-center"
        aria-busy="true"
        aria-label="Restoring session"
      >
        <Skeleton className="size-8 rounded-full motion-reduce:animate-none" />
      </span>
    );
  }

  return (
    <Button
      variant="framed"
      size="sm"
      className="h-8.5 px-3.5 text-xs shrink-0 tracking-wide font-sans"
      disabled={!ready || connecting}
      aria-busy={connecting}
      onClick={() => openWalletModal()}
    >
      {connecting ? "Connecting" : "Connect Wallet"}
    </Button>
  );
}
