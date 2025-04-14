use crate::*;
use anchor_lang::prelude::*;
use oapp::endpoint::{
    instructions::SendParams, state::EndpointSettings, ENDPOINT_SEED, ID as ENDPOINT_ID,
};

#[derive(Accounts)]
#[instruction(params: PostParams)]
pub struct Post<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [
            PEER_SEED,
            &initiator.key().to_bytes(),
            &params.dst_eid.to_be_bytes()
        ],
        bump = peer.bump
    )]
    pub peer: Account<'info, Peer>,

    #[account(seeds = [INITIATOR_SEED, &initiator.id.to_be_bytes()], bump = initiator.bump)]
    pub initiator: Account<'info, Initiator>,
    
    #[account(seeds = [ENDPOINT_SEED], bump = endpoint.bump, seeds::program = ENDPOINT_ID)]
    pub endpoint: Account<'info, EndpointSettings>,
}

impl<'info> Post<'info> {
    pub fn apply(ctx: &mut Context<Post>, params: &PostParams) -> Result<()> {        
        let seeds: &[&[u8]] = &[INITIATOR_SEED, &[ctx.accounts.initiator.id], &[ctx.accounts.initiator.bump]];

        let send_params = SendParams {
            dst_eid: params.dst_eid,
            receiver: ctx.accounts.peer.address,
            message: msg_codec::encode(&ctx.accounts.user.key().to_bytes(), &params.msg),
            options: params.options.clone(),
            native_fee: params.native_fee,
            lz_token_fee: params.lz_token_fee,
        };

        oapp::endpoint_cpi::send(
            ENDPOINT_ID,
            ctx.accounts.initiator.key(),
            ctx.remaining_accounts,
            seeds,
            send_params,
        )?;

        Ok(())
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct PostParams {
    pub dst_eid: u32,
    pub msg: Vec<u8>,
    pub options: Vec<u8>,
    pub native_fee: u64,
    pub lz_token_fee: u64,
}
