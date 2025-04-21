use crate::*;
use anchor_lang::prelude::*;
use oapp::endpoint::{
    instructions::QuoteParams as EndpointQuoteParams, state::EndpointSettings, ENDPOINT_SEED,
    ID as ENDPOINT_ID,
};

#[derive(Accounts)]
#[instruction(params: QuoteParams)]
pub struct Quote<'info> {
    #[account(seeds = [INITIATOR_SEED, &initiator.id.to_be_bytes()], bump = initiator.bump)]
    pub initiator: Account<'info, Initiator>,
}

#[error_code]
pub enum QuoteError {
    InvalidEndpoint,
}

impl<'info> Quote<'info> {
    pub fn apply(ctx: &Context<Quote>, params: &QuoteParams) -> Result<MessagingFee> {
        require!(ctx.accounts.initiator.endpoint_program == params.endpoint, QuoteError::InvalidEndpoint);

        // A random user public key with incompressible bytes, just to get a quote.
        let random_user: [u8; 32] = [
            0xC3, 0xA7, 0x58, 0x9D, 0x2E, 0xB4, 0x61, 0xF5,
            0x82, 0x1C, 0x3F, 0xD6, 0x4A, 0xE9, 0x75, 0x0B,
            0x91, 0x6E, 0x23, 0x8D, 0x57, 0xAC, 0x39, 0xF2,
            0x64, 0xBE, 0x17, 0x83, 0x4F, 0xD8, 0x25, 0x9A,
        ];

        let quote_params = EndpointQuoteParams {
            sender: ctx.accounts.initiator.key(),
            dst_eid: params.dst_eid,
            receiver: params.receiver,
            message: msg_codec::encode(&random_user, &params.msg),
            pay_in_lz_token: params.pay_in_lz_token,
            options: params.options.clone(),
        };
        oapp::endpoint_cpi::quote(ENDPOINT_ID, ctx.remaining_accounts, quote_params)
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct QuoteParams {
    pub dst_eid: u32,
    pub receiver: [u8; 32],
    pub msg: Vec<u8>,
    pub options: Vec<u8>,
    pub pay_in_lz_token: bool,
    pub endpoint: Pubkey,
}
