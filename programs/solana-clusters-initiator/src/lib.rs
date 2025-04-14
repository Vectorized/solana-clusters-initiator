mod msg_codec;
mod instructions;
mod state;

use anchor_lang::prelude::*;
use instructions::*;
use oapp::{endpoint::MessagingFee};
use state::*;

const INITIATOR_SEED: &[u8] = b"Initiator";
const PEER_SEED: &[u8] = b"Peer";

declare_id!("eDawZydN4oExTTkLpvRYFGSj7xVpdRHfwrQUp2LDjRd");

#[program]
pub mod solana_clusters_initiator {
    use super::*;

    pub fn init_initiator(mut ctx: Context<InitInitiator>, params: InitInitiatorParams) -> Result<()> {
        InitInitiator::apply(&mut ctx, &params)
    }
    
    pub fn set_peer(mut ctx: Context<SetPeer>, params: SetPeerParams) -> Result<()> {
        SetPeer::apply(&mut ctx, &params)
    }

    pub fn quote(ctx: Context<Quote>, params: QuoteParams) -> Result<MessagingFee> {
        Quote::apply(&ctx, &params)
    }

    pub fn post(mut ctx: Context<Post>, params: PostParams) -> Result<()> {
        Post::apply(&mut ctx, &params)
    }
}

#[derive(Accounts)]
pub struct Initialize {}
