// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {PredictionMarket} from "../PredictionMarket.sol";
import {Exchange} from "../Exchange.sol";
import {OrderTypes} from "../libraries/OrderTypes.sol";
import "./mocks/MockV3Aggregator.sol";
import "forge-std/Test.sol";
import "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";

interface CheatCodes {
    function prank(address) external;

    function expectRevert(bytes memory) external;

    function assume(bool) external;

    function warp(uint256) external;

    function startPrank(address, address) external;

    function startPrank(address) external;

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
    MockV3Aggregator internal trxUsdPriceFeed;

    Market internal ethMarket;
    Market internal btcMarket;

    function setUp() public {
        exchange = new Exchange();
        predictionMarket = new PredictionMarket();
        exchange.setPredictionMarketAddress(address(predictionMarket));
        predictionMarket.setExchangeAddress(address(exchange));

        alice = address(new Receiver());
        payable(alice).transfer(1000 ether);
        bob = address(new Receiver());
        payable(bob).transfer(1000 ether);

        cheats = CheatCodes(HEVM_ADDRESS);
        btcUsdPriceFeed = new MockV3Aggregator(8, 20_000 * 10**8);
        ethUsdPriceFeed = new MockV3Aggregator(8, 1_000 * 10**8);
        bnbUsdPriceFeed = new MockV3Aggregator(8, 2_00 * 10**8);
        trxUsdPriceFeed = new MockV3Aggregator(8, 0.07 * 10**8);

        ethMarket = Market(address(ethUsdPriceFeed), 1_000 * 10**8, 1000, 1 ether);

        btcMarket = Market(address(btcUsdPriceFeed), 23_000 * 10**8, 1000, 2 ether);
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

    function testMarketIsGoneAfterBeingExercised() public {
        (, uint256 overId, uint256 underId) = predictionMarket.createMarket{value: 1 ether}(ethMarket);
        cheats.expectRevert("PredictionMarket: not at expiry yet");
        predictionMarket.exercise(overId);

        ethUsdPriceFeed.updateAnswer(1100 * 10**8);
        uint256 balanceBefore = address(this).balance;
        cheats.warp(1000);
        predictionMarket.exercise(overId);
        assertEq(balanceBefore + 1 ether, address(this).balance);

        Prediction memory prediction1 = predictionMarket.getPrediction(overId);
        assertEq(prediction1.market.priceFeed, address(0));
        Prediction memory prediction2 = predictionMarket.getPrediction(underId);
        assertEq(prediction2.market.priceFeed, address(0));
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
        cheats.expectRevert("Market is dead");
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

    function testScenario() public {
        Market memory trxMarket = Market(address(trxUsdPriceFeed), 0.08 * 10**8, 1000, 1 ether);
        uint256 listPrice = 0.5 ether;
        (, uint256 overId, uint256 underId) = predictionMarket.createMarketWithPosition{value: 1 ether}(
            trxMarket,
            true,
            listPrice,
            500,
            0.077 * 10**8
        );
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

    function testCanGetAllMarkets() public {
        predictionMarket.createMarket{value: 1 ether}(ethMarket);
        predictionMarket.createMarket{value: 1 ether}(ethMarket);
        predictionMarket.createMarket{value: 1 ether}(ethMarket);
        predictionMarket.createMarket{value: 1 ether}(ethMarket);
        predictionMarket.createMarket{value: 1 ether}(ethMarket);
        predictionMarket.createMarket{value: 2 ether}(btcMarket);
        predictionMarket.createMarket{value: 2 ether}(btcMarket);
        cheats.prank(bob);
        predictionMarket.createMarket{value: 1 ether}(ethMarket);
        Prediction[] memory predictions = predictionMarket.getPredictions();
        assertEq(predictions.length, 16);
        (Prediction[] memory predictionsByAccount, int256[] memory latestPrices) = predictionMarket
            .getPredictionsByAccount(address(this));
        assertEq(predictionsByAccount.length, 14);
        assertEq(latestPrices.length, 14);
        (Prediction[] memory predictionsByAccountBob, int256[] memory latestPricesBob) = predictionMarket
            .getPredictionsByAccount(bob);
        assertEq(predictionsByAccountBob.length, 2);
        assertEq(latestPricesBob.length, 2);
        cheats.startPrank(alice);
        predictionMarket.createMarket{value: 1 ether}(ethMarket);
        predictionMarket.createMarket{value: 2 ether}(btcMarket);
        (Prediction[] memory predictionsByAccountAlice, int256[] memory latestPricesAlice) = predictionMarket
            .getPredictionsByAccount(alice);
        assertEq(predictionsByAccountAlice.length, 4);
        assertEq(latestPricesAlice.length, 4);

        (Prediction[] memory predictionsByFeedETH, int256 latestPriceETH) = predictionMarket.getPredictionsByFeed(
            address(ethUsdPriceFeed)
        );
        assertEq(predictionsByFeedETH.length, 14);

        (Prediction[] memory predictionsByFeedBTC, int256 latestPriceBTC) = predictionMarket.getPredictionsByFeed(
            address(btcUsdPriceFeed)
        );
        assertEq(predictionsByFeedBTC.length, 6);
    }

    function testCanGetMarketByFeed() public {
        predictionMarket.createMarket{value: 1 ether}(ethMarket);
        predictionMarket.createMarket{value: 2 ether}(btcMarket);
        (Prediction[] memory predictionsByFeedETH, int256 latestPriceETH) = predictionMarket.getPredictionsByFeed(
            address(ethUsdPriceFeed)
        );
        assertEq(predictionsByFeedETH.length, 2);
        assertEq(predictionsByFeedETH[0].market.priceFeed, address(ethUsdPriceFeed));
        assertEq(predictionsByFeedETH[1].market.priceFeed, address(ethUsdPriceFeed));

        (Prediction[] memory predictionsByFeedBTC, int256 latestPriceBTC) = predictionMarket.getPredictionsByFeed(
            address(btcUsdPriceFeed)
        );
        assertEq(predictionsByFeedBTC.length, 2);

        assertEq(predictionsByFeedBTC[0].market.priceFeed, address(btcUsdPriceFeed));
        assertEq(predictionsByFeedBTC[1].market.priceFeed, address(btcUsdPriceFeed));
    }

    function testCanGetMarketsByAccount() public {
        cheats.startPrank(bob);
        predictionMarket.createMarket{value: 1 ether}(ethMarket);
        predictionMarket.createMarket{value: 2 ether}(btcMarket);
        cheats.stopPrank();
        cheats.startPrank(alice);
        predictionMarket.createMarket{value: 2 ether}(btcMarket);
        (Prediction[] memory predictionsByAccountBob, int256[] memory latestPricesBob) = predictionMarket
            .getPredictionsByAccount(bob);
        (Prediction[] memory predictionsByAccountAlice, int256[] memory latestPricesAlice) = predictionMarket
            .getPredictionsByAccount(alice);

        assertEq(predictionsByAccountBob.length, 4);
        assertEq(latestPricesBob.length, 4);
        assertEq(predictionsByAccountAlice.length, 2);
        assertEq(latestPricesAlice.length, 2);

        assertEq(predictionsByAccountBob[0].market.priceFeed, address(ethUsdPriceFeed));
        assertEq(predictionsByAccountBob[1].market.priceFeed, address(ethUsdPriceFeed));
        assertEq(predictionsByAccountBob[2].market.priceFeed, address(btcUsdPriceFeed));
        assertEq(predictionsByAccountBob[3].market.priceFeed, address(btcUsdPriceFeed));
        assertEq(predictionsByAccountAlice[0].market.priceFeed, address(btcUsdPriceFeed));
        assertEq(predictionsByAccountAlice[1].market.priceFeed, address(btcUsdPriceFeed));
    }

    receive() external payable {}
}

contract Receiver is ERC721Holder {
    receive() external payable {}
}
