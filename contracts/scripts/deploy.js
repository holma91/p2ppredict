const ethers = require("ethers");
const PredictionMarket = require("../out/PredictionMarket.sol/PredictionMarket.json");
require("dotenv").config();

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.rinkeby);
  const wallet = new ethers.Wallet(process.env.pk1, provider);
  const factory = new ethers.ContractFactory(
    PredictionMarket.abi,
    PredictionMarket.bytecode,
    wallet
  );

  const predictionMarket = await factory.deploy();
  await predictionMarket.deployed();
  console.log("predictionMarket deployed at:", predictionMarket.address);
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
