// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// @custom:security-contact maxime@auburt.in
contract Doctor is Ownable {

    bytes32 public doctorsHexMerkleRoot_;

    constructor(bytes32 doctorsHexMerkleRoot) Ownable(msg.sender)  {
        doctorsHexMerkleRoot_ = doctorsHexMerkleRoot;
    }

    function setDoctorsMerkleRoot(bytes32 doctorsHexMerkleRoot) public virtual  {
        doctorsHexMerkleRoot_ = doctorsHexMerkleRoot;
    }

    function isDoctor(address account, bytes32[] calldata proof) public view returns(bool) {
        return MerkleProof.verify(proof, doctorsHexMerkleRoot_, keccak256(abi.encodePacked(account)));
    }

}
