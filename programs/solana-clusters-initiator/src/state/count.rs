use crate::*;

#[account]
pub struct Count {
    pub id: u8,
    pub admin: Pubkey,
    pub bump: u8,
    pub endpoint_program: Pubkey,
}

impl Count {
    pub const SIZE: usize = 8 + std::mem::size_of::<Self>();
}
