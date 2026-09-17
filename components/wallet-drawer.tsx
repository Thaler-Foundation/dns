"use client";

import { useRouter } from "next/navigation";
import { Copy, ExternalLink, LogOut, Settings, User } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccount } from "@/hooks/use-account";
import { useDnsWallet } from "@/hooks/use-dns-wallet";
import Image from "next/image";

function copyText(value: string) {
  void navigator.clipboard.writeText(value).then(
    () => toast.success("Address copied to clipboard"),
    () => toast.error("Could not copy address")
  );
}

function shortenAddress(addr: string, chars = 4): string {
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function WalletDrawer() {
  const wallet = useDnsWallet();
  const { signer } = useAccount();
  const router = useRouter();
  const address = wallet.address ?? (signer?.address as string | undefined);

  if (!address) {
    return null;
  }

  const avatarUrl = `https://avatar.tobi.sh/${address}`;
  const displayWalletName = wallet.walletName ?? "Solana Wallet";

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <span className="hidden sm:inline-block shrink-0 font-mono text-xs tabular-nums text-muted-foreground bg-muted/60 px-2 py-1 rounded border border-border">
        {shortenAddress(address, 4)}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex size-8 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none cursor-pointer"
          aria-label="Account menu"
        >
          {wallet.walletIcon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={wallet.walletIcon}
              alt={displayWalletName}
              className="size-8 rounded-full p-1"
            />
          ) : (
            <Image
              src={avatarUrl}
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full"
              unoptimized
            />
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-60 w-68 p-1">
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <Image
              src={avatarUrl}
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-full ring-1 ring-border"
              unoptimized
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {displayWalletName}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {shortenAddress(address, 6)}
              </p>
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="min-h-9 gap-2 cursor-pointer"
            aria-label={`Copy address ${address}`}
            onClick={() => copyText(address)}
          >
            <Copy className="size-4" />
            <span className="font-mono text-xs truncate">Copy Address</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="min-h-9 gap-2 cursor-pointer"
            onClick={() =>
              window.open(
                `https://solscan.io/account/${address}?cluster=devnet`,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            <ExternalLink className="size-4" />
            <span>View on Solscan</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="min-h-9 gap-2 cursor-pointer"
            onClick={() => router.push("/settings")}
          >
            <User className="size-4" />
            <span>Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="min-h-9 gap-2 cursor-pointer"
            onClick={() => router.push("/settings")}
          >
            <Settings className="size-4" />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="min-h-9 gap-2 text-destructive focus:text-destructive cursor-pointer"
            onClick={() => {
              void wallet.logout();
            }}
          >
            <LogOut className="size-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
