// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./extensions/IPharmacy.sol";

/// @title Laboratory Medication Management and Minting (NFTxM)
/// @author Maxime AUBURTIN
/// @notice This contract manages medication data and minting of medication NFTs for pharmacies
/// @dev Extends OpenZeppelin's ERC1155 for NFT functionality and Ownable for ownership management
/// @custom:security-contact maxime@auburt.in
contract Laboratory is ERC1155, Ownable {

    /// @dev Reference to Pharmacy contract for pharmacy verification
    IPharmacy private pharmaContract_; 

    /// @notice Emitted when the Pharmacy contract address is updated
    event PharmacyContractAddressSet(address);
    /// @notice Emitted when medication data is updated
    event MedicationDataUpdated(uint256, string, uint256, uint256);
    /// @notice Emitted when a medication (NFTxM) is minted
    event MedicationMinted(uint256, address);

    /// @dev Struct to store medication data
    struct Medication {
        string name;
        uint256 price;
        uint256 rate;
    }

    /// @dev Mapping of medication IDs to their data
    mapping (uint256 => Medication) public medicationsData_; // Mapping to store medication data

    /// @notice Constructor to initialize contract with base URI and Merkle roots for verification
    /// @param BaseURI Base URI for token metadata
    /// @param pharmaContractAddress The address of the Pharmacy contract
    constructor(string memory BaseURI, address pharmaContractAddress) ERC1155(BaseURI) Ownable(msg.sender) {
        pharmaContract_ = IPharmacy(pharmaContractAddress);
    }

    function setPharmacyContractAddress(address pharmaContractAddress) public onlyOwner {
        pharmaContract_ = IPharmacy(pharmaContractAddress);
        emit PharmacyContractAddressSet(pharmaContractAddress);
    }

    /// @notice Adds or updates medication data
    /// @dev Can only be called by the contract owner
    /// @param medicationId ID of the medication
    /// @param name Name of the medication
    /// @param price Price of the medication
    /// @param rate Rate of the medication (could be related to dosage or strength)
    function addOrUpdateMedicationData(uint256 medicationId, string memory name, uint256 price, uint256 rate) external onlyOwner {
       medicationsData_[medicationId] = Medication({
           name: name,
           price: price,
           rate: rate
       });
       emit MedicationDataUpdated(medicationId, name, price, rate);
    }

    /// @notice Retrieves medication data
    /// @param medicationId ID of the medication to retrieve data for
    /// @return name Name of the medication
    /// @return price Price of the medication
    /// @return rate Rate of the medication
    function getMedicationData(uint256 medicationId) external view returns (string memory, uint256, uint256) {
        return (
            medicationsData_[medicationId].name, 
            medicationsData_[medicationId].price, 
            medicationsData_[medicationId].rate
        );
    }

    /// @notice Calculates the total price for a list of medications (NFTxM) and their amounts
    /// @param medicineIds Array of medication IDs
    /// @param amounts Array of amounts for each medication ID
    /// @return totalPrice Total price for the medications
    function calculateTotalPrice(uint256[] calldata medicineIds, uint256[] calldata amounts) public view returns (uint256) {
        require(medicineIds.length == amounts.length, "Arrays should have the same lengths!");

        uint256 totalPrice = 0;
        for (uint256 i = 0; i < medicineIds.length; i++) {
            totalPrice += medicationsData_[medicineIds[i]].price * amounts[i];
        }

        return totalPrice;
    }

    /// @notice Mints medications (NFTxM) for a pharmacy, verifying it through a Merkle proof
    /// @dev Requires sufficient payment for the total price of the medications
    /// @param medicineIds Array of medication IDs to mint
    /// @param amounts Array of amounts for each medication ID
    /// @param pharmacyProof Merkle proof to verify the calling pharmacy
    function mintMedications(uint256[] calldata medicineIds, uint256[] calldata amounts, bytes32[] calldata pharmacyProof) external payable {
        require(pharmaContract_.isPharmacy(msg.sender, pharmacyProof), "Only pharmacies are allowed to mint!");

        uint256 totalPrice = calculateTotalPrice(medicineIds, amounts);
        require(msg.value >= totalPrice, "Unsufficient balance!");

        uint256 medecineIdsLength = medicineIds.length;
        for (uint256 i = 0; i < medecineIdsLength; i++) {
            _mint(msg.sender, medicineIds[i], amounts[i], ""); 
        }

        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit MedicationMinted(totalPrice, msg.sender);
    }
}
