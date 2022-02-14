// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CohartMint is ERC1155, Ownable {
    
    mapping (uint256 => address) tokenCreator;

    constructor()
        ERC1155("https://gateway.pinata.cloud/ipfs/QmTN32qBKYqnyvatqfnU8ra6cYUGNxpYziSddCatEmopLR/metadata/api/item/{id}.json")
    {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    // tokenId should be stored and incremented by Cohart's backend
    function mint(uint256 tokenId, uint256 amount)
        public
    {
        require(tokenCreator[tokenId] == address(0), "TokenId is existed!");
        
        tokenCreator[tokenId] = msg.sender;
        _mint(msg.sender, tokenId, amount, "0x000");
    }
}
