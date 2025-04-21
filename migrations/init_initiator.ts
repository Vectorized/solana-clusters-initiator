import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import * as fs from "fs";
import { SolanaClustersInitiator } from "../target/types/solana_clusters_initiator";
import { EndpointPDADeriver, EndpointProgram } from '@layerzerolabs/lz-solana-sdk-v2'

(async () => {
  // Set up the provider
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaClustersInitiator as Program<SolanaClustersInitiator>;

  const deployerKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync("keypairs/deployer.json", "utf-8")))
  );

  console.log(`Deployer Account: ${deployerKeypair.publicKey.toBase58()}`);


  const INITIATOR_SEED = Buffer.from("Initiator"); 
  const ID = 0; 

  const [initiatorPDA, initiatorBump] = PublicKey.findProgramAddressSync(
    [INITIATOR_SEED, (new BN(ID)).toArrayLike(Buffer, "be", 1)],
    program.programId
  );

  const endpoint = new EndpointProgram.Endpoint(new PublicKey("76y77prsiCMvXMjuoZ5VRrhG5qYBrUMYTE5WgHqgjEn6"));

  const registerOappIxAccounts = endpoint.getRegisterOappIxAccountMetaForCPI(
    deployerKeypair.publicKey, 
    initiatorPDA
  ).map((acc) => {
    return {
        pubkey: acc.pubkey,
        isSigner: acc.isSigner,
        isWritable: acc.isWritable,
    }
  });

  console.log("Register Oapp Instruction Accounts:", registerOappIxAccounts);

  try {
    const tx = await program.methods
      .initInitiator({
        id: ID,
        admin: deployerKeypair.publicKey, 
        endpoint: endpoint.program,
      })
      .accounts({
        payer: deployerKeypair.publicKey,
        initiator: initiatorPDA, 
      })
      .remainingAccounts(registerOappIxAccounts)
      .signers([deployerKeypair]) // The state account must sign the transaction
      .rpc();
    console.log(`Transaction Signature: ${tx}`);
    console.log("Successfully initialized.");
  } catch (err) {
    console.error("Transaction failed:", err.message);
    console.error("Full Error:", err);
  }
})();
