// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IUser {
    function setMerkleRoot(bytes32 doctorsHexMerkleRoot) external;
    function _isUser(address account, bytes32[] calldata proof) external view returns(bool);
}
