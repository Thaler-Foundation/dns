"use client";

import { useRouter } from "next/navigation";
import { Copy, LogOut, Settings, User } from "lucide-react";
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
    () => toast.success("Copied"),
    () => toast.error("Could not copy")
  );
}

export function WalletDrawer() {
  const wallet = useDnsWallet();
  const { signer } = useAccount();
  const router = useRouter();
  const address = wallet.address;


  if (!address) {
    return null;
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <p className="shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
        {signer?.publicKey.toBase58()}
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex size-8 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label="Account menu"
        >
          <Image
            src={`https://avatar.tobi.sh/${signer?.publicKey.toBase58()}`}
            alt=""
            className="size-8 rounded-full"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56 w-64 p-1">
          <div className="flex items-center gap-2 px-2 py-2">
            <Image
              src={`https://avatar.tobi.sh/${signer?.publicKey.toBase58()}`}
              alt=""
              className="size-8 rounded-full" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {signer?.publicKey.toBase58()}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {signer?.publicKey.toBase58()}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="min-h-10 gap-2"
            aria-label={`Copy address ${signer?.publicKey.toBase58()}`}
            onClick={() => copyText(address)}
          >
            <Copy />
            <span className="font-mono text-xs">{signer?.publicKey.toBase58()}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="min-h-10 gap-2"
            onClick={() =>
              router.push("/settings")
            }
          >
            <User />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            className="min-h-10 gap-2"
            onClick={() => router.push("/settings")}
          >
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="min-h-10 gap-2"
            onClick={() => {
              void wallet.logout();
            }}
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
