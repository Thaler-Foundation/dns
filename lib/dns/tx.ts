// Builds the four user instructions (mint_tdns, burn_tdns, request_stake, redeem) with the generated client, each preceded by an idempotent create of the user's receiving token account, and converts them to web3.js for the wallet adapter.
import {
  AccountRole,
  address,
  getAddressEncoder,
  getProgramDerivedAddress,
  type Address,
  type Instruction,
} from "@solana/kit";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { ThalerDnsClient } from "@/lib/dns/client";

export const TOKEN_PROGRAM = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const TOKEN_2022_PROGRAM = address("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
export const ATA_PROGRAM = address("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const SYSTEM_PROGRAM = address("11111111111111111111111111111111");

const client = new ThalerDnsClient();

export async function findAta(owner: Address, mint: Address, tokenProgram: Address): Promise<Address> {
  const enc = getAddressEncoder();
  const [ata] = await getProgramDerivedAddress({
    programAddress: ATA_PROGRAM,
    seeds: [enc.encode(owner), enc.encode(tokenProgram), enc.encode(mint)],
  });
  return ata;
}

export function createAtaIdempotent(
  payer: Address,
  ata: Address,
  owner: Address,
  mint: Address,
  tokenProgram: Address,
): Instruction {
  return {
    programAddress: ATA_PROGRAM,
    accounts: [
      { address: payer, role: AccountRole.WRITABLE_SIGNER },
      { address: ata, role: AccountRole.WRITABLE },
      { address: owner, role: AccountRole.READONLY },
      { address: mint, role: AccountRole.READONLY },
      { address: SYSTEM_PROGRAM, role: AccountRole.READONLY },
      { address: tokenProgram, role: AccountRole.READONLY },
    ],
    data: new Uint8Array([1]),
  };
}

export type DnsMints = { usdcMint: Address; tdnsMint: Address; poolUsdc: Address };

export async function mintTdnsIxs(user: Address, m: DnsMints, tdnsAtoms: bigint): Promise<Instruction[]> {
  const userUsdc = await findAta(user, m.usdcMint, TOKEN_PROGRAM);
  const userTdns = await findAta(user, m.tdnsMint, TOKEN_PROGRAM);
  return [
    createAtaIdempotent(user, userTdns, user, m.tdnsMint, TOKEN_PROGRAM),
    await client.createMintTdnsInstruction({
      user,
      usdcMint: m.usdcMint,
      tdnsMint: m.tdnsMint,
      userUsdc,
      poolUsdc: m.poolUsdc,
      userTdns,
      amount: tdnsAtoms,
    }),
  ];
}

export async function burnTdnsIxs(user: Address, m: DnsMints, tdnsAtoms: bigint): Promise<Instruction[]> {
  const userUsdc = await findAta(user, m.usdcMint, TOKEN_PROGRAM);
  const userTdns = await findAta(user, m.tdnsMint, TOKEN_PROGRAM);
  return [
    createAtaIdempotent(user, userUsdc, user, m.usdcMint, TOKEN_PROGRAM),
    await client.createBurnTdnsInstruction({
      user,
      usdcMint: m.usdcMint,
      tdnsMint: m.tdnsMint,
      userUsdc,
      poolUsdc: m.poolUsdc,
      userTdns,
      amount: tdnsAtoms,
    }),
  ];
}

export async function requestStakeIxs(
  user: Address,
  m: DnsMints,
  vault: Address,
  stdnsMint: Address,
  vaultUsdc: Address,
  groupId: bigint,
  tdnsAtoms: bigint,
): Promise<Instruction[]> {
  const userTdns = await findAta(user, m.tdnsMint, TOKEN_PROGRAM);
  const userStdns = await findAta(user, stdnsMint, TOKEN_2022_PROGRAM);
  return [
    createAtaIdempotent(user, userStdns, user, stdnsMint, TOKEN_2022_PROGRAM),
    await client.createRequestStakeInstruction({
      user,
      vault,
      tdnsMint: m.tdnsMint,
      userTdns,
      stdnsMint,
      userStdns,
      usdcMint: m.usdcMint,
      poolUsdc: m.poolUsdc,
      vaultUsdc,
      group_id: groupId,
      amount: tdnsAtoms,
    }),
  ];
}

export async function redeemIxs(
  user: Address,
  m: DnsMints,
  vault: Address,
  stdnsMint: Address,
  shares: bigint,
): Promise<Instruction[]> {
  const userUsdc = await findAta(user, m.usdcMint, TOKEN_PROGRAM);
  const userStdns = await findAta(user, stdnsMint, TOKEN_2022_PROGRAM);
  return [
    createAtaIdempotent(user, userUsdc, user, m.usdcMint, TOKEN_PROGRAM),
    await client.createRedeemInstruction({
      user,
      vault,
      stdnsMint,
      userStdns,
      usdcMint: m.usdcMint,
      poolUsdc: m.poolUsdc,
      userUsdc,
      shares,
    }),
  ];
}

export function toWeb3Instruction(ix: Instruction): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(ix.programAddress),
    keys: (ix.accounts ?? []).map((a) => ({
      pubkey: new PublicKey(a.address),
      isSigner: a.role === AccountRole.READONLY_SIGNER || a.role === AccountRole.WRITABLE_SIGNER,
      isWritable: a.role === AccountRole.WRITABLE || a.role === AccountRole.WRITABLE_SIGNER,
    })),
    data: Buffer.from(ix.data ?? new Uint8Array()),
  });
}
