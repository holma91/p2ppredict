// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PredictionMarket is ERC721URIStorage {
    mapping(uint256 => Market) public marketById;
    uint256 public currentMarketId;

    struct Market {
        address priceFeed;
        int256 strikePrice;
        uint256 expiry;
        uint256 collateral;
        bool over;
    }

    constructor() ERC721("p2ppredict", "p2p") {
        currentMarketId = 0;
    }

    function createMarket(
        address priceFeed,
        int256 strikePrice,
        uint256 expiry,
        uint256 collateral
    ) public payable returns (uint256, uint256) {
        require(collateral == msg.value, "wrong collateral amount");
        Market memory overMarket = Market(priceFeed, strikePrice, expiry, collateral, true);
        Market memory underMarket = Market(priceFeed, strikePrice, expiry, collateral, false);

        marketById[currentMarketId] = overMarket;
        _safeMint(msg.sender, currentMarketId++); // OVER

        marketById[currentMarketId] = underMarket;
        _safeMint(msg.sender, currentMarketId); // UNDER

        return (currentMarketId - 1, currentMarketId++);
    }

    function getMarket(uint256 id) public view returns (Market memory) {
        return marketById[id];
    }
}
