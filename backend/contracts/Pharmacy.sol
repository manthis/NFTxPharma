// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Entity.sol";

// @custom:security-contact maxime@auburt.in
contract Pharmacy is Entity, Ownable {

    constructor(bytes32 merkleRoot_) Entity(merkleRoot_) Ownable(msg.sender) {}

    function setMerkleRoot(bytes32 merkleRoot_) public override onlyOwner {
        super.setMerkleRoot(merkleRoot_);
    }

}
