// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./extensions/IUser.sol";

/// @title User Verification Contract
/// @author Maxime AUBURTIN
/// @notice This contract is used to verify users using a Merkle proof
/// @dev This contract utilizes OpenZeppelin's MerkleProof library for verification
/// @custom:security-contact maxime@auburt.in
contract User is IUser, Ownable {

    /// @notice Hexadecimal Merkle root for users
    /// @dev Stores the Merkle tree root used to verify users
    bytes32 public hexMerkleRoot_;

    /// @notice Creates a new User contract with a specified Merkle hex root
    /// @dev Calls the Ownable constructor to establish contract ownership
    /// @param hexMerkleRoot The Merkle hex root for users
    constructor(bytes32 hexMerkleRoot) Ownable(msg.sender) {
        hexMerkleRoot_ = hexMerkleRoot;
    }

    /// @notice Sets a new Merkle hex root for users
    /// @dev Can only be called by the contract owner
    /// @param hexMerkleRoot The new Merkle hex root for users
    function setMerkleRoot(bytes32 hexMerkleRoot) public virtual {
        hexMerkleRoot_ = hexMerkleRoot;
    }

    /// @notice Verifies whether a given address is a verified user
    /// @dev Uses `MerkleProof.verify` to check if the address is in the Merkle tree
    /// @param account The address to verify
    /// @param proof The Merkle proof providing verification
    /// @return bool True if the address is a verified user, false otherwise
    function _isUser(address account, bytes32[] calldata proof ) public view returns (bool) {
        return MerkleProof.verify( proof, hexMerkleRoot_, keccak256(abi.encodePacked(account)));
    }
}
