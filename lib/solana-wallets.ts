export type AllowedWalletId =
  | "solflare"
  | "phantom"
  | "backpack"
  | "squads"
  | "metamask"
  | "jupiter";

export type AllowedWalletConfig = {
  id: AllowedWalletId;
  name: string;
  isMain: boolean;
  badge?: string;
  description?: string;
  installUrl: string;
  iconUrl: string;
  adapterNames: string[];
  detect: () => boolean;
};

export const ALLOWED_WALLETS: AllowedWalletConfig[] = [
  {
    id: "solflare",
    name: "Solflare",
    isMain: true,
    badge: "Recommended",
    description: "Main Solana wallet for web & mobile",
    installUrl: "https://solflare.com",
    iconUrl: "/wallets/solflare.svg",
    adapterNames: ["Solflare", "Solflare Wallet"],
    detect: () => {
      if (typeof window === "undefined") return false;
      return Boolean((window as unknown as { solflare?: { isSolflare?: boolean } }).solflare);
    },
  },
  {
    id: "phantom",
    name: "Phantom",
    isMain: false,
    description: "Popular multi-chain crypto wallet",
    installUrl: "https://phantom.app",
    iconUrl: "/wallets/phantom.svg",
    adapterNames: ["Phantom"],
    detect: () => {
      if (typeof window === "undefined") return false;
      const w = window as unknown as {
        phantom?: { solana?: { isPhantom?: boolean } };
        solana?: { isPhantom?: boolean };
      };
      return Boolean(w.phantom?.solana?.isPhantom || w.solana?.isPhantom);
    },
  },
  {
    id: "backpack",
    name: "Backpack",
    isMain: false,
    description: "xNFT & next-gen Solana wallet",
    installUrl: "https://backpack.app",
    iconUrl: "/wallets/backpack.svg",
    adapterNames: ["Backpack"],
    detect: () => {
      if (typeof window === "undefined") return false;
      return Boolean((window as unknown as { backpack?: unknown }).backpack);
    },
  },
  {
    id: "squads",
    name: "Squads",
    isMain: false,
    description: "Smart contract wallet & multisig",
    installUrl: "https://squads.xyz",
    iconUrl: "/wallets/squads.svg",
    adapterNames: ["Squads", "SquadsX", "Squads Wallet"],
    detect: () => {
      if (typeof window === "undefined") return false;
      return Boolean((window as unknown as { squads?: unknown }).squads);
    },
  },
  {
    id: "metamask",
    name: "MetaMask",
    isMain: false,
    description: "Solana via MetaMask Snap",
    installUrl: "https://metamask.io",
    iconUrl: "/wallets/metamask.svg",
    adapterNames: ["MetaMask", "MetaMask - Solana", "MetaMask Solana"],
    detect: () => {
      if (typeof window === "undefined") return false;
      return Boolean((window as unknown as { ethereum?: { isMetaMask?: boolean } }).ethereum?.isMetaMask);
    },
  },
  {
    id: "jupiter",
    name: "Jupiter",
    isMain: false,
    description: "Solana DeFi & mobile wallet",
    installUrl: "https://jup.ag",
    iconUrl: "/wallets/jupiter.svg",
    adapterNames: ["Jupiter", "Jupiter Wallet", "Jup"],
    detect: () => {
      if (typeof window === "undefined") return false;
      return Boolean(
        (window as unknown as { jupiter?: unknown; jup?: unknown }).jupiter ||
        (window as unknown as { jupiter?: unknown; jup?: unknown }).jup
      );
    },
  },
];

export function isAllowedWallet(walletName: string): boolean {
  const norm = walletName.trim().toLowerCase();
  return ALLOWED_WALLETS.some((w) =>
    w.adapterNames.some((n) => n.toLowerCase() === norm) ||
    norm.includes(w.id) ||
    norm.includes(w.name.toLowerCase())
  );
}

export function getAllowedConfig(walletName: string): AllowedWalletConfig | undefined {
  const norm = walletName.trim().toLowerCase();
  return ALLOWED_WALLETS.find((w) =>
    w.adapterNames.some((n) => n.toLowerCase() === norm) ||
    norm.includes(w.id) ||
    norm.includes(w.name.toLowerCase())
  );
}
