// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// @custom:security-contact maxime@auburt.in
contract Pharmacy is Ownable {

    bytes32 public pharmaciesHexMerkleRoot_;

    constructor(bytes32 pharmaciesHexMerkleRoot) Ownable(msg.sender)  {
        pharmaciesHexMerkleRoot_ = pharmaciesHexMerkleRoot;
    }

    function setPharmacyMerkleRoot(bytes32 pharmaciesHexMerkleRoot) public virtual  {
        pharmaciesHexMerkleRoot_ = pharmaciesHexMerkleRoot;
    }

    function isPharmacy(address account, bytes32[] calldata proof) public view returns(bool) {
        return MerkleProof.verify(proof, pharmaciesHexMerkleRoot_, keccak256(abi.encodePacked(account)));
    }

}
