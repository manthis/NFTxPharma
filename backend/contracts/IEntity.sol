// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// @custom:security-contact maxime@auburt.in
interface IEntity {
    function setMerkleRoot(bytes32 merkleRoot_) external;
    function isWhitelisted(address account_, bytes32[] calldata proof_) external view returns(bool);
}
