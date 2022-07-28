import { useQuery } from 'react-query';
import {
  priceFeedToSymbol,
  symbolToCoingeckoId,
  symbolToPriceFeed,
} from '../utils/misc';
import { nile, mainnet } from '../../contracts/scripts/addresses';
import PredictionMarket from '../../contracts/out/PredictionMarket.sol/PredictionMarket.json';
import Exchange from '../../contracts/out/Exchange.sol/Exchange.json';
import { Position } from '../types';
import { formatDate } from '../utils/helpers';

const getStatus = (strikePrice: any, currentPrice: any, over: boolean) => {
  if (over) {
    if (currentPrice.lt(strikePrice)) {
      return 'LOSING';
    } else {
      return 'WINNING';
    }
  } else {
    if (strikePrice.lt(currentPrice)) {
      return 'LOSING';
    } else {
      return 'WINNING';
    }
  }
};

const fetcher = async (tronWeb: any) => {
  let predictionMarket = await tronWeb.contract(
    PredictionMarket.abi,
    mainnet.predictionMarket
  );
  let exchange = await tronWeb.contract(Exchange.abi, mainnet.exchange);

  const account = tronWeb.defaultAddress.base58;

  const [predictions, latestAnswers] = await predictionMarket
    .getPredictionsByAccount(account)
    .call();

  const makerAsks = await exchange.getMakerAsksByAccount(account).call();

  const listPriceById: { [key: string]: any } = {};
  for (const ask of makerAsks) {
    listPriceById[ask[0].toString()] = ask[1];
  }

  const unlistedPositions: Position[] = [];
  const listedPositions: Position[] = [];

  for (let i = 0; i < predictions.length; i++) {
    let marketInfo = predictions[i][0];
    let market =
      priceFeedToSymbol.mainnet[tronWeb.address.fromHex(marketInfo.priceFeed)];

    let position: Position = {
      timestamp: parseInt(marketInfo.expiry),
      asset: market,
      side: predictions[i].over ? 'OVER' : 'UNDER',
      strikePrice: tronWeb.fromSun(marketInfo.strikePrice),
      expiry: formatDate(marketInfo.expiry.toString()),
      tokenId: predictions[i].id.toString(),
      size: tronWeb.fromSun(marketInfo.collateral),
      status: getStatus(
        marketInfo.strikePrice,
        latestAnswers[i],
        predictions[i].over
      ),
      latestAnswer: tronWeb.fromSun(latestAnswers[i].toString()),
    };
    if (position.tokenId in listPriceById) {
      position.listPrice = tronWeb.fromSun(
        listPriceById[position.tokenId].toString()
      );
      listedPositions.push(position);
      listedPositions.sort(function (a: Position, b: Position) {
        return a.timestamp - b.timestamp;
      });
    } else {
      unlistedPositions.push(position);
      unlistedPositions.sort(function (a: Position, b: Position) {
        return a.timestamp - b.timestamp;
      });
    }
  }

  return { listedPositions, unlistedPositions };
};

export const useFetchPositions = (tronWeb: any) => {
  const { isLoading, isError, data } = useQuery(
    ['positions'],
    () => fetcher(tronWeb),
    {
      enabled: !!tronWeb,
    }
  );

  return {
    positions: data,
    isLoading,
    isError,
  };
};
