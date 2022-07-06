// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// OpenZeppelin contracts
import {IERC20, SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

// Chainlink contracts
import {AggregatorV3Interface} from "chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// LooksRare interfaces
import {ITransferManagerNFT} from "./interfaces/ITransferManagerNFT.sol";
import {ITransferSelectorNFT} from "./interfaces/ITransferSelectorNFT.sol";

// LooksRare libraries
import {OrderTypes} from "./libraries/OrderTypes.sol";

/**
 * @title SpeculateExchange
 * @notice The core contract of the exchange.
 */
contract SpeculateExchange {
    using SafeERC20 for IERC20;

    using OrderTypes for OrderTypes.MakerOrder;
    using OrderTypes for OrderTypes.TakerOrder;

    address public immutable WRAPPED_NATIVE_ASSET;

    // does stuff related to who can transfer assets in a collection
    ITransferSelectorNFT public transferSelectorNFT;

    mapping(address => mapping(uint256 => OrderTypes.MakerOrder)) public makerAskByNFT;
    mapping(address => mapping(uint256 => mapping(address => OrderTypes.MakerOrder)))
        public makerBidByNFTAndMaker;

    event TakerBid(
        address indexed taker,
        address indexed maker,
        uint256 indexed tokenId,
        address currency,
        address collection,
        uint256 amount,
        uint256 price
    );

    event TakerAsk(
        address indexed taker,
        address indexed maker,
        uint256 indexed tokenId,
        address currency,
        address collection,
        uint256 amount,
        uint256 price
    );

    event MakerAsk(
        address indexed signer,
        address indexed collection,
        uint256 indexed tokenId,
        bool isOrderAsk,
        address currency,
        uint256 amount,
        uint256 price,
        uint256 startTime,
        uint256 endTime,
        address underlyingPriceFeed,
        uint256 underlyingPriceTreshold
    );

    event MakerBid(
        address indexed signer,
        address indexed collection,
        uint256 indexed tokenId,
        bool isOrderAsk,
        address currency,
        uint256 amount,
        uint256 price,
        uint256 startTime,
        uint256 endTime,
        address underlyingPriceFeed,
        uint256 underlyingPriceTreshold
    );

    /**
     * @notice Constructor
     * @param _wrappedNativeAsset the initially accepted currency
     */
    constructor(address _wrappedNativeAsset) {
        WRAPPED_NATIVE_ASSET = _wrappedNativeAsset;
    }

    function getMakerAsk(address collection, uint256 id) public view returns (OrderTypes.MakerOrder memory) {
        return makerAskByNFT[collection][id];
    }

    function getMakerBid(
        address collection,
        uint256 id,
        address maker
    ) public view returns (OrderTypes.MakerOrder memory) {
        return makerBidByNFTAndMaker[collection][id][maker];
    }

    function createMakerAsk(OrderTypes.MakerOrder calldata makerAsk) external {
        require(makerAsk.isOrderAsk, "order is not an ask");
        require(msg.sender == makerAsk.signer, "maker must be the sender");

        makerAskByNFT[makerAsk.collection][makerAsk.tokenId] = makerAsk;

        emit MakerAsk(
            makerAsk.signer,
            makerAsk.collection,
            makerAsk.tokenId,
            makerAsk.isOrderAsk,
            makerAsk.currency,
            makerAsk.amount,
            makerAsk.price,
            makerAsk.startTime,
            makerAsk.endTime,
            makerAsk.underlyingPriceFeed,
            makerAsk.underlyingPriceTreshold
        );
    }

    function createMakerBid(OrderTypes.MakerOrder calldata makerBid) external {
        require(!makerBid.isOrderAsk, "order is not a bid");
        require(msg.sender == makerBid.signer, "maker must be the sender");
        // check that msg.sender have the funds?
        // check that the nft exists?

        makerBidByNFTAndMaker[makerBid.collection][makerBid.tokenId][makerBid.signer] = makerBid;

        emit MakerBid(
            makerBid.signer,
            makerBid.collection,
            makerBid.tokenId,
            makerBid.isOrderAsk,
            makerBid.currency,
            makerBid.amount,
            makerBid.price,
            makerBid.startTime,
            makerBid.endTime,
            makerBid.underlyingPriceFeed,
            makerBid.underlyingPriceTreshold
        );
    }

    function matchAskWithTakerBid(
        OrderTypes.TakerOrder calldata takerBid,
        OrderTypes.MakerOrder calldata makerAsk
    ) external {
        require((makerAsk.isOrderAsk) && (!takerBid.isOrderAsk), "Order: Wrong sides");
        require(msg.sender == takerBid.taker, "Order: Taker must be the sender");

        // canExecuteTakerBid checks for validity apart from the price
        (bool isExecutionValid, uint256 tokenId, uint256 amount) = canExecuteTakerBid(takerBid, makerAsk);

        require(isExecutionValid, "Strategy: Execution invalid");

        // validate the price
        (, int256 underlyingAssetPrice, , , ) = AggregatorV3Interface(makerAsk.underlyingPriceFeed)
            .latestRoundData();

        // only valid for call options for now
        require(underlyingAssetPrice <= int256(makerAsk.underlyingPriceTreshold), "price not below treshold");

        // Execution part 1/2
        _transferFeesAndFunds(
            makerAsk.collection,
            tokenId,
            makerAsk.currency,
            msg.sender,
            makerAsk.signer,
            takerBid.price
        );

        // Execution part 2/2
        _transferNonFungibleToken(makerAsk.collection, makerAsk.signer, takerBid.taker, tokenId, amount);

        emit TakerBid(
            takerBid.taker,
            makerAsk.signer,
            tokenId,
            makerAsk.currency,
            makerAsk.collection,
            amount,
            takerBid.price
        );

        delete makerAskByNFT[makerAsk.collection][makerAsk.tokenId];
    }

    /**
     * @notice Match a takerAsk with a makerBid
     * @param takerAsk taker ask order
     * @param makerBid maker bid order
     */
    function matchBidWithTakerAsk(
        OrderTypes.TakerOrder calldata takerAsk,
        OrderTypes.MakerOrder calldata makerBid
    ) external {
        require((!makerBid.isOrderAsk) && (takerAsk.isOrderAsk), "Order: Wrong sides");
        require(msg.sender == takerAsk.taker, "Order: Taker must be the sender");

        (bool isExecutionValid, uint256 tokenId, uint256 amount) = canExecuteTakerAsk(takerAsk, makerBid);

        require(isExecutionValid, "Strategy: Execution invalid");

        // validate the price
        (, int256 underlyingAssetPrice, , , ) = AggregatorV3Interface(makerBid.underlyingPriceFeed)
            .latestRoundData();

        // only valid for call options for now
        require(underlyingAssetPrice >= int256(makerBid.underlyingPriceTreshold), "price not above treshold");

        // Execution part 1/2
        _transferNonFungibleToken(makerBid.collection, msg.sender, makerBid.signer, tokenId, amount);

        // Execution part 2/2
        _transferFeesAndFunds(
            makerBid.collection,
            tokenId,
            makerBid.currency,
            makerBid.signer,
            takerAsk.taker,
            takerAsk.price
        );

        emit TakerAsk(
            takerAsk.taker,
            makerBid.signer,
            tokenId,
            makerBid.currency,
            makerBid.collection,
            amount,
            takerAsk.price
        );

        delete makerAskByNFT[makerBid.collection][makerBid.tokenId];
        delete makerBidByNFTAndMaker[makerBid.collection][makerBid.tokenId][makerBid.signer];
    }

    /**
     * @notice Transfer fees and funds to royalty recipient, protocol, and seller
     * @param collection non fungible token address for the transfer
     * @param tokenId tokenId
     * @param currency currency being used for the purchase (e.g., WETH/USDC)
     * @param from sender of the funds
     * @param to seller's recipient
     * @param amount amount being transferred (in currency)
     */
    function _transferFeesAndFunds(
        address collection,
        uint256 tokenId,
        address currency,
        address from,
        address to,
        uint256 amount
    ) internal {
        // Transfer final amount to seller
        IERC20(currency).safeTransferFrom(from, to, amount);
    }

    /**
     * @notice Transfer NFT
     * @param collection address of the token collection
     * @param from address of the sender
     * @param to address of the recipient
     * @param tokenId tokenId
     * @param amount amount of tokens (1 for ERC721, 1+ for ERC1155)
     * @dev For ERC721, amount is not used
     */
    function _transferNonFungibleToken(
        address collection,
        address from,
        address to,
        uint256 tokenId,
        uint256 amount
    ) internal {
        address transferManager = transferSelectorNFT.checkTransferManagerForToken(collection);

        require(transferManager != address(0), "Transfer: No NFT transfer manager available");

        ITransferManagerNFT(transferManager).transferNonFungibleToken(collection, from, to, tokenId, amount);
    }

    /**
     * @notice Update transfer selector NFT
     * @param _transferSelectorNFT new transfer selector address
     */
    function updateTransferSelectorNFT(address _transferSelectorNFT) external {
        require(_transferSelectorNFT != address(0), "Owner: Cannot be null address");
        transferSelectorNFT = ITransferSelectorNFT(_transferSelectorNFT);
    }

    function canExecuteTakerBid(
        OrderTypes.TakerOrder calldata takerBid,
        OrderTypes.MakerOrder calldata makerAsk
    )
        private
        view
        returns (
            bool,
            uint256,
            uint256
        )
    {
        return (
            ((makerAsk.price == takerBid.price) &&
                (makerAsk.tokenId == takerBid.tokenId) &&
                (makerAsk.startTime <= block.timestamp) &&
                (makerAsk.endTime >= block.timestamp)),
            makerAsk.tokenId,
            makerAsk.amount
        );
    }

    function canExecuteTakerAsk(
        OrderTypes.TakerOrder calldata takerAsk,
        OrderTypes.MakerOrder calldata makerBid
    )
        private
        view
        returns (
            bool,
            uint256,
            uint256
        )
    {
        return (
            ((makerBid.price == takerAsk.price) &&
                (makerBid.tokenId == takerAsk.tokenId) &&
                (makerBid.startTime <= block.timestamp) &&
                (makerBid.endTime >= block.timestamp)),
            makerBid.tokenId,
            makerBid.amount
        );
    }
}
