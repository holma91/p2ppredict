const ethers = require("ethers");
const PredictionMarket = require("../out/PredictionMarket.sol/PredictionMarket.json");
const { rinkeby, mumbai } = require("./addresses");
const { assetToFeed } = require("./helper");
require("dotenv").config();

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.mumbai);
  const wallet = new ethers.Wallet(process.env.pk1, provider);
  const factory = new ethers.ContractFactory(
    PredictionMarket.abi,
    PredictionMarket.bytecode,
    wallet
  );

  const predictionMarket = factory.attach(mumbai.predictionMarket);

  const market = {
    priceFeed: assetToFeed.mumbai.btc,
    strikePrice: ethers.utils.parseUnits("30000", 8),
    expiry: ethers.BigNumber.from("123123432423"),
    collateral: ethers.utils.parseEther("0.05"),
  };

  let tx = await predictionMarket.createMarketWithPosition(
    market,
    true,
    ethers.utils.parseEther("0.01"), // listprice
    ethers.BigNumber.from("32132132323"), // endtime
    ethers.utils.parseUnits("20000", 8), // tresholdPrice
    {
      value: market.collateral,
    }
  );
  console.log(tx.hash);

  await tx.wait();
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
