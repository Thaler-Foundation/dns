// Sends DNS instructions as one transaction through the connected wallet adapter and waits for confirmation, throwing with the on-chain error when the transaction lands but fails.
"use client";

import { useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import type { Instruction } from "@solana/kit";
import { toWeb3Instruction } from "@/lib/dns/tx";

export function useDnsSend() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  return useCallback(
    async (ixs: Instruction[]): Promise<string> => {
      if (!publicKey) throw new Error("Connect a wallet first");
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      const tx = new Transaction({ feePayer: publicKey, blockhash, lastValidBlockHeight });
      for (const ix of ixs) tx.add(toWeb3Instruction(ix));
      const signature = await sendTransaction(tx, connection);
      const result = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed",
      );
      if (result.value.err) {
        throw new Error(`Transaction ${signature} failed: ${JSON.stringify(result.value.err)}`);
      }
      return signature;
    },
    [connection, publicKey, sendTransaction],
  );
}
