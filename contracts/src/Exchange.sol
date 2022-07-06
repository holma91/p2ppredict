// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IERC20, SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC721} from "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {AggregatorV3Interface} from "chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {OrderTypes} from "./libraries/OrderTypesNew.sol";

contract Exchange {
    address public deployer;
    address public predictionMarket;
    mapping(uint256 => OrderTypes.MakerOrder) public makerAskById;

    event MakerAsk(
        address indexed signer,
        uint256 indexed tokenId,
        uint256 price,
        uint256 startTime,
        uint256 endTime,
        address priceFeed,
        int256 tresholdPrice
    );

    event TakerBid(address indexed taker, address indexed maker, uint256 indexed tokenId, uint256 price);

    constructor() {
        deployer = msg.sender;
    }

    function setPredictionMarketAddress(address _predictionMarket) public {
        require(msg.sender == deployer, "Only deployer can change the prediction market address");
        predictionMarket = _predictionMarket;
    }

    function createMakerAsk(OrderTypes.MakerOrder calldata makerAsk) external {
        require(makerAsk.isOrderAsk, "order is not an ask");
        require(msg.sender == makerAsk.signer || msg.sender == predictionMarket, "maker must be the sender");

        makerAskById[makerAsk.tokenId] = makerAsk;

        emit MakerAsk(
            makerAsk.signer,
            makerAsk.tokenId,
            makerAsk.price,
            makerAsk.startTime,
            makerAsk.endTime,
            makerAsk.priceFeed,
            makerAsk.tresholdPrice
        );
    }

    function matchAskWithTakerBid(OrderTypes.TakerOrder calldata takerBid) external payable {
        require(msg.sender == takerBid.taker, "Order: Taker must be the sender");

        OrderTypes.MakerOrder memory makerAsk = makerAskById[takerBid.tokenId];
        require(makerAsk.signer != address(0), "Order: Token is not listed");
        require(makerAsk.signer != takerBid.taker, "Order: Maker and Taker cannot be the same");
        require((makerAsk.isOrderAsk) && (!takerBid.isOrderAsk), "Order: Wrong sides");
        require(msg.value == takerBid.price, "Order: Not enough <native currency>");

        // canExecuteTakerBid checks for validity apart from the price
        bool isExecutionValid = canExecuteTakerBid(takerBid, makerAsk);
        require(isExecutionValid, "Strategy: Execution invalid");

        // transfer ETH to the maker
        (bool sent, ) = makerAsk.signer.call{value: msg.value}("");
        require(sent, "failed ether transfer");

        // transfer NFT to the taker
        transferNonFungibleToken(makerAsk.signer, takerBid.taker, takerBid.tokenId);

        emit TakerBid(takerBid.taker, makerAsk.signer, takerBid.tokenId, takerBid.price);

        delete makerAskById[takerBid.tokenId];
    }

    function canExecuteTakerBid(
        OrderTypes.TakerOrder calldata takerBid,
        OrderTypes.MakerOrder memory makerAsk
    ) private view returns (bool) {
        return (
            ((makerAsk.price == takerBid.price) &&
                (makerAsk.tokenId == takerBid.tokenId) &&
                (makerAsk.startTime <= block.timestamp) &&
                (makerAsk.endTime >= block.timestamp))
        );
    }

    function transferNonFungibleToken(
        address from,
        address to,
        uint256 tokenId
    ) internal {
        IERC721(predictionMarket).safeTransferFrom(from, to, tokenId);
    }

    function getMakerAsk(uint256 id) public view returns (OrderTypes.MakerOrder memory) {
        return makerAskById[id];
    }
}
