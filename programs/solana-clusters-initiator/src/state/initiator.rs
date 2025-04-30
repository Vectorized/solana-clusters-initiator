use crate::*;

#[account]
pub struct Initiator {
    pub id: u8,
    pub admin: Pubkey,
    pub create_bid: u64,
    pub cancel_bid: u64,
    pub bump: u8,
    pub endpoint_program: Pubkey,
}

impl Initiator {
    pub const SIZE: usize = 8 + std::mem::size_of::<Self>();
}

/// LzReceiveTypesAccounts includes accounts that are used in the LzReceiveTypes
/// instruction.
#[account]
pub struct LzReceiveTypesAccounts {
    pub initiator: Pubkey,
}

impl LzReceiveTypesAccounts {
    pub const SIZE: usize = 8 + std::mem::size_of::<Self>();
}

/// LzComposeTypesAccounts includes accounts that are used in the LzComposeTypes
/// instruction.
#[account]
pub struct LzComposeTypesAccounts {
    pub initiator: Pubkey,
}

impl LzComposeTypesAccounts {
    pub const SIZE: usize = 8 + std::mem::size_of::<Self>();
}
