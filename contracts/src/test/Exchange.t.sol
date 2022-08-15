// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {Exchange} from "../Exchange.sol";
import {PredictionMarket} from "../PredictionMarket.sol";
import "./mocks/MockV3Aggregator.sol";
import "forge-std/Test.sol";
import "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";

import {OrderTypes} from "../libraries/OrderTypes.sol";
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

contract ExchangeTest is Test, Exchange {
    PredictionMarket internal predictionMarket;
    Exchange internal exchange;

    address internal alice;
    address internal bob;
    CheatCodes internal cheats;

    MockV3Aggregator internal btcUsdPriceFeed;
    MockV3Aggregator internal ethUsdPriceFeed;
    MockV3Aggregator internal bnbUsdPriceFeed;

    MockCollection internal collection;

    OrderTypes.MakerOrder internal aliceOverMakerAsk;
    OrderTypes.MakerOrder internal aliceUnderMakerAsk;
    uint256 internal aliceNftId;
    OrderTypes.MakerOrder internal bobUnderMakerAsk;
    OrderTypes.MakerOrder internal bobOverMakerAsk;
    uint256 internal bobNftId;

    PredictionMarket.Market internal ethMarket;
    PredictionMarket.Market internal btcMarket;

    uint256 internal aliceMarketId;
    uint256 internal aliceOverId;
    uint256 internal aliceUnderId;

    uint256 internal bobMarketId;
    uint256 internal bobOverId;
    uint256 internal bobUnderId;

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
        predictionMarket = new PredictionMarket();

        cheats.prank(address(alice));
        predictionMarket.setApprovalForAll(address(exchange), true);

        cheats.prank(address(bob));
        predictionMarket.setApprovalForAll(address(exchange), true);

        exchange.setPredictionMarketAddress(address(predictionMarket));

        ethMarket = PredictionMarket.Market(
            address(ethUsdPriceFeed),
            1_000 * 10**8,
            1000,
            1 ether
        );

        btcMarket = PredictionMarket.Market(
            address(btcUsdPriceFeed),
            23_000 * 10**8,
            1000,
            2 ether
        );

        cheats.prank(alice);
        (aliceMarketId, aliceOverId, aliceUnderId) = predictionMarket
            .createMarket{value: 1 ether}(ethMarket);

        cheats.prank(bob);
        (bobMarketId, bobOverId, bobUnderId) = predictionMarket.createMarket{
            value: 2 ether
        }(btcMarket);

        aliceOverMakerAsk = OrderTypes.MakerOrder(
            alice,
            address(predictionMarket),
            1 ether,
            aliceOverId,
            0,
            1000,
            address(ethUsdPriceFeed),
            1_100 * 10**8
        );

        aliceUnderMakerAsk = OrderTypes.MakerOrder(
            alice,
            address(predictionMarket),
            2 ether,
            aliceUnderId,
            0,
            1000,
            address(ethUsdPriceFeed),
            1_100 * 10**8
        );

        bobOverMakerAsk = OrderTypes.MakerOrder(
            bob,
            address(predictionMarket),
            3 ether,
            bobOverId,
            0,
            1000,
            address(btcUsdPriceFeed),
            21_000 * 10**8
        );

        bobUnderMakerAsk = OrderTypes.MakerOrder(
            bob,
            address(predictionMarket),
            4 ether,
            bobUnderId,
            0,
            1000,
            address(btcUsdPriceFeed),
            21_000 * 10**8
        );
    }

    function testCanCreateMakerAsk() public {
        cheats.startPrank(alice);
        exchange.createMakerAsk(aliceOverMakerAsk);
        OrderTypes.MakerOrder memory makerAskOver = exchange.getMakerAsk(
            aliceOverId
        );
        assertEq(makerAskOver.tokenId, aliceOverId);
        exchange.createMakerAsk(aliceUnderMakerAsk);
        OrderTypes.MakerOrder memory makerAskUnder = exchange.getMakerAsk(
            aliceUnderId
        );
        assertEq(makerAskUnder.tokenId, aliceUnderId);
    }

    function testCanOverrideMakerAsk() public {
        cheats.startPrank(alice);
        exchange.createMakerAsk(aliceOverMakerAsk);
        OrderTypes.MakerOrder memory makerAsk = exchange.getMakerAsk(
            aliceOverMakerAsk.tokenId
        );
        assertEq(makerAsk.price, 1 ether);
        exchange.createMakerAsk(
            OrderTypes.MakerOrder(
                alice,
                address(predictionMarket),
                5 ether,
                aliceOverMakerAsk.tokenId,
                0,
                1000,
                address(ethUsdPriceFeed),
                1_200 * 10**8
            )
        );
        OrderTypes.MakerOrder memory newMakerAsk = exchange.getMakerAsk(
            aliceOverMakerAsk.tokenId
        );
        assertEq(newMakerAsk.price, 5 ether);
    }

    function testCanMatchAskWithBid() public {
        cheats.prank(alice);
        exchange.createMakerAsk(aliceOverMakerAsk);

        OrderTypes.TakerOrder memory takerBid = OrderTypes.TakerOrder(
            bob,
            1 ether,
            address(predictionMarket),
            aliceOverId
        );
        uint256 aliceBefore = alice.balance;
        cheats.prank(bob);
        exchange.matchAskWithTakerBid{value: 1 ether}(takerBid);

        assertEq(predictionMarket.ownerOf(aliceOverId), bob);
        assertEq(alice.balance, aliceBefore + 1 ether);
    }

    function testCanGetMakerAsksByFeed() public {
        cheats.startPrank(alice);
        exchange.createMakerAsk(aliceOverMakerAsk);
        exchange.createMakerAsk(aliceUnderMakerAsk);
        cheats.stopPrank();
        cheats.startPrank(bob);
        exchange.createMakerAsk(bobOverMakerAsk);
        exchange.createMakerAsk(bobUnderMakerAsk);

        assertEq(
            exchange.makerAskUpperLimitByFeed(address(ethUsdPriceFeed)),
            1
        );
        assertEq(
            exchange.makerAskUpperLimitByFeed(address(btcUsdPriceFeed)),
            3
        );

        (
            uint256[2][] memory ethMakerAsks,
            address[] memory ethSigners
        ) = exchange.getMakerAsksByFeed(address(ethUsdPriceFeed));
        assertEq(ethMakerAsks.length, 2);
        assertEq(ethMakerAsks[0][0], aliceOverId);
        assertEq(ethMakerAsks[0][1], 1 ether);
        assertEq(ethSigners[0], alice);
        assertEq(ethMakerAsks[1][0], aliceUnderId);
        assertEq(ethMakerAsks[1][1], 2 ether);
        assertEq(ethSigners[1], alice);

        (
            uint256[2][] memory btcMakerAsks,
            address[] memory btcSigners
        ) = exchange.getMakerAsksByFeed(address(btcUsdPriceFeed));
        assertEq(btcMakerAsks.length, 2);
        assertEq(btcMakerAsks[0][0], bobOverId);
        assertEq(btcMakerAsks[0][1], 3 ether);
        assertEq(btcMakerAsks[1][0], bobUnderId);
        assertEq(btcMakerAsks[1][1], 4 ether);

        btcMarket.strikePrice = 24_000 * 10**8;
        predictionMarket.createMarket{value: 2 ether}(btcMarket);
        btcMarket.strikePrice = 25_000 * 10**8;
        (, uint256 bobOverId3, ) = predictionMarket.createMarket{
            value: 2 ether
        }(btcMarket);

        (btcMakerAsks, ) = exchange.getMakerAsksByFeed(
            address(btcUsdPriceFeed)
        );
        assertEq(btcMakerAsks.length, 2);

        exchange.createMakerAsk(
            OrderTypes.MakerOrder(
                bob,
                address(predictionMarket),
                45 ether,
                bobOverId3,
                0,
                1000,
                address(btcUsdPriceFeed),
                21_000 * 10**8
            )
        );

        (btcMakerAsks, btcSigners) = exchange.getMakerAsksByFeed(
            address(btcUsdPriceFeed)
        );
        assertEq(btcMakerAsks.length, 3);
        assertEq(btcMakerAsks[0][0], bobOverId);
        assertEq(btcMakerAsks[0][1], 3 ether);
        assertEq(btcSigners[0], bob);
        assertEq(btcMakerAsks[1][0], bobUnderId);
        assertEq(btcMakerAsks[1][1], 4 ether);
        assertEq(btcSigners[1], bob);
        assertEq(btcMakerAsks[2][0], bobOverId3);
        assertEq(btcMakerAsks[2][1], 45 ether);
        assertEq(btcSigners[2], bob);
    }

    function testCanGetMakerAsksByAccount() public {
        cheats.startPrank(alice);
        exchange.createMakerAsk(aliceOverMakerAsk);
        exchange.createMakerAsk(aliceUnderMakerAsk);
        cheats.stopPrank();
        cheats.startPrank(bob);
        exchange.createMakerAsk(bobOverMakerAsk);
        exchange.createMakerAsk(bobUnderMakerAsk);

        assertEq(exchange.makerAskUpperLimitByAccount(alice), 1);
        assertEq(exchange.makerAskUpperLimitByAccount(bob), 3);

        uint256[2][] memory aliceMakerAsks = exchange.getMakerAsksByAccount(
            alice
        );
        assertEq(aliceMakerAsks.length, 2);
        assertEq(aliceMakerAsks[0][0], aliceOverId);
        assertEq(aliceMakerAsks[0][1], 1 ether);
        assertEq(aliceMakerAsks[1][0], aliceUnderId);
        assertEq(aliceMakerAsks[1][1], 2 ether);

        uint256[2][] memory bobMakerAsks = exchange.getMakerAsksByAccount(bob);
        assertEq(bobMakerAsks.length, 2);
        assertEq(bobMakerAsks[0][0], bobOverId);
        assertEq(bobMakerAsks[0][1], 3 ether);
        assertEq(bobMakerAsks[1][0], bobUnderId);
        assertEq(bobMakerAsks[1][1], 4 ether);

        btcMarket.strikePrice = 24_000 * 10**8;
        predictionMarket.createMarket{value: 2 ether}(btcMarket);
        btcMarket.strikePrice = 25_000 * 10**8;
        (, uint256 bobOverId3, ) = predictionMarket.createMarket{
            value: 2 ether
        }(btcMarket);

        exchange.createMakerAsk(
            OrderTypes.MakerOrder(
                bob,
                address(predictionMarket),
                45 ether,
                bobOverId3,
                0,
                1000,
                address(btcUsdPriceFeed),
                21_000 * 10**8
            )
        );

        bobMakerAsks = exchange.getMakerAsksByAccount(bob);
        assertEq(bobMakerAsks.length, 3);
        assertEq(bobMakerAsks[0][0], bobOverId);
        assertEq(bobMakerAsks[0][1], 3 ether);
        assertEq(bobMakerAsks[1][0], bobUnderId);
        assertEq(bobMakerAsks[1][1], 4 ether);
        assertEq(bobMakerAsks[2][0], bobOverId3);
        assertEq(bobMakerAsks[2][1], 45 ether);
        aliceMakerAsks = exchange.getMakerAsksByAccount(alice);
        assertEq(aliceMakerAsks.length, 2);
    }

    function testCanOverrideMakerAskAndGetByFeed() public {
        cheats.startPrank(alice);
        exchange.createMakerAsk(aliceOverMakerAsk);
        OrderTypes.MakerOrder memory makerAsk = exchange.getMakerAsk(
            aliceOverMakerAsk.tokenId
        );
        assertEq(makerAsk.price, 1 ether);
        exchange.createMakerAsk(
            OrderTypes.MakerOrder(
                alice,
                address(predictionMarket),
                5 ether,
                aliceOverMakerAsk.tokenId,
                0,
                1000,
                address(ethUsdPriceFeed),
                1_200 * 10**8
            )
        );
        OrderTypes.MakerOrder memory newMakerAsk = exchange.getMakerAsk(
            aliceOverMakerAsk.tokenId
        );
        assertEq(newMakerAsk.price, 5 ether);

        (uint256[2][] memory ethMakerAsks, ) = exchange.getMakerAsksByFeed(
            address(ethUsdPriceFeed)
        );
        assertEq(ethMakerAsks.length, 1);
    }

    function testCanGetMakerAskCount() public {
        assertEq(exchange.makerAskCountByFeed(address(ethUsdPriceFeed)), 0);
        assertEq(exchange.makerAskCountByFeed(address(btcUsdPriceFeed)), 0);

        cheats.prank(alice);
        exchange.createMakerAsk(aliceOverMakerAsk);
        assertEq(exchange.makerAskCountByFeed(address(ethUsdPriceFeed)), 1);
        assertEq(exchange.makerAskCountByFeed(address(btcUsdPriceFeed)), 0);

        cheats.prank(bob);
        exchange.createMakerAsk(bobOverMakerAsk);
        assertEq(exchange.makerAskCountByFeed(address(ethUsdPriceFeed)), 1);
        assertEq(exchange.makerAskCountByFeed(address(btcUsdPriceFeed)), 1);

        cheats.prank(bob);
        exchange.createMakerAsk(bobUnderMakerAsk);
        assertEq(exchange.makerAskCountByFeed(address(ethUsdPriceFeed)), 1);
        assertEq(exchange.makerAskCountByFeed(address(btcUsdPriceFeed)), 2);
    }

    function testCanGetUpperLimit() public {
        assertEq(
            exchange.makerAskUpperLimitByFeed(address(ethUsdPriceFeed)),
            0
        );
        assertEq(
            exchange.makerAskUpperLimitByFeed(address(btcUsdPriceFeed)),
            0
        );

        cheats.prank(alice);
        exchange.createMakerAsk(aliceOverMakerAsk); // id 0
        assertEq(
            exchange.makerAskUpperLimitByFeed(address(ethUsdPriceFeed)),
            0
        );
        assertEq(
            exchange.makerAskUpperLimitByFeed(address(btcUsdPriceFeed)),
            0
        );

        cheats.prank(bob);
        exchange.createMakerAsk(bobOverMakerAsk); // id 2
        assertEq(
            exchange.makerAskUpperLimitByFeed(address(ethUsdPriceFeed)),
            0
        );
        assertEq(
            exchange.makerAskUpperLimitByFeed(address(btcUsdPriceFeed)),
            2
        );
    }
}

contract Receiver is ERC721Holder {
    receive() external payable {}
}
