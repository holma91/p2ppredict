// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IERC721} from "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";
import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

import {OrderTypes} from "./libraries/OrderTypes.sol";

// OBS: This contract is unoptimized and gas-inefficient
contract Exchange {
    address public deployer;
    address public predictionMarketAddress;

    mapping(address => uint256) public makerAskCountByFeed;
    mapping(address => uint256) public makerAskCountByAccount;

    mapping(uint256 => OrderTypes.MakerOrder) public makerAskByTokenId;

    mapping(address => mapping(uint256 => OrderTypes.MakerOrder)) public makerAskByFeedAndId;
    mapping(address => uint256) public makerAskUpperLimitByFeed;

    mapping(address => mapping(uint256 => OrderTypes.MakerOrder)) public makerAskByAccountAndId;
    mapping(address => uint256) public makerAskUpperLimitByAccount;

    event MakerAsk(
        address indexed signer,
        uint256 indexed tokenId,
        uint256 price,
        address priceFeed,
        int256 tresholdPrice
    );

    event TakerBid(address indexed taker, address indexed maker, uint256 indexed tokenId, uint256 price);

    constructor() {
        deployer = msg.sender;
    }

    function setPredictionMarketAddress(address _predictionMarket) public {
        require(msg.sender == deployer, "Only deployer can change the prediction market address");
        predictionMarketAddress = _predictionMarket;
    }

    function createMakerAsk(OrderTypes.MakerOrder calldata makerAsk) external {
        require(
            msg.sender == makerAsk.signer || msg.sender == predictionMarketAddress,
            "maker must be the sender"
        );
        address owner = IERC721(makerAsk.collection).ownerOf(makerAsk.tokenId);
        require(
            msg.sender == owner || msg.sender == predictionMarketAddress,
            "maker must be the owner or the pMarket"
        );
        if (getMakerAsk(makerAsk.tokenId).signer == address(0)) {
            // not just overriding an earlier ask
            makerAskCountByFeed[makerAsk.priceFeed]++;
            makerAskCountByAccount[makerAsk.signer]++;
        }

        makerAskByFeedAndId[makerAsk.priceFeed][makerAsk.tokenId] = makerAsk;
        makerAskByAccountAndId[makerAsk.signer][makerAsk.tokenId] = makerAsk;

        uint256 prevUpperLimitFeed = makerAskUpperLimitByFeed[makerAsk.priceFeed];
        if (makerAsk.tokenId > prevUpperLimitFeed) {
            makerAskUpperLimitByFeed[makerAsk.priceFeed] = makerAsk.tokenId;
        }

        uint256 prevUpperLimitAccount = makerAskUpperLimitByAccount[makerAsk.signer];
        if (makerAsk.tokenId > prevUpperLimitAccount) {
            makerAskUpperLimitByAccount[makerAsk.signer] = makerAsk.tokenId;
        }

        makerAskByTokenId[makerAsk.tokenId] = makerAsk;
        emit MakerAsk(
            makerAsk.signer,
            makerAsk.tokenId,
            makerAsk.price,
            makerAsk.priceFeed,
            makerAsk.tresholdPrice
        );
    }

    function matchAskWithTakerBid(OrderTypes.TakerOrder calldata takerBid) external payable {
        require(msg.sender == takerBid.taker, "Order: Taker must be the sender");

        OrderTypes.MakerOrder memory makerAsk = makerAskByTokenId[takerBid.tokenId];
        require(makerAsk.signer != address(0), "Order: Token is not listed");
        require(makerAsk.signer != takerBid.taker, "Order: Maker and Taker cannot be the same");

        require(msg.value == takerBid.price, "Order: Not enough <native currency>");

        bool isExecutionValid = canExecuteTakerBid(takerBid, makerAsk);
        require(isExecutionValid, "Strategy: Execution invalid");

        (bool sent, ) = makerAsk.signer.call{value: msg.value}("");
        require(sent, "failed ether transfer");

        transferNonFungibleToken(makerAsk.signer, takerBid.taker, takerBid.tokenId, takerBid.collection);

        emit TakerBid(takerBid.taker, makerAsk.signer, takerBid.tokenId, takerBid.price);

        delete makerAskByTokenId[takerBid.tokenId];
        makerAskCountByFeed[makerAsk.priceFeed]--;
        delete makerAskByFeedAndId[makerAsk.priceFeed][makerAsk.tokenId];
        makerAskCountByAccount[makerAsk.signer]--;
        delete makerAskByAccountAndId[makerAsk.signer][makerAsk.tokenId];
    }

    function canExecuteTakerBid(
        OrderTypes.TakerOrder calldata takerBid,
        OrderTypes.MakerOrder memory makerAsk
    ) private pure returns (bool) {
        return (((makerAsk.price == takerBid.price) && (makerAsk.tokenId == takerBid.tokenId)));
    }

    function transferNonFungibleToken(
        address from,
        address to,
        uint256 tokenId,
        address collection
    ) internal {
        IERC721(collection).safeTransferFrom(from, to, tokenId);
    }

    function getMakerAsk(uint256 id) public view returns (OrderTypes.MakerOrder memory) {
        return makerAskByTokenId[id];
    }

    function getMakerAsks() public view returns (OrderTypes.MakerOrder memory) {}

    function getMakerAsksByFeed(address feed) public view returns (uint256[2][] memory, address[] memory) {
        uint256 upperLimit = makerAskUpperLimitByFeed[feed];
        uint256 count = makerAskCountByFeed[feed];
        uint256[2][] memory makerAsks = new uint256[2][](count);
        address[] memory signers = new address[](count);
        uint256 i = 0;
        uint256 j = 0;
        while (i <= upperLimit) {
            OrderTypes.MakerOrder memory makerAsk = makerAskByFeedAndId[feed][i];
            if (makerAsk.priceFeed != address(0)) {
                (makerAsks[j][0], makerAsks[j][1]) = (makerAsk.tokenId, makerAsk.price);
                signers[j] = makerAsk.signer;
                j++;
            }
            i++;
        }
        return (makerAsks, signers);
    }

    function getMakerAsksByAccount(address account) public view returns (uint256[2][] memory) {
        uint256 upperLimit = makerAskUpperLimitByAccount[account];
        uint256 count = makerAskCountByAccount[account];
        uint256[2][] memory makerAsks = new uint256[2][](count);
        uint256 i = 0;
        uint256 j = 0;
        while (i <= upperLimit) {
            OrderTypes.MakerOrder memory makerAsk = makerAskByAccountAndId[account][i];
            if (makerAsk.signer != address(0)) {
                (makerAsks[j][0], makerAsks[j][1]) = (makerAsk.tokenId, makerAsk.price);
                j++;
            }
            i++;
        }
        return makerAsks;
    }
}
