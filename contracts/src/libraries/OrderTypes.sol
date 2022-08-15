// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

library OrderTypes {
    struct MakerOrder {
        address signer; // signer of the maker order
        address collection; // collection address
        uint256 price; // price (used as )
        uint256 tokenId; // id of the token
        uint256 startTime; // startTime in timestamp
        uint256 endTime; // endTime in timestamp
        address priceFeed; // price feed for the underlying asset in the option
        int256 tresholdPrice; // order is valid as long as asset price is under/over the treshold
    }

    struct TakerOrder {
        address taker; // msg.sender
        uint256 price; // final price for the purchase
        address collection;
        uint256 tokenId;
    }
}
