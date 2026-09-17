"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletDrawer } from "@/components/wallet-drawer";
import { useDnsWallet } from "@/hooks/use-dns-wallet";
import { isSessionPending } from "@/lib/wallet";

export function WalletButton() {
  const wallet = useDnsWallet();
  const { ready, connected, connecting, address, login } = wallet;


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
      size="sm"
      className="min-h-10 shrink-0 sm:min-h-7"
      disabled={!ready || connecting}
      aria-busy={connecting}
      onClick={() => login()}
    >
      {connecting ? "Signing in" : "Sign in"}
    </Button>
  );
}
