// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title Patient Verification Contract
/// @author Maxime AUBURTIN
/// @notice This contract is used to verify patients using a Merkle proof
/// @dev This contract utilizes OpenZeppelin's MerkleProof library for verification purposes
/// @custom:security-contact maxime@auburt.in
contract Patient is Ownable {

    /// @notice Hexadecimal Merkle root for patients
    /// @dev Stores the Merkle tree root used to verify patients
    bytes32 public patientsHexMerkleRoot_;

    /// @notice Creates a new Patient contract with a specified Merkle hex root
    /// @dev Calls the Ownable constructor to establish contract ownership
    /// @param patientsHexMerkleRoot The Merkle hex root for patients
    constructor(bytes32 patientsHexMerkleRoot) Ownable(msg.sender)  {
        patientsHexMerkleRoot_ = patientsHexMerkleRoot;
    }

    /// @notice Sets a new Merkle hex root for patients
    /// @dev Can only be called by the contract owner
    /// @param patientsHexMerkleRoot The new Merkle hex root for patients
    function setPatientsMerkleRoot(bytes32 patientsHexMerkleRoot) public virtual  {
        patientsHexMerkleRoot_ = patientsHexMerkleRoot;
    }

    /// @notice Verifies whether a given address is a verified patient
    /// @dev Uses `MerkleProof.verify` to check if the address is in the Merkle tree
    /// @param account The address to verify
    /// @param proof The Merkle proof providing verification
    /// @return bool True if the address is a verified patient, false otherwise
    function isPatient(address account, bytes32[] calldata proof) public view returns(bool) {
        return MerkleProof.verify(proof, patientsHexMerkleRoot_, keccak256(abi.encodePacked(account)));
    }

}
