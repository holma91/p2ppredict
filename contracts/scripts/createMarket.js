const ethers = require("ethers");
const PredictionMarket = require("../out/PredictionMarket.sol/PredictionMarket.json");
const { rinkeby } = require("./addresses");
require("dotenv").config();

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.rinkeby);
  const wallet = new ethers.Wallet(process.env.pk1, provider);
  const factory = new ethers.ContractFactory(
    PredictionMarket.abi,
    PredictionMarket.bytecode,
    wallet
  );

  const predictionMarket = factory.attach(rinkeby.predictionMarket);

  const market = {
    priceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    strikePrice: ethers.BigNumber.from("10000"),
    expiry: ethers.BigNumber.from("123123432423"),
    collateral: ethers.utils.parseUnits("0.01", 18),
  };

  let tx = await predictionMarket.createMarketWithPosition(
    market,
    true,
    ethers.BigNumber.from("23123123"),
    ethers.BigNumber.from("32132132323"),
    ethers.BigNumber.from("9500"),
    {
      value: market.collateral,
    }
  );

  await tx.wait();
  console.log(tx.hash);
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
