export type StockTicker =
  | "AMDx"
  | "AMZNx"
  | "CRWVx"
  | "GOOGLx"
  | "INTCx"
  | "METAx"
  | "MSFTx"
  | "MUx"
  | "SNDKx"
  | "TSLAx";

export interface StockInfo {
  ticker: StockTicker;
  name: string;
  iconPath: string;
  category: "Semiconductors" | "Tech Mega-cap" | "Cloud & Infrastructure";
  color: string;
  isTokenized?: boolean;
  underlyingSymbol?: string;
  tokenType?: "Tokenized Stock (xStock)" | "Equity";
}

export const STOCKS: Record<StockTicker, StockInfo> = {
  AMDx: {
    ticker: "AMDx",
    name: "Advanced Micro Devices Tokenized Stock",
    iconPath: "/stocks/amd.svg",
    category: "Semiconductors",
    color: "#333333",
    isTokenized: true,
    underlyingSymbol: "AMD",
    tokenType: "Tokenized Stock (xStock)",
  },
  AMZNx: {
    ticker: "AMZNx",
    name: "Amazon Tokenized Stock",
    iconPath: "/stocks/amzn.svg",
    category: "Tech Mega-cap",
    color: "#FF9900",
    isTokenized: true,
    underlyingSymbol: "AMZN",
    tokenType: "Tokenized Stock (xStock)",
  },
  CRWVx: {
    ticker: "CRWVx",
    name: "CoreWeave Tokenized Stock",
    iconPath: "/stocks/crwv.png",
    category: "Cloud & Infrastructure",
    color: "#FFFFFF",
    isTokenized: true,
    underlyingSymbol: "CRWV",
    tokenType: "Tokenized Stock (xStock)",
  },
  GOOGLx: {
    ticker: "GOOGLx",
    name: "Alphabet Tokenized Stock",
    iconPath: "/stocks/googl.svg",
    category: "Tech Mega-cap",
    color: "#4285F4",
    isTokenized: true,
    underlyingSymbol: "GOOGL",
    tokenType: "Tokenized Stock (xStock)",
  },
  INTCx: {
    ticker: "INTCx",
    name: "Intel Tokenized Stock",
    iconPath: "/stocks/intc.svg",
    category: "Semiconductors",
    color: "#0068B5",
    isTokenized: true,
    underlyingSymbol: "INTC",
    tokenType: "Tokenized Stock (xStock)",
  },
  METAx: {
    ticker: "METAx",
    name: "Meta Tokenized Stock",
    iconPath: "/stocks/meta.svg",
    category: "Tech Mega-cap",
    color: "#0668E1",
    isTokenized: true,
    underlyingSymbol: "META",
    tokenType: "Tokenized Stock (xStock)",
  },
  MSFTx: {
    ticker: "MSFTx",
    name: "Microsoft Tokenized Stock",
    iconPath: "/stocks/msft.svg",
    category: "Tech Mega-cap",
    color: "#00A4EF",
    isTokenized: true,
    underlyingSymbol: "MSFT",
    tokenType: "Tokenized Stock (xStock)",
  },
  MUx: {
    ticker: "MUx",
    name: "Micron Tokenized Stock",
    iconPath: "/stocks/mu.svg",
    category: "Semiconductors",
    color: "#0077C8",
    isTokenized: true,
    underlyingSymbol: "MU",
    tokenType: "Tokenized Stock (xStock)",
  },
  SNDKx: {
    ticker: "SNDKx",
    name: "SanDisk Tokenized Stock",
    iconPath: "/stocks/sndk.png",
    category: "Semiconductors",
    color: "#D8232A",
    isTokenized: true,
    underlyingSymbol: "SNDK",
    tokenType: "Tokenized Stock (xStock)",
  },
  TSLAx: {
    ticker: "TSLAx",
    name: "Tesla Tokenized Stock",
    iconPath: "/stocks/tsla.svg",
    category: "Tech Mega-cap",
    color: "#EF0027",
    isTokenized: true,
    underlyingSymbol: "TSLA",
    tokenType: "Tokenized Stock (xStock)",
  },
};

// Aliases for non-x tickers to ensure lookups like "AMD" never default
const stockKeys = Object.keys(STOCKS) as StockTicker[];
for (const key of stockKeys) {
  const plain = key.replace(/x$/i, "");
  if (!STOCKS[plain as StockTicker]) {
    (STOCKS as Record<string, StockInfo>)[plain] = STOCKS[key];
  }
}

export function getStockColor(ticker: string, fallback = "#333333"): string {
  if (!ticker) return fallback;
  const key = ticker as StockTicker;
  if (STOCKS[key]?.color) return STOCKS[key].color;
  const withX = (ticker.endsWith("x") || ticker.endsWith("X") ? ticker : `${ticker}x`) as StockTicker;
  if (STOCKS[withX]?.color) return STOCKS[withX].color;
  const withoutX = ticker.replace(/x$/i, "") as StockTicker;
  if (STOCKS[withoutX]?.color) return STOCKS[withoutX].color;
  return fallback;
}

export function isTokenizedStock(ticker: StockTicker): boolean {
  return STOCKS[ticker]?.isTokenized === true;
}

export function hasTokenizedStock(vault: VaultStrategy): boolean {
  return isTokenizedStock(vault.stock1) || isTokenizedStock(vault.stock2);
}

export interface VaultStrategy {
  id: string;
  stock1: StockTicker;
  stock2: StockTicker;
  targetToken: "tDNS";
  displayName: string;
  pairName: string;
  apy: number;
  tvl: number;
  category: "High Yield" | "Semiconductors" | "Tech Mega-cap" | "Cloud";
  description: string;
}

// Full list of delta-neutral stock pairs extracted from the correlation matrix
export const VAULT_STRATEGIES: VaultStrategy[] = [
  {
    id: "mux-tslax-tdns",
    stock1: "MUx",
    stock2: "TSLAx",
    targetToken: "tDNS",
    displayName: "MUx-TSLAx / tDNS",
    pairName: "MUx-TSLAx",
    apy: 39.4,
    tvl: 5991878.35,
    category: "High Yield",
    description: "Market-neutral strategy across Micron (MUx) and Tesla (TSLAx) tokenized stocks.",
  },
  {
    id: "intcx-tslax-tdns",
    stock1: "INTCx",
    stock2: "TSLAx",
    targetToken: "tDNS",
    displayName: "INTCx-TSLAx / tDNS",
    pairName: "INTCx-TSLAx",
    apy: 37.8,
    tvl: 5010649.02,
    category: "High Yield",
    description: "Delta-neutral semiconductor & EV tokenized pair strategy.",
  },
  {
    id: "metax-tslax-tdns",
    stock1: "METAx",
    stock2: "TSLAx",
    targetToken: "tDNS",
    displayName: "METAx-TSLAx / tDNS",
    pairName: "METAx-TSLAx",
    apy: 37.2,
    tvl: 4520330.12,
    category: "High Yield",
    description: "Automated delta-neutral hedge between Meta (METAx) and Tesla (TSLAx) tokenized equities.",
  },
  {
    id: "sndkx-tslax-tdns",
    stock1: "SNDKx",
    stock2: "TSLAx",
    targetToken: "tDNS",
    displayName: "SNDKx-TSLAx / tDNS",
    pairName: "SNDKx-TSLAx",
    apy: 36.1,
    tvl: 3732635.41,
    category: "High Yield",
    description: "Delta-neutral storage memory and EV tokenized stock spread strategy.",
  },
  {
    id: "amznx-tslax-tdns",
    stock1: "AMZNx",
    stock2: "TSLAx",
    targetToken: "tDNS",
    displayName: "AMZNx-TSLAx / tDNS",
    pairName: "AMZNx-TSLAx",
    apy: 35.1,
    tvl: 3703338.05,
    category: "High Yield",
    description: "E-commerce and clean tech tokenized stock delta-neutral automated yield.",
  },
  {
    id: "amdx-tslax-tdns",
    stock1: "AMDx",
    stock2: "TSLAx",
    targetToken: "tDNS",
    displayName: "AMDx-TSLAx / tDNS",
    pairName: "AMDx-TSLAx",
    apy: 31.8,
    tvl: 3210450.8,
    category: "High Yield",
    description: "High performance compute and robotics tokenized stock delta-neutral pairing.",
  },
  {
    id: "crwvx-tslax-tdns",
    stock1: "CRWVx",
    stock2: "TSLAx",
    targetToken: "tDNS",
    displayName: "CRWVx-TSLAx / tDNS",
    pairName: "CRWVx-TSLAx",
    apy: 30.1,
    tvl: 2840190.25,
    category: "Cloud",
    description: "AI cloud GPU infrastructure pair with Tesla (TSLAx) tokenized stock.",
  },
  {
    id: "googlx-tslax-tdns",
    stock1: "GOOGLx",
    stock2: "TSLAx",
    targetToken: "tDNS",
    displayName: "GOOGLx-TSLAx / tDNS",
    pairName: "GOOGLx-TSLAx",
    apy: 29.0,
    tvl: 2650000.0,
    category: "Tech Mega-cap",
    description: "Alphabet (GOOGLx) and Tesla (TSLAx) delta-neutral yield vault.",
  },
  {
    id: "msftx-tslax-tdns",
    stock1: "MSFTx",
    stock2: "TSLAx",
    targetToken: "tDNS",
    displayName: "MSFTx-TSLAx / tDNS",
    pairName: "MSFTx-TSLAx",
    apy: 28.5,
    tvl: 2420100.5,
    category: "Tech Mega-cap",
    description: "Microsoft (MSFTx) and Tesla (TSLAx) balanced delta-neutral position.",
  },
  {
    id: "intcx-mux-tdns",
    stock1: "INTCx",
    stock2: "MUx",
    targetToken: "tDNS",
    displayName: "INTCx-MUx / tDNS",
    pairName: "INTCx-MUx",
    apy: 27.9,
    tvl: 1980400.0,
    category: "Semiconductors",
    description: "Pure-play semiconductor foundry and Micron (MUx) tokenized memory delta-neutral pair.",
  },
  {
    id: "metax-mux-tdns",
    stock1: "METAx",
    stock2: "MUx",
    targetToken: "tDNS",
    displayName: "METAx-MUx / tDNS",
    pairName: "METAx-MUx",
    apy: 27.4,
    tvl: 1845000.0,
    category: "Semiconductors",
    description: "Social computing and semiconductor tokenized memory vault.",
  },
  {
    id: "mux-sndkx-tdns",
    stock1: "MUx",
    stock2: "SNDKx",
    targetToken: "tDNS",
    displayName: "MUx-SNDKx / tDNS",
    pairName: "MUx-SNDKx",
    apy: 26.3,
    tvl: 1620000.0,
    category: "Semiconductors",
    description: "Dual flash and DRAM tokenized memory delta-neutral hedge.",
  },
  {
    id: "intcx-metax-tdns",
    stock1: "INTCx",
    stock2: "METAx",
    targetToken: "tDNS",
    displayName: "INTCx-METAx / tDNS",
    pairName: "INTCx-METAx",
    apy: 25.7,
    tvl: 1450200.0,
    category: "Semiconductors",
    description: "Processor foundry and hyperscale tech tokenized stock delta-neutral strategy.",
  },
  {
    id: "amznx-mux-tdns",
    stock1: "AMZNx",
    stock2: "MUx",
    targetToken: "tDNS",
    displayName: "AMZNx-MUx / tDNS",
    pairName: "AMZNx-MUx",
    apy: 25.2,
    tvl: 1320000.0,
    category: "Semiconductors",
    description: "Cloud compute buyer and Micron (MUx) memory supplier tokenized pair.",
  },
  {
    id: "amdx-intcx-tdns",
    stock1: "AMDx",
    stock2: "INTCx",
    targetToken: "tDNS",
    displayName: "AMDx-INTCx / tDNS",
    pairName: "AMDx-INTCx",
    apy: 20.3,
    tvl: 1210000.0,
    category: "Semiconductors",
    description: "x86 architecture rival semiconductor tokenized pair strategy.",
  },
  {
    id: "amdx-metax-tdns",
    stock1: "AMDx",
    stock2: "METAx",
    targetToken: "tDNS",
    displayName: "AMDx-METAx / tDNS",
    pairName: "AMDx-METAx",
    apy: 19.7,
    tvl: 1150000.0,
    category: "Semiconductors",
    description: "GPU AI accelerator and open AI model creator tokenized pair.",
  },
  {
    id: "amdx-amznx-tdns",
    stock1: "AMDx",
    stock2: "AMZNx",
    targetToken: "tDNS",
    displayName: "AMDx-AMZNx / tDNS",
    pairName: "AMDx-AMZNx",
    apy: 17.5,
    tvl: 980500.0,
    category: "Tech Mega-cap",
    description: "Server hardware and AWS cloud tokenized stock delta-neutral yield.",
  },
  {
    id: "googlx-intcx-tdns",
    stock1: "GOOGLx",
    stock2: "INTCx",
    targetToken: "tDNS",
    displayName: "GOOGLx-INTCx / tDNS",
    pairName: "GOOGLx-INTCx",
    apy: 17.5,
    tvl: 890000.0,
    category: "Semiconductors",
    description: "Search cloud giant and semiconductor chipmaker tokenized strategy.",
  },
  {
    id: "amznx-msftx-tdns",
    stock1: "AMZNx",
    stock2: "MSFTx",
    targetToken: "tDNS",
    displayName: "AMZNx-MSFTx / tDNS",
    pairName: "AMZNx-MSFTx",
    apy: 14.2,
    tvl: 820000.0,
    category: "Tech Mega-cap",
    description: "AWS vs Azure enterprise cloud tokenized stock delta-neutral spread.",
  },
  {
    id: "amdx-googlx-tdns",
    stock1: "AMDx",
    stock2: "GOOGLx",
    targetToken: "tDNS",
    displayName: "AMDx-GOOGLx / tDNS",
    pairName: "AMDx-GOOGLx",
    apy: 11.5,
    tvl: 750000.0,
    category: "Tech Mega-cap",
    description: "AI chipmaker and search ecosystem tokenized stock delta-neutral vault.",
  },
  {
    id: "amdx-msftx-tdns",
    stock1: "AMDx",
    stock2: "MSFTx",
    targetToken: "tDNS",
    displayName: "AMDx-MSFTx / tDNS",
    pairName: "AMDx-MSFTx",
    apy: 11.0,
    tvl: 680000.0,
    category: "Tech Mega-cap",
    description: "Gaming & compute hardware with Windows & enterprise software tokenized pair.",
  },
  {
    id: "googlx-msftx-tdns",
    stock1: "GOOGLx",
    stock2: "MSFTx",
    targetToken: "tDNS",
    displayName: "GOOGLx-MSFTx / tDNS",
    pairName: "GOOGLx-MSFTx",
    apy: 8.2,
    tvl: 540000.0,
    category: "Tech Mega-cap",
    description: "Dual hyperscaler blue-chip delta-neutral tokenized strategy.",
  },
];

const LEGACY_ID_MAP: Record<string, string> = {
  // Legacy without x
  "mu-tsla-tdns": "mux-tslax-tdns",
  "intc-tsla-tdns": "intcx-tslax-tdns",
  "meta-tsla-tdns": "metax-tslax-tdns",
  "sndk-tsla-tdns": "sndkx-tslax-tdns",
  "amzn-tsla-tdns": "amznx-tslax-tdns",
  "amd-tsla-tdns": "amdx-tslax-tdns",
  "crwv-tsla-tdns": "crwvx-tslax-tdns",
  "googl-tsla-tdns": "googlx-tslax-tdns",
  "msft-tsla-tdns": "msftx-tslax-tdns",
  "intc-mu-tdns": "intcx-mux-tdns",
  "meta-mu-tdns": "metax-mux-tdns",
  "mu-sndk-tdns": "mux-sndkx-tdns",
  "intc-meta-tdns": "intcx-metax-tdns",
  "amzn-mu-tdns": "amznx-mux-tdns",
  "amd-intc-tdns": "amdx-intcx-tdns",
  "amd-meta-tdns": "amdx-metax-tdns",
  "amd-amzn-tdns": "amdx-amznx-tdns",
  "googl-intc-tdns": "googlx-intcx-tdns",
  "amzn-msft-tdns": "amznx-msftx-tdns",
  "amd-googl-tdns": "amdx-googlx-tdns",
  "amd-msft-tdns": "amdx-msftx-tdns",
  "googl-msft-tdns": "googlx-msftx-tdns",
  // Partial x from previous step
  "intc-tslax-tdns": "intcx-tslax-tdns",
  "meta-tslax-tdns": "metax-tslax-tdns",
  "sndk-tslax-tdns": "sndkx-tslax-tdns",
  "amzn-tslax-tdns": "amznx-tslax-tdns",
  "amd-tslax-tdns": "amdx-tslax-tdns",
  "crwv-tslax-tdns": "crwvx-tslax-tdns",
  "googl-tslax-tdns": "googlx-tslax-tdns",
  "msft-tslax-tdns": "msftx-tslax-tdns",
  "intc-mux-tdns": "intcx-mux-tdns",
  "meta-mux-tdns": "metax-mux-tdns",
  "mux-sndk-tdns": "mux-sndkx-tdns",
  "amzn-mux-tdns": "amznx-mux-tdns",
};

export function getVaultById(id: string): VaultStrategy | undefined {
  const normalized = id.toLowerCase();
  const targetId = LEGACY_ID_MAP[normalized] || normalized;
  return VAULT_STRATEGIES.find((v) => v.id.toLowerCase() === targetId);
}

export function getTotalTvl(): number {
  return VAULT_STRATEGIES.reduce((acc, v) => acc + v.tvl, 0);
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
}
