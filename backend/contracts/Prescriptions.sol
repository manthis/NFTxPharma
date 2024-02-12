// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/// @custom:security-contact maxime@auburt.in
contract Prescriptions is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    uint256 private _nextTokenId;

    // TODO We must override principal transfer method (transferFrom)
    // TODO We must restrict the use of transfer function (safeTransferFrom) from patient to pharmacies
    // TODO We must ensure we can only transfer this type of token to pharmacies (maybe the opposite too)
    // TODO We must restrict access to owner only to all approval methods (approve)

    constructor()
        ERC721("Prescriptions", "PNFT")
        Ownable(msg.sender)
    {}

    function _baseURI() internal pure override returns (string memory) {
        return "https://nftstorage.link/ipfs/";
    }

    // TODO create a modifier to check if the caller is a doctor and replace onlyOwner
    // TODO ensure "to" address is a valid patient 
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
