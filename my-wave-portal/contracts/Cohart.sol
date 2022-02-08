// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

// to share profit
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";


contract Cohart is Initializable, ERC721Upgradeable, ERC721URIStorageUpgradeable, PausableUpgradeable, OwnableUpgradeable, ERC721BurnableUpgradeable, UUPSUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;

    event NftBought(address _seller, address _buyer, uint256 _price);

    CountersUpgradeable.Counter private _tokenIdCounter;
    mapping(uint256 => uint256) private tokenPrice;
    mapping(uint256 => PaymentSplitter) private profitShares;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() initializer public {
        __ERC721_init("Cohart", "COHART");
        __ERC721URIStorage_init();
        __Pausable_init();
        __Ownable_init();
        __ERC721Burnable_init();
        __UUPSUpgradeable_init();
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId)
        internal
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    // our implementation

    function makePaymentSplitter(address[] memory _sharePeople, uint256[] memory _sharePercentage)
        private returns (PaymentSplitter) {

        require(_sharePeople.length == _sharePercentage.length, "Invalid profit sharing");
        require(_sharePeople.length >= 0 && _sharePeople.length < 4, "Profit can only be shared up to 3 people");
        
        address[] memory payees;
        uint256[] memory shares;
        uint256 totalPercentage = 0;

        for (uint i = 0; i < _sharePeople.length; i++) {
            if (_sharePeople[i] != address(0) && _sharePercentage[i] > 0) {
                payees[i] = _sharePeople[i];
                shares[i] = _sharePercentage[i];
                totalPercentage += _sharePercentage[i];
            }
        }
        require(totalPercentage <= 100, "Invalid total percentage of profit sharing");

        return (new PaymentSplitter)(payees, shares);
    }

    function mintNft(
        string memory uri,
        uint256 price,
        // uint256 price
        address[] memory _sharePeople,
        uint256[] memory _sharePercentage
    ) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        address author = msg.sender;
        _safeMint(author, tokenId);
        _setTokenURI(tokenId, uri);
        // set price for token
        tokenPrice[tokenId] = price;
        // save profitShares
        PaymentSplitter paymentSplitter = makePaymentSplitter(_sharePeople, _sharePercentage);
        profitShares[tokenId] = paymentSplitter;
    }

    function buyNft(uint256 _tokenId) external payable {
        uint price = tokenPrice[_tokenId];
        require(price > 0, 'This token is not for sale');

        address buyer = msg.sender;
        address seller = ownerOf(_tokenId);
        require(buyer != seller, "You don't buy your artwork");
        require(msg.value == price, 'Incorrect value');

        _transfer(seller, msg.sender, _tokenId);
        tokenPrice[_tokenId] = 0; // not for sale anymore
        // send ETH to seller and share people
        payable(seller).transfer(msg.value);

        emit NftBought(seller, msg.sender, msg.value);
    }
}
