mod errors;
mod instructions;
mod msg_codec;
mod state;

use anchor_lang::prelude::*;
use errors::*;
use instructions::*;
use oapp::{endpoint::MessagingFee, endpoint_cpi::LzAccount, LzComposeParams, LzReceiveParams};
use solana_helper::program_id_from_env;
use state::*;

const LZ_RECEIVE_TYPES_SEED: &[u8] = b"LzReceiveTypes";
const LZ_COMPOSE_TYPES_SEED: &[u8] = b"LzComposeTypes";
const COUNT_SEED: &[u8] = b"Count";
const PEER_SEED: &[u8] = b"Peer";
const NONCE_SEED: &[u8] = b"Nonce";

declare_id!("9p5BdrLTzrLyF43zLQWVggRJ36ZK3BBMX6F6bXcmFmdg");

#[program]
pub mod solana_clusters_initiator {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
