use crate::InitiatorError;

#[repr(u8)]
pub enum MessageType {
    PlaceBid = 0,
    CancelBid = 1,
}

impl TryFrom<u8> for MessageType {
    type Error = InitiatorError;
    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            0 => Ok(MessageType::PlaceBid),
            1 => Ok(MessageType::CancelBid),
            _ => Err(InitiatorError::InvalidMessageType), // Return an error for unsupported values
        }
    }
}

pub fn src_eid(message: &[u8]) -> u32 {
    let mut eid_bytes = [0; 4];
    eid_bytes.copy_from_slice(&message[1..5]);
    u32::from_be_bytes(eid_bytes)
}

// decode message