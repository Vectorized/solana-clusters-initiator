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
    const sendLib = await common.endpoint
      .getSendLibrary(
        connection,
        common.initiatorPDA,
        common.PEER_EVM_EID,
      );
    
    const payer = common.deployerKeypair.publicKey;
    const quoteIxRemainingAccounts = await common.endpoint.getQuoteIXAccountMetaForCPI(
      connection,
      payer,
      {
        dstEid: common.PEER_EVM_EID,
        srcEid: common.SOLANA_EID,
        sender: common.hexlify(common.initiatorPDA.toBytes()),
        receiver: common.PEER_EVM_ADDRESS,
      },
      new UlnProgram.Uln(
        sendLib.programId
      ),
    );
    // console.log(quoteIxRemainingAccounts);

    const msg = Buffer.from([0x12, 0x34, 0x56]);
    const options = common.makeLzOptions(100000, 0);

    const requiredNativeFee = (
      await common.program.methods
        .quote({
          dstEid: common.PEER_EVM_EID,
          receiver: common.PEER_EVM_ADDRESS_BYTES,
          msg: msg,
          options: options,
          payInLzToken: false, 
          endpoint: common.endpoint.program,       
        })
        .accounts({
          initiator: common.initiatorPDA, 
        })
        .remainingAccounts(quoteIxRemainingAccounts) 
        .signers([common.deployerKeypair])
        .view()
    ).nativeFee;

    console.log("Required Native Fee:", requiredNativeFee.toString());

    const sendIxRemainingAccounts = await common.endpoint.getSendIXAccountMetaForCPI(
      connection,
      payer,
      {
        dstEid: common.PEER_EVM_EID,
        srcEid: common.SOLANA_EID,
        sender: common.hexlify(common.initiatorPDA.toBytes()),
        receiver: common.PEER_EVM_ADDRESS,
      },
      new UlnProgram.Uln(
        sendLib.programId
      ),
    );

    console.log("Send Instruction Accounts:", sendIxRemainingAccounts);

    const tx = await common.program.methods
      .post({
        dstEid: common.PEER_EVM_EID,
        msg: msg,
        options: options,
        nativeFee: requiredNativeFee, 
        lzTokenFee: new anchor.BN(0),
        endpoint: common.endpoint.program,
      })
      .accounts({
        user: common.deployerKeypair.publicKey,
        peer: common.peerPDA,
        initiator: common.initiatorPDA, 
      })
      .remainingAccounts(sendIxRemainingAccounts)
      .signers([common.deployerKeypair])
      .rpc();
    console.log(`Transaction Signature: ${tx}`);
    console.log("Post Success!"); 
  } catch (err) {
    console.error("Transaction failed:", err.message);
    console.error("Full Error:", err);
  }
})();
