// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./extensions/IDoctor.sol";
import "./extensions/IPatient.sol";
import "./extensions/IPharmacy.sol";


/// @title Prescription NFT (NFTxP) Management for Social Security System
/// @author Maxime AUBURTIN
/// @notice This contract allows doctors to mint prescription NFTs (NFTxP) for patients, and patients to transfer these to pharmacies
/// @dev Extends ERC721URIStorage for NFT metadata management and ERC721Burnable for burning functionality
/// @custom:security-contact maxime@auburt.in
contract SocialSecurity is ERC721URIStorage, ERC721Burnable, Ownable, ReentrancyGuard {

    using Strings for uint;

    /// @dev Reference to Doctor contract for doctor verification
    IDoctor private doctors_;
    /// @dev Reference to Patient contract for patient verification
    IPatient private patients_;
    /// @dev Reference to Pharmacy contract for pharmacy verification
    IPharmacy private pharmacies_;

    /// @notice Tracks the next token ID to be minted
    uint256 public tokenId_;
    /// @dev Base URI for token metadata
    string private baseURI_;

    /// @notice Emitted when the base URI is updated
    event BaseURISet(string baseURI);
    /// @notice Emitted when a prescription token (NFTxP) is minted
    event TokenMinted(uint256 tokenId, address to, string tokenURI);
    /// @notice Emitted when a prescription token (NFTxP) is transferred to a pharmacy
    event TokenTransferredToPharmacy(uint256 tokenId, address from, address to);

    /// @notice Constructor to initialize contract with base URI and Merkle roots for verification
    /// @param baseURI Base URI for token metadata
    /// @param doctorContractAddress The address of the Doctor contract
    /// @param patienContractAddress The address of the Patient contract
    /// @param pharmacyContractAdress The address of the Pharmacy contract
    constructor(string memory baseURI, address doctorContractAddress, address patienContractAddress, address pharmacyContractAdress) ERC721("PrescriptionNFT", "NFTxP") Ownable(msg.sender)
    {
        doctors_ = IDoctor(doctorContractAddress);
        patients_ = IPatient(patienContractAddress);
        pharmacies_ = IPharmacy(pharmacyContractAdress);
        baseURI_ = baseURI;
    }

    /// @notice Updates the base URI for token metadata
    /// @param baseURI New base URI
    function setBaseURI(string calldata baseURI) external onlyOwner {
        baseURI_ = baseURI;

        emit BaseURISet(baseURI_);
    }

    /// @notice Retrieves the current base URI
    /// @return Current base URI
    function getBaseURI() external view returns(string memory) {
        return baseURI_;
    }

    /// @notice Mints a new prescription NFT (NFTxpP) for a patient
    /// @dev Requires verification proofs for doctor and patient
    /// @param to Patient address to receive the NFTxP
    /// @param doctorsProof Merkle proof for doctor verification
    /// @param patientsProof Merkle proof for patient verification
    function mintPrescription(address to, bytes32[] calldata doctorsProof, bytes32[] calldata patientsProof) public nonReentrant() {
        require(doctors_.isDoctor(msg.sender, doctorsProof), 'Only doctors are allowed to mint prescriptions!');
        require(patients_.isPatient(to, patientsProof), 'Only patients can receive prescriptions!');
        
        _safeMint(to, tokenId_);

        string memory tokenFullURI = string(abi.encodePacked(baseURI_, tokenId_.toString(), ".json"));
        _setTokenURI(tokenId_, tokenFullURI);

        emit TokenMinted(tokenId_, to, tokenFullURI);

        tokenId_ += 1;
    }

    /// @notice Overrides tokenURI to ensure token exists before returning its URI
    /// @param tokenId ID of the token (NFTxP)
    /// @return URI of the specified token
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(tokenId < tokenId_, 'Token does not exist!');
        return super.tokenURI(tokenId);
    }

    /// @notice Allows a patient to transfer a prescription NFT (NFTxP) to a pharmacy
    /// @dev Requires verification proofs for patient and pharmacy
    /// @param patientsProof Merkle proof for patient verification
    /// @param to Pharmacy address to receive the NFTxP
    /// @param pharmarciesProof Merkle proof for pharmacy verification
    /// @param tokenId ID of the token to transfer
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
