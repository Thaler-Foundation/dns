"use client";

import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { DnsWalletProvider } from "@/hooks/use-dns-wallet";
import { AccountProvider } from "@/hooks/use-account";
import { AnalyticsGate } from "@/components/analytics-gate";
import { CookieBanner } from "@/components/cookie-banner";
import {
  PRIVY_ACCENT,
  PRIVY_APP_ID,
  PRIVY_CLIENT_ID,
  privyConfigured,
} from "@/lib/privy-config";

function Inner({ children }: { children: ReactNode }) {
  return (
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
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {privyConfigured() ? (
        <PrivyProvider
          appId={PRIVY_APP_ID}
          {...(PRIVY_CLIENT_ID ? { clientId: PRIVY_CLIENT_ID } : {})}
          config={{
            appearance: {
              theme: "dark",
              accentColor: PRIVY_ACCENT,
              logo: "/logo.png",
              walletChainType: "solana-only",
              showWalletLoginFirst: false,
            },
            loginMethods: ["email", "google"],
            embeddedWallets: {
              showWalletUIs: false,
              ethereum: { createOnLogin: "off" },
              solana: { createOnLogin: "all-users" },
            },
          }}
        >
          <Inner>{children}</Inner>
        </PrivyProvider>
      ) : (
        <Inner>{children}</Inner>
      )}
    </ThemeProvider>
  );
}
