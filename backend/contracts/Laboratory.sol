// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "./Pharmacy.sol";

contract LaboratoryNFTxM is ERC1155, Ownable {

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

    function setPharmaciesMerkleRoot(bytes32 pharmaciesMerkleRoot) external onlyOwner {
        pharmacies_ = new Pharmacy(pharmaciesMerkleRoot);
    }

    // Définir le prix d'un médicament
    // TODO à refaire
    function setMedicinePrice(uint256 _medicineId, uint256 _price) external onlyOwner {
        medicinePrices[_medicineId] = _price;
    }

    // Fonction pour calculer le prix total d'une commande de médicaments
    function calculateTotalPrice(uint256[] calldata _medicineIds, uint256[] calldata _amounts) external view returns (uint256) {
        require(_medicineIds.length == _amounts.length, "Arrays should have the same lengths!");

        uint256 totalPrice = 0;
        for (uint256 i = 0; i < _medicineIds.length; i++) {
            totalPrice += medicinePrices[_medicineIds[i]] * _amounts[i];
        }

        return totalPrice;
    }

    // Fonction pour minter des médicaments, appelable par les pharmacies autorisées
    function mintMedicines(uint256[] calldata _medicineIds, uint256[] calldata _amounts, bytes32[] calldata _merkleProof) external payable {
        // Vérification de l'autorisation de la pharmacie via la preuve de Merkle
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(_merkleProof, pharmaciesMerkleRoot, leaf), "Only pharmacies authorized!");

        uint256 totalPrice = 0;
        for (uint256 i = 0; i < _medicineIds.length; i++) {
            totalPrice += medicinePrices[_medicineIds[i]] * _amounts[i];
        }

        require(msg.value >= totalPrice, "Paiement insuffisant");

        // Minter les médicaments pour la pharmacie
        for (uint256 i = 0; i < _medicineIds.length; i++) {
            _mint(msg.sender, _medicineIds[i], _amounts[i], "");
        }

        // Rembourser l'excédent de paiement le cas échéant
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
    }
}

/*
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact maxime@auburt.in
contract Laboratory is Ownable {   

    struct Medication {
        string name;
        uint256 price;
        uint256 rate;
    }

    mapping (uint256 => Medication) public medecinesPrices_;

    constructor(uint[] memory ids, string[] memory names, uint[] memory prices, uint[] memory rates) Ownable(msg.sender) {
        require((ids.length == names.length) && (ids.length == prices.length) && (ids.length == rates.length), 'All arrays must have the same length!');

        uint256 length = ids.length;
        for (uint256 i = 0; i < length; i++) {
            medecinesPrices_[ids[i]] = Medication({
                name: names[i],
                price: prices[i], 
                rate: rates[i]});
        }
    }

    function getMedecinePrice(uint256 id) external view returns(uint256) {
        return medecinesPrices_[id].price;
    }
}
*/
