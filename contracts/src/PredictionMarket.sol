// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {Base64} from "./libraries/Base64.sol";

contract PredictionMarket is ERC721URIStorage {
    mapping(uint256 => Market) public marketById;
    uint256 public currentMarketId;

    string baseSvg =
        "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' />";

    string textStart = "<text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

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

    function createURI(bool over) internal view returns (string memory) {
        string memory strike = "$30";
        string memory asset = "SOL";
        string memory direction = over ? "OVER" : "UNDER";
        string memory finalSvg = string.concat(baseSvg, textStart, asset, " ", direction, " ", strike, "</text></svg>");
        string memory json = Base64.encode(
            bytes(
                string.concat(
                    '{"name": "',
                    asset,
                    " ",
                    direction,
                    " ",
                    strike,
                    '", "description": "A market on p2ppredict.", "image": "data:image/svg+xml;base64,',
                    Base64.encode(bytes(finalSvg)),
                    '"}'
                )
            )
        );
        string memory finalTokenUri = string.concat("data:application/json;base64,", json);

        return finalTokenUri;
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
        _safeMint(msg.sender, currentMarketId); // OVER
        _setTokenURI(currentMarketId++, createURI(true));

        marketById[currentMarketId] = underMarket;
        _safeMint(msg.sender, currentMarketId); // UNDER
        _setTokenURI(currentMarketId++, createURI(false));

        return (currentMarketId - 2, currentMarketId - 1);
    }

    function getMarket(uint256 id) public view returns (Market memory) {
        return marketById[id];
    }
}
