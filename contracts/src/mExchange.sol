// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {IERC721} from "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";

import {OrderTypes} from "./libraries/OrderTypes.sol";

contract Exchange {
    address public deployer;
    mapping(address => uint256) public makerAskCountByCollection;
    mapping(address => uint256) public makerAskUpperLimitByCollection;
    mapping(address => mapping(uint256 => OrderTypes.MakerOrder))
        public makerAskByCollectionAndId;

    event MakerAsk(
        address indexed collection,
        uint256 indexed tokenId,
        uint256 indexed price,
        address signer
    );

    event TakerBid(
        address indexed taker,
        address indexed maker,
        uint256 indexed tokenId,
        uint256 price
    );

    constructor() {
        deployer = msg.sender;
    }

    function createMakerAsk(OrderTypes.MakerOrder calldata makerAsk) external {
        require(msg.sender == makerAsk.signer, "maker must be the sender");
        address owner = IERC721(makerAsk.collection).ownerOf(makerAsk.tokenId);
        require(msg.sender == owner, "maker must be the owner");

        makerAskByCollectionAndId[makerAsk.collection][
            makerAsk.tokenId
        ] = makerAsk;

        uint256 prevUpperLimit = makerAskUpperLimitByCollection[
            makerAsk.collection
        ];
        if (makerAsk.tokenId > prevUpperLimit) {
            makerAskUpperLimitByCollection[makerAsk.collection] = makerAsk
                .tokenId;
        }

        makerAskCountByCollection[makerAsk.collection]++;

        emit MakerAsk(
            makerAsk.collection,
            makerAsk.tokenId,
            makerAsk.price,
            makerAsk.signer
        );
    }

    function matchAskWithTakerBid(OrderTypes.TakerOrder calldata takerBid)
        external
        payable
    {
        require(
            msg.sender == takerBid.taker,
            "Order: Taker must be the sender"
        );

        OrderTypes.MakerOrder memory makerAsk = makerAskByCollectionAndId[
            takerBid.collection
        ][takerBid.tokenId];
        require(makerAsk.signer != address(0), "Order: Token is not listed");
        require(
            makerAsk.signer != takerBid.taker,
            "Order: Maker and Taker cannot be the same"
        );
        require(
            msg.value == takerBid.price,
            "Order: Not enough <native currency>"
        );

        // just do an extra treshold check here?

        // canExecuteTakerBid checks for validity apart from the price
        bool isExecutionValid = canExecuteTakerBid(takerBid, makerAsk);
        require(isExecutionValid, "Strategy: Execution invalid");

        // transfer ETH to the maker
        (bool sent, ) = makerAsk.signer.call{value: msg.value}("");
        require(sent, "failed ether transfer");

        // transfer NFT to the taker
        transferNonFungibleToken(
            makerAsk.signer,
            takerBid.taker,
            takerBid.tokenId,
            takerBid.collection
        );

        emit TakerBid(
            takerBid.taker,
            makerAsk.signer,
            takerBid.tokenId,
            takerBid.price
        );

        makerAskCountByCollection[takerBid.collection]--;
        delete makerAskByCollectionAndId[takerBid.collection][takerBid.tokenId];
    }

    function canExecuteTakerBid(
        OrderTypes.TakerOrder calldata takerBid,
        OrderTypes.MakerOrder memory makerAsk
    ) private view returns (bool) {
        return (
            ((makerAsk.price == takerBid.price) &&
                (makerAsk.tokenId == takerBid.tokenId) &&
                (makerAsk.collection == takerBid.collection) &&
                (makerAsk.startTime <= block.timestamp) &&
                (makerAsk.endTime >= block.timestamp))
        );
    }

    function transferNonFungibleToken(
        address from,
        address to,
        uint256 tokenId,
        address collection
    ) internal {
        IERC721(collection).safeTransferFrom(from, to, tokenId);
    }

    function getMakerAsk(address collection, uint256 id)
        public
        view
        returns (OrderTypes.MakerOrder memory)
    {
        return makerAskByCollectionAndId[collection][id];
    }

    function getMakerAsksByCollection(address collection)
        public
        view
        returns (uint256[2][] memory)
    {
        uint256 upperLimit = makerAskUpperLimitByCollection[collection];
        uint256 makerAskCount = makerAskCountByCollection[collection];
        uint256[2][] memory makerAsks = new uint256[2][](makerAskCount);
        uint256 i = 0;
        uint256 j = 0;
        while (i <= upperLimit) {
            OrderTypes.MakerOrder memory makerAsk = makerAskByCollectionAndId[
                collection
            ][i];
            if (makerAsk.collection != address(0)) {
                (makerAsks[j][0], makerAsks[j][1]) = (
                    makerAsk.tokenId,
                    makerAsk.price
                );
                j++;
            }
            i++;
        }
        return makerAsks;
    }
}
