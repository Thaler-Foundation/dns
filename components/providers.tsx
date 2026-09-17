"use client";

import { useMemo, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import {
  SolflareWalletAdapter,
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { DnsWalletProvider } from "@/hooks/use-dns-wallet";
import { AccountProvider } from "@/hooks/use-account";
import { AnalyticsGate } from "@/components/analytics-gate";
import { CookieBanner } from "@/components/cookie-banner";

const DEFAULT_RPC = "https://api.devnet.solana.com";

export function Providers({ children }: { children: ReactNode }) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || DEFAULT_RPC;

  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <DnsWalletProvider>
            <AccountProvider>
              <TooltipProvider>
                {children}
                <AnalyticsGate />
                <CookieBanner />
                <Toaster />
              </TooltipProvider>
            </AccountProvider>
          </DnsWalletProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}
