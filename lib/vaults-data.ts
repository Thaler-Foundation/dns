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
    category: "Semiconductors",
    description: "Cloud compute buyer and Micron (MUx) memory supplier tokenized pair.",
  },
  {
    id: "intcx-sndkx-tdns",
    stock1: "INTCx",
    stock2: "SNDKx",
    targetToken: "tDNS",
    displayName: "INTCx-SNDKx / tDNS",
    pairName: "INTCx-SNDKx",
    category: "Semiconductors",
    description: "Delta-neutral yield strategy pairing Intel (INTCx) and SanDisk (SNDKx) tokenized stocks.",
  },
  {
    id: "metax-sndkx-tdns",
    stock1: "METAx",
    stock2: "SNDKx",
    targetToken: "tDNS",
    displayName: "METAx-SNDKx / tDNS",
    pairName: "METAx-SNDKx",
    category: "Semiconductors",
    description: "Delta-neutral yield strategy pairing Meta (METAx) and SanDisk (SNDKx) tokenized stocks.",
  },
  {
    id: "amznx-intcx-tdns",
    stock1: "AMZNx",
    stock2: "INTCx",
    targetToken: "tDNS",
    displayName: "AMZNx-INTCx / tDNS",
    pairName: "AMZNx-INTCx",
    category: "Semiconductors",
    description: "Delta-neutral yield strategy pairing Amazon (AMZNx) and Intel (INTCx) tokenized stocks.",
  },
  {
    id: "amznx-metax-tdns",
    stock1: "AMZNx",
    stock2: "METAx",
    targetToken: "tDNS",
    displayName: "AMZNx-METAx / tDNS",
    pairName: "AMZNx-METAx",
    category: "Tech Mega-cap",
    description: "Delta-neutral yield strategy pairing Amazon (AMZNx) and Meta (METAx) tokenized stocks.",
  },
  {
    id: "amdx-mux-tdns",
    stock1: "AMDx",
    stock2: "MUx",
    targetToken: "tDNS",
    displayName: "AMDx-MUx / tDNS",
    pairName: "AMDx-MUx",
    category: "Semiconductors",
    description: "Delta-neutral yield strategy pairing Advanced Micro Devices (AMDx) and Micron (MUx) tokenized stocks.",
  },
  {
    id: "amznx-sndkx-tdns",
    stock1: "AMZNx",
    stock2: "SNDKx",
    targetToken: "tDNS",
    displayName: "AMZNx-SNDKx / tDNS",
    pairName: "AMZNx-SNDKx",
    category: "Semiconductors",
    description: "Delta-neutral yield strategy pairing Amazon (AMZNx) and SanDisk (SNDKx) tokenized stocks.",
  },
  {
    id: "amdx-intcx-tdns",
    stock1: "AMDx",
    stock2: "INTCx",
    targetToken: "tDNS",
    displayName: "AMDx-INTCx / tDNS",
    pairName: "AMDx-INTCx",
    category: "Semiconductors",
    description: "x86 architecture rival semiconductor tokenized pair strategy.",
  },
  {
    id: "crwvx-mux-tdns",
    stock1: "CRWVx",
    stock2: "MUx",
    targetToken: "tDNS",
    displayName: "CRWVx-MUx / tDNS",
    pairName: "CRWVx-MUx",
    category: "Cloud",
    description: "Delta-neutral yield strategy pairing CoreWeave (CRWVx) and Micron (MUx) tokenized stocks.",
  },
  {
    id: "amdx-metax-tdns",
    stock1: "AMDx",
    stock2: "METAx",
    targetToken: "tDNS",
    displayName: "AMDx-METAx / tDNS",
    pairName: "AMDx-METAx",
    category: "Semiconductors",
    description: "GPU AI accelerator and open AI model creator tokenized pair.",
  },
  {
    id: "googlx-mux-tdns",
    stock1: "GOOGLx",
    stock2: "MUx",
    targetToken: "tDNS",
    displayName: "GOOGLx-MUx / tDNS",
    pairName: "GOOGLx-MUx",
    category: "Semiconductors",
    description: "Delta-neutral yield strategy pairing Alphabet (GOOGLx) and Micron (MUx) tokenized stocks.",
  },
  {
    id: "amdx-sndkx-tdns",
    stock1: "AMDx",
    stock2: "SNDKx",
    targetToken: "tDNS",
    displayName: "AMDx-SNDKx / tDNS",
    pairName: "AMDx-SNDKx",
    category: "Semiconductors",
    description: "Delta-neutral yield strategy pairing Advanced Micro Devices (AMDx) and SanDisk (SNDKx) tokenized stocks.",
  },
  {
    id: "crwvx-intcx-tdns",
    stock1: "CRWVx",
    stock2: "INTCx",
    targetToken: "tDNS",
    displayName: "CRWVx-INTCx / tDNS",
    pairName: "CRWVx-INTCx",
    category: "Cloud",
    description: "Delta-neutral yield strategy pairing CoreWeave (CRWVx) and Intel (INTCx) tokenized stocks.",
  },
  {
    id: "msftx-mux-tdns",
    stock1: "MSFTx",
    stock2: "MUx",
    targetToken: "tDNS",
    displayName: "MSFTx-MUx / tDNS",
    pairName: "MSFTx-MUx",
    category: "Semiconductors",
    description: "Delta-neutral yield strategy pairing Microsoft (MSFTx) and Micron (MUx) tokenized stocks.",
  },
  {
    id: "crwvx-metax-tdns",
    stock1: "CRWVx",
    stock2: "METAx",
    targetToken: "tDNS",
    displayName: "CRWVx-METAx / tDNS",
    pairName: "CRWVx-METAx",
    category: "Cloud",
    description: "Delta-neutral yield strategy pairing CoreWeave (CRWVx) and Meta (METAx) tokenized stocks.",
  },
  {
    id: "amdx-amznx-tdns",
    stock1: "AMDx",
    stock2: "AMZNx",
    targetToken: "tDNS",
    displayName: "AMDx-AMZNx / tDNS",
    pairName: "AMDx-AMZNx",
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
    category: "Semiconductors",
    description: "Search cloud giant and semiconductor chipmaker tokenized strategy.",
  },
  {
    id: "crwvx-sndkx-tdns",
    stock1: "CRWVx",
    stock2: "SNDKx",
    targetToken: "tDNS",
    displayName: "CRWVx-SNDKx / tDNS",
    pairName: "CRWVx-SNDKx",
    category: "Cloud",
    description: "Delta-neutral yield strategy pairing CoreWeave (CRWVx) and SanDisk (SNDKx) tokenized stocks.",
  },
  {
    id: "googlx-metax-tdns",
    stock1: "GOOGLx",
    stock2: "METAx",
    targetToken: "tDNS",
    displayName: "GOOGLx-METAx / tDNS",
    pairName: "GOOGLx-METAx",
    category: "Tech Mega-cap",
    description: "Delta-neutral yield strategy pairing Alphabet (GOOGLx) and Meta (METAx) tokenized stocks.",
  },
  {
    id: "intcx-msftx-tdns",
    stock1: "INTCx",
    stock2: "MSFTx",
    targetToken: "tDNS",
    displayName: "INTCx-MSFTx / tDNS",
    pairName: "INTCx-MSFTx",
    category: "Semiconductors",
    description: "Delta-neutral yield strategy pairing Intel (INTCx) and Microsoft (MSFTx) tokenized stocks.",
  },
  {
    id: "metax-msftx-tdns",
    stock1: "METAx",
    stock2: "MSFTx",
    targetToken: "tDNS",
    displayName: "METAx-MSFTx / tDNS",
    pairName: "METAx-MSFTx",
    category: "Tech Mega-cap",
    description: "Delta-neutral yield strategy pairing Meta (METAx) and Microsoft (MSFTx) tokenized stocks.",
  },
  {
    id: "amznx-crwvx-tdns",
    stock1: "AMZNx",
    stock2: "CRWVx",
    targetToken: "tDNS",
    displayName: "AMZNx-CRWVx / tDNS",
    pairName: "AMZNx-CRWVx",
    category: "Cloud",
    description: "Delta-neutral yield strategy pairing Amazon (AMZNx) and CoreWeave (CRWVx) tokenized stocks.",
  },
  {
    id: "googlx-sndkx-tdns",
    stock1: "GOOGLx",
    stock2: "SNDKx",
    targetToken: "tDNS",
    displayName: "GOOGLx-SNDKx / tDNS",
    pairName: "GOOGLx-SNDKx",
    category: "Semiconductors",
    description: "Delta-neutral yield strategy pairing Alphabet (GOOGLx) and SanDisk (SNDKx) tokenized stocks.",
  },
  {
    id: "msftx-sndkx-tdns",
    stock1: "MSFTx",
    stock2: "SNDKx",
    targetToken: "tDNS",
    displayName: "MSFTx-SNDKx / tDNS",
    pairName: "MSFTx-SNDKx",
    category: "Semiconductors",
    description: "Delta-neutral yield strategy pairing Microsoft (MSFTx) and SanDisk (SNDKx) tokenized stocks.",
  },
  {
    id: "amznx-googlx-tdns",
    stock1: "AMZNx",
    stock2: "GOOGLx",
    targetToken: "tDNS",
    displayName: "AMZNx-GOOGLx / tDNS",
    pairName: "AMZNx-GOOGLx",
    category: "Tech Mega-cap",
    description: "Delta-neutral yield strategy pairing Amazon (AMZNx) and Alphabet (GOOGLx) tokenized stocks.",
  },
  {
    id: "amznx-msftx-tdns",
    stock1: "AMZNx",
    stock2: "MSFTx",
    targetToken: "tDNS",
    displayName: "AMZNx-MSFTx / tDNS",
    pairName: "AMZNx-MSFTx",
    category: "Tech Mega-cap",
    description: "AWS vs Azure enterprise cloud tokenized stock delta-neutral spread.",
  },
  {
    id: "amdx-crwvx-tdns",
    stock1: "AMDx",
    stock2: "CRWVx",
    targetToken: "tDNS",
    displayName: "AMDx-CRWVx / tDNS",
    pairName: "AMDx-CRWVx",
    category: "Cloud",
    description: "Delta-neutral yield strategy pairing Advanced Micro Devices (AMDx) and CoreWeave (CRWVx) tokenized stocks.",
  },
  {
    id: "amdx-googlx-tdns",
    stock1: "AMDx",
    stock2: "GOOGLx",
    targetToken: "tDNS",
    displayName: "AMDx-GOOGLx / tDNS",
    pairName: "AMDx-GOOGLx",
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
    category: "Tech Mega-cap",
    description: "Gaming & compute hardware with Windows & enterprise software tokenized pair.",
  },
  {
    id: "crwvx-googlx-tdns",
    stock1: "CRWVx",
    stock2: "GOOGLx",
    targetToken: "tDNS",
    displayName: "CRWVx-GOOGLx / tDNS",
    pairName: "CRWVx-GOOGLx",
    category: "Cloud",
    description: "Delta-neutral yield strategy pairing CoreWeave (CRWVx) and Alphabet (GOOGLx) tokenized stocks.",
  },
  {
    id: "crwvx-msftx-tdns",
    stock1: "CRWVx",
    stock2: "MSFTx",
    targetToken: "tDNS",
    displayName: "CRWVx-MSFTx / tDNS",
    pairName: "CRWVx-MSFTx",
    category: "Cloud",
    description: "Delta-neutral yield strategy pairing CoreWeave (CRWVx) and Microsoft (MSFTx) tokenized stocks.",
  },
  {
    id: "googlx-msftx-tdns",
    stock1: "GOOGLx",
    stock2: "MSFTx",
    targetToken: "tDNS",
    displayName: "GOOGLx-MSFTx / tDNS",
    pairName: "GOOGLx-MSFTx",
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
