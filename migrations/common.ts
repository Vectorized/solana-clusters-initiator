import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";
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
  const INITIATOR_ID = 1; 
  const ENDPOINT_PUBLIC_KEY = new PublicKey("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6");
  const SEND_LIB_PROGRAM_ID = new PublicKey("7a4WjyR8VZ7yZz5XJAKm39BUGn5iT9CKcv2pmG9tdXVH");
  const EXECUTOR_PROGRAM_ID = new PublicKey("6doghB248px58JSSwG4qejQ46kFMW4AMj7vzJnWZHNZn");
  const DVN_PROGRAM_ID = new PublicKey("HtEYV4xB4wvsj5fgTkcfuChYpvGYzgzwvNhgDZQNh7wW");
  const PRICE_FEED_PROGRAM_ID = new PublicKey("8ahPGPjEbpgGaZx2NV1iG5Shj7TDwvsjkEDcGWjt94TP");
  
  const PEER_EVM_ADDRESS = "0xD18E087D6dFEb24b94F5F7F85d01fdFD08004E02";
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
  const initiatorPDABytes = '0x' + Buffer.from(bs58.decode('' + initiatorPDA)).toString('hex');
  console.log(`initiatorPDA (hex): ${initiatorPDABytes}`);

  const [peerPDA, peerBump] = PublicKey.findProgramAddressSync(
    [PEER_SEED, initiatorPDA.toBuffer(), (new BN(PEER_EVM_EID)).toArrayLike(Buffer, "be", 4)],
    program.programId
  );
  console.log(`peerPDA: ${peerPDA}`);
  const peerPDABytes = '0x' + Buffer.from(bs58.decode('' + peerPDA)).toString('hex');
  console.log(`peerPDA (hex): ${peerPDABytes}`);
  
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

  function makeLzOptions(gas: number | BN, value: number | BN): Buffer {
    const gasBN = BN.isBN(gas) ? gas : new BN(gas);
    const valueBN = BN.isBN(value) ? value : new BN(value);
    return Buffer.concat([
      Buffer.from([0, 3, 1, 0]), 
      Buffer.from([!valueBN.isZero() ? 0x21 : 0x11]), 
      Buffer.from([1]), 
      gasBN.toArrayLike(Buffer, "be", 16), 
      !valueBN.isZero() ? valueBN.toArrayLike(Buffer, "be", 16) : Buffer.alloc(0)
    ]);
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
    SEND_LIB_PROGRAM_ID,
    EXECUTOR_PROGRAM_ID,
    DVN_PROGRAM_ID,
    PRICE_FEED_PROGRAM_ID,
    deployerKeypair,
    program,
    initiatorPDA,
    initiatorBump,
    peerPDA,
    peerBump,
    endpoint,
    eids,
    makeLzOptions
  };
};

module.exports = { setup };