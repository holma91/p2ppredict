// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {Exchange} from "../Exchange.sol";
import {PredictionMarket} from "../PredictionMarket.sol";
import "./mocks/MockV3Aggregator.sol";
import "forge-std/Test.sol";
import "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";

import {OrderTypes} from "../libraries/OrderTypesNew.sol";
import {ERC721} from "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";

interface CheatCodes {
    function prank(address) external;

    function expectRevert(bytes memory) external;

    function assume(bool) external;

    function warp(uint256) external;

    function startPrank(address) external;

    function startPrank(address, address) external;

    function stopPrank() external;

    function expectEmit(
        bool,
        bool,
        bool,
        bool
    ) external;
}

contract MockCollection is ERC721("name", "symbol") {
    uint256 public currentTokenId;

    function mintTo(address recipient) public payable returns (uint256) {
        uint256 newTokenId = ++currentTokenId;
        _safeMint(recipient, newTokenId);
        return newTokenId;
    }
}

contract ExchangeTest is Test {
    PredictionMarket internal predictionMarket;
    Exchange internal exchange;

    address internal alice;
    address internal bob;
    CheatCodes internal cheats;

    MockV3Aggregator internal btcUsdPriceFeed;
    MockV3Aggregator internal ethUsdPriceFeed;
    MockV3Aggregator internal bnbUsdPriceFeed;

    MockCollection internal collection;

    OrderTypes.MakerOrder internal aliceMakerAsk;
    uint256 internal aliceNftId;

    function setUp() public {
        exchange = new Exchange();
        alice = address(new Receiver());
        bob = address(new Receiver());
        payable(alice).transfer(1000 ether);
        payable(bob).transfer(1000 ether);

        cheats = CheatCodes(HEVM_ADDRESS);
        btcUsdPriceFeed = new MockV3Aggregator(8, 20_000 * 10**8);
        ethUsdPriceFeed = new MockV3Aggregator(8, 1_000 * 10**8);
        bnbUsdPriceFeed = new MockV3Aggregator(8, 2_00 * 10**8);

        collection = new MockCollection();
        aliceNftId = collection.mintTo(address(alice));
        cheats.prank(address(alice));
        collection.setApprovalForAll(address(exchange), true);

        exchange.setPredictionMarketAddress(address(collection));

        aliceMakerAsk = OrderTypes.MakerOrder(true, alice, 1 ether, aliceNftId, 0, 1000, address(ethUsdPriceFeed), 1_200 * 10**8);
    }

    function testCanCreateMakerAsk() public {
        cheats.prank(alice);
        exchange.createMakerAsk(aliceMakerAsk);
        OrderTypes.MakerOrder memory makerAsk = exchange.getMakerAsk(aliceNftId);
        assertEq(makerAsk.tokenId, aliceNftId);
    }

    function testCanOverrideMakerAsk() public {
        cheats.startPrank(alice);
        exchange.createMakerAsk(aliceMakerAsk);
        OrderTypes.MakerOrder memory makerAsk = exchange.getMakerAsk(aliceNftId);
        assertEq(makerAsk.price, 1 ether);
        exchange.createMakerAsk(OrderTypes.MakerOrder(true, alice, 5 ether, aliceNftId, 0, 1000, address(ethUsdPriceFeed), 1_200 * 10**8));
        OrderTypes.MakerOrder memory newMakerAsk = exchange.getMakerAsk(aliceNftId);
        assertEq(newMakerAsk.price, 5 ether);
    }

    function testCanMatchAskWithBid() public {
        cheats.prank(alice);
        exchange.createMakerAsk(aliceMakerAsk);

        OrderTypes.TakerOrder memory takerBid = OrderTypes.TakerOrder(false, bob, 1 ether, aliceNftId);
        uint256 aliceBefore = alice.balance;
        cheats.prank(bob);
        exchange.matchAskWithTakerBid{value: 1 ether}(takerBid);

        assertEq(collection.ownerOf(aliceNftId), bob);
        assertEq(alice.balance, aliceBefore + 1 ether);
    }
}

contract Receiver is ERC721Holder {
    receive() external payable {}
}
