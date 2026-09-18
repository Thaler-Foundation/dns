"use client";

import { useState, useMemo } from "react";
import { Copy, Check, ExternalLink, LogOut, X } from "lucide-react";
import { toast } from "sonner";
import { TokenIcon } from "@/components/token-icons";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useDnsWallet } from "@/hooks/use-dns-wallet";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useTokenPrices } from "@/hooks/use-token-prices";
import { TOKEN_LIST, truncateAddress } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export function WalletDrawer() {
  const wallet = useDnsWallet();
  const { balances } = useTokenBalances();
  const { prices } = useTokenPrices();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"balances" | "activity">("balances");

  const address = wallet.address;

  const totalUsd = useMemo(() => {
    let sum = 0;
    for (const token of TOKEN_LIST) {
      const balance = balances[token.symbol] ?? 0;
      const price = prices[token.symbol]?.usdPrice ?? 0;
      sum += balance * price;
    }
    return sum;
  }, [balances, prices]);

  if (!address) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Wallet address copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const solscanAccountUrl = `https://solscan.io/account/${address}?cluster=devnet`;

  return (
    <Drawer swipeDirection="right">
      <div className="flex min-w-0 items-center gap-2">
        <DrawerTrigger className="relative inline-flex items-center gap-2 rounded-none border border-zinc-300 dark:border-white/20 bg-card px-3 py-1.5 text-xs font-mono hover:bg-muted/40 hover:border-zinc-500 dark:hover:border-white/40 transition-all cursor-pointer before:content-[''] before:absolute before:inset-[2px] before:border before:border-zinc-300/80 dark:before:border-white/15 before:pointer-events-none">
          <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-foreground">{truncateAddress(address, 4)}</span>
        </DrawerTrigger>
      </div>

      <DrawerContent className="rounded-none sm:rounded-l-none border-y-0 border-r-0 border-l border-border bg-card text-card-foreground shadow-none sm:max-w-md w-full p-0">
        <DrawerHeader className="border-b border-border p-4 flex flex-row items-center justify-between space-y-0">
          <DrawerTitle className="sr-only">Wallet Details</DrawerTitle>
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            <div className="flex items-center gap-1.5 font-mono text-sm font-medium text-foreground">
              <span>{truncateAddress(address, 4)}</span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy address"
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => wallet.logout()}
              className="relative inline-flex items-center gap-1.5 rounded-none border border-zinc-300 dark:border-white/20 bg-card px-2.5 py-1 text-xs font-sans text-destructive hover:bg-destructive/10 transition-colors before:content-[''] before:absolute before:inset-[2px] before:border before:border-zinc-300/60 dark:before:border-white/10 before:pointer-events-none"
            >
              <LogOut className="size-3" />
              <span>Disconnect</span>
            </button>
            <DrawerClose className="rounded-sm p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              <X className="size-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex flex-1 flex-col overflow-y-auto p-5">
          <div className="pb-4">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Balance
            </div>
            <div className="font-mono text-3xl font-semibold text-foreground mt-1 tabular-nums">
              ${totalUsd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div className="flex items-center gap-1 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("balances")}
              className={cn(
                "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
                activeTab === "balances"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Balances
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("activity")}
              className={cn(
                "rounded-sm px-3 py-1 text-xs font-medium transition-colors",
                activeTab === "activity"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Activity
            </button>
          </div>

          {activeTab === "balances" ? (
            <div className="mt-3 flex flex-col divide-y divide-border">
              {TOKEN_LIST.map((token) => {
                const balance = balances[token.symbol] ?? 0;
                const price = prices[token.symbol]?.usdPrice ?? 0;
                const valueUsd = balance * price;

                return (
                  <div
                    key={token.symbol}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <TokenIcon symbol={token.symbol} size={28} />
                      <div>
                        <div className="font-medium text-sm text-foreground">
                          {token.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {token.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-sm font-medium text-foreground tabular-nums">
                        {balance.toLocaleString(undefined, {
                          maximumFractionDigits: 5,
                        })}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground tabular-nums">
                        ${valueUsd.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Completed transactions will appear here
              </p>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-border">
            <a
              href={solscanAccountUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-between rounded-sm border border-border bg-muted/30 px-3.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <span>View Account on Solscan</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
