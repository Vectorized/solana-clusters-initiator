use anchor_lang::prelude::*;

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
