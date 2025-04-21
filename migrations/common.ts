import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import * as fs from "fs";
import { SolanaClustersInitiator } from "../target/types/solana_clusters_initiator";
import { EndpointPDADeriver, EndpointProgram } from '@layerzerolabs/lz-solana-sdk-v2'
import { arrayify, hexZeroPad } from "@ethersproject/bytes";
import { buildVersionedTransaction } from "@layerzerolabs/lz-solana-sdk-v2";

function setup() {
  const eids = {
    BASE_SEPOLIA: 40245,
    BASE_MAINNET: 30184,
    ETHEREUM_MAINNET: 30101,
    SOLANA_DEVNET: 40168,
    SOLANA_MAINNET: 30168,
  };
  
  const PEER_SEED = Buffer.from("Peer");
  const INITIATOR_SEED = Buffer.from("Initiator");
  const INITIATOR_ID = 0; 
  const ENDPOINT_PUBLIC_KEY = new PublicKey("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6");
  const PEER_EVM_ADDRESS = "0x581296f83d7464df72ca4f1e840b65633e016ef0";
  const PEER_EVM_ADDRESS_BYTES = Array.from(arrayify(hexZeroPad(PEER_EVM_ADDRESS, 32)));
  const PEER_EVM_EID = eids.BASE_SEPOLIA;
  const SOLANA_EID = eids.SOLANA_DEVNET;

  const deployerKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync("keypairs/deployer.json", "utf-8")))
  );
  console.log(`Deployer Account: ${deployerKeypair.publicKey.toBase58()}`);

  const program = anchor.workspace.SolanaClustersInitiator as Program<SolanaClustersInitiator>;
  
  const [initiatorPDA, initiatorBump] = PublicKey.findProgramAddressSync(
    [INITIATOR_SEED, (new BN(INITIATOR_ID)).toArrayLike(Buffer, "be", 1)],
    program.programId
  );
  console.log(`initiatorPDA: ${initiatorPDA}`);

  const [peerPDA, peerBump] = PublicKey.findProgramAddressSync(
    [PEER_SEED, initiatorPDA.toBuffer(), (new BN(PEER_EVM_EID)).toArrayLike(Buffer, "be", 4)],
    program.programId
  );
  console.log(`peerPDA: ${peerPDA}`);
  
  const endpoint = new EndpointProgram.Endpoint(
    ENDPOINT_PUBLIC_KEY
  );

  const hexlify = (data) => {
    if (typeof data === "string") {
      if (data.startsWith("0x")) return data.toLowerCase();
      return "0x" + data.toLowerCase();
    }
    const bytes = data instanceof Uint8Array ? data : Uint8Array.from(data);
    let hex = "";
    for (const byte of bytes) {
      hex += byte.toString(16).padStart(2, "0");
    }
    return "0x" + hex;
  };

  const sendAndConfirm = async (connection, signers, instructions) => {
    const tx = await buildVersionedTransaction(
      connection as any,
      signers[0].publicKey,
      instructions,
      "confirmed"
    );
    tx.sign(signers);
    const hash = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: true,
    });
    console.log(`Tx hash: ${hash}`);
    await connection.confirmTransaction(hash, "confirmed");
  }
  
  return {
    sendAndConfirm,
    hexlify,
    SOLANA_EID,
    PEER_SEED,
    PEER_EVM_ADDRESS,
    PEER_EVM_ADDRESS_BYTES,
    PEER_EVM_EID,
    INITIATOR_SEED,
    INITIATOR_ID,
    ENDPOINT_PUBLIC_KEY,
    deployerKeypair,
    program,
    initiatorPDA,
    initiatorBump,
    peerPDA,
    peerBump,
    endpoint,
    eids
  };
};

module.exports = { setup };