// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./User.sol";
import "./extensions/IPatient.sol";

/// @title Patient Verification Contract
/// @author Maxime AUBURTIN
/// @notice This contract is used to verify patients using a Merkle proof
/// @dev This contract utilizes OpenZeppelin's MerkleProof library for verification
/// @custom:security-contact maxime@auburt.in
contract Patient is IPatient, User {

    /// @notice Constructor that initializes the Patient contract with a specified Merkle hex root for patients.
    /// @dev Calls the User contract constructor with the provided hexMerkleRoot to set up the initial Merkle root for patient verification.
    /// @param hexMerkleRoot The Merkle hex root specifically for verifying patients.
    constructor(bytes32 hexMerkleRoot) User(hexMerkleRoot) {}

    /// @notice Verifies if a given address is a verified patient.
    /// @dev Utilizes the _isUser function from the User contract to check if the provided address, along with the Merkle proof, matches against the Merkle root for doctors.
    /// @param account The address to verify as a patient.
    /// @param proof The Merkle proof that helps to verify if the address belongs to a patient in the Merkle tree.
    /// @return bool True if the address is verified as a patient, false otherwise.
    function isPatient(address account, bytes32[] calldata proof) public view returns (bool) {
        return _isUser(account, proof);
    }
}
