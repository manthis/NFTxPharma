// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol"; 

contract Exchanger is ReentrancyGuard {
    IERC1155 public nftxM; // Le contrat NFT pour les médicaments
    ERC721Burnable public nftxP; // Le contrat NFT pour les ordonnances, supposé burnable

    // Structure pour stocker les informations d'une commande
    struct Order {
        address pharmacy;
        uint256 totalPrice;
        uint256[] medicineIds;
        uint256[] amounts;
        bool isPrepared;
    }

    mapping(uint256 => Order) public orders; // Mapping des commandes
    uint256 private orderIdCounter; // Compteur pour les ID de commande

    constructor(address _nftxMAddress, address _nftxPAddress) {
        nftxM = IERC1155(_nftxMAddress);
        nftxP = ERC721Burnable(_nftxPAddress);
    }

    // Fonction pour préparer une commande, appelée par la pharmacie
    function prepareOrder(uint256 _orderId, address _pharmacy, uint256[] memory _medicineIds, uint256[] memory _amounts, uint256 _totalPrice) external {
        // Ici, ajoutez des vérifications pour vous assurer que seul une pharmacie autorisée peut appeler cette fonction
        orders[_orderId] = Order(_pharmacy, _totalPrice, _medicineIds, _amounts, true);
    }

    // Fonction pour acheter des médicaments, appelée par le patient
    function buyMedicines(uint256 _orderId, uint256 _prescriptionId) external payable nonReentrant {
        // ici ajouter un controle pour s'assurer que seuls les patients peuvent utiliser cette fonction
        Order storage order = orders[_orderId];
        require(order.isPrepared, "Order must be prepared by pharmacy");
        require(msg.value == order.totalPrice, "Amount of ETH sent must be equal to total price.");

        // Transfert de l'ETH du patient à la pharmacie
        payable(order.pharmacy).transfer(msg.value);

        // Boucle pour transférer chaque médicament (NFTxM) de la pharmacie au patient
        for (uint i = 0; i < order.medicineIds.length; i++) {
            nftxM.safeTransferFrom(order.pharmacy, msg.sender, order.medicineIds[i], order.amounts[i], "");
        }

        // Brûler l'ordonnance une fois la commande complétée
        nftxP.burn(_prescriptionId);
    }
}
