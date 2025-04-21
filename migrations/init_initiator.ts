import * as anchor from "@coral-xyz/anchor";
const { setup } = require("./common");

(async () => {
  try {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const common = setup();

    const registerOappIxAccounts = common.endpoint
      .getRegisterOappIxAccountMetaForCPI(
        common.deployerKeypair.publicKey, 
        common.initiatorPDA
      ).map((acc) => {
        return {
          pubkey: acc.pubkey,
          isSigner: acc.isSigner,
          isWritable: acc.isWritable,
        }
      });

    console.log("Register Oapp Instruction Accounts:", registerOappIxAccounts);
  
    const tx = await common.program.methods
      .initInitiator({
        id: common.INITIATOR_ID,
        admin: common.deployerKeypair.publicKey, 
        endpoint: common.endpoint.program,
      })
      .accounts({
        payer: common.deployerKeypair.publicKey,
        initiator: common.initiatorPDA, 
      })
      .remainingAccounts(registerOappIxAccounts)
      .signers([common.deployerKeypair])
      .rpc();
    console.log(`Transaction Signature: ${tx}`);
    console.log("Initialization Success!");
  } catch (err) {
    console.error("Transaction failed:", err.message);
    console.error("Full Error:", err);
  }
})();
