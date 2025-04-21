import * as anchor from "@coral-xyz/anchor";
const { setup } = require("./common");

(async () => {
  try {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
  
    const common = setup();
    console.log(`Deployer Account: ${common.deployerKeypair.publicKey.toBase58()}`);

    const tx = await common.program.methods
      .setPeer({
        id: common.INITIATOR_ID,
        remoteEid: common.PEER_EVM_EID, 
        peer: common.PEER_EVM_ADDRESS_BYTES,
      })
      .accounts({
        payer: common.deployerKeypair.publicKey,
        admin: common.deployerKeypair.publicKey,
        peer: common.peerPDA,
        initiator: common.initiatorPDA, 
      })
      .signers([common.deployerKeypair])
      .rpc();
    console.log(`Transaction Signature: ${tx}`);
    console.log("Set Peer Success!");
  } catch (err) {
    console.error("Transaction failed:", err.message);
    console.error("Full Error:", err);
  }
})();
