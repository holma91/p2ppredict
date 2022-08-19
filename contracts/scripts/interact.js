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

  let tx = await predictionMarket.setApprovalForAll(mumbai.exchange, false);
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
