import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { web3 } from "@coral-xyz/anchor";
import { AnchorProvider } from "@coral-xyz/anchor";
import { SolanaClustersInitiator } from "../target/types/solana_clusters_initiator";
import solanaClustersInitiatorIDL from "../target/idl/solana_clusters_initiator.json";

const IS_MAINNET = process.env.SOL_URL?.includes("mainnet")

const connection = new web3.Connection(process.env.SOL_URL);
const wallet = Wallet.local();
const provider = new AnchorProvider(connection, wallet, {});

anchor.setProvider(provider);
const clusterInitiatorProgram = new Program<SolanaClustersInitiator>(
  solanaClustersInitiatorIDL as any,
  "7SbKoJMQXfeA58SZ96ogssFmWczpvFzdgpX5H9z9EtJ4",
  provider
);

const DEV_CONFIG = {
    INITIATOR_ID: 1,
    LAYERZERO_ENDPOINT: new web3.PublicKey("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6"),
}

const MAINNET_CONFIG = {
    INITIATOR_ID: 1,
    LAYERZERO_ENDPOINT: new web3.PublicKey("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6"),
}

const CONFIG = IS_MAINNET ? MAINNET_CONFIG : DEV_CONFIG;

export { provider, wallet, clusterInitiatorProgram, CONFIG };