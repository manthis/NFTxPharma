// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IUser.sol";

interface IPharmacy is IUser {
    function isPharmacy(address account, bytes32[] calldata proof) external view returns (bool);
}