import * as anchor from "@coral-xyz/anchor";
const { setup } = require("./common");
import {
  EndpointProgram,
  simulateTransaction,
  UlnProgram,
} from "@layerzerolabs/lz-solana-sdk-v2";

(async () => {
  try {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const common = setup();
    const connection = provider.connection;

    console.log(common.initiatorPDA);
    console.log(
      await common.endpoint.getSendLibrary(
        connection,
        common.initiatorPDA,
        common.PEER_EVM_EID,
      )
    );
    // const additionalAccounts = await common.endpoint.getQuoteIXAccountMetaForCPI(
    //   connection,
    //   common.deployerKeypair.publicKey, // Replace with the sender's public key.
    //   {
    //     dstEid: common.PEER_EVM_EID,
    //     srcEid: common.SOLANA_EID,
    //     sender: common.hexlify(common.initiatorPDA.toBytes()),
    //     receiver: common.PEER_EVM_ADDRESS_BYTES,
    //   },
    //   new UlnProgram.Uln(
    //     (
    //       await common.endpoint.getSendLibrary(
    //         connection,
    //         common.initiatorPDA,
    //         common.PEER_EVM_EID,
    //       )
    //     ).programId,
    //   ),
    // );
    // console.log(additionalAccounts);

    return;

    const quoteIxAccounts = await common.endpoint.getQuoteIXAccountMetaForCPI(
      common.deployerKeypair.publicKey, 
      common.initiatorPDA
    ).map((acc) => {
      return {
        pubkey: acc.pubkey,
        isSigner: acc.isSigner,
        isWritable: acc.isWritable,
      }
    });
    
    const { result, logs } = await common.program.methods
      .quote({
        dstEid: common.PEER_EVM_EID,
        receiver: common.PEER_EVM_ADDRESS_BYTES,
        msg: Buffer.from([0x12, 0x34, 0x56]),
        options: Buffer.from([0, 3, 1, 0, 17, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 26, 128]),
        payInLzToken: false, 
        endpoint: common.endpoint.program,       
      })
      .accounts({
        initiator: common.initiatorPDA, 
      })
      .remainingAccounts(quoteIxAccounts) // <-???
      .signers([common.deployerKeypair])
      .simulate();

    console.log("Logs:", logs);
    console.log("Return value:", result);
  } catch (err) {
    console.error("Transaction failed:", err.message);
    console.error("Full Error:", err);
  }
})();
