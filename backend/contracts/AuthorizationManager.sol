// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// @custom:security-contact maxime@auburt.in
contract AuthorizationManager is Ownable {
    bytes32 public doctorsMerkleRoot;
    bytes32 public patientsMerkleRoot;
    bytes32 public pharmaciesMerkleRoot;

    constructor(bytes32 _doctorsMerkleRoot, bytes32 _patientsMerkleRoot, bytes32 _pharmaciesMerkleRoot) Ownable(msg.sender) {
        doctorsMerkleRoot = _doctorsMerkleRoot;
        patientsMerkleRoot = _patientsMerkleRoot;
        pharmaciesMerkleRoot = _pharmaciesMerkleRoot;
    }

    function setDoctorsMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        doctorsMerkleRoot = _merkleRoot;
    }

    function setPatientsMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        patientsMerkleRoot = _merkleRoot;
    }

    function setPharmaciesMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        pharmaciesMerkleRoot = _merkleRoot;
    }

    function isDoctor(address _account, bytes32[] calldata _proof) public view returns(bool) {
        return MerkleProof.verify(_proof, doctorsMerkleRoot, keccak256(abi.encodePacked(_account)));
    }

    function isPatient(address _account, bytes32[] calldata _proof) public view returns(bool) {
        return MerkleProof.verify(_proof, patientsMerkleRoot, keccak256(abi.encodePacked(_account)));
    }

    function isPharmacy(address _account, bytes32[] calldata _proof) public view returns(bool) {
        return MerkleProof.verify(_proof, pharmaciesMerkleRoot, keccak256(abi.encodePacked(_account)));
    }
}
