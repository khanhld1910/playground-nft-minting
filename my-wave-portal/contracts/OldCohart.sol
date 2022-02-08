// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract OldCohart is ERC721, ERC721URIStorage, Pausable, Ownable, ERC721Burnable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    // TODO: save user collection of NFT
    mapping(uint256 => Attributes) public attributes;
    mapping(uint256 => Share[6]) private profitShares;


    // TODO: clear profitShares of NFT after it was purchased

    struct Attributes {
      string name;
      uint256 id;
      string[] tags;
    }

    struct Share {
      address to;
      string name;
      uint8 percentage;
    }

    constructor() ERC721("Cohart", "COHART") payable {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setProfitShares(uint256 tokenId, Share[] memory shares) private {
      require(shares.length <= 4 && shares.length > 0 , "Invalid profit sharing configuration");
      // TODO: check if total percentage is valid (100%)
      for (uint8 i = 0; i < shares.length; i++) {
        console.log("Share people: %s, %s, %d", shares[i].name, shares[i].to, shares[i].percentage);
        if (
          // keccak256(abi.encodePacked(shares[i].name)) != "" &&
          shares[i].to != address(0) &&
          shares[i].percentage > 0
        ) {
          profitShares[tokenId][i] = Share({
            to: shares[i].to,
            name: shares[i].name,
            percentage: shares[i].percentage
          });
        }
      }
    }

    function safeMint(
      address to,
      string memory uri,
      string memory name,
      string[] memory tags,
      Share[] memory shares,
      string memory collection
    ) public {
      uint256 tokenId = _tokenIdCounter.current();
      _tokenIdCounter.increment();
      _safeMint(to, tokenId);
      _setTokenURI(tokenId, uri);
      
      attributes[tokenId] = Attributes(name, tokenId, tags);

      // set people to share profit
      setProfitShares(tokenId, shares);
    }

    function getTags(uint256 tokenId) public view returns (string[] memory) {
      Attributes memory att = attributes[tokenId];
      return att.tags;
    }

    function getShares(uint256 tokenId) public view returns (Share[6] memory) {
      // TODO: validate the tokenId ??
      // Share[6] memory shares = profitShares[tokenId];
      // return shares;
      return profitShares[tokenId];
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
