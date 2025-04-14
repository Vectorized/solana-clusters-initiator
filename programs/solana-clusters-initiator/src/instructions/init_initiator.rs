use crate::*;
use oapp::endpoint::{instructions::RegisterOAppParams, ID as ENDPOINT_ID};

#[derive(Accounts)]
#[instruction(params: InitInitiatorParams)]
pub struct InitInitiator<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        init,
        payer = payer,
        space = Initiator::SIZE,
        seeds = [INITIATOR_SEED, &params.id.to_be_bytes()],
        bump
    )]
    pub initiator: Account<'info, Initiator>,
    
    pub system_program: Program<'info, System>,
}

impl InitInitiator<'_> {
    pub fn apply(ctx: &mut Context<InitInitiator>, params: &InitInitiatorParams) -> Result<()> {
        ctx.accounts.initiator.id = params.id;
        ctx.accounts.initiator.admin = params.admin;
        ctx.accounts.initiator.bump = ctx.bumps.initiator;
        ctx.accounts.initiator.endpoint_program = params.endpoint;

        let register_params = RegisterOAppParams { delegate: ctx.accounts.initiator.admin };
        let seeds: &[&[u8]] = &[INITIATOR_SEED, &[ctx.accounts.initiator.id], &[ctx.accounts.initiator.bump]];
        oapp::endpoint_cpi::register_oapp(
            ENDPOINT_ID,
            ctx.accounts.initiator.key(),
            ctx.remaining_accounts,
            seeds,
            register_params,
        )?;

        Ok(())
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct InitInitiatorParams {
    pub id: u8,
    pub admin: Pubkey,
    pub endpoint: Pubkey,
}
