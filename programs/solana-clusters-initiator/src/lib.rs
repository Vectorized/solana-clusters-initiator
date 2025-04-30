mod errors;
mod instructions;
mod msg_codec;
mod state;

use anchor_lang::prelude::*;
use errors::*;
use instructions::*;
use oapp::{
    endpoint::MessagingFee, endpoint_cpi::LzAccount, LzComposeParams, LzReceiveParams,
};
use state::*;

declare_id!("7SbKoJMQXfeA58SZ96ogssFmWczpvFzdgpX5H9z9EtJ4");

const LZ_RECEIVE_TYPES_SEED: &[u8] = b"LzReceiveTypes";
const LZ_COMPOSE_TYPES_SEED: &[u8] = b"LzComposeTypes";
const INITIATOR_SEED: &[u8] = b"Initiator";
const PEER_SEED: &[u8] = b"Peer";
const NONCE_SEED: &[u8] = b"Nonce";

#[program]
pub mod solana_clusters_initiator {
    use super::*;

    pub fn init_initiator(mut ctx: Context<InitInitiator>, params: InitInitiatorParams) -> Result<()> {
        InitInitiator::apply(&mut ctx, &params)
    }

    pub fn set_peer(mut ctx: Context<SetPeer>, params: SetPeerParams) -> Result<()> {
        SetPeer::apply(&mut ctx, &params)
    }

    // pub fn quote(ctx: Context<Quote>, params: QuoteParams) -> Result<MessagingFee> {
    //     Quote::apply(&ctx, &params)
    // }

    pub fn lz_receive(mut ctx: Context<LzReceive>, params: LzReceiveParams) -> Result<()> {
        LzReceive::apply(&mut ctx, &params)
    }

    pub fn lz_receive_types(
        ctx: Context<LzReceiveTypes>,
        params: LzReceiveParams,
    ) -> Result<Vec<LzAccount>> {
        LzReceiveTypes::apply(&ctx, &params)
    }
}
