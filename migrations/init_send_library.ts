import * as anchor from "@coral-xyz/anchor";
const { setup } = require("./common");
import {
  EndpointProgram,
  simulateTransaction,
  UlnProgram,
} from "@layerzerolabs/lz-solana-sdk-v2";
import { PublicKey, Keypair } from "@solana/web3.js";

(async () => {
  try {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const common = setup();

    const ix = await common.endpoint
      .initSendLibrary(
        common.deployerKeypair.publicKey,
        common.initiatorPDA,
        common.PEER_EVM_EID
      );

    await common.sendAndConfirm(provider.connection, [common.deployerKeypair], [ix]);
      
  } catch (err) {
    console.error("Transaction failed:", err.message);
    console.error("Full Error:", err);
  }
})();
