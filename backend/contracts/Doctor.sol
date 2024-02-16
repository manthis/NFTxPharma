// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./User.sol";
import "./extensions/IDoctor.sol";

/// @title Doctor Verification Contract
/// @author Maxime AUBURTIN
/// @notice This contract is used to verify doctors using a Merkle proof
/// @dev This contract utilizes OpenZeppelin's MerkleProof library for verification
/// @custom:security-contact maxime@auburt.in
contract Doctor is IDoctor, User {

    /// @notice Constructor that initializes the Doctor contract with a specified Merkle hex root for doctors.
    /// @dev Calls the User contract constructor with the provided hexMerkleRoot to set up the initial Merkle root for doctor verification.
    /// @param hexMerkleRoot The Merkle hex root specifically for verifying doctors.
    constructor(bytes32 hexMerkleRoot) User(hexMerkleRoot) {}

    /// @notice Verifies if a given address is a verified doctor.
    /// @dev Utilizes the _isUser function from the User contract to check if the provided address, along with the Merkle proof, matches against the Merkle root for doctors.
    /// @param account The address to verify as a doctor.
    /// @param proof The Merkle proof that helps to verify if the address belongs to a doctor in the Merkle tree.
    /// @return bool True if the address is verified as a doctor, false otherwise.
    function isDoctor(address account, bytes32[] calldata proof) public view returns (bool) {
        return _isUser(account, proof);
    }
}
