// Withdraw dialog: burns the chosen amount of this vault's stDNS through redeem and shows the USDC it pays at the published NAV; MAX and the amount are capped at what redeem can pay now (ruling 98).
"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TokenIcon } from "@/components/token-icons";
import { StDnsTokenIcon } from "@/components/vaults/stock-icons";
import { useDnsWallet } from "@/hooks/use-dns-wallet";
import { useDnsSend } from "@/hooks/use-dns-send";
import { useDns, type DnsVaultInfo } from "@/hooks/use-dns";
import type { DnsMints } from "@/lib/dns/tx";
import { redeemIxs, requestRedeemIxs } from "@/lib/dns/tx";
import { STDNS_DECIMALS, USDC_DECIMALS, assetsForShares, formatAtoms, parseAtoms } from "@/lib/dns/math";
import type { VaultStrategy } from "@/lib/vaults-data";
import { readRedeemable, type Redeemable } from "@/lib/dns/redeemable";

interface VaultRedeemModalProps {
  vault: VaultStrategy;
  info: DnsVaultInfo;
  mints: DnsMints;
  balance: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRedeemed: () => void;
}

export function VaultRedeemModal({
  vault,
  info,
  mints,
  balance,
  open,
  onOpenChange,
  onRedeemed,
}: VaultRedeemModalProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wallet = useDnsWallet();
  const sendDns = useDnsSend();
  const { connection } = useConnection();
  const [redeemable, setRedeemable] = useState<Redeemable | null>(null);
  useEffect(() => {
    if (!open) return;
    let live = true;
    readRedeemable(info.vault, async (addresses) => {
      const infos = await connection.getMultipleAccountsInfo(addresses.map((a) => new PublicKey(a)), "confirmed");
      return infos.map((i) => (i ? new Uint8Array(i.data) : null));
    })
      .then((r) => {
        if (live) setRedeemable(r);
      })
      .catch(() => {
        if (live) setRedeemable(null);
      });
    return () => {
      live = false;
    };
  }, [open, info.vault, connection]);
  const dns = useDns();
  const cooldownSlots = dns.mixer?.redeemCooldownSlots ?? BigInt(0);
  const cooldownMinutes = Math.ceil((Number(cooldownSlots) * 400) / 60_000);
  const shares = parseAtoms(amount, STDNS_DECIMALS) ?? BigInt(0);
  const payout = shares > BigInt(0) ? assetsForShares(shares, info.navUsdc, info.shareSupply) : BigInt(0);
  const tooMuch = shares > balance;
  const limit = redeemable !== null && redeemable.maxShares < balance ? redeemable.maxShares : balance;
  const overCap = !tooMuch && redeemable !== null && shares > redeemable.maxShares;
  const inFlight = redeemable !== null && redeemable.groupsInFlight > BigInt(0);
  const requestPath = overCap && !inFlight;
  const paysNothing =
    shares > BigInt(0) &&
    (redeemable !== null ? assetsForShares(shares, redeemable.navUsdc, redeemable.shareSupply) : payout) === BigInt(0);

  const handleRedeem = async () => {
    if (!wallet.address || shares <= BigInt(0) || tooMuch || paysNothing || inFlight || (overCap && !requestPath)) return;
    setIsSubmitting(true);
    try {
      if (requestPath && redeemable) {
        const signature = await sendDns(
          await requestRedeemIxs(wallet.address, mints, info.vault, info.stdnsMint, redeemable.stdnsEscrow, shares)
        );
        toast.success(
          `Withdrawal requested: ${formatAtoms(shares, STDNS_DECIMALS, 6)} stDNS locked in the vault's escrow`,
          { description: `Paid in USDC after the ${cooldownMinutes} minute cooldown, when the keeper unwinds the hedge and settles it. ${signature}` }
        );
        setAmount("");
        onOpenChange(false);
        onRedeemed();
        return;
      }
      const signature = await sendDns(
        await redeemIxs(wallet.address, mints, info.vault, info.stdnsMint, shares)
      );
      toast.success(
        `Withdrew ${formatAtoms(shares, STDNS_DECIMALS, 6)} stDNS for ${formatAtoms(payout, USDC_DECIMALS)} USDC`,
        { description: signature }
      );
      setAmount("");
      onOpenChange(false);
      onRedeemed();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Withdraw failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border p-0 gap-0 overflow-hidden shadow-none">
        <DialogHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-base font-semibold">Withdraw</DialogTitle>
            <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-sm">
              {vault.pairName}
            </span>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <div className="rounded-sm border border-border bg-background/50 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Withdraw Amount</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground">
                  {formatAtoms(balance, STDNS_DECIMALS, 6)} stDNS
                </span>
                <button
                  type="button"
                  onClick={() => setAmount(formatAtoms(balance / BigInt(2), STDNS_DECIMALS))}
                  className="px-1.5 py-0.5 rounded-sm border border-border text-[10px] font-mono hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  HALF
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(formatAtoms(limit, STDNS_DECIMALS))}
                  className="px-1.5 py-0.5 rounded-sm border border-border text-[10px] font-mono hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm border border-border bg-muted/40 shrink-0">
                <StDnsTokenIcon stock1={vault.stock1} stock2={vault.stock2} size={20} />
                <span className="font-semibold text-xs tracking-tight">stDNS</span>
              </div>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full bg-transparent text-right font-mono text-xl font-bold text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
            </div>
          </div>

          {redeemable !== null && (
            <p className="text-[11px] font-mono text-muted-foreground" data-redeemable={limit.toString()} data-cooldown-slots={cooldownSlots.toString()}>
              Redeemable now: {formatAtoms(limit, STDNS_DECIMALS, 6)} stDNS ({formatAtoms(assetsForShares(limit, redeemable.navUsdc, redeemable.shareSupply), USDC_DECIMALS)} USDC). Larger amounts are requested and paid after a {cooldownMinutes} minute cooldown.
            </p>
          )}

          <div className="rounded-sm border border-border bg-background/50 p-3.5">
            <span className="text-muted-foreground text-xs">You Receive</span>
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm border border-border bg-muted/40 shrink-0">
                <TokenIcon symbol="USDC" size={20} />
                <span className="font-semibold text-xs tracking-tight">USDC</span>
              </div>
              <p className="w-full text-right font-mono text-xl font-bold text-foreground">
                {formatAtoms(payout, USDC_DECIMALS)}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="framed"
            size="lg"
            onClick={handleRedeem}
            disabled={shares <= BigInt(0) || tooMuch || paysNothing || inFlight || isSubmitting}
            className="w-full h-11 font-sans font-medium text-sm tracking-wide disabled:opacity-40"
            data-request-path={requestPath ? "1" : "0"}
          >
            {tooMuch
              ? "Amount exceeds your stDNS"
              : paysNothing
              ? "Amount too small to redeem"
              : inFlight
              ? "Vault is settling a stake, try again shortly"
              : isSubmitting
              ? requestPath
                ? "Requesting..."
                : "Withdrawing..."
              : requestPath
              ? `Request withdrawal (${cooldownMinutes} min cooldown)`
              : "Withdraw"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
