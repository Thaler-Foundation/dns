// Polls the DNS service's xStock marks every 8 s while enabled and the calling page is mounted (lib/dns/marks).
"use client";

import { useEffect, useState } from "react";
import { DNS_CONFIG } from "@/lib/dns/config";
import { startStockMarksPolling, type StockMarksView } from "@/lib/dns/marks";

export function useStockMarks(enabled: boolean): StockMarksView {
  const [view, setView] = useState<StockMarksView>({ snapshot: null, nowMs: 0, moves: {} });
  useEffect(() => {
    const apiUrl = DNS_CONFIG.apiUrl;
    if (!enabled || !apiUrl) return;
    return startStockMarksPolling({
      apiUrl,
      fetchJson: async (url) => {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      },
      now: Date.now,
      onUpdate: setView,
      every: (fn, ms) => {
        const id = setInterval(fn, ms);
        return () => clearInterval(id);
      },
    });
  }, [enabled]);
  return view;
}
