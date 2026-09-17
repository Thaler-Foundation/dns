"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { DnsWalletProvider } from "@/hooks/use-dns-wallet";
import { AccountProvider } from "@/hooks/use-account";
import { AnalyticsGate } from "@/components/analytics-gate";
import { CookieBanner } from "@/components/cookie-banner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
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
    </ThemeProvider>
  );
}

