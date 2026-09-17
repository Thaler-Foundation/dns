export type TokenSymbol = "SOL" | "USDC" | "tDNS";

export interface TokenConfig {
  symbol: TokenSymbol;
  name: string;
  decimals: number;
  devnetMint: string;
  priceMint: string;
  isNative?: boolean;
}

export const TOKENS: Record<TokenSymbol, TokenConfig> = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    devnetMint: "So11111111111111111111111111111111111111112",
    priceMint: "So11111111111111111111111111111111111111112",
    isNative: true,
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    devnetMint:
      process.env.NEXT_PUBLIC_USDC_MINT ||
      "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    priceMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  },
  tDNS: {
    symbol: "tDNS",
    name: "Thaler DNS",
    decimals: 6,
    devnetMint:
      process.env.NEXT_PUBLIC_TDNS_MINT ||
      process.env.NEXT_PUBLIC_STDNS_MINT ||
      "tDNS11111111111111111111111111111111111111",
    priceMint:
      process.env.NEXT_PUBLIC_TDNS_PRICE_MINT ||
      process.env.NEXT_PUBLIC_STDNS_PRICE_MINT ||
      "tDNS11111111111111111111111111111111111111",
  },
};

export const TOKEN_LIST: TokenConfig[] = [
  TOKENS.USDC,
  TOKENS.SOL,
  TOKENS.tDNS,
];

export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getSolscanUrl(address: string, isDevnet = true): string {
  return `https://solscan.io/token/${address}${isDevnet ? "?cluster=devnet" : ""}`;
}
