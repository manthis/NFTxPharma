// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./Doctor.sol";
import "./Patient.sol";
import "./Pharmacy.sol";

// TODO add events
// TODO add comments (natspec)
// TODO add possibility to fix a price for minting
// TODO add possibility to set merkle trees (setters)


/// @custom:security-contact maxime@auburt.in
contract SocialSecurity is ERC721URIStorage, ERC721Burnable, Ownable {

    using Strings for uint;

    Doctor private doctors_;
    Patient private patients_;
    Pharmacy private pharmacies_;

    uint256 public tokenId_;
    string private baseURI_;

    event BaseURISet(string baseURI);
    event TokenMinted(uint256 tokenId, address to, string tokenURI);
    event TokenTransferredToPharmacy(uint256 tokenId, address from, address to);

    constructor(string memory baseURI, bytes32 doctorsMerkleTree, bytes32 patientsMerkleTree, bytes32 pharmaciesMerkleTree) ERC721("PrescriptionNFT", "NFTxP") Ownable(msg.sender)
    {
        doctors_ = new Doctor(doctorsMerkleTree);
        patients_ = new Patient(patientsMerkleTree);
        pharmacies_ = new Pharmacy(pharmaciesMerkleTree);
        baseURI_ = baseURI;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        baseURI_ = baseURI;

        emit BaseURISet(baseURI_);
    }

    function getBaseURI() external view returns(string memory) {
        return baseURI_;
    }

    function mintPrescription(address to, bytes32[] calldata doctorsProof, bytes32[] calldata patientsProof) public {
        require(doctors_.isDoctor(msg.sender, doctorsProof), 'Only doctors are allowed to mint prescriptions!');
        require(patients_.isPatient(to, patientsProof), 'Only patients can receive prescriptions!');
        
        _safeMint(to, tokenId_);

        string memory tokenFullURI = string(abi.encodePacked(baseURI_, tokenId_.toString(), ".json"));
        _setTokenURI(tokenId_, tokenFullURI);

        emit TokenMinted(tokenId_, to, tokenFullURI);

        tokenId_ += 1;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(tokenId < tokenId_, 'Token does not exist!');
        return super.tokenURI(tokenId);
    }

    function transferToPharmacy(bytes32[] calldata patientsProof, address to, bytes32[] calldata pharmarciesProof, uint256 tokenId) public {
        require(patients_.isPatient(msg.sender, patientsProof), 'Only patients can transfer prescriptions!');
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        require(pharmacies_.isPharmacy(to, pharmarciesProof), 'Patients can only transfer presciptions to pharmacies!');

        // We perform the transfer 
        _update(to, tokenId, _msgSender());

        emit TokenTransferredToPharmacy(tokenId, msg.sender, to);
    }

    // The following function is an override required by Solidity.

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    // Disabled features for this ERC721

    function transferFrom(address, address, uint256) override(ERC721, IERC721) pure public {
        revert('Not implemented in Prescriptions');
    }

    function approve(address, uint256) override(ERC721, IERC721) pure public {
        revert('Not implemented in Prescriptions');
    }

    function getApproved(uint256) override(ERC721, IERC721) pure public returns (address) {
        revert('Not implemented in Prescriptions');
    }

    function setApprovalForAll(address, bool) override(ERC721, IERC721) pure public {
        revert('Not implemented in Prescriptions');
    }

    function isApprovedForAll(address, address) override(ERC721, IERC721) pure public returns (bool) {
        revert('Not implemented in Prescriptions');
    }
}
