use crate::*;
use anchor_lang::{prelude::*};
use oapp::{
    endpoint::{
        cpi::accounts::Clear,
        instructions::{ClearParams, SendComposeParams},
        ConstructCPIContext, ID as ENDPOINT_ID,
    },
    LzReceiveParams,
};
use crate::msg_codec::MessageType;
#[derive(Accounts)]
#[instruction(params: LzReceiveParams)]
pub struct LzReceive<'info> {
    #[account(mut, seeds = [INITIATOR_SEED, &initiator.id.to_be_bytes()], bump = initiator.bump)]
    pub initiator: Account<'info, Initiator>,
    #[account(
        seeds = [PEER_SEED, &initiator.key().to_bytes(), &params.src_eid.to_be_bytes()],
        bump = peer.bump,
        constraint = params.sender == peer.address
    )]
    pub peer: Account<'info, Peer>,
}

impl LzReceive<'_> {
    pub fn apply(ctx: &mut Context<LzReceive>, params: &LzReceiveParams) -> Result<()> {
        let seeds: &[&[u8]] =
            &[INITIATOR_SEED, &[ctx.accounts.initiator.id], &[ctx.accounts.initiator.bump]];

        // the first 9 accounts are for clear()
        let accounts_for_clear = &ctx.remaining_accounts[0..Clear::MIN_ACCOUNTS_LEN];
        let _ = oapp::endpoint_cpi::clear(
            ENDPOINT_ID,
            ctx.accounts.initiator.key(),
            accounts_for_clear,
            seeds,
            ClearParams {
                receiver: ctx.accounts.initiator.key(),
                src_eid: params.src_eid,
                sender: params.sender,
                nonce: params.nonce,
                guid: params.guid,
                message: params.message.clone(),
            },
        )?;

        // accept_nonce(&ctx.accounts.initiator, &mut ctx.accounts.nonce_account, params.nonce)?;

        let msg_type = MessageType::try_from(params.message[0])?;
        msg!("msg_type: {:?}", params.message[0]);
        match msg_type {
            MessageType::PlaceBid => ctx.accounts.initiator.create_bid += 1,
            MessageType::CancelBid => ctx.accounts.initiator.cancel_bid += 1,
        }
        Ok(())
    }
}

// fn accept_nonce<'info>(
//     initiator_acc: &Account<'info, Initiator>,
//     nonce_acc: &mut Account<'info, Nonce>,
//     nonce: u64,
// ) -> Result<()> {
//     let current_nonce = nonce_acc.max_received_nonce;
//     if initiator_acc.ordered_nonce {
//         require!(nonce == current_nonce + 1, CounterError::InvalidNonce);
//     }
//     // update the max nonce anyway. once the ordered mode is turned on, missing early nonces will be rejected
//     if nonce > current_nonce {
//         nonce_acc.max_received_nonce = nonce;
//     }
//     Ok(())
// }
