const ethers = require("ethers");
const PredictionMarket = require("../out/PredictionMarket.sol/PredictionMarket.json");
const { rinkeby } = require("./addresses");
require("dotenv").config();

const amounts = ["0.1", "0.02", "1", "0.25", "0.01"];

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.rinkeby);
  const wallet = new ethers.Wallet(process.env.pk1, provider);
  const factory = new ethers.ContractFactory(
    PredictionMarket.abi,
    PredictionMarket.bytecode,
    wallet
  );

  const predictionMarket = factory.attach(rinkeby.predictionMarket);

  for (let i = 0; i < 30; i++) {
    let market = {
      priceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
      strikePrice: 10000,
      expiry: 123123432423,
      collateral: ethers.utils.parseUnits(
        amounts[Math.floor(Math.random() * amounts.length)]
      ),
    };

    let tx = await predictionMarket.createMarket(
      market.priceFeed,
      market.strikePrice,
      market.expiry,
      market.collateral,
      {
        value: market.collateral,
      }
    );

    await tx.wait();
    console.log(tx.hash);
  }
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
