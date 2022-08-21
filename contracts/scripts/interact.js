const ethers = require("ethers");
const PredictionMarket = require("../out/PredictionMarket.sol/PredictionMarket.json");
const { predictionMarketAddresses } = require("./addresses");
const { assetToFeed } = require("./helper");
require("dotenv").config();

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.rinkeby);
  const wallet = new ethers.Wallet(process.env.pk1, provider);
  const factory = new ethers.ContractFactory(
    PredictionMarket.abi,
    PredictionMarket.bytecode,
    wallet
  );

  const predictionMarket = factory.attach(predictionMarketAddresses.rinkeby);

  const currentPredictionId = await predictionMarket.currentPredictionId();
  console.log("id:", currentPredictionId.toString());
  const [predictions, latestAnswer] =
    await predictionMarket.getPredictionsByFeed(
      "0xECe365B379E1dD183B20fc5f022230C044d51404"
    );
  console.log(predictions);
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
