// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {PredictionMarket} from "../PredictionMarket.sol";
import "./mocks/MockV3Aggregator.sol";
import "forge-std/Test.sol";
import "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";

interface CheatCodes {
    function prank(address) external;

    function expectRevert(bytes memory) external;

    function assume(bool) external;

    function warp(uint256) external;

    function startPrank(address, address) external;

    function stopPrank() external;

    function expectEmit(
        bool,
        bool,
        bool,
        bool
    ) external;
}

contract PredictionMarketTest is Test, PredictionMarket, ERC721Holder {
    PredictionMarket internal predictionMarket;

    address internal alice;
    address internal bob;
    CheatCodes internal cheats;

    MockV3Aggregator internal btcUsdPriceFeed;
    MockV3Aggregator internal ethUsdPriceFeed;
    MockV3Aggregator internal bnbUsdPriceFeed;

    function setUp() public {
        predictionMarket = new PredictionMarket();
        alice = address(0x1337);
        bob = address(0x1338);
        cheats = CheatCodes(HEVM_ADDRESS);
        btcUsdPriceFeed = new MockV3Aggregator(8, 20_000 * 10**8);
        ethUsdPriceFeed = new MockV3Aggregator(8, 1_000 * 10**8);
        bnbUsdPriceFeed = new MockV3Aggregator(8, 2_00 * 10**8);
    }

    function testCanCreateMarket() public {
        (uint256 marketId, uint256 overId, uint256 underId) = predictionMarket.createMarket{value: 1 ether}(
            address(ethUsdPriceFeed),
            1_000 * 10**8,
            1000,
            1 ether
        );
        Market memory market = predictionMarket.getMarket(marketId);
        assertEq(market.priceFeed, address(ethUsdPriceFeed));
        Prediction memory overPosition = predictionMarket.getPrediction(overId);
        Prediction memory underPosition = predictionMarket.getPrediction(underId);
        assertTrue(overPosition.over);
        assertFalse(underPosition.over);

        assertEq(address(this), predictionMarket.ownerOf(overId));
        assertEq(address(this), predictionMarket.ownerOf(underId));
    }

    function testWinnerCanExerciseMarket() public {
        (, uint256 overId, ) = predictionMarket.createMarket{value: 1 ether}(address(ethUsdPriceFeed), 1_000 * 10**8, 1000, 1 ether);
        cheats.expectRevert("PredictionMarket: not at expiry yet");
        predictionMarket.exercise(overId);

        ethUsdPriceFeed.updateAnswer(1100 * 10**8);
        uint256 balanceBefore = address(this).balance;
        cheats.warp(1000);
        predictionMarket.exercise(overId);
        assertEq(balanceBefore + 1 ether, address(this).balance);
    }

    function testCannotExerciseBeforeExpiry() public {
        (, , uint256 underId) = predictionMarket.createMarket{value: 1 ether}(address(ethUsdPriceFeed), 1_000 * 10**8, 1000, 1 ether);
        ethUsdPriceFeed.updateAnswer(900 * 10**8);
        cheats.warp(999);
        cheats.expectRevert("PredictionMarket: not at expiry yet");
        predictionMarket.exercise(underId);
    }

    function testLoserCannotExerciseMarket() public {
        (, , uint256 underId) = predictionMarket.createMarket{value: 1 ether}(address(ethUsdPriceFeed), 1_000 * 10**8, 1000, 1 ether);
        ethUsdPriceFeed.updateAnswer(1100 * 10**8);
        cheats.warp(1000);
        cheats.expectRevert("PredictionMarket: can't exercise a losing bet");
        predictionMarket.exercise(underId);
    }

    function testCannotExerciseMarketTwice() public {
        (, uint256 overId, ) = predictionMarket.createMarket{value: 1 ether}(address(ethUsdPriceFeed), 1_000 * 10**8, 1000, 1 ether);
        ethUsdPriceFeed.updateAnswer(1100 * 10**8);
        cheats.warp(1000);
        predictionMarket.exercise(overId);
        cheats.expectRevert("ERC721: invalid token ID");
        predictionMarket.exercise(overId);
    }

    receive() external payable {}
}
