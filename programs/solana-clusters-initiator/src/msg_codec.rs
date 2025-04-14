pub fn u64_to_be_bytes32(value: u64) -> [u8; 32] {
    let mut bytes = [0u8; 32];
    for i in 0..8 {
        bytes[31 - i] = (value >> (8 * i)) as u8;
    }
    bytes
}

// `abi.encode(bytes32(user), msg)`.
pub fn encode(user: &[u8; 32], msg: &Vec<u8>) -> Vec<u8> {
    let mut encoded = Vec::new();
    encoded.extend_from_slice(user);
    encoded.extend_from_slice(&u64_to_be_bytes32(0x20));
    encoded.extend_from_slice(&u64_to_be_bytes32(msg.len() as u64));
    encoded.extend_from_slice(msg);
    let padding_needed = (32 - (msg.len() % 32)) % 32;
    encoded.extend_from_slice(&vec![0u8; padding_needed]);
    encoded
}
