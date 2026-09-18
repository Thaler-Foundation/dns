"use client";

import { useState, useMemo } from "react";
import { VAULT_STRATEGIES, getTotalTvl, formatCurrency } from "@/lib/vaults-data";
import { VaultCard } from "@/components/vaults/vault-card";
import { VaultListRow } from "@/components/vaults/vault-list-row";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LayoutGrid, List, Search, ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type CategoryFilter = "All" | "High Yield" | "Semiconductors" | "Tech Mega-cap" | "Cloud";
type SortOption = "apy" | "tvl";

export default function VaultsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [sortBy, setSortBy] = useState<SortOption>("apy");

  const totalTvl = useMemo(() => getTotalTvl(), []);
  const avgApy = useMemo(() => {
    const sum = VAULT_STRATEGIES.reduce((acc, v) => acc + v.apy, 0);
    return (sum / VAULT_STRATEGIES.length).toFixed(1);
  }, []);

  const filteredVaults = useMemo(() => {
    return VAULT_STRATEGIES.filter((vault) => {
      const matchesCategory =
        category === "All" ? true : vault.category === category;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        vault.displayName.toLowerCase().includes(q) ||
        vault.stock1.toLowerCase().includes(q) ||
        vault.stock2.toLowerCase().includes(q) ||
        vault.pairName.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "apy") return b.apy - a.apy;
      return b.tvl - a.tvl;
    });
  }, [category, search, sortBy]);

  return (
    <div className="relative flex min-h-dvh flex-col bg-background selection:bg-primary/20">
      <SiteHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative flex-1 px-4 py-8 sm:py-10"
      >
        <div className="relative z-10 mx-auto w-full max-w-4xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-border">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-sans">
                Smart Vaults
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg">
                Automated delta-neutral equity yield on Solana. Dual long/short hedging
                with 100% tDNS collateral.
              </p>
            </div>

            <div className="flex items-center gap-5 shrink-0 self-start sm:self-end">
              <div>
                <span className="text-[11px] text-muted-foreground block">Total Value Locked</span>
                <span className="text-xl font-bold font-mono text-foreground">
                  {formatCurrency(totalTvl)}
                </span>
              </div>
              <div className="border-l border-border pl-5">
                <span className="text-[11px] text-muted-foreground block">Avg. APY</span>
                <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {avgApy}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1">
              {(["All", "High Yield", "Semiconductors", "Tech Mega-cap", "Cloud"] as CategoryFilter[]).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-sm transition-colors",
                      category === cat
                        ? "bg-foreground text-background font-semibold"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search pair or stock..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-sm border border-border bg-card placeholder:text-muted-foreground/60 text-foreground outline-none focus:border-primary transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={() => setSortBy((prev) => (prev === "apy" ? "tvl" : "apy"))}
                className="h-8 px-2.5 flex items-center gap-1.5 rounded-sm border border-border bg-card text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
                title={`Sorting by ${sortBy.toUpperCase()}`}
              >
                <ArrowDownUp className="size-3.5" />
                <span className="font-mono uppercase text-[11px]">{sortBy}</span>
              </button>

              <div className="flex items-center border border-border rounded-sm p-0.5 bg-card shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1 rounded-sm text-xs transition-colors",
                    viewMode === "grid"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1 rounded-sm text-xs transition-colors",
                    viewMode === "list"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="List view"
                >
                  <List className="size-3.5" />
                </button>
              </div>
            </div>
          </div>

          {filteredVaults.length === 0 ? (
            <div className="rounded-sm border border-border bg-card p-10 text-center">
              <p className="text-sm font-semibold text-foreground">No vaults found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search criteria or category filter.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredVaults.map((vault) => (
                <VaultCard key={vault.id} vault={vault} />
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-border bg-card overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-[11px] font-mono uppercase text-muted-foreground">
                    <th className="py-2.5 pl-4 pr-3 font-medium">Vault Strategy</th>
                    <th className="py-2.5 px-3 font-medium hidden sm:table-cell">Composition</th>
                    <th className="py-2.5 px-3 font-medium text-right">TVL</th>
                    <th className="py-2.5 px-3 font-medium text-center hidden md:table-cell">Delta Beta</th>
                    <th className="py-2.5 px-3 font-medium text-right">Net APY</th>
                    <th className="py-2.5 pl-3 pr-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVaults.map((vault) => (
                    <VaultListRow key={vault.id} vault={vault} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
