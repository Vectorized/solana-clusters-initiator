use crate::*;

#[account]
pub struct Initiator {
    pub id: u8,
    pub admin: Pubkey,
    pub bump: u8,
    pub endpoint_program: Pubkey,
}

impl Initiator {
    pub const SIZE: usize = 8 + std::mem::size_of::<Self>();
}
