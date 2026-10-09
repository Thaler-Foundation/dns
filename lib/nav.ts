import { ArrowDownUp, Layers, Wallet, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Swap", icon: ArrowDownUp, isActive: (p) => p === "/" },
  { href: "/vaults", label: "Delta Vaults", icon: Layers, isActive: (p) => p.startsWith("/vaults") },
  { href: "/positions", label: "My Positions", icon: Wallet, isActive: (p) => p.startsWith("/positions") },
];
