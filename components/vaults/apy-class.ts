// Text colour classes for a printed APY: green from zero up, red below zero, the page's text colour for n/a.
import { apyTone } from "@/lib/dns/stats";

export function apyClass(apy: number | null): string {
  const tone = apyTone(apy);
  return tone === "up" ? "text-emerald-600 dark:text-emerald-400" : tone === "down" ? "text-rose-600 dark:text-rose-400" : "text-foreground";
}
