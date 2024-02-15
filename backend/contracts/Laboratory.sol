// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./Pharmacy.sol";

contract Laboratory is ERC1155, Ownable {

    Pharmacy private pharmacies_; // the merkle root for pharmacies

    struct Medication { // Structure to store medication data
        string name;
        uint256 price;
        uint256 rate;
    }

    mapping (uint256 => Medication) public medicationsData_; // Mapping to store medication data

    constructor(string memory BaseURI, bytes32 pharmaciesMerkleRoot) ERC1155(BaseURI) Ownable(msg.sender) {
        pharmacies_ = new Pharmacy(pharmaciesMerkleRoot);
    }

    function setPharmaciesMerkleRoot(bytes32 pharmaciesMerkleRoot) public onlyOwner {
        pharmacies_ = new Pharmacy(pharmaciesMerkleRoot);
    }

    function addOrUpdateMedicationData(uint256 medicinationId, string memory name, uint256 price, uint256 rate) external onlyOwner {
       medicationsData_[medicinationId] = Medication({
           name: name,
           price: price,
           rate: rate
       });
    }

    function getMedicationData(uint256 medicationId) external view returns (string memory, uint256, uint256) {
        return (
            medicationsData_[medicationId].name, 
            medicationsData_[medicationId].price, 
            medicationsData_[medicationId].rate
        );
    }

    function calculateTotalPrice(uint256[] calldata medicineIds, uint256[] calldata amounts) public view returns (uint256) {
        require(medicineIds.length == amounts.length, "Arrays should have the same lengths!");

        uint256 totalPrice = 0;
        for (uint256 i = 0; i < medicineIds.length; i++) {
            totalPrice += medicationsData_[medicineIds[i]].price * amounts[i];
        }

        return totalPrice;
    }

    function mintMedications(uint256[] calldata medicineIds, uint256[] calldata amounts, bytes32[] calldata pharmacyProof) external payable {
        require(pharmacies_.isPharmacy(msg.sender, pharmacyProof), "Only pharmacies are allowed to mint!");

        uint256 totalPrice = calculateTotalPrice(medicineIds, amounts);
        require(msg.value >= totalPrice, "Unsufficient balance!");

        uint256 medecineIdsLength = medicineIds.length;
        for (uint256 i = 0; i < medecineIdsLength; i++) {
            _mint(msg.sender, medicineIds[i], amounts[i], ""); 
        }

        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
    }
}
