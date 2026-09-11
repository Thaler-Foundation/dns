import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletButton } from "@/components/wallet-button";

export function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-border pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 w-full min-w-0 items-center justify-between gap-3 px-4">
        <Link href="/" aria-label="DNS home" className="shrink-0">
          <BrandLockup />
        </Link>
        <nav aria-label="Site" className="flex min-w-0 items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <WalletButton />
        </nav>
      </div>
    </header>
  );
}
