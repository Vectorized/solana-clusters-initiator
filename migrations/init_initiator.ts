import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaClustersInitiator } from "../target/types/solana_clusters_initiator";
import { EVENT_SEED, OAPP_SEED, LZ_COMPOSE_TYPES_SEED, LZ_RECEIVE_TYPES_SEED } from "@layerzerolabs/lz-solana-sdk-v2"
import { PublicKey } from "@solana/web3.js";
import { clusterInitiatorProgram, CONFIG, provider } from "./CONFIG";

(async () => {
  const initiator = PublicKey.findProgramAddressSync(
    [Buffer.from("Initiator"), new Uint8Array([CONFIG.INITIATOR_ID])],
    clusterInitiatorProgram.programId
  )[0];
  const lzReceiveTypesAccounts = PublicKey.findProgramAddressSync(
    [Buffer.from(LZ_RECEIVE_TYPES_SEED), initiator.toBuffer()],
    clusterInitiatorProgram.programId
  )[0];
  const lzComposeTypesAccounts = PublicKey.findProgramAddressSync(
    [Buffer.from(LZ_COMPOSE_TYPES_SEED), initiator.toBuffer()],
    clusterInitiatorProgram.programId
  )[0];

  const oappRegistry = PublicKey.findProgramAddressSync(
    [Buffer.from(OAPP_SEED), initiator.toBuffer()],
    CONFIG.LAYERZERO_ENDPOINT
  )[0];
  const eventAuthority = PublicKey.findProgramAddressSync(
    [Buffer.from(EVENT_SEED)],
    CONFIG.LAYERZERO_ENDPOINT
  )[0];

  try {
    const tx = await clusterInitiatorProgram.methods
      .initInitiator({
        id: CONFIG.INITIATOR_ID,
        admin: provider.wallet.publicKey,
        endpoint: CONFIG.LAYERZERO_ENDPOINT,
      })
      .accounts({
        payer: provider.wallet.publicKey,
        initiator,
        lzReceiveTypesAccounts,
        lzComposeTypesAccounts,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .remainingAccounts([
        { pubkey: CONFIG.LAYERZERO_ENDPOINT, isWritable: true, isSigner: false },
        { pubkey: provider.wallet.publicKey, isWritable: true, isSigner: true },
        { pubkey: initiator, isWritable: false, isSigner: false },
        { pubkey: oappRegistry, isWritable: true, isSigner: false },
        { pubkey: anchor.web3.SystemProgram.programId, isWritable: false, isSigner: false },
        { pubkey: eventAuthority, isWritable: true, isSigner: false },
        { pubkey: CONFIG.LAYERZERO_ENDPOINT, isWritable: true, isSigner: false },
      ])
      .rpc();
    
    console.log(`Transaction Signature: ${tx}`);
    console.log("Successfully initialized.");
  } catch (err) {
    console.error("Transaction failed:", err);
  }
})();
