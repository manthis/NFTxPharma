// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./IEntity.sol";

// @custom:security-contact maxime@auburt.in
contract Entity is IEntity {
    bytes32 public merkleRoot;

    constructor(bytes32 merkleRoot_) {
        merkleRoot = merkleRoot_;
    }

    function setMerkleRoot(bytes32 merkleRoot_) public virtual override {
        merkleRoot = merkleRoot_;
    }

    function isWhitelisted(address account_, bytes32[] calldata proof_) public view override returns(bool) {
        return MerkleProof.verify(proof_, merkleRoot, keccak256(abi.encodePacked(account_)));
    }

}
