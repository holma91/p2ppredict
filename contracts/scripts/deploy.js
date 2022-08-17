const ethers = require("ethers");
const PredictionMarket = require("../out/PredictionMarket.sol/PredictionMarket.json");
const Exchange = require("../out/Exchange.sol/Exchange.json");
require("dotenv").config("");

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.mumbai);
  const wallet = new ethers.Wallet(process.env.pk1, provider);
  const pmFactory = new ethers.ContractFactory(
    PredictionMarket.abi,
    PredictionMarket.bytecode,
    wallet
  );

  let predictionMarket = await pmFactory.deploy();
  await predictionMarket.deployed();
  console.log("predictionMarket deployed at:", predictionMarket.address);

  const eFactory = new ethers.ContractFactory(
    Exchange.abi,
    Exchange.bytecode,
    wallet
  );

  const exchange = await eFactory.deploy();
  await exchange.deployed();
  console.log("exchange deployed at:", exchange.address);

  let setExchangeTx = await predictionMarket.setExchangeAddress(
    exchange.address
  );
  await setExchangeTx.wait();
  console.log("exchange address set");

  let setPredictionMarketTx = await exchange.setPredictionMarketAddress(
    predictionMarket.address
  );
  await setPredictionMarketTx.wait();
  console.log("prediction market address set");

  // SET APPROVALS

  let approvalTx = await predictionMarket.setApprovalForAll(
    exchange.address,
    true
  );
  await approvalTx.wait();
  console.log("acc1 approval set");

  predictionMarket = predictionMarket.connect(process.env.pk2);

  approvalTx = await predictionMarket.setApprovalForAll(exchange.address, true);
  await approvalTx.wait();
  console.log("acc2 approval set");

  predictionMarket = predictionMarket.connect(process.env.pk2);
  approvalTx = await predictionMarket.setApprovalForAll(exchange.address, true);
  await approvalTx.wait();
  console.log("acc3 approval set");
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
