// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title Pharmacy Verification Contract
/// @author Maxime AUBURTIN
/// @notice This contract is used to verify pharmacies using a Merkle proof
/// @dev This contract utilizes OpenZeppelin's MerkleProof library for the purpose of verification
/// @custom:security-contact maxime@auburt.in
contract Pharmacy is Ownable {

    /// @notice Hexadecimal Merkle root for pharmacies
    /// @dev Stores the Merkle tree root used to verify pharmacies
    bytes32 public pharmaciesHexMerkleRoot_;

    /// @notice Creates a new Pharmacy contract with a specified Merkle hex root
    /// @dev Calls the Ownable constructor to establish contract ownership
    /// @param pharmaciesHexMerkleRoot The Merkle hex root for pharmacies
    constructor(bytes32 pharmaciesHexMerkleRoot) Ownable(msg.sender)  {
        pharmaciesHexMerkleRoot_ = pharmaciesHexMerkleRoot;
    }

    /// @notice Sets a new Merkle hex root for pharmacies
    /// @dev Can only be called by the contract owner
    /// @param pharmaciesHexMerkleRoot The new Merkle hex root for pharmacies
    function setPharmacyMerkleRoot(bytes32 pharmaciesHexMerkleRoot) public virtual  {
        pharmaciesHexMerkleRoot_ = pharmaciesHexMerkleRoot;
    }

    /// @notice Verifies whether a given address is a verified pharmacy
    /// @dev Uses `MerkleProof.verify` to check if the address is in the Merkle tree
    /// @param account The address to verify
    /// @param proof The Merkle proof providing verification
    /// @return bool True if the address is a verified pharmacy, false otherwise
    function isPharmacy(address account, bytes32[] calldata proof) public view returns(bool) {
        return MerkleProof.verify(proof, pharmaciesHexMerkleRoot_, keccak256(abi.encodePacked(account)));
    }

}
