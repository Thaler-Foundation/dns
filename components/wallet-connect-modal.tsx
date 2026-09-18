"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import {
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ALLOWED_WALLETS,
  type AllowedWalletConfig,
} from "@/lib/solana-wallets";
import { WalletIcon } from "@/components/wallet-icons";
import { cn } from "cn";

type WalletConnectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WalletConnectModal({
  open,
  onOpenChange,
}: WalletConnectModalProps) {
  const { wallets, select, connect, connecting } = useWallet();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // Re-check browser injection on mount and window focus
  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener("focus", refresh);
    window.addEventListener("wallet-standard:register-wallet", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("wallet-standard:register-wallet", refresh);
    };
  }, []);

  const isWalletDetected = useCallback(
    (config: AllowedWalletConfig) => {
      if (config.detect()) return true;
      return wallets.some(
        (w) =>
          config.adapterNames.some(
            (n) => n.toLowerCase() === w.adapter.name.toLowerCase()
          ) &&
          (w.readyState === "Installed" || w.readyState === "Loadable")
      );
    },
    [wallets]
  );

  const handleWalletClick = useCallback(
    async (config: AllowedWalletConfig) => {
      const detected = isWalletDetected(config);

      if (!detected) {
        window.open(config.installUrl, "_blank", "noopener,noreferrer");
        return;
      }

      try {
        setSelectedWalletId(config.id);

        // Find adapter in registered wallets
        const matchingWallet = wallets.find((w) =>
          config.adapterNames.some(
            (n) => n.toLowerCase() === w.adapter.name.toLowerCase()
          )
        );

        if (matchingWallet) {
          select(matchingWallet.adapter.name);
          if (!matchingWallet.adapter.connected) {
            await matchingWallet.adapter.connect();
          }
          onOpenChange(false);
          toast.success(`Connected to ${config.name}`);
        } else {
          select(config.name as unknown as Parameters<typeof select>[0]);
          await connect();
          onOpenChange(false);
          toast.success(`Connected to ${config.name}`);
        }
      } catch (err: unknown) {
        const raw = err instanceof Error ? err.message : String(err ?? "");
        const message = raw.trim();
        const lower = message.toLowerCase();
        if (
          message &&
          !lower.includes("user rejected") &&
          !lower.includes("rejected the request") &&
          !lower.includes("walletnotselectederror") &&
          !lower.includes("window closed")
        ) {
          toast.error(message);
        }
      } finally {
        setSelectedWalletId(null);
      }
    },
    [connect, isWalletDetected, onOpenChange, select, wallets]
  );

  const mainWallet = ALLOWED_WALLETS.find((w) => w.isMain) ?? ALLOWED_WALLETS[0];
  const otherWallets = ALLOWED_WALLETS.filter((w) => !w.isMain);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5 sm:p-6 border-border bg-card">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Connect your Solana wallet to interact with DNS
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-3">
          {/* Featured / Main Wallet: Solflare */}
          {mainWallet && (() => {
            const isDetected = isWalletDetected(mainWallet);
            const isCurrentConnecting =
              connecting && selectedWalletId === mainWallet.id;
            const iconSrc = mainWallet.iconUrl;

            return (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => void handleWalletClick(mainWallet)}
                  disabled={isCurrentConnecting}
                  className={cn(
                    "w-full text-left p-3.5 rounded-none border border-zinc-300 dark:border-white/20 bg-card hover:bg-muted/40 hover:border-zinc-500 dark:hover:border-white/40 transition-all duration-150 flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative before:content-[''] before:absolute before:inset-[3px] before:border before:border-zinc-300/80 dark:before:border-white/15 before:pointer-events-none hover:before:border-zinc-500/80 dark:hover:before:border-white/30",
                    isCurrentConnecting && "opacity-80 cursor-wait"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 shrink-0 flex items-center justify-center">
                      <WalletIcon
                        id={mainWallet.id}
                        src={iconSrc}
                        alt={mainWallet.name}
                        className="size-10"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-foreground">
                          {mainWallet.name}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-none text-[10px] font-mono font-medium bg-foreground text-background tracking-wider uppercase">
                          <Sparkles className="size-2.5" />
                          Main
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {mainWallet.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCurrentConnecting ? (
                      <span className="inline-flex items-center gap-1 text-xs text-foreground font-medium">
                        <Loader2 className="size-3.5 animate-spin" />
                        Connecting
                      </span>
                    ) : isDetected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                        <CheckCircle2 className="size-3" />
                        Detected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded group-hover:text-foreground">
                        Install
                        <ExternalLink className="size-3" />
                      </span>
                    )}
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
              </div>
            );
          })()}

          {/* Section Divider */}
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-mono">
                Other Wallets
              </span>
            </div>
          </div>

          {/* Other Allowed Wallets: Phantom, Backpack, Squads, MetaMask */}
          <div className="flex flex-col gap-2">
            {otherWallets.map((wallet) => {
              const isDetected = isWalletDetected(wallet);
              const isCurrentConnecting =
                connecting && selectedWalletId === wallet.id;
              const iconSrc = wallet.iconUrl;

              return (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={() => void handleWalletClick(wallet)}
                  disabled={isCurrentConnecting}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-none border border-border bg-card/60 hover:bg-muted/70 hover:border-zinc-500 dark:hover:border-white/30 transition-all duration-150 flex items-center justify-between gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isCurrentConnecting && "opacity-80 cursor-wait"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 shrink-0 flex items-center justify-center">
                      <WalletIcon
                        id={wallet.id}
                        src={iconSrc}
                        alt={wallet.name}
                        className="size-9"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground">
                        {wallet.name}
                      </p>
                      {wallet.description && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {wallet.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isCurrentConnecting ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                        <Loader2 className="size-3.5 animate-spin" />
                        Connecting
                      </span>
                    ) : isDetected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        <CheckCircle2 className="size-3" />
                        Detected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded group-hover:text-foreground">
                        Install
                        <ExternalLink className="size-2.5" />
                      </span>
                    )}
                    <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/60 text-center">
          <p className="text-[11px] text-muted-foreground">
            By connecting a wallet, you agree to the{" "}
            <a
              href="/terms"
              className="text-primary hover:underline underline-offset-2"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-primary hover:underline underline-offset-2"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
