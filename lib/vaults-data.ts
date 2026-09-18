export type StockTicker =
  | "AMD"
  | "AMZN"
  | "CRWV"
  | "GOOGL"
  | "INTC"
  | "META"
  | "MSFT"
  | "MU"
  | "SNDK"
  | "TSLA";

export interface StockInfo {
  ticker: StockTicker;
  name: string;
  iconPath: string;
  category: "Semiconductors" | "Tech Mega-cap" | "Cloud & Infrastructure";
}

export const STOCKS: Record<StockTicker, StockInfo> = {
  AMD: {
    ticker: "AMD",
    name: "Advanced Micro Devices",
    iconPath: "/stocks/amd.svg",
    category: "Semiconductors",
  },
  AMZN: {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    iconPath: "/stocks/amzn.svg",
    category: "Tech Mega-cap",
  },
  CRWV: {
    ticker: "CRWV",
    name: "CoreWeave",
    iconPath: "/stocks/crwv.png",
    category: "Cloud & Infrastructure",
  },
  GOOGL: {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    iconPath: "/stocks/googl.svg",
    category: "Tech Mega-cap",
  },
  INTC: {
    ticker: "INTC",
    name: "Intel Corporation",
    iconPath: "/stocks/intc.svg",
    category: "Semiconductors",
  },
  META: {
    ticker: "META",
    name: "Meta Platforms Inc.",
    iconPath: "/stocks/meta.svg",
    category: "Tech Mega-cap",
  },
  MSFT: {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    iconPath: "/stocks/msft.svg",
    category: "Tech Mega-cap",
  },
  MU: {
    ticker: "MU",
    name: "Micron Technology",
    iconPath: "/stocks/mu.svg",
    category: "Semiconductors",
  },
  SNDK: {
    ticker: "SNDK",
    name: "SanDisk Corporation",
    iconPath: "/stocks/sndk.png",
    category: "Semiconductors",
  },
  TSLA: {
    ticker: "TSLA",
    name: "Tesla Inc.",
    iconPath: "/stocks/tsla.svg",
    category: "Tech Mega-cap",
  },
};

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
    id: "mu-tsla-tdns",
    stock1: "MU",
    stock2: "TSLA",
    targetToken: "tDNS",
    displayName: "MU-TSLA / tDNS",
    pairName: "MU-TSLA",
    apy: 39.4,
    tvl: 5991878.35,
    category: "High Yield",
    description: "Dual long and short market-neutral strategy across Micron Technology and Tesla.",
  },
  {
    id: "intc-tsla-tdns",
    stock1: "INTC",
    stock2: "TSLA",
    targetToken: "tDNS",
    displayName: "INTC-TSLA / tDNS",
    pairName: "INTC-TSLA",
    apy: 37.8,
    tvl: 5010649.02,
    category: "High Yield",
    description: "Delta-neutral semiconductor & EV pair strategy.",
  },
  {
    id: "meta-tsla-tdns",
    stock1: "META",
    stock2: "TSLA",
    targetToken: "tDNS",
    displayName: "META-TSLA / tDNS",
    pairName: "META-TSLA",
    apy: 37.2,
    tvl: 4520330.12,
    category: "High Yield",
    description: "Automated delta-neutral hedge between Meta and Tesla.",
  },
  {
    id: "sndk-tsla-tdns",
    stock1: "SNDK",
    stock2: "TSLA",
    targetToken: "tDNS",
    displayName: "SNDK-TSLA / tDNS",
    pairName: "SNDK-TSLA",
    apy: 36.1,
    tvl: 3732635.41,
    category: "High Yield",
    description: "Delta-neutral storage memory and EV spread strategy.",
  },
  {
    id: "amzn-tsla-tdns",
    stock1: "AMZN",
    stock2: "TSLA",
    targetToken: "tDNS",
    displayName: "AMZN-TSLA / tDNS",
    pairName: "AMZN-TSLA",
    apy: 35.1,
    tvl: 3703338.05,
    category: "High Yield",
    description: "E-commerce and clean tech delta-neutral automated yield.",
  },
  {
    id: "amd-tsla-tdns",
    stock1: "AMD",
    stock2: "TSLA",
    targetToken: "tDNS",
    displayName: "AMD-TSLA / tDNS",
    pairName: "AMD-TSLA",
    apy: 31.8,
    tvl: 3210450.8,
    category: "High Yield",
    description: "High performance compute and robotics delta-neutral pairing.",
  },
  {
    id: "crwv-tsla-tdns",
    stock1: "CRWV",
    stock2: "TSLA",
    targetToken: "tDNS",
    displayName: "CRWV-TSLA / tDNS",
    pairName: "CRWV-TSLA",
    apy: 30.1,
    tvl: 2840190.25,
    category: "Cloud",
    description: "AI cloud GPU infrastructure pair with Tesla.",
  },
  {
    id: "googl-tsla-tdns",
    stock1: "GOOGL",
    stock2: "TSLA",
    targetToken: "tDNS",
    displayName: "GOOGL-TSLA / tDNS",
    pairName: "GOOGL-TSLA",
    apy: 29.0,
    tvl: 2650000.0,
    category: "Tech Mega-cap",
    description: "Alphabet and Tesla delta-neutral yield vault.",
  },
  {
    id: "msft-tsla-tdns",
    stock1: "MSFT",
    stock2: "TSLA",
    targetToken: "tDNS",
    displayName: "MSFT-TSLA / tDNS",
    pairName: "MSFT-TSLA",
    apy: 28.5,
    tvl: 2420100.5,
    category: "Tech Mega-cap",
    description: "Microsoft and Tesla balanced delta-neutral position.",
  },
  {
    id: "intc-mu-tdns",
    stock1: "INTC",
    stock2: "MU",
    targetToken: "tDNS",
    displayName: "INTC-MU / tDNS",
    pairName: "INTC-MU",
    apy: 27.9,
    tvl: 1980400.0,
    category: "Semiconductors",
    description: "Pure-play semiconductor foundry and memory delta-neutral pair.",
  },
  {
    id: "meta-mu-tdns",
    stock1: "META",
    stock2: "MU",
    targetToken: "tDNS",
    displayName: "META-MU / tDNS",
    pairName: "META-MU",
    apy: 27.4,
    tvl: 1845000.0,
    category: "Semiconductors",
    description: "Social computing and semiconductor memory vault.",
  },
  {
    id: "mu-sndk-tdns",
    stock1: "MU",
    stock2: "SNDK",
    targetToken: "tDNS",
    displayName: "MU-SNDK / tDNS",
    pairName: "MU-SNDK",
    apy: 26.3,
    tvl: 1620000.0,
    category: "Semiconductors",
    description: "Dual flash and DRAM memory delta-neutral hedge.",
  },
  {
    id: "intc-meta-tdns",
    stock1: "INTC",
    stock2: "META",
    targetToken: "tDNS",
    displayName: "INTC-META / tDNS",
    pairName: "INTC-META",
    apy: 25.7,
    tvl: 1450200.0,
    category: "Semiconductors",
    description: "Processor foundry and hyperscale tech delta-neutral strategy.",
  },
  {
    id: "amzn-mu-tdns",
    stock1: "AMZN",
    stock2: "MU",
    targetToken: "tDNS",
    displayName: "AMZN-MU / tDNS",
    pairName: "AMZN-MU",
    apy: 25.2,
    tvl: 1320000.0,
    category: "Semiconductors",
    description: "Cloud compute buyer and memory supplier delta-neutral pair.",
  },
  {
    id: "amd-intc-tdns",
    stock1: "AMD",
    stock2: "INTC",
    targetToken: "tDNS",
    displayName: "AMD-INTC / tDNS",
    pairName: "AMD-INTC",
    apy: 20.3,
    tvl: 1210000.0,
    category: "Semiconductors",
    description: "x86 architecture rival semiconductor pair strategy.",
  },
  {
    id: "amd-meta-tdns",
    stock1: "AMD",
    stock2: "META",
    targetToken: "tDNS",
    displayName: "AMD-META / tDNS",
    pairName: "AMD-META",
    apy: 19.7,
    tvl: 1150000.0,
    category: "Semiconductors",
    description: "GPU AI accelerator and open AI model creator pair.",
  },
  {
    id: "amd-amzn-tdns",
    stock1: "AMD",
    stock2: "AMZN",
    targetToken: "tDNS",
    displayName: "AMD-AMZN / tDNS",
    pairName: "AMD-AMZN",
    apy: 17.5,
    tvl: 980500.0,
    category: "Tech Mega-cap",
    description: "Server hardware and AWS cloud delta-neutral yield.",
  },
  {
    id: "googl-intc-tdns",
    stock1: "GOOGL",
    stock2: "INTC",
    targetToken: "tDNS",
    displayName: "GOOGL-INTC / tDNS",
    pairName: "GOOGL-INTC",
    apy: 17.5,
    tvl: 890000.0,
    category: "Semiconductors",
    description: "Search cloud giant and semiconductor chipmaker strategy.",
  },
  {
    id: "amzn-msft-tdns",
    stock1: "AMZN",
    stock2: "MSFT",
    targetToken: "tDNS",
    displayName: "AMZN-MSFT / tDNS",
    pairName: "AMZN-MSFT",
    apy: 14.2,
    tvl: 820000.0,
    category: "Tech Mega-cap",
    description: "AWS vs Azure enterprise cloud delta-neutral spread.",
  },
  {
    id: "amd-googl-tdns",
    stock1: "AMD",
    stock2: "GOOGL",
    targetToken: "tDNS",
    displayName: "AMD-GOOGL / tDNS",
    pairName: "AMD-GOOGL",
    apy: 11.5,
    tvl: 750000.0,
    category: "Tech Mega-cap",
    description: "AI chipmaker and search ecosystem delta-neutral vault.",
  },
  {
    id: "amd-msft-tdns",
    stock1: "AMD",
    stock2: "MSFT",
    targetToken: "tDNS",
    displayName: "AMD-MSFT / tDNS",
    pairName: "AMD-MSFT",
    apy: 11.0,
    tvl: 680000.0,
    category: "Tech Mega-cap",
    description: "Gaming & compute hardware with Windows & enterprise software.",
  },
  {
    id: "googl-msft-tdns",
    stock1: "GOOGL",
    stock2: "MSFT",
    targetToken: "tDNS",
    displayName: "GOOGL-MSFT / tDNS",
    pairName: "GOOGL-MSFT",
    apy: 8.2,
    tvl: 540000.0,
    category: "Tech Mega-cap",
    description: "Dual hyperscaler blue-chip delta-neutral strategy.",
  },
];

export function getVaultById(id: string): VaultStrategy | undefined {
  return VAULT_STRATEGIES.find((v) => v.id.toLowerCase() === id.toLowerCase());
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
