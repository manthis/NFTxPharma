// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol"; 
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./Pharmacy.sol";
import "./Patient.sol";

/// @title Medicine Exchange Contract
/// @author Maxime AUBURTIN
/// @notice This contract manages the exchange of medicines between pharmacies and patients
/// @dev Utilizes non-fungible tokens (NFTxM) to represent medicines and employs a non-reentrancy guard for secure transactions
/// @custom:security-contact maxime@auburt.in
contract Exchanger is ReentrancyGuard {

    /// @notice Address of the NFT contract representing medicines (NFTxM)
    IERC1155 public labContractAddress_; 

    /// @dev Reference to Pharmacy contract for pharmacy verification
    Pharmacy private pharmaciesMerkleRoot_;
    /// @dev Reference to Patient contract for patient verification
    Patient private patientsMerkleRoot_;

    /// @notice Event emitted when an order is prepared
    event OrderPrepared(uint256 orderId);
    /// @notice Event emitted when an order is ready for pickup/payment
    event OrderReady(uint256 orderId);
    /// @notice Event emitted when an order is paid
    event OrderPayed(uint256 orderId);

    /// @dev Struct to store order details
    struct Order {
        address pharmacy;
        address patient;
        uint256 totalPrice;
        uint256[] medicineIds;
        uint256[] amounts;
        bool isReady;
    }

    /// @dev Mapping of order IDs to orders (Order structs)
    mapping(uint256 => Order) public orders_; 
    /// @dev Counter to keep track of order IDs
    uint256 public orderIdCounter_;

    /// @notice Constructor to set initial contract addresses and Merkle roots
    /// @param laboratoryContractAddress Address of the NFT contract for medicines
    /// @param pharmaciesMerkleRoot Merkle root for verifying pharmacies
    /// @param patientsMerkleRoot Merkle root for verifying patients
    constructor(address laboratoryContractAddress, bytes32 pharmaciesMerkleRoot, bytes32 patientsMerkleRoot) {
        labContractAddress_ = IERC1155(laboratoryContractAddress);
        pharmaciesMerkleRoot_ = new Pharmacy(pharmaciesMerkleRoot);
        patientsMerkleRoot_ = new Patient(patientsMerkleRoot);
        orderIdCounter_ = 0;
    }

    /// @notice Prepares an order of medicines
    /// @dev Can only be called by verified pharmacies
    /// @param pharmacy The pharmacy preparing the order
    /// @param patient The patient for whom the order is prepared
    /// @param medicineIds Array of medicine IDs in the order
    /// @param amounts Array of amounts for each medicine ID
    /// @param totalPriceInWei Total price of the order in Wei
    /// @param pharmacyProof Merkle proof to verify the pharmacy
    function prepareOrder(
        address pharmacy, 
        address patient,
        uint256[] memory medicineIds, 
        uint256[] memory amounts, 
        uint256 totalPriceInWei, 
        bytes32[] calldata pharmacyProof
    ) external {
        require(pharmaciesMerkleRoot_.isPharmacy(msg.sender, pharmacyProof), "Only pharmacies are allowed to prepare orders!");
        require(pharmacy == msg.sender, "Provided pharmacy must be the one calling this function!");
        require(medicineIds.length == amounts.length, "Arrays should have the same lengths!");
        
        orderIdCounter_++;
        orders_[orderIdCounter_] = Order(pharmacy, patient, totalPriceInWei, medicineIds, amounts, false);

        emit OrderPrepared(orderIdCounter_);
    }

    /// @notice Marks an order as ready for pickup/payment (when pharmacy is ready)
    /// @dev Can only be called by verified pharmacies
    /// @param orderId ID of the order to mark as ready
    /// @param pharmacyProof Merkle proof to verify the pharmacy
    function makeOrderReady(uint256 orderId, bytes32[] calldata pharmacyProof) external {
        require(pharmaciesMerkleRoot_.isPharmacy(msg.sender, pharmacyProof), "Only pharmacies are allowed to make orders ready!");
        require(orderId <= orderIdCounter_, "Order does not exist!");

        orders_[orderId].isReady = true;

        emit OrderReady(orderId);
    }

    /// @notice Checks if an order is ready
    /// @param orderId ID of the order to check
    /// @return bool True if the order is ready, false otherwise
    function isOrderReady(uint256 orderId) external view returns (bool) {
        require(orderId <= orderIdCounter_, "Order does not exist!");
        return orders_[orderId].isReady;
    }

    /// @notice Retrieves the price of an order
    /// @dev Can only be called by verified patients
    /// @param orderId ID of the order to check
    /// @param patientProof Merkle proof to verify the patient
    /// @return uint256 Total price of the order in Wei
    function getOrderPrice(uint256 orderId, bytes32[] calldata patientProof) external view returns (uint256) {
        require(patientsMerkleRoot_.isPatient(msg.sender, patientProof), "Only patients are allowed to check their order price!");
        require(orderId <= orderIdCounter_, "Order does not exist!");

        address orderPatient = orders_[orderId].patient;
        require(orderPatient == msg.sender, "This order has not been prepared for you!");

        return orders_[orderId].totalPrice;
    }

    /// @notice Pays for an order and transfers the medicines (NFTxM) from the pharmacy to the patient
    /// @dev Can only be called by verified patients for ready orders, employs a non-reentrancy guard
    /// @param orderId ID of the order to pay
    /// @param patientProof Merkle proof to verify the patient
    function payOrder(uint256 orderId, bytes32[] calldata patientProof) external payable nonReentrant {
        require(patientsMerkleRoot_.isPatient(msg.sender, patientProof), "Only patients are allowed to check their order price!");
        require(orderId <= orderIdCounter_, "Order does not exist!");

        address orderPatient = orders_[orderId].patient;
        require(orderPatient == msg.sender, "This order has not been prepared for you!");

        require(orders_[orderId].isReady, "Order must be made ready by pharmacy");

        Order storage order = orders_[orderId];
        require(msg.value == order.totalPrice, "Amount of ETH sent must be equal to order total price.");

        // We transfer ETH from the patient to the pharmacy
        payable(order.pharmacy).transfer(msg.value);

        // We transfer each NFTxM (medicine nft) from the pharmacy to the patient
        uint medicineIdsLength = order.medicineIds.length;
        for (uint i = 0; i < medicineIdsLength; i++) {
            // Pas sur d'avoir besoin du parametre data vide de sageTransferFrom
            labContractAddress_.safeTransferFrom(order.pharmacy, msg.sender, order.medicineIds[i], order.amounts[i], "");
        }

        emit OrderPayed(orderId);
    }
}
