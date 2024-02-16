// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title Doctor Verification Contract
/// @author Maxime AUBURTIN
/// @notice This contract is used to verify doctors using a Merkle proof
/// @dev This contract utilizes OpenZeppelin's MerkleProof library for verification
/// @custom:security-contact maxime@auburt.in
contract Doctor is Ownable {

    /// @notice Hexadecimal Merkle root for doctors
    /// @dev Stores the Merkle tree root used to verify doctors
    bytes32 public doctorsHexMerkleRoot_;

    /// @notice Creates a new Doctor contract with a specified Merkle hex root
    /// @dev Calls the Ownable constructor to establish contract ownership
    /// @param doctorsHexMerkleRoot The Merkle hex root for doctors
    constructor(bytes32 doctorsHexMerkleRoot) Ownable(msg.sender)  {
        doctorsHexMerkleRoot_ = doctorsHexMerkleRoot;
    }

    /// @notice Sets a new Merkle hex root for doctors
    /// @dev Can only be called by the contract owner
    /// @param doctorsHexMerkleRoot The new Merkle hex root for doctors
    function setDoctorsMerkleRoot(bytes32 doctorsHexMerkleRoot) public virtual  {
        doctorsHexMerkleRoot_ = doctorsHexMerkleRoot;
    }

    /// @notice Verifies whether a given address is a verified doctor
    /// @dev Uses `MerkleProof.verify` to check if the address is in the Merkle tree
    /// @param account The address to verify
    /// @param proof The Merkle proof providing verification
    /// @return bool True if the address is a verified doctor, false otherwise
    function isDoctor(address account, bytes32[] calldata proof) public view returns(bool) {
        return MerkleProof.verify(proof, doctorsHexMerkleRoot_, keccak256(abi.encodePacked(account)));
    }

}
