
"use client";

import { ArrowUpDown, ChevronDown, Wallet as WalletIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { TokenIcon } from "@/components/token-icons";
import { TokenSelectDialog } from "@/components/token-select-dialog";
import { useDnsWallet } from "@/hooks/use-dns-wallet";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { useTokenPrices } from "@/hooks/use-token-prices";
import { TOKENS, type TokenSymbol } from "@/lib/tokens";
import { cn } from "@/lib/utils";

export function SwapCard() {
  const wallet = useDnsWallet();
  const { balances, refreshBalances } = useTokenBalances();
  const { prices, getExchangeRate } = useTokenPrices();

  const [sellToken, setSellToken] = useState<TokenSymbol>("USDC");
  const [buyToken, setBuyToken] = useState<TokenSymbol>("tDNS");
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [lastEdited, setLastEdited] = useState<"sell" | "buy">("sell");
  const [isSwapping, setIsSwapping] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<"sell" | "buy" | null>(null);

  const rate = useMemo(
    () => getExchangeRate(sellToken, buyToken),
    [getExchangeRate, sellToken, buyToken]
  );

  const sellBalance = balances[sellToken] ?? 0;
  const buyBalance = balances[buyToken] ?? 0;

  const handleSellChange = useCallback(
    (value: string) => {
      const clean = value.replace(/[^0-9.]/g, "");
      if ((clean.match(/\./g) || []).length > 1) return;

      setSellAmount(clean);
      setLastEdited("sell");

      const num = parseFloat(clean);
      if (isNaN(num) || num <= 0) {
        setBuyAmount("");
      } else {
        const calculated = num * rate;
        const decimals = TOKENS[buyToken].decimals;
        setBuyAmount(
          calculated.toLocaleString("en-US", {
            useGrouping: false,
            maximumFractionDigits: Math.min(decimals, 6),
          })
        );
      }
    },
    [rate, buyToken]
  );

  const handleBuyChange = useCallback(
    (value: string) => {
      const clean = value.replace(/[^0-9.]/g, "");
      if ((clean.match(/\./g) || []).length > 1) return;

      setBuyAmount(clean);
      setLastEdited("buy");

      const num = parseFloat(clean);
      if (isNaN(num) || num <= 0 || rate <= 0) {
        setSellAmount("");
      } else {
        const calculated = num / rate;
        const decimals = TOKENS[sellToken].decimals;
        setSellAmount(
          calculated.toLocaleString("en-US", {
            useGrouping: false,
            maximumFractionDigits: Math.min(decimals, 6),
          })
        );
      }
    },
    [rate, sellToken]
  );

  const handleFlipTokens = useCallback(() => {
    const nextSell = buyToken;
    const nextBuy = sellToken;
    setSellToken(nextSell);
    setBuyToken(nextBuy);

    const newRate = getExchangeRate(nextSell, nextBuy);
    if (sellAmount && !isNaN(parseFloat(sellAmount))) {
      const num = parseFloat(sellAmount);
      setBuyAmount(
        (num * newRate).toLocaleString("en-US", {
          useGrouping: false,
          maximumFractionDigits: Math.min(TOKENS[nextBuy].decimals, 6),
        })
      );
    }
  }, [buyToken, sellToken, sellAmount, getExchangeRate]);

  const handleSetSellPercentage = (fraction: number) => {
    let max = sellBalance;
    if (sellToken === "SOL" && max > 0.005) {
      max -= 0.005;
    }
    const val = (max * fraction).toFixed(
      Math.min(TOKENS[sellToken].decimals, 6)
    );
    handleSellChange(parseFloat(val) > 0 ? val : "0");
  };

  const sellUsd = useMemo(() => {
    const num = parseFloat(sellAmount);
    if (isNaN(num) || num <= 0) return 0;
    return num * (prices[sellToken]?.usdPrice ?? 0);
  }, [sellAmount, sellToken, prices]);

  const buyUsd = useMemo(() => {
    const num = parseFloat(buyAmount);
    if (isNaN(num) || num <= 0) return 0;
    return num * (prices[buyToken]?.usdPrice ?? 0);
  }, [buyAmount, buyToken, prices]);

  const sellNum = parseFloat(sellAmount);
  const isZeroOrEmpty = !sellAmount || isNaN(sellNum) || sellNum <= 0;
  const isInsufficient = wallet.connected && sellNum > sellBalance;

  const handleSelectToken = (selected: TokenSymbol) => {
    if (dialogTarget === "sell") {
      if (selected === buyToken) setBuyToken(sellToken);
      setSellToken(selected);
    } else if (dialogTarget === "buy") {
      if (selected === sellToken) setSellToken(buyToken);
      setBuyToken(selected);
    }
    setDialogTarget(null);

    setTimeout(() => {
      if (lastEdited === "sell" && sellAmount) {
        handleSellChange(sellAmount);
      }
    }, 0);
  };

  const handleAction = async () => {
    if (!wallet.connected) {
      wallet.login();
      return;
    }

    if (isZeroOrEmpty || isInsufficient) return;

    setIsSwapping(true);
    try {
      toast.info(
        `Initiating swap: ${sellAmount} ${sellToken} for ${buyAmount} ${buyToken}...`
      );
      await new Promise((res) => setTimeout(res, 1400));
      toast.success(
        `Swapped ${sellAmount} ${sellToken} for ${buyAmount} ${buyToken}`
      );
      setSellAmount("");
      setBuyAmount("");
      refreshBalances();
    } catch {
      toast.error("Failed to execute swap");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <>
      <div className="relative w-full rounded-sm border border-border bg-card p-6 text-card-foreground sm:p-8">
        <div className="rounded-sm border border-border bg-muted/40 p-5 focus-within:border-foreground/20 dark:bg-[#202020] sm:p-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Sell
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <WalletIcon className="size-3.5 text-muted-foreground" />
                <span className="font-mono">
                  {sellBalance.toLocaleString(undefined, {
                    maximumFractionDigits: 5,
                  })}{" "}
                  {sellToken}
                </span>
              </span>
              <div className="flex items-center gap-1 font-semibold text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSetSellPercentage(1)}
                  className="rounded-xs px-1.5 py-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                >
                  MAX
                </button>
                <span className="text-muted-foreground/40">·</span>
                <button
                  type="button"
                  onClick={() => handleSetSellPercentage(0.5)}
                  className="rounded-xs px-1.5 py-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                >
                  50%
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={sellAmount}
              onChange={(e) => handleSellChange(e.target.value)}
              className="w-full bg-transparent font-sans font-medium text-3xl tracking-tight text-foreground placeholder:text-muted-foreground/40 focus:outline-none sm:text-4xl"
            />
            <button
              type="button"
              onClick={() => setDialogTarget("sell")}
              className="flex shrink-0 items-center gap-2.5 rounded-sm border border-border bg-secondary px-3.5 py-2 hover:bg-secondary/80 active:translate-y-px"
            >
              <TokenIcon symbol={sellToken} size={24} />
              <span className="font-semibold text-base text-secondary-foreground">
                {sellToken}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-2 font-mono text-xs text-muted-foreground">
            {sellUsd > 0
              ? `≈ $${sellUsd.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "$0.00"}
          </div>
        </div>

        <div className="relative -my-3.5 flex justify-center z-10">
          <button
            type="button"
            onClick={handleFlipTokens}
            title="Switch tokens"
            className="flex size-9 items-center justify-center rounded-sm border border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground active:translate-y-px"
          >
            <ArrowUpDown className="size-4" />
          </button>
        </div>

        <div className="rounded-sm border border-border bg-muted/40 p-5 focus-within:border-foreground/20 dark:bg-[#202020] sm:p-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              Buy
            </span>
            <span className="flex items-center gap-1.5">
              <WalletIcon className="size-3.5 text-muted-foreground" />
              <span className="font-mono">
                {buyBalance.toLocaleString(undefined, {
                  maximumFractionDigits: 5,
                })}{" "}
                {buyToken}
              </span>
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={buyAmount}
              onChange={(e) => handleBuyChange(e.target.value)}
              className="w-full bg-transparent font-sans font-medium text-3xl tracking-tight text-foreground placeholder:text-muted-foreground/40 focus:outline-none sm:text-4xl"
            />
            <button
              type="button"
              onClick={() => setDialogTarget("buy")}
              className="flex shrink-0 items-center gap-2.5 rounded-sm border border-border bg-secondary px-3.5 py-2 hover:bg-secondary/80 active:translate-y-px"
            >
              <TokenIcon symbol={buyToken} size={24} />
              <span className="font-semibold text-base text-secondary-foreground">
                {buyToken}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </div>

          <div className="mt-2 font-mono text-xs text-muted-foreground">
            {buyUsd > 0
              ? `≈ $${buyUsd.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "$0.00"}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>Rate</span>
          <span className="font-mono text-foreground">
            1 {sellToken} ≈{" "}
            {rate < 0.0001
              ? rate.toFixed(6)
              : rate.toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })}{" "}
            {buyToken}
          </span>
        </div>

        <div className="mt-5">
          <button
            type="button"
            disabled={
              wallet.connected &&
              (isZeroOrEmpty || isInsufficient || isSwapping)
            }
            onClick={handleAction}
            className={cn(
              "h-12 w-full rounded-sm font-medium text-sm transition-colors",
              !wallet.connected
                ? "bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer active:translate-y-px"
                : isInsufficient
                ? "bg-muted text-destructive border border-destructive/20 cursor-not-allowed"
                : isZeroOrEmpty
                ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer active:translate-y-px"
            )}
          >
            {!wallet.connected
              ? "Connect Wallet"
              : isInsufficient
              ? `Insufficient ${sellToken} balance`
              : isZeroOrEmpty
              ? "Enter an amount"
              : isSwapping
              ? "Swapping..."
              : `Swap ${sellToken} for ${buyToken}`}
          </button>
        </div>
      </div>

      <TokenSelectDialog
        open={dialogTarget !== null}
        onOpenChange={(open) => !open && setDialogTarget(null)}
        selectedToken={dialogTarget === "sell" ? sellToken : buyToken}
        onSelectToken={handleSelectToken}
        balances={balances}
        prices={prices}
      />
    </>
  );
}
