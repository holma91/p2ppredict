const ethers = require("ethers");
const axios = require("axios").default;
const PredictionMarket = require("../out/PredictionMarket.sol/PredictionMarket.json");
const Exchange = require("../out/Exchange.sol/Exchange.json");
require("dotenv").config("");

const main = async () => {
  // get max fees from gas station
  let maxFeePerGas = ethers.BigNumber.from(40000000000); // fallback to 40 gwei
  let maxPriorityFeePerGas = ethers.BigNumber.from(40000000000); // fallback to 40 gwei
  const isProd = false;
  try {
    const { data } = await axios({
      method: "get",
      url: isProd
        ? "https://gasstation-mainnet.matic.network/v2"
        : "https://gasstation-mumbai.matic.today/v2",
    });
    maxFeePerGas = ethers.utils.parseUnits(
      Math.ceil(data.fast.maxFee) + "",
      "gwei"
    );
    maxPriorityFeePerGas = ethers.utils.parseUnits(
      Math.ceil(data.fast.maxPriorityFee) + "",
      "gwei"
    );
  } catch (e) {
    console.log(e);
  }

  const provider = new ethers.providers.JsonRpcProvider(process.env.mumbai);
  const wallet = new ethers.Wallet(process.env.pkhack, provider);
  const pmFactory = new ethers.ContractFactory(
    PredictionMarket.abi,
    PredictionMarket.bytecode,
    wallet
  );

  let predictionMarket = await pmFactory.deploy({
    maxFeePerGas,
    maxPriorityFeePerGas,
  });
  await predictionMarket.deployed();
  console.log("predictionMarket deployed at:", predictionMarket.address);

  const eFactory = new ethers.ContractFactory(
    Exchange.abi,
    Exchange.bytecode,
    wallet
  );

  const exchange = await eFactory.deploy({
    maxFeePerGas,
    maxPriorityFeePerGas,
  });
  await exchange.deployed();
  console.log("exchange deployed at:", exchange.address);

  let setExchangeTx = await predictionMarket.setExchangeAddress(
    exchange.address,
    { maxFeePerGas, maxPriorityFeePerGas }
  );
  await setExchangeTx.wait();
  console.log("exchange address set");

  let setPredictionMarketTx = await exchange.setPredictionMarketAddress(
    predictionMarket.address,
    { maxFeePerGas, maxPriorityFeePerGas }
  );
  await setPredictionMarketTx.wait();
  console.log("prediction market address set");

  // SET APPROVALS

  let approvalTx = await predictionMarket.setApprovalForAll(
    exchange.address,
    true,
    { maxFeePerGas, maxPriorityFeePerGas }
  );
  await approvalTx.wait();
  console.log("acc1 approval set");

  // cut off here
  return;
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
