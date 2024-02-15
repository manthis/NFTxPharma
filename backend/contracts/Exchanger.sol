// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol"; 
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./Pharmacy.sol";
import "./Patient.sol";

contract Exchanger is ReentrancyGuard {
    IERC1155 public labContractAddress_; // Le contrat NFT pour les médicaments

    Pharmacy private pharmaciesMerkleRoot_;
    Patient private patientsMerkleRoot_;

    event OrderPrepared(uint256 orderId);
    event OrderReady(uint256 orderId);
    event OrderPayed(uint256 orderId);

    // Structure pour stocker les informations d'une commande
    struct Order {
        address pharmacy;
        address patient;
        uint256 totalPrice;
        uint256[] medicineIds;
        uint256[] amounts;
        bool isReady;
    }

    mapping(uint256 => Order) public orders_; // Mapping des commandes
    uint256 public orderIdCounter_; // Compteur pour les ID de commande

    constructor(address laboratoryContractAddress, bytes32 pharmaciesMerkleRoot, bytes32 patientsMerkleRoot) {
        labContractAddress_ = IERC1155(laboratoryContractAddress);
        pharmaciesMerkleRoot_ = new Pharmacy(pharmaciesMerkleRoot);
        patientsMerkleRoot_ = new Patient(patientsMerkleRoot);
        orderIdCounter_ = 0;
    }

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

    function makeOrderReady(uint256 orderId, bytes32[] calldata pharmacyProof) external {
        require(pharmaciesMerkleRoot_.isPharmacy(msg.sender, pharmacyProof), "Only pharmacies are allowed to make orders ready!");
        require(orderId <= orderIdCounter_, "Order does not exist!");

        orders_[orderId].isReady = true;

        emit OrderReady(orderId);
    }

    function isOrderReady(uint256 orderId) external view returns (bool) {
        require(orderId <= orderIdCounter_, "Order does not exist!");
        return orders_[orderId].isReady;
    }

    function getOrderPrice(uint256 orderId, bytes32[] calldata patientProof) external view returns (uint256) {
        require(patientsMerkleRoot_.isPatient(msg.sender, patientProof), "Only patients are allowed to check their order price!");
        require(orderId <= orderIdCounter_, "Order does not exist!");

        address orderPatient = orders_[orderId].patient;
        require(orderPatient == msg.sender, "This order has not been prepared for you!");

        return orders_[orderId].totalPrice;
    }

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
