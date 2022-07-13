import express, { Express, Request, Response } from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import PredictionMarket from '../contracts/out/PredictionMarket.sol/PredictionMarket.json';
import Exchange from '../contracts/out/Exchange.sol/Exchange.json';

const rinkeby = {
  predictionMarket: '0x797Ea9655Cc55cA8bB24E2e29eb01d38DfCfaA40',
  exchange: '0xB004Dae8b3589A389C3862482612356B32A1764a',
};

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

type MakerAsk = {
  signer: string;
  tokenId: string;
  price: string;
  priceFeed: string;
  tresholdPrice: string;
};

type Market = {
  priceFeed: string;
  strikePrice: string;
  expiry: string;
  collateral: { [key: string]: string };
  over: MakerAsk[];
  under: MakerAsk[];
};

let markets: { [key: string]: Market } = {};

const provider = new ethers.providers.JsonRpcProvider(process.env.rinkeby);
const wallet = new ethers.Wallet(process.env.pk, provider);

const predictionMarket = new ethers.Contract(
  rinkeby.predictionMarket,
  PredictionMarket.abi,
  wallet
);

const exchange = new ethers.Contract(rinkeby.exchange, Exchange.abi, wallet);

const marketCreatedHandler = async (
  priceFeed: string,
  strikePrice: string,
  expiry: string,
  collateral: string,
  marketId: string,
  overPredictionId: string,
  underPredictionId: string
) => {
  let key = `${priceFeed}:${strikePrice}:${expiry}`;
  if (markets[key]) {
    markets[key].collateral[marketId] = collateral;
  } else {
    markets[key] = {
      priceFeed,
      strikePrice,
      expiry,
      collateral: {
        marketId: collateral,
      },
      over: [],
      under: [],
    };
  }
};

const makerAskHandler = async (
  signer: string,
  tokenId: string,
  price: string,
  startTime: string,
  endTime: string,
  priceFeed: string,
  tresholdPrice: string
) => {};

predictionMarket.on('MarketCreated', marketCreatedHandler);

exchange.on('MakerAsk', makerAskHandler);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
