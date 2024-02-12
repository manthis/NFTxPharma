// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./Doctor.sol";
import "./Patient.sol";


/// @custom:security-contact maxime@auburt.in
contract Prescriptions is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {

    using Strings for uint;

    Doctor private doctors_;
    Patient private patients_;

    uint256 public tokenId_;
    string private baseURI_;

    constructor(string memory baseURI, bytes32 doctorsMerkleTree, bytes32 patientsMerkleTree) ERC721("Prescriptions", "PNFT") Ownable(msg.sender)
    {
        doctors_ = new Doctor(doctorsMerkleTree);
        patients_ = new Patient(patientsMerkleTree);
        baseURI_ = baseURI;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        baseURI_ = baseURI;
    }

    function getBaseURI() external view returns(string memory) {
        return baseURI_;
    }

    function mintPrescription(address to, bytes32[] calldata doctorsProof, bytes32[] calldata patientsProof) public {
        require(doctors_.isDoctor(msg.sender, doctorsProof), 'Only doctors are allowed to mint prescriptions!');
        require(patients_.isPatient(to, patientsProof), 'Only patients can receive prescriptions!');
        
        _safeMint(to, tokenId_);

        string memory tmp = string(abi.encodePacked(baseURI_, tokenId_.toString(), ".json"));
        _setTokenURI(tokenId_, tmp);
        tokenId_ += 1;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        //TODO check if token exists before returning its URI
        require(tokenId < tokenId_, 'Token does not exist!');
        return super.tokenURI(tokenId);
    }

    // TODO we need to override transfer possibly. Double check

    // The following function is an override required by Solidity.

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Disabled features for this ERC721

    function approve(address, uint256) pure override(ERC721, IERC721) public {
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
