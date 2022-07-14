import express, { Express, Request, Response } from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import * as fs from 'fs';
import PredictionMarket from './PredictionMarket.json';
import Exchange from './Exchange.json';
import {
  MakerAsk,
  MakerAskWithCollateral,
  Market,
  MarketWithAsksType,
} from './types';
dotenv.config();

const rinkeby = {
  predictionMarket: '0x797Ea9655Cc55cA8bB24E2e29eb01d38DfCfaA40',
  exchange: '0xB004Dae8b3589A389C3862482612356B32A1764a',
};

const app: Express = express();
const port = process.env.PORT;

let markets: { [key: string]: Market } = {};
fs.readFile('./rinkeby/markets.json', 'utf8', (_, storedMarkets) => {
  try {
    markets = JSON.parse(storedMarkets);
  } catch (e) {
    console.log(e);
    markets = {};
    console.log('markets:', markets);
  }
});

let makerAsks: { [key: string]: { [key: string]: MakerAsk } } = {};
fs.readFile('./rinkeby/makerAsks.json', 'utf8', (_, storedMakerAsks) => {
  try {
    makerAsks = JSON.parse(storedMakerAsks);
  } catch (e) {
    console.log(e);
    makerAsks = {};
    console.log('makerAsks:', makerAsks);
  }
});

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
  tresholdPrice: string,
  strikePrice: string,
  expiry: string
) => {
  let key = `${priceFeed}:${strikePrice}:${expiry}`;
};

// 000000000000000000
// 00000000
// EVENT LISTENERS
predictionMarket.on('MarketCreated', marketCreatedHandler);
exchange.on('MakerAsk', makerAskHandler);

// ROUTES
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/markets', (req: Request, res: Response) => {
  res.json(markets);
});

app.get('/marketswithasks', (req: Request, res: Response) => {
  const MarketsWithAsks: { [key: string]: MarketWithAsksType } = {};
  for (const key of Object.keys(markets)) {
    const marketWithoutCollateral = {
      priceFeed: markets[key].priceFeed,
      strikePrice: markets[key].strikePrice,
      expiry: markets[key].expiry,
    };
    const makerAsksWithCollateral: { [key: string]: MakerAskWithCollateral } =
      {};
    if (makerAsks[key]) {
      for (const key2 of Object.keys(makerAsks[key])) {
        const collateral =
          markets[key].collateral[makerAsks[key][key2].marketId];
        makerAsksWithCollateral[key2] = {
          ...makerAsks[key][key2],
          collateral,
        };
      }
    }

    MarketsWithAsks[key] = {
      market: marketWithoutCollateral,
      makerAsks: makerAsksWithCollateral,
    };
  }
  res.json(MarketsWithAsks);
});

app.get('/asks', (req: Request, res: Response) => {
  res.json(makerAsks);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
