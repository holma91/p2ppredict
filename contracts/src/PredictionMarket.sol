// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {Exchange} from "./Exchange.sol";

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "chainlink/contracts/src/v0.8/interfaces/AggregatorInterface.sol";

import {OrderTypes} from "./libraries/OrderTypes.sol";

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

    struct Prediction {
        Market market;
        bool over;
        uint256 id;
    }

    struct Market {
        address priceFeed;
        int256 strikePrice;
        uint256 expiry;
        uint256 collateral;
        string ipfsOver;
        string ipfsUnder;
    }

    event MarketCreated(
        address priceFeed,
        int256 strikePrice,
        uint256 expiry,
        uint256 collateral,
        uint256 marketId,
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

        Prediction memory over = Prediction(market, true, currentPredictionId);
        predictionById[currentPredictionId] = over;
        _safeMint(msg.sender, currentPredictionId); // OVER
        _setTokenURI(currentPredictionId++, market.ipfsOver);

        Prediction memory under = Prediction(market, false, currentPredictionId);
        predictionById[currentPredictionId] = under;
        _safeMint(msg.sender, currentPredictionId); // UNDER
        _setTokenURI(currentPredictionId++, market.ipfsUnder);

        emit MarketCreated(
            market.priceFeed,
            market.strikePrice,
            market.expiry,
            market.collateral,
            currentMarketId - 1,
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

        OrderTypes.MakerOrder memory makerAsk = OrderTypes.MakerOrder(
            msg.sender,
            address(this),
            listPrice,
            underId,
            block.timestamp,
            endTime,
            market.priceFeed,
            tresholdPrice
        );

        if (over) {
            // list under prediction
            Exchange(exchangeAddress).createMakerAsk(makerAsk);
        } else {
            // list over prediction
            makerAsk.tokenId = overId;
            Exchange(exchangeAddress).createMakerAsk(makerAsk);
        }

        return (marketId, overId, underId);
    }

    function exercise(uint256 id) public {
        require(ownerOf(id) == msg.sender, "PredictionMarket: not the correct owner");
        require(predictionById[id].market.priceFeed != address(0), "Market is dead");

        Prediction memory prediction = predictionById[id];
        require(block.timestamp >= prediction.market.expiry, "PredictionMarket: not at expiry yet");

        int256 price = AggregatorInterface(prediction.market.priceFeed).latestAnswer();
        if (prediction.over) {
            require(price >= prediction.market.strikePrice, "PredictionMarket: can't exercise a losing bet");
        } else {
            require(price < prediction.market.strikePrice, "PredictionMarket: can't exercise a losing bet");
        }

        delete predictionById[id];
        if (prediction.over) {
            delete predictionById[id + 1];
        } else {
            delete predictionById[id - 1];
        }
        (bool sent, ) = msg.sender.call{value: prediction.market.collateral}("");
        require(sent, "failed ether transfer");
    }

    function getPrediction(uint256 id) public view returns (Prediction memory) {
        return predictionById[id];
    }

    function getMarket(uint256 id) public view returns (Market memory) {
        return marketById[id];
    }

    function getPredictions() public view returns (Prediction[] memory) {
        Prediction[] memory predictions = new Prediction[](currentPredictionId);
        for (uint256 i = 0; i < currentPredictionId; i++) {
            predictions[i] = predictionById[i];
        }
        return predictions;
    }

    function getPredictionsByAccount(address account)
        public
        view
        returns (Prediction[] memory, int256[] memory)
    {
        uint256 userCount = 0;
        for (uint256 i = 0; i < currentPredictionId; i++) {
            if (ownerOf(i) == account && predictionById[i].market.priceFeed != address(0)) {
                userCount++;
            }
        }

        Prediction[] memory predictions = new Prediction[](userCount);
        int256[] memory latestPrices = new int256[](userCount);
        uint256 j = 0;
        for (uint256 i = 0; i < currentPredictionId; i++) {
            if (ownerOf(i) == account && predictionById[i].market.priceFeed != address(0)) {
                latestPrices[j] = AggregatorInterface(predictionById[i].market.priceFeed).latestAnswer();
                predictions[j++] = predictionById[i];
            }
        }

        return (predictions, latestPrices);
    }

    function getPredictionsByFeed(address feed) public view returns (Prediction[] memory, int256) {
        uint256 feedCount = 0;
        for (uint256 i = 0; i < currentPredictionId; i++) {
            if (predictionById[i].market.priceFeed == feed) {
                feedCount++;
            }
        }

        Prediction[] memory predictions = new Prediction[](feedCount);
        uint256 j = 0;
        for (uint256 i = 0; i < currentPredictionId; i++) {
            if (predictionById[i].market.priceFeed == feed) {
                predictions[j++] = predictionById[i];
            }
        }

        int256 latestPrice = AggregatorInterface(feed).latestAnswer();

        return (predictions, latestPrice);
    }
}
