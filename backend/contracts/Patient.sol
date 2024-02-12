// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// @custom:security-contact maxime@auburt.in
contract Patient is Ownable {

    bytes32 public patientsHexMerkleRoot_;

    constructor(bytes32 patientsHexMerkleRoot) Ownable(msg.sender)  {
        patientsHexMerkleRoot_ = patientsHexMerkleRoot;
    }

    function setPatientsMerkleRoot(bytes32 patientsHexMerkleRoot) public virtual  {
        patientsHexMerkleRoot_ = patientsHexMerkleRoot;
    }

    function isPatient(address account, bytes32[] calldata proof) public view returns(bool) {
        return MerkleProof.verify(proof, patientsHexMerkleRoot_, keccak256(abi.encodePacked(account)));
    }

}
