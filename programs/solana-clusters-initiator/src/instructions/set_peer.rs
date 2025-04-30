use crate::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(params: SetPeerParams)]
pub struct SetPeer<'info> {
    #[account(mut, address = initiator.admin)]
    pub admin: Signer<'info>,
    #[account(
        init_if_needed,
        payer = admin,
        space = Peer::SIZE,
        seeds = [PEER_SEED, &initiator.key().to_bytes(), &params.remote_eid.to_be_bytes()],
        bump
    )]
    pub peer: Account<'info, Peer>,
    #[account(seeds = [INITIATOR_SEED, &params.id.to_be_bytes()], bump = initiator.bump)]
    pub initiator: Account<'info, Initiator>,
    pub system_program: Program<'info, System>,
}

impl SetPeer<'_> {
    pub fn apply(ctx: &mut Context<SetPeer>, params: &SetPeerParams) -> Result<()> {
        ctx.accounts.peer.address = params.peer;
        ctx.accounts.peer.bump = ctx.bumps.peer;
        Ok(())
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct SetPeerParams {
    pub id: u8,
    pub remote_eid: u32,
    pub peer: [u8; 32],
}
