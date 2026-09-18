"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/brand-lockup";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletButton } from "@/components/wallet-button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  const isSwap = pathname === "/";
  const isVaults = pathname.startsWith("/vaults");

  return (
    <header className="relative z-20 border-b border-border pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 w-full min-w-0 items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="DNS home" className="shrink-0">
            <BrandLockup />
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors",
                isSwap
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              Swap
            </Link>
            <Link
              href="/vaults"
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors",
                isVaults
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              Smart Vaults
            </Link>
          </nav>
        </div>

        <nav aria-label="Site" className="flex min-w-0 items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <WalletButton />
        </nav>
      </div>
    </header>
  );
}

