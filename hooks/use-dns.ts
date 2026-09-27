// One shared, polled devnet DNS snapshot for the whole app (lib/dns/load) plus the connected wallet's stDNS positions (lib/dns/positions) and pending stake requests (lib/dns/stake); refresh() reloads all of them for every consumer.
"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { address, getBase58Decoder } from "@solana/kit";
import { PROGRAM_ADDRESS } from "@/lib/dns/client";
import { DNS_CONFIG } from "@/lib/dns/config";
import { loadDns, type DnsSnapshot } from "@/lib/dns/load";
import { loadPositions, type DnsPosition } from "@/lib/dns/positions";
import {
  STAKE_REQUEST_DISCRIMINATOR,
  STAKE_REQUEST_USER_OFFSET,
  loadPendingRequests,
  type DnsPendingRequest,
} from "@/lib/dns/stake";
import { VAULT_STRATEGIES } from "@/lib/vaults-data";

export type { DnsVaultInfo } from "@/lib/dns/load";
export type { DnsPosition } from "@/lib/dns/positions";
export type { DnsPendingRequest } from "@/lib/dns/stake";

export type DnsState = DnsSnapshot & {
  loading: boolean;
  positions: DnsPosition[];
  positionsLoaded: boolean;
  pending: DnsPendingRequest[];
  refresh: () => Promise<void>;
};

const POLL_MS = 20_000;

const empty: DnsState = {
  mints: null,
  vaults: {},
  problems: DNS_CONFIG.problems,
  loading: true,
  positions: [],
  positionsLoaded: false,
  pending: [],
  refresh: async () => {},
};

const DnsContext = createContext<DnsState>(empty);

export function DnsProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const owner = publicKey ? publicKey.toBase58() : null;
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<DnsSnapshot>({ mints: null, vaults: {}, problems: DNS_CONFIG.problems });
  const [positions, setPositions] = useState<DnsPosition[]>([]);
  const [positionsLoaded, setPositionsLoaded] = useState(false);
  const [pending, setPending] = useState<{ owner: string | null; list: DnsPendingRequest[] }>({ owner: null, list: [] });
  const ownerRef = useRef(owner);
  useEffect(() => {
    ownerRef.current = owner;
  }, [owner]);

  const refresh = useCallback(async () => {
    const next = await loadDns(
      DNS_CONFIG,
      VAULT_STRATEGIES,
      async (a) => {
        const info = await connection.getAccountInfo(new PublicKey(a), "confirmed");
        return info ? new Uint8Array(info.data) : null;
      },
      async (url) => {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      },
    );
    setSnapshot(next);
    setLoading(false);
    if (!owner) {
      setPositions([]);
      setPositionsLoaded(false);
      setPending({ owner: null, list: [] });
      return;
    }
    const getMultiple = async (addrs: ReturnType<typeof address>[]) => {
      const infos = await connection.getMultipleAccountsInfo(addrs.map((a) => new PublicKey(a)), "confirmed");
      return infos.map((i) => (i ? new Uint8Array(i.data) : null));
    };
    try {
      const list = await loadPositions(address(owner), next.vaults, getMultiple);
      if (ownerRef.current !== owner) return;
      setPositions(list);
      setPositionsLoaded(true);
    } catch {
      if (ownerRef.current === owner) setPositionsLoaded(false);
    }
    try {
      const requests = await loadPendingRequests(
        address(owner),
        next.vaults,
        async (o) => {
          const found = await connection.getProgramAccounts(new PublicKey(PROGRAM_ADDRESS), {
            commitment: "confirmed",
            filters: [
              { memcmp: { offset: 0, bytes: getBase58Decoder().decode(Uint8Array.of(STAKE_REQUEST_DISCRIMINATOR)) } },
              { memcmp: { offset: STAKE_REQUEST_USER_OFFSET, bytes: o } },
            ],
          });
          return found.map((f) => ({ address: address(f.pubkey.toBase58()), data: new Uint8Array(f.account.data) }));
        },
        getMultiple,
      );
      if (ownerRef.current === owner) setPending({ owner, list: requests });
    } catch {
      return;
    }
  }, [connection, owner]);

  useEffect(() => {
    let active = true;
    const run = () => {
      if (active) void refresh();
    };
    run();
    const id = setInterval(run, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [refresh]);

  return createElement(
    DnsContext.Provider,
    { value: { ...snapshot, loading, positions, positionsLoaded, pending: pending.owner === owner ? pending.list : [], refresh } },
    children,
  );
}

export function useDns(): DnsState {
  return useContext(DnsContext);
}
