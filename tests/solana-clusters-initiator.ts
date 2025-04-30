import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaClustersInitiator } from "../target/types/solana_clusters_initiator";
import { EVENT_SEED, OAPP_SEED, LZ_COMPOSE_TYPES_SEED, LZ_RECEIVE_TYPES_SEED } from "@layerzerolabs/lz-solana-sdk-v2"
import { addressToBytes32 } from "@layerzerolabs/lz-v2-utilities";
import { ethers, Wallet } from "ethers";
import { EndpointId } from '@layerzerolabs/lz-definitions'

describe("solana-clusters-initiator", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaClustersInitiator as Program<SolanaClustersInitiator>;
  const lzEndpoint = new anchor.web3.PublicKey("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6");

  const _evm_contract = Wallet.createRandom().address
  const evm_address = addressToBytes32(_evm_contract);
  const evm_chain_eid = EndpointId.SEPOLIA_TESTNET
  const bufferDstEid = Buffer.alloc(4);
  bufferDstEid.writeUInt32BE(evm_chain_eid);

  const initiatorId = 1;

  it("initInitiator", async () => {
    // Add your test here.
    const initiator = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("Initiator"), new Uint8Array([initiatorId])],
      program.programId
    )[0];
    const lzReceiveTypesAccounts = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(LZ_RECEIVE_TYPES_SEED), initiator.toBuffer()],
      program.programId
    )[0];
    const lzComposeTypesAccounts = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(LZ_COMPOSE_TYPES_SEED), initiator.toBuffer()],
      program.programId
    )[0];

    const oappRegistry = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(OAPP_SEED), initiator.toBuffer()],
      lzEndpoint
    )[0];
    const eventAuthority = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(EVENT_SEED)],
      lzEndpoint
    )[0];
    // const initiaor
    await program.methods.initInitiator({
      id: initiatorId,
      admin: provider.wallet.publicKey,
      endpoint: lzEndpoint,
      })
      .accounts({
        payer: provider.wallet.publicKey,
        initiator,
        lzReceiveTypesAccounts,
        lzComposeTypesAccounts,
        systemProgram: anchor.web3.SystemProgram.programId,
      }).remainingAccounts([
        { pubkey: lzEndpoint, isWritable: true, isSigner: false },
        { pubkey: provider.wallet.publicKey, isWritable: true, isSigner: true },
        { pubkey: initiator, isWritable: false, isSigner: false },
        { pubkey: oappRegistry, isWritable: true, isSigner: false },
        { pubkey: anchor.web3.SystemProgram.programId, isWritable: false, isSigner: false },
        { pubkey: eventAuthority, isWritable: true, isSigner: false },
        { pubkey: lzEndpoint, isWritable: true, isSigner: false },
      ])
      .rpc();
    
    await program.methods.setPeer({
      id: initiatorId,
      remoteEid: evm_chain_eid,
      peer: Array.from(evm_address),
    })
      .accounts({
        admin: provider.wallet.publicKey,
        initiator,
        peer: anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("Peer"), initiator.toBuffer(), bufferDstEid],
          program.programId
        )[0],
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  });

});
