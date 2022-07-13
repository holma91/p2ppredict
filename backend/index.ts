import express, { Express, Request, Response } from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import PredictionMarket from './PredictionMarket.json';
import Exchange from './Exchange.json';

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
  strikePrice: string;
  expiry: string;
  marketId: string;
};

type Market = {
  priceFeed: string;
  strikePrice: string;
  expiry: string;
  collateral: { [key: string]: string };
};

type MarketWithMakesType = {
  market: Market;
  makerAsks: { [key: string]: MakerAsk };
};

let markets: { [key: string]: Market } = {
  '0xabc:20000:12423453245': {
    priceFeed: '0xabc',
    strikePrice: '20000',
    expiry: '12423453245',
    collateral: {
      '0': '30',
      '1': '45',
      '2': '40',
    },
  },
};

let makerAsks: { [key: string]: { [key: string]: MakerAsk } } = {
  '0xabc:20000:12423453245': {
    '0': {
      signer: '0x1337',
      tokenId: '0',
      price: '40',
      priceFeed: '0xabc',
      tresholdPrice: '19900',
      strikePrice: '20000',
      expiry: '12423453245',
      marketId: '0',
    },
    '1': {
      signer: '0x1338',
      tokenId: '1',
      price: '45',
      priceFeed: '0xabc',
      tresholdPrice: '20100',
      strikePrice: '20000',
      expiry: '12423453245',
      marketId: '0',
    },
  },
};

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

predictionMarket.on('MarketCreated', marketCreatedHandler);

exchange.on('MakerAsk', makerAskHandler);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.get('/markets', (req: Request, res: Response) => {
  res.json(markets);
});

app.get('/markets-with-makes', (req: Request, res: Response) => {
  const MarketsWithMakes: { [key: string]: MarketWithMakesType } = {};
  for (const key of Object.keys(markets)) {
    // we have every key now
    MarketsWithMakes[key] = {
      market: markets[key],
      makerAsks: makerAsks[key],
    };
  }
  res.json(MarketsWithMakes);
});

app.get('/makes', (req: Request, res: Response) => {
  res.json(makerAsks);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
