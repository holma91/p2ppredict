// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {Exchange} from "./Exchange.sol";

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {Base64} from "./libraries/Base64.sol";
import {OrderTypes} from "./libraries/OrderTypesNew.sol";

interface IExchange {
    function createMakerAsk(OrderTypes.MakerOrder calldata makerAsk) external;
}

contract PredictionMarket is ERC721URIStorage {
    address public deployer;
    address public exchangeAddress;

    mapping(uint256 => Market) public marketById;
    uint256 public currentMarketId;

    mapping(uint256 => Prediction) public predictionById;
    uint256 public currentPredictionId;

    string baseSvg =
        "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' />";

    string textStart = "<text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    struct Prediction {
        Market market;
        bool over;
    }

    struct Market {
        address priceFeed;
        int256 strikePrice;
        uint256 expiry;
        uint256 collateral;
    }

    event MarketCreated(
        address priceFeed,
        int256 strikePrice,
        uint256 expiry,
        uint256 collateral,
        uint256 overPredictionId,
        uint256 underPredictionId
    );

    constructor() ERC721("p2ppredict", "p2p") {
        deployer = msg.sender;
        currentMarketId = 0;
        currentPredictionId = 0;
    }

    function setExchangeAddress(address _exchange) public {
        require(msg.sender == deployer, "Only deployer can change the prediction market address");
        exchangeAddress = _exchange;
    }

    function createURI(bool over) internal view returns (string memory) {
        string memory strike = "$30";
        string memory asset = "SOL";
        string memory direction = over ? "OVER" : "UNDER";
        string memory finalSvg = string.concat(
            baseSvg,
            textStart,
            asset,
            " ",
            direction,
            " ",
            strike,
            "</text></svg>"
        );
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

    function createMarket(Market calldata market)
        public
        payable
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        require(market.collateral == msg.value, "wrong collateral amount");
        marketById[currentMarketId++] = market;

        Prediction memory over = Prediction(market, true);
        Prediction memory under = Prediction(market, false);

        predictionById[currentPredictionId] = over;
        _safeMint(msg.sender, currentPredictionId); // OVER
        _setTokenURI(currentPredictionId++, createURI(true));

        predictionById[currentPredictionId] = under;
        _safeMint(msg.sender, currentPredictionId); // UNDER
        _setTokenURI(currentPredictionId++, createURI(false));

        emit MarketCreated(
            market.priceFeed,
            market.strikePrice,
            market.expiry,
            market.collateral,
            currentPredictionId - 2,
            currentPredictionId - 1
        );

        return (currentMarketId - 1, currentPredictionId - 2, currentPredictionId - 1);
    }

    function createMarketWithPosition(
        Market calldata market,
        bool over,
        uint256 listPrice,
        uint256 endTime,
        int256 tresholdPrice
    )
        public
        payable
        returns (
            uint256,
            uint256,
            uint256
        )
    {
        (uint256 marketId, uint256 overId, uint256 underId) = createMarket(market);

        // odds = collateral / listPrice

        OrderTypes.MakerOrder memory makerAsk = OrderTypes.MakerOrder(
            true,
            msg.sender,
            listPrice,
            underId,
            block.timestamp,
            endTime,
            market.priceFeed,
            tresholdPrice
        );

        if (over) {
            // list under prediction
            IExchange(exchangeAddress).createMakerAsk(makerAsk);
        } else {
            // list over prediction
            makerAsk.tokenId = overId;
            IExchange(exchangeAddress).createMakerAsk(makerAsk);
        }

        return (marketId, overId, underId);
    }

    function exercise(uint256 id) public {
        require(ownerOf(id) == msg.sender, "PredictionMarket: not the correct owner");

        Prediction memory prediction = predictionById[id];
        require(block.timestamp >= prediction.market.expiry, "PredictionMarket: not at expiry yet");

        (, int256 price, , , ) = AggregatorV3Interface(prediction.market.priceFeed).latestRoundData();
        if (prediction.over) {
            require(price >= prediction.market.strikePrice, "PredictionMarket: can't exercise a losing bet");
        } else {
            require(price < prediction.market.strikePrice, "PredictionMarket: can't exercise a losing bet");
        }

        _burn(id);
        (bool sent, ) = msg.sender.call{value: prediction.market.collateral}("");
        require(sent, "failed ether transfer");
    }

    function getPrediction(uint256 id) public view returns (Prediction memory) {
        return predictionById[id];
    }

    function getMarket(uint256 id) public view returns (Market memory) {
        return marketById[id];
    }
}
