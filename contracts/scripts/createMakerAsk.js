const { ethers } = require("ethers");
const Exchange = require("../out/Exchange.sol/Exchange.json");
const PredictionMarket = require("../out/PredictionMarket.sol/PredictionMarket.json");
const { mumbai } = require("./addresses");
require("dotenv").config();

const assetToFeed = {
  nile: {
    trx: "TAL6RWymPLepKsLGCzWPUTKQQcWFsuHfNE",
    btc: "TYY5GdNvHN8NVY6MYtgEPwx15pyUmLEw5J",
    jst: "TYr8nvS9BUbi9eLXNQpUMbxdvwYpoWn3ho",
  },
  mumbai: {
    btc: "0x007A22900a3B98143368Bd5906f8E17e9867581b",
    eth: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
    matic: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
  },
};

const acc1 = "0xdcb9048D6bb9C31e60af7595ef597ADC642B9cB6";

const main = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.mumbai);
  const wallet = new ethers.Wallet(process.env.pk1, provider);
  const factory = new ethers.ContractFactory(
    Exchange.abi,
    Exchange.bytecode,
    wallet
  );

  const exchange = factory.attach(mumbai.exchange);

  const makerAsk = {
    signer: acc1,
    collection: mumbai.predictionMarket,
    price: ethers.utils.parseEther("0.01"),
    tokenId: 1,
    startTime: 0,
    endTime: new Date().getTime() + 100000000,
    priceFeed: assetToFeed.mumbai.btc,
    tresholdPrice: ethers.utils.parseUnits("28000", 8),
  };

  let result = await exchange.createMakerAsk(Object.values(makerAsk)).send({
    feeLimit: 1000_000_000,
    callValue: 0,
    shouldPollResponse: false,
  });
  console.log(result);
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
