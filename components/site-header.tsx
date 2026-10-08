"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "@/components/brand-lockup";
import { MobileMenu } from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletButton } from "@/components/wallet-button";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="relative z-20 border-b border-border pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 w-full min-w-0 items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2 sm:gap-6">
          <MobileMenu />
          <Link href="/" aria-label="DNS home" className="shrink-0">
            <BrandLockup />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map(({ href, label, isActive }) => {
              const active = isActive(pathname);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors whitespace-nowrap",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <nav aria-label="Site" className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex">
            <ThemeToggle />
          </div>
          <WalletButton />
        </nav>
      </div>
    </header>
  );
}
