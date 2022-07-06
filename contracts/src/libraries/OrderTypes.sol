// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

/**
 * @title OrderTypes
 * @notice This library contains order types for the LooksRare exchange.
 */
library OrderTypes {
    struct MakerOrder {
        bool isOrderAsk; // true --> ask / false --> bid
        address signer; // signer of the maker order
        address collection; // collection address
        uint256 price; // price (used as )
        uint256 tokenId; // id of the token
        uint256 amount; // amount of tokens to sell/purchase (must be 1 for ERC721, 1+ for ERC1155)
        address currency; // currency (e.g., WETH)
        uint256 startTime; // startTime in timestamp
        uint256 endTime; // endTime in timestamp
        address underlyingPriceFeed; // price feed for the underlying asset in the option
        uint256 underlyingPriceTreshold; // order is valid as long as asset price is under/over the treshold
    }

    struct TakerOrder {
        bool isOrderAsk; // true --> ask / false --> bid
        address taker; // msg.sender
        uint256 price; // final price for the purchase
        uint256 tokenId;
    }
}
