// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {PredictionMarket} from "../PredictionMarket.sol";
import {Exchange} from "../Exchange.sol";
import {OrderTypes} from "../libraries/OrderTypesNew.sol";
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
    Exchange internal exchange;

    address internal alice;
    address internal bob;
    CheatCodes internal cheats;

    MockV3Aggregator internal btcUsdPriceFeed;
    MockV3Aggregator internal ethUsdPriceFeed;
    MockV3Aggregator internal bnbUsdPriceFeed;

    Market internal ethMarket;

    function setUp() public {
        exchange = new Exchange();
        predictionMarket = new PredictionMarket();
        exchange.setPredictionMarketAddress(address(predictionMarket));
        predictionMarket.setExchangeAddress(address(exchange));

        alice = address(0x1337);
        bob = address(0x1338);
        cheats = CheatCodes(HEVM_ADDRESS);
        btcUsdPriceFeed = new MockV3Aggregator(8, 20_000 * 10**8);
        ethUsdPriceFeed = new MockV3Aggregator(8, 1_000 * 10**8);
        bnbUsdPriceFeed = new MockV3Aggregator(8, 2_00 * 10**8);

        ethMarket = Market(address(ethUsdPriceFeed), 1_000 * 10**8, 1000, 1 ether);
    }

    function testCanCreateMarket() public {
        (uint256 marketId, uint256 overId, uint256 underId) = predictionMarket.createMarket{value: 1 ether}(ethMarket);
        Market memory market = predictionMarket.getMarket(marketId);
        assertEq(market.priceFeed, ethMarket.priceFeed);
        Prediction memory overPosition = predictionMarket.getPrediction(overId);
        Prediction memory underPosition = predictionMarket.getPrediction(underId);
        assertTrue(overPosition.over);
        assertFalse(underPosition.over);

        assertEq(address(this), predictionMarket.ownerOf(overId));
        assertEq(address(this), predictionMarket.ownerOf(underId));
    }

    function testWinnerCanExerciseMarket() public {
        (, uint256 overId, ) = predictionMarket.createMarket{value: 1 ether}(ethMarket);
        cheats.expectRevert("PredictionMarket: not at expiry yet");
        predictionMarket.exercise(overId);

        ethUsdPriceFeed.updateAnswer(1100 * 10**8);
        uint256 balanceBefore = address(this).balance;
        cheats.warp(1000);
        predictionMarket.exercise(overId);
        assertEq(balanceBefore + 1 ether, address(this).balance);
    }

    function testCannotExerciseBeforeExpiry() public {
        (, , uint256 underId) = predictionMarket.createMarket{value: 1 ether}(ethMarket);
        ethUsdPriceFeed.updateAnswer(900 * 10**8);
        cheats.warp(999);
        cheats.expectRevert("PredictionMarket: not at expiry yet");
        predictionMarket.exercise(underId);
    }

    function testLoserCannotExerciseMarket() public {
        (, , uint256 underId) = predictionMarket.createMarket{value: 1 ether}(ethMarket);
        ethUsdPriceFeed.updateAnswer(1100 * 10**8);
        cheats.warp(1000);
        cheats.expectRevert("PredictionMarket: can't exercise a losing bet");
        predictionMarket.exercise(underId);
    }

    function testCannotExerciseMarketTwice() public {
        (, uint256 overId, ) = predictionMarket.createMarket{value: 1 ether}(ethMarket);
        ethUsdPriceFeed.updateAnswer(1100 * 10**8);
        cheats.warp(1000);
        predictionMarket.exercise(overId);
        cheats.expectRevert("ERC721: invalid token ID");
        predictionMarket.exercise(overId);
    }

    function testCanCreateMarketAndTakeOverPosition() public {
        uint256 listPrice = 0.5 ether;
        (, uint256 overId, uint256 underId) = predictionMarket.createMarketWithPosition{value: 1 ether}(
            ethMarket,
            true,
            listPrice,
            500,
            975 * 10**8
        );
        assertTrue(predictionMarket.getPrediction(overId).over);
        assertFalse(predictionMarket.getPrediction(underId).over);

        OrderTypes.MakerOrder memory makerAsk = exchange.getMakerAsk(underId);
        assertEq(makerAsk.price, listPrice);

        OrderTypes.MakerOrder memory makerAskFake = exchange.getMakerAsk(overId);
        assertEq(makerAskFake.price, 0);
    }

    function testCanCreateMarketAndTakeUnderPosition() public {
        uint256 listPrice = 0.75 ether;
        (, uint256 overId, uint256 underId) = predictionMarket.createMarketWithPosition{value: 1 ether}(
            ethMarket,
            false,
            listPrice,
            500,
            975 * 10**8
        );

        OrderTypes.MakerOrder memory makerAsk = exchange.getMakerAsk(overId);
        assertEq(makerAsk.price, listPrice);

        OrderTypes.MakerOrder memory makerAskFake = exchange.getMakerAsk(underId);
        assertEq(makerAskFake.price, 0);
    }

    receive() external payable {}
}
