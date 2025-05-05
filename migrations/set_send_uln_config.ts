import * as anchor from "@coral-xyz/anchor";
const { setup } = require("./common");
import {
  EndpointProgram,
  ExecutorPDADeriver,
  simulateTransaction,
  UlnProgram,
  SetConfigType,
} from "@layerzerolabs/lz-solana-sdk-v2";
import { PublicKey, Keypair } from "@solana/web3.js";

(async () => {
  try {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const common = setup();

    const ulnProgram = new UlnProgram.Uln(common.SEND_LIB_PROGRAM_ID);
    const [executorPda] = new ExecutorPDADeriver(common.EXECUTOR_PROGRAM_ID).config();
    const expected: UlnProgram.types.UlnConfig = {
      confirmations: 10, 
      requiredDvnCount: 1,
      optionalDvnCount: 0,
      optionalDvnThreshold: 0,
      requiredDvns: [common.DVN_PROGRAM_ID],
      optionalDvns: [],
    };

    const ix = await common.endpoint
      .setOappConfig(
        provider.connection,
        common.deployerKeypair.publicKey,
        common.initiatorPDA,
        ulnProgram.program,
        common.PEER_EVM_EID,
        {
          configType: SetConfigType.SEND_ULN,
          value: expected,
        },
      );

    await common.sendAndConfirm(provider.connection, [common.deployerKeypair], [ix]);
      
  } catch (err) {
    console.error("Transaction failed:", err.message);
    console.error("Full Error:", err);
  }
})();
